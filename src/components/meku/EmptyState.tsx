import { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Mascot, MascotPose } from "./Mascot";

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
  /** Hide mascot if the surface forbids it (e.g. feed). */
  mascot?: boolean;
  pose?: MascotPose;
  mascotSize?: number;
}

const EASE = [0.23, 1, 0.32, 1] as const;

export const EmptyState = ({
  title,
  description,
  action,
  mascot = true,
  pose = "thinking",
  mascotSize = 132,
}: EmptyStateProps) => {
  const reduce = useReducedMotion();

  const item = (delay: number) =>
    reduce
      ? { initial: false as const }
      : {
          initial: { opacity: 0, y: 8 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.36, ease: EASE, delay },
        };

  return (
    <div className="flex flex-col items-center justify-center px-6 py-[72px] text-center">
      {mascot && (
        <motion.div
          {...(reduce
            ? { initial: false as const }
            : {
                initial: { opacity: 0, scale: 0.92 },
                animate: { opacity: 1, scale: 1 },
                transition: { duration: 0.42, ease: EASE },
              })}
          className="mb-[20px]"
        >
          <Mascot pose={pose} size={mascotSize} />
        </motion.div>
      )}
      <motion.h3
        {...item(0.06)}
        className="text-[22px] font-semibold leading-[1.15] tracking-[-0.018em] text-foreground"
      >
        {title}
      </motion.h3>
      {description && (
        <motion.p
          {...item(0.12)}
          className="mt-[8px] max-w-[30ch] text-[14px] leading-[1.5] text-muted-foreground"
        >
          {description}
        </motion.p>
      )}
      {action && (
        <motion.div {...item(0.18)} className="mt-[24px]">
          {action}
        </motion.div>
      )}
    </div>
  );
};
