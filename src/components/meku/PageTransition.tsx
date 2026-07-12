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

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial={reduce ? { opacity: 0 } : { opacity: 0, transform: "translateY(6px) scale(0.992)" }}
        animate={{ opacity: 1, transform: "translateY(0px) scale(1)" }}
        exit={reduce ? { opacity: 0 } : { opacity: 0, transform: "translateY(-4px) scale(0.996)" }}
        transition={
          reduce
            ? { duration: 0.16, ease: [0.23, 1, 0.32, 1] }
            : { type: "spring", bounce: 0, duration: 0.38 }
        }
        style={{ willChange: "transform, opacity" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};
