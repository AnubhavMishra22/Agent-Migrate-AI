# Changelog

All notable changes to **AgentMigrate** are recorded here. This file lives on the **`Project-Setup`** branch and should be **updated whenever you merge meaningful work** (features, fixes, tooling, or docs that affect how the repo is used).

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). This project uses **0.Y.Z** tags when versions are published; until then, use dated sections under **Unreleased** or promote entries to a numbered release when you tag one.

---

## [Unreleased]

### Added

- `CHANGELOG.md` — living history of project and setup changes (this file).
- `ARCHITECTURE.md` — module map, transactional migration flow, and progress log for the **Project-Setup** layout (`run.ts`, `runner.ts`, Zod, `FOR UPDATE`).

---

## [0.1.0] — 2026-04-06

_Initial baseline; section date matches the git author date of the first docs commit on `Project-Setup` (`139333c`)._

### Added

- Node.js **>= 20**, **ESM** (`"type": "module"`), **TypeScript** with `strict` compiler options.
- Core dependencies: **`pg`**, **`dotenv`**, **`zod`**.
- Scripts: **`npm run build`**, **`npm run typecheck`**, **`npm run dev`** (tsx watch `src/run.ts`), **`npm run migrate`** (tsx `src/run.ts`).
- `.env.example` for **`DATABASE_URL`** (PostgreSQL / Supabase-style connection string).

---

## How to maintain this changelog

1. **Under `[Unreleased]`**, add bullets under **Added** / **Changed** / **Fixed** / **Removed** as you ship work.
2. When you cut a release or merge a phase to `main`, either move Unreleased items into a new **`[0.x.y] — YYYY-MM-DD`** section or leave a dated subsection inside Unreleased.
3. Keep entries **user-facing**: tooling, behavior, breaking changes, and migration steps—not every internal refactor.
4. After updating, **commit on `Project-Setup`** (or merge into it) so this file stays the single source of truth for setup and release notes.

---

## Related docs

- **`ARCHITECTURE.md`** — module layout and runtime flow; update alongside this file when structure changes.
