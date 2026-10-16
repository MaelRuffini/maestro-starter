"use client";

import { useEffect } from "react";
import { ReactLenis, useLenis } from "lenis/react";

import { ScrollTrigger } from "@/lib/gsap";

import "lenis/dist/lenis.css";

const OPTIONS = {
  autoRaf: true,
  anchors: true,
  stopInertiaOnNavigate: true,
};

function SyncGsap() {
  useLenis(ScrollTrigger.update);

  useEffect(() => {
    ScrollTrigger.refresh();
  }, []);

  return null;
}

/**
 * Document-level smooth scroll (Lenis). `root` attaches to the window so the
 * page is not wrapped. Reduced motion is built-in (`respectReducedMotion`).
 * Anchor links (skip link, hashes) stay enabled; inertia stops on Next.js
 * client navigations. GSAP ScrollTrigger is kept in sync via `useLenis`.
 */
export default function SmoothScroll() {
  return (
    <ReactLenis root options={OPTIONS}>
      <SyncGsap />
    </ReactLenis>
  );
}
