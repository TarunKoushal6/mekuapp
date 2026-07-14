import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useLocation } from "react-router-dom";
import { ReactNode } from "react";

/**
 * iOS-style route transition. Springs from current value, interruptible,
 * GPU-only (transform + opacity). Honors prefers-reduced-motion.
 */
export const PageTransition = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const reduce = useReducedMotion();

  // NOTE: intentionally opacity-only. Any `transform` on this wrapper turns it
  // into a containing block for `position: fixed` descendants (BottomNav / FAB),
  // which visibly hides the bottom navigation on route change.
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{
          duration: reduce ? 0.08 : 0.14,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};
