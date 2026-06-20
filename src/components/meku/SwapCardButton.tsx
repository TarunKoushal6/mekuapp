// Credit-card animation — Uiverse.io by Admin12121.
// Triggers on click (data-active) instead of hover. On success the green
// side fills the whole pill and shows a check.
import { Check } from "lucide-react";
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
  const active = busy || success;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || busy || success}
      data-active={active ? "true" : "false"}
      data-success={success ? "true" : "false"}
      className={cn("meku-swap-wrap", className)}
      aria-label={label}
    >
      <div className="container">
        <div className="left-side">
          <div className="card">
            <div className="card-line" />
            <div className="buttons" />
          </div>
          <div className="post">
            <div className="post-line" />
            <div className="screen">
              <div className="dollar">$</div>
            </div>
            <div className="numbers" />
            <div className="numbers-line2" />
          </div>
          {success && (
            <div className="success-check">
              <Check size={26} strokeWidth={3} />
            </div>
          )}
        </div>
        <div className="right-side">
          <div className="new">{success ? successLabel : label}</div>
          <svg className="arrow" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 451.846 451.847">
            <path
              d="M345.441 248.292L151.154 442.573c-12.359 12.365-32.397 12.365-44.75 0-12.354-12.354-12.354-32.391 0-44.744L278.318 225.92 106.409 54.017c-12.354-12.359-12.354-32.394 0-44.748 12.354-12.359 32.391-12.359 44.75 0L345.441 203.55c6.179 6.18 9.262 14.271 9.262 22.366 0 8.099-3.091 16.196-9.262 22.376z"
              fill="#1f1f1f"
            />
          </svg>
        </div>
      </div>
      <style>{`
        .meku-swap-wrap {
          display: inline-block;
          background: transparent;
          border: none;
          padding: 0;
          cursor: pointer;
          width: 100%;
        }
        .meku-swap-wrap:disabled { cursor: not-allowed; opacity: 0.6; }
        .meku-swap-wrap .container {
          background-color: #ffffff;
          display: flex;
          width: 100%;
          max-width: 460px;
          margin: 0 auto;
          height: 84px;
          position: relative;
          border-radius: 12px;
          transition: 0.3s ease-in-out;
          overflow: hidden;
        }
        .meku-swap-wrap:not(:disabled):hover .container,
        .meku-swap-wrap[data-active="true"] .container {
          transform: scale(1.02);
        }
        .meku-swap-wrap[data-active="true"] .container {
          width: 160px;
        }
        .meku-swap-wrap .left-side {
          background-color: #5de2a3;
          width: 110px;
          height: 84px;
          border-radius: 8px;
          position: relative;
          display: flex;
          justify-content: center;
          align-items: center;
          transition: 0.3s;
          flex-shrink: 0;
          overflow: hidden;
        }
        .meku-swap-wrap[data-active="true"] .left-side {
          width: 100%;
        }
        .meku-swap-wrap .right-side {
          width: calc(100% - 110px);
          display: flex;
          align-items: center;
          overflow: hidden;
          justify-content: space-between;
          white-space: nowrap;
          transition: 0.3s;
        }
        .meku-swap-wrap .arrow { width: 18px; height: 18px; margin-right: 16px; }
        .meku-swap-wrap .new {
          font-size: 17px;
          font-weight: 700;
          color: #1f1f1f;
          margin-left: 16px;
          font-family: inherit;
        }
        .meku-swap-wrap .card {
          width: 60px;
          height: 38px;
          background-color: #c7ffbc;
          border-radius: 6px;
          position: absolute;
          display: flex;
          z-index: 10;
          flex-direction: column;
          align-items: center;
          box-shadow: 7px 7px 7px -2px rgba(77,200,143,.72);
        }
        .meku-swap-wrap .card-line {
          width: 55px; height: 10px;
          background-color: #80ea69;
          border-radius: 2px;
          margin-top: 6px;
        }
        .meku-swap-wrap .buttons {
          width: 7px; height: 7px;
          background-color: #379e1f;
          box-shadow: 0 -9px 0 0 #26850e, 0 9px 0 0 #56be3e;
          border-radius: 50%;
          transform: rotate(90deg);
          margin: 6px 0 0 -26px;
        }
        .meku-swap-wrap[data-active="true"] .card {
          animation: meku-slide-top 1.2s cubic-bezier(.645,.045,.355,1) both;
        }
        .meku-swap-wrap[data-active="true"] .post {
          animation: meku-slide-post 1s cubic-bezier(.165,.84,.44,1) both;
        }
        @keyframes meku-slide-top {
          0% { transform: translateY(0); }
          50% { transform: translateY(-60px) rotate(90deg); }
          60% { transform: translateY(-60px) rotate(90deg); }
          100% { transform: translateY(-6px) rotate(90deg); }
        }
        .meku-swap-wrap .post {
          width: 55px; height: 66px;
          background-color: #dddde0;
          position: absolute;
          z-index: 11;
          bottom: 10px;
          top: 84px;
          border-radius: 6px;
          overflow: hidden;
        }
        .meku-swap-wrap .post-line {
          width: 42px; height: 8px;
          background-color: #545354;
          position: absolute;
          border-radius: 0 0 3px 3px;
          right: 6px; top: 6px;
        }
        .meku-swap-wrap .post-line:before {
          content: "";
          position: absolute;
          width: 42px; height: 8px;
          background-color: #757375;
          top: -7px;
        }
        .meku-swap-wrap .screen {
          width: 42px; height: 20px;
          background-color: #ffffff;
          position: absolute;
          top: 19px; right: 6px;
          border-radius: 3px;
        }
        .meku-swap-wrap .numbers {
          width: 10px; height: 10px;
          background-color: #838183;
          box-shadow: 0 -15px 0 0 #838183, 0 15px 0 0 #838183;
          border-radius: 2px;
          position: absolute;
          transform: rotate(90deg);
          left: 22px; top: 46px;
        }
        .meku-swap-wrap .numbers-line2 {
          width: 10px; height: 10px;
          background-color: #aaa9ab;
          box-shadow: 0 -15px 0 0 #aaa9ab, 0 15px 0 0 #aaa9ab;
          border-radius: 2px;
          position: absolute;
          transform: rotate(90deg);
          left: 22px; top: 60px;
        }
        @keyframes meku-slide-post {
          50% { transform: translateY(0); }
          100% { transform: translateY(-60px); }
        }
        .meku-swap-wrap .dollar {
          position: absolute;
          font-size: 15px;
          font-weight: 700;
          width: 100%;
          left: 0; top: 1px;
          color: #4b953b;
          text-align: center;
        }
        .meku-swap-wrap[data-active="true"] .dollar {
          animation: meku-fade-in-fwd .3s 1s backwards;
        }
        @keyframes meku-fade-in-fwd {
          0% { opacity: 0; transform: translateY(-5px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .meku-swap-wrap .success-check {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          z-index: 20;
          animation: meku-fade-in-fwd .3s both;
        }
      `}</style>
    </button>
  );
};
