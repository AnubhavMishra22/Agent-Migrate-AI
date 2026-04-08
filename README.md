---

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

You write a migration file:

```typescript
// migrations/001_rename_field.ts

export const meta = {
  version: 1,
  name: "rename_user_query_to_query",
  description: "Renames user_query to query in agent state"
}

export function up(state: Record<string, unknown>) {
  if ("user_query" in state) {
    return { ...state, query: state.user_query, user_query: undefined }
  }
  return state
}

export function down(state: Record<string, unknown>) {
  if ("query" in state) {
    return { ...state, user_query: state.query, query: undefined }
  }
  return state
}
```

Then you run one command:

```bash
agentmigrate run
```

AgentMigrate reads every checkpoint from your PostgreSQL database, applies 
your migration function to each one, validates the result with Zod, and 
writes everything back inside a single transaction. If any checkpoint fails 
validation, the entire operation rolls back automatically. Zero data loss. 
Zero broken workflows.

## How It Works

Read checkpoints → Apply migration → Validate with Zod → Write in transaction
↓ if any fail
Auto rollback
1. **Read** — connects to your PostgreSQL database and reads all checkpoint 
   rows from LangGraph's checkpoints table
2. **Migrate** — runs your `up()` function against the `channel_values` of 
   every checkpoint
3. **Validate** — checks every migrated state against your Zod schema before 
   touching the database
4. **Write** — updates all checkpoints inside a single PostgreSQL transaction
5. **Rollback** — if anything fails at any step, reverts all changes 
   automatically

## Status

🚧 **Work in progress** — actively being built.

- [x] Phase 1: Core migration engine (reading, migrating, validating, writing)
- [ ] Phase 2: CLI tool with `init`, `run`, `status` commands
- [ ] Phase 3: Demo UI to visualize migrations
- [ ] Phase 4: CI/CD integration and GitHub Actions check

## Tech Stack

- **Runtime:** Node.js 20+ with TypeScript (strict mode)
- **Database:** PostgreSQL (Supabase)
- **Validation:** Zod
- **Target framework:** LangGraph (CrewAI and OpenAI Agents SDK support 
  coming in Phase 2)

## Local Setup

```bash
# Clone the repo
git clone https://github.com/AnubhavMishra22/agentmigrate.git
cd agentmigrate

# Install dependencies
npm install

# Add your database connection
cp .env.example .env
# Edit .env and add your Supabase DATABASE_URL

# Run the engine
npm run dev
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

---
