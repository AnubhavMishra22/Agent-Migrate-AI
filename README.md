# AgentMigrate

**Schema migrations for AI agent checkpoints — like Alembic for databases, 
but for LangGraph workflows.**

## The Problem

When you update your LangGraph AI agent — rename a parameter, add a required 
field, change a tool's schema — every workflow that was paused mid-execution 
crashes on resume.

This happens because LangGraph saves agent state as serialized JSON snapshots 
called "checkpoints" in PostgreSQL. When your agent's code changes, old 
checkpoints no longer match the new schema. There is no built-in tool to 
handle this. You either wait for all in-flight workflows to finish before 
deploying (which can take hours or days), or you lose all in-progress work.

This is an open, unsolved problem in the LangGraph ecosystem. See 
[GitHub issue #536](https://github.com/langchain-ai/langgraphjs/issues/536) 
filed September 2024 — no solution exists to this day.

## The Solution

AgentMigrate brings the database migration pattern to AI agent state.

You write a migration module (same shape as the example in the repo today):

```typescript
// migrations/001_rename_field.ts

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

/** Transform one checkpoint's `channel_values` object. */
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

/** Inverse transform (for future rollback tooling — not invoked by Phase 1 entrypoint). */
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
```

Wire your `up` function in `src/index.ts`, then run:

```bash
npm run build
npm start
```

For development (watch mode):

```bash
npm run dev
```

Phase 1 reads every checkpoint, runs `up` on each row’s **`channel_values`**, merges the result back into the checkpoint JSON, and **persists with one `UPDATE` per row**. Rows that throw are recorded in the result summary; successful rows stay written. **Zod** is in the stack for upcoming validation work; the current runner does not parse migrations with a schema yet.

## How It Works

Read checkpoints → For each row: extract `channel_values` → `up(state)` → merge → `UPDATE` checkpoint JSONB

1. **Read** — connects to PostgreSQL and loads checkpoint rows (see `src/reader.ts`).
2. **Migrate** — `runMigration` calls your `up` with a shallow clone of **`checkpoint.channel_values`** (see `src/runner.ts`).
3. **Write** — `writer.ts` runs `UPDATE checkpoints SET checkpoint = $1::jsonb` for that row.
4. **Per-row errors** — if `up` or the database throws for a row, that checkpoint is reported as failed; other rows are unaffected.

A global “all checkpoints in one transaction + Zod gate” is **planned** (see roadmap below); it is not what Phase 1 does today.

## Status

🚧 **Work in progress** — actively being built.

- [x] Phase 1: Core migration engine (read, transform `channel_values`, per-row persist, summary)
- [ ] Phase 2: CLI tool with `init`, `run`, `status` commands
- [ ] Phase 3: Demo UI to visualize migrations
- [ ] Phase 4: CI/CD integration and GitHub Actions check

## Tech Stack

- **Runtime:** Node.js 20+ with TypeScript (strict mode)
- **Database:** PostgreSQL (Supabase)
- **Validation:** Zod (dependency today; runner-level validation planned)
- **Target framework:** LangGraph (CrewAI and OpenAI Agents SDK support 
  coming in Phase 2)

## Local Setup

```bash
# Clone the repo
git clone https://github.com/AnubhavMishra22/Agent-Migrate-AI.git
cd Agent-Migrate-AI

# Install dependencies
npm install

# Add your database connection
cp .env.example .env
# Edit .env and add your Supabase DATABASE_URL

# Run the engine (build first for production entry)
npm run build
npm start
```

To test without a LangGraph agent, run this SQL in your Supabase SQL editor 
to create sample checkpoints:

```sql
CREATE TABLE IF NOT EXISTS checkpoints (
  thread_id TEXT NOT NULL,
  checkpoint_ns TEXT NOT NULL DEFAULT '',
  checkpoint_id TEXT NOT NULL,
  parent_checkpoint_id TEXT,
  checkpoint JSONB NOT NULL DEFAULT '{}',
  metadata JSONB NOT NULL DEFAULT '{}',
  PRIMARY KEY (thread_id, checkpoint_ns, checkpoint_id)
);

INSERT INTO checkpoints VALUES 
  ('thread-1', '', 'cp-001', null, 
   '{"v": 1, "channel_values": {"user_query": "hello world", "status": "pending"}}',
   '{}'),
  ('thread-1', '', 'cp-002', 'cp-001',
   '{"v": 1, "channel_values": {"user_query": "second message", "messages": []}}',
   '{}'),
  ('thread-2', '', 'cp-001', null,
   '{"v": 1, "channel_values": {"user_query": "different thread", "status": "done"}}',
   '{}');
```

## Why This Exists

This is a real gap in the AI agent infrastructure ecosystem. Teams running 
LangGraph in production today solve this problem manually — by blocking 
deployments until all workflows finish, by writing one-off scripts, or by 
simply losing in-flight work. AgentMigrate packages the solution into a 
reusable, safe, developer-friendly tool.

## Author

Built by [Anubhav Mishra](https://github.com/AnubhavMishra22) — MS Computer 
Science, UC Davis. Backend and AI engineer.

- GitHub: [github.com/AnubhavMishra22](https://github.com/AnubhavMishra22)
- LinkedIn: [linkedin.com/in/anubhav-mishra-172726181](https://linkedin.com/in/anubhav-mishra-172726181)

---

*More documentation will be added as the project is built.*

See **CONTRIBUTING.md** for commit messages, branches, and PR conventions.
