import { ReactNode } from "react";
import { Mascot } from "./Mascot";

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
  /** Hide mascot if the surface forbids it (e.g. feed). */
  mascot?: boolean;
}

export const EmptyState = ({ title, description, action, mascot = true }: EmptyStateProps) => (
  <div className="fade-in flex flex-col items-center justify-center px-6 py-[64px] text-center">
    {mascot && <Mascot size={88} className="mb-[28px] opacity-95" />}
    <h3 className="font-serif text-[28px] leading-[1.1] tracking-[-0.02em] text-foreground">
      {title}
    </h3>
    {description && (
      <p className="mt-[10px] max-w-[28ch] t-body text-muted-foreground">{description}</p>
    )}
    {action && <div className="mt-[24px]">{action}</div>}
  </div>
);
