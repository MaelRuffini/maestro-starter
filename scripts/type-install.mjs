#!/usr/bin/env node
/**
 * Install a custom type recipe from `examples/recipes/<name>/` into the
 * project (SKILL.md §3.7, §5). Local only: nothing is pushed.
 *
 *   npm run type:install -- article
 *   npm run type:install -- testimonial
 *   node scripts/type-install.mjs --list
 *
 * A recipe is a folder mirroring the repo root plus a `recipe.json`:
 *   recipe.json                      { type, label, description, route|null, after[] }
 *   customtypes/<type>/index.json    the model (CLI-generated)
 *   src/**                           optional: page route, styles, components
 *
 * The installer copies every file (refusing to overwrite), adds the route to
 * prismic.config.json, runs `prismic gen types`, and prints the recipe's
 * follow-up steps. Then: `npx prismic push` when you are ready.
 */
import { spawnSync } from "node:child_process";
import { access, cp, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { parseArgs } from "node:util";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const recipesDir = path.join(root, "examples", "recipes");

const { values: flags, positionals } = parseArgs({
  allowPositionals: true,
  options: { list: { type: "boolean", default: false } },
  strict: true,
});

const exists = (target) => access(target).then(() => true, () => false);

const listRecipes = async () => {
  const entries = await readdir(recipesDir, { withFileTypes: true }).catch(() => []);
  const recipes = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    try {
      const manifest = JSON.parse(
        await readFile(path.join(recipesDir, entry.name, "recipe.json"), "utf8"),
      );
      recipes.push({ name: entry.name, ...manifest });
    } catch {
      /* not a recipe */
    }
  }
  return recipes;
};

if (flags.list || !positionals[0]) {
  const recipes = await listRecipes();
  console.log(recipes.length ? "Available recipes:\n" : "No recipes in examples/recipes/.");
  for (const recipe of recipes) {
    console.log(`  ${recipe.name.padEnd(14)} ${recipe.description}`);
  }
  if (!flags.list) {
    console.log("\nUsage: npm run type:install -- <recipe>");
    process.exit(1);
  }
  process.exit(0);
}

const name = positionals[0];
const recipeDir = path.join(recipesDir, name);
const manifestPath = path.join(recipeDir, "recipe.json");
if (!(await exists(manifestPath))) {
  console.error(`No recipe "${name}". Run \`node scripts/type-install.mjs --list\`.`);
  process.exit(1);
}
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));

// 1. Collect files and refuse to overwrite anything.
const files = [];
const walk = async (dir) => {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) await walk(full);
    else if (full !== manifestPath) files.push(path.relative(recipeDir, full));
  }
};
await walk(recipeDir);

const clashes = [];
for (const rel of files) if (await exists(path.join(root, rel))) clashes.push(rel);
if (clashes.length) {
  console.error(`Refusing to overwrite existing files:\n  ${clashes.join("\n  ")}\n\nRemove or rename them, then retry.`);
  process.exit(1);
}

// 2. Copy.
for (const rel of files) {
  await cp(path.join(recipeDir, rel), path.join(root, rel), { recursive: true });
  console.log(`  ✓ ${rel}`);
}

// 3. Route.
if (manifest.route) {
  const configPath = path.join(root, "prismic.config.json");
  const config = JSON.parse(await readFile(configPath, "utf8"));
  config.routes ??= [];
  if (config.routes.some((route) => route.type === manifest.type)) {
    console.log(`  – route for "${manifest.type}" already in prismic.config.json`);
  } else {
    config.routes.push({ type: manifest.type, path: manifest.route });
    // Catch-all "/:uid" must stay last.
    config.routes.sort((a, b) => Number(a.path === "/:uid") - Number(b.path === "/:uid"));
    await writeFile(configPath, JSON.stringify(config, null, 2) + "\n");
    console.log(`  ✓ prismic.config.json: ${manifest.type} → ${manifest.route}`);
  }
}

// 4. Types.
const gen = spawnSync(
  "npx",
  [
    "prismic",
    "gen",
    "types",
    "--analytics-task-id",
    crypto.randomUUID(),
    "--analytics-intent",
    `Install the ${name} custom type recipe`,
  ],
  { cwd: root, stdio: "inherit", env: process.env },
);
if (gen.status !== 0) process.exit(gen.status ?? 1);

console.log(`
Installed recipe "${name}" (${manifest.label}). Nothing was pushed.

Next:
  npx prismic status       # review, then npx prismic push
${(manifest.after ?? []).map((step) => `  • ${step}`).join("\n")}
`);
