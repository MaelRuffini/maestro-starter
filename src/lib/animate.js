import config from "@/animations.config";

/**
 * Server-safe helper for shared components: returns the attribute that opts an
 * element into an animation, or `{}` when none applies. Spread it on the
 * element: `<h2 {...animate("title")} />`.
 *
 * The attribute is only emitted when an animation is on, so the "hidden until
 * ready" CSS (`styles/components/animations.scss`) can never hide an element
 * that nothing will reveal. The client controller (`components/Animations.jsx`)
 * reads the name from the attribute and loads the matching module.
 *
 * @param {keyof typeof config} role  what the element is (config key)
 * @param {string | false} [override]  `undefined` = follow the config,
 *   `false` = no animation here, a string = force that animation
 * @returns {{ "data-animate"?: string }}
 */
export function animate(role, override) {
  const name = override === undefined ? config[role] : override;
  return name ? { "data-animate": name } : {};
}
