import { AppShell } from "@/components/meku/AppShell";
import { ChevronLeft, MoreHorizontal, Eye, Loader2, Copy, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useWallet } from "@/hooks/useWallet";
import { IconSend, IconSwap, IconBridge, IconAssets, IconActivity } from "@/components/meku/MekuIcon";
import { SendSheet } from "@/components/meku/SendSheet";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

type Tab = "Tokens" | "Activity";

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
    supabase.from("transactions").select("*").eq("user_id", user.id)
      .order("created_at", { ascending: false }).limit(20)
      .then(({ data }) => setTxs(data ?? []));
  }, [user, sendOpen]);

  const copy = async () => {
    if (!wallet?.address) return;
    await navigator.clipboard.writeText(wallet.address);
    setCopied(true);
    toast.success("Address copied");
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <AppShell>
      <header className="sticky top-0 z-30 flex h-[56px] items-center justify-between bg-background/80 px-3 backdrop-blur-xl">
        <button onClick={() => navigate(-1)} aria-label="Back" className="tap inline-flex h-10 w-10 items-center justify-center rounded-full">
          <ChevronLeft className="h-[22px] w-[22px]" strokeWidth={1.7} />
        </button>
        <button aria-label="More" className="tap inline-flex h-10 w-10 items-center justify-center rounded-full">
          <MoreHorizontal className="h-[20px] w-[20px]" strokeWidth={1.7} />
        </button>
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
            <span className="flex h-[40px] w-[40px] items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-blue-600 text-[12px] font-bold text-white">
              US
            </span>
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
              <p className="text-[14px] font-semibold tabular-nums text-foreground">
                {t.kind === "send" || t.kind === "tip" ? "-" : "+"}{t.amount} {t.token}
              </p>
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
