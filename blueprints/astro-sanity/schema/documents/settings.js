import { defineField, defineType } from "sanity";

/**
 * Singleton (id "settings"). Tabs mirror Maestro customtypes/settings:
 * Main, Icons, Custom code, Redirects.
 */
export const settings = defineType({
  name: "settings",
  title: "Settings",
  type: "document",
  groups: [
    { name: "main", title: "Main", default: true },
    { name: "icons", title: "Icons" },
    { name: "custom", title: "Custom code" },
    { name: "redirects", title: "Redirects" },
  ],
  fields: [
    defineField({
      name: "meta_title",
      title: "Meta title (50–60 characters)",
      type: "string",
      group: "main",
    }),
    defineField({
      name: "meta_description",
      title: "Meta description (120–155 characters)",
      type: "text",
      rows: 3,
      group: "main",
    }),
    defineField({
      name: "og_image",
      title: "OG image (1200×630 px)",
      type: "image",
      group: "main",
    }),
    defineField({
      name: "favicon",
      title: "Favicon (SVG preferred, or square PNG 512×512)",
      type: "image",
      group: "icons",
    }),
    defineField({
      name: "apple_touch_icon",
      title: "Apple touch icon (PNG 180×180)",
      type: "image",
      group: "icons",
    }),
    defineField({
      name: "theme_color",
      title: "Theme color (hex)",
      type: "string",
      group: "icons",
    }),
    defineField({
      name: "head_code",
      title: "Head code (meta, link and script tags, pasted as-is)",
      type: "text",
      rows: 8,
      group: "custom",
    }),
    defineField({
      name: "body_end_code",
      title: "Body end code (scripts, noscript and widgets, pasted as-is)",
      type: "text",
      rows: 8,
      group: "custom",
    }),
    defineField({
      name: "redirects",
      title: "Redirects",
      type: "array",
      group: "redirects",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "from",
              title: "From (path starting with /, no domain)",
              type: "string",
              validation: (Rule) => Rule.required().regex(/^\//),
            }),
            defineField({
              name: "to",
              title: "To (path or URL)",
              type: "string",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "permanent",
              title: "Permanent (301)",
              type: "boolean",
              initialValue: true,
            }),
          ],
          preview: {
            select: { from: "from", to: "to", permanent: "permanent" },
            prepare({ from, to, permanent }) {
              return {
                title: `${from} → ${to}`,
                subtitle: permanent ? "301" : "302",
              };
            },
          },
        },
      ],
    }),
  ],
  preview: {
    prepare() {
      return { title: "Settings" };
    },
  },
});
