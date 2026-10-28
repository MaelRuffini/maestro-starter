---
name: maestro-slices
description: Conventions for building Next.js + Prismic websites from the Maestro boilerplate. Load whenever working on slices, pages, styles, content models, or the Prismic repository of this project. Covers architecture rules, the slice workflow (share + questions + go → build → human TODO), Slack client intake, Prismic fill (Migration Release), Vercel go-live, the CSS convention, tokens, accessibility (RGAA/EAA), and the bootstrap checklist.
---

# Maestro — Next.js + Prismic boilerplate skill

This repository is a **GitHub template** used to build marketing websites.
It is designed to be operated by AI agents:
you create slices from Figma frames, live URLs, prototype code or briefs
(§8, §8.1), following the rules below, and commit them on **`main`**. Do not open pull requests or slice feature branches.

For Prismic mechanics (CLI syntax, field options, repository settings) rely on the
official Prismic skill and the CLI itself: `npx prismic --help`,
`npx prismic docs list`, `npx prismic docs view <path>`. This document is about
**our** conventions, which take precedence whenever they are stricter.

---

## 1. Stack

| Concern         | Choice                                                                       | Notes                                                                                                                                                        |
| --------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Framework       | Next.js 16, **App Router**                                                   | No Pages Router. Read `node_modules/next/dist/docs/` for anything unfamiliar; APIs changed.                                                                  |
| Language        | **JavaScript only**                                                          | `jsconfig.json` provides `@/*` → `src/*`. **Never create `tsconfig.json`.** Types still exist: `prismicio-types.d.ts` is generated and referenced via JSDoc. |
| CMS             | Prismic, **Type Builder + Prismic CLI** (`npx prismic`)                      | Not Slice Machine. Config lives in `prismic.config.json` (repository name + routes).                                                                         |
| Rendering       | `@prismicio/react` `<SliceZone>`, `@prismicio/next` for links/images/preview |                                                                                                                                                              |
| Data            | `@prismicio/client` via `src/prismicio.js` (`createClient()`)                | Fetches are tagged `prismic`; `/api/revalidate` clears them.                                                                                                 |
| Styles          | **Sass** (`.scss`), BEM, design tokens as custom properties                  | Detailed in §4. No CSS Modules, no Tailwind, no CSS-in-JS.                                                                                                   |
| Package manager | npm                                                                          |                                                                                                                                                              |
| Hosting         | Vercel                                                                       |                                                                                                                                                              |
| Animation       | GSAP (ScrollTrigger + SplitText) + Lenis, **off until a project picks**      | `src/animations.config.js` maps roles to animations; `settings.panel_animation` stays per slice (§3.8). Nothing animated unless chosen.                      |

---

## 2. Architecture principles

1. **The slice is the unit of work.** A slice is a self-contained folder
   `src/slices/<Name>/` with `index.jsx` (component), `model.json` (fields),
   `<name>.scss` (styles) and `mocks.json` (preview data).
2. **One slice = one Figma frame = one commit on `main`.** Never "rebuild the
   whole page". One selected frame is one slice, including its inner frames.
   Several frames selected at once are a **batch** (§3.5.1): one brief, one go,
   then this unit of work per frame, top to bottom.
3. **Everything is scoped to the slice.** Every class in `<name>.scss` is prefixed
   with the slice's BEM block (`.hero__title`, `.cta-cards__card`). Nothing leaks
   into the global layer except through `src/styles/base/`.
4. **No magic values in CSS.** Colors, spacing, type, radii, motion → tokens
   (`var(--…)`) or type classes. Layout dimensions (max-widths, aspect ratios,
   grid fractions) may be literal `rem` / ratios. Stylelint
   (`stylelint.config.mjs`, run by `npm run lint`) rejects hard-coded colors,
   spacings, radii, durations and font sizes; the reviewer only judges what
   lint cannot.
5. **Shared vs page-specific doctrine.** Before creating a slice, check whether an
   existing slice (or a new **variation** of it) covers the need. The slice library
   stays lean; it must not fragment.
6. **Accessibility RGAA / EAA by default.** Semantic HTML, correct heading
   hierarchy, `alt` on CMS images, AA contrast, keyboard navigation, visible
   focus. Legal requirement, not a nice-to-have.
7. **Editable content first.** Texts, images, links = Prismic fields. Structure
   (layout, logic) = code. No hard-coded copy in slices.
8. **Models live in the repo and ship on `main`.** `src/slices/*/model.json`
   and `customtypes/*/index.json` are the source of truth. After creating or
   changing a slice, **commit on `main`**. A single slice then
   `npx prismic push` and `git push origin main`. A batch commits each slice
   locally, then runs those two pushes **once** at the end (§3.5.1).
   Uncommitted model files block push. Never create a `feat/slice-*` branch
   or a pull request. Detached worktrees under `.worktrees/` exist only while
   a batch slice is building, and are deleted after it lands. Never
   `publishMigrationRelease()`.
9. **Follow the house pattern unless it would be the wrong call.** Same slice
   shell, field order, CSS rules, and commit path as the reference slices. The
   goal is to work like a developer on this codebase, not to cargo-cult: if
   following the pattern fights the design or adds busywork, do the simpler
   thing and say why. Do not invent a parallel system.
10. **Translate Figma by measuring boxes, not by copying layout properties.**
    Auto-layout `gap`, corner pins, and parent height describe the *picture*.
    CSS `gap` and `position` describe the *box model*. Overflowing, overlapping,
    rotated, or covering nodes leave the CSS flow: they no longer size the
    parent. Measure child vs parent from `get_metadata` and the screenshot,
    then map those boxes to CSS (§4.4). The localhost PNG vs Figma (§3.6) is
    the check that the mapping held — not a list of remembered exceptions.
11. **Any reference is a measurement; our tokens are the vocabulary.** A
    Figma frame, a live URL, a screenshot or a prototype's code (Tailwind,
    plain CSS, a React component) are all *sources*. None of them is ported:
    the slice is rebuilt in our shell, grid, type classes and tokens (§8.1).
    A source value (`pt-2.5`, `#1a1a2e`, `font-size: 13px`) is translated by
    **role first, then proximity**: outer section padding → the `settings`
    padding scale; a gap between cards → the nearest `--size-*`; a title →
    the type class whose rendered size is nearest, never a font-size; a
    color → the nearest `--col-*`. A tie (10px between `--size-1` and
    `--size-2`) is settled by what **sibling slices of this project** use for
    that role — consistency across the page beats fidelity to the source. A
    value with no role in our system (a 7-column grid, 13px body text, a
    radius we do not have) is a design decision: flag it in the brief, do not
    approximate it silently. Stylelint rejects the magic value; this rule
    protects the intent.

---

## 3. Anatomy of a slice

```
src/slices/Hero/
├── index.jsx     # React server component, default export, receives { slice }
├── model.json    # Prismic model (generated by the CLI, one variation minimum)
├── hero.scss     # BEM styles, block = kebab-case slice name, imported by index.jsx
└── mocks.json    # Array of slice objects, one per variation, used by /dev/slices
```

`src/slices/index.js` is **generated** by the CLI (`npx prismic gen slice-index`).
Never edit it by hand.

