import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import mMark from "@/assets/meku_m.png.asset.json";
import wordmark from "@/assets/meku_wordmark.png.asset.json";
import iridescent from "@/assets/hero_iridescent.jpg.asset.json";

/**
 * Intro / welcome — iridescent purple hero with locked MEKU lockup.
 */
const Intro = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="relative mx-auto flex min-h-screen w-full max-w-[440px] flex-col overflow-hidden px-7 pb-10 pt-[64px]">
        {/* Iridescent backdrop */}
        <img
          src={iridescent.url}
          alt=""
          aria-hidden
          className="no-save pointer-events-none absolute inset-0 -z-10 h-full w-full select-none object-cover opacity-95"
          draggable={false}
          onContextMenu={(e) => e.preventDefault()}
        />
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-white/60 via-white/10 to-white/70" />

        {/* Locked MEKU lockup */}
        <div className="mt-6 flex flex-col items-center">
          <img
            src={mMark.url}
            alt=""
            className="no-save h-[150px] w-[150px] select-none object-contain drop-shadow-[0_18px_40px_rgba(124,92,255,0.35)]"
            draggable={false}
            onContextMenu={(e) => e.preventDefault()}
          />
          <img
            src={wordmark.url}
            alt="MEKU"
            className="no-save wordmark-img mt-2 h-[30px] w-auto select-none object-contain"
            draggable={false}
            onContextMenu={(e) => e.preventDefault()}
          />
        </div>

        <div className="mt-auto">
          <h1
            className="text-foreground"
            style={{ fontWeight: 700, fontSize: 56, lineHeight: 1.02, letterSpacing: "-0.035em" }}
          >
            Connect.<br />Share.<br /><span className="text-primary">Own.</span>
          </h1>
          <p className="mt-5 text-[15px] leading-[1.5] text-muted-foreground">
            A social experience built<br />
            on <span className="text-primary font-semibold">Arc.</span>
          </p>
        </div>

        <Link
          to="/home"
          className="tap relative mt-10 flex h-[64px] w-full items-center justify-center gap-2 rounded-full text-[16px] font-semibold text-foreground"
          style={{
            background: "linear-gradient(135deg, rgba(255,255,255,0.85) 0%, rgba(232,225,255,0.9) 100%)",
            boxShadow: "0 18px 48px -16px rgba(124,92,255,0.35), inset 0 0 0 1px rgba(255,255,255,0.7)",
            backdropFilter: "blur(14px)",
          }}
        >
          Get Started
          <ArrowRight className="h-[18px] w-[18px] text-primary" strokeWidth={2.2} />
        </Link>

        {/* Pager dots */}
        <div className="mt-6 flex items-center justify-center gap-1.5">
          <span className="h-1.5 w-5 rounded-full bg-primary" />
          <span className="h-1.5 w-1.5 rounded-full bg-foreground/20" />
          <span className="h-1.5 w-1.5 rounded-full bg-foreground/20" />
        </div>
      </div>
    </div>
  );
};

export default Intro;
