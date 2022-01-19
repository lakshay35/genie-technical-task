import axios from "axios"

const {
  GET_SELL_ORDERS_BY_COLLECTION_AND_BY_STATUS
} = process.env

/**
 * @description Calls the rarible getOrderForSale API to retrieve all NFTS currently for sale across marketplaces
 * for a given collection
 * @param address
 * @param continuation
 * @returns
 */
export const getOrdersForSaleByCollectionAndOrderStatus = (
  address: string,
  continuation?: string
): Promise<any> => {
  let url = `${GET_SELL_ORDERS_BY_COLLECTION_AND_BY_STATUS}?collection=${address}`;

  if(continuation)
    url += `&continuation=${continuation}`;

  return axios.get(url);
};