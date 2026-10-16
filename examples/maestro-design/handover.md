# Handover checklist

The development team rebuilds every section on their stack from what you send.
The cleaner the handover, the fewer questions.

## What to send

- **A deployed URL** (Vercel, Netlify, Claude artifact…) **or a code folder /
  repository.** Both are fine. A URL is best when you have one.
- Checked at **1440** and **390** wide. Tablet only if it does something
  specific.
- Each block of the page is a top-level `<section>` with a `data-slice`
  name (see `SKILL.md` §8).

## The section list

For each section, top to bottom:

```
1. Hero            — variations: default · with video
2. FiftyFifty      — variations: image left · image right
3. Grid            — 3 columns, 6 items; cards link to a page
4. Testimonials    — variation: curated (editor picks 3) — type: testimonial
5. Articles        — automatic: latest 3, newest first — type: article
6. Faq             — accordion, one open at a time
7. CtaCards        — 2 cards, Dark theme
```

For any list that comes from other content (articles, testimonials, team,
events): **hand-picked by the editor** or **automatic** (all / latest N /
sorted how)?

## System changes

Anything outside the system (`SKILL.md` §2–§6), with the reason:

```
- Section 3 cards use a 20px padding — 24 felt too loose at 3 columns. OK to use 24?
- New tint needed: brand at 10% as a card background (--col-brand-10).
- Articles need a 13px meta line; .text-small (14) is fine if that is simpler.
```

Empty list = everything is on the system. That is the goal, not a failure to
be creative.

## Fixed vs editable

Anything that must **not** become a CMS field (decorative numbers, a legal
line) is marked `data-fixed` in the markup or listed here. Everything else is
editable by default.

## Assets

- **Photos, logos, illustrations, portraits** in your prototype are
  placeholders. The real ones go into the CMS later, uploaded by the client or
  the team. What matters is the **format**: ratio, orientation, minimum size,
  whether it is cropped. Say it when it is not obvious
  (`data-field="cover"` + a note "16:9, min 1200 wide").
- **Icons that are part of the design** (chevrons, arrows, decorative shapes)
  should be inline `<svg>` in the markup so they can be reused as-is. Icons
  the editor will **choose** (one per card) are content: a placeholder image
  is enough.
- No asset folder is needed. A deployed URL already hosts your placeholders;
  a code folder with `public/` is fine but is only read for formats and SVGs.
- Fonts: the project's family is fixed. Do not ship font files.

## What not to send

- Copy, photos or icons lifted from another company's site.
- Lorem ipsum. Use realistic placeholder text in the site's language.
- Figma-only exports when the prototype exists — the prototype is the source.
- Your prototype's CSS framework config or component library — the team does
  not import it; it reads the rendered result.
