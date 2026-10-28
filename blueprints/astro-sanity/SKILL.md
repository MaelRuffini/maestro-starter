---
name: maestro-astro
description: Conventions for building Astro + Sanity marketing websites from the Maestro Astro boilerplate. Load whenever working on slices, pages, styles, content schemas, or the Sanity project. Covers architecture, the slice workflow, CSS tokens, accessibility, and bootstrap.
---

# Maestro Astro — Astro 7 + Sanity boilerplate skill

GitHub **template** for marketing websites, operated by AI agents on **`main`**.
Same product idea as Maestro (Next.js + Prismic): Figma frame → `/new-slice` →
commit on `main` → human CMS TODO.

CSS, a11y, Figma measurement, animations, Slack and anti-patterns that are
**not** CMS-specific are **identical** to the original Maestro `SKILL.md`
§4, §7, §8, §3.8, §10, §11. When this file is extracted into its own repo,
**copy those sections in full** from Maestro (replace “Prismic” with
“Sanity”, `index.jsx` with `index.astro`, port `3000` with `4321`). Until
then, read them from the sibling Maestro repo.

This document is the **delta** plus the slice / schema / page architecture
that actually change.

For Sanity mechanics (GROQ, Presentation, image URLs, Portable Text) rely on
the official Sanity docs and `npx sanity docs`. Our conventions win when
stricter.

---

## 1. Stack

| Concern | Choice | Notes |
| --- | --- | --- |
| Framework | **Astro 7**, `output: "server"` | Visual Editing needs per-request cookies. Adapter `@astrojs/vercel`. |
| Language | **JavaScript only** | `jsconfig.json` `@/*` → `src/*`. **Never create `tsconfig.json`.** Schemas in `.js`. |
| CMS | Sanity, schema-as-code | Studio at `/studio`. Models live in `src/slices/<Name>/schema.js` + `schema/documents/`. |
| Rendering | `.astro` slices + `PageBuilder.astro` | React only for islands (`Animations`, `SmoothScroll`, `VideoPlayer`, VisualEditing). |
| Data | `@sanity/client` + `groq` via `loadQuery` | Published by default; draft cookie → `previewDrafts`. |
| Images | `@sanity/image-url` + `SanityImage.astro` | `sizes` required; `alt` is a schema field. |
| Rich text | `@portabletext/astro` | Titles: `titlePortable` (h1–h6 only). Body: `Prose`. |
| Styles | Sass, BEM, tokens | Same files as Maestro `src/styles/base/`. |
| Package manager | npm | |
| Hosting | Vercel | |
| Animation | GSAP + Lenis, **off until picked** | Same `animations.config.js` / registry. |
| Local ports | **4321**; batch 4331–4333 | |

---

## 2. Architecture principles

Same as Maestro §2, with three substitutions:

1. The slice folder is `index.astro` + `schema.js` + `<name>.scss` + `mocks.json`.
8. **Models live in the repo and ship on `main`.** After a slice, **commit
   then `git push origin main`**. There is no `sanity push` for schemas: the
   Studio reads the code. Uncommitted schema files mean the Studio (local)
   has them and production does not. Never `client.publish()` from an agent.
11. Same Figma → tokens rule (Maestro §2.10–2.11).

---

## 3. Anatomy of a slice

```
src/slices/Hero/
├── index.astro   # Astro component, default, receives Astro.props.slice
├── schema.js     # Sanity object type, name = camelCase slice id (hero)
├── hero.scss     # BEM, block = kebab-case name, imported in the frontmatter
└── mocks.json    # Array of slice objects, one per variation, Sanity shape
```

`src/slices/index.js` maps `_type` → component. The scaffold appends. Do not
hand-register in `PageBuilder.astro`.

`schema/index.js` imports every slice schema. The scaffold appends.

Reference slices: `examples/slices/<Name>/` — not in the Studio, not in
`/dev/slices`. `--from <Example>` copies component + SCSS.

### 3.1 Component rules (`index.astro`)

Every slice is wrapped in `SliceSection`:

```
<section data-slice-type="…" class="slice-section [.u-theme-*]">
  <div class="container">
    <div class="<block>__wrapper [.u-pt-*] [.u-pb-*]">
      …slice content…
    </div>
  </div>
</section>
```

```astro
<SliceSection slice={slice} wrapperClass="hero__wrapper">
  …content…
</SliceSection>
```

Full-bleed media: slot `background` so the panel tween can move it.

Shared components (do not duplicate inside a slice):

- **SliceSection** — required. Theme on `<section>`, padding on wrapper.
- **Button** — `<Button link={slice.cta} />`. Maps `variant`.
- **SliceTitle** — `<SliceTitle field={slice.title} class="hero__title h2" />`.
  Tag from the first Portable Text block style; class is the size. Hero:
  `fallbackTag="h1"`. Stays a server `.astro` file. Motion = `title` role
  of `animations.config.js`.
