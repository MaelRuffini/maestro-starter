/**
 * Port of Maestro src/lib/collection.js.
 * Slices that list other documents (Articles, Testimonials) call this
 * from their .astro frontmatter — never from an island.
 *
 * BUILD.md phase 3.7: implement with loadQuery + groq, support
 * { orderings, limit, exclude: "current" }.
 */
export async function getCollection(type, { orderings, limit, exclude, context } = {}) {
  throw new Error(`getCollection(${type}) — implement in BUILD.md phase 3 / §3.7`);
}

export function sliceContext(document) {
  return { document: { id: document._id, type: document._type, slug: document.slug } };
}
