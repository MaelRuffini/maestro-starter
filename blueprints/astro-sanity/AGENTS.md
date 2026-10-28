# Maestro Astro — agent entry point

Astro 7 (**JavaScript only**) + Sanity (schema-as-code, Studio at `/studio`)
template for marketing websites, operated by AI agents on **`main`**.

**Read [`SKILL.md`](./SKILL.md) before touching anything.** It is the single
source of truth. Also exposed as a skill at `.claude/skills/maestro-astro`
and `.cursor/skills/maestro-astro`.

CSS, accessibility, Figma measurement, animations and the brief → go
workflow are the same as the original Maestro (Next + Prismic). This file
only lists what is **different**.

## Hard rules (summary — details in SKILL.md)

- Never create `tsconfig.json`. JavaScript + JSDoc only. Sanity schemas are
  `defineType()` in `.js`, not `.ts`.
- One slice = one Figma frame = one commit on `main`. Never a `feat/slice-*`
  branch or a pull request. Batch: one commit each, **one** `git push origin
  main` at the end. There is **no** `prismic push` equivalent: the schema
  lives in git and the Studio reads it.
- Never publish a Sanity document from the agent (`client.publish` /
  `published` perspective writes). `sanity:fill` creates **drafts**.
- Every slice: `index.astro` + `schema.js` + `<name>.scss` + `mocks.json`,
  wrapped in `SliceSection`, with the shared `sliceSettings` object.
- Slices are `.astro` (server). Interactive bits are islands (`client:load`
  on a child). Never add a client directive to `SliceTitle` / `SliceSection`.
- SCSS + BEM (block = kebab-case slice name), tokens only, no magic values,
  no `!important`. Stylelint and `slice:check` enforce this.
- Animations off until a project picks (`src/animations.config.js`). Same
  registry as Maestro.
- Site-wide settings live in the `settings` singleton. Never add analytics
  snippets in code.
- RGAA/EAA is a legal requirement.
- Check slices at `/dev/slices` (localhost **4321**) and `npm run lint`
  before pushing `main`.
- Brief then go. Do not create a slice until the user confirms name, fields
  and layout.

## Agents and commands

- `/new-slice` — same intake as Maestro (Figma / URL / prototype / brief).
  After go: scaffold, build, screenshot, lint, commit on `main`, `git push`.
  No CMS schema push step.
- `dev-slice`, `reviewer`, `content-model-guardian` — same spawn rules as
  Maestro `SKILL.md` §3.5.2. Batch worktrees under `.worktrees/`, ports
  **4331–4333**.

## Useful commands

```sh
npm run dev              # http://localhost:4321 — /dev/slices, /studio
npm run lint             # ESLint + Stylelint + slice:check
npm run slice:scaffold -- Name --fields file.json
npm run slice:scaffold -- Name --fields file.json --from Hero
npm run slice:land -- --name Name --from .worktrees/<id>
npm run type:install -- article
npm run sanity:connect -- <projectId> <dataset>
npm run sanity:fill -- --slice Hero   # draft only, human publishes
npm run slack
# Go-live: SKILL.md §12 — Vercel + CORS + Presentation + webhooks
```
