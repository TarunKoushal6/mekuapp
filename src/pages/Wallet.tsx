import { AppShell } from "@/components/meku/AppShell";
import { Eye, Loader2, Copy, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useWallet } from "@/hooks/useWallet";
import {
  IconSend, IconSwap, IconBridge, IconAssets, IconActivity,
  IconBack, IconMore, IconCopy, IconExternal, IconRefresh, IconDroplet,
} from "@/components/meku/MekuIcon";
import { SendSheet } from "@/components/meku/SendSheet";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

type Tab = "Tokens" | "Activity";

// Circle / USDC official mark
const USDC_LOGO = "https://cryptologos.cc/logos/usd-coin-usdc-logo.svg";
const ARC_EXPLORER = "https://testnet.arcscan.app";

const TOKEN_LOGO: Record<string, string> = { USDC: USDC_LOGO };

const Wallet = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { wallet, usdc, loading, refresh } = useWallet();
  const [tab, setTab] = useState<Tab>("Tokens");
  const [show, setShow] = useState(true);
  const [sendOpen, setSendOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [txs, setTxs] = useState<any[]>([]);

  useEffect(() => { refresh(); }, []); // eslint-disable-line

  useEffect(() => {
    if (!user) return;
    (async () => {
      // Auto-fail any "pending" tx older than 10 minutes so the activity
      // list never gets stuck on a transient send.
      const cutoff = new Date(Date.now() - 10 * 60 * 1000).toISOString();
      await supabase.from("transactions")
        .update({ status: "failed" })
        .eq("user_id", user.id)
        .eq("status", "pending")
        .lt("created_at", cutoff);

      const { data } = await supabase.from("transactions").select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }).limit(20);
      setTxs(data ?? []);
    })();
  }, [user, sendOpen]);

  const cancelPending = async (id: string) => {
    await supabase.from("transactions").update({ status: "failed" }).eq("id", id);
    setTxs((prev) => prev.map((t) => (t.id === id ? { ...t, status: "failed" } : t)));
    toast.success("Marked as failed");
  };

  const copy = async () => {
    if (!wallet?.address) return;
    await navigator.clipboard.writeText(wallet.address);
    setCopied(true);
    toast.success("Address copied");
    setTimeout(() => setCopied(false), 1500);
  };

  const openExplorer = () => {
    if (!wallet?.address) return;
    window.open(`${ARC_EXPLORER}/address/${wallet.address}`, "_blank");
  };

  const openFaucet = () => {
    window.open("https://faucet.circle.com", "_blank");
  };

  return (
    <AppShell>
      <header className="sticky top-0 z-30 flex h-[56px] items-center justify-between bg-background/80 px-3 backdrop-blur-xl">
        <button onClick={() => navigate(-1)} aria-label="Back" className="tap inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground">
          <IconBack size={22} />
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button aria-label="More" className="tap inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground">
              <IconMore size={20} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-2xl">
            <DropdownMenuItem onClick={copy} disabled={!wallet?.address}>
              <IconCopy size={16} className="mr-2" /> Copy address
            </DropdownMenuItem>
            <DropdownMenuItem onClick={openExplorer} disabled={!wallet?.address}>
              <IconExternal size={16} className="mr-2" /> View on explorer
            </DropdownMenuItem>
            <DropdownMenuItem onClick={openFaucet}>
              <IconDroplet size={16} className="mr-2" /> Get testnet USDC
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => refresh()}>
              <IconRefresh size={16} className="mr-2" /> Refresh balance
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <h1 className="px-5 pt-2 text-[28px] font-bold tracking-[-0.02em] text-foreground">Wallet</h1>

      <div className="px-5 pt-4">
        <div className="relative overflow-hidden rounded-[24px] p-5 gradient-card shadow-purple">
          <div className="flex items-center justify-between">
            <p className="text-[13px] text-white/70">USDC Balance · Arc Testnet</p>
            <button onClick={() => setShow((s) => !s)} aria-label="Toggle balance" className="tap text-white/80">
              <Eye className="h-[16px] w-[16px]" strokeWidth={1.8} />
            </button>
          </div>
          <p className="mt-1 text-white">
            <span style={{ fontSize: 40, fontWeight: 700, letterSpacing: "-0.02em" }}>
              {loading ? "…" : show ? usdc : "••••"}
            </span>
            <span className="ml-2 text-[14px] font-semibold text-white/80">USDC</span>
          </p>
          {wallet?.address ? (
            <button onClick={copy} className="tap mt-1 inline-flex items-center gap-1 text-[12px] text-white/70">
              {wallet.address.slice(0, 6)}…{wallet.address.slice(-4)}
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            </button>
          ) : (
            <p className="text-[12px] text-white/70">
              {wallet?.status === "challenge_pending" ? "Set your PIN to finish wallet setup" : "Provisioning wallet…"}
            </p>
          )}
        </div>

        {/* Faucet pill */}
        <button
          onClick={openFaucet}
          className="tap mt-3 flex w-full items-center justify-between rounded-[16px] border border-border bg-surface px-4 py-3 text-left"
        >
          <span className="flex items-center gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary-soft text-primary">
              <IconDroplet size={18} />
            </span>
            <span>
              <span className="block text-[14px] font-semibold text-foreground">Get testnet USDC</span>
              <span className="block text-[11.5px] text-muted-foreground">Top up from Circle's faucet</span>
            </span>
          </span>
          <IconExternal size={16} className="text-muted-foreground" />
        </button>
      </div>

      <div className="mt-5 grid grid-cols-4 gap-3 px-5">
        <QA icon={IconSend} label="Send" onClick={() => setSendOpen(true)} />
        <QA icon={IconSwap} label="Swap" onClick={() => navigate("/onchain")} />
        <QA icon={IconBridge} label="Bridge" onClick={() => navigate("/onchain")} />
        <QA icon={IconAssets} label="Assets" onClick={() => setTab("Tokens")} />
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
          <li className="tap flex items-center gap-3 rounded-[16px] px-2 py-3 hover:bg-surface-2">
            <img
              src={USDC_LOGO}
              alt="USDC"
              className="h-[40px] w-[40px] rounded-full"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-[15px] font-semibold text-foreground">USDC</p>
              <p className="text-[12px] text-muted-foreground">Arc Testnet</p>
            </div>
            <div className="text-right">
              <p className="text-[15px] font-semibold tabular-nums text-foreground">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : usdc}</p>
              <p className="text-[12px] text-muted-foreground tabular-nums">${usdc}</p>
            </div>
          </li>
        ) : txs.length === 0 ? (
          <li className="px-4 py-10 text-center text-[13px] text-muted-foreground flex flex-col items-center gap-2">
            <IconActivity size={28} />
            No activity yet
          </li>
        ) : (
          txs.map((t) => (
            <li key={t.id} className="flex items-center justify-between rounded-[16px] px-2 py-3 hover:bg-surface-2">
              <div className="min-w-0">
                <p className="text-[14px] font-semibold capitalize text-foreground">{t.kind}</p>
                <p className="truncate text-[12px] text-muted-foreground">
                  {t.counterparty_address?.slice(0, 6)}…{t.counterparty_address?.slice(-4)} · {t.status}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-[14px] font-semibold tabular-nums text-foreground">
                  {t.kind === "send" || t.kind === "tip" ? "-" : "+"}{t.amount} {t.token}
                </p>
                {t.status === "pending" && (
                  <button
                    onClick={() => cancelPending(t.id)}
                    className="tap rounded-full border border-border px-2 py-1 text-[11px] font-semibold text-muted-foreground"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </li>
          ))
        )}
      </ul>

      {sendOpen && (
        <SendSheet open={sendOpen} onOpenChange={setSendOpen} title="Send USDC" />
      )}
    </AppShell>
  );
};

const QA = ({ icon: Icon, label, onClick }: { icon: any; label: string; onClick?: () => void }) => (
  <button onClick={onClick} className="tap flex flex-col items-center gap-1.5">
    <span className="inline-flex h-[44px] w-[44px] items-center justify-center rounded-full bg-surface-2 text-foreground">
      <Icon size={18} />
    </span>
    <span className="text-[11px] font-medium text-muted-foreground">{label}</span>
  </button>
);

export default Wallet;
