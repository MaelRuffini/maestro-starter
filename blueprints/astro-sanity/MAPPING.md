# Mapping Maestro → Maestro Astro

Les conventions (CSS, a11y, Figma, brief → go, animations opt-in) ne changent
pas. Seuls le **rendu** et le **CMS** changent.

## Stack

| Rôle | Next + Prismic | Astro + Sanity |
| --- | --- | --- |
| Framework | Next.js 16 App Router | Astro 7, `output: "server"` |
| Langage | JS + JSDoc, jamais `tsconfig.json` | identique |
| CMS | Prismic Type Builder + `npx prismic` | Sanity Studio v3+, schema JS |
| Slice zone | `@prismicio/react` `<SliceZone>` | `PageBuilder.astro` (map `_type` → composant) |
| Client | `@prismicio/client` | `@sanity/client` + `groq` + `loadQuery` |
| Images | `PrismicNextImage` | `@sanity/image-url` + `<img srcset>` (ou composant `SanityImage`) |
| Rich text | `PrismicRichText` / `SliceTitle` | `@portabletext/astro` / `SliceTitle.astro` |
| Preview | `/api/preview` + cookie Prismic | Presentation + `/api/draft-mode/enable` + stega |
| Revalidate | webhook → `/api/revalidate` (`revalidateTag`) | webhook → `/api/revalidate` (purge cache / `Astro.rewrite`) |
| Studio / Page Builder | `prismic.io` hébergé | `/studio` dans l’app (ou sanity.io hosted) |
| Port local | 3000 | **4321** (batch worktrees : 4331–4333) |
| Hosting | Vercel | Vercel + `@astrojs/vercel` |

## Unité slice

| Fichier Prismic | Fichier Sanity / Astro |
| --- | --- |
| `src/slices/Hero/index.jsx` | `src/slices/Hero/index.astro` |
| `src/slices/Hero/model.json` | `src/slices/Hero/schema.js` |
| `src/slices/Hero/hero.scss` | identique |
| `src/slices/Hero/mocks.json` | identique (shape Sanity, pas Prismic) |
| `src/slices/index.js` (CLI) | `src/slices/index.js` (scaffold : `_type` → composant) |
| `prismicio-types.d.ts` | pas généré. JSDoc optionnel. Schema = source of truth |
| `npx prismic gen types` | **supprimé** |
| `npx prismic push` | **supprimé** — le schema est déjà dans git |
| `npx prismic slice create` | `npm run slice:scaffold` écrit `schema.js` + enregistre le type |

## Types de documents

| Prismic | Sanity |
| --- | --- |
| custom type `homepage` (single) | document `homepage`, `singleton` via `structure` (1 seul doc, id fixe `homepage`) |
| custom type `page` (repeatable) | document `page` + champ `slug` |
| custom type `settings` (single) | document `settings`, id fixe `settings` |
| recipe `article` | document `article` + route `/blog/[slug]` |
| recipe `testimonial` | document `testimonial` (pas de route) |
| Slice Zone `slices` | `slices: array` of object types (`hero`, `fiftyFifty`, …) |
| SEO tab | object `seo` (`meta_title`, `meta_description`, `meta_image`) |

## Champs

| Prismic (`--fields` / model) | Sanity (`schema.js`) |
| --- | --- |
| `text` | `string` (une ligne) ou `text` (multiligne) |
| `rich-text` `single` headings (titre de slice) | Portable Text `titlePortable` : styles `h1`–`h6` only |
| `rich-text` `allow` body | Portable Text `block` (+ marks `strong`, `em`, `link`) |
| `image` | `image` + champ `alt` (string) **obligatoire dans le schema** |
| `link` `--allow-text` + `variants` | object `ctaLink` : `label`, `link` (url **ou** reference), `variant` |
| `link` `--allow web` (vidéo) | `url` (fichier hébergé ailleurs, comme Maestro) |
| `select` | `string` + `options.list` + `initialValue` |
| `boolean` | `boolean` + `initialValue: false` |
| `number` | `number` |
| `group` repeatable | `array` of `object` |
| `group` `"repeat": false` | `object` (ex. `settings`) |
| `content-relationship` | `reference` to `[{ type: 'article' }]` |
| variation de slice | champ `variation` (`string` list) **ou** types distincts. Préférer **un champ** `variation` : mêmes fields, layout BEM modifier |
| UID | `slug` (`name: 'slug', type: 'slug', options: { source: 'title' }`) |

