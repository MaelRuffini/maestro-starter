import { asText, isFilled } from "@prismicio/client";

import { getSettings } from "@/lib/settings";
import { parseHeadCode } from "@/lib/custom-code";
import "@/styles/components/custom-code.scss";

/**
 * Site-wide custom code from Settings → Custom code (the Webflow "custom
 * code" slots). Mounted twice by the root layout:
 *
 * - `position="head"` as the first child of `<body>`: the snippet is parsed
 *   (`parseHeadCode`) so `<meta>`/`<link>` land in `<head>` and scripts run
 *   before any content.
 * - `position="body-end"` as the last child of `<body>`: injected as raw HTML,
 *   so widgets, `<noscript>` iframes and arbitrary markup work unchanged. The
 *   wrapper is `display: contents` (no box of its own).
 *
 * Scripts execute when the browser parses the server HTML — i.e. on every
 * full page load, in every environment including preview. They do not re-run
 * on a dev Fast Refresh (innerHTML re-render); hard-reload to test a snippet.
 * Only trusted Prismic roles should edit these fields.
 *
 * @param {{ position: "head" | "body-end" }} props
 */
export default async function CustomCode({ position }) {
  const settings = await getSettings();
  if (!settings) return null;

  const field =
    position === "head" ? settings.data.head_code : settings.data.body_end_code;
  if (!isFilled.richText(field)) return null;

  const code = asText(field).trim();
  if (!code) return null;

  if (position === "head") return <>{parseHeadCode(code)}</>;

  return (
    <div
      className="custom-code"
      data-custom-code="body-end"
      dangerouslySetInnerHTML={{ __html: code }}
    />
  );
}
