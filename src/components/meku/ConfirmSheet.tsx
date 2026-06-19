import { ReactNode } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { SendFlyButton } from "./SendFlyButton";
import { SwapCardButton } from "./SwapCardButton";

export interface ConfirmRow {
  label: string;
  value: ReactNode;
  mono?: boolean;
}

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  title: string;
  subtitle?: string;
  /** Big headline (e.g. "10 USDC → 9.97 EURC"). */
  headline?: ReactNode;
  rows: ConfirmRow[];
  busy?: boolean;
  flying?: boolean;     // SendFly only
  success?: boolean;
  variant?: "send" | "bridge" | "swap";
  onConfirm: () => void;
  confirmLabel?: string;
  successLabel?: string;
  footnote?: string;
}

export const ConfirmSheet = ({
  open, onOpenChange, title, subtitle, headline, rows,
  busy, flying, success, variant = "send",
  onConfirm, confirmLabel, successLabel, footnote,
}: Props) => {
  return (
    <Dialog open={open} onOpenChange={(o) => { if (!busy && !flying) onOpenChange(o); }}>
      <DialogContent className="max-w-[420px] rounded-3xl border-border bg-background p-6">
        <DialogHeader>
          <DialogTitle className="text-[18px]">{title}</DialogTitle>
          {subtitle && <DialogDescription>{subtitle}</DialogDescription>}
        </DialogHeader>

        {headline && (
          <div className="mt-2 flex flex-col items-center text-center">
            <div className="text-[26px] font-bold tracking-[-0.02em] text-foreground">{headline}</div>
          </div>
        )}

        <div className="mt-4 rounded-2xl border border-border bg-surface p-4 text-[13px]">
          {rows.map((r, i) => (
            <div key={i} className={(i > 0 ? "mt-2 pt-2 border-t border-border " : "") + "flex items-start justify-between gap-3"}>
              <span className="text-muted-foreground">{r.label}</span>
              <span className={"max-w-[60%] truncate text-right font-semibold text-foreground tabular-nums " + (r.mono ? "font-mono text-[12px]" : "")}>
                {r.value}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-5">
          {variant === "swap" ? (
            <SwapCardButton
              onClick={onConfirm}
              busy={busy}
              success={success}
              label={confirmLabel ?? "Confirm swap"}
              successLabel={successLabel ?? "Swap submitted"}
            />
          ) : (
            <SendFlyButton
              onClick={onConfirm}
              busy={busy}
              flying={flying}
              success={success}
              label={confirmLabel ?? (variant === "bridge" ? "Confirm bridge" : "Confirm transfer")}
              successLabel={successLabel ?? (variant === "bridge" ? "Bridge submitted" : "Sent")}
            />
          )}
        </div>

        {footnote && <p className="mt-3 text-center text-[11px] text-muted-foreground">{footnote}</p>}
      </DialogContent>
    </Dialog>
  );
};
