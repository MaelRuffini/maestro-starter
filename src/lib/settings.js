import { cache } from "react";
import { NotFoundError } from "@prismicio/client";

import { createClient } from "@/prismicio";

/**
 * The `settings` singleton, or `null` when the document has not been created
 * yet (fresh repository). Wrapped in React `cache()` so the layout, its
 * metadata, `CustomCode` and the icons share one request per render.
 *
 * @returns {Promise<import("@prismicio/client").Content.SettingsDocument | null>}
 */
export const getSettings = cache(async () => {
  try {
    return await createClient().getSingle("settings");
  } catch (error) {
    if (error instanceof NotFoundError) return null;
    throw error;
  }
});
