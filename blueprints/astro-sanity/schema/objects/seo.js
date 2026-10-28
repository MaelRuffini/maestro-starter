import { defineField, defineType } from "sanity";

export const seo = defineType({
  name: "seo",
  title: "SEO & Metadata",
  type: "object",
  fields: [
    defineField({
      name: "meta_title",
      title: "Meta Title (50–60 characters)",
      type: "string",
      description: "Shown in search results and social cards. Empty = site default",
    }),
    defineField({
      name: "meta_description",
      title: "Meta Description (120–155 characters)",
      type: "text",
      rows: 3,
      description: "One or two sentences. Empty = site default",
    }),
    defineField({
      name: "meta_image",
      title: "Meta Image (1200×630 px, JPG or PNG, under 1 MB)",
      type: "image",
      options: { hotspot: true },
    }),
  ],
});
