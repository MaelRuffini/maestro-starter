import { createElement } from "react";

/**
 * Turns a pasted "head code" snippet (Settings → Custom code) into React
 * elements. React cannot inject raw HTML into `<head>`, so the snippet is
 * split into the tags a head snippet legitimately contains and each becomes
 * an element:
 *
 * - `<meta>`, `<link>`: React 19 hoists them into the document `<head>`.
 * - `<script>` (inline or `src`), `<style>`, `<noscript>`: rendered where the
 *   component sits — the first child of `<body>` — so they execute before any
 *   page content, exactly as a head script would.
 * - HTML comments are dropped. Anything else (text, other tags) is ignored.
 *
 * Attribute names are mapped to their React equivalents; boolean attributes
 * (`async`, `defer`, `nomodule`) become `true`.
 *
 * @param {string} code
 * @returns {import("react").ReactNode[]}
 */
export function parseHeadCode(code) {
  const nodes = [];
  const source = code.replace(/<!--[\s\S]*?-->/g, "");
  const tag =
    /<(script|style|noscript)\b([^>]*)>([\s\S]*?)<\/\1\s*>|<(meta|link)\b([^>]*?)\/?>/gi;

  let match;
  let index = 0;
  while ((match = tag.exec(source)) !== null) {
    const [, pairedName, pairedAttrs, inner, voidName, voidAttrs] = match;
    const name = (pairedName || voidName).toLowerCase();
    const props = parseAttributes(pairedAttrs ?? voidAttrs);
    props.key = `custom-code-${index++}`;

    if (pairedName) {
      const html = inner.trim();
      if (html) props.dangerouslySetInnerHTML = { __html: html };
    }

    nodes.push(createElement(name, props));
  }

  return nodes;
}

const ATTRIBUTE_NAMES = {
  class: "className",
  charset: "charSet",
  crossorigin: "crossOrigin",
  fetchpriority: "fetchPriority",
  "http-equiv": "httpEquiv",
  nomodule: "noModule",
  referrerpolicy: "referrerPolicy",
  for: "htmlFor",
};

const BOOLEAN_ATTRIBUTES = new Set(["async", "defer", "nomodule", "disabled"]);

/**
 * @param {string} raw
 * @returns {Record<string, unknown>}
 */
function parseAttributes(raw) {
  /** @type {Record<string, unknown>} */
  const props = {};
  const attribute = /([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;

  let match;
  while ((match = attribute.exec(raw)) !== null) {
    const [, name, dq, sq, bare] = match;
    const lower = name.toLowerCase();
    const value = dq ?? sq ?? bare;
    const prop = ATTRIBUTE_NAMES[lower] ?? lower;

    if (value === undefined) {
      if (BOOLEAN_ATTRIBUTES.has(lower)) props[prop] = true;
      else props[prop] = "";
    } else {
      props[prop] = value;
    }
  }

  return props;
}
