/**
 * Guards for optional Sanity fields. Use these instead of truthy checks:
 * an empty Portable Text array is truthy in some shapes and must not render.
 */
export const isFilled = {
  portable: (value) => Array.isArray(value) && value.some((block) =>
    (block.children ?? []).some((child) => child.text?.trim()),
  ),
  string: (value) => typeof value === "string" && value.trim().length > 0,
  image: (value) => Boolean(value?.asset),
  url: (value) => typeof value === "string" && /^https?:\/\//.test(value),
  cta: (value) =>
    Boolean(value?.label) && Boolean(value?.internal || value?.external),
  array: (value) => Array.isArray(value) && value.length > 0,
};
