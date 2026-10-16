// Reference: collection + relations slice — all documents of a type, or hand-picked ones (SKILL.md §3.7).
import { isFilled } from "@prismicio/client";
import { PrismicNextImage } from "@prismicio/next";
import { PrismicRichText } from "@prismicio/react";

import SliceSection from "@/components/SliceSection";
import SliceTitle from "@/components/SliceTitle";
import { getCollection } from "@/lib/collection";
import "./testimonials.scss";

const quoteComponents = {
  paragraph: ({ children }) => <p className="testimonials__text text-large">{children}</p>,
};

/**
 * Shows `testimonial` documents (recipe `testimonial`,
 * `npm run type:install -- testimonial`).
 *
 * - `default`: every testimonial, newest first, optional limit — automatic.
 * - `curated`: the editor picks them one by one through a content
 *   relationship. The related document's fields (quote, author, role, photo)
 *   come back inline in `item.testimonial.data`, no extra request.
 *
 * Pick the variation by who decides the list: automatic → query; editor →
 * relation. Never both in one variation.
 *
 * @param {import("@prismicio/react").SliceComponentProps<import("@/prismicio-types").TestimonialsSlice>} props
 */
export default async function Testimonials({ slice, context }) {
  const { title } = slice.primary;

  const testimonials =
    slice.variation === "curated"
      ? slice.primary.items
          .map((item) => item.testimonial)
          .filter((link) => isFilled.contentRelationship(link) && link.data)
          .map((link) => ({ id: link.id, data: link.data }))
      : await getCollection("testimonial", {
          context,
          orderings: { field: "document.first_publication_date", direction: "desc" },
          limit: isFilled.number(slice.primary.limit) && slice.primary.limit > 0 ? slice.primary.limit : undefined,
        });

  if (!testimonials.length) return null;

  return (
    <SliceSection slice={slice} wrapperClassName="testimonials__wrapper">
      {isFilled.richText(title) && (
        <div className="row">
          <div className="col col-lg-8 col-md-12">
            <SliceTitle field={title} className="testimonials__title h2" />
          </div>
        </div>
      )}
      <ul className="testimonials__list row">
        {testimonials.map(({ id, data }) => (
          <li key={id} className="testimonials__item col col-lg-4 col-md-6 col-sm-12">
            <figure className="testimonials__card">
              <blockquote className="testimonials__quote">
                <PrismicRichText field={data.quote} components={quoteComponents} />
              </blockquote>
              <figcaption className="testimonials__author">
                {isFilled.image(data.photo) && (
                  <PrismicNextImage
                    field={data.photo}
                    className="testimonials__photo"
                    width={56}
                    height={56}
                    imgixParams={{ fit: "crop", ar: "1:1" }}
                    fallbackAlt=""
                  />
                )}
                <span className="testimonials__who">
                  <span className="testimonials__name h7">{data.author}</span>
                  {isFilled.keyText(data.role) && (
                    <span className="testimonials__role text-muted">{data.role}</span>
                  )}
                </span>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </SliceSection>
  );
}
