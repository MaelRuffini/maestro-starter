/**
 * Stylelint — the mechanical half of SKILL.md §4 (CSS convention).
 *
 * Two layers:
 * - `src/styles/base/**`: the token layer. Raw hex, px and element selectors
 *   are legitimate there, so only the standard SCSS config applies.
 * - Everything else (slices, examples, shared component styles): tokens only.
 *   No hex / rgb / named colors, no px except on borders and outlines, no
 *   `!important`, no `#id`, no element selectors, no type sizing (type classes
 *   live in JSX), spacing and radii from `var(--…)` / `calc()`, no literal
 *   durations. BEM class names.
 *
 * `prose.scss` is the one allowed exception for element selectors and type
 * sizing because its markup comes from the rich text editor (§4.2).
 */

const TOKEN_OR_CALC =
  "/^(?:0|auto|none|var\\(--[\\w-]+\\)|calc\\(.+\\))(?:\\s+(?:0|auto|var\\(--[\\w-]+\\)|calc\\(.+\\)))*$/";

const BEM_CLASS =
  "^[a-z][a-z0-9]*(?:-[a-z0-9]+)*(?:__[a-z0-9]+(?:-[a-z0-9]+)*)?(?:--[a-z0-9]+(?:-[a-z0-9]+)*)?$";

/** @type {import("stylelint").Config} */
const config = {
  extends: ["stylelint-config-standard-scss"],
  plugins: ["stylelint-declaration-strict-value"],
  // examples/maestro-design/base is a verbatim copy of src/styles/base for the designer skill.
  ignoreFiles: ["node_modules/**", ".next/**", ".worktrees/**", "examples/maestro-design/**"],
  rules: {
    // Desktop-first `@media (max-width: $bp-*)` is the convention (§4.4).
    "media-feature-range-notation": null,
    "selector-class-pattern": [
      BEM_CLASS,
      { message: "Class names are BEM: block, block__element, block--modifier (SKILL.md §4.2)." },
    ],
    "scss/dollar-variable-pattern": "^[a-z][a-z0-9-]*$",
    // Formatting-only rules: not part of the convention, and Prettier-free.
    "custom-property-empty-line-before": null,
    "declaration-empty-line-before": null,
    "scss/double-slash-comment-empty-line-before": null,
    "declaration-block-no-redundant-longhand-properties": null,
    "number-max-precision": null,
    "value-keyword-case": null,
    "color-hex-length": null,
  },
  overrides: [
    {
      // Token layer: reset, fluid sizes and the `:root` tokens need prefixes,
      // `clip` fallbacks and raw values.
      files: ["src/styles/base/**/*.scss"],
      rules: {
        "property-no-vendor-prefix": null,
        "property-no-deprecated": null,
      },
    },
    {
      files: ["src/slices/**/*.scss", "examples/slices/**/*.scss", "src/styles/components/**/*.scss"],
      rules: {
        "declaration-no-important": true,
        "selector-max-id": 0,
        "selector-max-type": [0, { message: "No element selectors in slice stylesheets (SKILL.md §4.2)." }],
        "color-no-hex": true,
        "color-named": [
          "never",
          // `black` / `transparent` in a mask gradient are alpha, not paint.
          { ignoreProperties: ["mask-image", "mask", "-webkit-mask-image"] },
        ],
        "function-disallowed-list": [
          ["rgb", "rgba", "hsl", "hsla"],
          { message: "Colors are tokens: var(--col-*) (SKILL.md §4.3)." },
        ],
        "unit-disallowed-list": [
          ["px"],
          {
            ignoreProperties: { px: ["/^border/", "/^outline/", "text-decoration-thickness", "/^--plyr-/"] },
            message: "rem everywhere; px only for 1px borders (SKILL.md §4.4).",
          },
        ],
        "declaration-property-value-disallowed-list": [
          {
            transition: ["/\\d+m?s/"],
            "transition-duration": ["/\\d+m?s/"],
            animation: ["/\\d+m?s/"],
            "animation-duration": ["/\\d+m?s/"],
            "box-shadow": ["/^(?!none$|var\\().+/"],
          },
          { message: "Durations are tokens; drop shadows use the .box-shadow class (SKILL.md §4.3)." },
        ],
        "scale-unlimited/declaration-strict-value": [
          [
            "/color$/",
            "background",
            "background-color",
            "fill",
            "stroke",
            "gap",
            "row-gap",
            "column-gap",
            "/^padding/",
            "/^margin/",
            "border-radius",
          ],
          {
            ignoreValues: {
              "/color$/": ["transparent", "currentColor", "currentcolor", "inherit"],
              background: ["transparent", "none", "inherit"],
              "background-color": ["transparent", "inherit"],
              fill: ["currentColor", "currentcolor", "none"],
              stroke: ["currentColor", "currentcolor", "none"],
              gap: [TOKEN_OR_CALC],
              "row-gap": [TOKEN_OR_CALC],
              "column-gap": [TOKEN_OR_CALC],
              "/^padding/": [TOKEN_OR_CALC],
              "/^margin/": [TOKEN_OR_CALC],
              "border-radius": ["0", "50%", "inherit"],
            },
            message: "Use a token: var(--…) (SKILL.md §4.3). Do not invent one — ask.",
          },
        ],
      },
    },
    {
      files: ["src/slices/**/*.scss", "examples/slices/**/*.scss"],
      rules: {
        "property-disallowed-list": [
          ["font-size", "line-height", "font-family", "font-weight", "font"],
          { message: "Type sizing comes from type classes in JSX (.h2, .text-large…), not slice SCSS (SKILL.md §4.5)." },
        ],
        // Slices never derive a color; shared components may tint a token.
        "function-disallowed-list": [
          ["rgb", "rgba", "hsl", "hsla", "color-mix"],
          { message: "Colors are tokens: var(--col-*); overlays use --col-overlay + .overlay (SKILL.md §4.3)." },
        ],
      },
    },
    {
      // Markup not written by us: rich text output, Plyr's player, the dev notice.
      files: [
        "src/styles/components/prose.scss",
        "src/styles/components/video-player.scss",
        "src/styles/components/setup-notice.scss",
      ],
      rules: {
        "selector-max-type": null,
      },
    },
  ],
};

export default config;
