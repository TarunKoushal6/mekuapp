import { cn } from "@/lib/utils";

interface MascotProps {
  size?: number;
  className?: string;
}

/**
 * MEKU mascot — supporting character only. Used in onboarding,
 * empty, loading, success states. Hand-drawn charm, premium execution.
 * Single ink color, ~1.5px strokes, calm geometry.
 */
export const Mascot = ({ size = 96, className }: MascotProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 120 120"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    className={cn("text-foreground", className)}
    shapeRendering="geometricPrecision"
  >
    {/* Soft head — a hand-tilted oval, not a perfect circle */}
    <path
      d="M28 56 C 28 36, 44 22, 62 22 C 82 22, 96 36, 96 56 C 96 76, 80 92, 60 92 C 42 92, 28 76, 28 56 Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
      fill="hsl(var(--surface))"
    />
    {/* Tuft — a single, gentle curl */}
    <path
      d="M58 24 C 60 18, 66 16, 70 20"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      fill="none"
    />
    {/* Eyes — two quiet dots */}
    <circle cx="51" cy="56" r="1.8" fill="currentColor" />
    <circle cx="73" cy="56" r="1.8" fill="currentColor" />
    {/* Smile — small, certain */}
    <path
      d="M55 68 C 58 71, 66 71, 69 68"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      fill="none"
    />
    {/* Shoulders — implied, not drawn out */}
    <path
      d="M30 96 C 40 90, 80 90, 92 96"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      fill="none"
    />
  </svg>
);
