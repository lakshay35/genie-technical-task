import { AxiosError, AxiosResponse } from 'axios';
import { IRaribleError } from '../models/IRaribleError';
import { IRaribleSellOrders } from '../models/IRaribleSellOrders';
import {
  getOrdersForSaleByCollectionAndOrderStatus
} from '../apis/rarible';
import { IRaribleOrder } from '../models/IRaribleOrder';
import { getClient, releaseClient } from '../utils/db';
import Heap from 'heap';
import { SortType } from '../models/SortType';

// Holds 25 cheapest NFTs in memory while an analysis request is processing
const contractMap: Map<string, Heap<IRaribleOrder>> = new Map<string, Heap<IRaribleOrder>>();

/**
 * @description initiates cheapest NFT search for a list of collection addresses
 * @param collectionAddresses
 */
export const searchCollectionsForCheapestNFTs = async (collectionAddresses: Array<string>) => {
  for(let i = 0; i < collectionAddresses.length; i++) {
    const address = collectionAddresses[i];

    // Ensure duplicate analysis requests aren't made
    if(contractMap.has(address))
      continue;

    contractMap.set(address, new Heap<IRaribleOrder>((a: IRaribleOrder, b: IRaribleOrder) => b.take.valueDecimal - a.take.valueDecimal));
    findAllOrders(address)
    .then(async () => {
      await persistCheapestNFTsToDb(address);
      console.log("Done analyzing ", address);
      contractMap.delete(address);
    })
    .catch((err: IRaribleError) => {
      console.log('An error occurred while retrieving orders for NFTs from ', address, '\n', err);
    });
  }
}

/**
 * @description Finds all orders from rarible for a given collection iteratively
 * @param address
 * @param continuation
 */
const findAllOrders = async (address: string): Promise<void|IRaribleError> => {
  let continuationToken: string | undefined = 'starting_token';

  while(continuationToken) {
    await getNFTsFromRarible(address, continuationToken === 'starting_token' ? '' : continuationToken)
    .then(async (res: IRaribleSellOrders) => {
      updateInMemContractMap(address, res.orders);

      // set to iterate again if more orders are available
      continuationToken = res.continuation;
    })
    .catch((err: IRaribleError) => {
      console.log(err);
      return err;
    })
  }
}

/**
 * @description Updates in memory heap to keep tracking of the 25 cheapest NFTs for a given collection
 * @param address
 * @param orders
 */
const updateInMemContractMap = async (address: string, orders: Array<IRaribleOrder>) => {
  const collectionHeap: Heap<IRaribleOrder> = contractMap.get(address);

  let size = collectionHeap.size();

  for(const order of orders) {
    if(order.status.toLowerCase() !== "active")
      continue;

    if(size === 25) {
      collectionHeap.pushpop(order);
    } else {
      collectionHeap.push(order);
      size++;
    }
  }
}

/**
 * @description Retrieves NFT Orders from the Rarible API on ETH
 * @param address
 * @param continuation
 * @returns
 */
const getNFTsFromRarible = async (address: string, continuation?: string): Promise<IRaribleSellOrders | IRaribleError> => {
  return await getOrdersForSaleByCollectionAndOrderStatus(address, continuation)
  .then((res: AxiosResponse<IRaribleSellOrders>) => {
    return res.data;
  })
  .catch((err: AxiosError<IRaribleError>) => {
    return err.response?.data;
  });
}

/**
 * @description Persists top 25 cheapest NFTs for a given collection in the database.
 * Utilized Postgres here because of familiarity as I wanted to submit this the night of 01/18
 * I would use a document database instead if I was building this for prod.
 * @param address
 */
const persistCheapestNFTsToDb = async (address: string) => {
  const dbClient = await getClient();

  try {
    const query = 'INSERT INTO cheapest_nfts (contract_address, data) VALUES ($1, $2) ON CONFLICT (contract_address) DO UPDATE SET data = $2';
    const contract = contractMap.get(address);

    await dbClient.query(query, [
      address,
      JSON.stringify(contractMap.get(address).toArray())
    ]);
    console.log()
  } catch (err) {
    console.log(err);
  } finally {
    releaseClient(dbClient);
  }
}

/**
 * @description Retrieves the list of the cheapest NFTs for a given collection stored in the db
 * @param address
 * @param sortBy
 * @returns
 */
export const getCheapestNFTs = async (address: string, sortBy: SortType): Promise<Array<IRaribleOrder> | Error> => {
  const dbClient = await getClient();

  try {
    const query = 'SELECT * FROM cheapest_nfts WHERE contract_address = $1';

    const { rows } = await dbClient.query(query, [address]);

    if(!rows.length)
      throw new Error(`NFT Collection with address '${address}' has not been analyzed yet`);


    let cheapestNFTs = JSON.parse(rows[0].data) as Array<IRaribleOrder>;

    if(sortBy === 'metadata') {
      cheapestNFTs.sort((a: IRaribleOrder, b: IRaribleOrder) => Date.parse(a.lastUpdateAt) - Date.parse(b.lastUpdateAt))
    } else if(sortBy === 'price') {
      cheapestNFTs.sort((a: IRaribleOrder, b: IRaribleOrder) => a.take.valueDecimal - b.take.valueDecimal);
    }

    return cheapestNFTs;
  } catch (err) {
    console.log(err);
    throw err;
  } finally {
    releaseClient(dbClient);
  }
}