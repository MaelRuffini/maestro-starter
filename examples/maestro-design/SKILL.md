---
name: maestro-design
description: Design rules for prototyping website sections that will be rebuilt on the Maestro stack (Next.js + Prismic). Load whenever designing, prototyping or iterating on a landing page, a marketing site, a section, a hero, a grid, cards, a FAQ, testimonials, or any web UI meant to be handed over to the Maestro development team. Covers the design system (spacing, type, colors, grid, breakpoints), the "one section = one slice" structure, what becomes editable in the CMS, accessibility, and the handover format.
---

# Maestro — design rules for prototypes

You are helping a designer prototype a website. The prototype will **not** be
shipped: a development team rebuilds every section on their own stack (Next.js,
Prismic CMS, their CSS system). Your job is to make that rebuild **boring**:
same vocabulary, same structure, clear intent. Nothing here limits what the
design can look like; it limits how it is *described*.

**Values live in `base/`** next to this file (`base.scss`, `typography.scss`,
`grid.scss`, `breakpoints.scss`, `utilities.scss`, `sizes.scss`). They are a
copy of the project's real design tokens. **Read `base/base.scss` and
`base/typography.scss` before writing any CSS**, and use their names and
values. If the designer changes a value, note it in `handover.md` (see
"Changing the system") — do not silently invent one.

Use any tool you like (plain HTML + CSS, React, Vite, Tailwind). The rules are
about naming and structure, not tooling.

---

## 1. One section = one slice

The site is a stack of **sections**. Each section is an independent block the
team will build once and the client will reuse on any page through the CMS.

- Design pages as a **vertical stack of sections**. Each section is a
  top-level `<section>` in the markup, with a short PascalCase name describing
  the *pattern*, not the page or the content: `Hero`, `FiftyFifty`, `Grid`,
  `CtaCards`, `Faq`, `Testimonials`, `Articles`, `Marquee`. Not `HomeBloc3`,
  not `Frame 44`, not `AboutUsTeam`.
- Each section has exactly three layers:

  ```html
  <section data-slice="Grid">            <!-- full width, carries theme + outer padding -->
    <div class="container">              <!-- max 1280px, side padding 48px (16px at ≤480) -->
      <div class="grid__wrapper">…</div> <!-- the section's own layout -->
    </div>
  </section>
  ```

  Full-bleed media (a hero image edge to edge) is still inside the `section`,
  with the content in a `container` above it.
- **Outer vertical padding is not free-form.** A section's top and bottom
  padding come from a fixed scale the editor picks in the CMS:
  `None · Small (64px) · Main (128px) · Large (160px) · Page top (184px)`.
  Pick one per edge. Do not design 96px or 40px of section padding.
- **Theme is per section**: `Light` (white background, dark text), `Dark`,
  `Brand`, or `Inherit`. A section is one theme. A dark *card* inside a light
  section is fine (that is a panel, not a section theme).
- If the same section appears twice with a different layout (image left vs
  right, 2 vs 3 columns), that is one slice with a **variation**, not two
  designs. Name the variations.
- Do not design the same content pattern twice with different looks. Three
  "card grids" that differ only in padding and radius will become one.

## 2. Spacing — the scale, nothing else

Every gap, padding and margin is one of these (`base/base.scss`, `--size-*`).
px values are exact at a 1440px viewport (and above) and scale down below
(see §6).

| Token | px | Typical role |
|---|---|---|
| `--size-1` | 8 | icon gap, label → title |
| `--size-2` | 12 | tight inner padding, chip |
| `--size-3` | 16 | gutter, small card padding, text → text |
| `--size-4` | 24 | card padding, title → body |
| `--size-5` | 32 | large card padding, lockup → list |
| `--size-6` | 40 | between groups inside a section |
| `--size-7` | 48 | lockup → content, container side padding |
| `--size-8` | 64 | big breath inside a section |

