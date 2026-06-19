// Credit-card flip button — used for Swap confirmation.
// Card slides in from the right and flips to reveal a green check on success.
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  onClick?: () => void;
  disabled?: boolean;
  busy?: boolean;
  success?: boolean;
  label?: string;
  successLabel?: string;
  className?: string;
}

export const SwapCardButton = ({
  onClick,
  disabled,
  busy,
  success,
  label = "Confirm swap",
  successLabel = "Swap submitted",
  className,
}: Props) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || busy || success}
      data-busy={busy ? "true" : "false"}
      data-success={success ? "true" : "false"}
      className={cn(
        "swap-card group relative h-[56px] w-full overflow-hidden rounded-full font-bold text-primary-foreground transition-colors duration-300 active:scale-[0.98] disabled:opacity-40",
        success ? "bg-emerald-500" : "bg-foreground text-background",
        className,
      )}
    >
      {/* default label */}
      <span className="swap-card__label absolute inset-0 inline-flex items-center justify-center gap-2 text-[15px] transition-opacity duration-200 group-data-[busy=true]:opacity-0 group-data-[success=true]:opacity-0">
        {label}
      </span>

      {/* flying credit card */}
      <span
        className={cn(
          "swap-card__card pointer-events-none absolute left-1/2 top-1/2 h-[36px] w-[56px] -translate-x-1/2 -translate-y-1/2 rounded-md opacity-0",
          "bg-gradient-to-br from-fuchsia-400 via-primary to-cyan-400 shadow-lg",
        )}
        aria-hidden
      >
        <span className="absolute left-1.5 top-1.5 h-2 w-3 rounded-sm bg-yellow-300/90" />
        <span className="absolute bottom-1.5 left-1.5 right-1.5 h-1 rounded-full bg-white/40" />
      </span>

      {/* busy spinner */}
      <span className="absolute inset-0 inline-flex items-center justify-center opacity-0 transition-opacity duration-200 group-data-[busy=true]:opacity-100 group-data-[success=true]:opacity-0">
        <Loader2 className="h-5 w-5 animate-spin" />
      </span>

      {/* success */}
      <span className="absolute inset-0 inline-flex items-center justify-center gap-2 text-[15px] opacity-0 transition-opacity duration-200 group-data-[success=true]:opacity-100">
        <Check className="h-5 w-5" strokeWidth={2.4} />
        {successLabel}
      </span>

      <style>{`
        .swap-card[data-busy="true"] .swap-card__card {
          animation: meku-card-swipe 1.1s cubic-bezier(.6,.05,.4,1) forwards;
        }
        .swap-card[data-success="true"] .swap-card__card {
          animation: meku-card-flip 0.7s ease-out forwards;
        }
        @keyframes meku-card-swipe {
          0%   { transform: translate(140%, -50%) rotate(-8deg); opacity: 0; }
          25%  { transform: translate(0%, -50%)   rotate(0deg);  opacity: 1; }
          75%  { transform: translate(0%, -50%)   rotate(0deg);  opacity: 1; }
          100% { transform: translate(-140%, -50%) rotate(8deg); opacity: 0; }
        }
        @keyframes meku-card-flip {
          0%   { transform: translate(-50%, -50%) rotateY(0deg);  opacity: 1; }
          100% { transform: translate(-50%, -50%) rotateY(180deg); opacity: 0; }
        }
      `}</style>
    </button>
  );
};
