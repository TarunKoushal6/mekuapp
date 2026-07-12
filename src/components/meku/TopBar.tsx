import { ReactNode, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface TopBarProps {
  left?: ReactNode;
  title?: ReactNode;
  right?: ReactNode;
  className?: string;
  /** Force the hairline on. When omitted, the hairline reveals only after the page scrolls. */
  bordered?: boolean;
}

/**
 * Quiet top bar — fixed 56px, single row, thin icons.
 * Hairline is auto-revealed on scroll (opacity crossfade) unless `bordered` is forced.
 */
export const TopBar = ({ left, title, right, className, bordered }: TopBarProps) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (bordered) return;
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [bordered]);

  const showLine = bordered || scrolled;

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-[56px] items-center justify-between bg-background/85 px-3 backdrop-blur-xl",
        className
      )}
    >
      <div className="flex min-w-[40px] items-center">{left}</div>
      {title && <div className="absolute left-1/2 -translate-x-1/2 t-caption text-foreground">{title}</div>}
      <div className="flex min-w-[40px] items-center justify-end gap-1">{right}</div>
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-border"
        style={{
          opacity: showLine ? 1 : 0,
          transition: "opacity 180ms cubic-bezier(0.23,1,0.32,1)",
        }}
      />
    </header>
  );
};

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
