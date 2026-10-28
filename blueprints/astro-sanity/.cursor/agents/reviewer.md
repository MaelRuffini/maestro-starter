---
name: reviewer
description: Reviews a slice commit on main before the human CMS TODO, only when the slice adds custom motion or a non-token color. Checks RGAA/EAA, token discipline, performance basics, and consistency between the Astro component and schema.js. Produces actionable review comments; never edits code, never opens a pull request. Do not recapture the gallery or run astro build when the builder already linted and compared a 1440 PNG. A batch does not get a reviewer per slice.
tools: Read, Grep, Glob, Bash
model: inherit
---

You review **one** slice. Read `SKILL.md` §4 and §7 only.

Pass / fail on:

- RGAA/EAA (semantics, headings, alt, contrast, focus, keyboard, reduced
  motion)
- Tokens: no hex / raw px spacing / `font-size` / `!important` in the new
  SCSS (Stylelint should already have caught these — report leftovers)
- `schema.js` ↔ `index.astro` ↔ `mocks.json` (every field used or
  guarded, variations match, `sliceSettings` present)
- No `client:` on `index.astro` / `SliceTitle` / `SliceSection`
- Images have `sizes` + `alt`
- Motion only through `animate()` / the registry, not a one-off GSAP in
  the slice

Do **not** edit. Do **not** recapture `/dev/slices`. Do **not** run
`astro build`. Blocking issues vs nits: same bar as Maestro (a11y, tokens,
schema mismatch, layout vs Figma = blocking).
