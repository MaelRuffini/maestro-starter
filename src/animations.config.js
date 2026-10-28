/**
 * Animation switchboard — the one file a project edits to choose its motion
 * (SKILL.md §3.8). Maps a **role** to the name of an animation from
 * `src/lib/animations/index.js`. A role set to `false` does nothing.
 *
 * Roles are hooks the shared components emit (`data-animate`):
 *
 *   title  SliceTitle                 → "split-words"
 *   panel  SliceSection, only when the editor sets `settings.panel_animation`
 *          to On                      → "parallax-exit" | "parallax-enter"
 *
 * The template ships with no animation on any role except `panel`, which is
 * still off per slice until an editor turns it on. A single component can
 * override its role: `<SliceTitle animation="split-words" />` forces one,
 * `<SliceTitle animation={false} />` opts out.
 *
 * Plain JS on purpose: the server (`src/lib/animate.js`) reads it, and nothing
 * here may import client code.
 *
 * @type {Record<"title" | "panel", string | false>}
 */
const animations = {
  title: false,
  panel: "parallax-exit",
};

export default animations;
