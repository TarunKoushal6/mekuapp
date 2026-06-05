import { ReactNode } from "react";
import { Mascot } from "./Mascot";

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export const EmptyState = ({ title, description, action }: EmptyStateProps) => (
  <div className="flex flex-col items-center justify-center px-8 py-16 text-center meku-fade-in">
    <Mascot size={104} className="mb-6 opacity-90" />
    <h3 className="font-serif-display text-2xl leading-tight text-foreground">{title}</h3>
    {description && (
      <p className="mt-2 max-w-[26ch] text-sm text-muted-foreground">{description}</p>
    )}
    {action && <div className="mt-6">{action}</div>}
  </div>
);
