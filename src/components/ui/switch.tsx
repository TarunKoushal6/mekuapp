import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";

import { cn } from "@/lib/utils";

// MEKU switch — rectangular pill (rounded-lg, not full-round) to match the
// app's softened-rectangle iconography. Thumb is a square with matching radius.
const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "peer relative inline-flex h-[28px] w-[48px] shrink-0 cursor-pointer items-center rounded-[10px] border border-transparent transition-colors",
      "data-[state=checked]:bg-primary data-[state=unchecked]:bg-muted",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      "disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none ml-[3px] block h-[22px] w-[22px] rounded-[7px] bg-background shadow-sm ring-0",
        "transition-transform duration-200 ease-out",
        "data-[state=checked]:translate-x-[20px] data-[state=unchecked]:translate-x-0",
      )}
    />
  </SwitchPrimitives.Root>
));
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };
