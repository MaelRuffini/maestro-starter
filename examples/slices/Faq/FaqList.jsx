"use client";

import { useLayoutEffect, useRef } from "react";

import { gsap } from "@/lib/gsap";

const EASE = "power2.out";
const FALLBACK_DURATION = 0.25;

/**
 * FAQ rows. Keeps the native <details>/<summary> semantics (keyboard, screen
 * reader expanded state) but drives the `open` attribute itself so the answer
 * can be tweened between 0 and its auto height. One row open at a time.
 * Reduced motion gets the same behaviour without the tween.
 *
 * @param {{ children: import("react").ReactNode }} props
 */
export default function FaqList({ children }) {
  const ref = useRef(null);

  useLayoutEffect(() => {
    const list = ref.current;
    if (!list) return undefined;

    const items = [...list.querySelectorAll(".faq__item")];
    if (!items.length) return undefined;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    // Same token as the icon rotation, so both halves stay in sync.
    const duration =
      parseFloat(
        getComputedStyle(list).getPropertyValue("--transition-duration-fast"),
      ) || FALLBACK_DURATION;

    const panelOf = (item) => item.querySelector(".faq__content");

    const collapse = (item, animate) => {
      item.classList.remove("faq__item--open");
      const panel = panelOf(item);

      if (!panel || !animate) {
        item.open = false;
        if (panel) gsap.set(panel, { clearProps: "height" });
        return;
      }

      gsap.killTweensOf(panel);
      gsap.to(panel, {
        height: 0,
        duration,
        ease: EASE,
        onComplete: () => {
          // Only now can the row leave the accessibility tree as collapsed.
          item.open = false;
          gsap.set(panel, { clearProps: "height" });
        },
      });
    };

    const expand = (item, animate) => {
      item.open = true;
      item.classList.add("faq__item--open");
      const panel = panelOf(item);
      if (!panel) return;

      gsap.killTweensOf(panel);

      if (!animate) {
        gsap.set(panel, { clearProps: "height" });
        return;
      }

      gsap.fromTo(
        panel,
        { height: 0 },
        {
          height: "auto",
          duration,
          ease: EASE,
          onComplete: () => gsap.set(panel, { clearProps: "height" }),
        },
      );
    };

    let current = items.find((item) => item.open) ?? null;

    const onToggle = (event) => {
      const summary = event.target.closest?.(".faq__question");
      if (!summary) return;

      const item = items.find((candidate) => candidate.contains(summary));
      if (!item) return;

      // Native toggling would flip `open` right away and skip the tween.
      // A summary activated with Enter/Space also arrives here as a click.
      event.preventDefault();

      const animate = !reduced.matches;

      if (item === current) {
        collapse(item, animate);
        current = null;
        return;
      }

      if (current) collapse(current, animate);
      expand(item, animate);
      current = item;
    };

    list.addEventListener("click", onToggle);

    return () => {
      list.removeEventListener("click", onToggle);
      items.forEach((item) => {
        const panel = panelOf(item);
        if (!panel) return;
        gsap.killTweensOf(panel);
        gsap.set(panel, { clearProps: "height" });
      });
    };
  }, []);

  return (
    <ul ref={ref} className="faq__list" role="list">
      {children}
    </ul>
  );
}
