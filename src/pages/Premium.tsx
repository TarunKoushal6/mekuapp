import { AppShell } from "@/components/meku/AppShell";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { VerificationBadge } from "@/components/meku/VerificationBadge";
import { motion } from "framer-motion";
import { Check, Eye, Sparkles, ShieldCheck, Zap } from "lucide-react";

const blueRules = [
  { icon: Eye, text: "Visible to roughly 50% of the MEKU audience — a curated reach boost." },
  { icon: Check, text: "Authenticity check: notable, real individuals only." },
  { icon: ShieldCheck, text: "Priority moderation and impersonation protection." },
];

const purpleRules = [
  { icon: Eye, text: "Full visibility — reach 100% of people on MEKU." },
  { icon: Sparkles, text: "Reserved for brands, partners and official accounts." },
  { icon: Zap, text: "Highlighted placement across feed, search and tipping." },
  { icon: ShieldCheck, text: "Dedicated verification review by the MEKU team." },
];

const Card = ({
  kind, title, tag, tint, rules, delay,
}: {
  kind: "verified" | "premium";
  title: string;
  tag: string;
  tint: string;
  rules: { icon: any; text: string }[];
  delay: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 14 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.32, delay, ease: [0.22, 1, 0.36, 1] }}
    className="relative overflow-hidden rounded-3xl border border-border bg-surface/60 p-5"
    style={{ boxShadow: "var(--shadow-2)" }}
  >
    <div
      className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full blur-3xl"
      style={{ background: tint }}
    />
    <div className="relative flex items-center gap-3">
      <VerificationBadge kind={kind} size={30} />
      <div className="min-w-0">
        <p className="text-[11.5px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{tag}</p>
        <h3 className="text-[19px] font-bold tracking-[-0.01em] text-foreground">{title}</h3>
      </div>
    </div>
    <ul className="relative mt-4 space-y-2.5">
      {rules.map((r, i) => (
        <motion.li
          key={i}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.28, delay: delay + 0.06 * (i + 1) }}
          className="flex items-start gap-2.5 rounded-xl bg-surface-2/60 px-3 py-2.5"
        >
          <r.icon size={16} className="mt-0.5 shrink-0 text-foreground/70" strokeWidth={1.8} />
          <span className="text-[13.5px] leading-snug text-foreground/85">{r.text}</span>
        </motion.li>
      ))}
    </ul>
  </motion.div>
);

const Premium = () => {
  const navigate = useNavigate();
  return (
    <AppShell hideNav>
      <header className="sticky top-0 z-30 flex h-[56px] items-center gap-2 bg-background/90 px-2 backdrop-blur-xl">
        <button onClick={() => navigate(-1)} aria-label="Back" className="tap inline-flex h-10 w-10 items-center justify-center rounded-full">
          <ChevronLeft className="h-[22px] w-[22px]" strokeWidth={1.75} />
        </button>
        <p className="text-[15px] font-bold text-foreground">Premium</p>
      </header>
      <div className="mx-auto w-full max-w-[440px] px-4 pb-24 pt-2">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28 }}
          className="mb-5 text-center"
        >
          <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-primary">MEKU Premium</p>
          <h1 className="mt-1 text-[26px] font-bold tracking-[-0.02em] text-foreground">
            Two badges. Two levels of reach.
          </h1>
          <p className="mt-2 text-[13.5px] text-muted-foreground">
            Verification is more than a checkmark — it shapes how far your posts travel on MEKU.
          </p>
        </motion.div>

        <div className="space-y-4">
          <Card
            kind="verified"
            tag="Blue tick"
            title="Verified"
            tint="radial-gradient(circle, hsl(212 100% 55% / 0.32), transparent 70%)"
            rules={blueRules}
            delay={0.05}
          />
          <Card
            kind="premium"
            tag="Purple tick"
            title="Premium / Official"
            tint="radial-gradient(circle, hsl(270 95% 60% / 0.32), transparent 70%)"
            rules={purpleRules}
            delay={0.12}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.28 }}
          className="mt-6 rounded-2xl border border-border bg-surface/40 p-4 text-center"
        >
          <p className="text-[12.5px] text-muted-foreground">
            Verification is granted by the MEKU team. Requests are reviewed manually — build a real presence first.
          </p>
        </motion.div>
      </div>
    </AppShell>
  );
};

export default Premium;
