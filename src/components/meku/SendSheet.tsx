import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { sendUsdc, SendArgs } from "@/lib/circle";
import { useWallet } from "@/hooks/useWallet";
import { usePin } from "@/hooks/usePin";
import { IconSend } from "./MekuIcon";
import { SendFlyButton } from "./SendFlyButton";
import { ConfirmSheet } from "./ConfirmSheet";

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
  const [flying, setFlying] = useState(false);
  const [success, setSuccess] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { refresh, wallet, usdc } = useWallet();
  const { requirePin } = usePin();
  const needsAddress = !defaults?.recipientUserId && !defaults?.destinationAddress;

  const canReview =
    !!amount && Number(amount) > 0 &&
    (!needsAddress || /^0x[a-fA-F0-9]{40}$/.test(address));

  const openReview = () => {
    if (!wallet?.wallet_id) {
      toast.error("Your wallet is still provisioning. Try again in a moment.");
      return;
    }
    setConfirmOpen(true);
  };

  const submit = async () => {
    if (busy) return;
    const pinHash = await requirePin();
    if (!pinHash) return;
    setBusy(true);
    try {
      await sendUsdc({
        ...defaults,
        amount,
        destinationAddress: needsAddress ? address : defaults?.destinationAddress,
        kind: defaults?.kind ?? "send",
        pinHash: typeof pinHash === "string" ? pinHash : undefined,
      });
      setFlying(true);
      setTimeout(() => setSuccess(true), 650);
      setTimeout(() => {
        setConfirmOpen(false);
        onOpenChange(false);
        setFlying(false);
        setSuccess(false);
        refresh();
        toast.success(`Sent ${amount} USDC`);
      }, 1400);
    } catch (e: any) {
      const msg = String(e?.message ?? "Transaction failed");
      if (msg.includes("destination required")) toast.error("Recipient hasn't set up their MEKU wallet yet.");
      else toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  const destinationDisplay = defaults?.destinationAddress
    ? `${defaults.destinationAddress.slice(0, 6)}…${defaults.destinationAddress.slice(-4)}`
    : recipientLabel
      ? recipientLabel
      : address
        ? `${address.slice(0, 6)}…${address.slice(-4)}`
        : "—";

  return (
    <>
      <Dialog open={open && !confirmOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[420px] rounded-3xl border-border bg-background p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[18px]">
              <IconSend size={20} /> {title}
            </DialogTitle>
            {recipientLabel && <DialogDescription>To {recipientLabel}</DialogDescription>}
          </DialogHeader>

          <div className="mt-2 flex flex-col items-center">
            <div className="flex items-baseline gap-1">
              <span className="text-[44px] font-bold tracking-[-0.02em] text-foreground tabular-nums">{amount || "0"}</span>
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
            <>
              <input
                value={address}
                onChange={(e) => {
                  const v = e.target.value.trim();
                  const cleaned = v.startsWith("0x") || v.startsWith("0X")
                    ? "0x" + v.slice(2).replace(/[^0-9a-fA-F]/g, "").slice(0, 40)
                    : v.replace(/[^0-9a-fA-Fx]/g, "").slice(0, 42);
                  setAddress(cleaned);
                }}
                spellCheck={false}
                autoCapitalize="off"
                autoCorrect="off"
                placeholder="Recipient address (0x…)"
                className="mt-3 h-12 w-full rounded-2xl border border-border bg-surface px-4 text-[13px] outline-none focus:border-primary font-mono"
              />
              {address.length > 0 && !/^0x[a-fA-F0-9]{40}$/.test(address) && (
                <p className="mt-1.5 text-[11.5px] text-destructive">Enter a valid 0x address (40 hex chars).</p>
              )}
            </>
          )}

          <div className="mt-3 grid grid-cols-4 gap-2">
            {PRESETS.map((p) => (
              <button key={p} onClick={() => setAmount(p)} className="tap rounded-full border border-border bg-surface py-2 text-[13px] font-semibold text-foreground">
                {p}
              </button>
            ))}
          </div>

          <SendFlyButton onClick={openReview} disabled={!canReview} label="Review transfer" className="mt-5" />
          <p className="mt-2 text-center text-[11px] text-muted-foreground">You'll review and PIN-confirm on the next step.</p>
        </DialogContent>
      </Dialog>

      {confirmOpen && (
        <ConfirmSheet
          open={confirmOpen}
          onOpenChange={(o) => { if (!busy && !flying) setConfirmOpen(o); }}
          title="Confirm transfer"
          subtitle={recipientLabel ? `To ${recipientLabel}` : undefined}
          headline={<>{amount} <span className="text-muted-foreground text-[18px]">USDC</span></>}
          rows={[
            { label: "From", value: wallet?.address ? `${wallet.address.slice(0, 6)}…${wallet.address.slice(-4)}` : "Your wallet", mono: true },
            { label: "To", value: destinationDisplay, mono: true },
            { label: "Network", value: "Arc Testnet" },
            { label: "Network fee", value: "Paid in USDC" },
          ]}
          variant="send"
          busy={busy}
          flying={flying}
          success={success}
          onConfirm={submit}
          footnote="You'll be asked for your wallet PIN before signing."
        />
      )}
    </>
  );
};
