import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface TopBarProps {
  left?: ReactNode;
  title?: ReactNode;
  right?: ReactNode;
  className?: string;
  /** Show a single hairline underneath. */
  bordered?: boolean;
}

/**
 * Quiet top bar — fixed 56px, single row, thin icons, no chrome.
 */
export const TopBar = ({ left, title, right, className, bordered }: TopBarProps) => (
  <header
    className={cn(
      "sticky top-0 z-30 flex h-[56px] items-center justify-between bg-background/85 px-3 backdrop-blur-xl",
      bordered && "hairline-b",
      className
    )}
  >
    <div className="flex min-w-[40px] items-center">{left}</div>
    {title && <div className="absolute left-1/2 -translate-x-1/2 t-caption text-foreground">{title}</div>}
    <div className="flex min-w-[40px] items-center justify-end gap-1">{right}</div>
  </header>
);

export const IconButton = ({
  children,
  onClick,
  ariaLabel,
}: {
  children: ReactNode;
  onClick?: () => void;
  ariaLabel: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={ariaLabel}
    className="tap inline-flex h-[40px] w-[40px] items-center justify-center rounded-full text-foreground"
  >
    {children}
  </button>
);
