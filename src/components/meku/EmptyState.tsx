import { ReactNode } from "react";
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

export const EmptyState = ({
  title,
  description,
  action,
  mascot = true,
  pose = "thinking",
  mascotSize = 132,
}: EmptyStateProps) => (
  <div className="fade-in flex flex-col items-center justify-center px-6 py-[72px] text-center">
    {mascot && <Mascot pose={pose} size={mascotSize} className="mb-[20px]" />}
    <h3 className="text-[22px] font-semibold leading-[1.15] tracking-[-0.018em] text-foreground">
      {title}
    </h3>
    {description && (
      <p className="mt-[8px] max-w-[30ch] text-[14px] leading-[1.5] text-muted-foreground">
        {description}
      </p>
    )}
    {action && <div className="mt-[24px]">{action}</div>}
  </div>
);
