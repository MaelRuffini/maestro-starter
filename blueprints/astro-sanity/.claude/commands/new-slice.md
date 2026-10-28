---
description: Create one or more Sanity slices from selected Figma frames (or links), a live URL, a prototype's code, a screenshot or a brief, following SKILL.md, committed on main.
argument-hint: [figma-frame-url | https://site-url | path/to/code | brief] [extra instructions]
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, Task
---

Create slice(s) from the design reference below and commit each on **`main`**.
Never create a `feat/slice-*` branch or a pull request. Never publish a
Sanity document. **Do not build until the user says go** (`SKILL.md` §3.5).

**One selected frame:** the parent builds it when the verdict is an obvious
NEW SLICE and the layout is in-flow. Commit, then `git push origin main`.
There is no schema push command.

**Several selected frames** (`SKILL.md` §3.5.1): one brief, one go, then a
fresh `dev-slice` per frame, at most three at a time, each in a detached
worktree. Commit each slice as it lands. `git push origin main` **once**,
after the last commit.

**Speed (`SKILL.md` §3.5.2):** read each frame once (`get_screenshot` +
`get_metadata`). Scaffold with `--fields` so the schema is one command.
Lint, not a local `astro build`. One 1440 screenshot per slice (port 4321,
or 4331–4333 in a worktree). Do not spawn guardian + reviewer for an
obvious NEW SLICE.

Reference and instructions: $ARGUMENTS

Follow the Maestro `/new-slice` procedure (intake → packet → brief → wait
for go → scaffold → build → screenshot `/dev/slices` → lint → commit),
with every Prismic-specific step replaced as in `SKILL.md` and `MAPPING.md`:

- Files: `index.astro` + `schema.js` + `<name>.scss` + `mocks.json`
- Mocks are Sanity-shaped (`_type`, no `primary`)
- Wrap in `SliceSection.astro`
- After a single slice: `git push origin main` only
- Fill if asked: `npm run sanity:fill -- --slice <Name>` (draft)
- Human TODO in the user's language, Studio not Page Builder
