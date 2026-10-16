#!/usr/bin/env node
/**
 * Copy one slice folder from a batch worktree onto this repo, connect it to
 * homepage and page, and regenerate types. Does not commit or push.
 *
 *   npm run slice:land -- --name Faq --from .worktrees/faq
 *
 * The worktree built the slice (model, component, styles, mocks). This command
 * brings only `src/slices/<Name>/` back. Shared files (custom types, slice
 * index, generated types) are updated here, on main's working tree.
 */
import { spawnSync } from "node:child_process";
import { access, cp, readFile } from "node:fs/promises";
import path from "node:path";
import { parseArgs } from "node:util";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CONNECT_TYPES = ["homepage", "page"];

const { values: flags } = parseArgs({
  options: {
    name: { type: "string" },
    from: { type: "string" },
    "no-connect": { type: "boolean", default: false },
  },
  strict: true,
});

const name = flags.name;
const fromRoot = flags.from ? path.resolve(flags.from) : "";

if (!name || !/^[A-Z][A-Za-z0-9]*$/.test(name) || !fromRoot) {
  console.error(`Usage: npm run slice:land -- --name <PascalCaseName> --from <worktree>

Copies <worktree>/src/slices/<Name> into this repo, connects homepage + page,
and runs prismic gen types / slice-index. Does not commit or push.`);
  process.exit(1);
}

const sourceDir = path.join(fromRoot, "src", "slices", name);
const destDir = path.join(root, "src", "slices", name);

const exists = (target) => access(target).then(() => true, () => false);

const runPrismic = (args) => {
  const result = spawnSync(
    "npx",
    [
      "prismic",
      ...args,
      "--analytics-task-id",
      crypto.randomUUID(),
      "--analytics-intent",
      `Land slice ${name} from batch worktree`,
    ],
    { cwd: root, stdio: "inherit", env: process.env },
  );
  if (result.status !== 0) {
    throw new Error(`prismic ${args.join(" ")} failed (${result.status})`);
  }
};

const alreadyConnected = async (type, id) => {
  const model = JSON.parse(
    await readFile(path.join(root, "customtypes", type, "index.json"), "utf8"),
  );
  return Boolean(model.json?.Main?.slices?.config?.choices?.[id]);
};

const main = async () => {
  if (!(await exists(path.join(sourceDir, "model.json")))) {
    throw new Error(`No model at ${sourceDir}. The worktree did not scaffold ${name}.`);
  }
  if (!(await exists(path.join(sourceDir, "index.jsx")))) {
    throw new Error(`No index.jsx at ${sourceDir}.`);
  }
  if (!(await exists(path.join(sourceDir, "mocks.json")))) {
    throw new Error(`No mocks.json at ${sourceDir}.`);
  }
  if (await exists(destDir)) {
    throw new Error(`${path.relative(root, destDir)} already exists. Refusing to overwrite.`);
  }

  await cp(sourceDir, destDir, { recursive: true });
  console.log(`  ✓ copied ${path.relative(root, destDir)}`);

  const model = JSON.parse(await readFile(path.join(destDir, "model.json"), "utf8"));
  const id = model.id;
  if (!id) throw new Error("model.json has no id.");

  if (!flags["no-connect"]) {
    for (const type of CONNECT_TYPES) {
      if (await alreadyConnected(type, id)) {
        console.log(`  – already connected to ${type}`);
        continue;
      }
      runPrismic(["slice", "connect", id, "--to", type]);
    }
  }

  runPrismic(["gen", "types"]);
  runPrismic(["gen", "slice-index"]);

  console.log(`
Landed ${name} (${id}) on this working tree.
Next: commit on main. Do not prismic push or git push until the batch queue is done.
`);
};

main().catch((error) => {
  console.error(`\nslice:land failed: ${error.message}`);
  process.exit(1);
});
