import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ScreenHeaderProps {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: string;
  right?: ReactNode;
  serif?: boolean;
  className?: string;
}

/**
 * Editorial screen header. Serif headlines are reserved for hero moments.
 */
export const ScreenHeader = ({
  eyebrow,
  title,
  subtitle,
  right,
  serif = true,
  className,
}: ScreenHeaderProps) => (
  <header className={cn("px-3 pt-6 pb-5", className)}>
    <div className="flex items-end justify-between gap-4">
      <div className="min-w-0">
        {eyebrow && <p className="t-eyebrow text-muted-foreground">{eyebrow}</p>}
        <h1
          className={cn(
            "mt-3 text-foreground",
            serif
              ? "font-serif text-[44px] leading-[1.02] tracking-[-0.025em]"
              : "t-h1 font-medium"
          )}
        >
          {title}
        </h1>
        {subtitle && <p className="mt-2 t-body text-muted-foreground">{subtitle}</p>}
      </div>
      {right && <div className="shrink-0">{right}</div>}
    </div>
  </header>
);
