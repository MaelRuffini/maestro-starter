import { PrismicRichText } from "@prismicio/react";
import { PrismicNextImage, PrismicNextLink } from "@prismicio/next";

import { joinClasses } from "./SliceSection";
import "@/styles/components/prose.scss";

/**
 * Shared serializer for editorial rich text. Headings get the type classes;
 * links go through PrismicNextLink, images through next/image.
 */
export const proseComponents = {
  heading1: ({ children }) => <h1 className="h1">{children}</h1>,
  heading2: ({ children }) => <h2 className="h2">{children}</h2>,
  heading3: ({ children }) => <h3 className="h3">{children}</h3>,
  heading4: ({ children }) => <h4 className="h4">{children}</h4>,
  heading5: ({ children }) => <h5 className="h5">{children}</h5>,
  heading6: ({ children }) => <h6 className="h6">{children}</h6>,
  hyperlink: ({ node, children }) => (
    <PrismicNextLink field={node.data}>{children}</PrismicNextLink>
  ),
  image: ({ node }) => (
    <figure className="prose__figure">
      <PrismicNextImage field={node} fallbackAlt="" sizes="(max-width: 991px) 100vw, 60vw" />
      {node.alt ? <figcaption>{node.alt}</figcaption> : null}
    </figure>
  ),
};

/**
 * Renders a rich text field as long-form editorial content (`.prose`).
 * In a **body**, heading level still maps to the default type class (subsection
 * rank). Slice lockups use `SliceTitle` instead — tag and size are independent.
 * Do not restyle headings in slice SCSS.
 *
 * @param {{
 *   field: import("@prismicio/client").RichTextField,
 *   className?: string,
 *   components?: import("@prismicio/react").RichTextComponents,
 * }} props
 */
export default function Prose({ field, className, components }) {
  return (
    <div className={joinClasses("prose", className)}>
      <PrismicRichText
        field={field}
        components={{ ...proseComponents, ...components }}
      />
    </div>
  );
}
