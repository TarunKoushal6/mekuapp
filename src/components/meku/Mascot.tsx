import { cn } from "@/lib/utils";

interface MascotProps {
  size?: number;
  className?: string;
  /** Pose: sitting (default), waving, thinking. */
  pose?: "sitting" | "waving" | "thinking";
}

/**
 * MEKU mascot — hand-drawn curly-haired kid with a purple, hatched shirt.
 * Used only in onboarding, empty, loading, and success states.
 * Imperfect lines on purpose; matches the brand illustration language.
 */
export const Mascot = ({ size = 120, className, pose = "sitting" }: MascotProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 160 160"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    className={cn("text-foreground", className)}
    shapeRendering="geometricPrecision"
  >
    {/* Hatch pattern for the purple shirt — gives the hand-drawn feel */}
    <defs>
      <pattern id="meku-hatch" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <line x1="0" y1="0" x2="0" y2="4" stroke="hsl(var(--primary))" strokeWidth="2" />
      </pattern>
    </defs>

    {/* Curly hair — a cluster of loose loops */}
    <g stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none">
      <path d="M55 42 q-3 -8 4 -12 q3 -5 10 -3 q4 -6 12 -4 q7 -3 12 2 q8 -1 9 7 q7 3 4 11" />
      <circle cx="60" cy="38" r="3.2" />
      <circle cx="68" cy="32" r="3.4" />
      <circle cx="78" cy="30" r="3.6" />
      <circle cx="88" cy="32" r="3.4" />
      <circle cx="96" cy="38" r="3.2" />
      <circle cx="102" cy="44" r="3" />
      <circle cx="56" cy="46" r="3" />
    </g>

    {/* Head — slightly imperfect oval */}
    <path
      d="M58 52 q-6 10 -2 22 q4 14 22 14 q18 0 22 -14 q4 -12 -2 -22"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="hsl(var(--surface))"
    />

    {/* Ear hint */}
    <path d="M58 70 q-3 1 -3 4 q0 3 3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />

    {/* Eyes — two soft dots */}
    <circle cx="72" cy="70" r="2.2" fill="currentColor" />
    <circle cx="90" cy="70" r="2.2" fill="currentColor" />

    {/* Smile — small, certain */}
    <path d="M74 80 q6 5 14 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />

    {/* Shirt — purple hatched body */}
    <path
      d="M50 110 q4 -14 30 -14 q26 0 30 14 l4 30 q-2 6 -8 6 l-52 0 q-6 0 -8 -6 z"
      fill="url(#meku-hatch)"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    />

    {/* Neckline */}
    <path d="M70 96 q10 6 20 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="hsl(var(--surface))" />

    {/* Arms */}
    {pose === "waving" ? (
      <>
        <path d="M52 116 q-10 -10 -6 -26" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
        <path d="M44 90 q-3 -3 0 -6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
        <path d="M108 116 q8 4 12 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
      </>
    ) : (
      <>
        <path d="M52 116 q-8 6 -10 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
        <path d="M108 116 q8 6 10 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
      </>
    )}

    {/* Ground line — quick scribble */}
    <path d="M44 150 q35 -5 72 0" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.7" />

    {/* Sparkles — purple accents */}
    <g stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round">
      <path d="M118 40 l4 4 M122 40 l-4 4" />
      <path d="M36 60 l3 3 M39 60 l-3 3" />
    </g>
  </svg>
);
