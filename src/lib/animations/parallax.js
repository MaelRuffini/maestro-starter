import { gsap } from "@/lib/gsap";

/**
 * Builds a panel parallax animation. The section's content
 * (`[data-panel="content"]`) and background (`[data-panel="background"]`, when
 * the slice passes `background`) move together, scrubbed to the scroll.
 *
 * `ease: "none"` is mandatory for scrubbed motion: the scrollbar is the ease.
 * `invalidateOnRefresh` recomputes the `vh` distance on resize. The section
 * clips its own overflow (`.slice-section--panel`), so the travel never paints
 * over a neighbour.
 *
 * @param {{
 *   from?: gsap.TweenVars,
 *   to: gsap.TweenVars,
 *   start: string,
 *   end: string,
 * }} options  `from` omitted = `gsap.to`, present = `gsap.fromTo`
 * @returns {(section: HTMLElement) => (() => void) | undefined}
 */
export function createParallax({ from, to, start, end }) {
  return function parallax(section) {
    const targets = [
      section.querySelector('[data-panel="content"]'),
      section.querySelector('[data-panel="background"]'),
    ].filter(Boolean);

    if (!targets.length) return undefined;

    const ctx = gsap.context(() => {
      const vars = {
        ...to,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start,
          end,
          scrub: true,
          invalidateOnRefresh: true,
        },
      };

      if (from) gsap.fromTo(targets, from, vars);
      else gsap.to(targets, vars);
    }, section);

    return () => ctx.revert();
  };
}
