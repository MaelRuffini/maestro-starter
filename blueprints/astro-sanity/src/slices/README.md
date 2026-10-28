# `src/slices/`

Vide sur un template frais. Une slice = un dossier PascalCase :

```
Hero/
  index.astro
  schema.js
  hero.scss
  mocks.json
```

Création uniquement via `npm run slice:scaffold -- <Name> --fields <file.json>`.
Le dossier `_template/` n’est pas une slice : le scaffold s’en sert, le
Studio et `/dev/slices` l’ignorent.
