/** Subtle haptic feedback. Silently no-ops when unsupported. */
type Intensity = "light" | "medium" | "heavy" | "success" | "warning" | "selection";

const patterns: Record<Intensity, number | number[]> = {
  selection: 6,
  light: 10,
  medium: 18,
  heavy: 28,
  success: [10, 40, 14],
  warning: [16, 60, 16],
};

export function haptic(kind: Intensity = "light") {
  if (typeof navigator === "undefined") return;
  const nav = navigator as Navigator & { vibrate?: (p: number | number[]) => boolean };
  try { nav.vibrate?.(patterns[kind]); } catch { /* ignore */ }
}
