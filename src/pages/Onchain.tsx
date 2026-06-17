import { AppShell } from "@/components/meku/AppShell";
import { TopBar, IconButton } from "@/components/meku/TopBar";
import { ChevronDown, SlidersHorizontal } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  IconBack, IconSend, IconSwap, IconBridge,
} from "@/components/meku/MekuIcon";
import { useWallet } from "@/hooks/useWallet";
import { SendSheet } from "@/components/meku/SendSheet";
import { TokenPicker, TokenOption } from "@/components/meku/TokenPicker";
import { toast } from "sonner";
import { ChainLogo, TokenLogo } from "@/components/meku/TokenLogo";

const tabs = [
  { id: "Send", icon: IconSend, blurb: "Move USDC to any Arc address." },
  { id: "Swap", icon: IconSwap, blurb: "Trade between supported tokens." },
  { id: "Bridge", icon: IconBridge, blurb: "Move USDC across chains via CCTP." },
] as const;
type Tab = (typeof tabs)[number]["id"];

const USDC: TokenOption = { symbol: "USDC", name: "USD Coin", chain: "Arc" };
const DESTINATION_CHAINS = [
  { id: "Base_Sepolia", label: "Base Sepolia" },
  { id: "Ethereum_Sepolia", label: "Ethereum Sepolia" },
  { id: "Arbitrum_Sepolia", label: "Arbitrum Sepolia" },
] as const;

