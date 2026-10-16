#!/usr/bin/env node
/**
 * One-shot bootstrap for a repository created from the Maestro template.
 *
 *   npm run setup                       # interactive
 *   npm run setup -- --name "Studio North" --repo studio-north [--package studio-north] [--description "…"]
 *
 * Deterministic and dependency-free (Node ≥ 18). Asks for the project name and
 * the Prismic repository name, rewrites the files that carry the template
 * identity, creates .env.local, then removes itself.
 */
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { parseArgs } from "node:util";
import { readFile, writeFile, copyFile, rm, access } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const file = (...p) => path.join(root, ...p);

const TEMPLATE_NAME = "Maestro Boilerplate";
const TEMPLATE_SLUG = "maestro-boilerplate";

const slugify = (value) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const exists = (p) => access(p).then(() => true, () => false);

const { values: flags } = parseArgs({
  options: {
    name: { type: "string" },
    package: { type: "string" },
    repo: { type: "string" },
    description: { type: "string" },
  },
});

/**
 * Resolves a value from a CLI flag first, then interactively. Non-interactive
 * runs (agents, CI) must pass flags: a closed stdin fails loudly instead of
 * hanging or silently skipping.
 */
async function ask(rl, flag, question, { defaultValue, validate }) {
  if (flags[flag] !== undefined) {
    const error = validate?.(flags[flag]);
    if (error) throw new Error(`--${flag}: ${error}`);
    return flags[flag];
  }
  if (!stdin.isTTY) {
    throw new Error(`--${flag} is required when not running in a terminal.`);
  }
  for (;;) {
    const raw = (await rl.question(`${question}${defaultValue ? ` (${defaultValue})` : ""}: `)).trim();
    const value = raw || defaultValue || "";
    const error = validate?.(value);
    if (!error) return value;
    console.log(`  ✗ ${error}`);
  }
}

async function editJson(relPath, mutate) {
  const p = file(relPath);
  const json = JSON.parse(await readFile(p, "utf8"));
  mutate(json);
  await writeFile(p, JSON.stringify(json, null, 2) + "\n");
  console.log(`  ✓ ${relPath}`);
}

async function editText(relPath, replacer) {
  const p = file(relPath);
  if (!(await exists(p))) return console.log(`  – ${relPath} (absent, skipped)`);
  const before = await readFile(p, "utf8");
  const after = replacer(before);
  if (after !== before) await writeFile(p, after);
  console.log(`  ✓ ${relPath}`);
}

async function main() {
  const pkg = JSON.parse(await readFile(file("package.json"), "utf8"));
  if (pkg.name !== TEMPLATE_SLUG) {
    console.log(`package.json name is already "${pkg.name}". Setup looks done; nothing to do.`);
    return;
  }

  const rl = stdin.isTTY ? createInterface({ input: stdin, output: stdout }) : null;
  console.log("\nMaestro — project setup\n");

  const slug = (v) => (/^[a-z0-9][a-z0-9-]*$/.test(v) ? null : "Lowercase letters, digits and dashes only.");

  const projectName = await ask(rl, "name", "Project name (human readable)", {
    validate: (v) => (v.length < 2 ? "Please enter a name." : null),
  });
  const defaultDescription = `${projectName} — site officiel.`;

  // Optional flags fall back to their defaults when not in a terminal.
  if (!stdin.isTTY) {
    flags.package ??= slugify(projectName);
    flags.description ??= defaultDescription;
  }

  const packageName = await ask(rl, "package", "Package name", {
    defaultValue: slugify(projectName),
    validate: slug,
  });
  const prismicRepo = await ask(rl, "repo", "Prismic repository name (the <name> in <name>.prismic.io)", {
    defaultValue: packageName,
    validate: slug,
  });
  const description = await ask(rl, "description", "Site description (meta description fallback)", {
    defaultValue: defaultDescription,
  });
  rl?.close();

  console.log("\nApplying…");

  await editJson("package.json", (json) => {
    json.name = packageName;
    json.version = "0.1.0";
    delete json.scripts.setup;
  });

  await editJson("prismic.config.json", (json) => {
    json.repositoryName = prismicRepo;
  });

  await editText("src/lib/site.js", (src) =>
    src
      .replace(/name: ".*?"/, `name: ${JSON.stringify(projectName)}`)
      .replace(/description: ".*?"/, `description: ${JSON.stringify(description)}`),
  );

  await editText("README.md", () =>
    [
      `# ${projectName}`,
      "",
      `Site Next.js + Prismic généré depuis le boilerplate Maestro.`,
      "",
      "## Développement",
      "",
      "```sh",
      "npm install",
      "npm run dev          # http://localhost:3000 — /dev/slices pour la galerie de slices",
      "npm run lint && npm run build",
      "```",
      "",
      "## Prismic",
      "",
      `Dépôt : https://${prismicRepo}.prismic.io`,
      "",
      "```sh",
      "npx prismic login",
      "npx prismic status   # modèles locaux vs distants",
      "npx prismic push     # après création d’un slice (commit d’abord)",
      "```",
      "",
      "## Conventions",
      "",
      "Voir [`SKILL.md`](./SKILL.md) (règles d’architecture, workflow de slice, CSS, accessibilité)",
      "et [`AGENTS.md`](./AGENTS.md) pour les agents IA (`/new-slice`).",
      "",
    ].join("\n"),
  );

  if (await exists(file(".env.local"))) {
    console.log("  – .env.local already exists, left untouched");
  } else {
    await copyFile(file(".env.local.example"), file(".env.local"));
    console.log("  ✓ .env.local created from .env.local.example");
  }

  await rm(file("scripts/init.mjs"));
  console.log("  ✓ scripts/init.mjs removed (the other scripts stay)");

  console.log(`
Done. Next steps (Prismic login required):

  1. npx prismic login
  2. Make sure the Prismic repository exists. Create it from the Prismic
     dashboard to choose the domain ("${prismicRepo}" → ${prismicRepo}.prismic.io);
     \`npx prismic repo create\` works too but assigns a random domain.
  3. npm run prismic:connect -- <domain> --push --preview
     Writes prismic.config.json, pushes customtypes/ and src/slices/*/model.json,
     registers the Development preview and the simulator.
     !! Do NOT run "prismic init" or "prismic pull" before this first push:
        they treat the (empty) remote as the source of truth and delete local models.
  4. In the Page Builder, create and publish "Homepage" and "Settings".
  5. git add -A && git commit -m "chore: bootstrap ${projectName}"
`);
}

main().catch((error) => {
  console.error("\nSetup failed:", error.message);
  process.exit(1);
});
