import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Loader2, Delete, ShieldCheck } from "lucide-react";
import { IconWallet } from "./MekuIcon";
import { Mascot } from "./Mascot";

interface Props {
  mode: "setup" | "confirm";
  onCancel: () => void;
  onSubmit: (pin: string) => Promise<string | null>;
}

const PIN_LEN = 6;
const MIN_LEN = 4;

export const PinSheet = ({ mode, onCancel, onSubmit }: Props) => {
  const isSetup = mode === "setup";
  const [step, setStep] = useState<"enter" | "confirm">("enter");
  const [pin, setPin] = useState("");
  const [firstPin, setFirstPin] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    if (!shake) return;
    const t = setTimeout(() => setShake(false), 400);
    return () => clearTimeout(t);
  }, [shake]);

  const triggerError = (msg: string) => {
    setError(msg);
    setShake(true);
    setPin("");
  };

  const finalize = async (value: string) => {
    setBusy(true);
    const err = await onSubmit(value);
    setBusy(false);
    if (err) triggerError(err);
  };

  const press = (digit: string) => {
    if (busy) return;
    setError(null);
    if (pin.length >= PIN_LEN) return;
    const next = pin + digit;
    setPin(next);

    if (next.length >= MIN_LEN) {
      // auto-advance when reaching max, or wait for explicit confirm tap
      if (next.length === PIN_LEN) {
        handleContinue(next);
      }
    }
  };

  const backspace = () => {
    if (busy) return;
    setError(null);
    setPin((p) => p.slice(0, -1));
  };

  const handleContinue = async (value = pin) => {
    if (value.length < MIN_LEN) {
      triggerError(`Use at least ${MIN_LEN} digits`);
      return;
    }
    if (isSetup) {
      if (step === "enter") {
        setFirstPin(value);
        setPin("");
        setStep("confirm");
        return;
      }
      if (value !== firstPin) {
        triggerError("PINs don't match");
        setStep("enter");
        setFirstPin("");
        return;
      }
      await finalize(value);
      return;
    }
    await finalize(value);
  };

  const title = isSetup
    ? step === "enter"
      ? "Create wallet PIN"
      : "Confirm your PIN"
    : "Enter wallet PIN";

  const subtitle = isSetup
    ? step === "enter"
      ? "Choose a 4–6 digit PIN to secure every send, swap and bridge."
      : "Re-enter the same PIN to confirm."
    : "Enter your PIN to authorise this transaction.";

  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

  const mascotPose = isSetup
    ? step === "enter"
      ? "waving"
      : "happy"
    : "thinking";

  return (
    <Dialog open onOpenChange={(o) => !o && onCancel()}>
      <DialogContent
        className="max-w-[420px] gap-0 rounded-[32px] border-border/60 bg-background p-0 overflow-hidden shadow-purple"
      >
        {/* Gradient hero */}
        <div className="relative overflow-hidden px-6 pt-7 pb-6 text-center gradient-card text-white">
          {/* Decorative blobs */}
          <div className="pointer-events-none absolute -top-16 -right-12 h-44 w-44 rounded-full bg-white/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-10 h-44 w-44 rounded-full bg-black/20 blur-3xl" />

          {/* Mascot floats behind the badge */}
          <div className="pointer-events-none absolute right-3 top-2 opacity-90">
            <Mascot pose={mascotPose} size={76} />
          </div>

          <div className="relative mx-auto mb-3 inline-flex h-[60px] w-[60px] items-center justify-center rounded-[18px] bg-white/15 backdrop-blur-md ring-1 ring-white/30 shadow-purple">
            <IconWallet size={28} className="text-white" />
            <span className="absolute -bottom-1 -right-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-white text-primary shadow">
              <ShieldCheck size={12} strokeWidth={2.6} />
            </span>
          </div>
          <h2 className="relative text-[20px] font-bold tracking-tight">{title}</h2>
          <p className="relative mx-auto mt-1 max-w-[280px] text-[12.5px] leading-snug text-white/85">
            {subtitle}
          </p>

          {/* Dots inside the hero */}
          <div
            className={`relative mt-5 flex justify-center gap-2.5 ${
              shake ? "animate-[wallet-shake_0.4s_ease-in-out]" : ""
            }`}
          >
            {Array.from({ length: PIN_LEN }).map((_, i) => {
              const filled = i < pin.length;
              return (
                <span
                  key={i}
                  className={`h-[14px] w-[14px] rounded-full ring-1 transition-all duration-200 ${
                    filled
                      ? "bg-white ring-white scale-110 shadow-[0_0_14px_rgba(255,255,255,0.55)]"
                      : "bg-white/15 ring-white/40"
                  }`}
                />
              );
            })}
          </div>

          {/* Step indicator for setup */}
          {isSetup && (
            <div className="relative mt-4 flex items-center justify-center gap-1.5">
              <span className={`h-1 w-6 rounded-full transition ${step === "enter" ? "bg-white" : "bg-white/40"}`} />
              <span className={`h-1 w-6 rounded-full transition ${step === "confirm" ? "bg-white" : "bg-white/40"}`} />
            </div>
          )}
        </div>

        {/* Error / hint */}
        <div className="mt-3 h-5 px-6 text-center text-[12px] font-medium">
          {error ? (
            <span className="text-destructive">{error}</span>
          ) : pin.length >= MIN_LEN && pin.length < PIN_LEN && !busy ? (
            <button
              onClick={() => handleContinue()}
              className="tap text-primary font-semibold"
            >
              Continue →
            </button>
          ) : (
            <span className="text-muted-foreground/70">
              {pin.length}/{PIN_LEN} digits
            </span>
          )}
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-2.5 px-5 pb-5 pt-2">
          {keys.map((k) => (
            <KeyButton key={k} onClick={() => press(k)} disabled={busy}>
              {k}
            </KeyButton>
          ))}
          <div />
          <KeyButton onClick={() => press("0")} disabled={busy}>
            0
          </KeyButton>
          <KeyButton
            onClick={backspace}
            disabled={busy || pin.length === 0}
            ghost
            aria-label="Backspace"
          >
            <Delete size={22} />
          </KeyButton>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border/60 bg-surface/60 px-5 py-3">
          <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <ShieldCheck size={13} className="text-primary" />
            Stored locally · never sent to MEKU
          </p>
          <button
            onClick={onCancel}
            className="tap text-[12px] font-semibold text-muted-foreground hover:text-foreground"
          >
            Cancel
          </button>
        </div>

        {busy && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/70 backdrop-blur-sm">
            <Loader2 className="h-7 w-7 animate-spin text-primary" />
          </div>
        )}

        <style>{`
          @keyframes wallet-shake {
            0%, 100% { transform: translateX(0); }
            20% { transform: translateX(-8px); }
            40% { transform: translateX(8px); }
            60% { transform: translateX(-6px); }
            80% { transform: translateX(6px); }
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
};

const KeyButton = ({
  children,
  onClick,
  disabled,
  ghost,
  ...rest
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  ghost?: boolean;
  [k: string]: any;
}) => (
  <button
    {...rest}
    onClick={onClick}
    disabled={disabled}
    className={`tap relative flex h-[58px] items-center justify-center rounded-2xl text-[22px] font-semibold transition-all active:scale-95 disabled:opacity-40 ${
      ghost
        ? "text-muted-foreground hover:bg-surface"
        : "bg-surface text-foreground hover:bg-surface-hover active:bg-primary/10"
    }`}
  >
    {children}
  </button>
);
