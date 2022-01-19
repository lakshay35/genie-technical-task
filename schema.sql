CREATE TABLE IF NOT EXISTS cheapest_nfts (
  id SERIAL PRIMARY KEY,
  contract_address TEXT UNIQUE NOT NULL,
  data TEXT
);