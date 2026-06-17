import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Loader2, Delete } from "lucide-react";
import { IconWallet } from "./MekuIcon";

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
    if (next.length === PIN_LEN) handleContinue(next);
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
      ? "Set your wallet PIN"
      : "Confirm your PIN"
    : "Enter wallet PIN";

  const description = isSetup
    ? step === "enter"
      ? "Create a 4–6 digit PIN to protect your MEKU wallet. You'll use it to authorise every transaction."
      : "Re-enter the same PIN to confirm."
    : "Enter your PIN to authorise this transaction.";

  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

  const ctaLabel = busy
    ? null
    : isSetup
      ? step === "enter"
        ? "Continue"
        : "Confirm PIN"
      : "Unlock";

  return (
    <Dialog open onOpenChange={(o) => !o && onCancel()}>
      <DialogContent className="max-w-[380px] rounded-3xl border-border bg-background p-6 text-center">
        <DialogHeader>
          <div className="mx-auto mb-3 inline-flex h-[56px] w-[56px] items-center justify-center rounded-2xl gradient-purple text-primary-foreground shadow-purple">
            <IconWallet size={26} />
          </div>
          <DialogTitle className="text-[18px]">{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {/* Dots */}
        <div
          className={`mt-4 flex justify-center gap-2.5 ${
            shake ? "animate-[wallet-shake_0.4s_ease-in-out]" : ""
          }`}
        >
          {Array.from({ length: PIN_LEN }).map((_, i) => {
            const filled = i < pin.length;
            return (
              <span
                key={i}
                className={`h-[12px] w-[12px] rounded-full transition-all duration-200 ${
                  filled
                    ? "bg-primary scale-110"
                    : "bg-muted ring-1 ring-border"
                }`}
              />
            );
          })}
        </div>

        {/* Error / hint */}
        <div className="mt-3 h-5 text-center text-[12px] font-medium">
          {error ? (
            <span className="text-destructive">{error}</span>
          ) : (
            <span className="text-muted-foreground">
              {pin.length}/{PIN_LEN} digits
            </span>
          )}
        </div>

        {/* Keypad */}
        <div className="mt-2 grid grid-cols-3 gap-2.5">
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
            <Delete size={20} />
          </KeyButton>
        </div>

        {/* Primary pill — same style as the original UCW modal */}
        <button
          onClick={() => handleContinue()}
          disabled={busy || pin.length < MIN_LEN}
          className="tap mt-4 flex h-[48px] w-full items-center justify-center rounded-full bg-primary text-[14px] font-bold text-primary-foreground shadow-purple disabled:opacity-50"
        >
          {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : ctaLabel}
        </button>

        <button
          onClick={onCancel}
          className="tap mt-2 text-[12px] text-muted-foreground"
        >
          Cancel
        </button>

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
    className={`tap flex h-[52px] items-center justify-center rounded-2xl text-[22px] font-semibold transition-all active:scale-[0.94] disabled:opacity-40 ${
      ghost
        ? "text-muted-foreground hover:bg-surface"
        : "bg-surface text-foreground hover:bg-surface-hover"
    }`}
  >
    {children}
  </button>
);
