# Construire le template Maestro Astro

Instructions pour un agent ou un humain. **Ne rien coder dans le repo Maestro
actuel** (`src/`, `package.json`). Créer un **nouveau dépôt**, puis suivre
les phases dans l’ordre. Cocher au fur et à mesure.

Prérequis : Node 22, compte Sanity, compte Vercel, ce blueprint sous les yeux,
le repo Maestro (pour copier CSS + animations + stylelint).

---

## Phase 0 — Nouveau dépôt

- [ ] GitHub → new repo `maestro-astro` (template, public ou internal).
- [ ] Clone. Copier **uniquement** depuis Maestro :

  ```
  src/styles/base/                  → src/styles/base/
  src/styles/components/            → src/styles/components/
                                      (slice-section, slice-title, prose, button,
                                       animations, grid-overlay, video-player,
                                       setup-notice, custom-code)
  src/animations.config.js
  src/lib/animate.js, gsap.js, animations/
  src/components/{GridOverlay,SmoothScroll,Animations,VideoPlayer}.jsx
  stylelint.config.mjs
  examples/maestro-design/
  ```

- [ ] Copier depuis **ce blueprint** : `SKILL.md`, `AGENTS.md`, `schema/`,
      `src/` stubs, `.cursor/`, `.claude/`, `scripts/README.md`,
      `package.json.example` → `package.json`, configs `.example`.
- [ ] Adapter `stylelint.config.mjs` : les globs `src/**/*.scss` restent.
- [ ] **Ne pas** copier `customtypes/`, `src/app/`, `src/prismicio.js`,
      `prismic.config.json`, `@prismicio/*`.

## Phase 1 — Astro skeleton + CSS

- [ ] `npm create astro@latest` n’est **pas** la voie : le `package.json`
      du blueprint liste les deps. `npm install`.
- [ ] `jsconfig.json` : `"@/*": ["src/*"]`. **Interdit** : `tsconfig.json`.
- [ ] `astro.config.mjs` : `output: "server"`, adapter `@astrojs/vercel`,
      integrations `@sanity/astro`, `@astrojs/react`, `vite.scss.loadPaths`
      → `src/styles` (équivalent `next.config` Sass loadPaths).
- [ ] `src/styles/global.scss` : `@use 'base/reset';` … comme
      `src/app/globals.scss` Maestro.
- [ ] `src/layouts/Layout.astro` : skip link, `<main id="main">`, fonts,
      `GridOverlay`, `SmoothScroll`, `Animations`, `CustomCode`,
      `VisualEditing` (flag env).
- [ ] `npm run dev` → `http://localhost:4321` affiche un hello sans CMS.
- [ ] Stylelint passe sur les SCSS copiés.

Décision figée : **pas de Tailwind, pas de CSS Modules**. Tokens only.

## Phase 2 — Projet Sanity + documents

- [ ] Créer le projet **depuis le dashboard Sanity** (tu choisis l’id).
      Ne pas laisser `sanity init` écraser le schema du template.
- [ ] `sanity.config.js` : `projectId` / `dataset` depuis env, plugins
      `structureTool` (singletons homepage + settings), `presentationTool`.
- [ ] Schema documents : `homepage`, `page`, `settings` (stubs déjà là).
      Champ `slices` = array `of: sliceTypes`. Au départ `of: []` est ok.
- [ ] `npm run sanity:connect -- <projectId> <dataset>` (à écrire phase 6)
      : `.env`, CORS `http://localhost:4321` + credentials.
- [ ] Studio à `/studio`. Créer et publier **Homepage** et **Settings**.
- [ ] `src/pages/index.astro` fetch `homepage` via `loadQuery`. Pas de
      document → `SetupNotice`.

## Phase 3 — Système slice

Cœur du template. Imitation de Maestro `SliceSection` + scaffold.

- [ ] Object `sliceSettings` (padding, theme, panel_animation).
- [ ] `SliceSection.astro` : `section.slice-section` → `.container` →
      `wrapper`. Theme sur la section, padding sur le wrapper. Slot
      `background` pour le full-bleed. `data-animate` via `animate("panel")`.
