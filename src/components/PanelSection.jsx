"use client";

import { useLayoutEffect, useRef } from "react";

import { gsap, ScrollTrigger } from "@/lib/gsap";

const PANEL_Y = "60vh";

/**
 * Section element that optionally runs the shared panel parallax:
 * content (and background, if present) move to y: 60vh, ease none, scrubbed
 * from start "bottom bottom" to end "bottom top". Skipped when
 * prefers-reduced-motion is on.
 *
 * @param {{
 *   as?: keyof JSX.IntrinsicElements,
 *   enabled?: boolean,
 *   children: import("react").ReactNode,
 * } & import("react").HTMLAttributes<HTMLElement>} props
 */
export default function PanelSection({
  as: Tag = "section",
  enabled = false,
  children,
  ...props
}) {
  const ref = useRef(null);

  useLayoutEffect(() => {
    if (!enabled) return undefined;

    const section = ref.current;
    if (!section) return undefined;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return undefined;
    }

    const ctx = gsap.context(() => {
      const targets = [
        section.querySelector('[data-panel="content"]'),
        section.querySelector('[data-panel="background"]'),
      ].filter(Boolean);

      if (!targets.length) return;

      gsap.to(targets, {
        y: PANEL_Y,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "bottom bottom",
          end: "bottom top",
          scrub: true,
          invalidateOnRefresh: true,
        },
      });
    }, section);

    ScrollTrigger.refresh();

    return () => ctx.revert();
  }, [enabled]);

  return (
    <Tag ref={ref} {...props}>
      {children}
    </Tag>
  );
}
