// PinSheet — Circle-style PIN screen with built-in recovery flow.
// Modes:
//   "setup"   → enter PIN → confirm PIN → set 3 recovery questions
//   "confirm" → enter PIN to authorise; exposes "Forgot PIN?" link
//   "recover" → answer the 3 stored questions; on success the caller wipes
//               the old PIN and re-opens setup
import { useCallback, useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ArrowLeft, Check, Delete, KeyRound, Loader2, Lock, ShieldCheck, Sparkles } from "lucide-react";
import { RECOVERY_QUESTIONS } from "@/lib/pin";

export type PinMode = "setup" | "confirm" | "recover";

interface Props {
  mode: PinMode;
  /** Pre-loaded questions for "recover" mode. */
  recoveryQuestions?: [string, string, string];
  onCancel: () => void;
  /** Called once the PIN is captured (and confirmed if setup). Return error string or null. */
  onSubmit: (pin: string) => Promise<string | null>;
  /** Called after setup PIN is saved, with the 3 chosen questions + answers. */
  onSaveRecovery?: (qs: [string, string, string], answers: [string, string, string]) => Promise<string | null>;
  /** Switch confirm-mode to recovery. Caller should re-open the sheet in "recover" mode. */
  onForgotPin?: () => void;
  /** Verify 3 answers in recover mode. Return error string or null. */
  onVerifyRecovery?: (answers: [string, string, string]) => Promise<string | null>;
}

const PIN_LEN = 6;
const MIN_LEN = 4;

type SetupStep = "enter" | "confirm" | "recovery" | "done";

