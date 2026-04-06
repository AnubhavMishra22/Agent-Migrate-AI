import dotenv from "dotenv";
import { Pool, type PoolClient } from "pg";

dotenv.config();

const connectionString = process.env.DATABASE_URL;
if (connectionString === undefined || connectionString.trim() === "") {
  throw new Error(
    "DATABASE_URL is missing or empty. Set it in your .env file (see .env.example)."
  );
}

export const pool = new Pool({ connectionString });

export async function getClient(): Promise<PoolClient> {
  return pool.connect();
}

export default pool;
