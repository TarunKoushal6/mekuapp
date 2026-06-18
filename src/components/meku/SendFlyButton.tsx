// Animated "send" button — plane flies up-right on submit, label slides off.
// Inspired by Uiverse / adamgiebl, rebound to MEKU tokens + submit-success.
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  onClick?: () => void;
  disabled?: boolean;
  busy?: boolean;
  flying?: boolean;
  label?: string;
  className?: string;
  type?: "button" | "submit";
  size?: "lg" | "sm";
}

export const SendFlyButton = ({
  onClick,
  disabled,
  busy,
  flying,
  label = "Send",
  className,
  type = "button",
  size = "lg",
}: Props) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      data-flying={flying ? "true" : "false"}
      className={cn(
        "send-fly group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full bg-primary font-bold text-primary-foreground shadow-purple transition-transform active:scale-[0.98] disabled:opacity-40",
        size === "lg" ? "h-[52px] w-full px-6 text-[15px]" : "h-10 px-4 text-[13px]",
        className,
      )}
    >
      <span className="send-fly__label inline-block transition-all duration-300 group-data-[flying=true]:translate-x-3 group-data-[flying=true]:opacity-0">
        {busy && !flying ? <Loader2 className="h-5 w-5 animate-spin" /> : label}
      </span>
      <svg
        viewBox="0 0 24 24"
        className="send-fly__plane h-[18px] w-[18px] transition-transform duration-500"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21.4 2.6 2.9 9.7a.5.5 0 0 0 0 .94l7.1 2.66 2.66 7.1a.5.5 0 0 0 .94 0L21.4 2.6Z" />
        <path d="M10 14 21.4 2.6" />
      </svg>
      <style>{`
        .send-fly[data-flying="true"] .send-fly__plane {
          animation: meku-fly 0.7s cubic-bezier(.65,.05,.36,1) forwards;
        }
        @keyframes meku-fly {
          40% { transform: translate(8px,-8px) rotate(15deg); opacity: 1; }
          60% { transform: translate(14px,-14px) rotate(25deg); opacity: 0.9; }
          100% { transform: translate(60px,-60px) rotate(35deg); opacity: 0; }
        }
      `}</style>
    </button>
  );
};