**Reference slices** live in `examples/slices/<Name>/` (also reachable as the
skill's `references/` folder). Same four files, same conventions, but they are
**not** part of the project: the Prismic CLI does not see them (no push, no
types), they are not in `src/slices/index.js`, and `/dev/slices` does not
render them. They exist to be imitated — or copied with
`npm run slice:scaffold -- <Name> --fields <file.json> --from <Example>` — when
the project has no live slice close enough yet. The first line of each
`index.jsx` names the pattern it demonstrates. The library a guardian
inventories is `src/slices` only; `examples/` is never a REUSE candidate.

### 3.1 Component rules (`index.jsx`)

Every slice is wrapped in `SliceSection`. That is the page shell — do not invent
another:

```
<section data-slice-type="…" class="slice-section [.u-theme-*]">  ← theme
  <div class="container">
    <div class="<block>__wrapper [.u-pt-*] [.u-pb-*]">     ← padding
      …slice content…
    </div>
  </div>
</section>
```

`<SliceSection slice={slice} wrapperClassName="<block>__wrapper">`
(`src/components/SliceSection.jsx`). Theme lands on the `<section>` so it
cascades. Padding lands on the **wrapper**, never on the section and never
hard-coded in the slice SCSS. Variation modifiers go on the section via
`className` (e.g. `media-feature--image-right`).

Reuse the shared components. Do not duplicate them inside a slice:

- **SliceSection** — the shell above. Required on every slice. Full-bleed
  media (background image / video / overlay) goes in the `background` prop so
  the panel animation can tween it separately from the wrapper.
- **Button** (`src/components/Button.jsx`) — CMS links styled as buttons. Model a
  Link with `--allow-text` and `--variant Primary --variant Secondary --variant Outline`.
  Render with `<Button field={link} />`; it maps `field.variant` to `.button`,
  `.button--secondary`, `.button--outline`. The label is the link's text. Text
  links stay `PrismicNextLink` with `.link`.
- **SliceTitle** (`src/components/SliceTitle.jsx`) — slice titles (the lockup,
  not body copy). The rich text **block type** is the heading tag (`h1`–`h6`);
  `className` is the size (`.h2`, `.display`, …). Renders **one** heading
  so extra CMS blocks become lines, not flex siblings. Use
  `<SliceTitle field={title} className="<block>__title h2" />`.
  Hero (page title) passes `fallbackTag="h1"`; other slices default to `h2`.
  Motion is not a slice concern: the `title` role of `src/animations.config.js`
  decides (§3.8). `animation={false}` opts one title out, `animation="<name>"`
  forces one. `SliceTitle` stays a server component.
- **Prose** (`src/components/Prose.jsx`) — editorial rich text **body**. There,
  heading level and default size stay linked (`heading1`→`.h1` … `heading6`→`.h6`)
  because the editor is ranking subsections, not applying a slice lockup.
- **VideoPlayer** (`src/components/VideoPlayer.jsx`) — muted looping preview, then
  play with sound and Plyr UI. Source is a **Link (`--allow web`)** field's `url`
  (files are hosted outside Prismic; the editor pastes the URL). An optional
  Image can supply the HTML `poster`. Do not add another player library. Do not
  model video as Prismic media or Embed. Decorative autoplay backgrounds use a
  native muted looping `<video>`, not VideoPlayer.
- **GridOverlay** — already mounted in `layout.js` (toggle with Shift+G). Not used
  inside slices.
- **Animations** — already mounted in `layout.js`, after `SmoothScroll`. The one
  client component that runs every `data-animate` element (§3.8). Not used
  inside slices.

Then:

- Server component (no `"use client"`) unless interactivity requires it; then
  isolate the client part in a child component.
- Guard every optional field with `isFilled.*` from `@prismicio/client`.
  `SliceTitle` already returns `null` when the title is empty.
- Slice titles: always `<SliceTitle field={title} className="<block>__title h2" />`
  (swap the type class to match the design). Do **not** hard-code `<h2>` or map
  only `heading2`. The editor picks the tag in the Page Builder; the class picks
  the size. Do not put `PrismicRichText` as a direct flex/grid sibling of body
  and CTAs.
- Images → `PrismicNextImage` with an explicit `sizes` attribute and
  `fallbackAlt=""`. Above-the-fold hero images get `priority`.
- Variations: branch on `slice.variation`; express layout differences as a BEM
  modifier on the section (`className="fifty-fifty--image-right"`).
- Keep the JSDoc typedef header the CLI generates; it wires `prismicio-types.d.ts`.
- Reference implementations: imitate the **closest live slice** (`ls src/slices`
  first) — it already matches this project's tokens and content. When nothing
  live is close (first slices of a project, or a new pattern), imitate the
  closest reference in `examples/slices/` instead, or start from it with the
  scaffold's `--from <Example>`. Read the `// Reference:` line of each
  `index.jsx` to pick: `Hero` (full-bleed media, `100svh`, centered 8-col
  lockup), `FiftyFifty` (asymmetric inset grid, alternating media side),
  `Grid` (centered lockup + CSS-grid repeatable cards), `CtaCards` (paired
  themed cards on `container--large`), `StackedCards` (repeatable group +
  client child for GSAP ScrollTrigger), `Marquee` (CSS keyframes loop,
  reduced-motion), `Faq` (5/7 columns, native `<details>` accordion + client
  child), `Articles` (queries another type: sorted list + "related, excluding
  current", §3.7), `Testimonials` (same type listed automatically **or**
  hand-picked through content relationships, §3.7). Do not look for deleted
  template names (`RichText`, `CardGrid`, `MediaFeature`, `Cover`).

### 3.2 Model rules (`model.json`)

- New slices start with **`npm run slice:scaffold -- <Name> --fields <file.json>`**
  (`scripts/slice-scaffold.mjs`): `prismic slice create`, inject the shared
  `settings` group with `"repeat": false`, inject every content field from the
  JSON file, connect to `homepage` and `page`, then `prismic gen types` and
  `gen slice-index` **once**. Do not follow it with `field add` for those fields.
  Do not recreate settings with five `field add` commands. Pass `--no-settings`
  only when the brief omits the group; `--no-connect` only when told not to
  attach the slice to those types (batch landing reconnects on `main`).
  Add `--from <Example>` to start the component and SCSS from a reference in
  `examples/slices/` (component and block renamed; model and mocks still come
  from the CLI + `--fields`). The copy is a starting point: rework field ids,
  layout classes and `mocks.json` against the approved brief.
- The fields file is a JSON array, written outside the slice folder (`/tmp` or
  the worktree) and not committed:

  ```json
  [
    { "id": "title", "type": "rich-text", "label": "Title", "single": ["heading1", "heading2", "heading3", "heading4", "heading5", "heading6"] },
    { "id": "description", "type": "rich-text", "label": "Description", "allow": ["paragraph", "strong", "em", "hyperlink"] },
    { "id": "video", "type": "link", "label": "Background video", "allow": ["web"], "placeholder": "URL of the hosted video file (mp4)" },
    { "id": "background_image", "type": "image", "label": "Background image", "placeholder": "Full-bleed still. Used as the background, and if the video cannot play." },
    { "id": "cta", "type": "link", "label": "Call to action", "allowText": true, "variants": ["Primary", "Secondary", "Outline"] },
    { "id": "questions", "type": "group", "label": "Questions", "fields": [
      { "id": "question", "type": "text", "label": "Question" },
      { "id": "answer", "type": "rich-text", "label": "Answer", "allow": ["paragraph", "strong", "em", "hyperlink", "list-item"] }
    ]}
  ]
  ```

  Types: `rich-text` (`single` or `allow`), `text`, `image`, `link` (`allow`
  includes `web`, plus `allowText` / `variants` / `placeholder`), `select`
  (`options`, `default`), `boolean` (`trueLabel`, `falseLabel`), `number`
  (`min`, `max`, `placeholder`), `content-relationship` (`customType`, and
  `fields` — the related document's fields returned inline, see §3.7), `group`
  (`fields`, and `"repeat": false` for a single group such as a paired card).
- **`npx prismic field add`** is for extending a slice that already exists.
  Then `npx prismic gen types`. A new variation is still
  `npx prismic slice add-variation`, then copy the default `primary` (§ below).
- Every slice **starts with** the shared **`settings` group** (see §3.4), so it is
  the first field in the Page Builder. Skip it only when the brief or the user
  explicitly says not to (`--no-settings`).
- Field IDs are `snake_case`, labels are human-readable English.
- **Videos are always a Link** (`allow` includes `web`), never Prismic media and never
  Embed. Host files elsewhere; the editor pastes the URL. Read `video.url`
  after `isFilled.link(video)`.
- Full-bleed background media: **Background video** (Link, web) plus
  **Background image** (Image). Do not label the still "Poster" or "Image".
  The image is the background when there is no video, while it loads, and when
  `prefers-reduced-motion` is on.
- Rich text fields list the blocks they allow: **slice titles** are `single`
  with `heading1,heading2,heading3,heading4,heading5,heading6` so the editor can
  change the tag without changing the size. Body text lists only the blocks the
  design actually needs. Key text titles (card names) cannot change tag — keep
  the tag in JSX (`<h3 className="h6">`) or promote the field to rich text
  - `SliceTitle`.
- Use a **repeatable group** for lists of things (cards, logos, steps). The legacy
  `items` array is deprecated.
- Prefer a **variation** over a new slice when only layout changes.
- Two operations the CLI cannot do yet are done by editing `model.json`, then
  verified with `npx prismic gen types` and `npx prismic status`:
  1. setting `"repeat": false` on the `settings` group — **the scaffold already
     does this**; do not repeat it by hand on a new slice;
  2. copying the default variation's `primary` into a new variation
     (`add-variation` creates it empty).
  The scaffold writing `settings` and the `--fields` content fields into
  `model.json` is the allowed machine edit. Agents do not invent fields in
  that file by hand.

### 3.3 Mocks (`mocks.json`)

An array of slice objects (`slice_type`, `variation`, `primary`, `items: []`), one
per variation, with realistic **French** content and every field filled. Video fields are
web Links (`link_type: "Web"`, hosted URL), not Prismic media. Rich text is an
array of blocks; group fields are arrays of objects; `settings` is a one-item array.

**Images come from the Figma frame**, not from Unsplash or a stock Prismic sample,
whenever the frame has the asset. Raster assets are exported at **2×** so the
site stays sharp on retina. Call `download_assets` with `defaultScale: 2`.
Do not export at scale 1. Structural icons that are inlined as SVG stay SVG;
they are not rasterized.

- **Which file.** If `rawImages` for that fill is already at least twice as
  wide as the image is shown in the frame, use that original: it is sharper
  than a 2× render of the node. Otherwise use the `export` from
  `defaultScale: 2`.
- **PNG with transparency.** If the source `format` is `png`, or the image
  has transparent pixels, pass `defaultFormat: "png"` with the 2× scale. The
  mock URL and the file uploaded to Prismic stay PNG. Do not pass
  `defaultFormat: "jpg"` and do not flatten the image onto a background.
  `npm run prismic:fill` sniffs the bytes and names the media library file
  `.png` when the file is a PNG. An opaque photo whose source is jpeg is
  `defaultFormat: "jpg"` at 2×.
- **Rotation.** The 2× file is the unrotated image. If the node's `rotation`
  is not 0, do not export the tilted render: that bitmap is the axis-aligned
  box, so corners are cut off or the tilt is baked into the pixels. Prefer
  `rawImages` when it is already ≥ 2× the displayed width. Otherwise set
  rotation to 0 with `use_figma`, export at `defaultScale: 2`, then restore
  the rotation before you finish. If the layout still needs the tilt, rotate
  in CSS.
- **Alt.** Every image field in the mock has `alt`. Informative images: one
  short sentence in the site language describing what is shown. Decorative
  images: `""`. `prismic:fill` writes that same alt onto the **media library
  asset**. An image with no `alt` property is refused.

The mock `url` is that 2× file. `/dev/slices` loads it through
`next/image`, which only allows hosts listed in `next.config.mjs`
`images.remotePatterns` (Prismic by default). When the host is missing, add
that hostname there so the gallery can render the file. Refresh the URL at
build time if an earlier `download_assets` link has expired.

Mocks drive the local gallery `http://localhost:3000/dev/slices`
(`?slice=<folder or slice_type>` to isolate one). This route is dev-only.

A slice that **queries other documents** (§3.7) adds a top-level `fixtures`
key to its mock entry — `{ "article": [ …documents ] }` keyed by custom type —
and the gallery hands it to the slice as `context.fixtures`, so the gallery
never hits Prismic. Mock entries that only use relations do not need fixtures:
the related document's `data` sits inline in the link field, exactly as the
API returns it.

### 3.4 The `settings` group

New slices get this group from `npm run slice:scaffold -- <Name>`. Do not run
the five `field add` commands on a greenfield slice. They document the group's
shape (and how to rebuild it if someone passed `--no-settings` by mistake):

```sh
S=<slice_id>
npx prismic field add group settings --to-slice $S --label "Settings"
npx prismic field add select settings.padding_top --to-slice $S --label "Padding top" \
  --option "None" --option "Small (64px)" --option "Main (128px)" --option "Large (160px)" \
  --option "Page top (184px)" --default-value "Main (128px)"
npx prismic field add select settings.padding_bottom --to-slice $S --label "Padding bottom" \
  --option "None" --option "Small (64px)" --option "Main (128px)" --option "Large (160px)" \
  --option "Page top (184px)" --default-value "Main (128px)"
npx prismic field add select settings.theme --to-slice $S --label "Theme" \
  --option "Inherit" --option "Light" --option "Dark" --option "Brand" --default-value "Inherit"
npx prismic field add boolean settings.panel_animation --to-slice $S --label "Panel animation" \
  --true-label "On" --false-label "Off"
# then set "repeat": false — the scaffold already does this
```

`SliceSection` maps these to `.u-pt-*`, `.u-pb-*` and `.u-theme-*`
(`src/styles/base/utilities.scss`, `base.scss`). `None` (or an empty value) adds
no padding class. Editors control rhythm and theme; slices never hard-code
vertical padding on their outer wrapper.

`panel_animation` (boolean, off by default) opts the slice into the `panel`
role of `src/animations.config.js` (§3.8): a scrubbed GSAP parallax on the
`<section>`, with `ease: none`. Content (`[data-panel=content]`, the wrapper)
and, when the slice passes `background`, that media
(`[data-panel=background]`) move together. Two variants, one switch per
project (the config value):

| | `parallax-exit` (template default) | `parallax-enter` |
| --- | --- | --- |
| Tween | `to` `y: 60vh` | `fromTo` `y: -60vh → 0` |
| `start` → `end` | `bottom bottom` → `bottom top` | `top bottom` → `top top` |
| Reads as | content sinks as the section scrolls **away** | content slides **down into place** as the section arrives |
| Rest state | section gone | `y: 0`: exactly the CSS layout |

`enter` is the better pick for a new project: its end state is the CSS layout,
so it screenshots clean against Figma. The section gets
`.slice-section--panel` (`overflow: hidden`) so the travel never paints over a
neighbour: do not enable the panel on a slice that must overflow its box (a
card hanging out). Skipped when `prefers-reduced-motion` is on. Full-bleed media
belongs in SliceSection’s `background` prop, not inside the wrapper.

Prismic Select fields cannot be marked required: the Page Builder always offers a
blank row unless “Use first value as default” is on (first option = default).
Zero padding is therefore an explicit **None** option, not a blank value.

The **model default is always Main (128px)** for both padding selects. Do not
change `default_value` per slice to match a particular frame.

When implementing from Figma, read the frame's **outer** vertical padding (not
inner gaps):

- If it matches None / Small (64px) / Main (128px) / Large (160px) /
  Page top (184px), that padding is `settings`. Do not also set it in the slice
  SCSS. Write the matching values in `mocks.json` so `/dev/slices` looks like
  the frame.
- Inner gaps (title → media, button row, between repeatable rows) use
  `--size-*` in the slice (Figma space steps 0–8). Those are not `settings`.
  Measure the air between **visual** clusters (§4.4); do not copy a Figma
  `gap` when overflow was already inside the parent’s height. Compose tokens
  with `calc()` if one step is short; do not invent a token.
- If the outer padding is another value, pick the nearest of 64 / 128 / 160 /
  184 and note the mismatch in the human TODO. Do not invent a token and do not
  hard-code the Figma pixel value.

### 3.5 Slice workflow (what `/new-slice` does)

**Share → questions → go → build → human TODO.** The user selects **one**
frame or **several** (§3.5.1). The first deliverable is a **brief** with
questions, not code. Do not create a branch, a model, or files until the user
says **go**. A single slice is committed on **`main`**, then `npx prismic push`
and `git push origin main`. A batch commits each slice locally and pushes once
at the end. **Ask every time** whether to add the content to Prismic, and on
which document (type + uid, or the homepage). A bare **go** does not answer
that question: do not run `prismic:fill` until they say yes and name the
document. The same question applies to anything else that would write content
(a new page, a custom-type document, a media upload) — models pushed with
`npx prismic push` are the slice structure, not this question. After go, **do
not duplicate work** (§3.5.2).

1. Read the Figma frame from the current selection or a link, the screenshot,
   or the written brief. Call `get_screenshot` and `get_metadata`. Call
   `get_variable_defs` once for the file. Call `get_design_context` only when
   metadata cannot answer a measurement. If `Currently selected nodes` lists
   several frames, follow §3.5.1. One selected node is one slice: do not split
   its children and do not walk up to the page. Identify content (editable) vs
   structure (code). Map outer vertical padding to `settings` (§3.4). If a
   photo fills the artboard, **ask** whether the section height is `100svh`, a
   token, or the frame size.
2. **Grid screenshot when it helps.** The Figma MCP returns pixels, auto-layout
   and variables — not 12-column spans. If the frame looks aligned to the site
   grid, ask for a screenshot of that frame **with the 12-column layout grid
   visible** (Figma layout grid). Do not invent `col-lg-N` from pixel widths
   when they conflict with the overlay. Skip the ask if the user already sent
   one, or if the layout is clearly not on the grid (CSS grid / stacked only).
3. **Name.** Reject leftover Figma titles (`Frame 44`) and page-specific names
   (`HomeBloc`). A layout-pattern name is fine when that **is** the slice
   (`CardGrid`, `FiftyFifty`) — same idea as the frame, cleaned to PascalCase.
   Do not pick a metaphor that narrows the content (`MediaFeature` if the slot
   can be any copy + image). Do not pick `Content`: every slice is content.
   If an existing slice already is that pattern, that name wins.
4. **Guardian check**: reuse / variation / extend / new slice (`ls src/slices`,
   read each `model.json`). Reuse or extend beats a new slice. The **parent**
   does this when the library is small and the verdict is obvious. Spawn
   `content-model-guardian` only on a close call (existing slice could be a
   variation or extend) or for a **batch with mixed verdicts** (one run, every
   candidate). Do not spawn it on a one-frame slice that is clearly a new
   content model, or on a batch where every frame is an obvious NEW SLICE.
5. **Variations.** Figma usually shows **one** state. Propose extras that keep
   the same fields and only flip layout (image left/right, 2 vs 3 columns).
   Skip extras that need different fields. If the brief or frame does not already
   say which variations to ship, **ask in the next step** — do not silently
   add or omit them.
6. **Show the brief and stop.** One message covering:
   - proposed name (and why a Figma or first-guess name was dropped);
   - verdict (reuse / variation / extend / new);
   - **variations**: default = the frame; extras proposed or “none”; ask if
     unspecified;
   - fields (id, type, constraints);
   - layout: `.row` / `.col-*` / offsets / `justify-*` / `align-*`, or CSS grid;
     inner stacks use flex or CSS grid + `gap: var(--size-*)`, not sibling
     margins. For out-of-flow nodes, state measured child-vs-parent boxes
     (inset can be negative) and spacing between visual clusters (§4.4);
   - type: **size** class from the design (`.h2`, `.display`, …). The heading
     **tag** is not in the brief — `SliceTitle` reads it from the field. Mocks
     use `heading2` (or `heading1` for a page title);
     body copy has **no extra class** unless
     the design is a lead (`.text-large`) or muted (`.text-muted`);
   - `settings` values for **mocks** (model default stays Main);
   - animation: nothing to say unless this slice deviates from the project's
     `animations.config.js` (then one line: none / `<name>`, §3.8);
   - **open questions** (name, variations, grid, anything unclear).
     Always include: **Add this content to Prismic? If yes, which document?**
     (homepage, or type + uid). One question covers a batch unless slices
     go to different documents. Then wait. A screenshot request can live in
     that same message.
7. After go: stay on **`main`**. `git switch main` if needed. Never
    `git switch -c feat/slice-<kebab-name>`. Never open a pull request.
    **The parent builds** unless §3.5.2 says to spawn `dev-slice`. Pass the
    approved brief (name, verdict, variations, layout, Figma notes). Do not
    re-fetch Figma.
8. Model: `npm run slice:scaffold -- <Name> --fields <file.json>` (§3.2, §3.4).
   The scaffold writes settings and the content fields, connects `homepage` and
   `page`, and regenerates types once. Do not run `field add` for those fields.
   A new variation is `npx prismic slice add-variation`, then copy the default
   `primary` in `model.json`.
9. Write `mocks.json`, then `index.jsx` and `<name>.scss` following §3.1 and §4.
    Imitate the closest live slice. Figma-matching outer padding goes in mocks,
    not in SCSS.
10. **Screenshot localhost vs Figma** (`SKILL.md` §3.6). `npm run dev`, isolate
    `/dev/slices?slice=<name>`, capture 1440, **read the PNG**, compare to the
    Figma frame screenshot. Fix stacking, grid, type, missing CTAs. Then check
    390 only if the layout stacks (and 820 only if that breakpoint is distinct).
    Toggle Shift+G against the grid screenshot when there is one. Do not ship
    on SCSS alone. **Once** — do not recapture in a later agent.
11. `npm run lint` must pass. `npx prismic status` must show only the intended
    model changes. Do **not** run `next build` on the happy path: CI and Vercel
    build on push to `main`. Run a local production build only if lint is green
    but you still suspect a compile error.
12. Self-review against §7 (a11y) and §4 (tokens): grep the new SCSS for hex /
    `px` / `font-size` / `!important`. Spawn the `reviewer` agent only when
    §3.5.2 says so. Nits go in **À finaliser**; only **blocking** issues
    (a11y, tokens, model mismatch, layout vs Figma) trigger a fix pass.
    Maximum one fix pass from a reviewer; then report leftovers to the user.
13. Commit on **`main`**, then **`npx prismic push`** (uncommitted model files
    block push), then **`git push origin main`**. This push is for a **single**
    slice. A batch defers both pushes to the end of the queue (§3.5.1). Never
    create a slice branch or a pull request. Never `publishMigrationRelease()`.
    If Prismic or git push fails, say so in the human TODO and keep the matching
    checkbox.
14. **Human TODO** (required, last message). In the user's language, a checklist
    of what they still have to do. Omit steps already done. Typical items:

    ```
    ## À finaliser
    - [ ] Relire /dev/slices?slice=<name> (1440 / 820 / 390)
    - [ ] Page Builder : ajouter le slice, remplir textes / images (alt) / liens,
          choisir le heading, régler padding / thème, publier
    - [ ] Contrôler la page publiée contre le frame
    ```

    Do not add Page Builder content. Models are already pushed (step 13);
    drop the push line. If push failed, keep it and quote the error.

    If they said **yes, add it** and named the document (or the conversation is
    Slack, §11): models are already pushed; run
    `npm run prismic:fill -- --slice <Name>` (optional `--variation`, `--document page --uid <uid>`).
    That appends the mock (or stdin JSON) onto the page as a **Migration Release**.
    Images are the Figma files at 2× (§3.3): PNG stays PNG, rotated nodes are
    uploaded unrotated, and each asset gets the mock `alt`.
    Never `publishMigrationRelease()`. Drop the Page Builder fill line and list:

    ```
    ## À finaliser
    - [ ] Relire /dev/slices?slice=<name>
    - [ ] Relire la Migration Release dans Prismic, puis publier
    - [ ] Contrôler la page publiée contre le frame
    ```

### 3.5.1 Several frames (batch)

Goal: the user selects several Figma frames **once**, answers **once**, and
gets the same quality as a single slice. Each frame is still **one slice, one
commit on `main`**. The commits stay local until the queue finishes. Then
**one** `npx prismic push` and **one** `git push origin main`. Never one commit
with several new slices. Never one component for a whole page.

Treat as a batch when any of these is true:

- `Currently selected nodes` lists more than one frame;
- the user pastes several frame URLs;
- the user says to build these frames.

One selected node is one slice, even when it contains columns, cards, or a
button. Do not split those children. Do not walk up to the page and do not
turn an unselected sibling into a slice. If two selected frames are the same
section at two widths (a name like Mobile, or a frame about 390 wide), keep
the wider one as the slice and attach the narrower one as its stack reference.

1. Read each selected frame (`get_screenshot` + `get_metadata`). Sort by `y`,
   top to bottom. These reads can run in parallel. Do not call
   `get_design_context` on every frame. From each frame, keep a **packet**:
   node id, screenshot, measured boxes, content versus layout, proposed name,
   fields, layout classes, mock padding, variations. The packet is everything
   a single-slice build would keep. It is the only design input the builder
   gets.
2. Guardian **once**, and only when reuse versus new is unclear
   (`content-model-guardian`, one verdict per frame). If every frame is an
   obvious NEW SLICE, the parent verdicts from `ls src/slices` + each
   `model.json` and does not spawn the agent.
3. **One batch brief, then stop.** Numbered mini-briefs (each = §3.5 step 6),
   in visual order. REUSE items are skips, not builds — they do not cancel the
   rest. Shared questions once (one grid screenshot if the frames are
   grid-aligned; variation defaults; **add the content to Prismic, and on
   which document?**). A bare **go** accepts names, fields, layout and mocks
   padding as written, and ships **the frame only** (no extra variations).
   It does not authorize `prismic:fill`. Do not ask for a second go per slice.
4. After that one go, queue the non-REUSE slices top to bottom. Build **at
   most three at a time**. Each build is a fresh `dev-slice` in its own
   detached worktree, with only its packet. The parent does not write these
   slices in this conversation: by the later frames, the context would no
   longer match a single-slice build.

   For each slice, from the repo root, on a clean `main`:

   ```sh
   git worktree add --detach .worktrees/<slice_id> HEAD
   ln -sfn "$PWD/node_modules" .worktrees/<slice_id>/node_modules
   ln -sfn "$PWD/.env.local" .worktrees/<slice_id>/.env.local
   ```

   Ports are `3101`, `3102`, and `3103` (the user's `npm run dev` keeps
   `3000`). Pass the worktree path, the port, and the packet. The builder
   scaffolds, writes the slice, screenshots its own port, lints, and stops.
   It does not commit, push, or call Figma again.

5. When a build finishes, land it before starting another past the cap of
   three:

   ```sh
   npm run slice:land -- --name <Name> --from .worktrees/<slice_id>
   ```

   Commit that slice on `main` (`feat(slices): add <Name> slice`). Remove the
   worktree (`git worktree remove --force .worktrees/<slice_id>`). Keep a
   one-line progress note (commit, lint, PNG compared). Do not keep the
   slice source in the conversation. Do not wait for another go. Only stop
   the queue for a **new** blocker that was not in the batch brief; ask once,
   then resume.
6. When the queue is empty: `npx prismic push`, then `git push origin main`.
   If either fails, say so and keep the checkbox. One combined **À finaliser**
   (every `/dev/slices?slice=` link, in order).

Slack (§11) uses the same batch. The client pastes several frame URLs. Fill
runs after the single push, one `prismic:fill` per built slice, onto the
document named in the thread (homepage when they did not name one). In
Cursor, fill still waits for the yes and the document from the brief.

### 3.5.2 Speed (do not duplicate work)

The 1440 screenshot, token rules, and RGAA/EAA checks stay. What must not
repeat is **orientation**: each subagent starts from a blank context. A batch
stays fast because the model is one scaffold command and the remote push
happens once — not because a slice skips its screenshot.

- **Read Figma once** (parent, before the brief): `get_screenshot` and
  `get_metadata` per frame, `get_variable_defs` once per file.
  `get_design_context` only when metadata cannot answer a measurement.
  Pass the packet downstream. `dev-slice` does not call Figma again.
- **Do not read `SKILL.md` cover to cover** in a subagent. Point at §3, §4, §7
  (builder) or §2, §6 (guardian). This prompt plus those sections is enough.
- **Parent builds a single simple slice.** One frame, obvious NEW SLICE, in-flow
  grid or flex: the parent writes it on `main` and pushes at the end of that
  slice. A **batch always uses `dev-slice`**, one packet per run, at most
  three worktrees at once (§3.5.1). That is what keeps frame 12 as careful as
  frame 1.
- **Spawn `content-model-guardian`** when an existing slice might be a
  variation or an extend, or for a batch with mixed verdicts. Pass
  `ls src/slices` plus each `model.json` field list if you already have them.
- **Spawn `dev-slice`** for every slice in a batch, and for a single slice
  when the layout is out-of-flow / full-bleed / motion, the parent context is
  bloated, or the user asked. Always pass the approved brief. In a batch, also
  pass `MODE: batch`, the worktree path, and the port. Never tell it to
  rediscover the design.
- **Spawn `reviewer`** only when the slice adds custom motion or a non-token
  color. The builder greps tokens and checks model ↔ JSX, and has already
  compared the 1440 PNG. A reviewer on every batch slice is a second cold
  start per frame. Reviewer does **not** recapture the gallery, does **not**
  run `next build`, and does **not** re-run `gen types` when the builder
  already reported them green.
- **One visual pass:** 1440 required; 390 only if it stacks. Reviewer reads
  that PNG when it was spawned; recapture only if there is no capture, or CSS
  looks wrong.
- **Lint, not a local production build.** `npm run lint` = ESLint + Stylelint +
  `slice:check` (§4). `next build` runs in CI and on Vercel.
- **Scaffold the whole model in one command:**
  `npm run slice:scaffold -- <Name> --fields <file.json>` (`--from <Example>`
  when a reference in `examples/slices/` is the closest shape). Never a
  `field add` per content field on a new slice, and never five `field add`s
  for settings.
- **One remote push per batch.** Commit each slice on `main` as it lands.
  `npx prismic push` and `git push origin main` run once, after the last
  commit. A single slice still pushes at the end of that slice.
- **Fix loop:** blocking = a11y, hard-coded tokens, model mismatch, layout vs
  Figma. Everything else is a nit in **À finaliser**. Maximum one reviewer fix
  pass.

### 3.6 Localhost screenshot vs Figma

Cheap visual gate. Not a pixel-diff, not CI, no extra dependency.

1. `npm run dev` if it is not already running. Isolate
   `http://localhost:3000/dev/slices?slice=<Name>` (one variation per capture
   if there are several). A batch worktree uses its own port (`3101`–`3103`)
   and that same path. Do not screenshot `3000` for a slice that exists only
   in a worktree.
2. Capture a PNG **outside the repo** (`/tmp`, never commit it). On macOS:

   ```sh
   CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
   "$CHROME" --headless --disable-gpu --hide-scrollbars \
     --window-size=1440,900 \
     --virtual-time-budget=8000 \
     --screenshot=/tmp/maestro-slice-1440.png \
     "http://localhost:<port>/dev/slices?slice=<Name>"
   ```

   A browser MCP that can open localhost is better (you can click). Prefer that
   when it exists. If neither Chrome nor a browser tool is available, say so in
   the human TODO and stop claiming a visual check.

3. **Read the PNG.** Recapture if media is a Slice Machine placeholder or the
   page is still loading — that is not a layout bug.
4. Compare to the source screenshot — Figma `get_screenshot`, or the URL /
   prototype capture from §8.1 (and the 12-col overlay if the user
   sent one). Check **spatial relationships**, not copied CSS properties:
   overlap (how far a node hangs past another), air between visual clusters,
   stacking (content under a cover), grid spans, type size, missing CTAs,
   `align-*` / `justify-*`. Ignore mock copy vs Figma copy and exact px gaps.
5. 1440 is required. Add 390 when the layout stacks (`col-md-12`). 820 only if
   that breakpoint does something distinct.
6. Delete the temp PNG. Fix what is off, recapture once.

### 3.7 Slices that read other documents

Some sections are not filled by the editor on the page: a blog grid, "next 3
articles", a wall of testimonials, a team list. They render **documents of
another custom type**. Two mechanisms, chosen by one question — *who decides
the list?*

| Who decides | Mechanism | Model | Component |
|---|---|---|---|
| The **editor**, by hand (featured posts, three testimonials for this page) | **Content relationship** — a `Link` with `select: "document"` and `customtypes: [{ id, fields }]` | `--fields` type `content-relationship` with `customType` and `fields`; repeatable → inside a `group` | Read `item.<field>.data` after `isFilled.contentRelationship`; the listed `fields` come back inline, **no extra request** |
| **Nobody** — it is automatic (all articles sorted, latest N, everything but the current one) | **Query** at render time | Only the controls: `select` for sort, `number` for limit | `async` server component calling `getCollection(type, { context, orderings, limit, exclude })` from `src/lib/collection.js` |

One variation = one mechanism. "All or hand-picked" is two variations
(`default` + `curated`), never a relation group *and* a query in the same
variation with a "use picks if filled" rule. Reference: `examples/slices/Articles`
(`default` sorted list, `related` = next 3 excluding the current post) and
`examples/slices/Testimonials` (`default` all, `curated` relations). Recipes
for the `article` and `testimonial` types are in §5.

Rules:

- **Server only.** The query runs in the slice's `async` server component.
  Never fetch in a client component, never through an API route. Caching is
  the client's (`force-cache` + tag `prismic`), nothing to add.
- **`context`.** Every `<SliceZone>` in `src/app/**` passes
  `context={sliceContext(document)}` (`{ document: { id, type, uid } }`). A
  slice that must exclude the page it sits on uses `exclude: "current"`. A
  slice must not re-fetch the page it is on.
- **Orderings** use the API paths: `my.<type>.<field>` for a field of the
  type, `document.first_publication_date` for the publish date. Expose only
  the sorts the design needs (`select` with human labels, map in JSX).
- **Limit.** `number` field, empty = all (or the variation's own default,
  e.g. 3 for "related"). `getCollection` uses `pageSize` when limited,
  `getAllByType` otherwise.
- **Empty.** Return `null` when nothing comes back — a fresh repository has
  no articles yet and the page must still build.
- **Fixtures.** `mocks.json` entries carry `fixtures: { "<type>": [docs] }`
  (§3.3). Fixture documents mirror the type's model (`id`, `uid`, `type`,
  `url`, `data`), realistic French content, Prismic or Unsplash image URLs.
