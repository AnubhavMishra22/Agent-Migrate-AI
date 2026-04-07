# Changelog

All notable changes to **AgentMigrate** are recorded here. Update this file whenever you merge meaningful work (features, fixes, tooling, or docs).

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). This project uses **0.Y.Z** tags when versions are published; until then, use dated sections under **Unreleased** or promote entries when you tag one.

---

## [Unreleased]

### Added

- `README.md` — problem statement, solution overview, setup, sample SQL, author links.
- `package.json` — **`repository`** URL for the canonical GitHub repo.
- `CONTRIBUTING.md` — commit messages, branch naming, PR style, attribution (replaces shared `.cursor` rules in-repo).
- `docs/sample-checkpoints.sql` — optional DDL + seed rows for local DB testing.

### Changed

- `ARCHITECTURE.md` — aligned with **Phase 1** on `main` (`index.ts`, `runMigration`, `writer`, `channel_values` migrations) so docs match the code after integrating `main` into the **Project-Setup** PR branch.
- `README.md` — short overview + links; keeps original narrative (problem, Alembic analogy, #536 Sept 2024, solution/roadmap, five-step intent, phases 1–4, stack, why/author) without large inline code blocks; sample SQL stays in `docs/sample-checkpoints.sql`.

---

## [0.1.0] — 2026-04-06

_Initial baseline; section date matches the git author date of the first docs commit on the Project-Setup line (`139333c`)._

### Added

- Node.js **>= 20**, **ESM** (`"type": "module"`), **TypeScript** with `strict` compiler options.
- Core dependencies: **`pg`**, **`dotenv`**, **`zod`**.
- Tooling scripts: **`npm run build`**, **`npm run typecheck`**, **`npm run dev`**, **`npm start`** (current **`main`** uses **`src/index.ts`** / **`dist/src/index.js`**).
- `.env.example` for **`DATABASE_URL`** (PostgreSQL / Supabase-style connection string).

---

## How to maintain this changelog

1. **Under `[Unreleased]`**, add bullets under **Added** / **Changed** / **Fixed** / **Removed** as you ship work.
2. When you cut a release or merge a phase to `main`, either move Unreleased items into a new **`[0.x.y] — YYYY-MM-DD`** section or leave a dated subsection inside Unreleased.
3. Keep entries **user-facing**: tooling, behavior, breaking changes, and migration steps—not every internal refactor.

---

## Related docs

- **`ARCHITECTURE.md`** — module layout and runtime flow; update alongside this file when structure changes.
- **`README.md`** — high-level product description and setup.
