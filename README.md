# AgentMigrate

**Schema migrations for AI agent checkpoints — like Alembic for databases, but for LangGraph workflows.**

## The problem

When you change a LangGraph agent (renamed fields, new required state, tool schema changes), workflows that were paused mid-run often **fail on resume** because checkpoints in PostgreSQL are **frozen JSON**. There is still no first-class LangGraph tool for upgrading that stored state. See [langgraphjs#536](https://github.com/langchain-ai/langgraphjs/issues/536).

## What this project does

AgentMigrate applies a **migration function** to each checkpoint’s **`channel_values`**, merges the result back into the checkpoint JSON, and **writes** it with one `UPDATE` per row. Phase 1 is intentionally small: read → transform → persist, with per-row error reporting (not a single global transaction yet). **Zod** is a dependency for **planned** validation; the current runner does not run schema checks on each row.

- **Example migration:** [`migrations/001_rename_field.ts`](migrations/001_rename_field.ts) (`meta`, `up` / `down` on `Record<string, unknown>`).
- **How it’s wired:** [`src/index.ts`](src/index.ts) loads checkpoints and calls `runMigration` with your `up` function.
- **Deeper detail:** [`ARCHITECTURE.md`](ARCHITECTURE.md).

## Quick start

```bash
git clone https://github.com/AnubhavMishra22/Agent-Migrate-AI.git
cd Agent-Migrate-AI
npm install
cp .env.example .env   # set DATABASE_URL
npm run build && npm start
```

Dev (watch): `npm run dev`

Optional test data: [`docs/sample-checkpoints.sql`](docs/sample-checkpoints.sql)

## Status

- [x] Phase 1: read, migrate `channel_values`, per-row write, summary
- [ ] Phase 2: CLI (`init`, `run`, `status`)
- [ ] Phase 3: demo UI
- [ ] Phase 4: CI / GitHub Actions

## Stack

Node 20+, TypeScript (strict), PostgreSQL, Zod (for upcoming validation), aimed at LangGraph-style checkpoints.

## Why it exists

Production teams today block deploys, write one-off scripts, or accept lost in-flight work. This repo is a small, reusable migration-shaped tool for that gap.

## Author

[Anubhav Mishra](https://github.com/AnubhavMishra22) — MS CS, UC Davis.

- GitHub: [github.com/AnubhavMishra22](https://github.com/AnubhavMishra22)
- LinkedIn: [linkedin.com/in/anubhav-mishra-172726181](https://linkedin.com/in/anubhav-mishra-172726181)

---

*See **CONTRIBUTING.md** for commits, branches, and PR conventions.*