- **Cards link with `<PrismicNextLink document={doc}>`** so the route
  resolver (not a hand-built path) produces the URL.
- **Relation fields list what they need** (`fields: ["quote", "author", …]`),
  not the whole document; the generated type reflects exactly that. If the
  design later needs another field, `npx prismic field edit … --field` then
  `gen types`.
- The guardian's question for these briefs is "curated or automatic?", not
  "which fields?" — and whether the target type exists (install the recipe
  first, §5) or must be created.

### 3.8 Animations (opt-in, chosen once per project)

Nothing is animated until a project picks. The template ships the building
blocks; a project switches them on in **one file**, and slices are never
edited for it.

```
src/animations.config.js         # role → animation name (the project switch)
src/lib/animate.js               # animate(role, override) → { "data-animate": name } | {}  (server-safe)
src/lib/animations/index.js      # registry: name → lazy import
src/lib/animations/<name>.js     # one module per animation: init(element) → cleanup
src/components/Animations.jsx    # client controller, mounted once in layout.js
src/styles/components/animations.scss   # hidden-until-ready rules
```

How it flows: a shared component spreads `{...animate("<role>")}` on its
element. If the config gives that role an animation, the server emits
`data-animate="<name>"`; otherwise nothing is emitted. `Animations` scans
`[data-animate]` on mount and on each navigation, lazy-loads only the modules
named, and calls `init(element)`. Cleanups revert on navigation (no leaked
ScrollTriggers). Unused animations — including `SplitText` — are never
downloaded.

