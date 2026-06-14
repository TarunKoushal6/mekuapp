import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { useAuth } from "./useAuth";
import { initCircle, fetchBalance, WalletRow } from "@/lib/circle";

interface WalletCtx {
  wallet: WalletRow | null;
  usdc: string;
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
  loading: false,
  pendingChallenge: null,
  refresh: async () => {},
  clearChallenge: () => {},
});

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<WalletRow | null>(null);
  const [usdc, setUsdc] = useState("0");
  const [loading, setLoading] = useState(false);
  const [pendingChallenge, setPendingChallenge] = useState<WalletCtx["pendingChallenge"]>(null);

  const refresh = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const init = await initCircle();
      setWallet(init.wallet);
      if (init.challengeId && init.appId) {
        setPendingChallenge({
          challengeId: init.challengeId,
          userToken: init.userToken,
          encryptionKey: init.encryptionKey,
          appId: init.appId,
        });
      }
      const bal = await fetchBalance();
      if (bal.wallet) setWallet(bal.wallet);
      const u = (bal.balances ?? []).find((b: any) =>
        b.token?.symbol === "USDC" || b.token?.name === "USD Coin",
      );
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
      wallet, usdc, loading, pendingChallenge, refresh,
      clearChallenge: () => setPendingChallenge(null),
    }}>
      {children}
    </Ctx.Provider>
  );
};

export const useWallet = () => useContext(Ctx);