- **Prose** — editorial body.
- **SanityImage** — `sizes` + `alt`. `priority` (fetchpriority=high) above
  the fold only.
- **VideoPlayer** — island. Source is a **url** field (hosted elsewhere).
- **GridOverlay / Animations / SmoothScroll** — mounted in `Layout.astro`.

Then:

- No `client:` on `index.astro`. Isolate interactivity in a child island.
- Guard optional fields with `isFilled.*` (`src/lib/filled.js`).
- Variations: `slice.variation`; BEM modifier on the section
  (`class="fifty-fifty--image-right"`).
- Imitate the closest **live** slice; else `examples/slices/` via `--from`.

### 3.2 Schema rules (`schema.js`)

New slices start with:

```sh
npm run slice:scaffold -- <Name> --fields <file.json>
```

The fields file is a JSON array, **not committed**, same ids as Maestro:

```json
[
  { "id": "title", "type": "rich-text", "label": "Title", "single": ["heading1", "heading2", "heading3", "heading4", "heading5", "heading6"] },
  { "id": "description", "type": "rich-text", "label": "Description", "allow": ["paragraph", "strong", "em", "hyperlink"] },
  { "id": "video", "type": "link", "label": "Background video", "allow": ["web"] },
  { "id": "background_image", "type": "image", "label": "Background image" },
  { "id": "cta", "type": "link", "label": "Call to action", "allowText": true, "variants": ["Primary", "Secondary", "Outline"] },
  { "id": "questions", "type": "group", "label": "Questions", "fields": [
    { "id": "question", "type": "text", "label": "Question" },
    { "id": "answer", "type": "rich-text", "label": "Answer", "allow": ["paragraph", "strong", "em", "hyperlink", "list-item"] }
  ]}
]
```

The scaffold translates that JSON into `defineType` / `defineField` (see
`MAPPING.md`). It always prepends `settings` (`type: "sliceSettings"`)
unless `--no-settings`.

Rules:

- Field ids `camelCase` in Sanity (`paddingTop` is **wrong** — keep
  `snake_case` ids like Maestro: `padding_top`, `background_image`). Sanity
  allows it; the CSS/JS stays portable and mocks stay readable.
- Labels: human-readable English.
- Videos = `url`, never a Sanity `file` or `mux`.
- Full-bleed: Background video (`url`) + Background image (`image`).
- Slice titles = `titlePortable` (h1–h6 only). Body lists only the marks
  the design needs.
- Repeatable lists = `array` of objects. No leftover Prismic `items`.
- Prefer a `variation` string list over a new slice when only layout
  changes.
- Do not invent fields by hand in `schema.js` on a **new** slice: the
  scaffold writes them. Extending an existing slice: edit `schema.js`, then
  `slice:check`.

The object type `name` is the slice id (`hero`, `ctaCards`). `title` is
the human name (`Hero`, `CTA cards`). Preview: `select: { title: 'title' }`
plus a subtitle from `variation`.

### 3.3 Mocks (`mocks.json`)

Array of slice objects, **Sanity shape**:

```json
[
  {
    "_type": "hero",
    "_key": "mock-default",
    "variation": "default",
    "settings": {
      "padding_top": "Main (128px)",
      "padding_bottom": "Main (128px)",
      "theme": "Dark",
      "panel_animation": false
    },
    "title": [{ "_type": "block", "style": "h1", "children": [{ "_type": "span", "text": "…" }] }],
    "background_image": { "_type": "image", "alt": "…", "asset": { "_ref": "https://images.unsplash.com/…" } }
  }
]
```

Realistic **French** content, every field filled. Image URLs: Unsplash or
Sanity CDN. Video: a hosted mp4 URL string.

`/dev/slices` is dev-only. Slices that query other documents add
`fixtures: { "article": [ … ] }` like Maestro §3.3.

**Do not** use Prismic mock shape (`slice_type`, `primary`, `items`,
`link_type: "Web"`).

### 3.4 The `settings` object

Shared type `sliceSettings` (`schema/objects/sliceSettings.js`). First
field of every slice. Same options as Maestro:

- `padding_top` / `padding_bottom` — None, Small (64px), Main (128px),
  Large (160px), Page top (184px). Default **Main (128px)**.
- `theme` — Inherit, Light, Dark, Brand. Default Inherit.
- `panel_animation` — boolean, default false.

`SliceSection` maps them to `.u-pt-*`, `.u-pb-*`, `.u-theme-*`. Outer
vertical padding of a Figma frame = settings, never slice SCSS. Inner gaps
= `--size-*`. See Maestro §3.4 for the panel parallax table (unchanged).