Section outer padding: the `Small / Main / Large / Page top` scale of §1.
Radius: `--radius-small` (8), `--radius-main` (16), `--radius-round` (pill).
Borders: `--border-width-main` (1.5px). Shadow: `--shadow` (one only).

A value not on the scale (10px, 20px, 56px) is a **decision to flag**, not
something to approximate on the dev side. Prefer the scale; if the design
truly needs an off-scale value, keep it and list it in the handover.

## 3. Typography — tag is structure, class is look

One family: **Google Sans Flex** (`--font-primary`). No second family unless
the project says so.

Sizes are **classes**, independent from the heading tag
(`base/typography.scss`):

| Class | px / line-height | Use |
|---|---|---|
| `.display` | 112 / 1.1 | one hero statement per site, if any |
| `.h1` | 96 / 1 | page hero title |
| `.h2` | 64 / 1 | section title |
| `.h3` | 48 / 1 | large sub-title, big card title |
| `.h4` | 32 / 1 | card title, FAQ question |
| `.h5` | 24 / 1 | small card title |
| `.h6` | 20 / 1 | list item title |
| `.h7` | 16 / 1.1 | name, caption title |
| `.text-large` | 20 / 1.5 | intro, lead, quote |
| `.text-main` | 16 / 1.3 | body |
| `.text-small` | 14 / 1.3 | meta, footnote |
| `.label` | 14 / 1.1, uppercase, 500 | eyebrow, tag |
| `.text-muted` | — | secondary color (combine with a size class) |

Rules:

- **Choose the tag for the document outline, the class for the size.**
  `<h2 class="h3">` is normal. `<h3 class="h1">` is normal. One `<h1>` per
  page; heading levels do not skip (`h2` → `h4` is a bug).
- Never write a `font-size`, `line-height` or `font-weight` outside these
  classes. If a size is missing from the scale, say so (handover), do not
  add a 28px.
- Titles wrap. Design for 1 and 2 lines; do not lock a title in a one-line box.

## 4. Colors — roles, not hex

Use the **semantic** names; they change with the section theme automatically:

| Role | Light | Dark | Brand |
|---|---|---|---|
| `--col-background` | white | black | brand |
| `--col-background-2` | grey (`#f0f2f5`) | black | brand |
| `--col-text` | black (`#190f35`) | white | white |
| `--col-text-muted` | black 70% | white 70% | white |
| `--col-border` | black 10% | white 20% | white 20% |
| `--col-button-background` / `--col-button-text` | brand / white | brand / white | white / black |
| `--col-focus` | brand | white | white |

Raw palette (`--col-black`, `--col-white`, `--col-brand` `#f446a0`,
`--col-grey`, and the opacity steps `-70/-40/-20/-10`) is for the rare case a
role does not fit. **No new hex values.** A new tint is a system change
(handover).

Overlay over an image: `--col-overlay` (black 70%), always dark.

## 5. Grid — 12 columns, three breakpoints

`base/grid.scss`: `.container` (max 1280px, 48px side padding) › `.row` ›
`.col`. Columns: `.col-lg-N` (desktop, default), `.col-md-N` (≤ 991),
`.col-xs-N` (≤ 480). Offsets: `.ml-N-col` / `.mr-N-col` (1–3). Gutter 16px.

```html
<div class="row justify-center">
  <div class="col col-lg-8 col-md-12">centered lockup</div>
</div>
<div class="row">
  <div class="col ml-1-col col-lg-4 col-md-12">inset text</div>
  <div class="col col-lg-6 col-md-12">media</div>
</div>
```

- Design on the **12-column grid**: text lockups span 6–8 columns centered,
  two-column layouts are 5/7 or 6/6, cards are 4/4/4 or 6/6 or 3/3/3/3.
- A 5- or 7-column *grid* (not span) does not exist. Flag it if you need it.
- Repeated items (cards, logos, steps) use **one** card design repeated, with
  real variable content lengths (a short and a long title), so the layout is
  proven to hold.

