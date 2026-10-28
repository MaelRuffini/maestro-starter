import { defineField, defineType } from "sanity";

/**
 * Copied by `slice:scaffold` then rewritten against --fields.
 * `name` must match the registry key and mocks `_type` (camelCase id).
 */
export const sliceTemplate = defineType({
  name: "sliceTemplate",
  title: "Slice template",
  type: "object",
  fields: [
    defineField({
      name: "settings",
      title: "Settings",
      type: "sliceSettings",
    }),
    defineField({
      name: "variation",
      title: "Variation",
      type: "string",
      options: {
        list: [{ title: "Default", value: "default" }],
        layout: "radio",
      },
      initialValue: "default",
    }),
    defineField({
      name: "title",
      title: "Title",
      type: "titlePortable",
    }),
  ],
  preview: {
    select: { variation: "variation" },
    prepare({ variation }) {
      return { title: "Slice template", subtitle: variation };
    },
  },
});
