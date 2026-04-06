import type { CheckpointRow } from "./reader.js";

export type MigrationResult = {
  threadId: string;
  checkpointId: string;
  success: boolean;
  originalState: Record<string, unknown>;
  migratedState: Record<string, unknown> | null;
  error: string | null;
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

export function runMigration(
  checkpoints: CheckpointRow[],
  migrationFn: (state: Record<string, unknown>) => Record<string, unknown>
): MigrationResult[] {
  const results: MigrationResult[] = [];
  const total = checkpoints.length;

  for (let i = 0; i < total; i++) {
    const row = checkpoints[i];
    console.log(
      `Migrating checkpoint ${String(i + 1)} of ${String(total)}: ${row.checkpoint_id}`
    );

    const originalState = getChannelValues(row.checkpoint);

    try {
      const migratedState = migrationFn({ ...originalState });
      results.push({
        threadId: row.thread_id,
        checkpointId: row.checkpoint_id,
        success: true,
        originalState,
        migratedState,
        error: null,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      results.push({
        threadId: row.thread_id,
        checkpointId: row.checkpoint_id,
        success: false,
        originalState,
        migratedState: null,
        error: message,
      });
    }
  }

  const succeeded = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;
  console.log(
    `Migration finished: ${String(succeeded)} succeeded, ${String(failed)} failed`
  );

  return results;
}