- [ ] `SliceTitle.astro` : Portable Text headings only → **un** heading,
      tag = style du 1er bloc, class = taille (`.h2`, `.display`, …).
      `fallbackTag="h2"` (`"h1"` sur un Hero).
- [ ] `Prose.astro` : Portable Text body, classes type comme Maestro.
- [ ] `Button.astro` : `ctaLink.variant` → `.button` / `--secondary` /
      `--outline`.
- [ ] `SanityImage.astro` : `urlFor`, `sizes` obligatoire, `alt` depuis le
      champ (vide = décoratif).
- [ ] `PageBuilder.astro` : boucle `slices`, registry `src/slices/index.js`.
- [ ] `src/slices/_template/` : les 4 fichiers. Scaffold s’en sert.
- [ ] Premier smoke : une slice `Hello` à la main, visible sur `/` et
      dans le Studio insert menu.

## Phase 4 — Galerie `/dev/slices`

- [ ] `src/pages/dev/slices.astro` : `Astro.locals` / `import.meta.env.PROD`
      → 404 en production.
- [ ] Lit `src/slices/*/mocks.json`. Query `?slice=hero` isole.
- [ ] Les mocks ont la **shape Sanity** (`_type`, `variation`, `settings`
      object — pas un array Prismic, pas `primary`).
- [ ] Screenshot 1440 comme Maestro `SKILL.md` §3.6, port **4321**.

## Phase 5 — Visual Editing + revalidate

Suivre la doc officielle (à jour oct. 2026) :
https://www.sanity.io/docs/visual-editing/astro-visual-editing

- [ ] `@sanity/astro` v3.5+, `stega.studioUrl`.
- [ ] `loadQuery` : cookie draft → perspective `previewDrafts` + token
      `SANITY_API_READ_TOKEN`. Sinon `published`.
- [ ] `/api/draft-mode/enable` + `disable`.
- [ ] `presentationTool({ resolve, previewUrl })`. `resolve` :
      `homepage` → `/`, `page` → `/${slug}`.
- [ ] CORS credentials. Overlay click-to-edit en Presentation.
- [ ] Webhook `document.published` / `unpublished` → `/api/revalidate`.
      Secret `SANITY_REVALIDATE_SECRET`.

Sans Visual Editing le site marche (SSG-like via cache). Ne pas bloquer
les phases 6–8 là-dessus, mais le go-live l’exige.

## Phase 6 — Scripts (parité Maestro)

Spécifications dans [`scripts/README.md`](./scripts/README.md).

- [ ] `init.mjs` — `npm run setup` (nom, projectId, dataset). S’auto-détruit.
- [ ] `sanity-connect.mjs` — env + CORS + rappel « créer Homepage / Settings ».
- [ ] `slice-scaffold.mjs` — **un** commande : dossier, `schema.js` avec
      `sliceSettings` + fields JSON, enregistrement, `index.js` registry,
      mocks vides. `--from Hero` copie component + SCSS depuis
      `examples/slices/`.
- [ ] `slice-land.mjs` — worktree → main.
- [ ] `slice-check.mjs` — 4 fichiers, settings, mocks ↔ variations,
      `SliceSection` + `__wrapper`, pas de `client:` sur `index.astro`,
      `SliceTitle` si field `title`, `sizes` + `alt` images, BEM.
- [ ] `type-install.mjs` — recipes.
- [ ] `sanity-fill-slice.mjs` — append le mock en **draft**. Jamais publish.
- [ ] `slack-maestro.mjs` — porter, pointer le cloud agent sur ce SKILL.

`npm run lint` = ESLint + Stylelint + `slice:check`. CI = lint + `astro build`.

## Phase 7 — Agents

- [ ] `.cursor/skills/maestro-astro/SKILL.md` et `.claude/skills/…` :
      contenu = `SKILL.md` racine (ou symlink).
- [ ] `.cursor/commands/new-slice.md` + miroir `.claude/commands/`.
- [ ] Agents `dev-slice`, `reviewer`, `content-model-guardian` (stubs).
- [ ] Tester `/new-slice` sur un frame simple **après** qu’une slice de
      référence existe (phase 12). Jusque-là le parent peut builder.

