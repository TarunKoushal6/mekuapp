// Token picker sheet. Shows the user's onchain balances + a static catalogue
// of tokens supported by Circle App Kit on Arc Testnet (USDC, EURC, USDT,
// PYUSD, DAI, USDE, WBTC, WETH). Always reflects the latest balances because
// it consumes useWallet().
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useWallet } from "@/hooks/useWallet";
import { IconCheck, IconSearch } from "./MekuIcon";
import { useMemo, useState } from "react";
import { TokenLogo } from "./TokenLogo";

export interface TokenOption {
  symbol: string;
  name: string;
  chain: string;
  amount?: string;
  logo?: string;
}

const CATALOGUE: TokenOption[] = [
  { symbol: "USDC", name: "USD Coin", chain: "Arc" },
  { symbol: "EURC", name: "Euro Coin", chain: "Arc" },
  { symbol: "USDT", name: "Tether USD", chain: "Arc" },
  { symbol: "PYUSD", name: "PayPal USD", chain: "Arc" },
  { symbol: "DAI",  name: "Dai", chain: "Arc" },
  { symbol: "USDE", name: "Ethena USDe", chain: "Arc" },
  { symbol: "WBTC", name: "Wrapped BTC", chain: "Arc" },
  { symbol: "cirBTC", name: "Circle Wrapped Bitcoin", chain: "Arc" },
  { symbol: "WETH", name: "Wrapped ETH", chain: "Arc" },
];

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  value: string;
  onSelect: (t: TokenOption) => void;
}

export const TokenPicker = ({ open, onOpenChange, value, onSelect }: Props) => {
  const { balances } = useWallet();
  const [q, setQ] = useState("");

  const merged = useMemo(() => {
    const byKey = new Map<string, TokenOption>();
    CATALOGUE.forEach((t) => byKey.set(t.symbol, { ...t }));
    balances.forEach((b) => {
      const existing = byKey.get(b.symbol);
      byKey.set(b.symbol, {
        symbol: b.symbol,
        name: existing?.name ?? b.name,
        chain: existing?.chain ?? "Arc",
        amount: b.amount,
        logo: existing?.logo,
      });
    });
    const list = Array.from(byKey.values());
    const term = q.trim().toLowerCase();
    return term
      ? list.filter((t) => t.symbol.toLowerCase().includes(term) || t.name.toLowerCase().includes(term))
      : list;
  }, [balances, q]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[420px] gap-3 rounded-3xl border-border bg-background p-4">
        <DialogHeader>
          <DialogTitle className="text-[16px]">Select token</DialogTitle>
        </DialogHeader>
        <label className="flex h-11 items-center gap-2 rounded-2xl bg-surface-2 px-3">
          <IconSearch size={16} className="text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search token"
            className="flex-1 bg-transparent text-[14px] outline-none placeholder:text-muted-foreground"
          />
        </label>
        <ul className="max-h-[60vh] overflow-y-auto">
          {merged.map((t) => (
            <li key={t.symbol}>
              <button
                onClick={() => { onSelect(t); onOpenChange(false); }}
                className="tap flex w-full items-center gap-3 rounded-2xl px-2 py-2.5 text-left hover:bg-surface-2"
              >
                <TokenLogo symbol={t.symbol} />
                <span className="flex-1">
                  <span className="block text-[14px] font-semibold text-foreground">{t.symbol}</span>
                  <span className="block text-[11.5px] text-muted-foreground">{t.name} · {t.chain}</span>
                </span>
                <span className="text-right">
                  <span className="block text-[13px] font-semibold tabular-nums text-foreground">{t.amount ?? "0"}</span>
                  {value === t.symbol && (
                    <IconCheck size={14} className="ml-auto text-primary" />
                  )}
                </span>
              </button>
            </li>
          ))}
          {merged.length === 0 && (
            <li className="py-8 text-center text-[13px] text-muted-foreground">No tokens match "{q}"</li>
          )}
        </ul>
      </DialogContent>
    </Dialog>
  );
};
