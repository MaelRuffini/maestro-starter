import { readFileSync } from "node:fs";
import path from "node:path";
import { createClient } from "@prismicio/client";

const prismicConfig = JSON.parse(
  readFileSync(path.join(process.cwd(), "prismic.config.json"), "utf8"),
);

/**
 * Redirects managed by the client in Settings → Redirects. Read once per
 * build; a Prismic "publish" webhook pointed at a Vercel deploy hook makes a
 * CMS change live without a developer (SKILL.md §12). Invalid rows are
 * skipped with a warning, and a missing document (fresh repository) or an
 * unreachable API never fails the build.
 *
 * @returns {Promise<{ source: string, destination: string, permanent: boolean }[]>}
 */
async function cmsRedirects() {
  const repositoryName =
    process.env.NEXT_PUBLIC_PRISMIC_ENVIRONMENT || prismicConfig.repositoryName;

  let rows = [];
  try {
    const client = createClient(repositoryName, {
      accessToken: process.env.PRISMIC_ACCESS_TOKEN || undefined,
    });
    const settings = await client.getSingle("settings");
    rows = settings.data.redirects ?? [];
  } catch (error) {
    if (error?.name !== "NotFoundError") {
      console.warn(`[redirects] ${error.message} — no CMS redirects applied.`);
    }
    return [];
  }

  const rules = [];
  for (const row of rows) {
    const from = row.from?.trim();
    const to = row.to?.trim();
    if (!from && !to) continue;
    if (!from?.startsWith("/") || /\s/.test(from) || !to || from === to) {
      console.warn(`[redirects] skipped invalid row: "${from}" → "${to}"`);
      continue;
    }
    rules.push({ source: from, destination: to, permanent: row.permanent !== false });
  }
  return rules;
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  sassOptions: {
    // Lets any .scss file `@use 'base/breakpoints' as *;` without ../ chains.
    loadPaths: [path.join(process.cwd(), "src/styles")],
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.prismic.io" },
      { protocol: "https", hostname: "*.cdn.prismic.io" },
    ],
  },
  redirects: cmsRedirects,
};

export default nextConfig;
