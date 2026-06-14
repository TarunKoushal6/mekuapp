// Global mount: when the wallet provider exposes a pending Circle challenge
// (initialize / set PIN), we run the Circle Web SDK PIN flow automatically.
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useWallet } from "@/hooks/useWallet";
import { executeChallenge } from "@/lib/circle";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { IconWallet } from "./MekuIcon";

export const PinChallengeModal = () => {
  const { pendingChallenge, clearChallenge, refresh } = useWallet();
  const [busy, setBusy] = useState(false);

  const start = async () => {
    if (!pendingChallenge || busy) return;
    setBusy(true);
    try {
      await executeChallenge(pendingChallenge);
      toast.success("Wallet ready");
      clearChallenge();
      refresh();
    } catch (e: any) {
      toast.error(e?.message ?? "PIN setup cancelled");
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    // auto-launch the Circle PIN UI as soon as a challenge appears
    if (pendingChallenge && !busy) start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingChallenge?.challengeId]);

  if (!pendingChallenge) return null;
  return (
    <Dialog open onOpenChange={(o) => !o && clearChallenge()}>
      <DialogContent className="max-w-[380px] rounded-3xl border-border bg-background p-6 text-center">
        <DialogHeader>
          <div className="mx-auto mb-3 inline-flex h-[56px] w-[56px] items-center justify-center rounded-2xl gradient-purple text-primary-foreground shadow-purple">
            <IconWallet size={26} />
          </div>
          <DialogTitle className="text-[18px]">Set your wallet PIN</DialogTitle>
          <DialogDescription>
            Create a 6-digit PIN to protect your MEKU wallet. Circle will use it
            to authorise every transaction.
          </DialogDescription>
        </DialogHeader>

        <button
          onClick={start}
          disabled={busy}
          className="tap mt-4 flex h-[48px] w-full items-center justify-center rounded-full bg-primary text-[14px] font-bold text-primary-foreground shadow-purple disabled:opacity-50"
        >
          {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : "Open Circle PIN setup"}
        </button>
        <button onClick={clearChallenge} className="tap mt-2 text-[12px] text-muted-foreground">
          I'll do this later
        </button>
      </DialogContent>
    </Dialog>
  );
};
