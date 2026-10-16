import * as prismic from "@prismicio/client";

import { createClient } from "@/prismicio";

/**
 * Documents of one type, for a slice that lists a collection instead of (or in
 * addition to) its own fields — "all articles", "latest 3 testimonials"
 * (SKILL.md §3.7).
 *
 * - On a page, queries the API with the same cache tag as everything else, so
 *   the publish webhook refreshes the list; Preview shows drafts.
 * - In `/dev/slices`, `context.fixtures[type]` (the `fixtures` key of the
 *   mock entry in `mocks.json`) replaces the query, so the gallery works
 *   offline with realistic documents. Fixtures are used in the order given;
 *   `limit` and `exclude` still apply.
 *
 * @template {string} T
 * @param {T} type Custom type id, e.g. `"article"`.
 * @param {{
 *   context?: { fixtures?: Record<string, any[]>, document?: { id?: string } },
 *   limit?: number,
 *   orderings?: import("@prismicio/client").Ordering[],
 *   filters?: string[],
 *   exclude?: string | "current",
 * }} [options]
 *   `exclude: "current"` drops the document the slice is rendered on
 *   (`context.document.id`, set by the page routes) — for "related" lists.
 * @returns {Promise<any[]>}
 */
export async function getCollection(
  type,
  { context, limit, orderings, filters = [], exclude } = {},
) {
  const excludeId = exclude === "current" ? context?.document?.id : exclude;

  const fixtures = context?.fixtures?.[type];
  if (Array.isArray(fixtures)) {
    const docs = excludeId ? fixtures.filter((doc) => doc.id !== excludeId) : fixtures;
    return limit ? docs.slice(0, limit) : docs;
  }

  const client = createClient();
  const params = {
    orderings,
    filters: excludeId
      ? [...filters, prismic.filter.not("document.id", excludeId)]
      : filters,
  };

  if (limit) {
    const response = await client.getByType(type, { ...params, pageSize: limit });
    return response.results;
  }
  return client.getAllByType(type, params);
}

/**
 * `context` object every page route passes to `<SliceZone>` so slices know
 * which document they sit on (SKILL.md §3.7).
 *
 * @param {import("@prismicio/client").PrismicDocument} document
 */
export function sliceContext(document) {
  return {
    document: { id: document.id, type: document.type, uid: document.uid ?? null },
  };
}
