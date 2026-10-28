# Scripts à implémenter (phase 6)

Porter la *mécanique* de `maestro-starter/scripts/`, pas l’API Prismic.
Chaque fichier ci-dessous n’existe pas encore : ce README est la spec.
Lire le script Maestro correspondant avant d’écrire.

## `init.mjs` → `npm run setup`

Source : `scripts/init.mjs`.

- Demande : nom du projet, description, `projectId`, `dataset`.
- Réécrit `package.json` name, `README.md`, `src/lib/site.js`,
  `sanity.config.js` title, `.env` depuis `.env.example`.
- Flags `--name --project --dataset --package --description`.
- S’auto-supprime + retire le script `setup` de `package.json`.

## `sanity-connect.mjs` → `npm run sanity:connect -- <projectId> [dataset]`

Source d’intention : `scripts/prismic-connect.mjs`. **Ne pas** pousser de
models (il n’y en a pas côté remote).

- Écrit `PUBLIC_SANITY_PROJECT_ID` / `DATASET` dans `.env`.
- Affiche les CORS à cocher dans le dashboard
  (`http://localhost:4321`, Allow credentials).
- Rappelle de créer Homepage (id `homepage`) et Settings (id `settings`).
- `--preview` : rappelle Presentation URL.

## `slice-scaffold.mjs` → `npm run slice:scaffold -- Name --fields file.json`

Source : `scripts/slice-scaffold.mjs`. C’est le script le plus important.

```
npm run slice:scaffold -- CtaCards --fields /tmp/fields.json
npm run slice:scaffold -- CtaCards --fields /tmp/fields.json --from Grid
npm run slice:scaffold -- CtaCards --no-settings
```

Algorithme :

1. PascalCase `Name` → folder `src/slices/Name/`.
   camelCase id (`ctaCards`) → `schema.js` `name` et mocks `_type`.
   kebab-case (`cta-cards`) → BEM + fichier scss.
2. Créer le dossier. Sans `--from` : copier `_template/` et renommer
   block / schema export. Avec `--from Hero` : copier
   `examples/slices/Hero/` (component + scss + extra `.astro` / `.jsx`),
   renommer le block ; schema et mocks viennent quand même de `--fields`.
3. Lire `--fields` (JSON array). Traduire vers `defineField` :

   | JSON `type` | Sanity |
   | --- | --- |
   | `rich-text` + `single` headings | `type: "titlePortable"` |
   | `rich-text` + `allow` | `type: "array", of: [{ type: "block", marks… }]` |
   | `text` | `string` |
   | `image` | `image` + champ `alt` string |
   | `link` + `allowText` + `variants` | `type: "ctaLink"` |
   | `link` + `allow: ["web"]` | `url` |
   | `select` | `string` + `options.list` + `initialValue` |
   | `boolean` | `boolean` |
   | `number` | `number` |
   | `group` | `array` of object (ou `object` si `"repeat": false`) |
   | `content-relationship` | `reference` `to: [{ type }]` |

4. Préfixer `settings` (`type: "sliceSettings"`) sauf `--no-settings`.
   Ajouter `variation` string list (default only, unless the brief passed
   extras — scaffold can accept `--variation imageLeft` later; v1 = default).
5. Écrire `schema.js`, `mocks.json` (French placeholders, every field),
   stub `index.astro` + scss if not `--from`.
6. Append l’import dans `schema/index.js` et le `name` dans
   `schema/slices/index.js` (`sliceTypes`).
7. Append l’import du composant dans `src/slices/index.js`.
8. **Ne pas** `gen types`. **Ne pas** appeler l’API Sanity.

Connecter aux documents : `homepage` et `page` lisent `sliceTypes`, donc
l’insert menu se met à jour tout seul. Pas de `prismic slice connect`.

## `slice-land.mjs` → `npm run slice:land -- --name Name --from .worktrees/<id>`

Source : `scripts/slice-land.mjs`.

- Copie `src/slices/<Name>/` du worktree vers main.
- Merge les appends `schema/index.js`, `schema/slices/index.js`,
  `src/slices/index.js` (ne pas écraser d’autres slices).
- Ne commit pas (le parent commit).

## `slice-check.mjs` → `npm run slice:check`

Source : `scripts/slice-check.mjs`. Vérifie pour chaque `src/slices/<Name>/`
sauf `_template` :

- Les 4 fichiers existent (`index.astro`, `schema.js`, `<kebab>.scss`,
  `mocks.json`).
- `schema.js` exporte un `defineType` dont `name` est camelCase.
- Premier field = `settings` type `sliceSettings` (sauf allowlist).
- `mocks.json` : un objet par `variation`, `_type` === schema `name`,
  pas de clés Prismic (`slice_type`, `primary`, `items`).
- `index.astro` importe `SliceSection`, passe `wrapperClass="<block>__wrapper"`.
- Pas de `client:` sur `index.astro`.
- Un field `title` (titlePortable) ⇒ le composant utilise `SliceTitle`.
- `SanityImage` / `<img>` : `sizes` présent. `alt` lu du champ.
- Classes SCSS = BEM du block ou globaux autorisés (même liste Maestro).
- `--examples` : mêmes checks sur `examples/slices/`.

## `type-install.mjs` → `npm run type:install -- article`

Source : `scripts/type-install.mjs`. Copie `examples/recipes/<name>/`
(schema document + page Astro + styles). Refuse d’écraser. Ajoute le
type à `schema/index.js` et la route à `src/lib/links.js`.

## `sanity-fill-slice.mjs` → `npm run sanity:fill -- --slice Hero`

Source d’intention : `scripts/prismic-fill-slice.mjs`.

- Token `SANITY_API_WRITE_TOKEN`.
- Charge `src/slices/<Name>/mocks.json` (variation via `--variation`).
- Patch le document (`homepage` par défaut, ou `--document page --slug about`).
- `setIfMissing({ slices: [] })` puis `insert("after", "slices[-1]", [mock])`.
- Commit en **draft** (`createIfNotExists` / `patch`, **sans**
  `client.action({ publish })`).
- Images : `client.assets.upload` si le mock a une URL http, puis
  remplacer `asset._ref`.
- Jamais `published`.

## `slack-maestro.mjs` → `npm run slack`

Porter tel quel. Le prompt cloud agent doit pointer `SKILL.md` de **ce**
repo et `/new-slice` Astro. Fill = `sanity:fill`.