export const PinSheet = ({
  mode,
  recoveryQuestions,
  onCancel,
  onSubmit,
  onSaveRecovery,
  onForgotPin,
  onVerifyRecovery,
}: Props) => {
  const isSetup = mode === "setup";
  const isRecover = mode === "recover";
  const [step, setStep] = useState<SetupStep>("enter");
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

  // Recover mode renders its own component
  if (isRecover) {
    return (
      <RecoveryDialog
        title="Recover access"
        subtitle="Answer your security questions to reset your wallet PIN."
        questions={recoveryQuestions ?? ["", "", ""]}
        ctaLabel="Verify answers"
        onCancel={onCancel}
        onSubmit={async (_qs, answers) => {
          if (!onVerifyRecovery) return "Recovery not available";
          return onVerifyRecovery(answers);
        }}
      />
    );
  }

  // Setup recovery step renders its own component
  if (isSetup && step === "recovery") {
    return (
      <RecoveryDialog
        title="Secure your wallet"
        subtitle="Pick 3 questions only you can answer. We'll use them if you ever forget your PIN."
        editable
        ctaLabel="Finish setup"
        onCancel={onCancel}
        onSubmit={async (qs, answers) => {
          if (!onSaveRecovery) {
            setStep("done");
            return null;
          }
          const err = await onSaveRecovery(qs, answers);
          if (!err) setStep("done");
          return err;
        }}
      />
    );
  }

  if (isSetup && step === "done") {
    return <PinSuccessDialog onDone={onCancel} />;
  }

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
      if (step === "confirm") {
        if (value !== firstPin) {
          triggerError("PINs don't match. Try again.");
          setStep("enter");
          setFirstPin("");
          return;
        }
        setBusy(true);
        const err = await onSubmit(value);
        setBusy(false);
        if (err) {
          triggerError(err);
          return;
        }
        // Move into recovery setup
        setStep("recovery");
        return;
      }
    }
    setBusy(true);
    const err = await onSubmit(value);
    setBusy(false);
    if (err) triggerError(err);
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
        <div className="flex items-center justify-between px-4 pt-3">
          <button
            onClick={onCancel}
            aria-label="Back"
            className="tap flex h-9 w-9 items-center justify-center rounded-full text-foreground/80 hover:bg-muted"
          >
            <ArrowLeft size={20} />
          </button>
          <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            {isSetup ? (step === "enter" ? "Step 1 of 3" : "Step 2 of 3") : "Unlock"}
          </span>
          <span className="w-9" />
        </div>

        {/* Hero illustration — compact so the keypad always fits */}
        <div className="relative mx-auto mt-1 h-[124px] w-[180px] shrink-0">
          <span
            aria-hidden
            className="absolute left-1/2 top-1/2 h-[120px] w-[120px] -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{ background: "radial-gradient(closest-side, hsl(252 100% 96%), transparent 70%)" }}
          />
          <span
            aria-hidden
            className="absolute left-[6%] top-[16%] h-9 w-9 rounded-[8px] rotate-[18deg] opacity-80 animate-[pin-float_5.5s_ease-in-out_infinite]"
            style={{ background: "linear-gradient(135deg, #e9e6ff, #c7c2ff)" }}
          />
          <span
            aria-hidden
            className="absolute right-[4%] top-[34%] h-10 w-10 rounded-full opacity-90 animate-[pin-float-rev_6.5s_ease-in-out_infinite]"
            style={{ background: "linear-gradient(135deg, #b6d4ff, #6aa6ff)" }}
          />
          <span
            aria-hidden
            className="absolute left-[20%] bottom-[4%] h-6 w-6 rounded-full opacity-90 animate-[pin-float_4.5s_ease-in-out_infinite]"
            style={{ background: "linear-gradient(135deg, #ffd6ee, #c89bff)" }}
          />

          {/* phone */}
          <div className="relative mx-auto mt-2 h-[104px] w-[64px] rounded-[14px] bg-[#2d2a44] shadow-[0_14px_30px_-14px_rgba(45,42,68,0.55)] animate-[pin-bob_4s_ease-in-out_infinite]">
            <span className="absolute left-1/2 top-1 h-0.5 w-6 -translate-x-1/2 rounded-full bg-white/15" />
            <div className="absolute left-1/2 top-4 -translate-x-1/2">
              <span
                aria-hidden
                className="absolute inset-0 -m-1 rounded-full blur-md animate-[pin-glow_2.6s_ease-in-out_infinite]"
                style={{ background: "radial-gradient(closest-side, #2ad6b0, transparent 70%)" }}
              />
              <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#34e0b8] to-[#10b48a] text-white shadow-md">
                <Lock size={14} strokeWidth={2.6} />
              </div>
            </div>
            <div className="absolute inset-x-2.5 top-[52px] space-y-1.5">
              <span className="block h-1 w-full rounded-full bg-white/25" />
              <span className="block h-1 w-3/4 rounded-full bg-white/20" />
              <span className="block h-1 w-5/6 rounded-full bg-white/20" />
              <span className="block h-1 w-2/3 rounded-full bg-white/15" />
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="shrink-0 px-6 pt-1 text-center">
          <h2 className="text-[22px] font-semibold leading-[1.15] tracking-tight text-foreground">
            {headline.a}{" "}
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
          <p className="mx-auto mt-1.5 line-clamp-2 max-w-[300px] text-[13px] leading-snug text-muted-foreground">
            {subtitle}
          </p>
        </div>

        {/* Dots */}
        <div
          className={`mt-3 flex shrink-0 justify-center gap-2.5 px-6 ${
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
        <div className="mt-1.5 h-4 shrink-0 px-6 text-center text-[11px] font-medium">
          {error ? (
            <span className="text-destructive">{error}</span>
          ) : (
            <span className="text-muted-foreground/70">
              {pin.length}/{PIN_LEN} digits
            </span>
          )}
        </div>

        {/* Keypad */}
        <div className="mt-auto px-5 pb-[max(12px,env(safe-area-inset-bottom))] pt-2">
          <div className="grid grid-cols-3 gap-x-2.5 gap-y-1.5">
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
              <Delete size={20} />
            </Key>
          </div>

          {/* Primary CTA */}
          <button
            onClick={() => submit()}
            disabled={busy || pin.length < MIN_LEN}
            className="
              tap mt-3 flex h-[48px] w-full items-center justify-center
              rounded-2xl bg-[#1c7ed6] text-[15px] font-semibold text-white
              shadow-[0_10px_24px_-10px_rgba(28,126,214,0.55)]
              transition-all active:scale-[0.985]
              disabled:bg-[#1c7ed6]/45 disabled:shadow-none
            "
          >
            {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : "Continue"}
          </button>

          {mode === "confirm" && onForgotPin && (
            <button
              onClick={onForgotPin}
              className="tap mt-2 flex w-full items-center justify-center gap-1.5 text-[12.5px] font-semibold text-muted-foreground hover:text-foreground"
            >
              <KeyRound size={13} />
              Forgot your PIN?
            </button>
          )}
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
      tap relative flex h-[46px] items-center justify-center rounded-xl
      text-[22px] font-medium text-foreground
      transition-all duration-150 active:scale-[0.94]
      disabled:opacity-40
      ${ghost ? "text-muted-foreground hover:bg-muted" : "bg-muted/60 hover:bg-muted active:bg-primary/10"}
    `}
  >
    {children}
  </button>
);

