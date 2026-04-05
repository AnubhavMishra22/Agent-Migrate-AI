import type pg from "pg";

/**
 * Rolls back the current transaction. Safe to call after a failed query
 * while the client is still in a transaction block.
 */
export async function rollbackTransaction(client: pg.PoolClient): Promise<void> {
  try {
    await client.query("ROLLBACK");
    console.error("[AgentMigrate] Transaction rolled back.");
  } catch (rollbackError: unknown) {
    const message =
      rollbackError instanceof Error ? rollbackError.message : String(rollbackError);
    console.error("[AgentMigrate] Failed to roll back transaction:", message);
    throw rollbackError;
  }
}