**Roles** (hooks emitted by shared components — do not add one per slice):

| Role | Emitted by | Animations |
| --- | --- | --- |
| `title` | `SliceTitle` | `split-words` |
| `panel` | `SliceSection`, only when `settings.panel_animation` is On | `parallax-exit`, `parallax-enter` |

**Animations**

| Name | What | Values |
| --- | --- | --- |
| `split-words` | Words fade in and unblur one after the other, played once | `1.4s`, `power3.out`, `0.07s` stagger, `opacity 0 → 1`, `blur(16px) → 0`, `top 85%`, `once` |
| `parallax-exit` | Panel content sinks as the section leaves (§3.4) | scrubbed, `ease: none`, `y: 60vh` |
| `parallax-enter` | Panel content slides into place as the section arrives (§3.4) | scrubbed, `ease: none`, `y: -60vh → 0` |

Easing rule: **played** = `power3.out`, long (0.6–1.4s). **Scrubbed** =
`none` (the scrollbar is the ease; any curve feels laggy). **Hover / UI** (CSS)
= `--transition-easing` and `--transition-duration[-fast]`, never a literal.

**Choosing.** The user says it in plain words ("titles reveal word by word,
panel enter on the hero, everything else static"). The agent edits
`src/animations.config.js`: `title: "split-words"`, `panel: "parallax-enter"`.
Per slice, the brief carries one line — *Animation: default (config) / none /
`<name>`* — and the agent maps it to the component's `animation` prop. Ask
once at project start (§9) instead of per slice.

**Adding an animation**
1. `src/lib/animations/<name>.js`: default export `init(element) → cleanup`.
   Build inside `gsap.context(…, element)` and return `() => ctx.revert()`
   (and revert anything else it changed, e.g. `split.revert()`).
2. One line in `src/lib/animations/index.js`.
3. If it starts from an invisible state, one selector in
   `src/styles/components/animations.scss`, inside the existing
   `(scripting: enabled) and (prefers-reduced-motion: no-preference)` media
   query. Content must stay visible without JS and under reduced motion.
4. If it needs a new role, add the key to `animations.config.js` and spread
   `animate("<role>")` in **one shared component**, not in a slice.
5. `npm run lint`, then check the result with reduced motion on and off.

**Rules**
- No `"use client"` on a shared component to animate it. The motion runs from
  `Animations`; `SliceTitle` and `SliceSection` stay server components.
- Reduced motion: `Animations` never calls `init`, so there is no split, no
  tween and no hidden state. Lenis smoothing is off too, and the CSS duration
  tokens collapse to `0.01s`.
- `animate()` only emits the attribute when an animation is on: the hide CSS
  can never hide an element nothing will reveal.
- Animate `transform` and `opacity`. `filter` only while it plays
  (`clearProps: "filter"`).
- A `split-words` target holds text and inline spans only, and its text must
  not change after mount. Prismic live preview re-renders can fight a split
  heading: check it in Preview the first time a project turns it on.
- A panel slice moves its content while the section arrives, so a title
  inside it can reveal earlier or later than it looks. Check it visually the
  first time a slice uses both; add a `start` option then, not before.
- Smooth scroll (Lenis) is always on. `SmoothScroll` calls `ScrollTrigger.update`
  on every Lenis tick: required, or scrubs drift.

---

## 4. CSS convention

Sass, global BEM classes, design tokens. Defined by Maël; do not deviate.

The mechanical part of this section is enforced: `npm run lint` runs ESLint,
then **Stylelint** (`stylelint.config.mjs` — hex/rgb/named colors, `px`
outside borders, `!important`, `#id`, element selectors, type sizing in slice
SCSS, non-token spacing/radii/durations, non-BEM class names), then
**`npm run slice:check`** (`scripts/slice-check.mjs` — the four files,
`settings` group in every variation, mocks ↔ variations, `SliceSection` +
`<block>__wrapper`, no `"use client"` in `index.jsx`, `SliceTitle` for a
`title` field, `sizes` + `fallbackAlt` on images, every SCSS class in the
block or an allowed global). A lint failure is a blocking fix, not a nit.
Fix the code, never the config, unless the convention itself changes.

### 4.1 Files

```
src/app/globals.scss            # @use of the base layer only (imported by layout.js)
src/styles/base/
├── breakpoints.scss            # $bp-mobile: 480px, $bp-tablet: 992px (+ *-max variants)
├── reset.scss                  # reset
├── sizes.scss                  # fluid root font-size → every rem scales with the viewport
├── grid.scss                   # .container, .container--no-padding, .container--raised, .row, .col, .col-lg|md|xs-N, .ml/mr-N-col
├── typography.scss             # .display, .h1–.h6, .text-large|main|small, .label, .text-muted
├── base.scss                   # TOKENS (:root), .u-theme-*, element base, .link, .button, .skip-link
└── utilities.scss              # .u-pt-*, .u-pb-*, .u-visually-hidden
src/styles/components/<name>.scss   # shared component styles (prose, setup-notice…), imported by the component
src/slices/<Name>/<name>.scss       # slice styles, colocated, imported by the slice's index.jsx
examples/slices/<Name>/<name>.scss  # reference slices (§3) — read or copy, never imported by the app
```

`src/components/` contains **JSX only** — never put a stylesheet there. A shared
component imports its styles with `import "@/styles/components/<name>.scss"`.

`next.config.mjs` adds `src/styles` to Sass `loadPaths`, so any file can
`@use 'base/breakpoints' as *;`.

### 4.2 Naming

- **BEM**: `.block__element--modifier`. The block is the **kebab-case slice or
  component name**: `Hero` → `.hero`, `CtaCards` → `.cta-cards`, `FiftyFifty`
  → `.fifty-fifty`.
- Wrapper element passed to `SliceSection` is always `<block>__wrapper`.
- Modifiers express variations and states: `.fifty-fifty--image-right`,
  `.cta-cards__card--linked`.
- Grid classes (`.row`, `.col-lg-6`, …), type classes (`.h2`, `.display`, `.label`,
  `.text-large`, `.text-muted`), `.link*`, `.button*`, `.box-shadow` and `.overlay`
  are the **only** global classes a slice may use besides its own block.
- `u-` is **only** for utilities (`.u-pt-*`, `.u-pb-*`, `.u-theme-*`,
  `.u-visually-hidden`). Do not prefix type, grid, `.link` or `.button`.
  `.u-theme-*` may land on a **sub-block** (a card on a photo), not only on the
  `<section>` via `settings`. On a card, pair it with `.overlay` so the panel
  stays translucent; do not set a solid `background` that fights the overlay.
- No element selectors in slice stylesheets. Exception: `styles/components/prose.scss`
  (rhythm, lists, links) because the markup comes from the rich text editor.
  Headings in rich text get type classes from `Prose`, not from element selectors.
- No `!important`. No `#id` selectors. No inline `style=`.

### 4.3 Tokens (`src/styles/base/base.scss`)

Tokens live in `:root` in `base.scss`. That file is the source of truth — read it,
do not recopy the list here.

- Colors, spacing, font sizes, radii, durations: always `var(--…)` or a type
  class. Never a raw hex, `px` spacing, or `font-size` in slice SCSS.
- In slices, use **semantic** colors (`--col-text`, `--col-background`,
  `--col-background-2`, `--col-text-muted`, `--col-border`, `--col-focus`,
  `--col-button-background`, `--col-button-text`), not the palette
  (`--col-black`, `--col-brand`, …). `.u-theme-light`, `.u-theme-dark` and
  `.u-theme-brand` remap the semantic set.
- Spacing only from `--size-*` (Figma space steps 0–8: `--size-4` is 24px, not
  4px). Section rhythm only via `settings` / `.u-pt-*` / `.u-pb-*`.
- Drop shadow: the `.box-shadow` class, not a raw `box-shadow` in the slice.
- Overlay on media: `--col-overlay` + the `.overlay` class, not a raw
  `rgba()` / `color-mix` in the slice. The token is not remapped by theme.
- Breakpoints: `$bp-*` from `breakpoints.scss`. Literal values are acceptable
  only for layout geometry (`max-width: 52.5rem`, `aspect-ratio: 4 / 3`,
  `8.333%`, `100svh` / `100vw` for full-bleed covers) and for `1px` hairlines.
- Do not invent a token. If the design needs one, stop and ask.

### 4.4 Layout

- Container → `SliceSection` handles `.container`. Inside, use the 12-column flex
  grid: `.row` (+ `.align-center`, `.justify-*`, `.row--reverse`) and columns.
  Class order is always `col`, then `ml-N-col` / `mr-N-col` if any, then
  `col-lg-N`, `col-md-N`, `col-xs-N` (omit unused breakpoints). Desktop classes
  are the default; `-md` applies ≤ 991px, `-xs` ≤ 480px.
- **Centered lockup** (one block in the middle of the grid, e.g. 8 cols with
  equal inset): `row justify-center` + `col col-lg-8 col-md-12`. Do **not** fake
  centering with `ml-2-col` (or any `ml-N-col` whose leftover equals the right
  inset). `ml`/`mr` reset only at `$bp-mobile` (480px), not at tablet: paired
  with `col-md-12` they overflow between 481px and 991px. Hero is this pattern.
- **Asymmetric inset** is when `ml`/`mr` belong: a column that starts at a grid
  line and is _not_ centered. Example: inset 50/50 (1 col empty, 4, 2-col gap,
  4, 1 col empty) is `row justify-between align-center` +
  `col ml-1-col col-lg-4 col-md-12` + `col mr-1-col col-lg-4 col-md-12`.
  `justify-between` is required: without it the two `col-lg-4` pack after the
  left offset. `ml`/`mr` reset on mobile; add `col-md-12` so columns stack from
  tablet.
- When the design sits on that grid, **say so in the brief** as concrete classes,
  not pixel widths. Those spans stay locked when you later change the **shell**
  (`.container--large`, an inner panel, extra padding). Do not drop `col-lg-N`
  and let the block fill the new parent. A wider wrapper is not a new span.
  After any shell change, re-check 1440 against Figma (§3.6).
- Vertical stacks (title, body, CTAs) use flex or CSS grid + `gap: var(--size-*)`
  (24px → `--size-4`). Do not space those siblings with margins.
- **Figma → CSS box model.** Auto-layout is the picture; CSS is in-flow boxes.
  Before writing `position` or `gap`:
  1. Mark each node **in-flow** (it sizes the parent) or **out-of-flow**
     (overlap, cover, overlay, rotation). Out-of-flow nodes do not add CSS height.
  2. From `get_metadata`, compute child vs parent: inset = child edge − parent
     edge. Negative if it hangs past. Do not default a named corner to `0`.
  3. Spacing between repeating groups is the air between consecutive **visual**
     bounding boxes (in-flow plus overflow), mapped to the nearest `--size-*`
     (`calc()` if one step is short). Do not copy the parent’s Figma `gap` when
     overflow was already inside that parent’s height.
  4. `overflow: visible` unless the design clips. `transform` is geometry; zero
     it under `prefers-reduced-motion`.
- Or CSS grid inside the slice when a flex grid is awkward (repeatable cards):
  `grid-template-columns: repeat(var(--x-columns), minmax(0, 1fr))` — `minmax(0, 1fr)`
  prevents content from blowing out the columns.
- Media queries are **max-width**, desktop-first, in this order at the end of the
  file: `@media (max-width: $bp-tablet-max)` then `@media (max-width: $bp-mobile)`.
- `rem` everywhere (root font-size is fluid, see `sizes.scss`). No `px` except
  `1px` borders. Full-bleed covers may use `100svh` / `100vw`.
- **Stacking checklist for any full-bleed media.**
  1. The parent of an `absolute` element must be positioned. `.slice-section`
     (`SliceSection`) is `position: relative; z-index: 5` whatever tag `as`
     renders; the global `section` rule only matches a `<section>`, so a footer
     or header relied on it and lost its background. Never rely on the tag. An
     image that disappears or covers the wrong area almost always means the
     wrong containing block (check it in devtools).
  2. Absolute siblings paint above non-positioned in-flow siblings. Content over
     media is positioned **and** above the media: `.slice-section__content`
     (`relative`, `z-index: 1`) or `.container--raised`.
  3. Media layer: `.slice-section__background` (`absolute`, `inset: 0`,
     `z-index: 0`, `overflow: hidden`, `pointer-events: none`), a sibling of
     `.container`, not a child of the wrapper, so the panel tween moves it
     separately.
  4. A themed `background-color` on the section is the fallback behind the
     image (no image, loading, `object-fit` letterbox). `.slice-section` sets it.
  5. `overflow: hidden`, `z-index` and `transform` create stacking contexts. A
     panel section is one. A child cannot rise above a sibling section from
     inside it.
  6. Image: `absolute; inset: 0; width: 100%; height: 100%; object-fit: cover`.
     With `next/image`: `sizes="100vw"`, `fallbackAlt=""` (decorative), and
     `priority` only above the fold.
  7. No `z-index` above the shell's `5` inside a slice. Layer inside the slice's
     own stacking context.
- **Full-bleed media.** `SliceSection` stays `section > .container > wrapper`.
  Do not invent a second shell. When the image must fill the viewport:
  `containerClassName="container--no-padding"` so the wrapper is full-width,
  media `position: absolute; inset: 0; object-fit: cover` on the wrapper
  (section is `position: relative`), then an **inner**
  `.container.container--raised` for the 12-col content. Absolute media paints
  above in-flow siblings; without `--raised` (`position: relative; z-index: 1`)
  the card sits under the photo. If a Figma frame is a photo filling the
  artboard, **ask** whether the height is `100svh`, a token `min-height`, or
  the frame px as `rem` — do not guess.

### 4.5 Typography

Apply type classes in JSX rather than declaring `font-size` or `line-height` in
slice SCSS. The tag is the heading **level** (outline); the class is the **size**.
They are not tied: a section can be `<h3 className="h1">`. `.h1` is a Figma
style class, not the `<h1>` element.

**Slice titles** (lockup): `SliceTitle` + a type class. Model `--single` with all
six heading types. Never choose `h2` in code to get `.h2`.

**Body copy** (`Prose`): heading level still maps to the default type class
(`heading1` → `.h1`, …, `heading6` → `.h6`) because the editor is choosing
subsection rank inside an article, not a designed lockup.

**Key text** (card names, eyebrows): tag stays in JSX; size is still a type class.

Sizes live in `src/styles/base/typography.scss` for **this** project. They match
Figma (`display`, `h1`–`h6`, `text-large`, `text-main`, `text-small`). **Read
that file** — do not assume px from memory. Map the Figma style **name** (`h2` →
`.h2`, `display` → `.display`). If a frame has no matching class, stop and ask;
do not invent a one-off size.

If Figma and `typography.scss` disagree, update **that file**, not the slice.
`line-height` must stay wrapping-friendly: extra air around a one-line title is
layout (`gap`, `settings`), not a tall strut on the type class.

| Class                      | Use                            |
| -------------------------- | ------------------------------ |
| `.display`                 | Largest lockup (page hero)     |
| `.h1`                      | Page title                     |
| `.h2`                      | Section title                  |
| `.h3`                      | Subsection                     |
| `.h4`                      | Small title                    |
| `.h5`                      | Smaller title                  |
| `.h6`                      | Card titles                    |
| `.text-large`              | Lead paragraphs                |
| `.text-main`               | Body (also the `body` default) |
| `.text-small`              | Small copy                     |
| `.label`                   | Eyebrows, uppercase            |
| `.text-muted`              | Muted color, combinable        |
| body / `.button` / `.link` | Body; Button & Link            |

Do not confuse `.h1` (class) with `<h1>` (tag). Slice-title mocks: `heading1` on
the page title, `heading2` on other lockups. Card **Key text** stays
`<h3 className="h6">`. Body headings still get the Prose defaults. Body copy has
**no type class**.

---

## 5. Page architecture

Each slice on a page is `section > .container > .<block>__wrapper` (see §3.1).
The files below are the App Router and Prismic routing layer.

```
src/app/layout.js              # fonts, metadata from src/lib/site.js, skip link, <main id="main">, <PrismicPreview>
src/app/page.js                # Homepage: client.getSingle("homepage") → <SliceZone>; SetupNotice if no document yet
src/app/[uid]/page.js          # Page: client.getByUID("page", uid) → <SliceZone>; generateStaticParams + generateMetadata
src/app/not-found.js
src/app/sitemap.js             # published documents that resolve a route URL
src/app/robots.js              # points at /sitemap.xml; disallows /dev, /slice-simulator, /api
src/app/slice-simulator/page.jsx   # Type Builder live preview (generated, do not restyle)
src/app/dev/slices/page.jsx        # dev-only mocks gallery (passes mock `fixtures` as context, §3.3)
src/app/api/{preview,exit-preview,revalidate}/route.js   # generated by the CLI
src/prismicio.js               # createClient(): routes from prismic.config.json, fetch tags, auto previews
src/lib/collection.js          # getCollection() for slices that list other documents; sliceContext() for every <SliceZone> (§3.7)
examples/recipes/<name>/       # opt-in custom types (article, testimonial) — `npm run type:install -- <name>`
src/lib/site.js                # site name / description / lang (rewritten by scripts/init.mjs); siteOrigin()
customtypes/{homepage,page}/index.json   # page types; both have a `slices` slice zone + SEO tab
prismic.config.json            # repositoryName + routes (homepage → "/", page → "/:uid")
```

- New page types: `npx prismic type create "<Name>" --format page` adds the type,
  the SEO tab **and** its route to `prismic.config.json`. Then create the matching
  `src/app/<segment>/[uid]/page.js` (copy `[uid]/page.js`) and connect slices to it.
- **Recipes** (`examples/recipes/<name>/`) are opt-in custom types kept out of
  the project until needed, like reference slices: a `recipe.json` manifest
  plus a tree mirroring the repo root (`customtypes/<type>/index.json`, and
  for page types `src/app/<segment>/[uid]/page.js` + its styles).
  `npm run type:install -- <recipe>` copies the files (refusing to overwrite),
  adds the route to `prismic.config.json`, runs `gen types` and prints the
  follow-up steps; `node scripts/type-install.mjs --list` enumerates them.
  Nothing is pushed — `npx prismic push` when the user says so. Shipped:
  - `article` — blog post (`title`, `cover`, `excerpt`, `published_at`,
    slice zone, SEO tab), route `/blog/:uid`, header rendered as page chrome
    (`article-header`) above the article's own slices. Pairs with the
    `Articles` reference slice (§3.7). A `/blog` index is a plain Page with
    the `Articles` slice, not a special route.
  - `testimonial` — repeatable type with no route (`quote`, `author`, `role`,
    `photo`): stays out of the sitemap by design. Pairs with `Testimonials`.
  Install a recipe **before** scaffolding a slice that relates to its type:
  the CLI refuses a `content-relationship` to a type that is not in
  `customtypes/`.
- Data caching: production fetches are `force-cache` + tag `prismic`; the
  `/api/revalidate` webhook calls `revalidateTag("prismic", "max")`. Development
  uses `revalidate: 5`. Do not add ad-hoc `fetch` caching in slices.
- Sitemap (`src/app/sitemap.js`) lists every published document whose route
  resolver produced a `url`. It does not name page types. `settings` and any
  type without a route in `prismic.config.json` stay out. A new page type added
  with `npx prismic type create "<Name>" --format page` is included after its
  documents are published, with no sitemap edit. The query uses
  `createClient({ preview: false })` so a preview cookie cannot leak drafts.
  The same `prismic` tag means the webhook refreshes `/sitemap.xml` on publish
  and unpublish. Canonical origin is `siteOrigin()` (`NEXT_PUBLIC_SITE_URL`,
  else `VERCEL_PROJECT_PRODUCTION_URL`, else `http://localhost:3000`).
  `src/app/robots.js` points crawlers at it and disallows `/dev/`,
  `/slice-simulator` and `/api/`.
- Metadata comes from the page type's SEO tab (`meta_title`, `meta_description`,
  `meta_image`). Fallback defaults live in `src/lib/site.js`.
