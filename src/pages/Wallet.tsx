import { AppShell } from "@/components/meku/AppShell";
import { ChevronLeft, MoreHorizontal, Scan, ArrowUp, ArrowDown, ArrowLeftRight, MoreHorizontal as Dots, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { cn } from "@/lib/utils";

type Tab = "Tokens" | "Activity";

const tokens = [
  { sym: "ARC", name: "Arc", amount: "0", usd: "$0.00", color: "from-[hsl(252_95%_72%)] to-[hsl(265_90%_55%)]" },
  { sym: "USDC", name: "USD Coin", amount: "0", usd: "$0.00", color: "from-sky-400 to-blue-600" },
  { sym: "ETH", name: "Ethereum", amount: "0", usd: "$0.00", color: "from-zinc-500 to-zinc-800" },
  { sym: "DAI", name: "Dai Stablecoin", amount: "0", usd: "$0.00", color: "from-amber-400 to-orange-500" },
];

const Wallet = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("Tokens");
  const [show, setShow] = useState(true);

  return (
    <AppShell>
      <header className="sticky top-0 z-30 flex h-[56px] items-center justify-between bg-background/80 px-3 backdrop-blur-xl">
        <button onClick={() => navigate(-1)} aria-label="Back" className="tap inline-flex h-10 w-10 items-center justify-center rounded-full">
          <ChevronLeft className="h-[22px] w-[22px]" strokeWidth={1.7} />
        </button>
        <div className="flex items-center gap-1">
          <button aria-label="Scan" className="tap inline-flex h-10 w-10 items-center justify-center rounded-full">
            <Scan className="h-[18px] w-[18px]" strokeWidth={1.7} />
          </button>
          <button aria-label="More" className="tap inline-flex h-10 w-10 items-center justify-center rounded-full">
            <MoreHorizontal className="h-[20px] w-[20px]" strokeWidth={1.7} />
          </button>
        </div>
      </header>

      <h1 className="px-5 pt-2 text-[28px] font-bold tracking-[-0.02em] text-foreground">Wallet</h1>

      <div className="px-5 pt-4">
        <div className="relative overflow-hidden rounded-[24px] p-5 gradient-card shadow-purple">
          <div className="flex items-center justify-between">
            <p className="text-[13px] text-white/70">Total Balance</p>
            <button onClick={() => setShow((s) => !s)} aria-label="Toggle balance" className="tap text-white/80">
              <Eye className="h-[16px] w-[16px]" strokeWidth={1.8} />
            </button>
          </div>
          <p className="mt-1 text-white">
            <span style={{ fontSize: 40, fontWeight: 700, letterSpacing: "-0.02em" }}>{show ? "0" : "••••"}</span>
            <span className="ml-2 text-[14px] font-semibold text-white/80">ARC</span>
          </p>
          <p className="text-[13px] text-white/70">$0.00 USD</p>
          <svg viewBox="0 0 400 200" className="pointer-events-none absolute -bottom-4 -right-6 h-[160px] w-[260px] opacity-30" aria-hidden>
            <path d="M0 120 Q 100 40 200 120 T 400 120" stroke="white" strokeWidth="1.2" fill="none" />
            <path d="M0 150 Q 120 70 240 150 T 480 150" stroke="white" strokeWidth="1" fill="none" opacity="0.6" />
          </svg>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-4 gap-3 px-5">
        <QA to="/onchain" icon={ArrowUp} label="Send" />
        <QA to="/onchain" icon={ArrowDown} label="Receive" />
        <QA to="/onchain" icon={ArrowLeftRight} label="Swap" />
        <QA to="/settings" icon={Dots} label="More" />
      </div>

      <div className="mt-6 px-5">
        <div className="inline-flex w-full items-center gap-1 rounded-full bg-surface-2 p-1">
          {(["Tokens", "Activity"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "tap flex-1 rounded-full px-3 py-[10px] text-[13px] font-semibold",
                tab === t ? "bg-foreground text-background" : "text-muted-foreground"
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <ul className="mt-2 px-3 pb-8">
        {tab === "Tokens" ? (
          tokens.map((t) => (
            <li key={t.sym} className="tap flex items-center gap-3 rounded-[16px] px-2 py-3 hover:bg-surface-2">
              <span className={cn("flex h-[40px] w-[40px] items-center justify-center rounded-full bg-gradient-to-br text-[12px] font-bold text-white", t.color)}>
                {t.sym.slice(0, 2)}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-semibold text-foreground">{t.sym}</p>
                <p className="text-[12px] text-muted-foreground">{t.name}</p>
              </div>
              <div className="text-right">
                <p className="text-[15px] font-semibold tabular-nums text-foreground">{t.amount}</p>
                <p className="text-[12px] text-muted-foreground tabular-nums">{t.usd}</p>
              </div>
            </li>
          ))
        ) : (
          <li className="px-4 py-10 text-center text-[13px] text-muted-foreground">No activity yet</li>
        )}
      </ul>
    </AppShell>
  );
};

const QA = ({ to, icon: Icon, label }: { to: string; icon: any; label: string }) => (
  <a href={to} className="tap flex flex-col items-center gap-1.5">
    <span className="inline-flex h-[44px] w-[44px] items-center justify-center rounded-full bg-surface-2">
      <Icon className="h-[18px] w-[18px] text-foreground" strokeWidth={2} />
    </span>
    <span className="text-[11px] font-medium text-muted-foreground">{label}</span>
  </a>
);

export default Wallet;
