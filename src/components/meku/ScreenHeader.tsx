import { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ScreenHeaderProps {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: string;
  right?: ReactNode;
  serif?: boolean;
  className?: string;
}

const EASE = [0.23, 1, 0.32, 1] as const;

/**
 * Editorial screen header. Serif headlines are reserved for hero moments.
 * Entrance staggers eyebrow → title → subtitle with a strong ease-out.
 */
export const ScreenHeader = ({
  eyebrow,
  title,
  subtitle,
  right,
  serif = true,
  className,
}: ScreenHeaderProps) => {
  const reduce = useReducedMotion();

  const item = (delay: number) =>
    reduce
      ? { initial: false as const }
      : {
          initial: { opacity: 0, y: 6 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.32, ease: EASE, delay },
        };

  return (
    <header className={cn("px-3 pt-6 pb-5", className)}>
      <div className="flex items-end justify-between gap-4">
        <div className="min-w-0">
          {eyebrow && (
            <motion.p {...item(0)} className="t-eyebrow text-muted-foreground">
              {eyebrow}
            </motion.p>
          )}
          <motion.h1
            {...item(eyebrow ? 0.05 : 0)}
            className={cn(
              "mt-3 text-foreground",
              serif
                ? "font-serif text-[44px] leading-[1.02] tracking-[-0.025em]"
                : "t-h1 font-medium"
            )}
          >
            {title}
          </motion.h1>
          {subtitle && (
            <motion.p
              {...item(0.11)}
              className="mt-2 t-body text-muted-foreground"
            >
              {subtitle}
            </motion.p>
          )}
        </div>
        {right && <div className="shrink-0">{right}</div>}
      </div>
    </header>
  );
};
