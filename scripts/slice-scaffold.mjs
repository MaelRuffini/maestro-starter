#!/usr/bin/env node
/**
 * Create a slice, inject the shared `settings` group and the content fields,
 * connect it to the page types, and regenerate types — one command.
 *
 *   npm run slice:scaffold -- CtaCards --fields /tmp/cta-cards-fields.json
 *   npm run slice:scaffold -- --name CtaCards --id cta_cards --fields fields.json
 *   npm run slice:scaffold -- CtaCards --no-settings
 *   npm run slice:scaffold -- Stats --fields fields.json --from Grid
 *
 * `--fields` is a JSON array (or `{ "fields": [...] }`). Each item:
 *   { "id", "type", "label", ... }
 * Types: rich-text (single | allow), text, image, link (allow, allowText,
 * variants, placeholder), select (options, default), boolean (trueLabel,
 * falseLabel), number (min, max, placeholder), group (fields, repeat:false),
 * content-relationship (customType, fields[], tags[]) — the editor picks a
 * document of `customType`; `fields` are fetched inline (SKILL.md §3.7).
 *
 * `--from <Example>` copies `index.jsx`, `<example>.scss` and any extra `.jsx`
 * from `examples/slices/<Example>/` (the skill's reference slices, not live
 * slices) into the new folder, renaming the component and the BEM block.
 * `model.json` and `mocks.json` still come from the CLI + `--fields`; the copied
 * component is a starting point to edit against the approved brief.
 *
 * `npx prismic field add` is only for extending a slice that already exists.
 */