- **Settings singleton** (`customtypes/settings`), read once per render through
  `getSettings()` (`src/lib/settings.js`, React `cache()`); `null` on a fresh
  repository, every consumer falls back silently. Tabs:
  - **Main** — site-wide SEO defaults (`getSiteDefaults()`).
  - **Icons** — `favicon` (SVG or PNG, served as-is plus a 32×32 PNG rendition),
    `apple_touch_icon` (180×180), `theme_color`. Wired by `getSiteIcons()` /
    `getThemeColor()` in `layout.js`. `src/app/favicon.ico` stays the fallback.
  - **Custom code** — `head_code` and `body_end_code` (Webflow-style slots,
    rich text restricted to one `preformatted` block, read with `asText`).
    `CustomCode` (`src/components/CustomCode.jsx`) is mounted first and last in
    `<body>`. Head code is parsed (`src/lib/custom-code.js`): `<meta>`/`<link>`
    are hoisted into `<head>` by React 19, `<script>`/`<style>`/`<noscript>` run
    before any content. Body-end code is injected raw. Runs in every
    environment, preview included — tell clients to check a tag there first.
    Do not add analytics or tag managers in code; they go in these fields.
  - **Redirects** — group `from` (path) / `to` (path or URL) / `permanent`
    (301 default). Read at **build** by `next.config.mjs` (`cmsRedirects`),
    invalid rows skipped with a warning. A CMS change needs a deploy: the
    publish webhook → Vercel deploy hook in §12 covers it.
