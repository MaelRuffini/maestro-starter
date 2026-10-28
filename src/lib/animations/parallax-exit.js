import { createParallax } from "./parallax";

/**
 * Exit: the content sinks to `y: 60vh` as the section scrolls away
 * (`bottom bottom` → `bottom top`).
 */
export default createParallax({
  to: { y: "60vh" },
  start: "bottom bottom",
  end: "bottom top",
});
