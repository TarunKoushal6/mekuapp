import { cn } from "@/lib/utils";

interface LogoProps {
  size?: number;
  className?: string;
  /** Render full wordmark instead of mark only. */
  wordmark?: boolean;
}

/**
 * MEKU mark — sharp geometry, large negative space, elegant symmetry.
 * A monogram built from a perfect square aperture and two mirrored
 * verticals (the M-K rhythm). Quiet, confident, pixel-precise.
 */
export const Logo = ({ size = 22, className, wordmark = false }: LogoProps) => {
  if (wordmark) {
    return (
      <span
        className={cn("inline-flex items-baseline gap-[6px] text-foreground", className)}
        aria-label="MEKU"
      >
        <Mark size={size} />
        <span
          className="font-medium tracking-[-0.04em]"
          style={{ fontSize: size * 0.95, lineHeight: 1 }}
        >
          MEKU
        </span>
      </span>
    );
  }
  return <Mark size={size} className={className} />;
};

const Mark = ({ size = 22, className }: { size?: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    className={cn("text-foreground", className)}
    shapeRendering="geometricPrecision"
  >
    {/* Outer aperture — sharp 1.5px hairline square */}
    <rect x="2.25" y="2.25" width="19.5" height="19.5" rx="2" stroke="currentColor" strokeWidth="1.5" />
    {/* Inner symmetry — two verticals + a centered notch */}
    <path
      d="M7.5 6.5V17.5M16.5 6.5V17.5M7.5 12H16.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="square"
    />
  </svg>
);
