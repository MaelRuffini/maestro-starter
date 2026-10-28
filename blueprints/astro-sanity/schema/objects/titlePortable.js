import { defineField, defineType } from "sanity";

/**
 * Slice titles. Editor picks the heading tag (h1–h6); SliceTitle.astro
 * renders ONE heading and the JSX className picks the size.
 * Mirrors Prismic rich-text --single heading1..heading6.
 */
export const titlePortable = defineType({
  name: "titlePortable",
  title: "Title",
  type: "array",
  of: [
    defineField({
      type: "block",
      styles: [
        { title: "H1", value: "h1" },
        { title: "H2", value: "h2" },
        { title: "H3", value: "h3" },
        { title: "H4", value: "h4" },
        { title: "H5", value: "h5" },
        { title: "H6", value: "h6" },
      ],
      lists: [],
      marks: { decorators: [], annotations: [] },
    }),
  ],
});
