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

  return (
    <Dialog open onOpenChange={(o) => !o && onCancel()}>
      <DialogContent
        className="max-w-[420px] gap-0 rounded-[28px] border-border bg-background p-0 overflow-hidden"
      >
        {/* Header */}
        <div className="relative px-6 pt-6 pb-2 text-center">
          <div className="mx-auto mb-4 inline-flex h-[64px] w-[64px] items-center justify-center rounded-[20px] gradient-purple text-primary-foreground shadow-purple">
            <IconWallet size={30} />
          </div>
          <h2 className="text-[19px] font-bold tracking-tight">{title}</h2>
          <p className="mx-auto mt-1.5 max-w-[280px] text-[13px] leading-snug text-muted-foreground">
            {subtitle}
          </p>
        </div>

        {/* Dots */}
        <div
          className={`mt-4 flex justify-center gap-3 px-6 ${
            shake ? "animate-[wallet-shake_0.4s_ease-in-out]" : ""
          }`}
        >
          {Array.from({ length: PIN_LEN }).map((_, i) => {
            const filled = i < pin.length;
            return (
              <span
                key={i}
                className={`h-3 w-3 rounded-full transition-all ${
                  filled
                    ? "bg-primary scale-110 shadow-purple"
                    : "bg-border"
                }`}
              />
            );
          })}
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
            <span className="text-muted-foreground/60">
              {pin.length}/{PIN_LEN}
            </span>
          )}
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-2 px-6 pb-6 pt-2">
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
