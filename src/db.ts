import pg from "pg";

const { Pool } = pg;

/**
 * Creates a connection pool using `DATABASE_URL` from the environment.
 */
export function createPool(): pg.Pool {
  const connectionString = process.env.DATABASE_URL;
  if (connectionString === undefined || connectionString.trim() === "") {
    throw new Error(
      "DATABASE_URL is missing or empty. Copy .env.example to .env and set DATABASE_URL."
    );
  }
  return new Pool({ connectionString });
}