// ------------------------------------------------------------------
// RecoveryDialog — used by both setup-recovery step and recover mode.
// Same creative pastel hero language as the PIN sheet, with a shield
// instead of a lock to signal "safety net".
// ------------------------------------------------------------------

interface RecoveryDialogProps {
  title: string;
  subtitle: string;
  /** Allow choosing/editing questions (setup mode). */
  editable?: boolean;
  /** Pre-filled questions for verify mode. */
  questions?: [string, string, string];
  ctaLabel: string;
  onCancel: () => void;
  onSubmit: (qs: [string, string, string], answers: [string, string, string]) => Promise<string | null>;
}

const RecoveryDialog = ({
  title, subtitle, editable, questions, ctaLabel, onCancel, onSubmit,
}: RecoveryDialogProps) => {
  const [qs, setQs] = useState<[string, string, string]>(() => {
    if (questions && questions[0]) return questions;
    return [RECOVERY_QUESTIONS[0], RECOVERY_QUESTIONS[1], RECOVERY_QUESTIONS[2]];
  });
  const [answers, setAnswers] = useState<[string, string, string]>(["", "", ""]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setAnswer = useCallback((i: number, v: string) => {
    setAnswers((a) => {
      if (a[i] === v) return a;
      const next = [...a] as [string, string, string];
      next[i] = v;
      return next;
    });
  }, []);

  const setQuestion = useCallback((i: number, v: string) => {
    if (!editable) return;
    setQs((current) => {
      if (current[i] === v) return current;
      // prevent duplicates across the 3 slots
      if (current.includes(v)) return current;
      const next = [...current] as [string, string, string];
      next[i] = v;
      return next;
    });
  }, [editable]);

  const canSubmit = answers.every((a) => a.trim().length >= 2);

  const submit = async () => {
    if (!canSubmit) {
      setError("Answer all 3 questions.");
      return;
    }
    setBusy(true);
    const err = await onSubmit(qs, answers);
    setBusy(false);
    if (err) setError(err);
  };

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
        <div className="flex items-center justify-between px-4 pt-3 shrink-0">
          <button
            onClick={onCancel}
            aria-label="Back"
            className="tap flex h-9 w-9 items-center justify-center rounded-full text-foreground/80 hover:bg-muted"
          >
            <ArrowLeft size={20} />
          </button>
          <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            {editable ? "Step 3 of 3" : "Recovery"}
          </span>
          <span className="w-9" />
        </div>

        {/* Hero — pastel blobs + shield */}
        <div className="relative mx-auto mt-1 h-[112px] w-[180px] shrink-0">
          <span
            aria-hidden
            className="absolute left-1/2 top-1/2 h-[110px] w-[110px] -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{ background: "radial-gradient(closest-side, hsl(168 80% 92%), transparent 70%)" }}
          />
          <span
            aria-hidden
            className="absolute left-[8%] top-[10%] h-8 w-8 rounded-[8px] rotate-[14deg] opacity-80 animate-[pin-float_5.5s_ease-in-out_infinite]"
            style={{ background: "linear-gradient(135deg, #d8f5e6, #8fd9b6)" }}
          />
          <span
            aria-hidden
            className="absolute right-[6%] top-[34%] h-9 w-9 rounded-full opacity-90 animate-[pin-float-rev_6.5s_ease-in-out_infinite]"
            style={{ background: "linear-gradient(135deg, #ffe7b3, #ffb86b)" }}
          />
          <span
            aria-hidden
            className="absolute left-[22%] bottom-[2%] h-5 w-5 rounded-full opacity-90 animate-[pin-float_4.5s_ease-in-out_infinite]"
            style={{ background: "linear-gradient(135deg, #ffd6ee, #c89bff)" }}
          />
          <div className="relative mx-auto mt-3 flex h-[90px] w-[72px] items-center justify-center">
            <span
              aria-hidden
              className="absolute inset-0 rounded-[20px] blur-md opacity-70 animate-[pin-glow_3s_ease-in-out_infinite]"
              style={{ background: "radial-gradient(closest-side, #34e0b8, transparent 70%)" }}
            />
            <div className="relative flex h-[72px] w-[64px] items-center justify-center rounded-[18px] bg-gradient-to-br from-[#34e0b8] to-[#10b48a] text-white shadow-[0_14px_30px_-14px_rgba(16,180,138,0.6)] animate-[pin-bob_4s_ease-in-out_infinite]">
              <ShieldCheck size={30} strokeWidth={2.2} />
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="shrink-0 px-6 pt-1 text-center">
          <h2 className="text-[22px] font-semibold leading-[1.15] tracking-tight text-foreground">
            {title.split(" ").slice(0, -1).join(" ")}{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  "linear-gradient(90deg, #6ee7c4 0%, #5b9dff 60%, #8b7aff 100%)",
              }}
            >
              {title.split(" ").slice(-1)[0]}
            </span>
          </h2>
          <p className="mx-auto mt-1.5 line-clamp-2 max-w-[300px] text-[13px] leading-snug text-muted-foreground">
            {subtitle}
          </p>
        </div>

        {/* Questions list — scrollable so keyboard fits */}
        <div className="mt-3 flex-1 overflow-y-auto px-5">
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="rounded-2xl border border-border bg-muted/30 p-3"
              >
                {editable ? (
                  <select
                    value={qs[i]}
                    onChange={(e) => setQuestion(i, e.target.value)}
                    className="w-full bg-transparent text-[12.5px] font-semibold text-foreground/80 outline-none"
                  >
                    {RECOVERY_QUESTIONS.map((q) => (
                      <option key={q} value={q}>{q}</option>
                    ))}
                  </select>
                ) : (
                  <p className="text-[12.5px] font-semibold text-foreground/80">
                    {qs[i]}
                  </p>
                )}
                <input
                  value={answers[i]}
                  onChange={(e) => { setError(null); setAnswer(i, e.target.value); }}
                  placeholder="Your answer"
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck={false}
                  className="mt-1.5 w-full bg-transparent text-[15px] font-medium text-foreground outline-none placeholder:text-muted-foreground/50"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="shrink-0 px-5 pb-[max(12px,env(safe-area-inset-bottom))] pt-2">
          <div className="h-4 text-center text-[11px] font-medium">
            {error ? (
              <span className="text-destructive">{error}</span>
            ) : (
              <span className="text-muted-foreground/70">
                Answers are stored as one-way hashes.
              </span>
            )}
          </div>
          <button
            onClick={submit}
            disabled={busy || !canSubmit}
            className="
              tap mt-2 flex h-[48px] w-full items-center justify-center
              rounded-2xl bg-[#10b48a] text-[15px] font-semibold text-white
              shadow-[0_10px_24px_-10px_rgba(16,180,138,0.55)]
              transition-all active:scale-[0.985]
              disabled:bg-[#10b48a]/45 disabled:shadow-none
            "
          >
            {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : ctaLabel}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ------------------------------------------------------------------
// PinSuccessDialog — celebratory confirmation after setup completes.
// Matches the pastel/blob language used by PinSheet & RecoveryDialog.
// ------------------------------------------------------------------
const PinSuccessDialog = ({ onDone }: { onDone: () => void }) => {
  useEffect(() => {
    const t = setTimeout(onDone, 2600);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <Dialog open onOpenChange={(o) => !o && onDone()}>
      <DialogContent
        className="
          max-w-[420px] gap-0 overflow-hidden border-0 bg-background p-0
          rounded-[28px] shadow-2xl
          h-[100dvh] sm:h-auto sm:max-h-[92vh] sm:my-4
          flex flex-col items-center justify-center text-center
        "
      >
        <div className="relative mx-auto h-[180px] w-[220px] shrink-0">
          <span
            aria-hidden
            className="absolute left-1/2 top-1/2 h-[170px] w-[170px] -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{ background: "radial-gradient(closest-side, hsl(160 85% 90%), transparent 70%)" }}
          />
          <span
            aria-hidden
            className="absolute left-[6%] top-[12%] h-9 w-9 rounded-[10px] rotate-[18deg] opacity-80 animate-[pin-float_5.5s_ease-in-out_infinite]"
            style={{ background: "linear-gradient(135deg, #d8f5e6, #8fd9b6)" }}
          />
          <span
            aria-hidden
            className="absolute right-[8%] top-[18%] h-10 w-10 rounded-full opacity-90 animate-[pin-float-rev_6.5s_ease-in-out_infinite]"
            style={{ background: "linear-gradient(135deg, #b6d4ff, #6aa6ff)" }}
          />
          <span
            aria-hidden
            className="absolute left-[18%] bottom-[6%] h-6 w-6 rounded-full opacity-90 animate-[pin-float_4.5s_ease-in-out_infinite]"
            style={{ background: "linear-gradient(135deg, #ffd6ee, #c89bff)" }}
          />
          <Sparkles
            aria-hidden
            size={18}
            className="absolute right-[14%] bottom-[18%] text-[#10b48a] animate-[pin-float_4s_ease-in-out_infinite]"
          />
          <Sparkles
            aria-hidden
            size={14}
            className="absolute left-[10%] top-[38%] text-[#5b9dff] animate-[pin-float-rev_5s_ease-in-out_infinite]"
          />

          <div className="relative mx-auto mt-7 flex h-[110px] w-[110px] items-center justify-center">
            <span
              aria-hidden
              className="absolute inset-0 rounded-full blur-md opacity-70 animate-[pin-glow_2.6s_ease-in-out_infinite]"
              style={{ background: "radial-gradient(closest-side, #34e0b8, transparent 70%)" }}
            />
            <div className="relative flex h-[96px] w-[96px] items-center justify-center rounded-full bg-gradient-to-br from-[#34e0b8] to-[#10b48a] text-white shadow-[0_18px_36px_-14px_rgba(16,180,138,0.6)] animate-[pin-bob_4s_ease-in-out_infinite]">
              <Check size={48} strokeWidth={3} />
            </div>
          </div>
        </div>

        <div className="px-8 pb-8 pt-2">
          <h2 className="text-[24px] font-semibold leading-[1.15] tracking-tight text-foreground">
            You're all{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  "linear-gradient(90deg, #6ee7c4 0%, #5b9dff 60%, #8b7aff 100%)",
              }}
            >
              set!
            </span>
          </h2>
          <p className="mx-auto mt-2 max-w-[280px] text-[13.5px] leading-snug text-muted-foreground">
            Your wallet PIN and recovery questions are saved. You can now send, swap and bridge securely.
          </p>

          <button
            onClick={onDone}
            className="
              tap mt-6 inline-flex h-[46px] items-center justify-center gap-2
              rounded-2xl bg-[#10b48a] px-6 text-[14.5px] font-semibold text-white
              shadow-[0_10px_24px_-10px_rgba(16,180,138,0.55)]
              transition-all active:scale-[0.985]
            "
          >
            <Sparkles size={16} /> Let's go
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
