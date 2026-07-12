// Blur-masked crossfade between count values. Numeric change should feel
// like the digit "swapped" in place — not a hard replace, not a slide.
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Props {
  value: number | string;
  className?: string;
}

export const AnimatedCount = ({ value, className }: Props) => {
  const reduce = useReducedMotion();
  if (reduce) return <span className={cn("tabular-nums", className)}>{value}</span>;
  return (
    <span className={cn("relative inline-flex tabular-nums", className)}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={String(value)}
          initial={{ opacity: 0, y: -4, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: 4, filter: "blur(4px)", position: "absolute" }}
          transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
};
