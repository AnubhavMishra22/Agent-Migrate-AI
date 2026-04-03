import type { z } from "zod";
import type { MigratedCheckpointPayload } from "./types.js";

/**
 * Validates migrated JSONB payloads with the migration’s Zod schema.
 * Throws `ZodError` if validation fails.
 */
export function validateMigratedPayload(
  payload: unknown,
  schema: z.ZodType<MigratedCheckpointPayload>
): MigratedCheckpointPayload {
  return schema.parse(payload);
}
