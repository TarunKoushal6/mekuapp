import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Logo } from "@/components/meku/Logo";

/**
 * Intro / welcome screen.
 * Animated purple wave, MEKU wordmark, tagline, primary CTA.
 */
const Intro = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="relative mx-auto flex min-h-screen w-full max-w-[440px] flex-col px-6 pt-[64px]">
        {/* small mark top-left */}
        <Logo size={36} wordmark={false} appIcon />

        {/* Wordmark + tagline */}
        <div className="mt-[44px]">
          <h1
            aria-label="MEKU"
            className="text-foreground"
            style={{
              fontWeight: 900,
              fontSize: 52,
              lineHeight: 1,
              letterSpacing: "0.32em",
            }}
          >
            M<span className="ml-[2px]">E</span>
            <span className="ml-[2px]">K</span>
            <span className="ml-[2px]">U</span>
          </h1>
          <p className="mt-5 t-lg text-foreground">
            Connect. Converse.
            <br />
            Transact <span className="text-primary font-semibold">onchain.</span>
          </p>
        </div>

        {/* Animated purple wave */}
        <div className="relative mx-auto my-8 flex h-[360px] w-[360px] max-w-full items-center justify-center">
          <Wave />
        </div>

        {/* CTAs */}
        <div className="mt-auto space-y-3 pb-10">
          <Link
            to="/home"
            className="tap flex h-[56px] w-full items-center justify-between rounded-full bg-foreground pl-6 pr-4 text-[15px] font-semibold text-background"
          >
            Create account
            <span className="inline-flex h-[40px] w-[40px] items-center justify-center rounded-full bg-background/10">
              <ArrowRight className="h-[18px] w-[18px]" strokeWidth={1.8} />
            </span>
          </Link>
          <Link
            to="/home"
            className="tap flex h-[56px] w-full items-center justify-center rounded-full bg-surface-2 text-[15px] font-semibold text-foreground"
          >
            I already have an account
          </Link>

          {/* dots */}
          <div className="flex items-center justify-center gap-[6px] pt-3">
            <span className="h-[6px] w-[6px] rounded-full bg-primary" />
            <span className="h-[6px] w-[6px] rounded-full bg-border" />
            <span className="h-[6px] w-[6px] rounded-full bg-border" />
            <span className="h-[6px] w-[6px] rounded-full bg-border" />
          </div>
        </div>
      </div>
    </div>
  );
};

/** Layered, slowly rotating purple line-wave — recreated, not imported. */
const Wave = () => {
  // Generate concentric ring points to form a flowing torus look.
  const rings = Array.from({ length: 48 });
  return (
    <svg viewBox="-200 -200 400 400" className="h-full w-full wave-pulse" aria-hidden>
      <defs>
        <radialGradient id="meku-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.45" />
          <stop offset="60%" stopColor="hsl(var(--primary))" stopOpacity="0.05" />
          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle r="170" fill="url(#meku-glow)" />
      <g className="wave-spin">
        {rings.map((_, i) => {
          const t = i / rings.length;
          const rx = 150 - i * 1.4;
          const ry = 55 + Math.sin(t * Math.PI * 2) * 18;
          const rot = i * 7.5;
          const opacity = 0.18 + (1 - t) * 0.55;
          return (
            <ellipse
              key={i}
              cx="0"
              cy="0"
              rx={Math.max(rx, 8)}
              ry={Math.max(ry, 6)}
              transform={`rotate(${rot})`}
              fill="none"
              stroke="hsl(var(--primary))"
              strokeOpacity={opacity}
              strokeWidth="0.9"
            />
          );
        })}
      </g>
    </svg>
  );
};

export default Intro;