## 6. Breakpoints and fluid sizing

- **Desktop** ≥ 992px — design at **1440**. Every px value in this document
  is exact at 1440 (and above).
- **Tablet** 480–991px — only when it does something distinct.
- **Mobile** ≤ 480px — design at **390**.
- The root font-size is fluid (`base/sizes.scss`): each layout is designed at
  one width (1440 desktop, 992 tablet, 390 mobile) and scales
  **proportionally** inside its range — at 1100px wide, the desktop layout
  renders at 1100/1440 of its size, text included. Do not compensate by hand;
  design the 1440 and the 390 views and let the scale do the rest.
- Mobile means **stacking** (`col-md-12`), not a new design. If a section
  needs a different mobile *structure*, that is a variation to name.

## 7. What becomes editable (the CMS)

Everything a client might change becomes a Prismic field. Design accordingly:

- **Every text, image and link is editable** — including eyebrow labels,
  button texts, alt texts. Assume a title can be 30% longer and a paragraph
  twice as long.
- **Repeated things are a list**: cards, logos, FAQ items, steps,
  testimonials. One design, N items (design for 3 and for 6). The editor
  adds and removes items; do not design "exactly three".
- **Choices become selects**: image left/right, 2 or 3 columns, theme — only
  when the design actually shows both. Do not propose options the design
  does not show.
- **Fixed** text is rare (a decorative "01", a legal mention). Mark it
  explicitly (§8); otherwise it will become a field.
- **Content from elsewhere**: a blog grid, "latest 3 articles", a wall of
  testimonials come from other CMS documents. Say whether the editor
  **hand-picks** them or they are **automatic** (all, latest N, sorted).
- Videos are hosted files (mp4 URL), not YouTube embeds. Icons are SVG.
- No Lorem ipsum: realistic placeholder copy in the site's language, at
  realistic lengths. No copy or images lifted from other companies' sites.

## 8. Mark your intent in the markup (optional, saves a round of questions)

```html
<section data-slice="Testimonials" data-variation="curated">
  <p data-field="eyebrow" class="label">Témoignages</p>
  <h2 data-field="title" class="h2">Ils nous font confiance</h2>
  <ul data-group="items">
    <li>…one item design…</li>
  </ul>
  <span data-fixed>01</span>
</section>
```

`data-slice` names the section; `data-variation` when there are several
layouts; `data-field` on each editable node; `data-group` around a repeated
list; `data-fixed` on text that must **not** become a field. Nothing else is
needed.

## 9. Accessibility (legal requirement, RGAA / EAA)

- Text contrast **AA**: 4.5:1 for body, 3:1 for ≥ 24px. The default roles pass;
  check anything on an image or on `--col-brand`.
- Visible **focus** on every link and button (`--col-focus`, 2px outline). Hover
  is never the only affordance.
- One `<h1>` per page, heading levels in order, lists as `<ul>`, buttons that
  do things as `<button>`, links that go somewhere as `<a>`.
- Images carry meaning → alt text; decorative → empty alt.
- Motion: every animation has a **reduced-motion** state (the site disables
  transitions when the user asks). Nothing essential is only in motion.
- Touch targets ≥ 44px on mobile. Text is never in images.

## 10. Changing the system

The structure (number of sizes, type classes, color roles, breakpoints,
12 columns, section padding scale) is **not** changed per project. The
**values** are, once, at project start: brand colors, type scale, radius,
font. If the designer wants to change a value, or needs something outside the
system (a new size, a tint, a 7-column grid), write it in the handover under
"System changes" with the reason. The team updates the source of truth or
answers; nobody hard-codes.

## 11. Handover

See `handover.md`. Short version: one deployed URL or one folder, one
`<section>` per block, 1440 and 390 checked, the section list with names and
variations, the system changes list, the "automatic or hand-picked" answer for
any list of content.
