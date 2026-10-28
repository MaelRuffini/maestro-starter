import { defineField, defineType } from "sanity";

/**
 * Replaces Prismic Link with --allow-text and --variant.
 * Internal: reference to a document that has a slug (page, article, homepage).
 * External: url. Exactly one of the two.
 */
export const ctaLink = defineType({
  name: "ctaLink",
  title: "Link",
  type: "object",
  fields: [
    defineField({
      name: "label",
      title: "Label",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "internal",
      title: "Internal document",
      type: "reference",
      to: [{ type: "page" }, { type: "homepage" }],
      hidden: ({ parent }) => Boolean(parent?.external),
    }),
    defineField({
      name: "external",
      title: "External URL",
      type: "url",
      validation: (Rule) =>
        Rule.uri({ allowRelative: true, scheme: ["http", "https", "mailto", "tel"] }),
      hidden: ({ parent }) => Boolean(parent?.internal),
    }),
    defineField({
      name: "variant",
      title: "Variant",
      type: "string",
      options: {
        list: [
          { title: "Primary", value: "Primary" },
          { title: "Secondary", value: "Secondary" },
          { title: "Outline", value: "Outline" },
        ],
        layout: "radio",
      },
      initialValue: "Primary",
    }),
  ],
});
