import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import mPurple from "@/assets/meku_m_purple.png.asset.json";

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
  <img
    src={mPurple.url}
    alt="MEKU"
    className="h-[200px] w-[200px] select-none object-contain"
    draggable={false}
  />
);

export default Intro;
