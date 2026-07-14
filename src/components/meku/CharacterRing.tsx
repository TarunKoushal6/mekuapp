import { useReducedMotion, motion } from "framer-motion";

/**
 * Character counter as a ring meter. Softens near limit, glows red at overflow.
 * Phase 4 — taste (single hero-quality micro), transitions-dev (--d2/ease-out-strong).
 */
interface Props {
  value: number;
  max?: number;
  size?: number;
}

export const CharacterRing = ({ value, max = 280, size = 22 }: Props) => {
  const reduce = useReducedMotion();
  const stroke = 2.4;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const ratio = Math.min(value / max, 1);
  const over = value > max;
  const near = value > max * 0.85 && !over;

  const color = over
    ? "hsl(var(--destructive))"
    : near
      ? "hsl(38 92% 52%)"
      : "hsl(var(--primary))";

  const remaining = max - value;
  const showCount = near || over;

  return (
    <div className="inline-flex items-center gap-1.5 tabular-nums">
      {showCount && (
        <span
          className="text-[11px] font-semibold"
          style={{ color: over ? "hsl(var(--destructive))" : "hsl(var(--muted-foreground))" }}
        >
          {remaining}
        </span>
      )}
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth={stroke}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - ratio)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          initial={false}
          animate={{ strokeDashoffset: c * (1 - ratio) }}
          transition={
            reduce
              ? { duration: 0 }
              : { duration: 0.22, ease: [0.23, 1, 0.32, 1] }
          }
        />
      </svg>
    </div>
  );
};
