# Recipes (types opt-in)

Comme Maestro `examples/recipes/`. Rien n’est installé tant que
`npm run type:install -- <name>` n’a pas tourné.

À porter :

- **article** — document `article` (`title`, `cover`, `excerpt`,
  `published_at`, `slices`, `seo`), route `/blog/[slug]`, header chrome
  au-dessus des slices. Pairs with `Articles`.
- **testimonial** — document sans route (`quote`, `author`, `role`,
  `photo`). Pairs with `Testimonials`.

Chaque recipe :

```
examples/recipes/<name>/
  recipe.json          # { "name", "files": [...] }
  schema/documents/<name>.js
  src/pages/blog/[slug].astro   # si page type
  src/styles/components/…       # si chrome
```
