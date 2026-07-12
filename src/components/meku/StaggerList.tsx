import { Children, ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

const EASE = [0.23, 1, 0.32, 1] as const;

/**
 * Reveals its children with a subtle staggered fade+rise.
 * Only the *first* N items stagger — after that they appear instantly so
 * infinite-scroll pagination doesn't cascade an animation down the page.
 */
export const StaggerList = ({
  children,
  step = 0.035,
  max = 8,
  className,
}: {
  children: ReactNode;
  step?: number;
  max?: number;
  className?: string;
}) => {
  const reduce = useReducedMotion();
  const items = Children.toArray(children);

  if (reduce) return <div className={className}>{children}</div>;

  return (
    <div className={className}>
      {items.map((child, i) => {
        const delay = i < max ? i * step : 0;
        return (
          <motion.div
            key={(child as any)?.key ?? i}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, ease: EASE, delay }}
          >
            {child}
          </motion.div>
        );
      })}
    </div>
  );
};