- Global chrome (header/footer/navigation) is **not** part of the template yet.
  When added, model it on `settings` (or a `navigation` singleton) and render
  it in `layout.js`.

---

## 6. Content doctrine

- **Reuse first.** A new need is served, in order, by: existing slice as-is →
  existing slice + new field (only if backwards compatible) → new **variation** →
  new slice.
- **Variation** when the fields are (almost) the same and only the layout differs
  (image left/right, 2 vs 3 columns). **New slice** when the content model is
  different. A single Figma frame is one default; still **propose** the obvious
  mirrors (flipped image, column count) and **ask** if the user did not specify.
  Do not invent a variation that needs extra fields.
- **Naming**: PascalCase pattern, not the page (`CardGrid`, not `HomeFormations`)
  and not a leftover (`Frame 44`). Layout-pattern names are valid when that is
  the slice (`FiftyFifty`, `CardGrid`). Avoid names that over-specify the
  content (`MediaFeature` for any title + text + image) and names that specify
  nothing (`Content`). Variation IDs are camelCase (`imageLeft`), names are
  human (`Image left`).
- Fields: minimal set the design needs. No "just in case" fields. A select is
  better than a boolean when a third option is plausible.
- Editors must be able to leave optional fields empty without breaking the layout
  (`isFilled` guards everywhere).
- Every model change is reviewed for fragmentation by the `content-model-guardian`
  before it is written.

---

## 7. Accessibility checklist (RGAA 4 / EAA)

Check every slice against this list before handing over:

- [ ] **Semantics**: `<section>` via `SliceSection`; lists are `<ul>`/`<ol>` with
      `role="list"` when unstyled (Safari drops list semantics otherwise); cards are
      `<article>`; `<header>` for intro blocks.
- [ ] **Headings**: tag from the CMS on slice titles (`SliceTitle`); size from the
      type class. Mocks: one `<h1>` on the page title (`Hero`, `heading1`), other
      slice titles `heading2`. Do not skip levels in mocks. Key text titles keep
      their tag in JSX. Editors can change a title’s tag in the Page Builder —
      that is intended; do not lock `heading2` in the model to force a size.
- [ ] **Images**: `PrismicNextImage` with `sizes`; `alt` is authored in Prismic
      (`fallbackAlt=""` only marks a missing alt as decorative, it does not excuse
      informative images). Mocks always have an `alt`.
