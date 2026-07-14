import { createContext, useCallback, useContext, useEffect, useRef, useState, ReactNode } from "react";
import { useAuth } from "./useAuth";
import {
  getPinHash, hashPin, isValidPin, setPin as savePin,
  saveRecovery, verifyRecovery, getRecovery, clearPin,
} from "@/lib/pin";
import { PinSheet, PinMode } from "@/components/meku/PinSheet";
import { toast } from "sonner";

interface PinCtx {
  hasPin: boolean;
  loading: boolean;
  /** Prompt for PIN (creating it on first use). Resolves the PIN hash on success, null on cancel. */
  requirePin: (purpose?: string) => Promise<string | null>;
  /** Open a setup flow from settings. */
  openSetup: () => Promise<boolean>;
  refresh: () => Promise<void>;
}

const Ctx = createContext<PinCtx>({
  hasPin: false,
  loading: true,
  requirePin: async () => null,
  openSetup: async () => false,
  refresh: async () => {},
});

type Mode = {
  kind: PinMode;
  resolve: (ok: boolean | string | null) => void;
  recoveryQuestions?: [string, string, string];
} | null;

export const PinProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [hash, setHash] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadedUserId, setLoadedUserId] = useState<string | null>(null);
  const [lookupFailed, setLookupFailed] = useState(false);
  const [mode, setMode] = useState<Mode>(null);
  const resolverRef = useRef<((v: any) => void) | null>(null);
  const pendingHashRef = useRef<string | null>(null);
  const autoPromptedRef = useRef<string | null>(null);

  const refresh = useCallback(async () => {
    if (!user) {
      setHash(null);
      setLoadedUserId(null);
      setLookupFailed(false);
      setLoading(false);
      return;
    }
    setLoading(true);
    setLookupFailed(false);
    try {
      setHash(await getPinHash(user.id));
      setLoadedUserId(user.id);
    } catch (e) {
      console.warn("pin lookup failed", e);
      setHash(null);
      setLoadedUserId(null);
      setLookupFailed(true);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  // Auto-prompt PIN setup right after signup / first sign-in.
  // Persist the "we already offered" flag per-user so a dismissed setup
  // doesn't keep popping back on every render / refresh.
  useEffect(() => {
    if (!user || loading || loadedUserId !== user.id || lookupFailed || hash || mode) return;
    const key = `meku.pin.autoPrompted.${user.id}`;
    if (autoPromptedRef.current === user.id) return;
    if (typeof window !== "undefined" && window.localStorage.getItem(key)) {
      autoPromptedRef.current = user.id;
      return;
    }
    autoPromptedRef.current = user.id;
    try { window.localStorage.setItem(key, "1"); } catch {}
    setMode({ kind: "setup", resolve: () => {} });
  }, [user, loading, loadedUserId, lookupFailed, hash, mode]);

  useEffect(() => {
    if (!user) autoPromptedRef.current = null;
  }, [user]);

  const requirePin = useCallback(async (): Promise<string | null> => {
    if (!user) return null;
    let current: string | null;
    try {
      current = hash ?? (await getPinHash(user.id));
    } catch (e) {
      console.warn("pin lookup failed", e);
      toast.error("Could not check your wallet PIN. Try again.");
      return null;
    }
    if (!current) {
      setHash(null);
      return new Promise<string | null>((resolve) => {
        resolverRef.current = resolve as (v: any) => void;
        setMode({ kind: "setup", resolve: resolve as (v: any) => void });
      });
    }
    return new Promise<string | null>((resolve) => {
      resolverRef.current = resolve as (v: any) => void;
      setMode({ kind: "confirm", resolve: resolve as (v: any) => void });
    });
  }, [user, hash]);

  const openSetup = useCallback(async () => {
    if (!user) return false;
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve as (v: any) => void;
      setMode({ kind: "setup", resolve: resolve as (v: any) => void });
    });
  }, [user]);

  const handleClose = (result: boolean | string | null) => {
    resolverRef.current?.(result as any);
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
        pendingHashRef.current = h;
        // Do NOT close — PinSheet transitions to the recovery step next.
        return null;
      } catch (e: any) {
        return e?.message ?? "Could not save PIN";
      }
    }
    // confirm
    const candidate = await hashPin(pin);
    const stored = hash ?? (await getPinHash(user.id));
    if (stored && candidate === stored) {
      handleClose(candidate);
      return null;
    }
    return "Wrong PIN";
  };

  const handleSaveRecovery = async (
    qs: [string, string, string],
    answers: [string, string, string],
  ): Promise<string | null> => {
    if (!user) return "Not signed in";
    try {
      await saveRecovery(user.id, qs, answers);
      // Re-sync hash from DB so the auto-prompt effect doesn't re-fire.
      await refresh();
      return null;
    } catch (e: any) {
      return e?.message ?? "Could not save recovery questions";
    }
  };

  const handleComplete = () => {
    const h = pendingHashRef.current;
    pendingHashRef.current = null;
    resolverRef.current?.(h ?? true);
    resolverRef.current = null;
    setMode(null);
  };

  const handleForgotPin = async () => {
    if (!user) return;
    const row = await getRecovery(user.id);
    if (!row) {
      // No recovery set — fall back to fresh setup
      handleClose(false);
      setTimeout(() => setMode({ kind: "setup", resolve: () => {} }), 50);
      return;
    }
    setMode({
      kind: "recover",
      resolve: () => {},
      recoveryQuestions: [row.q1, row.q2, row.q3],
    });
  };

  const handleVerifyRecovery = async (
    answers: [string, string, string],
  ): Promise<string | null> => {
    if (!user) return "Not signed in";
    const ok = await verifyRecovery(user.id, answers);
    if (!ok) return "Those answers don't match. Try again.";
    try {
      await clearPin(user.id);
      setHash(null);
      // Switch to setup so the user picks a new PIN immediately.
      setMode({ kind: "setup", resolve: () => {} });
      return null;
    } catch (e: any) {
      return e?.message ?? "Could not reset PIN";
    }
  };

  return (
    <Ctx.Provider value={{ hasPin: !!hash, loading, requirePin, openSetup, refresh }}>
      {children}
      {mode && (
        <PinSheet
          mode={mode.kind}
          recoveryQuestions={mode.recoveryQuestions}
          onCancel={() => handleClose(false)}
          onComplete={handleComplete}
          onSubmit={handleSubmit}
          onSaveRecovery={handleSaveRecovery}
          onForgotPin={handleForgotPin}
          onVerifyRecovery={handleVerifyRecovery}
        />
      )}
    </Ctx.Provider>
  );
};

export const usePin = () => useContext(Ctx);
