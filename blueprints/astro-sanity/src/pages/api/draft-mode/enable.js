/**
 * BUILD.md phase 5 — follow
 * https://www.sanity.io/docs/visual-editing/astro-visual-editing
 * Sets the draft cookie after validating the preview-url secret.
 */
export const prerender = false;

export async function GET() {
  return new Response("Not implemented (BUILD.md phase 5)", { status: 501 });
}
