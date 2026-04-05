import { z } from "zod";
import type {
  CheckpointMigration,
  MigratedCheckpointPayload,
  MigrationContext,
} from "../src/types.js";

/**
 * Example migration: rename a top-level key in the checkpoint JSONB
 * (`legacyAgentLabel` → `agentLabel`). Adjust keys to match your app.
 */
const migratedSchema = z.object({
  checkpoint: z.unknown(),
  metadata: z.unknown(),
}) as z.ZodType<MigratedCheckpointPayload>;

const migration: CheckpointMigration = {
  id: "001_rename_field",
  schema: migratedSchema,
  async up({ row }: MigrationContext) {
    const checkpoint = row.checkpoint;

    if (
      checkpoint !== null &&
      typeof checkpoint === "object" &&
      !Array.isArray(checkpoint)
    ) {
      const obj: Record<string, unknown> = {
        ...(checkpoint as Record<string, unknown>),
      };
      if (
        Object.prototype.hasOwnProperty.call(obj, "legacyAgentLabel") &&
        !Object.prototype.hasOwnProperty.call(obj, "agentLabel")
      ) {
        obj.agentLabel = obj.legacyAgentLabel;
        delete obj.legacyAgentLabel;
      }
      return {
        checkpoint: obj,
        metadata: row.metadata,
      };
    }

    return {
      checkpoint,
      metadata: row.metadata,
    };
  },
};

export default migration;
