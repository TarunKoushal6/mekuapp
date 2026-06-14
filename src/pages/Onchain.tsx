import { AppShell } from "@/components/meku/AppShell";
import { TopBar, IconButton } from "@/components/meku/TopBar";
import { ChevronLeft, Sparkles, ArrowDownUp, ChevronDown, SlidersHorizontal } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { cn } from "@/lib/utils";

const tabs = ["Send", "Swap", "Bridge"] as const;
type Tab = (typeof tabs)[number];

const Onchain = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("Swap");
  const [payAmount, setPayAmount] = useState("0");
  const [receiveAmount] = useState("0");

  return (
    <AppShell hideNav>
      <TopBar
        left={
          <IconButton ariaLabel="Back" onClick={() => navigate(-1)}>
            <ChevronLeft className="h-[22px] w-[22px]" strokeWidth={1.6} />
          </IconButton>
        }
      />

      {/* Hero */}
      <section className="px-5 pb-6 pt-2">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-[34px] font-bold tracking-[-0.025em] text-foreground">Onchain</h1>
            <p className="mt-2 max-w-[26ch] text-[14px] leading-[1.45] text-muted-foreground">
              Powerful tools, built into your conversations.
            </p>
          </div>
          <div className="relative h-[68px] w-[68px] shrink-0">
            <div className="absolute inset-0 rounded-[20px] bg-primary-soft" />
            <div className="absolute inset-[10px] flex items-center justify-center rounded-[14px] bg-primary text-primary-foreground">
              <Sparkles className="h-[22px] w-[22px]" strokeWidth={2} />
            </div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div className="px-5">
        <div className="inline-flex w-full items-center gap-1 rounded-full bg-surface-2 p-1">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "tap flex-1 rounded-full px-3 py-[10px] text-[14px] font-bold",
                tab === t ? "bg-foreground text-background" : "text-muted-foreground"
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Card */}
      <div className="mt-5 px-5">
        <div className="rounded-[20px] border border-border bg-surface p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[15px] font-bold text-foreground">{tab}</span>
              <span className="rounded-full bg-surface-2 px-2 py-[3px] text-[11px] font-semibold text-foreground">
                Arc
              </span>
            </div>
            <button aria-label="Settings" className="tap text-muted-foreground">
              <SlidersHorizontal className="h-[18px] w-[18px]" strokeWidth={1.6} />
            </button>
          </div>

          {/* You pay */}
          <div className="mt-5 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="t-caption text-muted-foreground">You pay</p>
              <input
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value.replace(/[^0-9.]/g, ""))}
                inputMode="decimal"
                className="mt-1 w-full bg-transparent text-[32px] font-bold tracking-[-0.02em] text-foreground outline-none"
              />
              <p className="text-[13px] text-muted-foreground">$0.00</p>
            </div>
            <TokenChip symbol="USDC" balance="0.00" />
          </div>

          {/* Swap divider */}
          <div className="my-4 flex items-center">
            <div className="h-px flex-1 bg-border" />
            <button
              aria-label="Switch"
              className="tap mx-2 inline-flex h-[36px] w-[36px] items-center justify-center rounded-full border border-border bg-background text-foreground"
            >
              <ArrowDownUp className="h-[16px] w-[16px]" strokeWidth={1.8} />
            </button>
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* You receive */}
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="t-caption text-muted-foreground">You receive</p>
              <p className="mt-1 text-[32px] font-bold tracking-[-0.02em] text-foreground">
                {receiveAmount}
              </p>
              <p className="text-[13px] text-muted-foreground">$0.00</p>
            </div>
            <TokenChip symbol="ETH" balance="0.000" />
          </div>
        </div>

        {/* Rate / fee */}
        <div className="mt-4 rounded-[16px] border border-border bg-surface p-4 text-[13px]">
          <Row label="Rate" value="—" />
          <div className="my-3 h-px bg-border" />
          <Row label="Network fee" value="—" />
        </div>

        {/* CTA */}
        <button
          disabled={!payAmount || payAmount === "0"}
          className="tap mt-5 flex h-[56px] w-full items-center justify-center rounded-full bg-foreground text-[15px] font-bold text-background disabled:opacity-40"
        >
          Review {tab.toLowerCase()}
        </button>
        <p className="mt-3 pb-8 text-center text-[12px] text-muted-foreground">
          Routed via Circle. Connect your wallet to continue.
        </p>
      </div>
    </AppShell>
  );
};

const TokenChip = ({ symbol, balance }: { symbol: string; balance: string }) => (
  <button className="tap flex shrink-0 items-center gap-2 rounded-full border border-border bg-background py-1.5 pl-1.5 pr-3">
    <span className="inline-flex h-[28px] w-[28px] items-center justify-center rounded-full bg-primary-soft text-[11px] font-bold text-primary">
      {symbol.slice(0, 2)}
    </span>
    <div className="text-left leading-tight">
      <p className="flex items-center gap-1 text-[13px] font-bold text-foreground">
        {symbol}
        <ChevronDown className="h-[12px] w-[12px]" strokeWidth={2} />
      </p>
      <p className="text-[11px] text-muted-foreground">Bal {balance}</p>
    </div>
  </button>
);

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between">
    <span className="text-muted-foreground">{label}</span>
    <span className="font-semibold text-foreground tabular-nums">{value}</span>
  </div>
);

export default Onchain;
