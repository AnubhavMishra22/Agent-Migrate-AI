import type { PoolClient } from "pg";

export interface CheckpointRow {
  thread_id: string;
  checkpoint_ns: string;
  checkpoint_id: string;
  parent_checkpoint_id: string | null;
  checkpoint: Record<string, unknown>;
  metadata: Record<string, unknown>;
}

function asRecord(value: unknown): Record<string, unknown> {
  if (value !== null && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

function mapRow(row: Record<string, unknown>): CheckpointRow {
  return {
    thread_id: String(row.thread_id),
    checkpoint_ns: String(row.checkpoint_ns),
    checkpoint_id: String(row.checkpoint_id),
    parent_checkpoint_id:
      row.parent_checkpoint_id === null || row.parent_checkpoint_id === undefined
        ? null
        : String(row.parent_checkpoint_id),
    checkpoint: asRecord(row.checkpoint),
    metadata: asRecord(row.metadata),
  };
}

export async function getAllCheckpoints(
  client: PoolClient
): Promise<CheckpointRow[]> {
  const result = await client.query(
    `
    SELECT
      thread_id,
      checkpoint_ns,
      checkpoint_id,
      parent_checkpoint_id,
      checkpoint,
      metadata
    FROM checkpoints
    ORDER BY checkpoint_id ASC
    `
  );
  const rows: CheckpointRow[] = result.rows.map((row) =>
    mapRow(row as Record<string, unknown>)
  );
  console.log(`Found ${String(rows.length)} checkpoints to migrate`);
  return rows;
}

export async function getCheckpointsByThread(
  client: PoolClient,
  threadId: string
): Promise<CheckpointRow[]> {
  const result = await client.query(
    `
    SELECT
      thread_id,
      checkpoint_ns,
      checkpoint_id,
      parent_checkpoint_id,
      checkpoint,
      metadata
    FROM checkpoints
    WHERE thread_id = $1
    ORDER BY checkpoint_id ASC
    `,
    [threadId]
  );
  return result.rows.map((row) => mapRow(row as Record<string, unknown>));
}