- [ ] **Links**: meaningful text (never "click here"); links inside rich text are
      underlined (`.prose a`); card-wide click targets keep the anchor on the title
      (see `StackedCards` / `CtaCards`).
- [ ] **Buttons vs links**: navigation = `<a>` (`PrismicNextLink`/`Button`);
      actions = `<button>`.
- [ ] **Contrast**: text ≥ 4.5:1, large text/UI ≥ 3:1 for every theme
      (`light`, `dark`, `brand`). Tokens are pre-checked; do not introduce new colors.
- [ ] **Focus**: never remove outlines; the global `:focus-visible` style applies.
      Custom controls must show focus.
- [ ] **Keyboard**: everything reachable and operable with Tab/Enter/Space; no
      hover-only content.
- [ ] **Motion**: respect `prefers-reduced-motion` (tokens already zero durations;
      `Animations` skips every GSAP animation, §3.8). Content visible without JS.
- [ ] **Language**: `<html lang>` is set from `site.lang`; content in another
      language gets `lang` on its element.
- [ ] **Target size**: interactive elements ≥ 24×24 CSS px.

---

## 8. Figma rule

- **One slice = one frame = one commit on `main`.** A single selected frame
  follows §3.5. Several selected frames, or several frame URLs, follow §3.5.1:
  one packet each, one batch brief, one go, then one commit each. Do not ask
  “which section?” when they already selected several. Do not expand one
  selected frame into its children, and do not build frames they did not
  select. A client without Cursor pastes the frame URLs in Slack (§11).
- Read each frame with `get_screenshot` and `get_metadata`. Call
  `get_variable_defs` once for the file. Call `get_design_context` only when
  metadata cannot answer a measurement. Map Figma variables to our tokens in
  `base.scss`; never copy raw hex values or pixel spacing into SCSS — pick the
  nearest token and note any mismatch in the human TODO. Outer vertical padding
  maps to `settings` (§3.4), not to slice SCSS.
- MCP does **not** know our 12-column grid. `get_metadata` is x/y/width/height.
  A leftover percentage from a design-context dump is a hint of one column, not
  a layout spec. When blocks look grid-aligned, **ask for a screenshot with the
  12-col layout grid on** before locking `col-lg-N` (see §3.5). Prefer that
  overlay over conflicting frame widths.
- Do not copy auto-layout properties into CSS. Measure child vs parent boxes
  (`get_metadata`) and the air between visual clusters, then map to tokens
  (§2.10, §4.4).
- Confirm the brief (name, verdict, **variations**, fields, grid classes) and wait
  for go before building (§3.5). A batch waits for **one** go (§3.5.1). After
  each build, screenshot `/dev/slices` and compare to that frame (§3.6), then
  give the human TODO (§3.5 step 14; combined at the end of a batch). The MCP
  is good at generating **new** code and bad at surgical edits. To change an
  existing slice, edit the code directly; do not regenerate it from Figma.
- Everything that is text, image or link in the frame becomes a Prismic field.
- Content images are the frame's own files at **2×** (§3.3): `download_assets`
  with `defaultScale: 2` (the original upload when it is already at least
  that wide). A PNG with transparency is exported as a transparent PNG. A
  rotated image is exported unrotated. Each file gets an `alt` in the mock,
  and that alt is written on the Prismic media library asset when the slice
  is filled.

### 8.1 Other sources: a live URL, a prototype's code, a screenshot

Designers increasingly iterate in Claude Code or a page builder and hand over
a **deployed URL** or a **code folder / repository** rather than a frame.
Those are accepted by `/new-slice` as references. The pipeline is the same
from the packet onward: **source → packet → guardian → brief → go → build**.
Only the first step changes. They iterate *before* handing over; the import
is a one-shot, a slice keeps no link to its source beyond a line in the
commit message (`from <url> (YYYY-MM-DD)` / `from <repo>@<sha>`).

**Live URL** (a site, a Vercel preview, a prototype):

- Open it in the browser tool at **1440×900**, then **390** (and 820 only if
  the tablet layout is distinct). 1440 is desktop; 390 is any width under
  `$bp-mobile` (480) — it is the check width, not the breakpoint
  (`src/styles/base/breakpoints.scss`). Screenshot each.
- Cut the page into sections: one top-level `<section>` / landmark / large
  vertical gap = one **candidate slice**. List them top to bottom in the
  brief with their screenshots; the user strikes or merges before go. Several
  sections follow the batch rules (§3.5.1). Never "rebuild the whole page" as
  one slice.
- Per section, read the DOM, not the stylesheet: `getBoundingClientRect` of
  the section, its direct children and the repeated items; `getComputedStyle`
  for font-size, line-height, weight, gap, padding, color, background,
  border-radius, grid-template-columns. Those are the **measured boxes** of
  §2.10 — already in px, with real breakpoints. Translate them by role
  (§2.11); do not write them into SCSS.
- Hover, focus and reduced-motion behaviour are observable: note them in the
  packet (and ask for reduced-motion if the source ignores it, §7).
- A third-party site is a **layout reference**: do not lift its copy, images
  or icons into mocks or code. Mocks get French placeholder content; images
  come from Prismic or Unsplash URLs.

**Code** (a path on disk, a pasted component, a git URL cloned to `/tmp`):

- Read it for two things: **content** and **layout**. Every hard-coded
  string, image, link becomes a candidate field; every repeated block becomes
  a group; a conditional becomes a boolean or a variation. The brief asks
  "editable or fixed?" for anything ambiguous — a source gives no hint of
  what the editor should own.
- Layout classes are measurements: Tailwind utilities (`grid-cols-3`,
  `py-24`, `max-w-5xl`, `text-sm`) resolve to px, then translate by role
  (§2.11). Component libraries (shadcn, MUI) are **not** reproduced: the
  rendered box is.
