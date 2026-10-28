import { defineField, defineType } from "sanity";
import { sliceTypes } from "../slices/index.js";

export const homepage = defineType({
  name: "homepage",
  title: "Homepage",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title (Studio only)",
      type: "string",
      initialValue: "Homepage",
    }),
    defineField({
      name: "slices",
      title: "Slices",
      type: "array",
      // Fresh template: sliceTypes is []. Sanity requires `of` to be
      // non-empty — scaffold's first slice fixes this. Until then a
      // placeholder object keeps the schema valid.
      of: sliceTypes.length
        ? sliceTypes.map((name) => ({ type: name }))
        : [{ type: "object", name: "emptySlice", fields: [{ type: "string", name: "_placeholder", hidden: true }] }],
      options: { insertMenu: { showIcons: true } },
    }),
    defineField({
      name: "seo",
      title: "SEO & Metadata",
      type: "seo",
    }),
  ],
  preview: {
    prepare() {
      return { title: "Homepage" };
    },
  },
});
