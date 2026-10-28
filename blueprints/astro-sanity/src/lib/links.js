/**
 * Route table + href resolver. Presentation `resolve` must return the
 * same paths (sanity.config.js).
 */
export const routes = {
  homepage: () => "/",
  page: (doc) => `/${doc.slug?.current ?? doc.slug ?? ""}`.replace(/\/$/, "") || "/",
  article: (doc) => `/blog/${doc.slug?.current ?? doc.slug}`,
};

export function resolveHref(linkOrDoc) {
  if (!linkOrDoc) return undefined;
  if (typeof linkOrDoc === "string") return linkOrDoc;
  if (linkOrDoc.external) return linkOrDoc.external;
  const doc = linkOrDoc.internal ?? linkOrDoc;
  const resolver = routes[doc._type];
  return resolver ? resolver(doc) : undefined;
}
