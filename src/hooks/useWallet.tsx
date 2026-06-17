import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { useAuth } from "./useAuth";
import { initCircle, initDcw, fetchBalance, WalletRow } from "@/lib/circle";

export interface TokenBalance {
  symbol: string;
  name: string;
  amount: string;
  chain: string;
  tokenAddress?: string;
}

interface WalletCtx {
  wallet: WalletRow | null;
  usdc: string;
  balances: TokenBalance[];
  loading: boolean;
  pendingChallenge:
    | { challengeId: string; userToken: string; encryptionKey: string; appId: string }
    | null;
  refresh: () => Promise<void>;
  clearChallenge: () => void;
}

const Ctx = createContext<WalletCtx>({
  wallet: null,
  usdc: "0",
  balances: [],
  loading: false,
  pendingChallenge: null,
  refresh: async () => {},
  clearChallenge: () => {},
});

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<WalletRow | null>(null);
  const [usdc, setUsdc] = useState("0");
  const [balances, setBalances] = useState<TokenBalance[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Ensure Circle user exists (best-effort; safe to skip if it fails).
      try { await initCircle(); } catch (e) { console.warn("initCircle skipped", e); }
      // Provision / load the developer-controlled wallet.
      const dcw = await initDcw();
      if (dcw.wallet) setWallet(dcw.wallet);
      const bal = await fetchBalance();
      if (bal.wallet) setWallet(bal.wallet);
      const tokens: TokenBalance[] = (bal.balances ?? []).map((b: any) => ({
        symbol: b.token?.symbol ?? "?",
        name: b.token?.name ?? b.token?.symbol ?? "Token",
        amount: b.amount ?? "0",
        chain: b.token?.blockchain ?? "ARC",
        tokenAddress: b.token?.tokenAddress,
      }));
      setBalances(tokens);
      const u = tokens.find((t) => t.symbol === "USDC");
      setUsdc(u?.amount ?? "0");
    } catch (e) {
      console.warn("wallet refresh failed", e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { if (user) refresh(); }, [user, refresh]);

  return (
    <Ctx.Provider value={{
      wallet, usdc, balances, loading,
      pendingChallenge: null,
      refresh,
      clearChallenge: () => {},
    }}>
      {children}
    </Ctx.Provider>
  );
};

export const useWallet = () => useContext(Ctx);