### 3.5 Slice workflow (`/new-slice`)

**Share → questions → go → build → human TODO.** Same as Maestro §3.5,
including batch §3.5.1 and speed §3.5.2, with these substitutions:

- After a **single** slice: commit on `main`, then **`git push origin
  main`**. No schema push.
- After a **batch**: commit each slice as it lands; **one** `git push
  origin main` at the end. No `npx prismic push`.
- Scaffold: `npm run slice:scaffold -- <Name> --fields <file.json>`.
- Screenshot: `http://localhost:4321/dev/slices?slice=<Name>` (worktrees:
  4331–4333). Chrome headless snippet: same as Maestro §3.6, change the
  port.
- Fill (if asked, or Slack): `npm run sanity:fill -- --slice <Name>`.
  Creates a **draft**. Human publishes in the Studio.
- Human TODO — drop any “push the model to Prismic” line. Typical:

  ```
  ## À finaliser
  - [ ] Relire /dev/slices?slice=<name> (1440 / 820 / 390)
  - [ ] Studio : ajouter le slice, remplir textes / images (alt) / liens,
        choisir le heading, régler padding / thème, publier
  - [ ] Contrôler la page publiée contre le frame
  ```

  If fill ran:

  ```
  ## À finaliser
  - [ ] Relire /dev/slices?slice=<name>
  - [ ] Relire le draft dans Sanity, puis publier
  - [ ] Contrôler la page publiée contre le frame
  ```

Worktrees: `git worktree add --detach .worktrees/<slice_id> HEAD`, symlink
`node_modules` and `.env`. Ports 4331–4333. Land with
`npm run slice:land -- --name <Name> --from .worktrees/<slice_id>`.

Parent builds a single simple in-flow NEW SLICE. Batch always uses
`dev-slice`. Reviewer only for custom motion or a non-token color.

### 3.6 Localhost screenshot vs Figma

Maestro §3.6, port **4321** (or the worktree port). Path
`/dev/slices?slice=<Name>`.

### 3.7 Slices that read other documents

Same question: *who decides the list?*

| Who | Mechanism | Schema | Component |
| --- | --- | --- | --- |
| Editor, by hand | `reference` (or array of references) | `type: "reference", to: [{ type: "article" }]` | Read the expanded projection in GROQ (`link->`) |
| Nobody — automatic | Query at render | Only controls (`select` sort, `number` limit) | Frontmatter calls `getCollection(type, { … })` |

One variation = one mechanism. Do not mix. Recipes (`article`,
`testimonial`) install the target type first.

- Query in the `.astro` frontmatter (server). Never fetch in an island.
- `getCollection` uses `loadQuery`. Pass `exclude: "current"` from the
  page document id.
- Empty → `return` nothing (`null` equivalent: don’t render the section).
- Cards link with `resolveHref(doc)` (`src/lib/links.js`).
- Fixtures in mocks for the gallery.

GROQ for a page (assembled in `src/lib/queries.js`): the pageBuilder
projection includes per-type expansions. A slice that needs extra data
either (a) declares it in the shared query or (b) fetches in its own
frontmatter. Prefer (b) for collection slices so the homepage query stays
small.

### 3.8 Animations

Copy Maestro §3.8. Mount `Animations` and `SmoothScroll` in
`Layout.astro` with `client:load`. `SliceTitle` / `SliceSection` stay
`.astro` without client directives. `animate(role)` still emits
`data-animate`.

---

## 4. CSS convention

**Copy Maestro SKILL.md §4 in full** when extracting. Stylelint
(`stylelint.config.mjs`) is copied as-is. `slice:check` is rewritten for
`.astro` + `schema.js` but enforces the same rules.

Imports: `src/styles/global.scss` (layout) and colocated `<name>.scss`
from the slice frontmatter (`import './hero.scss'`).

`astro.config.mjs` `vite.css.preprocessorOptions.scss.loadPaths` includes
`src/styles`, so `@use 'base/breakpoints' as *;` still works.

---

## 5. Page architecture

```
src/layouts/Layout.astro           # fonts, skip link, main, VisualEditing, islands
src/pages/index.astro              # homepage singleton
src/pages/[...uid].astro           # page by slug
src/pages/404.astro
src/pages/sitemap.xml.js
src/pages/robots.txt.js
src/pages/dev/slices.astro         # mocks gallery, 404 in production
src/pages/studio/[...tool].astro   # embedded Studio
src/pages/api/draft-mode/{enable,disable}.js
src/pages/api/revalidate.js
src/lib/sanity.js                  # client
src/lib/load-query.js              # published vs draft
src/lib/links.js                   # resolveHref, route table
src/lib/collection.js
src/lib/site.js
schema/documents/{homepage,page,settings}.js
examples/recipes/<name>/
sanity.config.js                   # structure + presentationTool
```

