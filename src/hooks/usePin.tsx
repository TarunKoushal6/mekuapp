import { createContext, useCallback, useContext, useEffect, useRef, useState, ReactNode } from "react";
import { useAuth } from "./useAuth";
import { getPinHash, hashPin, isValidPin, setPin as savePin } from "@/lib/pin";
import { PinSheet } from "@/components/meku/PinSheet";

interface PinCtx {
  hasPin: boolean;
  loading: boolean;
  /** Prompt for PIN (creating it on first use). Resolves true on success. */
  requirePin: (purpose?: string) => Promise<boolean>;
  /** Open a setup flow from settings. */
  openSetup: () => Promise<boolean>;
  refresh: () => Promise<void>;
}

const Ctx = createContext<PinCtx>({
  hasPin: false,
  loading: true,
  requirePin: async () => false,
  openSetup: async () => false,
  refresh: async () => {},
});

type Mode = { kind: "setup" | "confirm"; resolve: (ok: boolean) => void } | null;

export const PinProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [hash, setHash] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<Mode>(null);
  const resolverRef = useRef<((ok: boolean) => void) | null>(null);

  const refresh = useCallback(async () => {
    if (!user) { setHash(null); setLoading(false); return; }
    setLoading(true);
    try { setHash(await getPinHash(user.id)); } finally { setLoading(false); }
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  const requirePin = useCallback(async () => {
    if (!user) return false;
    const current = hash ?? (await getPinHash(user.id));
    if (!current) {
      setHash(null);
      return new Promise<boolean>((resolve) => {
        resolverRef.current = resolve;
        setMode({ kind: "setup", resolve });
      });
    }
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
      setMode({ kind: "confirm", resolve });
    });
  }, [user, hash]);

  const openSetup = useCallback(async () => {
    if (!user) return false;
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
      setMode({ kind: "setup", resolve });
    });
  }, [user]);

  const handleClose = (ok: boolean) => {
    resolverRef.current?.(ok);
    resolverRef.current = null;
    setMode(null);
  };

  const handleSubmit = async (pin: string): Promise<string | null> => {
    if (!user) return "Not signed in";
    if (!isValidPin(pin)) return "PIN must be 4–6 digits";
    if (mode?.kind === "setup") {
      try {
        await savePin(user.id, pin);
        const h = await hashPin(pin);
        setHash(h);
        handleClose(true);
        return null;
      } catch (e: any) {
        return e?.message ?? "Could not save PIN";
      }
    }
    // confirm
    const candidate = await hashPin(pin);
    const stored = hash ?? (await getPinHash(user.id));
    if (stored && candidate === stored) {
      handleClose(true);
      return null;
    }
    return "Wrong PIN";
  };

  return (
    <Ctx.Provider value={{ hasPin: !!hash, loading, requirePin, openSetup, refresh }}>
      {children}
      {mode && (
        <PinSheet
          mode={mode.kind}
          onCancel={() => handleClose(false)}
          onSubmit={handleSubmit}
        />
      )}
    </Ctx.Provider>
  );
};

export const usePin = () => useContext(Ctx);
