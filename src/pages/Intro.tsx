import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import mMark from "@/assets/meku_m.png.asset.json";
import wordmark from "@/assets/meku_wordmark.png.asset.json";

/**
 * Intro / welcome — minimal white + purple. No gradients, no iridescence.
 */
const Intro = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="relative mx-auto flex min-h-screen w-full max-w-[440px] flex-col px-7 pb-10 pt-[72px]">
        {/* Locked MEKU lockup */}
        <div className="flex flex-col items-center">
          <img
            src={mMark.url}
            alt=""
            className="no-save h-[112px] w-[112px] select-none object-contain"
            draggable={false}
            onContextMenu={(e) => e.preventDefault()}
          />
          <img
            src={wordmark.url}
            alt="MEKU"
            className="no-save wordmark-img mt-3 h-[26px] w-auto select-none object-contain"
            draggable={false}
            onContextMenu={(e) => e.preventDefault()}
          />
        </div>

        <div className="mt-auto">
          <h1
            className="text-foreground"
            style={{ fontWeight: 700, fontSize: 60, lineHeight: 1.02, letterSpacing: "-0.035em" }}
          >
            Connect.<br />Share.<br /><span className="text-primary">Own.</span>
          </h1>
          <p className="mt-5 text-[15px] leading-[1.5] text-muted-foreground">
            A social experience built on <span className="text-primary font-semibold">Arc.</span>
          </p>
        </div>

        <Link
          to="/home"
          className="tap mt-10 flex h-[60px] w-full items-center justify-center gap-2 rounded-full bg-primary text-[16px] font-semibold text-primary-foreground shadow-purple"
        >
          Get Started
          <ArrowRight className="h-[18px] w-[18px]" strokeWidth={2.2} />
        </Link>

        <div className="mt-6 flex items-center justify-center gap-1.5">
          <span className="h-1.5 w-5 rounded-full bg-primary" />
          <span className="h-1.5 w-1.5 rounded-full bg-foreground/15" />
          <span className="h-1.5 w-1.5 rounded-full bg-foreground/15" />
        </div>
      </div>
    </div>
  );
};

export default Intro;
