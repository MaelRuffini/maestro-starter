"use client";

import { useLayoutEffect, useRef } from "react";

import { gsap, ScrollTrigger } from "@/lib/gsap";

const SCALE_TO = 0.9;
// $bp-tablet in breakpoints.scss — sticky stack is desktop-only.
const DESKTOP_MQ = "(min-width: 992px)";

/**
 * Sticky photo stack: each card pins as the next one covers it, and the
 * outgoing card scales down. Skipped below tablet and when reduced motion
 * is on (cards stay a static list).
 *
 * @param {{ children: import("react").ReactNode }} props
 */
export default function StackedCardsList({ children }) {
  const ref = useRef(null);

  useLayoutEffect(() => {
    const wrapper = ref.current;
    if (!wrapper) return undefined;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return undefined;
    }

    const mm = gsap.matchMedia();

    mm.add(DESKTOP_MQ, () => {
      const items = [...wrapper.querySelectorAll(".stacked-cards__item")];
      const cards = [...wrapper.querySelectorAll(".stacked-cards__card")];
      if (items.length < 2) return;

      items.forEach((item, index) => {
        gsap.set(item, {
          position: "sticky",
          top: `calc(var(--size-7) + ${index} * var(--size-3))`,
          zIndex: index + 1,
        });

        if (index < items.length - 1) {
          const card = cards[index];
          const nextItem = items[index + 1];
          if (!card || !nextItem) return;

          gsap.fromTo(
            card,
            { scale: 1 },
            {
              scale: SCALE_TO,
              transformOrigin: "top center",
              ease: "none",
              scrollTrigger: {
                trigger: nextItem,
                start: "top bottom",
                end: "top top",
                scrub: true,
                invalidateOnRefresh: true,
              },
            },
          );
        }
      });
    });

    ScrollTrigger.refresh();

    return () => mm.revert();
  }, []);

  return (
    <ul ref={ref} className="stacked-cards__list" role="list">
      {children}
    </ul>
  );
}
