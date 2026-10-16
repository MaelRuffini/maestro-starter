import { PrismicNextLink } from "@prismicio/next";

import { joinClasses } from "./SliceSection";

// Maps the link field's `variant` (set in the model with --variant) to the
// .button modifiers defined in styles/base/base.scss.
const VARIANT_CLASS = {
  Primary: "button",
  Secondary: "button button--secondary",
  Outline: "button button--outline",
};

/**
 * CMS-driven button. Renders a Prismic link field with the shared .button
 * styles. The label comes from the field's text (`--allow-text`) unless
 * children are provided.
 *
 * @param {{
 *   field: import("@prismicio/client").LinkField,
 *   variant?: keyof typeof VARIANT_CLASS,
 *   className?: string,
 *   children?: import("react").ReactNode,
 * }} props
 */
export default function Button({ field, variant, className, children, ...props }) {
  const resolvedVariant = variant ?? field?.variant ?? "Primary";

  // PrismicNextLink falls back to `field.text` only when no `children` prop is
  // present at all, so it must not be forwarded as `undefined`.
  const childrenProp = children === undefined ? {} : { children };

  return (
    <PrismicNextLink
      field={field}
      className={joinClasses(VARIANT_CLASS[resolvedVariant] ?? VARIANT_CLASS.Primary, className)}
      {...childrenProp}
      {...props}
    />
  );
}
