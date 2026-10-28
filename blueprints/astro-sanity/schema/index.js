import { homepage } from "./documents/homepage.js";
import { page } from "./documents/page.js";
import { settings } from "./documents/settings.js";
import { sliceSettings } from "./objects/sliceSettings.js";
import { seo } from "./objects/seo.js";
import { ctaLink } from "./objects/ctaLink.js";
import { titlePortable } from "./objects/titlePortable.js";

/**
 * Slice schemas are imported here by `slice:scaffold`.
 * Do not duplicate field lists — each slice owns `src/slices/<Name>/schema.js`.
 */
const sliceSchemas = [
  // import { hero } from "../src/slices/Hero/schema.js";
];

export const schemaTypes = [
  homepage,
  page,
  settings,
  sliceSettings,
  seo,
  ctaLink,
  titlePortable,
  ...sliceSchemas,
];
