import { asImageSrc, isFilled } from "@prismicio/client";

import { getSettings } from "@/lib/settings";
import { site } from "@/lib/site";

/**
 * Site-wide SEO defaults from the Settings singleton. Falls back to `site.js`
 * when the document is missing or a field is empty.
 *
 * @returns {Promise<{
 *   title: string,
 *   description: string,
 *   image: string | undefined,
 * }>}
 */
export async function getSiteDefaults() {
  const settings = await getSettings();
  if (!settings) {
    return { title: site.name, description: site.description, image: undefined };
  }

  const { meta_title, meta_description, og_image } = settings.data;

  return {
    title: isFilled.keyText(meta_title) ? meta_title : site.name,
    description: isFilled.keyText(meta_description)
      ? meta_description
      : site.description,
    image: isFilled.image(og_image) ? asImageSrc(og_image) : undefined,
  };
}

/** @param {string} url */
const mimeFromUrl = (url) => {
  const ext = new URL(url).pathname.split(".").pop()?.toLowerCase();
  return { svg: "image/svg+xml", png: "image/png", ico: "image/x-icon" }[ext];
};

/**
 * `metadata.icons` from the Settings "Icons" tab. `src/app/favicon.ico` stays
 * as the template fallback; when the CMS favicon is set, the browser gets the
 * uploaded file as-is (SVG or PNG) plus a 32×32 PNG rendition from imgix for
 * browsers that ignore SVG favicons. Returns `undefined` when nothing is set so
 * Next keeps the file-based defaults only.
 *
 * @returns {Promise<import("next").Metadata["icons"]>}
 */
export async function getSiteIcons() {
  const settings = await getSettings();
  if (!settings) return undefined;

  const { favicon, apple_touch_icon } = settings.data;
  /** @type {{ icon?: object[], apple?: object[] }} */
  const icons = {};

  if (isFilled.image(favicon)) {
    const raw = asImageSrc(favicon);
    icons.icon = [
      { url: raw, type: mimeFromUrl(raw), sizes: "any" },
      {
        url: asImageSrc(favicon, { w: 32, h: 32, fit: "crop", fm: "png" }),
        type: "image/png",
        sizes: "32x32",
      },
    ];
  }

  if (isFilled.image(apple_touch_icon)) {
    icons.apple = [
      {
        url: asImageSrc(apple_touch_icon, { w: 180, h: 180, fit: "crop", fm: "png" }),
        sizes: "180x180",
      },
    ];
  }

  return Object.keys(icons).length ? icons : undefined;
}

/**
 * `viewport.themeColor` from the Settings "Icons" tab, or `undefined`.
 *
 * @returns {Promise<string | undefined>}
 */
export async function getThemeColor() {
  const settings = await getSettings();
  const color = settings?.data.theme_color;
  return isFilled.color(color) ? color : undefined;
}
