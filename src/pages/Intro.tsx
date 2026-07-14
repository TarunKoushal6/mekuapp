import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import mMark from "@/assets/meku_m.png.asset.json";
import wordmark from "@/assets/meku_wordmark.png.asset.json";

/**
 * Intro — editorial hero. Radial mesh (primary token), staggered texts-reveal.
 * Phase 5 — taste (mascot anchor, one hero moment), transitions-dev (t-texts-reveal),
 * ui-ux-pro-max (2-line H1 max, single CTA, no meta labels).
 */
const Intro = () => {
  const reduce = useReducedMotion();

  const reveal = (delay: number) =>
    reduce
      ? { initial: false, animate: { opacity: 1 } }
      : {
          initial: { opacity: 0, y: 12, filter: "blur(3px)" },
          animate: { opacity: 1, y: 0, filter: "blur(0px)" },
          transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] as const },
        };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Radial mesh — primary token, no flat purple */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 60% at 50% -10%, hsl(var(--primary) / 0.18), transparent 60%), radial-gradient(80% 50% at 100% 100%, hsl(var(--primary-glow) / 0.14), transparent 55%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-1/3 h-px"
        style={{ background: "linear-gradient(90deg, transparent, hsl(var(--border)), transparent)" }}
      />

      <div className="relative mx-auto flex min-h-screen w-full max-w-[440px] flex-col px-7 pb-10 pt-[64px]">
        <motion.div className="flex flex-col items-center" {...reveal(0)}>
          <img
            src={mMark.url}
            alt=""
            className="no-save h-[184px] w-[184px] select-none object-contain drop-shadow-[0_24px_60px_hsl(var(--primary)/0.22)]"
            draggable={false}
            onContextMenu={(e) => e.preventDefault()}
          />
          <img
            src={wordmark.url}
            alt="MEKU"
            className="no-save wordmark-img mt-5 h-[44px] w-auto select-none object-contain"
            draggable={false}
            onContextMenu={(e) => e.preventDefault()}
          />
        </motion.div>

        <div className="mt-auto">
          <motion.h1
            className="text-foreground"
            style={{ fontWeight: 700, fontSize: "clamp(32px, 9vw, 40px)", lineHeight: 1.05, letterSpacing: "-0.03em" }}
            {...reveal(0.12)}
          >
            Connect. Share. <span className="text-primary">Own.</span>
          </motion.h1>
          <motion.p className="mt-3 text-[14px] leading-[1.5] text-muted-foreground" {...reveal(0.22)}>
            A social experience built on <span className="font-semibold text-primary">Arc.</span>
          </motion.p>
        </div>

        <motion.div {...reveal(0.32)}>
          <Link
            to="/home"
            className="tap mt-8 flex h-[56px] w-full items-center justify-center gap-2 rounded-full bg-primary text-[15px] font-semibold text-primary-foreground transition-transform duration-[160ms] ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.98] motion-reduce:active:scale-100"
            style={{ boxShadow: "0 18px 40px -12px hsl(var(--primary) / 0.5)" }}
          >
            Get Started
            <ArrowRight className="h-[18px] w-[18px]" strokeWidth={2.2} />
          </Link>
        </motion.div>

        <motion.div className="mt-5 flex items-center justify-center gap-1.5" {...reveal(0.42)}>
          <span className="h-1.5 w-5 rounded-full bg-primary" />
          <span className="h-1.5 w-1.5 rounded-full bg-foreground/15" />
          <span className="h-1.5 w-1.5 rounded-full bg-foreground/15" />
        </motion.div>
      </div>
    </div>
  );
};

export default Intro;
