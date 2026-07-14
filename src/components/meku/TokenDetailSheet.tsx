import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { IconExternal, IconSend, IconActivity } from "./MekuIcon";
import { Loader2 } from "lucide-react";
import { formatAmount } from "@/lib/format";
import { AnimatedCount } from "./AnimatedCount";
import { motion, useReducedMotion } from "framer-motion";
import { springSheet } from "@/lib/motion";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  token: { symbol: string; name?: string; chain?: string; amount: string; logo?: string } | null;
}

const ARC_EXPLORER = "https://testnet.arcscan.app";

export const TokenDetailSheet = ({ open, onOpenChange, token }: Props) => {
  const { user } = useAuth();
  const [txs, setTxs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !user || !token) return;
    setLoading(true);
    supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user.id)
      .eq("token", token.symbol)
      .order("created_at", { ascending: false })
      .limit(50)
      .then(({ data }) => {
        setTxs(data ?? []);
        setLoading(false);
      });
  }, [open, user, token]);

  if (!token) return null;

  const reduce = useReducedMotion();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[88vh] overflow-y-auto rounded-t-[var(--r4)] border-border bg-background">
        <motion.div
          initial={reduce ? { opacity: 0 } : { y: 24, opacity: 0 }}
          animate={reduce ? { opacity: 1 } : { y: 0, opacity: 1 }}
          transition={springSheet}
        >
        <SheetHeader>
          <SheetTitle className="flex items-center gap-3">
            {token.logo ? (
              <img src={token.logo} alt={token.symbol} className="h-10 w-10 rounded-full" />
            ) : (
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary-soft text-[12px] font-bold text-primary">
                {token.symbol.slice(0, 3)}
              </span>
            )}
            <div className="text-left">
              <p className="text-[16px] font-bold">{token.symbol}</p>
              <p className="text-[12px] font-normal text-muted-foreground">{token.name ?? token.chain ?? "Token"}</p>
            </div>
          </SheetTitle>
        </SheetHeader>

        <div className="mt-4 rounded-[20px] border border-border bg-surface p-4">
          <p className="text-[12px] text-muted-foreground">Balance</p>
          <p className="mt-1 text-[28px] font-bold text-foreground">
            <AnimatedCount value={formatAmount(token.amount)} /> <span className="text-[14px] text-muted-foreground">{token.symbol}</span>
          </p>
        </div>

        <h3 className="mt-5 px-1 text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">
          Activity
        </h3>
        <ul className="mt-2 pb-6">
          {loading ? (
            <li className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></li>
          ) : txs.length === 0 ? (
            <li className="flex flex-col items-center gap-2 py-10 text-center text-[13px] text-muted-foreground">
              <IconActivity size={28} />
              No {token.symbol} activity yet
            </li>
          ) : (
            txs.map((t) => (
              <li key={t.id} className="flex items-center justify-between rounded-[14px] px-2 py-3 hover:bg-surface-2">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-2 text-foreground">
                    <IconSend size={16} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[14px] font-semibold capitalize text-foreground">{t.kind}</p>
                    <p className="truncate text-[11px] text-muted-foreground">
                      {t.counterparty_address ? `${t.counterparty_address.slice(0, 6)}…${t.counterparty_address.slice(-4)}` : "—"} · {t.status}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[14px] font-semibold tabular-nums text-foreground">
                    {t.kind === "send" || t.kind === "tip" ? "-" : "+"}{formatAmount(t.amount)} {t.token}
                  </p>
                  {t.circle_tx_id && (
                    <a
                      href={`${ARC_EXPLORER}/tx/${t.circle_tx_id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-primary inline-flex items-center gap-1"
                    >
                      Explorer <IconExternal size={11} />
                    </a>
                  )}
                </div>
              </li>
            ))
          )}
        </ul>
        </motion.div>
      </SheetContent>
    </Sheet>
  );
};