const Onchain = () => {
  const navigate = useNavigate();
  const { wallet, usdc } = useWallet();
  const [tab, setTab] = useState<Tab>("Swap");
  const [payAmount, setPayAmount] = useState("");
  const [sendOpen, setSendOpen] = useState(false);
  const [tokenIn, setTokenIn] = useState<TokenOption>(USDC);
  const [tokenOut, setTokenOut] = useState<TokenOption>({ symbol: "EURC", name: "Euro Coin", chain: "Arc" });
  const [pickerFor, setPickerFor] = useState<"in" | "out" | null>(null);
  const [destinationChain, setDestinationChain] = useState<(typeof DESTINATION_CHAINS)[number]["id"]>("Base_Sepolia");
  const [confirmPin, setConfirmPin] = useState("");

  const current = tabs.find((t) => t.id === tab)!;
  const Hero = current.icon;

  const onCta = async () => {
    if (!wallet?.wallet_id) {
      toast.error("Your wallet is still provisioning. Try again in a moment.");
      return;
    }
    if (tab === "Send") { setSendOpen(true); return; }
    if (confirmPin.length !== 4) {
      toast.error("Enter your 4-digit confirmation PIN first.");
      return;
    }
    try {
      if (tab === "Swap") {
        const { data, error } = await (await import("@/integrations/supabase/client")).supabase
          .functions.invoke("circle-swap", {
            body: { chain: "Arc_Testnet", tokenIn: tokenIn.symbol, tokenOut: tokenOut.symbol, amountIn: payAmount },
          });
        if (error || (data as any)?.error) throw new Error((data as any)?.error ?? error?.message);
        toast.success("Swap submitted");
      } else if (tab === "Bridge") {
        const { data, error } = await (await import("@/integrations/supabase/client")).supabase
          .functions.invoke("circle-bridge", {
            body: { fromChain: "Arc_Testnet", toChain: destinationChain, amount: payAmount, recipientAddress: wallet.address },
          });
        if (error || (data as any)?.error) throw new Error((data as any)?.error ?? error?.message);
        toast.success("Bridge submitted");
      }
      setConfirmPin("");
    } catch (e: any) {
      toast.error(e?.message ?? `${tab} failed`);
    }
  };

  return (
    <AppShell hideNav>
      <TopBar
        left={
          <IconButton ariaLabel="Back" onClick={() => navigate(-1)}>
            <IconBack size={22} />
          </IconButton>
        }
      />

      <section className="px-5 pb-6 pt-2">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-[34px] font-bold tracking-[-0.025em] text-foreground">Onchain</h1>
            <p className="mt-2 max-w-[26ch] text-[14px] leading-[1.45] text-muted-foreground">
              {current.blurb}
            </p>
          </div>
          <div className="relative h-[76px] w-[76px] shrink-0">
            <div className="absolute inset-0 rounded-[22px] gradient-purple shadow-purple" />
            <div className="absolute inset-[10px] flex items-center justify-center rounded-[14px] bg-background text-primary">
              <Hero size={28} />
            </div>
          </div>
        </div>
      </section>

      <div className="px-5">
        <div className="inline-flex w-full items-center gap-1 rounded-full bg-surface-2 p-1">
          {tabs.map(({ id, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={cn(
                "tap flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-[10px] text-[14px] font-bold",
                tab === id ? "bg-foreground text-background" : "text-muted-foreground"
              )}
            >
              <Icon size={15} />
              {id}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 px-5">
        <div className="rounded-[20px] border border-border bg-surface p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[15px] font-bold text-foreground">{tab}</span>
              <span className="rounded-full bg-surface-2 px-2 py-[3px] text-[11px] font-semibold text-foreground">
                Arc Testnet
              </span>
            </div>
            <button aria-label="Settings" className="tap text-muted-foreground">
              <SlidersHorizontal className="h-[18px] w-[18px]" strokeWidth={1.6} />
            </button>
          </div>

          <div className="mt-5 flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-[12px] uppercase tracking-wider text-muted-foreground">You pay</p>
              <input
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value.replace(/[^0-9.]/g, ""))}
                placeholder="0"
                inputMode="decimal"
                className="mt-1 w-full bg-transparent text-[34px] font-bold tracking-[-0.02em] text-foreground outline-none"
              />
              <p className="text-[12px] text-muted-foreground">Balance {usdc} {tokenIn.symbol}</p>
            </div>
            <TokenChip token={tokenIn} onClick={() => setPickerFor("in")} />
          </div>

          {tab !== "Send" && (
            <>
              <div className="my-4 flex items-center">
                <div className="h-px flex-1 bg-border" />
                <button
                  onClick={() => { const t = tokenIn; setTokenIn(tokenOut); setTokenOut(t); }}
                  className="tap mx-2 inline-flex h-[36px] w-[36px] items-center justify-center rounded-full border border-border bg-background text-foreground"
                  aria-label="Swap direction"
                >
                  {tab === "Swap" ? <IconSwap size={16} /> : <IconBridge size={16} />}
                </button>
                <div className="h-px flex-1 bg-border" />
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] uppercase tracking-wider text-muted-foreground">You receive</p>
                  <p className="mt-1 text-[34px] font-bold tracking-[-0.02em] text-foreground">
                    {payAmount || "0"}
                  </p>
                  <p className="text-[12px] text-muted-foreground">Estimated</p>
                </div>
                <TokenChip token={tokenOut} onClick={() => setPickerFor("out")} />
              </div>
            </>
          )}
        </div>

        <div className="mt-4 rounded-[16px] border border-border bg-surface p-4 text-[13px]">
          <Row label="Route" value={tab === "Bridge" ? "CCTP v2" : "Circle App Kit"} />
          <div className="my-3 h-px bg-border" />
          <Row label="Network fee" value="Paid in USDC" />
        </div>

        <button
          onClick={onCta}
          disabled={!payAmount || Number(payAmount) <= 0}
          className="tap mt-5 flex h-[56px] w-full items-center justify-center rounded-full bg-foreground text-[15px] font-bold text-background disabled:opacity-40"
        >
          Review {tab.toLowerCase()}
        </button>
        <p className="mt-3 pb-8 text-center text-[12px] text-muted-foreground">
          Routed through your MEKU wallet on Arc Testnet.
        </p>
      </div>

      {sendOpen && (
        <SendSheet
          open={sendOpen}
          onOpenChange={setSendOpen}
          title={`Send ${tokenIn.symbol}`}
          defaults={{ amount: payAmount || "1", kind: "send" }}
        />
      )}

      {pickerFor && (
        <TokenPicker
          open={!!pickerFor}
          onOpenChange={(o) => !o && setPickerFor(null)}
          value={pickerFor === "in" ? tokenIn.symbol : tokenOut.symbol}
          onSelect={(t) => pickerFor === "in" ? setTokenIn(t) : setTokenOut(t)}
        />
      )}
    </AppShell>
  );
};

const TokenChip = ({ token, onClick }: { token: TokenOption; onClick?: () => void }) => (
  <button onClick={onClick} className="tap flex shrink-0 items-center gap-2 rounded-full border border-border bg-background py-1.5 pl-1.5 pr-3">
    {token.logo ? (
      <img src={token.logo} alt={token.symbol} className="h-[28px] w-[28px] rounded-full" />
    ) : (
      <span className="inline-flex h-[28px] w-[28px] items-center justify-center rounded-full bg-primary-soft text-[11px] font-bold text-primary">
        {token.symbol.slice(0, 2)}
      </span>
    )}
    <div className="text-left leading-tight">
      <p className="flex items-center gap-1 text-[13px] font-bold text-foreground">
        {token.symbol}
        <ChevronDown className="h-[12px] w-[12px]" strokeWidth={2} />
      </p>
      <p className="text-[11px] text-muted-foreground">{token.chain}</p>
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
