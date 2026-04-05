import "dotenv/config";
import { createPool } from "./db.js";
import { runCheckpointMigration } from "./runner.js";
import migration from "../migrations/001_rename_field.js";

async function main(): Promise<void> {
  console.log("[AgentMigrate] Phase 1 — checkpoint migration run");
  const pool = createPool();
  const client = await pool.connect();

  try {
    const result = await runCheckpointMigration(client, migration);
    console.log(
      `[AgentMigrate] Done. Migrated ${String(result.migratedCount)} checkpoint row(s).`
    );
  } finally {
    client.release();
    await pool.end();
  }
}

try {
  await main();
} catch (err: unknown) {
  const message = err instanceof Error ? err.message : String(err);
  console.error("[AgentMigrate] Fatal:", message);
  process.exitCode = 1;
}
