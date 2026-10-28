"use client";

import { useLayoutEffect } from "react";
import { usePathname } from "next/navigation";

import { ScrollTrigger } from "@/lib/gsap";
import { animations } from "@/lib/animations";
import "@/styles/components/animations.scss";

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

const markReady = (element) => element.setAttribute("data-animate-ready", "");

/**
 * Runs every `[data-animate]` element on the page (SKILL.md §3.8). Mounted
 * once in `layout.js`, after `SmoothScroll`. It reads the animation name from
 * the attribute, lazy-loads that module from `src/lib/animations`, and calls
 * it with the element. Scans again on each navigation; cleanups revert on
 * the way out.
 *
 * `data-animate-ready` is what lifts the "hidden until ready" CSS. It is set
 * once an animation has initialised, and also on every failure path
 * (reduced motion, unknown name, import error) so content is never left
 * invisible.
 */
export default function Animations() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    const elements = [...document.querySelectorAll("[data-animate]")];

    if (window.matchMedia(REDUCED_MOTION).matches) {
      elements.forEach(markReady);
      return undefined;
    }

    const byName = new Map();
    for (const element of elements) {
      const name = element.getAttribute("data-animate");
      byName.set(name, [...(byName.get(name) ?? []), element]);
    }

    let cancelled = false;
    const cleanups = [];

    Promise.all(
      [...byName].map(async ([name, group]) => {
        const load = animations[name];
        if (!load) {
          console.warn(`[animations] unknown animation "${name}"`);
          group.forEach(markReady);
          return;
        }

        try {
          const { default: init } = await load();
          if (cancelled) return;
          for (const element of group) {
            cleanups.push(init(element));
            markReady(element);
          }
        } catch (error) {
          console.error(`[animations] "${name}" failed`, error);
          group.forEach(markReady);
        }
      }),
    ).then(() => {
      if (!cancelled) ScrollTrigger.refresh();
    });

    return () => {
      cancelled = true;
      cleanups.forEach((cleanup) => cleanup?.());
      elements.forEach((element) => element.removeAttribute("data-animate-ready"));
    };
  }, [pathname]);

  return null;
}
