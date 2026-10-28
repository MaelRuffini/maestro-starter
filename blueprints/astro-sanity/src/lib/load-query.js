/**
 * Published vs draft. Implement against @sanity/astro loadQuery during
 * BUILD.md phase 5. Until then this is a stub that always hits published.
 *
 * Contract:
 *   - no draft cookie → perspective "published", no token needed if public
 *   - draft cookie → perspective "previewDrafts" + SANITY_API_READ_TOKEN
 *   - stega encoding on only when Visual Editing is on
 */
export async function loadQuery({ query, params = {} }) {
  // BUILD: replace with the official loadQuery from @sanity/astro
  const { sanityClient } = await import("./sanity.js");
  const data = await sanityClient.fetch(query, params);
  return { data };
}
