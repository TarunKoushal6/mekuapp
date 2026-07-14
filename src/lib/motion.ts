// Central motion primitives. Every component should import from here so
// spring physics and easing stay cohesive across the app.
import type { Transition } from "framer-motion";

/** Default UI spring — critically damped, snappy. Use for most transitions. */
export const springUI: Transition = { type: "spring", bounce: 0, duration: 0.32 };

/** Momentum spring — slight overshoot. Use after a flick/drag/release. */
export const springMomentum: Transition = { type: "spring", bounce: 0.18, duration: 0.34 };

/** Sheet spring — used for drawers/sheets pulled up from the edge. */
export const springSheet: Transition = { type: "spring", bounce: 0.14, duration: 0.42 };

/** Strong ease-out curve for enter transitions (Emil / Apple). */
export const easeOutStrong = [0.23, 1, 0.32, 1] as const;

/** Emphasized ease — good for deliberate confirmations. */
export const easeEmphasized = [0.2, 0, 0, 1] as const;

/** Standard fade+lift preset for content entering the viewport. */
export const fadeUp = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
  transition: { duration: 0.22, ease: easeOutStrong },
};

/** Scale-in for popovers/menus. Pair with transform-origin on the trigger. */
export const scaleIn = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.98 },
  transition: springUI,
};
