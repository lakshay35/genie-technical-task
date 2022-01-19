import { Pool, PoolClient } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});


/**
 * @description Gets a db client from the pool
 * @returns PoolClient
 */
export const getClient = async (): Promise<PoolClient> => {
    return await pool.connect();
};

/**
 * @description Releases db client and returns it to the pool
 * @param client
 */
export const releaseClient = (client: PoolClient) => {
  client.release();
};
