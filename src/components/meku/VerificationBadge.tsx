// Glossy 3D scalloped verification badge — matches MEKU reference art.
// Two variants: "verified" (blue) and "premium" (purple).
import { CSSProperties } from "react";

export type VerificationKind = "none" | "verified" | "premium" | null | undefined;

interface Props {
  kind: VerificationKind;
  size?: number;
  className?: string;
  title?: string;
}

// Scalloped 12-point badge path on a 24x24 grid.
const SCALLOP_PATH =
  "M12 1.5l2.4 1.8 3-.4 1.3 2.7 2.7 1.3-.4 3 1.8 2.4-1.8 2.4.4 3-2.7 1.3-1.3 2.7-3-.4L12 22.5l-2.4-1.8-3 .4-1.3-2.7-2.7-1.3.4-3L1.2 12l1.8-2.4-.4-3 2.7-1.3 1.3-2.7 3 .4L12 1.5z";

export const VerificationBadge = ({ kind, size = 18, className, title }: Props) => {
  if (kind !== "verified" && kind !== "premium") return null;

  const isPremium = kind === "premium";
  const uid = isPremium ? "prem" : "veri";

  // Palette per variant — outer soft rim, mid body, deep base + top-left sheen.
  const palette = isPremium
    ? { rim: "#c9a2ff", light: "#b57bff", mid: "#8b3dff", deep: "#5b1fbf", glow: "hsl(270 95% 60% / 0.45)" }
    : { rim: "#8ec5ff", light: "#4d9dff", mid: "#1877f2", deep: "#0a51c4", glow: "hsl(212 100% 55% / 0.40)" };

  const style: CSSProperties = {
    filter: `drop-shadow(0 1px 1.5px rgba(0,0,0,0.18)) drop-shadow(0 0 6px ${palette.glow})`,
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
        {/* Outer soft rim (lighter halo) */}
        <radialGradient id={`${uid}-rim`} cx="35%" cy="30%" r="80%">
          <stop offset="0%" stopColor={palette.rim} stopOpacity="0.9" />
          <stop offset="70%" stopColor={palette.mid} stopOpacity="0.55" />
          <stop offset="100%" stopColor={palette.deep} stopOpacity="0.6" />
        </radialGradient>
        {/* Main glossy body */}
        <radialGradient id={`${uid}-body`} cx="34%" cy="28%" r="85%">
          <stop offset="0%" stopColor={palette.light} />
          <stop offset="55%" stopColor={palette.mid} />
          <stop offset="100%" stopColor={palette.deep} />
        </radialGradient>
        {/* Top sheen */}
        <linearGradient id={`${uid}-sheen`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
          <stop offset="45%" stopColor="#ffffff" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Outer rim — slightly larger via scale */}
      <g transform="translate(12 12) scale(1.02) translate(-12 -12)">
        <path d={SCALLOP_PATH} fill={`url(#${uid}-rim)`} />
      </g>
      {/* Body */}
      <path d={SCALLOP_PATH} fill={`url(#${uid}-body)`} />
      {/* Glossy top sheen clipped to shape */}
      <path d={SCALLOP_PATH} fill={`url(#${uid}-sheen)`} />

      {/* Check mark — bold, soft-rounded, subtle drop shadow */}
      <path
        d="M7.4 12.5l3 3 6.2-6.4"
        fill="none"
        stroke="rgba(0,0,0,0.18)"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        transform="translate(0 0.4)"
      />
      <path
        d="M7.4 12.5l3 3 6.2-6.4"
        fill="none"
        stroke="#ffffff"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default VerificationBadge;
