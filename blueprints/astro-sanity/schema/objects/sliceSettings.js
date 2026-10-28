import { defineField, defineType } from "sanity";

/**
 * Shared first field of every slice. Mapped by SliceSection.astro to
 * .u-pt-* / .u-pb-* / .u-theme-* and the opt-in panel parallax.
 * Keep option strings identical to Maestro so mocks and CSS stay portable.
 */
export const sliceSettings = defineType({
  name: "sliceSettings",
  title: "Settings",
  type: "object",
  fields: [
    defineField({
      name: "padding_top",
      title: "Padding top",
      type: "string",
      options: {
        list: [
          { title: "None", value: "None" },
          { title: "Small (64px)", value: "Small (64px)" },
          { title: "Main (128px)", value: "Main (128px)" },
          { title: "Large (160px)", value: "Large (160px)" },
          { title: "Page top (184px)", value: "Page top (184px)" },
        ],
        layout: "radio",
      },
      initialValue: "Main (128px)",
    }),
    defineField({
      name: "padding_bottom",
      title: "Padding bottom",
      type: "string",
      options: {
        list: [
          { title: "None", value: "None" },
          { title: "Small (64px)", value: "Small (64px)" },
          { title: "Main (128px)", value: "Main (128px)" },
          { title: "Large (160px)", value: "Large (160px)" },
          { title: "Page top (184px)", value: "Page top (184px)" },
        ],
        layout: "radio",
      },
      initialValue: "Main (128px)",
    }),
    defineField({
      name: "theme",
      title: "Theme",
      type: "string",
      options: {
        list: [
          { title: "Inherit", value: "Inherit" },
          { title: "Light", value: "Light" },
          { title: "Dark", value: "Dark" },
          { title: "Brand", value: "Brand" },
        ],
        layout: "radio",
      },
      initialValue: "Inherit",
    }),
    defineField({
      name: "panel_animation",
      title: "Panel animation",
      type: "boolean",
      description: "On / Off — opt this slice into the panel role of animations.config.js",
      initialValue: false,
    }),
  ],
});
