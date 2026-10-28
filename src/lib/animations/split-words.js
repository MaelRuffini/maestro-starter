import { gsap, SplitText } from "@/lib/gsap";

const BLUR_FROM = "blur(16px)";
const BLUR_TO = "blur(0px)";

/**
 * Words fade in and unblur one after the other when the element scrolls into
 * view. Played once. Words, not chars or lines: stable at heading size and
 * they do not re-split on resize. `aria: "auto"` keeps the heading a single
 * announced string. `clearProps: "filter"` removes the leftover `blur(0px)`,
 * which would keep a compositing layer and can soften text on some GPUs.
 *
 * The element must hold text and inline spans only, and its text must not
 * change after mount (the split spans would go stale).
 *
 * @param {HTMLElement} element
 */
export default function splitWords(element) {
  const split = new SplitText(element, {
    type: "words",
    wordsClass: "split-words__word",
    aria: "auto",
  });

  const ctx = gsap.context(() => {
    gsap.fromTo(
      split.words,
      { opacity: 0, filter: BLUR_FROM },
      {
        opacity: 1,
        filter: BLUR_TO,
        duration: 1.4,
        ease: "power3.out",
        stagger: 0.07,
        clearProps: "filter",
        scrollTrigger: { trigger: element, start: "top 85%", once: true },
      },
    );
  }, element);

  return () => {
    ctx.revert();
    split.revert();
  };
}
