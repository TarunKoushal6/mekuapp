import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import mMark from "@/assets/meku_m.png.asset.json";
import wordmark from "@/assets/meku_wordmark.png.asset.json";

/**
 * Intro / welcome — cohesive MEKU lockup, generous type.
 */
const Intro = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="relative mx-auto flex min-h-screen w-full max-w-[440px] flex-col px-7 pb-10 pt-[64px]">
        {/* Locked MEKU brand: mark + wordmark tightly paired */}
        <div className="mt-2 flex flex-col items-center">
          <img
            src={mMark.url}
            alt=""
            className="h-[132px] w-[132px] select-none object-contain"
            draggable={false}
          />
          <img
            src={wordmark.url}
            alt="MEKU"
            className="wordmark-img mt-3 h-[34px] w-auto select-none object-contain"
            draggable={false}
          />
        </div>

        <div className="mt-auto">
          <h1
            className="text-foreground"
            style={{ fontWeight: 800, fontSize: 52, lineHeight: 1.02, letterSpacing: "-0.035em" }}
          >
            Connect.<br />Share.<br />Own.
          </h1>
          <p className="mt-6 text-[17px] leading-[1.5] text-muted-foreground">
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

export default Intro;
