import type { PoolClient } from "pg";

export interface CheckpointRow {
  thread_id: string;
  checkpoint_ns: string;
  checkpoint_id: string;
  parent_checkpoint_id: string | null;
  checkpoint: Record<string, unknown>;
  metadata: Record<string, unknown>;
}

/** Optional batching when reading many large JSONB rows (avoids loading the whole table at once). */
export interface CheckpointListOptions {
  /** When set, adds SQL LIMIT (and OFFSET). Omit to load all rows (OK for small DBs). */
  limit?: number;
  /** Used with limit; defaults to 0. */
  offset?: number;
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
      row.parent_checkpoint_id == null ? null : String(row.parent_checkpoint_id),
    checkpoint: asRecord(row.checkpoint),
    metadata: asRecord(row.metadata),
  };
}

const SELECT_COLUMNS = `
  SELECT
    thread_id,
    checkpoint_ns,
    checkpoint_id,
    parent_checkpoint_id,
    checkpoint,
    metadata
  FROM checkpoints
`;

/**
 * Returns checkpoint rows. For large databases, pass { limit, offset } and page through results.
 */
export async function getAllCheckpoints(
  client: PoolClient,
  options?: CheckpointListOptions
): Promise<CheckpointRow[]> {
  const limit = options?.limit;
  const offset = options?.offset ?? 0;

  let text = `${SELECT_COLUMNS}\n  ORDER BY checkpoint_id ASC`;
  const params: unknown[] = [];

  if (limit !== undefined) {
    text += `\n  LIMIT $1 OFFSET $2`;
    params.push(limit, offset);
  }

  const result = await client.query(text, params);
  return result.rows.map((row) => mapRow(row as Record<string, unknown>));
}

/**
 * Checkpoints for one thread. Use `options` to limit page size when a thread has many rows.
 */
export async function getCheckpointsByThread(
  client: PoolClient,
  threadId: string,
  options?: CheckpointListOptions
): Promise<CheckpointRow[]> {
  const limit = options?.limit;
  const offset = options?.offset ?? 0;

  let text = `${SELECT_COLUMNS}\n  WHERE thread_id = $1\n  ORDER BY checkpoint_id ASC`;
  const params: unknown[] = [threadId];

  if (limit !== undefined) {
    text += `\n  LIMIT $2 OFFSET $3`;
    params.push(limit, offset);
  }

  const result = await client.query(text, params);
  return result.rows.map((row) => mapRow(row as Record<string, unknown>));
}
