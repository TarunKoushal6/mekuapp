import { cn } from "@/lib/utils";

interface LogoProps {
  size?: number;
  className?: string;
  wordmark?: boolean;
}

/**
 * MEKU mark — two mirrored M halves meeting at a center arch.
 * Geometric, sharp, single ink color. Matches brand sheet.
 */
export const Logo = ({ size = 22, className, wordmark = true }: LogoProps) => {
  if (!wordmark) return <Mark size={size} className={className} />;
  return (
    <span
      className={cn("inline-flex items-center gap-[8px] text-foreground", className)}
      aria-label="MEKU"
    >
      <Mark size={size} />
      <Wordmark height={Math.round(size * 0.62)} />
    </span>
  );
};

const Mark = ({ size = 22, className }: { size?: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    className={cn("text-foreground", className)}
    shapeRendering="geometricPrecision"
  >
    {/* Left half: outer edge straight, inner slopes down to the centerpoint */}
    <path
      d="M5 6 L5 34 L13 34 L13 20 L20 20 L20 6 Z"
      fill="currentColor"
    />
    {/* Right half mirrors the left */}
    <path
      d="M35 6 L35 34 L27 34 L27 20 L20 20 L20 6 Z"
      fill="currentColor"
    />
    {/* Center arch — negative space carved by the two halves meeting */}
    <path
      d="M16 34 L16 25 Q20 22 24 25 L24 34 Z"
      fill="hsl(var(--background))"
    />
  </svg>
);

/** Wordmark — M, three-bar E, K, U with thin stroke and wide tracking. */
const Wordmark = ({ height = 14 }: { height?: number }) => (
  <svg
    height={height}
    viewBox="0 0 140 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    className="text-foreground"
    shapeRendering="geometricPrecision"
  >
    {/* M */}
    <path d="M3 28 L3 4 L13 18 L23 4 L23 28" stroke="currentColor" strokeWidth="2.4" strokeLinecap="square" strokeLinejoin="miter" fill="none" />
    {/* E — three horizontal bars only */}
    <path d="M38 6 H58 M38 16 H56 M38 26 H58" stroke="currentColor" strokeWidth="2.4" strokeLinecap="square" fill="none" />
    {/* K */}
    <path d="M73 4 V28 M73 16 L88 4 M73 16 L88 28" stroke="currentColor" strokeWidth="2.4" strokeLinecap="square" strokeLinejoin="miter" fill="none" />
    {/* U */}
    <path d="M103 4 V20 Q103 28 113 28 Q123 28 123 20 V4" stroke="currentColor" strokeWidth="2.4" strokeLinecap="square" fill="none" />
  </svg>
);
