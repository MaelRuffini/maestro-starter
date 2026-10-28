# Maestro boilerplate — agent entry point

Next.js 16 (App Router, **JavaScript only**) + Prismic (Type Builder + `npx prismic` CLI)
template for marketing websites, operated by AI agents
on **`main`**.

**Read [`SKILL.md`](./SKILL.md) before touching anything.** It is the single source
of truth for architecture rules, the slice workflow, the CSS convention, tokens,
accessibility and the bootstrap checklist. It is also exposed as a skill at
`.claude/skills/maestro-slices` and `.cursor/skills/maestro-slices`.

## Hard rules (summary — details in SKILL.md)

- Never create `tsconfig.json`. JavaScript + JSDoc only.
- One slice = one Figma frame = one commit on `main`. Never create a
  `feat/slice-*` branch or a pull request. One selected frame is one slice.
  Several selected frames = one batch brief, one go, then one commit each
  (`SKILL.md` §3.5.1). At most three builds at once, each in a detached
  worktree under `.worktrees/`. A single slice: commit, then `npx prismic push`,
  then `git push origin main`. A batch: those two pushes **once** after the
  last commit. Never `publishMigrationRelease()`.
- Models are changed with the Prismic CLI, not by hand — except
  `npm run slice:scaffold -- <Name> --fields <file.json>`, which injects the
  shared `settings` group and the content fields.
  `src/slices/index.js` and `prismicio-types.d.ts` are generated.
- Every slice: `index.jsx` + `model.json` + `<name>.scss` + `mocks.json`, wrapped in
  `SliceSection`, with the shared `settings` group.
- SCSS + BEM (block = kebab-case slice name), tokens only, no magic values, no `!important`.
  Stylelint and `slice:check` enforce this in `npm run lint`; fix the code, not the config.
  Translate Figma by measuring boxes, not by copying auto-layout properties
  (`SKILL.md` §2.10, §4.4). A live URL or a prototype's code is a source too:
  measured, then translated by role into our tokens — never ported
  (`SKILL.md` §2.11, §8.1).
- Animations are **off until a project picks** (`SKILL.md` §3.8): roles are set
  in `src/animations.config.js`, implementations live in
  `src/lib/animations/`, one client controller (`Animations`) runs them from
  `data-animate`. Never animate from a slice, never add `"use client"` to
  `SliceTitle` / `SliceSection`. Ask the user which motion at project start.
- Site-wide settings (SEO defaults, favicons, Webflow-style head/body custom code,
  redirects) live in the `settings` singleton (`SKILL.md` §5). Never add analytics
  or tag-manager snippets in code.
- RGAA/EAA accessibility is a legal requirement: semantic HTML, heading order, `alt`,
  contrast, focus, keyboard.
- Check slices at `/dev/slices` (screenshot localhost vs Figma, `SKILL.md` §3.6)
  and run `npm run lint` before pushing `main` (CI / Vercel run `next build`).
  New slices: `npm run slice:scaffold -- <Name> --fields <file.json>`
  (`SKILL.md` §3.2, §3.5.2). Imitate the closest live slice; when none is close,
  the reference slices in `examples/slices/` (not pushed, not bundled — `--from
  <Example>` copies one as a starting point). Do not spawn three subagents for an obvious NEW
  SLICE. A batch spawns `dev-slice` per frame (at most three at once) and
  spawns `reviewer` only for motion or a non-token color.
- Brief then go: do not create a slice until the user confirms name, fields and
  layout (`SKILL.md` §3.5). A single slice then `npx prismic push` and a human
  TODO (CMS). A batch pushes once after the last commit. On every slice (and
  any other Prismic content), ask whether to add it and on which document
  before `prismic:fill`. Figma images: export at 2×, transparent PNG stays
  PNG, rotated images exported unrotated, alt on the media library asset
  (`SKILL.md` §3.3). Slack clients: `SKILL.md` §11 (`npm run slack`, then
  `prismic:fill`).

## Agents and commands

- `/new-slice` — Figma / live URL / prototype code / screenshot / brief → **questions + brief → wait for go →
  commit on `main` → human TODO** (`.claude/commands/new-slice.md`, mirrored in
  `.cursor/commands/`). Several selected frames: one batch brief, one go, then one
  commit each (`SKILL.md` §3.5.1) — do not ask which section, and do not expand
  one frame into its children. Do not build until the user confirms. Ask for a
  12-col grid screenshot when the frame looks grid-aligned. If the frame shows
  one layout, ask whether to ship mirrored variations (`SKILL.md` §3.5, §6, §8).
  After the build, list what they still have to do (Page Builder). **Parent
  builds** a single simple slice (`SKILL.md` §3.5.2). A batch is built by
  `dev-slice`, one fresh packet per frame.
- `dev-slice`, `reviewer`, `content-model-guardian` — subagent definitions in
  `.claude/agents/` (mirrored in `.cursor/agents/`). Subagents cannot call each other.
  Spawn them only when §3.5.2 says so — not as a required three-agent pipeline.

## Useful commands

```sh
npm run dev            # http://localhost:3000, /dev/slices for the mocks gallery
npm run lint           # ESLint + Stylelint (tokens, BEM) + slice:check; before pushing a slice (CI runs next build)
npm run lint:css       # Stylelint only — stylelint.config.mjs encodes SKILL.md §4
npm run slice:check    # model ↔ mocks ↔ JSX consistency — scripts/slice-check.mjs
npm run slice:scaffold -- Name --fields file.json   # create slice + settings + content fields + connect + gen types
npm run slice:scaffold -- Name --fields file.json --from Hero   # same, component + SCSS copied from examples/slices/Hero
npm run slice:land -- --name Name --from .worktrees/<id>   # copy a batch worktree slice onto main, then gen types
npm run type:install -- article   # install an opt-in custom type recipe (examples/recipes: article, testimonial); SKILL.md §5, §3.7
npm run prismic:connect -- <domain> [--push] [--preview]   # point the codebase at <domain>.prismic.io (SKILL.md §9)
npx prismic status     # local vs remote models
npx prismic gen types  # refresh prismicio-types.d.ts after extending a model
npx prismic push       # single slice: after its commit. Batch: once, after the last commit
npm run prismic:fill -- --slice Cover   # append mock onto homepage (Migration Release)
npm run slack          # client talks in Slack; Cursor cloud agent builds
npx prismic docs view nextjs
# Go-live (once): SKILL.md §12 — Vercel + domains + Prismic previews/webhooks
# Client connect (once): SKILL.md §11 — Slack, Figma, Prismic; Cursor stays agency-side

```

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
