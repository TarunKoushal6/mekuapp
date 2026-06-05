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

export const ScreenHeader = ({
  eyebrow,
  title,
  subtitle,
  right,
  serif,
  className,
}: ScreenHeaderProps) => {
  return (
    <header className={cn("px-5 pt-8 pb-5", className)}>
      <div className="flex items-end justify-between gap-4">
        <div className="min-w-0">
          {eyebrow && (
            <p className="mb-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              {eyebrow}
            </p>
          )}
          <h1
            className={cn(
              "text-foreground",
              serif
                ? "font-serif-display text-[42px] leading-[1.05] tracking-tightish"
                : "text-[28px] font-semibold leading-tight tracking-tightish"
            )}
          >
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {right && <div className="shrink-0">{right}</div>}
      </div>
    </header>
  );
};
