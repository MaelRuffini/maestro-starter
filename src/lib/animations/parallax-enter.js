import { createParallax } from "./parallax";

/**
 * Enter: the content slides down into place, `y: -60vh → 0`, as the section
 * arrives (`top bottom` → `top top`). The end state is `y: 0`, so the finished
 * slice is exactly the CSS layout.
 */
export default createParallax({
  from: { y: "-60vh" },
  to: { y: 0 },
  start: "top bottom",
  end: "top top",
});