## Phase 8 — Settings, SEO, sitemap

- [ ] `getSettings()` cache (module-level, pas React `cache()`).
- [ ] Tabs Settings : Main (SEO), Icons, Custom code, Redirects — mêmes
      fields que Maestro `customtypes/settings`.
- [ ] Redirects : lus au **build** dans `astro.config.mjs` (comme
      `next.config.mjs` `cmsRedirects`). Un changement CMS = redeploy
      (webhook deploy hook, SKILL §12).
- [ ] `sitemap.xml.js` : documents avec slug, perspective published only.
- [ ] `robots.txt.js` : disallow `/dev`, `/studio`, `/api`.
- [ ] Metadata : `seo` du document, fallback `settings` / `src/lib/site.js`.

## Phase 9 — Animations

- [ ] Copie déjà faite en phase 0. Vérifier : `Animations` monté dans
      `Layout.astro` **après** `SmoothScroll`, `client:load`.
- [ ] `SliceTitle` / `SliceSection` restent sans îlot client.
- [ ] `animations.config.js` défaut = tout off. Demander au bootstrap.

## Phase 10 — Go-live (doc dans SKILL §12)

- [ ] Vercel : framework Astro, Node 22, env publics
      `PUBLIC_SANITY_PROJECT_ID`, `PUBLIC_SANITY_DATASET`,
      `PUBLIC_SITE_URL`. Token read **uniquement** si Visual Editing sur
      un preview deploy. Jamais le write token.
- [ ] CORS production origin. Presentation Production URL.
- [ ] Webhook revalidate + optionnel deploy hook (redirects).
- [ ] `/dev/slices` et `/studio` : décider. Recommandé : `/dev` 404 en
      prod ; `/studio` protégé (login Sanity) ou Studio hébergé sanity.io.

## Phase 11 — Slack (optionnel, plus tard)

Porter `scripts/slack-maestro.mjs`. Le cloud agent clone **ce** repo,
lit **ce** `SKILL.md`. Fill = `sanity:fill`.

## Phase 12 — Slices de référence

Porter `examples/slices/` **une par une**, `.jsx` → `.astro`, `model.json`
→ `schema.js`, mocks shape Sanity. Ordre suggéré :

1. `Hero` (full-bleed, 100svh, lockup 8 col)
2. `FiftyFifty` (grille asymétrique)
3. `Grid` (cards)
4. `CtaCards`
5. `Faq` (`<details>` + îlot si GSAP)
6. `Marquee` (CSS only)
7. `StackedCards`
8. `Articles` + recipe `article`
9. `Testimonials` + recipe `testimonial`

Chaque référence : première ligne du frontmatter
`<!-- Reference: Hero — full-bleed media, 100svh, centered 8-col lockup -->`

Elles ne sont **pas** dans `src/slices/`, **pas** dans le schema Studio,
**pas** dans `/dev/slices`. `--from Hero` les copie.

---

## Parallèle utile (ne pas bloquer)

- Phase 5 (Visual Editing) peut avancer en même temps que 6 (scripts)
  dès que `loadQuery` existe.
- Phase 12 commence dès que le scaffold (phase 6) marche : porter Hero
  comme première `--from` cible.
- Ne pas écrire de slice projet (`src/slices/Hero`) dans le template
  frais — seulement `examples/` + `_template`.

## Definition of done

Le template est prêt quand :

1. `npm run setup` + `sanity:connect` + Homepage/Settings publiés → `/`
   rend une page vide (notice ou slice zone vide), `/studio` marche,
   `/dev/slices` est vide.
2. `/new-slice` (ou un humain) : scaffold → `index.astro` + SCSS + mocks
   → lint vert → commit `main` → slice visible dans le Studio **sans**
   commande `push`.
3. `npm run sanity:fill -- --slice Hero` crée un draft ; l’humain publie.
4. Stylelint / `slice:check` / CI `astro build` verts.
5. README public du nouveau repo décrit le bootstrap (SKILL §9).
