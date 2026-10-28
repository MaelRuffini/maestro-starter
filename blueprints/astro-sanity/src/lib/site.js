/**
 * Rewritten by scripts/init.mjs (npm run setup).
 */
export const site = {
  name: "Maestro Astro",
  description: "Marketing website",
  lang: "fr",
};

export function getSiteDefaults() {
  return site;
}

export function siteOrigin() {
  return (
    import.meta.env.PUBLIC_SITE_URL ||
    (import.meta.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${import.meta.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "http://localhost:4321")
  );
}
