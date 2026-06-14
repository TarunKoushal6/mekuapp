import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

/**
 * Intro / welcome screen — dark, big purple M, "Connect. Share. Own."
 * Matches reference UI #1.
 */
const Intro = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="relative mx-auto flex min-h-screen w-full max-w-[440px] flex-col px-7 pb-10 pt-[72px]">
        {/* Big M logo */}
        <div className="mt-6 flex flex-col items-center">
          <MLogo />
          <p
            className="mt-5 text-foreground"
            style={{ fontWeight: 500, fontSize: 22, letterSpacing: "0.42em" }}
            aria-label="MEKU"
          >
            M E K U
          </p>
        </div>

        {/* Tagline */}
        <div className="mt-auto">
          <h1 className="text-foreground" style={{ fontWeight: 700, fontSize: 38, lineHeight: 1.1, letterSpacing: "-0.02em" }}>
            Connect.<br />Share.<br />Own.
          </h1>
          <p className="mt-5 text-[15px] leading-[1.55] text-muted-foreground">
            A social experience<br />
            built on <span className="text-primary font-semibold">Arc.</span>
          </p>
        </div>

        <Link
          to="/home"
          className="tap mt-10 flex h-[60px] w-full items-center justify-center gap-2 rounded-full gradient-purple text-[16px] font-semibold text-primary-foreground shadow-purple"
        >
          Get Started
          <ArrowRight className="h-[18px] w-[18px]" strokeWidth={2.2} />
        </Link>
      </div>
    </div>
  );
};

const MLogo = () => (
  <svg viewBox="0 0 200 220" className="h-[200px] w-[180px]" aria-hidden>
    <defs>
      <linearGradient id="m-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="hsl(252 95% 80%)" />
        <stop offset="60%" stopColor="hsl(260 90% 62%)" />
        <stop offset="100%" stopColor="hsl(268 85% 45%)" />
      </linearGradient>
      <linearGradient id="m-grad-2" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="hsl(258 90% 55%)" />
        <stop offset="100%" stopColor="hsl(252 95% 78%)" />
      </linearGradient>
    </defs>
    {/* Left blade */}
    <path d="M10 10 L10 210 L50 210 L50 90 L95 175 L100 165 L60 90 L60 10 Z" fill="url(#m-grad)" />
    {/* Right blade */}
    <path d="M190 10 L190 210 L150 210 L150 90 L105 175 L100 165 L140 90 L140 10 Z" fill="url(#m-grad-2)" />
    {/* Center notch */}
    <path d="M100 165 L70 50 L100 100 L130 50 Z" fill="hsl(252 95% 72%)" opacity="0.85" />
  </svg>
);

export default Intro;
