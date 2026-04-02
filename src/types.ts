import type { z } from "zod";

/**
 * Row shape for LangGraph-style `checkpoints` table (PostgreSQL JSONB columns as parsed values).
 */
export interface CheckpointRow {
  thread_id: string;
  checkpoint_ns: string;
  checkpoint_id: string;
  parent_checkpoint_id: string | null;
  checkpoint: unknown;
  metadata: unknown;
}

export interface MigrationContext {
  row: CheckpointRow;
}

/**
 * Result of transforming a single row’s JSONB payload. Both columns are written back.
 */
export interface MigratedCheckpointPayload {
  checkpoint: unknown;
  metadata: unknown;
}

/**
 * A migration module: async `up()` plus a Zod schema that every migrated row must satisfy.
 */
export interface CheckpointMigration {
  id: string;
  schema: z.ZodType<MigratedCheckpointPayload>;
  up: (
    ctx: MigrationContext
  ) => MigratedCheckpointPayload | Promise<MigratedCheckpointPayload>;
}
