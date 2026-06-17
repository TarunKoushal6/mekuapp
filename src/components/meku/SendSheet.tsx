import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { startSend, executeChallenge, SendArgs } from "@/lib/circle";
import { useWallet } from "@/hooks/useWallet";
import { IconSend } from "./MekuIcon";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  defaults?: Partial<SendArgs>;
  recipientLabel?: string;
  title?: string;
}

const PRESETS = ["1", "5", "10", "25"];

export const SendSheet = ({ open, onOpenChange, defaults, recipientLabel, title = "Send USDC" }: Props) => {
  const [amount, setAmount] = useState(defaults?.amount ?? "1");
  const [address, setAddress] = useState(defaults?.destinationAddress ?? "");
  const [busy, setBusy] = useState(false);
  const { refresh, wallet, usdc } = useWallet();
  const needsAddress = !defaults?.recipientUserId && !defaults?.destinationAddress;

  const submit = async () => {
    if (busy) return;
    if (!wallet?.wallet_id) {
      toast.error("Your wallet is still provisioning. Try again in a moment.");
      return;
    }
    setBusy(true);
    try {
      const start = await startSend({
        ...defaults,
        amount,
        destinationAddress: needsAddress ? address : defaults?.destinationAddress,
        kind: defaults?.kind ?? "send",
      });
      await executeChallenge({
        challengeId: start.challengeId,
        userToken: start.userToken,
        encryptionKey: start.encryptionKey,
      });
      toast.success(`Sent ${amount} USDC`);
      onOpenChange(false);
      refresh();
    } catch (e: any) {
      const msg = String(e?.message ?? "Transaction failed");
      if (msg.includes("destination required")) {
        toast.error("Recipient hasn't set up their MEKU wallet yet.");
      } else {
        toast.error(msg);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[420px] rounded-3xl border-border bg-background p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[18px]">
            <IconSend size={20} /> {title}
          </DialogTitle>
          {recipientLabel && (
            <DialogDescription>To {recipientLabel}</DialogDescription>
          )}
        </DialogHeader>

        <div className="mt-2 flex flex-col items-center">
          <div className="flex items-baseline gap-1">
            <span className="text-[44px] font-bold tracking-[-0.02em] text-foreground tabular-nums">
              {amount || "0"}
            </span>
            <span className="text-[15px] font-semibold text-muted-foreground">USDC</span>
          </div>
          <p className="mt-1 text-[12px] text-muted-foreground">Arc Testnet · Bal {Number(usdc || 0).toFixed(2)} USDC</p>
        </div>

        <input
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
          className="mt-4 h-12 w-full rounded-2xl border border-border bg-surface px-4 text-center text-[15px] outline-none focus:border-primary"
        />

        {needsAddress && (
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Recipient address (0x…)"
            className="mt-3 h-12 w-full rounded-2xl border border-border bg-surface px-4 text-[13px] outline-none focus:border-primary font-mono"
          />
        )}

        <div className="mt-3 grid grid-cols-4 gap-2">
          {PRESETS.map((p) => (
            <button
              key={p}
              onClick={() => setAmount(p)}
              className="tap rounded-full border border-border bg-surface py-2 text-[13px] font-semibold text-foreground"
            >
              {p}
            </button>
          ))}
        </div>

        <button
          onClick={submit}
          disabled={busy || !amount || Number(amount) <= 0 || (needsAddress && !address)}
          className="tap mt-5 flex h-[52px] w-full items-center justify-center rounded-full bg-primary text-[15px] font-bold text-primary-foreground shadow-purple disabled:opacity-40"
        >
          {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : "Confirm & sign with PIN"}
        </button>
        <p className="mt-2 text-center text-[11px] text-muted-foreground">
          Circle will ask for your PIN to authorize this transfer.
        </p>
      </DialogContent>
    </Dialog>
  );
};
