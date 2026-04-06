export type MigrationMeta = {
  version: number;
  name: string;
  description: string;
};

export const meta: MigrationMeta = {
  version: 1,
  name: "rename_user_query_to_query",
  description: "Renames the field user_query to query in agent state",
};

export function up(state: Record<string, unknown>): Record<string, unknown> {
  if (Object.prototype.hasOwnProperty.call(state, "query")) {
    return { ...state };
  }
  if (!Object.prototype.hasOwnProperty.call(state, "user_query")) {
    return { ...state };
  }
  const next: Record<string, unknown> = { ...state };
  next.query = next.user_query;
  delete next.user_query;
  return next;
}

export function down(state: Record<string, unknown>): Record<string, unknown> {
  if (Object.prototype.hasOwnProperty.call(state, "user_query")) {
    return { ...state };
  }
  if (!Object.prototype.hasOwnProperty.call(state, "query")) {
    return { ...state };
  }
  const next: Record<string, unknown> = { ...state };
  next.user_query = next.query;
  delete next.query;
  return next;
}
