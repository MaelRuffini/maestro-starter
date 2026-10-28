#!/usr/bin/env node
/**
 * Append one slice variation from mocks.json (or stdin) onto a Prismic page
 * as a Migration Release draft. Does not publish.
 *
 * Image bytes are sniffed: a PNG stays a PNG (transparency kept). Each image
 * field must have `alt` (a description, or "" when decorative). That alt is
 * written on the media library asset.
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

const isRichTextImage = (node) =>
  isImageField(node) && node.type === "image";

const EXT_BY_TYPE = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/gif": "gif",
  "image/webp": "webp",
  "image/svg+xml": "svg",
};

/**
 * Sniff the real file type. A PNG stays PNG so transparency is not flattened
 * because the URL had no extension.
 *
 * @param {Uint8Array} bytes
 */
const sniffImageType = (bytes) => {
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  ) {
    return "image/png";
  }
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    bytes.length >= 6 &&
    bytes[0] === 0x47 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x38
  ) {
    return "image/gif";
  }
  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return "image/webp";
  }
  return null;
};

/**
 * Download the mock file and register it with an explicit filename and alt.
 * Prismic copies `alt` onto the media library asset.
 *
 * @param {Record<string, unknown>} node
 * @param {ReturnType<typeof prismic.createMigration>} migration
 * @param {{ requireAlt: boolean, label: string, seen: Map<string, unknown>, index: { n: number } }} ctx
 */
const uploadAsset = async (node, migration, ctx) => {
  if (ctx.requireAlt && (typeof node.alt !== "string")) {
    throw new Error(
      `Image is missing alt (${ctx.label}). Set alt to a short description, or "" if the image is decorative.`,
    );
  }

  const url = node.url.split("?")[0];
  const seen = ctx.seen.get(url);
  if (seen) return seen;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Could not download ${url} (${response.status}). Re-export it from Figma and update the mock URL.`);
  }
  const bytes = new Uint8Array(await response.arrayBuffer());
  const headerType = response.headers.get("content-type")?.split(";")[0]?.trim();
  const type = sniffImageType(bytes) || (headerType?.startsWith("image/") ? headerType : null) || "application/octet-stream";
  const ext = EXT_BY_TYPE[type] || "bin";
  ctx.index.n += 1;
  const filename = `${ctx.label}-${ctx.index.n}.${ext}`;
  const file = new File([bytes], filename, { type });
  const alt = typeof node.alt === "string" && node.alt ? node.alt : undefined;
  const credits = typeof node.copyright === "string" && node.copyright ? node.copyright : undefined;
  const asset = migration.createAsset(file, filename, { alt, credits });
  ctx.seen.set(url, asset);
  console.log(`  ${filename}${alt ? ` — alt: ${alt}` : " — no alt (decorative)"}`);
  return asset;
};

/**
 * Replace mock image / media URLs with Migration asset refs.
 *
 * @param {unknown} node
 * @param {ReturnType<typeof prismic.createMigration>} migration
 * @param {{ label: string, seen: Map<string, unknown>, index: { n: number } }} ctx
 */
const replaceAssets = async (node, migration, ctx) => {
  if (Array.isArray(node)) {
    const next = [];
    for (const item of node) next.push(await replaceAssets(item, migration, ctx));
    return next;
  }
  if (!node || typeof node !== "object") return node;

  if (isRichTextImage(node)) {
    const asset = await uploadAsset(node, migration, { ...ctx, requireAlt: true });
    return { type: "image", id: asset };
  }

  if (isMediaLink(node)) {
    const asset = await uploadAsset(node, migration, { ...ctx, requireAlt: false });
    return {
      link_type: "Media",
      id: asset,
      ...(typeof node.text === "string" ? { text: node.text } : {}),
    };
  }

  if (isImageField(node)) {
    return uploadAsset(node, migration, { ...ctx, requireAlt: true });
  }

  const next = { ...node };
  for (const [key, value] of Object.entries(next)) {
    next[key] = await replaceAssets(value, migration, ctx);
  }
  return next;
};

const toMigrationSlice = async (raw, migration) => {
  const ctx = {
    label: `${raw.slice_type || "slice"}-${raw.variation || "default"}`,
    seen: new Map(),
    index: { n: 0 },
  };
  const primary = await replaceAssets(structuredClone(raw.primary ?? {}), migration, ctx);
  const items = await replaceAssets(structuredClone(raw.items ?? []), migration, ctx);
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
const slice = await toMigrationSlice(mock, migration);
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
