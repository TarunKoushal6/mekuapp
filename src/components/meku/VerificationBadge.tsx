// Custom X/Twitter-style scalloped verification badge (no shadcn).
// Two variants: "verified" (blue) and "premium" (purple/gold gradient).
import { CSSProperties } from "react";

export type VerificationKind = "none" | "verified" | "premium" | null | undefined;

interface Props {
  kind: VerificationKind;
  size?: number;
  className?: string;
  title?: string;
}

// Scalloped 12-point badge path — classic X shape on a 24x24 grid.
const SCALLOP_PATH =
  "M12 1.5l2.4 1.8 3-.4 1.3 2.7 2.7 1.3-.4 3 1.8 2.4-1.8 2.4.4 3-2.7 1.3-1.3 2.7-3-.4L12 22.5l-2.4-1.8-3 .4-1.3-2.7-2.7-1.3.4-3L1.2 12l1.8-2.4-.4-3 2.7-1.3 1.3-2.7 3 .4L12 1.5z";

export const VerificationBadge = ({ kind, size = 16, className, title }: Props) => {
  if (kind !== "verified" && kind !== "premium") return null;

  const isPremium = kind === "premium";
  const gradId = isPremium ? "meku-badge-premium" : "meku-badge-verified";
  const style: CSSProperties = {
    filter: isPremium
      ? "drop-shadow(0 0 6px hsl(270 90% 65% / 0.35))"
      : "drop-shadow(0 0 4px hsl(210 100% 55% / 0.25))",
  };

  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      style={style}
      aria-label={title ?? (isPremium ? "Premium account" : "Verified account")}
      role="img"
    >
      <defs>
        <linearGradient id="meku-badge-verified" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#4aa3ff" />
          <stop offset="100%" stopColor="#1877f2" />
        </linearGradient>
        <linearGradient id="meku-badge-premium" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#c084fc" />
          <stop offset="55%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#6d28d9" />
        </linearGradient>
      </defs>
      <path d={SCALLOP_PATH} fill={`url(#${gradId})`} />
      <path
        d="M7.6 12.3l2.9 2.9 5.9-6"
        fill="none"
        stroke="#ffffff"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default VerificationBadge;
