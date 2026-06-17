// Number / currency formatting helpers.

/** Format a numeric string to at most `max` decimals, dropping trailing zeros. */
export function formatAmount(value: string | number | null | undefined, max = 2): string {
  if (value === null || value === undefined || value === "") return "0";
  const n = typeof value === "string" ? Number(value) : value;
  if (!Number.isFinite(n)) return "0";
  // Use toFixed then trim
  const fixed = n.toFixed(max);
  return fixed.replace(/\.?0+$/, "");
}

export function shortAddr(addr?: string | null): string {
  if (!addr) return "";
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}
