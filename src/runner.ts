import type { PoolClient } from "pg";
import type { CheckpointRow } from "./reader.js";
import { updateCheckpointBlob } from "./writer.js";

export type MigrationResult = {
  threadId: string;
  checkpointNs: string;
  checkpointId: string;
  success: boolean;
  error: string | null;
};

export type MigrationRunOptions = {
  /**
   * Log progress every N checkpoints. Default 100.
   * Set to 0 to skip progress lines (final summary and errors still log).
   */
  logProgressEvery?: number;
};

function getChannelValues(
  checkpoint: Record<string, unknown>
): Record<string, unknown> {
  const raw = checkpoint.channel_values;
  if (raw !== null && typeof raw === "object" && !Array.isArray(raw)) {
    return { ...(raw as Record<string, unknown>) };
  }
  return {};
}

export async function runMigration(
  client: PoolClient,
  checkpoints: CheckpointRow[],
  migrationFn: (state: Record<string, unknown>) => Record<string, unknown>,
  options?: MigrationRunOptions
): Promise<MigrationResult[]> {
  const logEvery = options?.logProgressEvery ?? 100;
  const results: MigrationResult[] = [];
  const total = checkpoints.length;
  let succeeded = 0;
  let failed = 0;

  for (let i = 0; i < total; i++) {
    const row = checkpoints[i];
    const idx = i + 1;

    if (logEvery > 0 && (idx % logEvery === 0 || idx === total)) {
      console.log(`Progress: ${String(idx)} / ${String(total)} checkpoints`);
    }

    const originalState = getChannelValues(row.checkpoint);

    try {
      const migratedState = migrationFn({ ...originalState });
      const nextCheckpoint: Record<string, unknown> = {
        ...row.checkpoint,
        channel_values: migratedState,
      };
      await updateCheckpointBlob(client, row, nextCheckpoint);
      succeeded++;
      results.push({
        threadId: row.thread_id,
        checkpointNs: row.checkpoint_ns,
        checkpointId: row.checkpoint_id,
        success: true,
        error: null,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      failed++;
      results.push({
        threadId: row.thread_id,
        checkpointNs: row.checkpoint_ns,
        checkpointId: row.checkpoint_id,
        success: false,
        error: message,
      });
    }
  }

  console.log(`${String(succeeded)} succeeded, ${String(failed)} failed`);

  return results;
}
