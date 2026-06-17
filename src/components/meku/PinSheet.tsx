// PinSheet — full-screen PIN page styled to match the AvatarEditor aesthetic
// from 15 June: 56px header with back + centered title + right pill action,
// large centered focal ring (instead of crop ring) with dimmed surroundings,
// uppercase tracking-wider section labels, primary-accented controls, and a
// small muted footer hint.
import { useEffect, useState } from "react";
import { IconWallet, IconBack, IconCheck } from "./MekuIcon";
import { Loader2, Delete } from "lucide-react";

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

  const title = isSetup ? "Set wallet PIN" : "Enter wallet PIN";
  const sectionLabel = isSetup
    ? step === "enter"
      ? "Create PIN"
      : "Confirm PIN"
    : "Unlock";

  const helperText = isSetup
    ? step === "enter"
      ? "Choose a 4–6 digit PIN. You'll use it to authorise every send, swap and bridge."
      : "Re-enter the same PIN to confirm."
    : "Enter your PIN to authorise this transaction.";

  const ctaReady = pin.length >= MIN_LEN && !busy;
  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      {/* Header — matches AvatarEditor */}
      <header className="flex h-[56px] items-center justify-between px-3">
        <button
          onClick={onCancel}
          className="tap inline-flex h-10 w-10 items-center justify-center rounded-full"
          aria-label="Back"
        >
          <IconBack size={22} />
        </button>
        <h2 className="text-[15px] font-bold">{title}</h2>
        <button
          onClick={() => handleContinue()}
          disabled={!ctaReady}
          className="tap inline-flex h-9 items-center gap-1 rounded-full bg-primary px-4 text-[13px] font-bold text-primary-foreground disabled:opacity-40"
        >
          {busy ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <IconCheck size={14} />
              {isSetup && step === "enter" ? "Next" : "Done"}
            </>
          )}
        </button>
      </header>

      {/* Body */}
      <div className="flex flex-1 flex-col items-center justify-center px-4">
        {/* Focal ring — same dimmed-surroundings trick as AvatarEditor crop ring */}
        <div className="relative" style={{ width: 220, height: 220 }}>
          <div
            className="absolute inset-0 flex items-center justify-center rounded-full"
            style={{
              boxShadow: `0 0 0 9999px hsl(0 0% 0% / 0.55)`,
              border: "2px solid hsl(var(--primary))",
            }}
          >
            <div className="inline-flex h-[64px] w-[64px] items-center justify-center rounded-2xl gradient-purple text-primary-foreground shadow-purple">
              <IconWallet size={30} />
            </div>
          </div>
        </div>

        {/* Dots */}
        <div className="mt-8 w-full max-w-[320px]">
          <span className="mb-2 block text-center text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            {sectionLabel}
          </span>
          <div
            className={`flex justify-center gap-2.5 ${
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
          <div className="mt-2 h-5 text-center text-[12px] font-medium">
            {error ? (
              <span className="text-destructive">{error}</span>
            ) : (
              <span className="text-muted-foreground">
                {pin.length}/{PIN_LEN} digits
              </span>
            )}
          </div>
        </div>

        {/* Keypad */}
        <div className="mt-2 grid w-full max-w-[320px] grid-cols-3 gap-2.5">
          {keys.map((k) => (
            <KeyButton key={k} onClick={() => press(k)} disabled={busy}>
              {k}
            </KeyButton>
          ))}
          {/* Backspace, 0, action — mirrors the AvatarEditor small round bordered button */}
          <button
            onClick={backspace}
            disabled={busy || pin.length === 0}
            aria-label="Backspace"
            className="tap mx-auto mt-1 inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-foreground disabled:opacity-40"
          >
            <Delete size={16} />
          </button>
          <KeyButton onClick={() => press("0")} disabled={busy}>
            0
          </KeyButton>
          <div />
        </div>

        <p className="mt-4 text-center text-[12px] text-muted-foreground">
          {helperText}
        </p>
      </div>

      <style>{`
        @keyframes wallet-shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-6px); }
          80% { transform: translateX(6px); }
        }
      `}</style>
    </div>
  );
};

const KeyButton = ({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="tap flex h-[52px] items-center justify-center rounded-2xl bg-surface text-[22px] font-semibold text-foreground transition-all hover:bg-surface-hover active:scale-[0.94] disabled:opacity-40"
  >
    {children}
  </button>
);