- New page types: add `schema/documents/<type>.js`, a route in
  `src/pages/`, an entry in `src/lib/links.js` and
  `presentationTool.resolve`. Connect slices via the document’s `slices`
  array `of`.
- Recipes: `npm run type:install -- <name>`. Same idea as Maestro.
- Settings singleton: `getSettings()`, id `settings`. Tabs Main / Icons /
  Custom code / Redirects. Redirects are **build-time**
  (`astro.config.mjs`). Custom code: never add analytics in the repo.
- Sitemap: published docs that resolve a URL. `settings` and types without
  a route stay out. Canonical origin: `PUBLIC_SITE_URL`, else Vercel, else
  `http://localhost:4321`.
- Global chrome (header/footer) is **not** in the template yet. When
  added, model it on `settings` and render it in `Layout.astro`.

---

## 6. Content doctrine

Copy Maestro §6. “model.json” → `schema.js`. “CLI field add” → edit
`schema.js` of an **existing** slice, then `slice:check`.

---

## 7. Accessibility

Copy Maestro §7. `PrismicNextImage` → `SanityImage`. `PrismicNextLink` →
`resolveHref` + `<a>` / `Button`. Alt is a **real schema field**, not an
image asset metadata afterthought: the Studio must show `alt` next to
every image.

---

## 8. Figma rule

Copy Maestro §8 and §8.1. “Prismic field” → “Sanity field”. Screenshot
path uses port 4321.

---

## 9. Bootstrap checklist (new project from the template)

1. GitHub → Use this template → clone.
2. `npm install`
3. `npm run setup` — project name, Sanity project id, dataset. Rewrites
   identity files, writes `.env`, deletes itself.
4. Manual, needs a Sanity account:
   - Log in (`npx sanity login`)
   - Create the Sanity project **from the dashboard** (you pick the id).
   - `npm run sanity:connect -- <projectId> <dataset>`
     Writes env, prints CORS instructions
     (`http://localhost:4321`, Allow credentials), does **not** overwrite
     local schemas.
   - Re-pointing later: same command.
5. Choose the motion (Maestro §3.8). Default = none.
6. Studio `/studio`: create and publish **Homepage** and **Settings**.
   `npm run dev` → `/` renders; `/dev/slices` is empty on a fresh project.
7. Production: §12.

---

## 10. Anti-patterns

All of Maestro §10 that still apply, plus:

- Creating `tsconfig.json` or Sanity schemas in `.ts`.
- Prismic mock shape in `mocks.json`.
- A second copy of slice fields in `schema/documents/`.
- `client:load` on `index.astro`, `SliceTitle`, or `SliceSection`.
- `client.publish()` / writing `published` from `sanity:fill` or the agent.
- Adding a slice to the Studio insert menu by hand instead of the scaffold.
- Enabling Visual Editing in production without a draft-only preview URL.
- Putting `SANITY_API_WRITE_TOKEN` on Vercel.
- Fetching GROQ from a React island.

---

## 11. Client workflow (Slack)

Copy Maestro §11. Replace `prismic:fill` with `sanity:fill`, “Migration
Release” with “Sanity draft”, “Page Builder” with “Studio”. The client
still never opens Cursor. The agent still never publishes.

---

## 12. Go-live (Vercel) — once per site

Two layers. Do not mix them:

| Layer | What | Where the client looks |
| --- | --- | --- |
| **Code** | Astro on `main` | Vercel Production |
| **Content** | Sanity drafts vs published | Presentation (preview) vs public site |

`/dev/slices` is 404 when `PROD`. `/studio` is the Studio (Sanity login).

**Vercel env (Production and Preview):**

- `PUBLIC_SANITY_PROJECT_ID`
- `PUBLIC_SANITY_DATASET`
- `PUBLIC_SITE_URL` (`https://www.client.com`)
- `SANITY_API_READ_TOKEN` — only on the **preview** deploy used by
  Presentation, not required for a public dataset’s published content
- `SANITY_REVALIDATE_SECRET`
- **Never:** `SANITY_API_WRITE_TOKEN`, Slack tokens, `CURSOR_API_KEY`

**Sanity (after the production URL exists):**

- CORS: production origin + credentials
- Presentation: Production preview URL
- Webhook → `https://www.client.com/api/revalidate` on publish/unpublish
- Optional deploy hook for redirects (same as Maestro)

Smoke: edit + publish → production updates without a full “did we push
schema?” question (schema only changes when code deploys). Open
Presentation on a draft → iframe shows the draft; a private window shows
published.
