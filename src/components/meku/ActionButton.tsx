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
      hoverClassName = "hover:bg-foreground/5 hover:text-foreground",
      className,
      children,
      ...rest
    },
    ref,
  ) => {
    const cls = cn(
      "tap inline-flex h-9 flex-1 basis-0 items-center justify-center gap-1 rounded-full px-2 transition-colors",
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
