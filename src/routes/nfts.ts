import express, { Request, Response } from 'express';
import { SortType } from '../models/SortType';
import { getCheapestNFTs, searchCollectionsForCheapestNFTs } from '../logic/nfts';

const ROUTER = express.Router();

/**
 * Example body for POST /analyze
 *  [
  '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D',
  '0x61c0f01a77dbB995346e3e508575670Ec49b5615',
  '0x988a3e9834f1a4977e6f727e18ea167089349ba2',
  '0x988a3e9834f1a4977e6f727e18ea167089349ba2',
  '0xb47e3cd837dDF8e4c57F05d70Ab865de6e193BBB'
]
*/

/**
 * @description Initiates async analysis of provided NFT Collections to
 * record the 25 cheapest NFTs that are "ACTIVE"
 */
ROUTER.post("/analyze", async (req: Request, res: Response) => {
  const collections = req.body as Array<string>;
  console.log("Going to analyze\n", collections);
  res.status(201).send("Search Initiated\n");

  await searchCollectionsForCheapestNFTs(collections);
});

/**
 * @description Retrieves the 25 cheapest NFTs for a given collection address.
 * User can request to sort the returned response by passing in "metadata" or "price"
 * for the "sortBy" query parameter. metadata sorts by "lastUpdateAt" and price sorts
 * ascendingly for price
 */
ROUTER.get("/", async (req: Request, res: Response) => {
  const address: string = req.query['address'] as string;
  const sortBy: SortType = req.query['sortBy'] as SortType;

  if(!address)
    res.status(400).end('NFT Collection address required!');

  try {
    const cheapestNFTs = await getCheapestNFTs(address, sortBy);

    res.send(cheapestNFTs);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

module.exports = ROUTER;