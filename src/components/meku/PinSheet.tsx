// PinSheet — Circle-style PIN screen.
// Reference: Circle's recovery flow (white canvas, illustrative hero with a
// phone + lock + floating pastel blobs, large display title with a gradient
// accent on the second line, soft body copy, full-width pill primary CTA).
// Built with pure CSS/SVG — no extra assets — so the hero feels alive
// (gentle float + glow) instead of static.
import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ArrowLeft, Delete, Loader2, Lock } from "lucide-react";

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
    const t = setTimeout(() => setShake(false), 420);
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
    if (busy || pin.length >= PIN_LEN) return;
    setError(null);
    const next = pin + digit;
    setPin(next);
    if (next.length === PIN_LEN) submit(next);
  };

  const backspace = () => {
    if (busy) return;
    setError(null);
    setPin((p) => p.slice(0, -1));
  };

  const submit = async (value = pin) => {
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
        triggerError("PINs don't match. Try again.");
        setStep("enter");
        setFirstPin("");
        return;
      }
      await finalize(value);
      return;
    }
    await finalize(value);
  };

  const headline = isSetup
    ? step === "enter"
      ? { a: "Set up your", b: "Wallet PIN" }
      : { a: "Confirm your", b: "New PIN" }
    : { a: "Enter your", b: "Wallet PIN" };

  const subtitle = isSetup
    ? step === "enter"
      ? "Choose a 4–6 digit PIN. You'll use it to authorise every send, swap and bridge from your MEKU wallet."
      : "Re-enter the same PIN once more to make sure it's locked in."
    : "Enter your PIN to authorise this transaction securely.";

  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

  return (
    <Dialog open onOpenChange={(o) => !o && onCancel()}>
      <DialogContent
        className="
          max-w-[420px] gap-0 overflow-hidden border-0 bg-background p-0
          rounded-[28px] shadow-2xl
          h-[100dvh] sm:h-auto sm:max-h-[92vh] sm:my-4
          flex flex-col
        "
      >
        {/* Back */}
        <div className="flex items-center justify-between px-5 pt-5">
          <button
            onClick={onCancel}
            aria-label="Back"
            className="tap flex h-10 w-10 items-center justify-center rounded-full text-foreground/80 hover:bg-muted"
          >
            <ArrowLeft size={22} />
          </button>
          <span className="text-[12px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            {isSetup ? (step === "enter" ? "Step 1 of 2" : "Step 2 of 2") : "Unlock"}
          </span>
          <span className="w-10" />
        </div>

        {/* Hero illustration */}
        <div className="relative mx-auto mt-2 h-[180px] w-[220px]">
          {/* soft circle backdrop */}
          <span
            aria-hidden
            className="absolute left-1/2 top-1/2 h-[170px] w-[170px] -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{ background: "radial-gradient(closest-side, hsl(252 100% 96%), transparent 70%)" }}
          />
          {/* floating pastel blobs */}
          <span
            aria-hidden
            className="absolute left-[8%] top-[18%] h-12 w-12 rounded-[10px] rotate-[18deg] opacity-80 animate-[pin-float_5.5s_ease-in-out_infinite]"
            style={{ background: "linear-gradient(135deg, #e9e6ff, #c7c2ff)" }}
          />
          <span
            aria-hidden
            className="absolute right-[6%] top-[36%] h-14 w-14 rounded-full opacity-90 animate-[pin-float-rev_6.5s_ease-in-out_infinite]"
            style={{ background: "linear-gradient(135deg, #b6d4ff, #6aa6ff)" }}
          />
          <span
            aria-hidden
            className="absolute left-[22%] bottom-[6%] h-8 w-8 rounded-full opacity-90 animate-[pin-float_4.5s_ease-in-out_infinite]"
            style={{ background: "linear-gradient(135deg, #ffd6ee, #c89bff)" }}
          />

          {/* phone */}
          <div className="relative mx-auto mt-3 h-[150px] w-[88px] rounded-[18px] bg-[#2d2a44] shadow-[0_18px_40px_-18px_rgba(45,42,68,0.55)] animate-[pin-bob_4s_ease-in-out_infinite]">
            <span className="absolute left-1/2 top-1.5 h-1 w-8 -translate-x-1/2 rounded-full bg-white/15" />
            {/* lock badge */}
            <div className="absolute left-1/2 top-7 -translate-x-1/2">
              <span
                aria-hidden
                className="absolute inset-0 -m-1 rounded-full blur-md animate-[pin-glow_2.6s_ease-in-out_infinite]"
                style={{ background: "radial-gradient(closest-side, #2ad6b0, transparent 70%)" }}
              />
              <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#34e0b8] to-[#10b48a] text-white shadow-lg">
                <Lock size={18} strokeWidth={2.6} />
              </div>
            </div>
            {/* content lines */}
            <div className="absolute inset-x-3 top-[74px] space-y-2">
              <span className="block h-1.5 w-full rounded-full bg-white/25" />
              <span className="block h-1.5 w-3/4 rounded-full bg-white/20" />
              <span className="block h-1.5 w-5/6 rounded-full bg-white/20" />
              <span className="block h-1.5 w-2/3 rounded-full bg-white/15" />
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="px-7 pt-3 text-center">
          <h2 className="text-[26px] font-semibold leading-[1.15] tracking-tight text-foreground">
            {headline.a}
            <br />
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  "linear-gradient(90deg, #b6a4ff 0%, #8b7aff 35%, #5b9dff 100%)",
              }}
            >
              {headline.b}
            </span>
          </h2>
          <p className="mx-auto mt-3 max-w-[320px] text-[14px] leading-relaxed text-muted-foreground">
            {subtitle}
          </p>
        </div>

        {/* Dots */}
        <div
          className={`mt-5 flex justify-center gap-3 px-6 ${
            shake ? "animate-[pin-shake_0.42s_ease-in-out]" : ""
          }`}
        >
          {Array.from({ length: PIN_LEN }).map((_, i) => {
            const filled = i < pin.length;
            return (
              <span
                key={i}
                className={`h-2.5 w-2.5 rounded-full transition-all duration-200 ${
                  filled
                    ? "scale-125 bg-primary shadow-[0_0_0_5px_hsl(var(--primary)/0.12)]"
                    : "bg-border"
                }`}
              />
            );
          })}
        </div>

        {/* helper */}
        <div className="mt-2 h-5 px-6 text-center text-[12px] font-medium">
          {error ? (
            <span className="text-destructive">{error}</span>
          ) : (
            <span className="text-muted-foreground/70">
              {pin.length}/{PIN_LEN} digits
            </span>
          )}
        </div>

        {/* Keypad */}
        <div className="mt-auto px-6 pt-3">
          <div className="grid grid-cols-3 gap-x-3 gap-y-2">
            {keys.map((k) => (
              <Key key={k} onClick={() => press(k)} disabled={busy}>
                {k}
              </Key>
            ))}
            <span />
            <Key onClick={() => press("0")} disabled={busy}>
              0
            </Key>
            <Key
              onClick={backspace}
              disabled={busy || pin.length === 0}
              ghost
              aria-label="Backspace"
            >
              <Delete size={22} />
            </Key>
          </div>

          {/* Primary CTA */}
          <button
            onClick={() => submit()}
            disabled={busy || pin.length < MIN_LEN}
            className="
              tap mt-4 mb-5 flex h-[54px] w-full items-center justify-center
              rounded-2xl bg-[#1c7ed6] text-[15px] font-semibold text-white
              shadow-[0_10px_24px_-10px_rgba(28,126,214,0.55)]
              transition-all active:scale-[0.985]
              disabled:bg-[#1c7ed6]/45 disabled:shadow-none
            "
          >
            {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : "Continue"}
          </button>
        </div>

        <style>{`
          @keyframes pin-shake {
            0%,100% { transform: translateX(0); }
            20% { transform: translateX(-8px); }
            40% { transform: translateX(8px); }
            60% { transform: translateX(-6px); }
            80% { transform: translateX(6px); }
          }
          @keyframes pin-float {
            0%,100% { transform: translateY(0) rotate(0deg); }
            50%     { transform: translateY(-6px) rotate(4deg); }
          }
          @keyframes pin-float-rev {
            0%,100% { transform: translateY(0) rotate(0deg); }
            50%     { transform: translateY(8px) rotate(-5deg); }
          }
          @keyframes pin-bob {
            0%,100% { transform: translateY(0); }
            50%     { transform: translateY(-4px); }
          }
          @keyframes pin-glow {
            0%,100% { opacity: 0.45; transform: scale(0.95); }
            50%     { opacity: 0.85; transform: scale(1.15); }
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
};

const Key = ({
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
    className={`
      tap relative flex h-[54px] items-center justify-center rounded-2xl
      text-[22px] font-medium text-foreground
      transition-all duration-150 active:scale-[0.94]
      disabled:opacity-40
      ${ghost ? "text-muted-foreground hover:bg-muted" : "bg-muted/60 hover:bg-muted active:bg-primary/10"}
    `}
  >
    {children}
  </button>
);
