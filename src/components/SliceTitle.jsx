import { createElement } from "react";
import { isFilled } from "@prismicio/client";
import { PrismicRichText } from "@prismicio/react";

import { animate } from "@/lib/animate";
import { joinClasses } from "./SliceSection";
import "@/styles/components/slice-title.scss";

const HEADING_TAGS = {
  heading1: "h1",
  heading2: "h2",
  heading3: "h3",
  heading4: "h4",
  heading5: "h5",
  heading6: "h6",
};

const titleLine = ({ children }) => (
  <span className="slice-title__line">{children}</span>
);

/**
 * @param {import("@prismicio/client").RichTextField} field
 * @param {"h1"|"h2"|"h3"|"h4"|"h5"|"h6"} fallback
 */
function headingTagFromField(field, fallback) {
  for (const block of field) {
    const tag = HEADING_TAGS[block.type];
    if (tag) return tag;
  }
  return fallback;
}

/**
 * Slice title: the CMS block picks the heading **tag**; `className` picks the
 * **size** (`.h2`, `.display`, …). Always one heading — extra blocks
 * become lines, not stacked siblings.
 *
 * @param {{
 *   field: import("@prismicio/client").RichTextField,
 *   className?: string,
 *   fallbackTag?: "h1"|"h2"|"h3"|"h4"|"h5"|"h6",
 *   animation?: string | false,
 * }} props
 *
 * Animation: follows the `title` role of `src/animations.config.js`. Pass a
 * name to force one on this title, or `false` to opt out. Stays a server
 * component: the motion runs from `components/Animations.jsx`.
 */
export default function SliceTitle({
  field,
  className,
  fallbackTag = "h2",
  animation,
}) {
  if (!isFilled.richText(field)) return null;

  return createElement(
    headingTagFromField(field, fallbackTag),
    {
      className: joinClasses("slice-title", className),
      ...animate("title", animation),
    },
    <PrismicRichText
      field={field}
      components={{
        heading1: titleLine,
        heading2: titleLine,
        heading3: titleLine,
        heading4: titleLine,
        heading5: titleLine,
        heading6: titleLine,
        paragraph: titleLine,
      }}
    />,
  );
}
