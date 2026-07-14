import { useState } from "react";
import { cn } from "@/lib/utils";

// Official brand logos hosted by CoinGecko / official brand-kits. Kept as URLs so
// we don't ship binaries. If a fetch fails, we gracefully fall back to a monogram.
const tokenLogoUrl: Record<string, string> = {
  USDC: "https://assets.coingecko.com/coins/images/6319/small/usdc.png",
  EURC: "https://assets.coingecko.com/coins/images/26045/small/euro.png",
  USDT: "https://assets.coingecko.com/coins/images/325/small/Tether.png",
  PYUSD: "https://assets.coingecko.com/coins/images/31212/small/PYUSD_Logo_%282%29.png",
  DAI: "https://assets.coingecko.com/coins/images/9956/small/Badge_Dai.png",
  USDE: "https://assets.coingecko.com/coins/images/33613/small/USDE.png",
  WBTC: "https://assets.coingecko.com/coins/images/7598/small/wrapped_bitcoin_wbtc.png",
  cirBTC: "https://assets.coingecko.com/coins/images/7598/small/wrapped_bitcoin_wbtc.png",
  WETH: "https://assets.coingecko.com/coins/images/2518/small/weth.png",
  NATIVE: "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
};

const chainLogoUrl: Record<string, string> = {
  Arc_Testnet: "https://assets.coingecko.com/coins/images/6319/small/usdc.png",
  Base_Sepolia: "https://raw.githubusercontent.com/base-org/brand-kit/main/logo/symbol/Base_Symbol_Blue.svg",
  Ethereum_Sepolia: "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
  Arbitrum_Sepolia: "https://assets.coingecko.com/asset_platforms/images/33/small/AO_logomark.png",
  Avalanche_Fuji: "https://assets.coingecko.com/coins/images/12559/small/Avalanche_Circle_RedWhite_Trans.png",
};

const tokenGlyph: Record<string, string> = {
  USDC: "$", EURC: "€", USDT: "₮", PYUSD: "P", DAI: "D", USDE: "E",
  WBTC: "₿", cirBTC: "₿", WETH: "◆", NATIVE: "◇",
};

const chainGlyph: Record<string, string> = {
  Arc_Testnet: "A", Base_Sepolia: "B", Ethereum_Sepolia: "Ξ",
  Arbitrum_Sepolia: "Ar", Avalanche_Fuji: "Av",
};

const sizeClass = {
  sm: "h-7 w-7 text-[10px]",
  md: "h-9 w-9 text-[12px]",
  lg: "h-10 w-10 text-[13px]",
} as const;

interface LogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const TokenLogo = ({ symbol, size = "md", className }: LogoProps & { symbol: string }) => {
  const [errored, setErrored] = useState(false);
  const src = tokenLogoUrl[symbol];
  if (src && !errored) {
    return (
      <img
        src={src}
        alt={symbol}
        onError={() => setErrored(true)}
        className={cn(
          "shrink-0 rounded-full border border-border bg-background object-contain shadow-sm",
          sizeClass[size],
          className,
        )}
      />
    );
  }
  const glyph = tokenGlyph[symbol] ?? symbol.slice(0, 2).toUpperCase();
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full border border-border bg-primary-soft font-bold leading-none text-primary shadow-sm",
        sizeClass[size],
        className,
      )}
    >
      {glyph}
    </span>
  );
};

export const ChainLogo = ({ chain, size = "md", className }: LogoProps & { chain: string }) => {
  const [errored, setErrored] = useState(false);
  const src = chainLogoUrl[chain];
  if (src && !errored) {
    return (
      <img
        src={src}
        alt={chain}
        onError={() => setErrored(true)}
        className={cn(
          "shrink-0 rounded-full border border-border bg-background object-contain shadow-sm",
          sizeClass[size],
          className,
        )}
      />
    );
  }
  const glyph = chainGlyph[chain] ?? chain.slice(0, 2).toUpperCase();
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full border border-border bg-surface-2 font-bold leading-none text-foreground shadow-sm",
        sizeClass[size],
        className,
      )}
    >
      {glyph}
    </span>
  );
};
