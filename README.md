## Quick Start

`brew install postgresql`
`brew services start postgresql`

Create a database called genie on postgres and run the contents of `schema.sql` on there.

Ensure node LTS is installed and run `yarn` in the root directory

Define a `.env` file with the following

```
# POSTGRES DB URL
DATABASE_URL="postgres://username:pass@localhost:5432/genie?sslmode=disable"
PORT=5000

# APIs
GET_SELL_ORDERS_BY_COLLECTION_AND_BY_STATUS="https://ethereum-api.rarible.org/v0.1/order/orders/sell/byCollectionAndByStatus"
```

Run `yarn start` to start the server in dev mode and make the following calls

POST http://localhost:5000/nfts/analyze with a list of contract addresses as strings in the body to initiate the async NFT analysis task

GET http://localhost:5000/nfts/ with an address query param and an optional sortBy query param to sort by a metadata field (configured to use "lastUpdateAt" from rarible) or to sort by price in ascending order. This method return the top 25 cheapest NFTs for a given collection