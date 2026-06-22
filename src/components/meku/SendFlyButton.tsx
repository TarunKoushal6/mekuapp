// Send button — Uiverse.io by adamgiebl, adapted to trigger on click
// (flying) instead of hover, plus a success state (green pill + check).
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  onClick?: () => void;
  disabled?: boolean;
  busy?: boolean;
  flying?: boolean;
  success?: boolean;
  label?: string;
  successLabel?: string;
  className?: string;
  type?: "button" | "submit";
}

export const SendFlyButton = ({
  onClick,
  disabled,
  busy,
  flying,
  success,
  label = "Send",
  successLabel = "Sent",
  className,
  type = "button",
}: Props) => {
  // The plane should keep flying whenever the button is working OR after
  // the user clicked confirm — never show a generic spinner.
  const active = flying || busy || success;
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || success || busy}
      data-active={active ? "true" : "false"}
      data-success={success ? "true" : "false"}
      className={cn("meku-send-btn", className)}
    >
      <div className="svg-wrapper-1">
        <div className="svg-wrapper">
          {success ? (
            <Check size={22} strokeWidth={2.6} />
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22">
              <path fill="none" d="M0 0h24v24H0z" />
              <path
                fill="currentColor"
                d="M1.946 9.315c-.522-.174-.527-.455.01-.634l19.087-6.362c.529-.176.832.12.684.638l-5.454 19.086c-.15.529-.455.547-.679.045L12 14l6-8-8 6-8.054-2.685z"
              />
            </svg>
          )}
        </div>
      </div>
      <span>{success ? successLabel : label}</span>
      <style>{`
        .meku-send-btn {
          font-family: inherit;
          font-size: 17px;
          background: hsl(var(--primary));
          color: hsl(var(--primary-foreground));
          padding: 0.7em 1em;
          padding-left: 0.9em;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          border: none;
          border-radius: 9999px;
          overflow: hidden;
          transition: all 0.25s cubic-bezier(.22,.61,.36,1);
          cursor: pointer;
          font-weight: 700;
          will-change: transform;
        }
        .meku-send-btn .svg-wrapper-1 {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 1.35em;
          height: 1.35em;
          flex: 0 0 1.35em;
        }
        .meku-send-btn .svg-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
        }
        .meku-send-btn[data-success="true"] {
          background: #10b981;
        }
        .meku-send-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .meku-send-btn[data-success="true"]:disabled { opacity: 1; }
        .meku-send-btn span {
          display: block;
          margin-left: 0.3em;
          transition: transform 0.3s cubic-bezier(.22,.61,.36,1), opacity .25s;
        }
        .meku-send-btn svg {
          display: block;
          margin: auto;
          transform-origin: center center;
          transition: transform 0.3s cubic-bezier(.22,.61,.36,1);
        }
        /* Hover preview */
        .meku-send-btn:not([data-active="true"]):not(:disabled):hover .svg-wrapper {
          animation: meku-fly-1 0.6s ease-in-out infinite alternate;
        }
        .meku-send-btn:not([data-active="true"]):not(:disabled):hover svg {
          transform: translateX(1.2em) rotate(45deg) scale(1.1);
        }
        .meku-send-btn:not([data-active="true"]):not(:disabled):hover span {
          transform: translateX(5em);
        }
        /* Active state — plane flies off, label slides out */
        .meku-send-btn[data-active="true"][data-success="false"] .svg-wrapper {
          animation: meku-fly-1 0.6s ease-in-out infinite alternate;
        }
        .meku-send-btn[data-active="true"][data-success="false"] svg {
          transform: translateX(1.2em) rotate(45deg) scale(1.1);
        }
        .meku-send-btn[data-active="true"][data-success="false"] span {
          transform: translateX(5em);
          opacity: 0;
        }
        .meku-send-btn:active { transform: scale(0.97); }
        @keyframes meku-fly-1 {
          from { transform: translateY(0.1em); }
          to { transform: translateY(-0.1em); }
        }
      `}</style>
    </button>
  );
};
