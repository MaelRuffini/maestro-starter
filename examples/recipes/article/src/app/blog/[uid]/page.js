import { notFound } from "next/navigation";
import { asDate, asImageSrc, asText, isFilled } from "@prismicio/client";
import { PrismicNextImage } from "@prismicio/next";
import { SliceZone } from "@prismicio/react";

import { createClient } from "@/prismicio";
import { components } from "@/slices";
import { getSiteDefaults } from "@/lib/metadata";
import { sliceContext } from "@/lib/collection";
import { site } from "@/lib/site";
import SliceSection from "@/components/SliceSection";
import SliceTitle from "@/components/SliceTitle";
import Prose from "@/components/Prose";
import "@/styles/components/article-header.scss";

/**
 * Article page (recipe `article`, route `/blog/:uid`). The header (title,
 * date, excerpt, cover) is page chrome rendered here from the document's own
 * fields; the body is the article's slice zone. `context` carries the
 * document so a `related` Articles slice can exclude the current post.
 */
export default async function ArticlePage({ params }) {
  const { uid } = await params;
  const client = createClient();
  const article = await client.getByUID("article", uid).catch(() => notFound());
  const { title, cover, excerpt, published_at } = article.data;
  const date = asDate(published_at);

  return (
    <>
      <SliceSection
        className="article-header"
        wrapperClassName="article-header__wrapper"
        settings={{ padding_top: "Page top (184px)", padding_bottom: "Small (64px)" }}
      >
        <div className="row justify-center">
          <div className="col col-lg-8 col-md-12">
            <header className="article-header__lockup">
              {date && (
                <p className="article-header__meta label text-muted">
                  <time dateTime={published_at}>
                    {date.toLocaleDateString(site.locale, {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </time>
                </p>
              )}
              <SliceTitle field={title} className="article-header__title h1" fallbackTag="h1" />
              {isFilled.richText(excerpt) && (
                <Prose field={excerpt} className="article-header__excerpt text-large" />
              )}
            </header>
          </div>
        </div>
        {isFilled.image(cover) && (
          <div className="row justify-center">
            <div className="col col-lg-10 col-md-12">
              <PrismicNextImage
                field={cover}
                className="article-header__cover"
                sizes="(max-width: 991px) 100vw, 83vw"
                fallbackAlt=""
                priority
              />
            </div>
          </div>
        )}
      </SliceSection>

      <SliceZone
        slices={article.data.slices}
        components={components}
        context={sliceContext(article)}
      />
    </>
  );
}

export async function generateMetadata({ params }) {
  const { uid } = await params;
  const client = createClient();
  const [article, defaults] = await Promise.all([
    client.getByUID("article", uid).catch(() => notFound()),
    getSiteDefaults(),
  ]);
  const { meta_title, meta_description, meta_image, title, excerpt, cover } = article.data;

  const pageTitle = isFilled.keyText(meta_title)
    ? meta_title
    : isFilled.richText(title)
      ? asText(title)
      : defaults.title;
  const description = isFilled.keyText(meta_description)
    ? meta_description
    : isFilled.richText(excerpt)
      ? asText(excerpt)
      : defaults.description;
  const image = isFilled.image(meta_image)
    ? asImageSrc(meta_image)
    : isFilled.image(cover)
      ? asImageSrc(cover, { w: 1200, h: 630, fit: "crop" })
      : defaults.image;

  return {
    title: pageTitle,
    description,
    openGraph: {
      type: "article",
      publishedTime: asDate(article.data.published_at)?.toISOString(),
      images: image ? [{ url: image }] : undefined,
    },
  };
}

export async function generateStaticParams() {
  const client = createClient();
  const articles = await client.getAllByType("article");

  return articles.map((article) => ({ uid: article.uid }));
}
