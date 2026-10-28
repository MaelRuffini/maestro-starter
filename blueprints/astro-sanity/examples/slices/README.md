# Slices de référence

Ne pas les mettre dans `src/slices/` ni dans le schema Studio.

Porter **une par une** depuis `maestro-starter/examples/slices/`
(BUILD.md phase 12) :

| Nom | Pattern |
| --- | --- |
| Hero | full-bleed media, `100svh`, lockup 8 col centré |
| FiftyFifty | grille asymétrique, média gauche/droite |
| Grid | lockup + CSS grid de cards repeatables |
| CtaCards | paires de cards themées, `container--large` |
| StackedCards | group repeatable + îlot GSAP |
| Marquee | keyframes CSS, reduced-motion |
| Faq | 5/7 colonnes, `<details>` |
| Articles | query d’un autre type (`getCollection`) |
| Testimonials | all **ou** references (deux variations) |

Pour chaque :

1. `model.json` → `schema.js` (`defineType`, fields snake_case).
2. `index.jsx` → `index.astro` (`SliceSection`, `SliceTitle`, `isFilled`).
3. Enfant `"use client"` → îlot `.jsx` `client:load` / `client:visible`.
4. `mocks.json` : shape Sanity (`_type`, pas `primary`).
5. SCSS : copier tel quel (BEM déjà bon).
6. Première ligne du frontmatter : `<!-- Reference: … -->`.

`--from Hero` copie component + SCSS (pas le schema) dans une nouvelle
slice live.
