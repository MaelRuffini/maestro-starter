---
description: Create one or more Prismic slices from selected Figma frames (or links), a live URL, a prototype's code, a screenshot or a brief, following SKILL.md, committed on main.
argument-hint: [figma-frame-url | https://site-url | path/to/code | brief] [extra instructions]
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, Task
---

Create slice(s) from the design reference below and commit each on **`main`**.
Never create a `feat/slice-*` branch or a pull request. Never publish a
Migration Release. **Do not build until the user says go** (`SKILL.md` §3.5).

**One selected frame:** the parent builds it when the verdict is an obvious
NEW SLICE and the layout is in-flow. Commit, then `npx prismic push`, then
`git push origin main`.

**Several selected frames** (`SKILL.md` §3.5.1): one brief, one go, then a
fresh `dev-slice` per frame, at most three at a time, each in a detached
worktree. Commit each slice as it lands. `npx prismic push` and
`git push origin main` **once**, after the last commit.

**Speed (`SKILL.md` §3.5.2):** read each frame once (`get_screenshot` +
`get_metadata`). `get_design_context` only when metadata cannot answer a
measurement. Scaffold with `--fields` so the model is one command. Lint, not
a local `next build`. One 1440 screenshot per slice. Do not spawn guardian +
reviewer for an obvious NEW SLICE. Do not spawn `reviewer` for every slice
in a batch.

Reference and instructions: $ARGUMENTS

Follow this procedure exactly, in order.

## 1. Read the design (once)

Pick the intake from the reference. All of them end in the same **packet**
per section (screenshot, measured boxes, fields, layout classes, mock
padding, variations); §2 onward does not care where it came from.

**Figma** (selected frames or frame URLs):

- Frames selected in Figma: call `get_metadata` for that file and read
  **Currently selected nodes**. One node is one slice — do not split its
  children and do not walk up to the page. Several nodes are a batch: sort
  them by `y`, top to bottom. Fetch `get_screenshot` and `get_metadata` per
  node (in parallel). Two widths of the same section: the wider frame is the
  slice, the narrower one is its stack reference.
- Several frame URLs count as a batch. One frame URL is one slice.
- Do **not** call `get_design_context` unless metadata cannot answer a
  measurement. `get_variable_defs` once for the file.
- Keep a **packet** per frame (screenshot, measured boxes, fields, layout
  classes, mock padding, variations). Builders receive only their packet.
- Grid screenshot: if the frames look grid-aligned and the user has not sent
  one with the 12-column layout grid on, ask once (can sit in the brief).

**Live URL** (`http(s)://…` that is not figma.com — `SKILL.md` §8.1):

- Browser tool: navigate, lock the tab, emulate **1440×900**, full-page
  screenshot; then **390** (mobile is `< 480`; 390 is the check width), and
  820 only if tablet is distinct. Clear the emulation when done.
- Cut the page into sections (top-level `<section>` / landmark / large gap).
  Each section is a candidate slice, listed top to bottom. A URL is therefore
  usually a **batch**; the user strikes or merges items at the brief.
- Per section, one `Runtime.evaluate` returning JSON: section rect, direct
  children rects, repeated item rects, and computed `font-size`,
  `line-height`, `font-weight`, `gap`, `padding`, `color`, `background-color`,
  `border-radius`, `grid-template-columns` of the relevant nodes. That JSON
  *is* the measured-boxes part of the packet. Note hover / focus /
  reduced-motion behaviour you can observe.
- Translate by role, not proximity alone (`SKILL.md` §2.11). Values with no
  role in our system go in the brief as questions.
- Prototype built with the designer skill (`examples/maestro-design`): read
  `data-slice` (name + section cut), `data-variation`, `data-field` /
  `data-group` (the field list), `data-fixed` (not a field). Any
  `var(--size-*)`, `var(--col-*)` or type class (`.h2`, `.label`) in the
  source is already-translated intent — keep it. Everything else is still
  measured and translated by role.
- Third-party site: layout reference only. No copy, images or icons lifted.

**Code** (a path, a pasted component, a git URL — `SKILL.md` §8.1):

- Git URL: `git clone --depth 1 <url> /tmp/<name>`; delete it at the end.
- Read the component(s) for **content** (strings, images, links → fields;
  repeated blocks → group; conditionals → boolean or variation) and
  **layout** (Tailwind / CSS values → px → role → token). Do not import any
  of its CSS, config, fonts or components.
- Screenshot: run the prototype's own dev server if it has one, or render the
  component in a scratch page outside `src/`; capture 1440 and 390, then
  treat it as a URL. Delete the scratch page.
- The brief asks **"editable or fixed?"** for anything the source leaves
  ambiguous.

**Screenshot only**: measure proportions on the image, ask for the viewport
width, mark estimates as such in the brief. Suggest the URL or Figma file.

**Brief only** (text): skip intake; go to §2 with the described content and
layout, and ask for a visual reference if the layout is not obvious.

- Layout in the brief is measured boxes (`SKILL.md` §4.4), whatever the source.
- Read `SKILL.md` §3.5, §3.5.1, §3.5.2, §6 — and §8.1 for URL / code — not the
  whole file.

## 2. Guardian check

`ls src/slices` and read each `model.json`. Apply `SKILL.md` §6 yourself when
the verdict is obvious (nothing in the library matches → NEW SLICE; exact same
content + layout → REUSE). `examples/slices/` is not the library — a frame that
looks like a reference there is still a NEW SLICE; note the example in the
brief so the build can start from it (`--from <Example>`).

Spawn `content-model-guardian` only when an existing slice might be a variation
or an extend, or for a **batch with mixed verdicts** (one run, every frame).
Pass the inventory you already have.

A frame that lists **documents of another type** (blog posts, testimonials,
team…) gets one extra question in the brief: **curated or automatic?**
(`SKILL.md` §3.7) — and the brief names the target type: already in
`customtypes/`, a recipe to install (`npm run type:install -- article`), or a
type to create. The slice's fields are then only the controls (sort, limit) or
the relation — never a copy of the target type's fields.

- **REUSE** → skip that frame (tell the user which existing slice to use). In a
  batch, REUSE of one item does **not** stop the others.
- **VARIATION / EXTEND / NEW SLICE** → include it in the brief. Do not build yet.

If the Figma name is a leftover (`Frame 44`), the DOM id is meaningless
(`section-3`) or the component name is over-specific, propose a PascalCase
pattern name instead.

## 3. Brief — then wait for go

**One frame:** post **one** message with the brief in `SKILL.md` §3.5 step 6.
Stop until the user confirms.

**Batch:** post **one** numbered batch brief (`SKILL.md` §3.5.1), top to bottom.
Each item is a mini-brief. Shared questions once. State that a bare **go**
accepts the proposals and ships each frame only (no extra variations). Stop
until the user confirms. Do not require a go per slice.

Do **not** start modeling in the same turn as the brief.

## 4. Build (only after go)

**One frame.** Stay on **`main`**. The parent builds (`SKILL.md` §3.5.2):

1. Write the fields JSON from the approved brief (not inside the slice folder).
   `npm run slice:scaffold -- <Name> --fields <file.json>`. Do not `field add`
   those fields. Scaffold already ran `gen types`.
2. Write `mocks.json`, `index.jsx`, `<name>.scss`. Imitate the closest live slice.
3. Screenshot `/dev/slices?slice=<Name>` at 1440 on port 3000 vs the source
   screenshot — Figma frame, URL or prototype (`SKILL.md` §3.6). 390 only if
   the layout stacks. Once. Read the PNG.
4. `npm run lint`. Not `next build`.
5. Grep the new SCSS for hex / `px` / `font-size` / `!important`. Check model ↔ JSX.
6. Commit on `main` (URL / code sources: add `from <url> (date)` or
   `from <repo>@<sha>` to the message), `npx prismic push`, `git push origin main`.

Spawn `dev-slice` for that one frame only when the layout is out-of-flow /
full-bleed / motion, context is bloated, or the user asked. `MODE: single`.
It commits and pushes.

**Batch.** Do not build the slices in this conversation. For each non-REUSE
frame, top to bottom, keep **at most three** `dev-slice` runs in flight:

1. On a clean `main`, create a detached worktree and reuse this repo's
   `node_modules` (`SKILL.md` §3.5.1). Assign port `3101`, `3102`, or `3103`.
2. Spawn `dev-slice` with `MODE: batch`, the worktree path, the port, and
   **only that frame's packet**. It must not re-fetch Figma, must not commit,
   and must not push.
3. When one finishes: `npm run slice:land -- --name <Name> --from .worktrees/<slice_id>`,
   commit on `main`, `git worktree remove --force` that directory, then start
   the next frame. A one-line progress note is enough. Do not wait for another go.
4. After the last commit: `npx prismic push`, then `git push origin main`.

Only stop the queue for a new blocker that was not in the brief; ask once,
then resume.

## 5. Review

The builder's grep and the 1440 PNG are the review. Spawn `reviewer` only
when the slice adds custom motion or a non-token color.

If reviewer returns **REQUEST CHANGES** with **blocking** items, fix them.
**One** fix pass. Nits go in **À finaliser**. Then continue the queue.

Reviewer must not recapture the gallery or run `next build` when lint already
passed and a 1440 PNG was compared.

## 6. Report

**One frame:** reply with the verdict, review status, assumptions, and
**À finaliser** (`SKILL.md` §3.5 step 14).

**Batch:** a short progress line after each landed slice. End with **one**
combined **À finaliser** (every `/dev/slices?slice=` link, in order).

Write it in the user's language. Omit steps already done. Do not open a pull
request. Do not author Page Builder content unless the user asked (Slack §11:
`npm run prismic:fill -- --slice <Name>` per built slice, after the single
push, never publish the release).
