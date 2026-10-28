# Arborescence cible du futur repo Maestro Astro

Les fichiers marqués **(copier)** viennent du repo Maestro actuel.
Les fichiers marqués **(stub)** existent déjà dans ce blueprint.
Les fichiers marqués **(build)** se créent pendant `BUILD.md`.

```
maestro-astro/
├── AGENTS.md                          (stub → racine du nouveau repo)
├── CLAUDE.md                          @AGENTS.md
├── SKILL.md                           (stub)
├── README.md                          (build — README public du template)
├── package.json                       (stub package.json.example)
├── astro.config.mjs                   (stub astro.config.mjs.example)
├── sanity.config.js                   (stub sanity.config.js.example)
├── sanity.cli.js                      (build)
├── jsconfig.json                      (stub)  # @/* → src/* ; JAMAIS tsconfig.json
├── eslint.config.mjs                  (build — JS + astro)
├── stylelint.config.mjs               (copier du Maestro)
├── .env.example                       (stub)
├── .gitignore
├── .github/workflows/ci.yml           (build — lint + astro build)
│
├── schema/                            # source of truth CMS (le « customtypes/ + model.json »)
│   ├── index.js                       (stub)  — schemaTypes export
│   ├── documents/
│   │   ├── homepage.js                (stub)
│   │   ├── page.js                    (stub)
│   │   └── settings.js                (stub)
│   ├── objects/
│   │   ├── sliceSettings.js           (stub)  — padding / theme / panel
│   │   ├── seo.js                     (stub)
│   │   ├── ctaLink.js                 (stub)
│   │   └── titlePortable.js           (stub)  — headings only, pour SliceTitle
│   └── slices/                        # réexport ; le vrai schema vit dans src/slices/<Name>/schema.js
│       └── index.js                   (build, généré par scaffold)
│
├── src/
│   ├── animations.config.js           (copier, inchangé)
│   ├── layouts/
│   │   └── Layout.astro               (stub)
│   ├── pages/
│   │   ├── index.astro                (stub)  — homepage
│   │   ├── [...uid].astro             (stub)  — pages
│   │   ├── 404.astro
│   │   ├── sitemap.xml.js
│   │   ├── robots.txt.js
│   │   ├── studio/[...tool].astro     (Studio embarqué)
│   │   ├── dev/slices.astro           (galerie mocks, notFound en prod)
│   │   └── api/
│   │       ├── draft-mode/enable.js
│   │       ├── draft-mode/disable.js
│   │       └── revalidate.js
│   ├── components/                    # .astro (shell) ; îlots React à part
│   │   ├── SliceSection.astro         (stub)
│   │   ├── SliceTitle.astro           (stub)
│   │   ├── PageBuilder.astro          (stub)
│   │   ├── Button.astro
│   │   ├── Prose.astro
│   │   ├── SanityImage.astro
│   │   ├── SetupNotice.astro
│   │   ├── CustomCode.astro
│   │   ├── GridOverlay.jsx            (copier, client:idle)
│   │   ├── SmoothScroll.jsx           (copier, client:load)
│   │   ├── Animations.jsx             (copier, client:load)
│   │   └── VideoPlayer.jsx            (copier, client:visible)
│   ├── slices/                        # vide sur un template frais
│   │   ├── index.js                   (généré par scaffold)
│   │   └── _template/                 (stub — jamais bundle, copie pour scaffold --from)
│   ├── lib/
│   │   ├── sanity.js                  (client)
│   │   ├── load-query.js              (published vs draft)
│   │   ├── links.js                   (resolveHref, ctaLink)
│   │   ├── image.js                   (urlFor)
│   │   ├── filled.js                  (isFilled.*)
│   │   ├── site.js                    (copier / adapter)
│   │   ├── settings.js
│   │   ├── collection.js              (getCollection pour Articles / Testimonials)
│   │   ├── metadata.js
│   │   ├── custom-code.js             (copier / adapter)
│   │   ├── animate.js                 (copier)
│   │   ├── gsap.js                    (copier)
│   │   └── animations/                (copier src/lib/animations/)
│   └── styles/
│       ├── global.scss                # @use de base/ (ex-globals.scss)
│       ├── base/                      (COPIER src/styles/base/ du Maestro)
│       └── components/                (COPIER + adapter imports)
│
├── examples/
│   ├── slices/                        (porter depuis Maestro examples/slices/, .jsx → .astro)
│   ├── recipes/                       (article, testimonial)
│   └── maestro-design/                (copier tel quel — indépendant du CMS)
│
├── scripts/
│   ├── init.mjs
│   ├── sanity-connect.mjs
│   ├── slice-scaffold.mjs
│   ├── slice-land.mjs
│   ├── slice-check.mjs
│   ├── type-install.mjs
│   ├── sanity-fill-slice.mjs
│   └── slack-maestro.mjs
│
├── public/
│   └── favicon.ico                    (copier)
│
└── .cursor/  +  .claude/              (stubs dans ce blueprint)
    ├── skills/maestro-astro/SKILL.md  # pointe vers /SKILL.md
    ├── commands/new-slice.md
    └── agents/{dev-slice,reviewer,content-model-guardian}.md
```

## Règle des deux sources schema

Le schema d’une slice vit **une seule fois** : `src/slices/<Name>/schema.js`.
`schema/slices/index.js` et `schema/index.js` ne font que l’importer. Ne pas
dupliquer les fields dans `schema/documents/`.

Les documents (`homepage`, `page`, `settings`) restent dans `schema/documents/`
parce qu’ils n’ont pas de dossier slice.