import { spawnSync } from "node:child_process";
import { access, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { parseArgs } from "node:util";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const SETTINGS_GROUP = {
  config: {
    fields: {
      padding_top: {
        config: {
          default_value: "Main (128px)",
          label: "Padding top",
          options: [
            "None",
            "Small (64px)",
            "Main (128px)",
            "Large (160px)",
            "Page top (184px)",
          ],
        },
        type: "Select",
      },
      padding_bottom: {
        config: {
          default_value: "Main (128px)",
          label: "Padding bottom",
          options: [
            "None",
            "Small (64px)",
            "Main (128px)",
            "Large (160px)",
            "Page top (184px)",
          ],
        },
        type: "Select",
      },
      theme: {
        config: {
          default_value: "Inherit",
          label: "Theme",
          options: ["Inherit", "Light", "Dark", "Brand"],
        },
        type: "Select",
      },
      panel_animation: {
        config: {
          label: "Panel animation",
          placeholder_false: "Off",
          placeholder_true: "On",
        },
        type: "Boolean",
      },
    },
    label: "Settings",
    repeat: false,
  },
  type: "Group",
};

const CONNECT_TYPES = ["homepage", "page"];

const invokedDirectly =
  process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

const cli = invokedDirectly
  ? parseArgs({
      allowPositionals: true,
      options: {
        name: { type: "string" },
        id: { type: "string" },
        fields: { type: "string" },
        from: { type: "string" },
        "no-settings": { type: "boolean", default: false },
        "no-connect": { type: "boolean", default: false },
      },
      strict: true,
    })
  : { values: {}, positionals: [] };

const { values: flags, positionals } = cli;

const name = flags.name || positionals[0];

if (invokedDirectly && !name) {
  console.error(`Usage: npm run slice:scaffold -- <PascalCaseName> [--fields file.json] [--from Example] [--id slice_id] [--no-settings] [--no-connect]

Creates the slice, injects the shared settings group (repeat: false),
injects content fields from --fields, optionally copies the component + SCSS
of a reference from examples/slices/<Example>, connects homepage + page, and
runs prismic gen types / slice-index once.`);
  process.exit(1);
}

if (invokedDirectly && !/^[A-Z][A-Za-z0-9]*$/.test(name)) {
  console.error(`--name must be PascalCase (got "${name}").`);
  process.exit(1);
}

if (invokedDirectly && flags.from && !/^[A-Z][A-Za-z0-9]*$/.test(flags.from)) {
  console.error(`--from must be a PascalCase example name (got "${flags.from}").`);
  process.exit(1);
}

const toSnake = (value) =>
  value
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1_$2")
    .toLowerCase();

const toKebab = (value) => toSnake(value).replace(/_/g, "-");

const sliceId = invokedDirectly ? flags.id || toSnake(name) : "";
const sliceDir = invokedDirectly ? path.join(root, "src", "slices", name) : "";
const examplesDir = path.join(root, "examples", "slices");
const modelPath = invokedDirectly ? path.join(sliceDir, "model.json") : "";
const taskId = invokedDirectly ? crypto.randomUUID() : "";
const analytics = [
  "--analytics-task-id",
  taskId,
  "--analytics-intent",
  `Scaffold slice ${name} with shared settings`,
];

const exists = (p) => access(p).then(() => true, () => false);

const joinAllow = (value, id, key) => {
  const list = Array.isArray(value) ? value : String(value).split(",");
  const cleaned = list.map((item) => item.trim()).filter(Boolean);
  if (!cleaned.length) throw new Error(`${id}: ${key} is empty`);
  return cleaned.join(",");
};

/**
 * @param {object} spec
 * @returns {{ id: string, field: object }}
 */
export const compileField = (spec) => {
  const id = spec?.id;
  if (!id || !/^[a-z][a-z0-9_]*$/.test(id)) {
    throw new Error(`Field id must be snake_case (got "${id}").`);
  }
  if (id === "settings") throw new Error('Field id "settings" is reserved.');

  const label = spec.label || id;
  switch (spec.type) {
    case "rich-text": {
      const config = { label };
      if (spec.single) config.single = joinAllow(spec.single, id, "single");
      else if (spec.allow) config.multi = joinAllow(spec.allow, id, "allow");
      else throw new Error(`${id}: rich-text needs "single" or "allow".`);
      if (spec.placeholder) config.placeholder = spec.placeholder;
      return { id, field: { config, type: "StructuredText" } };
    }
    case "text": {
      const config = { label };
      if (spec.placeholder) config.placeholder = spec.placeholder;
      return { id, field: { config, type: "Text" } };
    }
    case "image": {
      const config = { label };
      if (spec.placeholder) config.placeholder = spec.placeholder;
      return { id, field: { config, type: "Image" } };
    }
    case "link": {
      const config = { label };
      if (spec.allowText) config.allowText = true;
      if (spec.variants?.length) config.variants = spec.variants;
      if (spec.placeholder) config.placeholder = spec.placeholder;
      const allow = spec.allow || [];
      if (allow.includes("web") || allow.includes("Web")) {
        config.select = "web";
        config.allowTargetBlank = spec.allowTargetBlank !== false;
      }
      return { id, field: { config, type: "Link" } };
    }
    case "select": {
      if (!spec.options?.length) throw new Error(`${id}: select needs options.`);
      const config = { label, options: spec.options };
      if (spec.default) config.default_value = spec.default;
      return { id, field: { config, type: "Select" } };
    }
    case "boolean":
      return {
        id,
        field: {
          config: {
            label,
            placeholder_false: spec.falseLabel || "Off",
            placeholder_true: spec.trueLabel || "On",
          },
          type: "Boolean",
        },
      };
    case "number": {
      const config = { label };
      if (spec.placeholder) config.placeholder = spec.placeholder;
      if (spec.min !== undefined) config.min = spec.min;
      if (spec.max !== undefined) config.max = spec.max;
      return { id, field: { config, type: "Number" } };
    }
    case "content-relationship": {
      if (!spec.customType || typeof spec.customType !== "string") {
        throw new Error(`${id}: content-relationship needs "customType" (one type id).`);
      }
      const config = {
        label,
        select: "document",
        customtypes: [
          Array.isArray(spec.fields) && spec.fields.length
            ? { id: spec.customType, fields: spec.fields }
            : { id: spec.customType },
        ],
      };
      if (Array.isArray(spec.tags) && spec.tags.length) config.tags = spec.tags;
      return { id, field: { config, type: "Link" } };
    }
    case "group": {
      if (!spec.fields?.length) throw new Error(`${id}: group needs fields.`);
      const fields = {};
      for (const child of spec.fields) {
        const compiled = compileField(child);
        if (fields[compiled.id]) throw new Error(`${id}.${compiled.id} is duplicated.`);
        fields[compiled.id] = compiled.field;
      }
      const config = { label, fields };
      if (spec.repeat === false) config.repeat = false;
      return { id, field: { config, type: "Group" } };
    }
    default:
      throw new Error(`${id}: unknown field type "${spec.type}".`);
  }
};

/**
 * @param {unknown} raw
 * @returns {{ id: string, field: object }[]}
 */
export const compileFields = (raw) => {
  const list = Array.isArray(raw) ? raw : raw?.fields;
  if (!Array.isArray(list) || !list.length) {
    throw new Error('--fields JSON must be a non-empty array, or { "fields": [...] }.');
  }
  const compiled = list.map((spec) => compileField(spec));
  const seen = new Set();
  for (const { id } of compiled) {
    if (seen.has(id)) throw new Error(`Duplicated field id "${id}".`);
    seen.add(id);
  }
  return compiled;
};

const injectFields = (model, compiled) => {
  for (const variation of model.variations ?? []) {
    const primary = variation.primary ?? {};
    for (const { id } of compiled) {
      if (primary[id]) throw new Error(`Field "${id}" already exists on variation "${variation.id}".`);
    }
    const next = {};
    if (primary.settings) next.settings = primary.settings;
    for (const { id, field } of compiled) next[id] = field;
    for (const [key, value] of Object.entries(primary)) {
      if (key !== "settings" && !next[key]) next[key] = value;
    }
    variation.primary = next;
  }
};

const runPrismic = (args) => {
  const result = spawnSync("npx", ["prismic", ...args, ...analytics], {
    cwd: root,
    stdio: "inherit",
    env: process.env,
  });
  if (result.status !== 0) {
    throw new Error(`prismic ${args.join(" ")} failed (${result.status})`);
  }
};

/**
 * Copy the component files of `examples/slices/<example>` into the new slice
 * folder, renaming the component (`Example` → `Name`) and the BEM block
 * (`example-kebab` → `name-kebab`). The block is only renamed where it is used
 * as a class / file name (`.block__x`, `block--x`, `"block"`, `block.scss`), so
 * `display: grid` or `grid-template-columns` survive a `--from Grid`.
 *
 * @param {string} example PascalCase example folder name
 */
const copyExample = async (example) => {
  const exampleDir = path.join(examplesDir, example);
  if (!(await exists(path.join(exampleDir, "index.jsx")))) {
    const available = (await readdir(examplesDir, { withFileTypes: true }).catch(() => []))
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name);
    throw new Error(
      `No example "${example}" in examples/slices/ (available: ${available.join(", ") || "none"}).`,
    );
  }

  const exampleBlock = toKebab(example);
  const block = toKebab(name);
  const pascal = new RegExp(`\\b${example}(?=[A-Z_]|\\b)`, "g");
  const kebab = new RegExp(`(?<![\\w-])${exampleBlock}(?=__|--|\\.scss|["'\`\\s])`, "g");

  const rename = (text) =>
    text
      .replace(/^\/\/ Reference:.*\n/, "")
      .replace(pascal, name)
      .replace(kebab, block);

  const entries = await readdir(exampleDir, { withFileTypes: true });
  const copied = [];
  for (const entry of entries) {
    if (!entry.isFile()) continue;
    const isComponent = entry.name.endsWith(".jsx");
    const isStyle = entry.name === `${exampleBlock}.scss`;
    if (!isComponent && !isStyle) continue;

    const target = isStyle ? `${block}.scss` : entry.name.replace(pascal, name);
    const source = await readFile(path.join(exampleDir, entry.name), "utf8");
    await writeFile(path.join(sliceDir, target), rename(source));
    copied.push(target);
  }
  return copied;
};

