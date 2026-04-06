import type { PoolClient } from "pg";
import type { CheckpointRow } from "./reader.js";

export async function updateCheckpointBlob(
  client: PoolClient,
  row: Pick<CheckpointRow, "thread_id" | "checkpoint_ns" | "checkpoint_id">,
  checkpoint: Record<string, unknown>
): Promise<void> {
  await client.query(
    `UPDATE checkpoints
     SET checkpoint = $1::jsonb
     WHERE thread_id = $2 AND checkpoint_ns = $3 AND checkpoint_id = $4`,
    [checkpoint, row.thread_id, row.checkpoint_ns, row.checkpoint_id]
  );
}
