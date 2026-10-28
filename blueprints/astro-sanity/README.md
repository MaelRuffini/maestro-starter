# Maestro Astro — blueprint (Astro + Sanity)

Ce dossier n’est **pas** le template prêt à cloner. C’est le **cahier des charges +
squelette** pour construire un GitHub template **équivalent à Maestro**
(Next.js 16 + Prismic), mais avec **Astro 7 + Sanity**.

Le boilerplate actuel (`/`, `SKILL.md`, `src/`) reste Next + Prismic. Ne pas
mélanger les deux stacks dans `src/`. Quand le template Astro sera réel, il
vivra dans **son propre dépôt**.

## Pourquoi ce mapping

| Maestro aujourd’hui | Maestro Astro |
| ------------------- | ------------- |
| Next.js 16 App Router, JS only | Astro 7, JS only (`.astro` + JSDoc, **pas** de `tsconfig.json`) |
| Prismic Type Builder + CLI | Sanity Studio, **schema-as-code** dans le repo |
| Slice Zone | champ `slices` (array d’objets) + `PageBuilder.astro` |
| `npx prismic push` | **rien** : le schema *est* le code. `git push origin main` suffit |
| Migration Release | drafts Sanity via `npm run sanity:fill` — l’humain publie |
| `/dev/slices` | identique, alimenté par `mocks.json` |
| Vercel | Vercel (`@astrojs/vercel`, `output: "server"`) |

Tout le reste est volontairement identique : une slice = un frame Figma = un
commit sur `main`, SCSS + BEM + tokens, `settings` sur chaque slice, RGAA/EAA,
animations off until picked, brief → go → human TODO, Slack côté agence.

## Comment lire ce dossier

1. **[`MAPPING.md`](./MAPPING.md)** — Prismic / Next → Sanity / Astro, champ
   par champ.
2. **[`STRUCTURE.md`](./STRUCTURE.md)** — arborescence cible du futur repo.
3. **[`BUILD.md`](./BUILD.md)** — phases pour **construire** le template
   (ce que tu as demandé : dossiers + instructions).
4. **[`SKILL.md`](./SKILL.md)** — conventions agents, à copier dans le futur
   repo comme source of truth (comme le `SKILL.md` Maestro).
5. **[`AGENTS.md`](./AGENTS.md)** — entry point agents du futur repo.
6. **`schema/`**, **`src/`**, **`scripts/`**, **`.cursor/`** — stubs
   copy-pasteables, pas encore un site qui tourne.

## Décisions déjà tranchées (ne pas re-débattre au build)

1. **JavaScript only.** Pas de TypeScript, pas de `tsconfig.json`. Schema
   Sanity en `defineType()` JS. Types via JSDoc si besoin.
2. **Slices en `.astro`**, pas en React. Zéro JS envoyé par défaut. Les îlots
   (`Animations`, `SmoothScroll`, `VideoPlayer`, un accordion) sont des
   composants React ou scripts `client:load`.
3. **Studio embarqué** à `/studio` via `@sanity/astro` (un repo, un deploy).
   Visual Editing (Presentation) exige `output: "server"`.
4. **CSS Maestro inchangé.** Copier `src/styles/base/` et
   `src/styles/components/` du repo actuel. Stylelint et la grille 12 col
   restent la loi.
5. **Unité de travail = slice.** Dossier `src/slices/<Name>/` avec
   `index.astro` + `schema.js` + `<name>.scss` + `mocks.json`.
6. **Pas de `feat/slice-*`, pas de PR.** Commit sur `main`. Un batch = un
   commit par slice, un `git push` à la fin. Plus de `prismic push`.
7. **Host : Vercel.** Preview Sanity = Presentation + draft cookie, pas un
   second projet Sanity.

## Extraire vers un vrai template

Quand tu es prêt à en faire un dépôt :

```sh
# depuis la racine Maestro
mkdir -p ../maestro-astro
# suivre BUILD.md phase 0 — copier styles, convention CSS, skill Figma
```

Ne pas construire le template dans ce repo : les agents Maestro liraient
deux stacks à la fois.

## Ce que ce blueprint ne fait pas encore

- `npm install` / `astro dev` ici : les stubs ne compilent pas tout seuls.
- Les slices de référence (`Hero`, `FiftyFifty`, …) : à porter depuis
  `examples/slices/` au moment du build (phase 12 de `BUILD.md`).
- Les scripts (`slice:scaffold`, `sanity:fill`, …) : spécifiés dans
  `scripts/README.md`, pas implémentés.
