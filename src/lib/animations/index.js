/**
 * Animation registry (SKILL.md §3.8). Name → lazy loader. The names are what
 * `src/animations.config.js` and `data-animate` use. Only the animations a
 * page actually asks for are ever downloaded.
 *
 * An animation module's default export is `init(element) → cleanup`:
 *   - `element` is the node carrying `data-animate="<name>"`;
 *   - build everything inside `gsap.context(…, element)` and return
 *     `() => ctx.revert()` (plus any DOM it changed, e.g. `split.revert()`);
 *   - reduced motion is handled by the controller, which never calls `init`.
 *
 * To add an animation: write `src/lib/animations/<name>.js`, add one line here,
 * and — if it hides its element before it starts — one selector in
 * `src/styles/components/animations.scss`.
 *
 * @type {Record<string, () => Promise<{ default: (element: HTMLElement) => (() => void) | void }>>}
 */
export const animations = {
  "split-words": () => import("./split-words"),
  "parallax-exit": () => import("./parallax-exit"),
  "parallax-enter": () => import("./parallax-enter"),
};
