import type pg from "pg";
import type { CheckpointRow } from "./types.js";

/**
 * Reads all checkpoint rows inside the current transaction with `FOR UPDATE`
 * so concurrent writers are blocked until commit/rollback.
 */
export async function readCheckpointsForUpdate(
  client: pg.PoolClient
): Promise<CheckpointRow[]> {
  const result = await client.query<CheckpointRow>(
    `
    SELECT
      thread_id,
      checkpoint_ns,
      checkpoint_id,
      parent_checkpoint_id,
      checkpoint,
      metadata
    FROM checkpoints
    ORDER BY thread_id, checkpoint_ns, checkpoint_id
    FOR UPDATE
    `
  );
  return result.rows;
}
