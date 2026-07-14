import { forwardRef } from "react";
import { cn } from "@/lib/utils";

/**
 * ActionButton — single source of truth for tweet action buttons.
 * Guarantees consistent hit-area, icon size, gap, and counter typography
 * across reply / repost / like / views / save / share.
 */
interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  as?: "button" | "div";
  active?: boolean;
  activeClassName?: string;
  hoverClassName?: string;
}

export const ActionButton = forwardRef<HTMLButtonElement, ActionButtonProps>(
  (
    {
      as = "button",
      active = false,
      activeClassName = "",
      hoverClassName = "[@media(hover:hover)]:hover:bg-foreground/5 [@media(hover:hover)]:hover:text-foreground",
      className,
      children,
      ...rest
    },
    ref,
  ) => {
    // Phase 3 — taste + transitions-dev: springy press, unified radius, tabular counters.
    // Hover backgrounds are gated to true hover devices so touch taps don't leave a
    // translucent square behind on mobile (especially visible in light theme).
    // Press-scale + hover styles apply to icons directly, but NOT to anything inside a
    // .heart-container — those SVGs are driven by keyframes (transform: scale) and any
    // extra transition/transform on them cancels the like animation.
    const cls = cn(
      "tap group inline-flex h-8 flex-1 basis-0 min-w-0 items-center justify-center gap-1.5 rounded-full px-1 text-[13px] leading-none tabular-nums",
      "transition-[background-color,color,transform] duration-[160ms] ease-[cubic-bezier(0.23,1,0.32,1)]",
      "active:scale-[0.94] motion-reduce:active:scale-100",
      "[&>svg]:h-[18px] [&>svg]:w-[18px] [&>svg]:shrink-0",
      "[&>svg]:transition-transform [&>svg]:duration-[160ms]",
      "group-active:[&>svg]:scale-[0.92]",
      active ? activeClassName : hoverClassName,
      className,
    );
    if (as === "div") {
      return (
        <div className={cls} onClick={rest.onClick as any} aria-label={rest["aria-label"]}>
          {children}
        </div>
      );
    }
    return (
      <button ref={ref} className={cls} {...rest}>
        {children}
      </button>
    );
  },
);
ActionButton.displayName = "ActionButton";
