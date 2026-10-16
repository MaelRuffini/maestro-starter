/**
 * Site-wide metadata. `npm run setup` (scripts/init.mjs) rewrites `name` and
 * `description` for each new project created from the template.
 */
export const site = {
  name: "Maestro Boilerplate",
  description: "Site Next.js + Prismic généré depuis le boilerplate Maestro.",
  locale: "fr-FR",
  lang: "fr",
};

/**
 * Absolute origin for canonical URLs (sitemap, robots).
 *
 * `NEXT_PUBLIC_SITE_URL` wins when the public host should be explicit.
 * On Vercel, the project's production domain is used. Locally, the dev server.
 *
 * @returns {string}
 */
export function siteOrigin() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  if (configured) {
    return /^https?:\/\//.test(configured) ? configured : `https://${configured}`;
  }

  const production = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim().replace(
    /\/$/,
    "",
  );
  if (production) return `https://${production}`;

  return "http://localhost:3000";
}
