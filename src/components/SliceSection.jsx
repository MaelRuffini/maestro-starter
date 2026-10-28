import { animate } from "@/lib/animate";
import "@/styles/components/slice-section.scss";

// Maps a Prismic select value to a CSS token, ignoring any hint suffix:
// "Small (64px)" -> "small", "Page top (184px)" -> "page-top", "Dark" -> "dark".
const toToken = (value) =>
  value.split(" (")[0].toLowerCase().replaceAll(" ", "-");

export const joinClasses = (...classes) =>
  classes.filter(Boolean).join(" ") || undefined;

/**
 * Shared structure for every slice: section → .container → wrapper div.
 * Reads the non-repeatable `settings` group of the slice (padding_top,
 * padding_bottom, theme, panel_animation) and maps it to the .u-pt-* /
 * .u-pb-* / .u-theme-* utilities and the opt-in panel parallax. The parallax
 * itself is the `panel` role of `src/animations.config.js`, run by
 * `components/Animations.jsx`.
 *
 * `.slice-section` is the positioning context and stacking layer of every
 * slice, whatever tag `as` renders (a footer, a header).
 *
 * Usage inside a slice:
 *   <SliceSection slice={slice} wrapperClassName="hero__wrapper">
 *     …content…
 *   </SliceSection>
 *
 * Full-bleed media goes in `background` so the panel tween can move it
 * separately from the content:
 *   <SliceSection slice={slice} background={<img className="hero__background" />}>
 *
 * Or with explicit settings for non-slice sections:
 *   <SliceSection settings={{ theme: "Dark", padding_top: "Main (128px)" }}>
 *
 * @param {{
 *   slice?: import("@prismicio/client").SharedSlice,
 *   settings?: {
 *     padding_top?: string,
 *     padding_bottom?: string,
 *     theme?: string,
 *     panel_animation?: boolean,
 *   },
 *   className?: string,
 *   containerClassName?: string,
 *   wrapperClassName?: string,
 *   background?: import("react").ReactNode,
 *   as?: keyof JSX.IntrinsicElements,
 *   children: import("react").ReactNode,
 * } & import("react").HTMLAttributes<HTMLElement>} props
 */
export default function SliceSection({
  slice,
  settings: settingsProp,
  className,
  containerClassName,
  wrapperClassName,
  background,
  as: Tag = "section",
  children,
  ...props
}) {
  const settings = settingsProp ?? slice?.primary?.settings?.[0] ?? {};
  const { padding_top, padding_bottom, theme, panel_animation } = settings;

  // Empty when the editor left Panel animation off, or the project's config
  // has no `panel` animation.
  const panel = panel_animation === true ? animate("panel") : {};
  const panelEnabled = "data-animate" in panel;

  const sectionClasses = joinClasses(
    "slice-section",
    theme && theme !== "Inherit" && `u-theme-${toToken(theme)}`,
    panelEnabled && "slice-section--panel",
    className,
  );

  const wrapperClasses = joinClasses(
    wrapperClassName,
    background && "slice-section__content",
    padding_top && padding_top !== "None" && `u-pt-${toToken(padding_top)}`,
    padding_bottom &&
    padding_bottom !== "None" &&
    `u-pb-${toToken(padding_bottom)}`,
  );

  return (
    <Tag
      data-slice-type={slice?.slice_type}
      data-slice-variation={slice?.variation}
      className={sectionClasses}
      {...panel}
      {...props}
    >
      {background ? (
        <div
          className="slice-section__background"
          data-panel={panelEnabled ? "background" : undefined}
        >
          {background}
        </div>
      ) : null}
      <div className={joinClasses("container", containerClassName)}>
        <div
          className={wrapperClasses}
          data-panel={panelEnabled ? "content" : undefined}
        >
          {children}
        </div>
      </div>
    </Tag>
  );
}
