import { cn } from "@/lib/utils";

const tokenGlyph: Record<string, string> = {
  USDC: "$",
  EURC: "€",
  USDT: "₮",
  PYUSD: "P",
  DAI: "D",
  USDE: "E",
  WBTC: "₿",
  cirBTC: "₿",
  WETH: "◆",
  NATIVE: "◇",
};

const chainGlyph: Record<string, string> = {
  Arc_Testnet: "A",
  Base_Sepolia: "B",
  Ethereum_Sepolia: "Ξ",
  Arbitrum_Sepolia: "Ar",
  Avalanche_Fuji: "Av",
};

export const TokenLogo = ({ symbol, size = "md", className }: { symbol: string; size?: "sm" | "md" | "lg"; className?: string }) => {
  const glyph = tokenGlyph[symbol] ?? symbol.slice(0, 2).toUpperCase();
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full border border-border bg-primary-soft font-bold leading-none text-primary shadow-sm",
        size === "sm" && "h-7 w-7 text-[11px]",
        size === "md" && "h-9 w-9 text-[13px]",
        size === "lg" && "h-10 w-10 text-[15px]",
        className,
      )}
    >
      {glyph}
    </span>
  );
};

export const ChainLogo = ({ chain, size = "md", className }: { chain: string; size?: "sm" | "md" | "lg"; className?: string }) => {
  const glyph = chainGlyph[chain] ?? chain.slice(0, 2).toUpperCase();
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full border border-border bg-surface-2 font-bold leading-none text-foreground shadow-sm",
        size === "sm" && "h-7 w-7 text-[10px]",
        size === "md" && "h-9 w-9 text-[12px]",
        size === "lg" && "h-10 w-10 text-[13px]",
        className,
      )}
    >
      {glyph}
    </span>
  );
};