/**
 * Before running: set DATABASE_URL in your .env file to your Supabase PostgreSQL
 * connection string, for example:
 * postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres
 */

import { getClient } from "./db.js";
import { getAllCheckpoints } from "./reader.js";
import type { PoolClient } from "pg";

async function main(): Promise<void> {
  let client: PoolClient | undefined;
  try {
    client = await getClient();
    const rows = await getAllCheckpoints(client);
    console.log(`Checkpoint count: ${String(rows.length)}`);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Error:", message);
    process.exitCode = 1;
  } finally {
    client?.release();
  }
}

void main();
