/**
 * Sanity webhook target. Verify SANITY_REVALIDATE_SECRET.
 * Purge the cache for the document's route (see src/lib/links.js).
 */
export const prerender = false;

export async function POST() {
  return new Response("Not implemented (BUILD.md phase 5)", { status: 501 });
}
