#!/usr/bin/env node
/**
 * Static checks on slices — the mechanical half of SKILL.md §3 that Stylelint
 * cannot see (JSX ↔ model ↔ mocks consistency).
 *
 *   npm run slice:check              # src/slices + examples/slices (what `npm run lint` runs)
 *   node scripts/slice-check.mjs     # src/slices only
 *   node scripts/slice-check.mjs --examples
 *   node scripts/slice-check.mjs --only Hero
 *
 * Per slice folder:
 *   files    index.jsx, model.json, <kebab>.scss, mocks.json
 *   model    name matches the folder; every variation has the shared `settings`
 *            group (repeat: false, 4 fields)
 *   mocks    non-empty array; one entry per model variation, same ids; slice_type = model id
 *   index    no "use client"; wraps in SliceSection with wrapperClassName="<kebab>__wrapper";
 *            imports ./<kebab>.scss; a `title` rich text goes through SliceTitle
 *            (no hard-coded <hN className="…__title">); every PrismicNextImage
 *            has `sizes` and `fallbackAlt`/`alt`
 *   scss     every class selector belongs to the block (<kebab>, <kebab>__x,
 *            <kebab>--x) or is one of the allowed globals (§4.2)
 *
 * Exit code 1 when anything fails. No network, no Prismic CLI.
 */
import { readdir, readFile, access } from "node:fs/promises";
import path from "node:path";
import { parseArgs } from "node:util";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const { values: flags } = parseArgs({
  options: {
    examples: { type: "boolean", default: false },
    only: { type: "string" },
  },
  strict: true,
});

const SETTINGS_FIELDS = ["padding_top", "padding_bottom", "theme", "panel_animation"];

/** Global classes a slice stylesheet may reference besides its own block (§4.2). */
const GLOBAL_CLASS = [
  /^u-/,
  /^overlay$/,
  /^box-shadow$/,
  /^button(--[\w-]+)?$/,
  /^link(--[\w-]+)?$/,
  /^row(--[\w-]+)?$/,
  /^col(-[\w-]+)?$/,
  /^container(--[\w-]+)?$/,
  /^(align|justify)-[\w-]+$/,
  /^ml-\d+-col$/,
  /^mr-\d+-col$/,
  /^h[1-6]$/,
  /^display$/,
  /^text-[\w-]+$/,
  /^label$/,
  /^plyr/, // third-party player markup (VideoPlayer)
];

const toKebab = (value) =>
  value
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2")
    .toLowerCase();

const exists = (target) => access(target).then(() => true, () => false);

/**
 * @param {string} dir absolute slice folder
 * @param {string} name folder name (PascalCase)
 * @returns {Promise<string[]>} problems
 */
