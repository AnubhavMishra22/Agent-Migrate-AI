import type pg from "pg";
import { readCheckpointsForUpdate } from "./reader.js";
import { rollbackTransaction } from "./rollback.js";
import type {
  CheckpointMigration,
  CheckpointRow,
  MigratedCheckpointPayload,
} from "./types.js";
import { validateMigratedPayload } from "./validator.js";

export interface RunMigrationResult {
  migratedCount: number;
}

/**
 * Runs a single migration inside a transaction: lock rows, migrate + validate each,
 * update all rows, commit — or roll back on any failure.
 */
export async function runCheckpointMigration(
  client: pg.PoolClient,
  migration: CheckpointMigration
): Promise<RunMigrationResult> {
  console.log(`[AgentMigrate] Starting migration: ${migration.id}`);
  await client.query("BEGIN");

  try {
    const rows: CheckpointRow[] = await readCheckpointsForUpdate(client);
    console.log(
      `[AgentMigrate] Locked ${String(rows.length)} checkpoint row(s) for update.`
    );

    const migratedRows: Array<{
      row: CheckpointRow;
      payload: MigratedCheckpointPayload;
    }> = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      console.log(
        `[AgentMigrate] Migrating ${String(i + 1)}/${String(rows.length)} ` +
          `(thread_id=${row.thread_id}, checkpoint_ns=${row.checkpoint_ns}, checkpoint_id=${row.checkpoint_id})`
      );

      const raw: unknown = await migration.up({ row });
      const payload: MigratedCheckpointPayload = validateMigratedPayload(
        raw,
        migration.schema
      );
      migratedRows.push({ row, payload });
    }

    console.log("[AgentMigrate] All rows passed validation. Writing updates...");

    for (let i = 0; i < migratedRows.length; i++) {
      const item = migratedRows[i];
      const { row, payload } = item;
      console.log(
        `[AgentMigrate] Writing ${String(i + 1)}/${String(migratedRows.length)} ` +
          `(thread_id=${row.thread_id}, checkpoint_id=${row.checkpoint_id})`
      );

      await client.query(
        `
        UPDATE checkpoints
        SET checkpoint = $1::jsonb,
            metadata = $2::jsonb
        WHERE thread_id = $3
          AND checkpoint_ns = $4
          AND checkpoint_id = $5
        `,
        [
          payload.checkpoint,
          payload.metadata,
          row.thread_id,
          row.checkpoint_ns,
          row.checkpoint_id,
        ]
      );
    }

    await client.query("COMMIT");
    console.log(
      `[AgentMigrate] Migration "${migration.id}" committed successfully.`
    );
    return { migratedCount: migratedRows.length };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[AgentMigrate] Migration failed:", message);
    await rollbackTransaction(client);
    throw error;
  }
}