- To get the screenshot, render the component standalone (a scratch page
  outside `src/`, or the prototype's own dev server) at 1440 and 390, then
  proceed as for a URL. Delete the scratch page.
- Never import the source's CSS, Tailwind config, fonts or components into
  this repo. The slice is written from scratch in our shell (§3.1, §4).
- **Assets.** Content images (photos, logos, portraits, editor-chosen icons)
  are Image fields: read the prototype only for the **format** and put it in
  the label/placeholder ("16:9, min 1200 px wide"); real files go in the
  Prismic media library at CMS time. Structural SVGs that belong to the
  design (chevron, arrow, decorative shape) are re-inlined in the component.
  Hosted prototype images may serve as `mocks.json` URLs; local files are
  not copied into the repo. Fonts never.

**Designer skill.** `examples/maestro-design/` is a Claude Code skill to send
to designers who prototype (README inside). It teaches them the scales, the
section = slice structure, what becomes editable, and a markup convention:
`data-slice`, `data-variation`, `data-field`, `data-group`, `data-fixed`.
When a source carries those attributes or our token names / type classes,
read them as already-translated intent; measure only the rest. Its `base/`
folder is a copy of `src/styles/base/` — re-copy and resend after a token
change.

**Screenshot only**: the degraded mode. Measure relative proportions on the
image, ask for the viewport width, and say in the brief which values are
estimates. Prefer asking for the URL or the Figma file.

Whatever the source, the brief looks the same (name, verdict, variations,
fields, grid classes, mock padding), the build is the same (§3.5.2) and the
check is the same localhost PNG at 1440 — compared to the source screenshot
instead of a Figma frame (§3.6).

---

## 9. Bootstrap checklist (new project from the template)

Mechanical steps are a **script**, not an AI task.

1. GitHub → "Use this template" → new repository. Clone it.
2. `npm install`
3. `npm run setup` (`scripts/init.mjs`): asks for the project name and the Prismic
   repository name; rewrites `package.json`, `README.md`, `src/lib/site.js`,
   `prismic.config.json`; creates `.env.local` from `.env.local.example`; removes
   itself and the `setup` script.
4. Manual, needs a Prismic account:
   - `npx prismic login`
   - Create the Prismic repository **from the dashboard** so you choose the
     domain (`<domain>.prismic.io`). `npx prismic repo create` works but
     assigns a random domain. The display name is cosmetic; only the domain
     matters to the code. Do not try to "duplicate" the template's repository:
     the models live in this codebase and the next step pushes them.
   - `npm run prismic:connect -- <domain> --push --preview`
     (`scripts/prismic-connect.mjs`): writes `repositoryName` in
     `prismic.config.json`, shows `prismic status`, pushes `customtypes/` and
     `src/slices/*/model.json`, registers the Development preview and the
     simulator. It refuses to push when the remote has models the code does
     not (that would delete them) — decide by hand with `npx prismic push
     --force` or connect to a fresh repository.
     **Push first.** `npx prismic init` and `npx prismic pull` treat the remote
     as the source of truth: on an empty repository they would delete the
     template's local models.
   - Re-pointing an existing project later is the same command without
     `--push`; then `npx prismic status` tells you what differs.
5. **Choose the motion** (§3.8). Ask once: titles (`split-words` or none), panel
   (`parallax-enter`, `parallax-exit`, or none). Edit `src/animations.config.js`.
   Default = none.
6. In the Page Builder: create and publish a **Homepage** document. `npm run dev`
   → `/` renders it; `/dev/slices` renders the mocks. Create the **Settings**
   document too (SEO defaults, favicon + Apple touch icon + theme color; the
   client fills Custom code and Redirects later, §5).
7. Later, for production: follow **§12** (Vercel, domains, Prismic previews and
   webhooks). Set `PRISMIC_ACCESS_TOKEN` only if the API is private.

Troubleshooting `push`: run `npx prismic status` first; uncommitted changes to
model files block push/pull; `--repo` targets an environment; conflicts mean the
remote was edited in the Type Builder → `npx prismic pull` on a clean working
tree and reconcile.

---

## 10. Anti-patterns (never do this)

- Creating `tsconfig.json` or `.ts`/`.tsx` files.
- Hard-coded colors, spacing, font sizes or breakpoints in SCSS.
- Hard-coded copy, images or URLs in a slice instead of Prismic fields.
- Editing `model.json` / `customtypes/*.json` by hand (except the scaffold
  writing `settings` and `--fields`, and the cases in §3.2) or editing generated
  files (`src/slices/index.js`, `prismicio-types.d.ts`). Adding content fields
  with one `npx prismic field add` per field on a new slice, or adding the
  `settings` group with five sequential `field add` commands, instead of
  `npm run slice:scaffold -- <Name> --fields <file.json>`.
- Adding slice styles to `globals.scss` or `src/styles/base/`.
- Global selectors, `!important`, inline styles, CSS Modules.
- Removing focus outlines; `alt` omitted; heading levels chosen for size instead
  of structure (use type classes for size; `SliceTitle` for slice titles).
- `"use client"` on a whole slice for a small interactive detail.
- Fetching documents from a client component or an API route; copying the
  target type's fields onto a slice that lists it; mixing a relation group and
  a query in one variation (§3.7).
- Skipping `npx prismic push` and `git push origin main` after a single slice,
  or after the last commit of a batch (the Page Builder will not show the new
  slices). Pushing on every slice inside a batch.
- Calling `publishMigrationRelease()` or publishing the Migration Release from
  the agent. The human publishes after review.
- Filling a page, creating a document, or uploading media without asking
  whether to add it and on which document (§3.5). A bare "go" is not that
  answer. In Slack the thread's document (or the homepage) is the answer.
- Exporting a Figma image at scale 1, as a flattened JPEG when the source is
  a transparent PNG, or as the tilted render of a rotated node so the file
  is cropped (§3.3). Uploading an image to the media library with no `alt`.
- Regenerating an existing slice from Figma instead of editing it.
- Building a slice before the brief is confirmed (no go), or finishing a build
  without the human TODO (§3.5 step 14). A batch still needs that one go.
- Spawning guardian + `dev-slice` + reviewer for a one-frame slice whose NEW
  SLICE verdict is obvious (`SKILL.md` §3.5.2). Spawning `reviewer` for every
  slice in a batch. Calling `get_design_context` on every frame. Re-fetching
  Figma, re-reading `SKILL.md` cover to cover, re-running `next build`, or
  recapturing `/dev/slices` in every subagent.
- Building a batch inside the main working tree, or running more than three
  slice builds at once. Leaving a `.worktrees/` directory after the slice has
  landed. Creating a `feat/slice-*` branch or opening a pull request. Putting
  several new slices in one commit. Waiting for a second go between slices of
  an approved batch. Asking “which section?” when the user selected several
  frames. Splitting one selected frame into its inner layers, or building a
  frame that was not selected.
- Using a leftover Figma title (`Frame 44`) or a page name as the slice name.
- Guessing column spans from MCP pixel widths when a grid screenshot is missing
  and the numbers disagree.
- Dropping a briefed `col-lg-N` (or stretching a block to `100%`) when adding
  `.container--large`, an inner panel, or extra padding. Re-check 1440 vs Figma.
- Centering a lockup with `ml-N-col` (Hero-style 8-col in the middle). Use
  `row justify-center` + `col col-lg-N col-md-12`. Offsets are for asymmetric
  inset only; `ml`/`mr` do not reset at tablet.
- Shipping or skipping layout variations without asking, when the frame only
  shows one orientation.
- Full-bleed media with an inner `.container` that is not `.container--raised`
  (card under the photo).
- Copying Figma auto-layout `gap` / corner pins into CSS when nodes are
  out-of-flow. Measure visual boxes (§4.4); confirm with the screenshot (§3.6).
- Shipping a slice after “checking `/dev/slices`” without reading a localhost
  PNG against the Figma screenshot (§3.6). Do not add Playwright, Percy, or a
  pixel-diff for this.
- Enabling an animation by default (a role set in `animations.config.js` that
  the user did not choose), or animating from inside a slice or a slice's own
  `"use client"` component instead of adding an animation to the registry (§3.8).
  Adding `"use client"` to `SliceTitle` or `SliceSection`. Emitting
  `data-animate` by hand: use `animate()`, so the hidden-until-ready CSS never
  hides content nothing will reveal.
- Relying on the `section` tag for positioning or background. The shell is
  `.slice-section` (§4.4); a footer or header rendered with `as=` needs it.
- Extending the MVP scope (new animations beyond the registry, SEO agents,
  header/footer) without being asked.

---

## 11. Client workflow (Slack)

The client never opens Cursor. They paste one or several **frame** URLs and
instructions in Slack. An agency process runs `npm run slack`
(`scripts/slack-maestro.mjs`): Socket Mode → Cursor cloud agent on this repo →
same `/new-slice` rules, including the batch path (§3.5.1) and the speed path
(§3.5.2).

```
Client (Slack) → brief + go → one commit per slice on main
                 → one npx prismic push → npm run prismic:fill per slice
                 → Migration Release (draft) → human publishes
```

### Slack app (once per agency)

1. api.slack.com → Create app → **Socket Mode** on. Generate an **App-Level Token**
   (`connections:write`) → `SLACK_APP_TOKEN`.
2. OAuth scopes (Bot): `app_mentions:read`, `chat:write`, `commands`,
   `channels:history`, `groups:history`. Install → `SLACK_BOT_TOKEN`.
3. Event Subscriptions: `app_mention`, `message.channels`, `message.groups`.
4. Slash command `/slice` (optional) → Request URL can be placeholder; Socket Mode
   delivers it.
5. Invite the bot to the client channel. Share the Figma file with the **agency**
   Figma account used by the Cursor cloud agent's Figma MCP (dashboard, not in-repo).

### Env

See `.env.local.example`. Then:

```sh
npm run slack
```

Mention `@Maestro` (or `/slice`) with a Figma link. Follow-ups stay in the **thread**.
Thread → agent id is stored in `.maestro-slack.json` (gitignored).

The agent posts the brief in Slack and **waits for go**. The brief asks which
document to fill (homepage if they do not name one). After a single slice it
commits on `main`, pushes models, and runs
`npm run prismic:fill -- --slice <Name>` on that document. After a batch it
commits each slice, pushes once, then fills each built slice. Images follow
§3.3 (Figma file at 2×, PNG kept, unrotated, alt on the asset). It never opens
a pull request and never publishes the release.

### Connect checklist (once, then keep)

**Agency (you)**

- [ ] Slack app above + `npm run slack` running while clients work
- [ ] Cursor GitHub App (once, account-level — not a repo env var):
      [cursor.com/dashboard/integrations](https://cursor.com/dashboard/integrations) →
      **Connect** GitHub → allow **this** repo (or all). Same GitHub user as the
      API key, with write access so the cloud agent can push to `main`.
- [ ] `.env.local` (machine that runs `npm run slack`, never Vercel):
      `CURSOR_API_KEY` from [cursor.com/dashboard/api](https://cursor.com/dashboard/api);
      `CURSOR_CLOUD_REPO` = the HTTPS GitHub URL of this repo
      (e.g. `https://github.com/MaelRuffini/maetro-boilerplate`).
      `CURSOR_CLOUD_REF=main`.
- [ ] Figma MCP on the **agency** Figma account (dashboard / Cursor settings,
      not in-repo). The client never installs Cursor.
- [ ] Prismic: write token in `.env.local` only (never Vercel)
- [ ] Figma file shared with that agency account (can view the frames they paste)

**Client (they never open Cursor)**

- [ ] Slack: workspace + channel with the bot invited; they `@mention` with a
      Figma URL (one frame, or several frame URLs)
- [ ] Figma: they own the file; share a **link with view** (or invite the agency
      Figma user)
- [ ] Prismic: Editor (or Publisher) on the repo — Page Builder, Preview, publish
      the Migration Release. Not a Writer-only if they must publish.
- [ ] Browser: Vercel production URL you send them. No GitHub merge rights required.

**Do not put on Vercel** (marketing site): `PRISMIC_WRITE_TOKEN`, Slack tokens,
`CURSOR_API_KEY`. Those stay on the machine that runs `npm run slack`.

### Fill script (also from Cursor)

```sh
npm run prismic:fill -- --slice Cover
npm run prismic:fill -- --slice Cover --variation cardRight
npm run prismic:fill -- --slice Cover --document page --uid about
```

Needs `PRISMIC_WRITE_TOKEN`. Appends `mocks.json` (or `--from-stdin` JSON) onto the
page. Images are downloaded and uploaded with `createAsset`: the filename
extension follows the file bytes (a PNG stays `.png`, transparency included),
and the mock `alt` is stored on the media library asset. An image field
without an `alt` property is refused. Review the Migration Release in Prismic,
then publish by hand.

In Cursor, do not run this until the user has said yes and named the document
(§3.5). Slack runs it after the push, onto the document named in the thread.

---

## 12. Go-live (Vercel) — once per site, by the developer

Two layers. Do not mix them:

| Layer       | What                        | Where the client looks                          |
| ----------- | --------------------------- | ----------------------------------------------- |
| **Code**    | Next.js on `main`           | Vercel Production                               |
| **Content** | Prismic drafts vs published | Prismic **Preview** cookie on the production URL |

`/dev/slices` is `notFound()` when `NODE_ENV === production`. Vercel builds are
production: the mocks gallery stays on localhost. Review new slices on a real
page (fill + Preview), not on `/dev/slices` online. Slice commits on `main`
deploy to production.

### Sites you actually need

1. **Production** — `main` → `www.client.com` (and apex if you want).
2. **Staging (optional)** — a **stable** URL such as `staging.client.com`
   assigned to a `staging` git branch, only if you need a second Prismic Preview
   target. Skip it if Preview on production is enough.

You do **not** need a second Prismic repository. Drafts are unpublished documents
in the same repo; Preview shows them, the public site does not.

You do **not** host the Slack bot on this Vercel project.

### Developer checklist (tick once)

**GitHub**

- [ ] Repo exists (from the template). `main` is the production branch.
- [ ] Agents can **push to `main`**. Do not require pull requests for slice work.
- [ ] **Two separate GitHub Apps** (pushing to GitHub is not enough):
      - Cursor: Integrations → Connect GitHub → this repo (needed for Slack cloud
        agents). `CURSOR_CLOUD_REPO` in `.env.local` is only the URL string.
      - Vercel: Import Project → pick this repo (needed for the live site).

**Vercel**

- [ ] Import the GitHub repo. Framework: Next.js. Root: repo root. Node: 22.x
      if asked.
- [ ] Production branch: `main`.
- [ ] Env (Production **and** Preview): nothing, if the Prismic API is public;
      `PRISMIC_ACCESS_TOKEN` only if the API is private;
      `NEXT_PUBLIC_PRISMIC_ENVIRONMENT` only if you use a Prismic environment
      instead of the production repo;
      `NEXT_PUBLIC_SITE_URL` (`https://www.client.com`) only when the canonical
      host should not be Vercel's production domain. Sitemap and robots use
      that origin.
- [ ] **Never** set on this project: `PRISMIC_WRITE_TOKEN`, `SLACK_*`,
      `CURSOR_API_KEY`.
- [ ] Domain: `www.client.com` (and apex) → Production.
- [ ] Optional: git branch `staging` + domain `staging.client.com` → that branch.
- [ ] Smoke: push to `main` → production URL renders the homepage.
      `/dev/slices` is 404 (expected).

**Prismic (after the production URL exists)**

- [ ] Preview already: `http://localhost:3000/api/preview` (Development).
- [ ] `npx prismic preview add https://www.client.com/api/preview --name Production`
- [ ] If staging exists:
      `npx prismic preview add https://staging.client.com/api/preview --name Staging`
- [ ] Webhook to **each** live Next.js origin (not localhost):

```sh
npx prismic webhook create https://www.client.com/api/revalidate \
  --trigger documentsPublished --trigger documentsUnpublished
# same for staging.client.com if you have it
```

- [ ] **Redirects need a build**, not a revalidation (§5). Vercel → Project →
      Settings → Git → Deploy Hooks → create one for `main`, then a second
      Prismic webhook to that URL (`npx prismic webhook create <deploy-hook-url>
      --trigger documentsPublished`). Every publish redeploys; fine for a
      marketing site. Skip it if the client never edits redirects.
- [ ] Smoke: edit a published doc → save/publish → production updates without a
      redeploy. Open Preview on a draft → the matching site shows the draft;
      a private window without the cookie still shows published content.
      Settings → Custom code: paste a tag, Preview, check it fires, publish.

**DNS / client**

- [ ] Client (or you) points DNS: `www` and apex to Vercel; optional `staging`.
- [ ] Send the client: production URL, optional staging, Prismic repo URL.