`settings` n’est plus un group Prismic injecté : c’est l’object type partagé
`sliceSettings` (`schema/objects/sliceSettings.js`), premier champ de chaque
slice. `SliceSection.astro` lit `slice.settings`.

## Rendu

| Next | Astro |
| --- | --- |
| `src/app/layout.js` | `src/layouts/Layout.astro` |
| `src/app/page.js` | `src/pages/index.astro` |
| `src/app/[uid]/page.js` | `src/pages/[...uid].astro` |
| `src/app/not-found.js` | `src/pages/404.astro` |
| `src/app/sitemap.js` | `src/pages/sitemap.xml.js` |
| `src/app/robots.js` | `src/pages/robots.txt.js` |
| `src/app/dev/slices/page.jsx` | `src/pages/dev/slices.astro` (`notFound` en prod) |
| `src/app/slice-simulator/` | **supprimé** (Presentation remplace) |
| `src/app/api/preview/route.js` | `src/pages/api/draft-mode/enable.js` |
| `src/app/api/exit-preview/route.js` | `src/pages/api/draft-mode/disable.js` |
| `src/app/api/revalidate/route.js` | `src/pages/api/revalidate.js` |
| `"use client"` | `client:load` / `client:idle` sur un îlot. Jamais sur `SliceTitle` / `SliceSection` |
| Server Component `async` | frontmatter `.astro` (top-level await) |

## Client / images / liens

| Prismic | Sanity |
| --- | --- |
| `isFilled.richText(field)` | helper `isFilled.portable(field)` (array length > 0) |
| `isFilled.image(field)` | `field?.asset` |
| `isFilled.link(field)` | `ctaLink` : label + (href ou reference) |
| `PrismicNextLink` | `<a href={resolveHref(link)}>` (`src/lib/links.js`) |
| `PrismicNextImage` `sizes` `fallbackAlt=""` | `<SanityImage>` avec `sizes` + `alt` du schema (vide = décoratif) |
| Route resolver `prismic.config.json` | `src/lib/links.js` + `sanity.config.js` `presentationTool.resolve` |

## Preview & live

| Prismic | Sanity |
| --- | --- |
| Preview cookie + `/api/preview` | Draft Mode cookie + Presentation iframe |
| Slice simulator | **non** — `/dev/slices` pour les mocks, Presentation pour le live |
| `publishMigrationRelease()` interdit | `client.patch().commit()` en **draft** uniquement. Jamais `published` depuis l’agent |
| Webhook documentsPublished | Webhook `document.published` + `document.unpublished` |

## Scripts

| Maestro | Maestro Astro |
| --- | --- |
| `npm run setup` | identique (nom, description, projectId, dataset) |
| `npm run prismic:connect` | `npm run sanity:connect` — écrit `.env`, CORS localhost, dataset |
| `npx prismic push` | **supprimé** |
| `npx prismic status` | `npx sanity schema extract` / Studio local (le schema est le repo) |
| `npx prismic gen types` | **supprimé** |
| `npm run slice:scaffold` | identique, écrit `schema.js` + enregistre dans `schema/index.js` + `src/slices/index.js` |
| `npm run slice:land` | identique (worktree → main) |
| `npm run slice:check` | identique, adaptée aux fichiers `.astro` + `schema.js` |
| `npm run type:install` | identique (copie `examples/recipes/<name>/`) |
| `npm run prismic:fill` | `npm run sanity:fill` — crée/patche un draft, n’appelle pas `publish` |
| `npm run slack` | identique (le prompt cloud pointe vers le SKILL Astro) |

## Ce qu’on ne porte pas

- `prismic.config.json`, `customtypes/`, `prismicio-types.d.ts`, `src/prismicio.js`
- Slice Machine / Type Builder live preview (`/slice-simulator`)
- `@prismicio/*`
- `npx prismic` dans le PATH agents
- `"use client"` comme primitive (Astro n’en a pas)
- TypeScript Sanity (`schemaTypes/*.ts`) — **JS only**, même si le starter officiel Sanity est en TS
