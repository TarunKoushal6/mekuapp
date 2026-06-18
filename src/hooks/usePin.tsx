import { createContext, useCallback, useContext, useEffect, useRef, useState, ReactNode } from "react";
import { useAuth } from "./useAuth";
import {
  getPinHash, hashPin, isValidPin, setPin as savePin,
  saveRecovery, verifyRecovery, getRecovery, clearPin,
} from "@/lib/pin";
import { PinSheet, PinMode } from "@/components/meku/PinSheet";

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

type Mode = {
  kind: PinMode;
  resolve: (ok: boolean) => void;
  recoveryQuestions?: [string, string, string];
} | null;

export const PinProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [hash, setHash] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<Mode>(null);
  const resolverRef = useRef<((ok: boolean) => void) | null>(null);
  const autoPromptedRef = useRef<string | null>(null);

  const refresh = useCallback(async () => {
    if (!user) { setHash(null); setLoading(false); return; }
    setLoading(true);
    try { setHash(await getPinHash(user.id)); } finally { setLoading(false); }
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  // Auto-prompt PIN setup right after signup / first sign-in.
  useEffect(() => {
    if (!user || loading || hash || mode) return;
    if (autoPromptedRef.current === user.id) return;
    autoPromptedRef.current = user.id;
    setMode({ kind: "setup", resolve: () => {} });
  }, [user, loading, hash, mode]);

  useEffect(() => {
    if (!user) autoPromptedRef.current = null;
  }, [user]);

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
      handleClose(true);
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
      // Do NOT close here — let PinSheet transition to the success step.
      // PinSuccessDialog's onDone will fire `onComplete` which closes & resolves true.
      return null;
    } catch (e: any) {
      return e?.message ?? "Could not save recovery questions";
    }
  };

  const handleComplete = () => {
    resolverRef.current?.(true);
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
