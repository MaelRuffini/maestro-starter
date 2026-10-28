import { defineField, defineType } from "sanity";
import { sliceTypes } from "../slices/index.js";

export const page = defineType({
  name: "page",
  title: "Page",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title (Studio only)",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title" },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slices",
      title: "Slices",
      type: "array",
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
    select: { title: "title", slug: "slug.current" },
    prepare({ title, slug }) {
      return { title, subtitle: slug ? `/${slug}` : "No slug" };
    },
  },
});
