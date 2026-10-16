"use client";

import { useEffect, useState } from "react";

import "@/styles/components/grid-overlay.scss";

const COLUMN_COUNT = 12;

const isTypingTarget = (target) =>
  target instanceof HTMLElement &&
  (target.isContentEditable ||
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.tagName === "SELECT");

/**
 * 12-column design overlay aligned with `.container` / `.row` / `.col`.
 * Toggle with Shift+G. Decorative only (`aria-hidden`, no pointer events).
 */
export default function GridOverlay() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!event.key) return;
      if (event.key.toLowerCase() !== "g" || !event.shiftKey) return;
      if (isTypingTarget(event.target)) return;

      event.preventDefault();
      setIsVisible((visible) => !visible);
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="grid-overlay" aria-hidden="true">
      <div className="container">
        <div className="grid-overlay__wrapper">
          <div className="row">
            {Array.from({ length: COLUMN_COUNT }, (_, index) => (
              <div key={index} className="col">
                <div className="grid-overlay__cell" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
