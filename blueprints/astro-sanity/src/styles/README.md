# Styles

**Copier depuis le repo Maestro**, ne pas réécrire :

```
maestro-starter/src/styles/base/          →  src/styles/base/
maestro-starter/src/styles/components/    →  src/styles/components/
maestro-starter/src/app/globals.scss      →  src/styles/global.scss
                                            (changer l’import Next en
                                             import depuis Layout.astro)
```

Règles inchangées : tokens dans `base/base.scss`, BEM, pas de magie,
Stylelint (`stylelint.config.mjs` copié tel quel).

`astro.config.mjs` doit exposer `src/styles` en Sass `loadPaths` pour que
`@use 'base/breakpoints' as *;` continue de marcher dans les slices.
