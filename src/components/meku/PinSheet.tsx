import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { IconWallet } from "./MekuIcon";

interface Props {
  mode: "setup" | "confirm";
  onCancel: () => void;
  onSubmit: (pin: string) => Promise<string | null>;
}

export const PinSheet = ({ mode, onCancel, onSubmit }: Props) => {
  const [pin, setPin] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSetup = mode === "setup";

  const submit = async () => {
    setError(null);
    if (pin.length < 4 || pin.length > 6) { setError("Use 4–6 digits"); return; }
    if (isSetup && pin !== confirm) { setError("PINs don't match"); return; }
    setBusy(true);
    const err = await onSubmit(pin);
    setBusy(false);
    if (err) setError(err);
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onCancel()}>
      <DialogContent className="max-w-[380px] rounded-3xl border-border bg-background p-6 text-center">
        <DialogHeader>
          <div className="mx-auto mb-3 inline-flex h-[56px] w-[56px] items-center justify-center rounded-2xl gradient-purple text-primary-foreground shadow-purple">
            <IconWallet size={26} />
          </div>
          <DialogTitle className="text-[18px]">
            {isSetup ? "Set your wallet PIN" : "Enter wallet PIN"}
          </DialogTitle>
          <DialogDescription>
            {isSetup
              ? "Pick a 4–6 digit PIN. You'll use this every time you send, swap, or bridge."
              : "Confirm this transaction with your PIN."}
          </DialogDescription>
        </DialogHeader>

        <input
          autoFocus
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
          inputMode="numeric"
          type="password"
          placeholder="••••"
          className="mt-4 h-12 w-full rounded-2xl border border-border bg-surface px-4 text-center text-[18px] font-semibold tracking-[0.4em] outline-none focus:border-primary"
        />
        {isSetup && (
          <input
            value={confirm}
            onChange={(e) => setConfirm(e.target.value.replace(/\D/g, "").slice(0, 6))}
            inputMode="numeric"
            type="password"
            placeholder="Confirm PIN"
            className="mt-3 h-12 w-full rounded-2xl border border-border bg-surface px-4 text-center text-[18px] font-semibold tracking-[0.4em] outline-none focus:border-primary"
          />
        )}
        {error && <p className="mt-2 text-[12px] font-medium text-destructive">{error}</p>}

        <button
          onClick={submit}
          disabled={busy || pin.length < 4}
          className="tap mt-5 flex h-[48px] w-full items-center justify-center rounded-full bg-primary text-[14px] font-bold text-primary-foreground shadow-purple disabled:opacity-50"
        >
          {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : isSetup ? "Save PIN" : "Confirm"}
        </button>
        <button onClick={onCancel} className="tap mt-2 text-[12px] text-muted-foreground">
          Cancel
        </button>
      </DialogContent>
    </Dialog>
  );
};
