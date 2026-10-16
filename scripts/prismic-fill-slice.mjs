#!/usr/bin/env node
/**
 * Append one slice variation from mocks.json (or stdin) onto a Prismic page
 * as a Migration Release draft. Does not publish.
 *
 *   npm run prismic:fill -- --slice Cover
 *   npm run prismic:fill -- --slice Cover --variation cardRight
 *   npm run prismic:fill -- --slice Cover --document page --uid about
 *   npm run prismic:fill -- --slice Cover --from-stdin < slice.json
 */
import { parseArgs } from "node:util";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as prismic from "@prismicio/client";

import { loadEnv } from "./lib/load-env.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const { values: flags } = parseArgs({
  options: {
    slice: { type: "string" },
    variation: { type: "string", default: "default" },
    document: { type: "string", default: "homepage" },
    uid: { type: "string" },
    lang: { type: "string" },
    "from-stdin": { type: "boolean", default: false },
  },
  strict: true,
});

const normalize = (value) =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, "");

const isImageField = (node) =>
  node &&
  typeof node === "object" &&
  typeof node.url === "string" &&
  node.url.startsWith("http") &&
  node.dimensions &&
  typeof node.dimensions.width === "number";

const isMediaLink = (node) =>
  node &&
  typeof node === "object" &&
  node.link_type === "Media" &&
  typeof node.url === "string" &&
  node.url.startsWith("http");

/**
 * Replace mock image / media URLs with Migration asset refs.
 *
 * @param {unknown} node
 * @param {ReturnType<typeof prismic.createMigration>} migration
 */
const replaceAssets = (node, migration) => {
  if (Array.isArray(node)) {
    return node.map((item) => replaceAssets(item, migration));
  }
  if (!node || typeof node !== "object") return node;

  if (isImageField(node) || isMediaLink(node)) {
    return migration.createAsset(node);
  }

  const next = Array.isArray(node) ? [...node] : { ...node };
  for (const [key, value] of Object.entries(next)) {
    next[key] = replaceAssets(value, migration);
  }
  return next;
};

const toMigrationSlice = (raw, migration) => {
  const primary = replaceAssets(structuredClone(raw.primary ?? {}), migration);
  const items = replaceAssets(structuredClone(raw.items ?? []), migration);
  return {
    slice_type: raw.slice_type,
    variation: raw.variation,
    primary,
    items,
  };
};

const findSliceFolder = async (name) => {
  const slicesRoot = path.join(root, "src/slices");
  const folders = await readdir(slicesRoot);
  const needle = normalize(name);
  const match = folders.find((folder) => normalize(folder) === needle);
  if (!match) {
    throw new Error(
      `No slice folder matching "${name}". Looked in src/slices/ (${folders.join(", ")}).`,
    );
  }
  return path.join(slicesRoot, match);
};

const readStdin = async () => {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  return Buffer.concat(chunks).toString("utf8");
};

const loadMockSlice = async () => {
  if (flags["from-stdin"]) {
    const raw = JSON.parse(await readStdin());
    const list = Array.isArray(raw) ? raw : [raw];
    const slice =
      list.find((entry) => entry.variation === flags.variation) ?? list[0];
    if (!slice?.slice_type) {
      throw new Error("stdin JSON must be a slice object (or array) with slice_type.");
    }
    return slice;
  }

  if (!flags.slice) {
    throw new Error("Missing --slice <Name> (or pass a slice JSON with --from-stdin).");
  }

  const folder = await findSliceFolder(flags.slice);
  const mocks = JSON.parse(
    await readFile(path.join(folder, "mocks.json"), "utf8"),
  );
  const slice = mocks.find((entry) => entry.variation === flags.variation);
  if (!slice) {
    const known = mocks.map((entry) => entry.variation).join(", ");
    throw new Error(
      `Variation "${flags.variation}" not in ${path.relative(root, folder)}/mocks.json (${known}).`,
    );
  }
  return slice;
};

const loadPage = async (client) => {
  const type = flags.document;
  const params = flags.lang ? { lang: flags.lang } : undefined;
  if (type === "homepage") {
    return client.getSingle("homepage", params);
  }
  if (!flags.uid) {
    throw new Error(`--uid is required when --document is "${type}" (not homepage).`);
  }
  return client.getByUID(type, flags.uid, params);
};

await loadEnv(root);

if (!flags.slice && !flags["from-stdin"]) {
  console.error(
    "Usage: npm run prismic:fill -- --slice Cover [--variation default] [--document homepage] [--uid <uid>]",
  );
  process.exit(1);
}

const prismicConfig = JSON.parse(
  await readFile(path.join(root, "prismic.config.json"), "utf8"),
);

const writeToken = process.env.PRISMIC_WRITE_TOKEN;
if (!writeToken) {
  console.error(
    "PRISMIC_WRITE_TOKEN is missing. Create a write token in Prismic (Settings → API & Security) and add it to .env.local.",
  );
  process.exit(1);
}

const repositoryName =
  process.env.NEXT_PUBLIC_PRISMIC_ENVIRONMENT || prismicConfig.repositoryName;

const writeClient = prismic.createWriteClient(repositoryName, { writeToken });
const migration = prismic.createMigration();

let page;
try {
  page = await loadPage(writeClient);
} catch (error) {
  console.error(
    `Could not load ${flags.document}${flags.uid ? ` uid=${flags.uid}` : ""}. Create the document in the Page Builder first.`,
  );
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}

const mock = await loadMockSlice();
const slice = toMigrationSlice(mock, migration);
const slices = [...(page.data.slices ?? []), slice];

migration.updateDocument({
  ...page,
  data: { ...page.data, slices },
});

await writeClient.migrate(migration, {
  reporter: (event) => {
    const type = event.type ?? event.event;
    if (type) console.log(`  ${type}`);
  },
});

const where = flags.uid
  ? `${flags.document}/${flags.uid}`
  : flags.document;

console.log(
  `Appended ${slice.slice_type} (${slice.variation}) to ${where}. Review the Migration Release in https://${repositoryName}.prismic.io — not published.`,
);
