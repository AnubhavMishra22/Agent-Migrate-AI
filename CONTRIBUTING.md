# Contributing

Shared project conventions (previously under `.cursor/rules/`, which stays **local-only** and is listed in `.gitignore`). **`git rm --cached .cursor`** removes those paths from Git tracking but **does not delete** the folder on your machine when you pull—only the tracked copies are dropped from the repo.

## Commit messages

Use a **capitalized label**, **colon**, **space**, then a short description (not lowercase Conventional Commits).

**Preferred labels:** `Init:`, `Feature:`, `Fix:`, `Refactor:`, `Docs:`, `Test:`

**Avoid:** `feat:`, `fix:`, `chore:`, and similar lowercase tags.

**Examples:** `Docs: add CONTRIBUTING guidelines`, `Feature: add checkpoint reader with optional paging`

## Branches

Use **Pascal-Case segments with hyphens** and slashes only between workflow levels (e.g. phase vs step).

**Examples:** `Project-Setup`, `Phase1/Core-Migration-Engine`, `Step2/Db-Connection-Reader`

Avoid inventing branch types outside the agreed phase/step names unless the maintainer asks.

## Pull requests

**Titles:** Start with **`Step N:`** plus a short description. Do not repeat the phase name in the title when the base branch already indicates the phase.

**Descriptions:** Plain English, short paragraphs or simple bullets. Skip heavy Markdown (e.g. avoid large code fences in the PR body unless requested).

## Attribution

Do not add AI tools or assistants to contributor lists, `package.json` author fields, or README credits. Use the project owner’s GitHub identity only: **AnubhavMishra22**.