async function checkSlice(dir, name) {
  const problems = [];
  const block = toKebab(name);
  const file = (base) => path.join(dir, base);
  const rel = (base) => path.relative(root, file(base));

  // --- files
  const required = ["index.jsx", "model.json", `${block}.scss`, "mocks.json"];
  const missing = [];
  for (const base of required) if (!(await exists(file(base)))) missing.push(base);
  for (const base of missing) problems.push(`${rel(base)}: missing`);
  if (missing.includes("index.jsx") || missing.includes("model.json")) return problems;

  // --- model
  let model;
  try {
    model = JSON.parse(await readFile(file("model.json"), "utf8"));
  } catch (error) {
    return [...problems, `${rel("model.json")}: invalid JSON (${error.message})`];
  }
  if (model.name !== name) {
    problems.push(`${rel("model.json")}: name "${model.name}" ≠ folder "${name}"`);
  }
  const variations = model.variations ?? [];
  if (!variations.length) problems.push(`${rel("model.json")}: no variations`);
  let hasTitleField = false;
  for (const variation of variations) {
    const primary = variation.primary ?? {};
    const settings = primary.settings;
    if (!settings || settings.type !== "Group") {
      problems.push(`${rel("model.json")}: variation "${variation.id}" has no settings group (§3.4)`);
    } else {
      if (settings.config?.repeat !== false) {
        problems.push(`${rel("model.json")}: variation "${variation.id}" settings must have "repeat": false`);
      }
      const fields = Object.keys(settings.config?.fields ?? {});
      for (const id of SETTINGS_FIELDS) {
        if (!fields.includes(id)) {
          problems.push(`${rel("model.json")}: variation "${variation.id}" settings lacks "${id}"`);
        }
      }
    }
    if (primary.title?.type === "StructuredText") hasTitleField = true;
  }

  // --- mocks
  if (!missing.includes("mocks.json")) {
    try {
      const mocks = JSON.parse(await readFile(file("mocks.json"), "utf8"));
      if (!Array.isArray(mocks) || !mocks.length) {
        problems.push(`${rel("mocks.json")}: must be a non-empty array (one entry per variation)`);
      } else {
        const modelIds = new Set(variations.map((v) => v.id));
        const mockIds = new Set(mocks.map((m) => m.variation));
        for (const id of modelIds) {
          if (!mockIds.has(id)) problems.push(`${rel("mocks.json")}: no mock for variation "${id}"`);
        }
        for (const id of mockIds) {
          if (!modelIds.has(id)) problems.push(`${rel("mocks.json")}: variation "${id}" is not in model.json`);
        }
        for (const mock of mocks) {
          if (mock.slice_type !== model.id) {
            problems.push(`${rel("mocks.json")}: slice_type "${mock.slice_type}" ≠ model id "${model.id}"`);
          }
        }
      }
    } catch (error) {
      problems.push(`${rel("mocks.json")}: invalid JSON (${error.message})`);
    }
  }

  // --- index.jsx
  const jsx = await readFile(file("index.jsx"), "utf8");
  if (/^\s*["']use client["']/m.test(jsx)) {
    problems.push(`${rel("index.jsx")}: "use client" — keep the slice a server component, isolate the client part in a child (§3.1)`);
  }
  if (!/from\s+["']@\/components\/SliceSection["']/.test(jsx) || !/<SliceSection\b/.test(jsx)) {
    problems.push(`${rel("index.jsx")}: must wrap in <SliceSection> (§3.1)`);
  }
  if (!new RegExp(`wrapperClassName=["']${block}__wrapper["']`).test(jsx)) {
    problems.push(`${rel("index.jsx")}: SliceSection needs wrapperClassName="${block}__wrapper" (§4.2)`);
  }
  if (!new RegExp(`import\\s+["']\\./${block}\\.scss["']`).test(jsx)) {
    problems.push(`${rel("index.jsx")}: must import "./${block}.scss"`);
  }
  if (hasTitleField && !/SliceTitle/.test(jsx)) {
    problems.push(`${rel("index.jsx")}: model has a rich text "title" — render it with <SliceTitle> (§3.1)`);
  }
  const hardTitle = jsx.match(/<h[1-6]\b[^>]*className=["'][^"']*__title\b/);
  if (hardTitle) {
    problems.push(`${rel("index.jsx")}: hard-coded ${hardTitle[0].slice(0, 3)} for the slice title — use <SliceTitle> (§3.1)`);
  }
  for (const image of jsx.matchAll(/<PrismicNextImage\b([\s\S]*?)\/>/g)) {
    const attrs = image[1];
    // Fixed-size images (avatars, icons) declare width + height instead of sizes.
    const fixed = /\bwidth=/.test(attrs) && /\bheight=/.test(attrs);
    if (!fixed && !/\bsizes=/.test(attrs)) problems.push(`${rel("index.jsx")}: <PrismicNextImage> without sizes (or width + height) (§3.1)`);
    if (!/\b(fallbackAlt|alt)=/.test(attrs)) problems.push(`${rel("index.jsx")}: <PrismicNextImage> without fallbackAlt="" (§7)`);
  }

  // --- scss
  if (!missing.includes(`${block}.scss`)) {
    const scss = (await readFile(file(`${block}.scss`), "utf8"))
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/\/\/.*$/gm, "")
      .replace(/(["'])(?:\\.|(?!\1).)*\1/g, "");
    const seen = new Set();
    for (const match of scss.matchAll(/(?<![\w\d@$])\.([a-zA-Z][\w-]*)/g)) {
      const cls = match[1];
      if (seen.has(cls)) continue;
      seen.add(cls);
      const own = cls === block || cls.startsWith(`${block}__`) || cls.startsWith(`${block}--`);
      if (!own && !GLOBAL_CLASS.some((re) => re.test(cls))) {
        problems.push(`${rel(`${block}.scss`)}: ".${cls}" is not in block "${block}" nor an allowed global class (§4.2)`);
      }
    }
  }

  return problems;
}

/** @param {string} libraryRel */
async function checkLibrary(libraryRel) {
  const dir = path.join(root, libraryRel);
  if (!(await exists(dir))) return { count: 0, problems: [] };
  const entries = (await readdir(dir, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory() && /^[A-Z]/.test(entry.name))
    .filter((entry) => !flags.only || entry.name === flags.only);
  const problems = [];
  for (const entry of entries) {
    problems.push(...(await checkSlice(path.join(dir, entry.name), entry.name)));
  }
  return { count: entries.length, problems };
}

const libraries = ["src/slices", ...(flags.examples ? ["examples/slices"] : [])];
let total = 0;
const problems = [];
for (const library of libraries) {
  const result = await checkLibrary(library);
  total += result.count;
  problems.push(...result.problems);
}

if (problems.length) {
  console.error(`slice:check — ${problems.length} problem(s) in ${total} slice(s):\n`);
  for (const problem of problems) console.error(`  ✖ ${problem}`);
  console.error("");
  process.exit(1);
}

console.log(`slice:check — ${total} slice(s) OK (${libraries.join(", ")})`);
