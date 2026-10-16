#!/usr/bin/env node
/**
 * Point this codebase at a Prismic repository — the one gesture that connects
 * a project (or the template itself) to its content repository.
 *
 *   npm run prismic:connect -- <domain>                 # write prismic.config.json, show status
 *   npm run prismic:connect -- <domain> --push          # + push local models (first push on a fresh repo)
 *   npm run prismic:connect -- <domain> --push --preview  # + Development preview + simulator
 *
 * <domain> is the subdomain of <domain>.prismic.io (`npx prismic repo list`
 * shows DOMAIN vs display NAME — the display name is cosmetic and never used
 * by the code).
 *
 * `--push` refuses when the remote has models the local tree does not (it
 * would delete them): decide by hand with `npx prismic push --force`, or
 * connect to a fresh repository. Never run `prismic init` / `prismic pull`
 * on a fresh repository before the first push.
 */
import { spawnSync } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { parseArgs } from "node:util";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const { values: flags, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    push: { type: "boolean", default: false },
    preview: { type: "boolean", default: false },
    "site-url": { type: "string", default: "http://localhost:3000" },
  },
  strict: true,
});

const domain = positionals[0];
if (!domain || !/^[a-z0-9][a-z0-9-]*$/.test(domain)) {
  console.error(`Usage: npm run prismic:connect -- <domain> [--push] [--preview] [--site-url http://localhost:3000]

<domain> is the subdomain of <domain>.prismic.io (lowercase, digits, dashes).
Run \`npx prismic repo list\` to see your repositories.`);
  process.exit(1);
}

const taskId = crypto.randomUUID();
const analytics = [
  "--analytics-task-id",
  taskId,
  "--analytics-intent",
  `Connect the codebase to the Prismic repository ${domain}`,
];

/**
 * @param {string[]} args
 * @param {{ capture?: boolean }} [options]
 */
const prismic = (args, { capture = false } = {}) => {
  const result = spawnSync("npx", ["prismic", ...args, ...analytics], {
    cwd: root,
    stdio: capture ? ["inherit", "pipe", "pipe"] : "inherit",
    env: process.env,
    encoding: "utf8",
  });
  return result;
};

const configPath = path.join(root, "prismic.config.json");
const config = JSON.parse(await readFile(configPath, "utf8"));
const previous = config.repositoryName;
config.repositoryName = domain;
await writeFile(configPath, JSON.stringify(config, null, 2) + "\n");
console.log(
  previous === domain
    ? `prismic.config.json already points at ${domain}.prismic.io`
    : `  ✓ prismic.config.json: ${previous} → ${domain}`,
);

const status = prismic(["status"], { capture: true });
process.stdout.write(status.stdout ?? "");
if (status.status !== 0) {
  process.stderr.write(status.stderr ?? "");
  console.error(`\nprismic status failed. Are you logged in (npx prismic login) and is "${domain}" one of your repositories?`);
  process.exit(1);
}

const remoteOnly = /Remote-only:\n((?:\s{2}.+\n)+)/.exec(status.stdout ?? "")?.[1]?.trim();

if (flags.push) {
  if (remoteOnly) {
    console.error(`
Not pushing: the remote has models this codebase does not —

${remoteOnly.replace(/^/gm, "  ")}

A push would delete them. If that is intended, run \`npx prismic push --force\`
yourself. If you meant a fresh repository, create it and connect to that one.`);
    process.exit(1);
  }
  const push = prismic(["push"]);
  if (push.status !== 0) process.exit(push.status ?? 1);
}

if (flags.preview) {
  const base = flags["site-url"].replace(/\/$/, "");
  const add = prismic(["preview", "add", `${base}/api/preview`, "--name", "Development"]);
  if (add.status !== 0) console.warn("  – preview add failed (already registered?). Continuing.");
  const sim = prismic(["preview", "set-simulator", base]);
  if (sim.status !== 0) console.warn("  – set-simulator failed. Continuing.");
}

console.log(`
Connected to https://${domain}.prismic.io
${flags.push ? "" : "  Next: npx prismic push   (first push on a fresh repository — never init/pull before it)\n"}${flags.preview ? "" : `  Next: npx prismic preview add ${flags["site-url"]}/api/preview --name Development\n        npx prismic preview set-simulator ${flags["site-url"]}\n`}  Then create and publish "Homepage" and "Settings" in the Page Builder.
`);
