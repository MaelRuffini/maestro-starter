import { createClient } from "@/prismicio";
import { siteOrigin } from "@/lib/site";

/**
 * Every published document that resolves a public URL.
 *
 * Routes in `prismic.config.json` decide which custom types are pages.
 * A type with no route (`settings`) has no `url` and is omitted. Publishing,
 * unpublishing, or deleting a document or a page type changes this list when
 * the `prismic` cache tag is revalidated.
 */
export default async function sitemap() {
  const client = createClient({ preview: false });
  const documents = await client.dangerouslyGetAll();
  const origin = siteOrigin();
  /** @type {Map<string, { url: string, lastModified?: string }>} */
  const entries = new Map();

  for (const doc of documents) {
    if (!doc.url) continue;

    const url = new URL(doc.url, origin).href;
    const lastModified = doc.last_publication_date || undefined;
    const current = entries.get(url);

    if (
      !current ||
      (lastModified && lastModified > (current.lastModified ?? ""))
    ) {
      entries.set(url, lastModified ? { url, lastModified } : { url });
    }
  }

  return [...entries.values()].sort((a, b) => a.url.localeCompare(b.url));
}
