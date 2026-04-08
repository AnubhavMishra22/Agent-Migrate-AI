# AgentMigrate

**Schema migrations for AI agent checkpoints — like Alembic for databases, but for LangGraph workflows.**

## The problem

When you update a LangGraph AI agent — rename a parameter, add a required field, change a tool’s schema — workflows that were **paused mid-execution** often **crash on resume**. LangGraph stores state as **checkpoints** (serialized JSON in PostgreSQL); when your code changes, old snapshots no longer match the new shape. There is **no built-in** upgrade path: you either **wait** for every in-flight workflow to finish (sometimes **hours or days**), **script it yourself**, or **lose in-progress work**.

This gap is still open in the ecosystem. See [GitHub issue #536](https://github.com/langchain-ai/langgraphjs/issues/536) (LangGraph JS, **September 2024**) — **no first-class fix to this day**.

## The solution

AgentMigrate brings the **database-migration pattern** to agent state: you define how to transform stored state (see [`migrations/001_rename_field.ts`](migrations/001_rename_field.ts) for `meta`, `up`, and `down` on `channel_values`-shaped data), and the engine walks your checkpoints and applies it.

**Today (Phase 1):** read checkpoints → run `up` on each row’s **`channel_values`** → merge → **one `UPDATE` per row**; failures are **per-row** (other rows still save). **Zod** is already a dependency for **upcoming** row validation; the runner does not enforce a schema on every row yet.

**Where we’re headed:** validate migrated payloads with **Zod**, optional **all-or-nothing** transactions, and a **single CLI** (e.g. `agentmigrate run`). Right now you run **`npm run build && npm start`** (or **`npm run dev`** for watch mode). Wiring lives in [`src/index.ts`](src/index.ts); design notes in [`ARCHITECTURE.md`](ARCHITECTURE.md).

### How it works (intent)

1. **Read** — load checkpoint rows from PostgreSQL (LangGraph-style `checkpoints` table).  
2. **Migrate** — run your **`up`** on each checkpoint’s **`channel_values`**.  
3. **Validate** *(planned)* — Zod-check each migrated payload before write.  
4. **Write** — persist updated checkpoint JSON (**per row today**; transactional “all rows” mode planned).  
5. **Rollback** *(planned)* — full run rolls back if anything fails, once that mode exists.

## Quick start

```bash
git clone https://github.com/AnubhavMishra22/Agent-Migrate-AI.git
cd Agent-Migrate-AI
npm install
cp .env.example .env   # set DATABASE_URL (e.g. Supabase)
npm run build && npm start
```

Dev (watch): `npm run dev`

Optional local test data (DDL + sample rows): [`docs/sample-checkpoints.sql`](docs/sample-checkpoints.sql)

## Status

🚧 **Work in progress** — actively being built.

- [x] Phase 1: Core migration engine (reading, migrating, writing; per-row persist + summary)
- [ ] Phase 2: CLI with `init`, `run`, `status` (including a single command like **`agentmigrate run`**)
- [ ] Phase 3: Demo UI to visualize migrations
- [ ] Phase 4: CI/CD integration and GitHub Actions checks

## Tech stack

- **Runtime:** Node.js **20+** with **TypeScript** (strict mode)
- **Database:** **PostgreSQL** (e.g. **Supabase**)
- **Validation:** **Zod** (runner integration planned)
- **Target framework:** **LangGraph**; **CrewAI** and **OpenAI Agents SDK** support **planned for Phase 2**

## Why this exists

Teams running LangGraph in production still solve this **manually** — blocking deploys, one-off scripts, or accepting lost in-flight work. AgentMigrate is meant to package a **reusable, safe, developer-friendly** approach.

## Author

Built by **[Anubhav Mishra](https://github.com/AnubhavMishra22)** — MS Computer Science, **UC Davis**. Backend and AI engineer.

- GitHub: [github.com/AnubhavMishra22](https://github.com/AnubhavMishra22)
- LinkedIn: [linkedin.com/in/anubhav-mishra-172726181](https://linkedin.com/in/anubhav-mishra-172726181)

---

*More documentation will be added as the project is built.*

See **CONTRIBUTING.md** for commit messages, branches, and PR conventions.