const injectSettings = (model) => {
  let changed = false;
  for (const variation of model.variations ?? []) {
    const primary = variation.primary ?? {};
    if (primary.settings) continue;
    variation.primary = { settings: SETTINGS_GROUP, ...primary };
    changed = true;
  }
  return changed;
};

const main = async () => {
  if (await exists(modelPath)) {
    throw new Error(`src/slices/${name}/ already exists.`);
  }

  const compiled = flags.fields
    ? compileFields(JSON.parse(await readFile(flags.fields, "utf8")))
    : [];

  const createArgs = ["slice", "create", name];
  if (flags.id) createArgs.push("--id", flags.id);
  runPrismic(createArgs);

  if (!(await exists(modelPath))) {
    throw new Error(`Expected ${path.relative(root, modelPath)} after slice create.`);
  }

  const model = JSON.parse(await readFile(modelPath, "utf8"));
  const id = model.id || sliceId;

  if (!flags["no-settings"]) {
    if (injectSettings(model)) {
      console.log(`  ✓ settings group injected (repeat: false)`);
    } else {
      console.log("  – settings already present, left untouched");
    }
  }

  if (compiled.length) {
    injectFields(model, compiled);
    console.log(`  ✓ ${compiled.length} content field(s) injected`);
  }

  await writeFile(modelPath, JSON.stringify(model, null, 2) + "\n");

  if (flags.from) {
    const copied = await copyExample(flags.from);
    console.log(`  ✓ copied ${copied.join(", ")} from examples/slices/${flags.from}`);
  }

  if (!flags["no-connect"]) {
    for (const type of CONNECT_TYPES) {
      runPrismic(["slice", "connect", id, "--to", type]);
    }
  }

  runPrismic(["gen", "types"]);
  runPrismic(["gen", "slice-index"]);

  console.log(`
Scaffolded ${name} (${id}).
${compiled.length ? "Content fields are in the model. Do not run field add for them." : "No --fields file was passed. Extend this slice later with npx prismic field add, then npx prismic gen types."}
${flags.from ? `The component and SCSS were copied from examples/slices/${flags.from}. Rework them against the approved brief: field ids, layout classes and mocks.json are not the example's.` : ""}`);
};

if (invokedDirectly) {
  main().catch((error) => {
    console.error(`\nslice:scaffold failed: ${error.message}`);
    process.exit(1);
  });
}
