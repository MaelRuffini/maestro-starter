// Reference: collection slice — queries documents of another type (SKILL.md §3.7).
import { asDate, asText, isFilled } from "@prismicio/client";
import { PrismicNextImage, PrismicNextLink } from "@prismicio/next";

import SliceSection from "@/components/SliceSection";
import SliceTitle from "@/components/SliceTitle";
import { getCollection } from "@/lib/collection";
import { site } from "@/lib/site";
import "./articles.scss";

const ORDERINGS = {
  "Newest first": { field: "my.article.published_at", direction: "desc" },
  "Oldest first": { field: "my.article.published_at", direction: "asc" },
  "Title A–Z": { field: "my.article.title", direction: "asc" },
};

const RELATED_DEFAULT_LIMIT = 3;

/**
 * Lists `article` documents (recipe `article`, `npm run type:install -- article`).
 *
 * - `default`: every article, sorted by the editor's choice, optional limit.
 *   Goes on the /blog page.
 * - `related`: the next N articles (newest first) excluding the current one.
 *   Goes in an article's own slice zone; `context.document` tells it which
 *   post it sits on.
 *
 * Async server component: the query happens on the server, never in a client
 * component. In /dev/slices the gallery passes `context.fixtures.article`
 * instead of hitting Prismic.
 *
 * @param {import("@prismicio/react").SliceComponentProps<import("@/prismicio-types").ArticlesSlice>} props
 */
export default async function Articles({ slice, context }) {
  const { title, limit } = slice.primary;
  const related = slice.variation === "related";

  const articles = await getCollection("article", {
    context,
    orderings: related
      ? ORDERINGS["Newest first"]
      : (ORDERINGS[slice.primary.sort] ?? ORDERINGS["Newest first"]),
    limit: isFilled.number(limit) && limit > 0 ? limit : related ? RELATED_DEFAULT_LIMIT : undefined,
    exclude: related ? "current" : undefined,
  });

  if (!articles.length) return null;

  return (
    <SliceSection slice={slice} wrapperClassName="articles__wrapper">
      {isFilled.richText(title) && (
        <div className="row">
          <div className="col col-lg-8 col-md-12">
            <SliceTitle field={title} className="articles__title h2" />
          </div>
        </div>
      )}
      <ul className="articles__list row">
        {articles.map((article) => (
          <li key={article.id} className="articles__item col col-lg-4 col-md-6 col-sm-12">
            <ArticleCard article={article} />
          </li>
        ))}
      </ul>
    </SliceSection>
  );
}

/** @param {{ article: import("@/prismicio-types").ArticleDocument }} props */
function ArticleCard({ article }) {
  const { title, cover, excerpt, published_at } = article.data;
  const date = asDate(published_at);

  return (
    <article className="articles__card">
      {isFilled.image(cover) && (
        <PrismicNextImage
          field={cover}
          className="articles__cover"
          sizes="(max-width: 767px) 100vw, (max-width: 991px) 50vw, 33vw"
          fallbackAlt=""
        />
      )}
      <div className="articles__body">
        {date && (
          <p className="articles__date label text-muted">
            <time dateTime={published_at}>
              {date.toLocaleDateString(site.locale, { day: "numeric", month: "long", year: "numeric" })}
            </time>
          </p>
        )}
        <h3 className="articles__heading h4">
          <PrismicNextLink document={article} className="articles__link">
            {asText(title)}
          </PrismicNextLink>
        </h3>
        {isFilled.richText(excerpt) && <p className="articles__excerpt">{asText(excerpt)}</p>}
      </div>
    </article>
  );
}
