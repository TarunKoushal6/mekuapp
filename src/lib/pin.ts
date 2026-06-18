// Client-managed wallet PIN. Hash is stored on the user's profile and is
// independent of Circle DCW — DCW signing happens server-side regardless.
// This PIN is purely a local confirmation gate so users can double-check
// every transaction.
import { supabase } from "@/integrations/supabase/client";

const SALT = "meku.wallet.pin.v1";

export async function hashPin(pin: string): Promise<string> {
  const data = new TextEncoder().encode(`${SALT}:${pin}`);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function getPinHash(userId: string): Promise<string | null> {
  const { data } = await supabase
    .from("profiles")
    .select("pin_hash")
    .eq("id", userId)
    .maybeSingle();
  return (data as any)?.pin_hash ?? null;
}

export async function setPin(userId: string, pin: string): Promise<void> {
  const hash = await hashPin(pin);
  const { error } = await supabase
    .from("profiles")
    .update({ pin_hash: hash })
    .eq("id", userId);
  if (error) throw error;
}

export async function verifyPin(userId: string, pin: string): Promise<boolean> {
  const stored = await getPinHash(userId);
  if (!stored) return false;
  const candidate = await hashPin(pin);
  return stored === candidate;
}

export function isValidPin(pin: string) {
  return /^\d{4,6}$/.test(pin);
}

// ---------------- Recovery (3 security questions) ----------------

export const RECOVERY_QUESTIONS = [
  "What was the name of your first pet?",
  "What city were you born in?",
  "What is your mother's maiden name?",
  "What was the name of your first school?",
  "What is your favorite book?",
  "What is your favorite movie?",
  "What was your childhood nickname?",
  "What street did you grow up on?",
] as const;

const ANSWER_SALT = "meku.wallet.recovery.v1";

export async function hashAnswer(answer: string): Promise<string> {
  const normalized = answer.trim().toLowerCase().replace(/\s+/g, " ");
  const data = new TextEncoder().encode(`${ANSWER_SALT}:${normalized}`);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export interface RecoveryRow {
  q1: string; q2: string; q3: string;
  a1_hash: string; a2_hash: string; a3_hash: string;
}

export async function getRecovery(userId: string): Promise<RecoveryRow | null> {
  const { data } = await supabase
    .from("wallet_pin_recovery")
    .select("q1,q2,q3,a1_hash,a2_hash,a3_hash")
    .eq("user_id", userId)
    .maybeSingle();
  return (data as RecoveryRow | null) ?? null;
}

export async function saveRecovery(
  userId: string,
  qs: [string, string, string],
  answers: [string, string, string],
): Promise<void> {
  const [a1, a2, a3] = await Promise.all(answers.map(hashAnswer));
  const { error } = await supabase
    .from("wallet_pin_recovery")
    .upsert({
      user_id: userId,
      q1: qs[0], q2: qs[1], q3: qs[2],
      a1_hash: a1, a2_hash: a2, a3_hash: a3,
    }, { onConflict: "user_id" });
  if (error) throw error;
}

export async function verifyRecovery(
  userId: string,
  answers: [string, string, string],
): Promise<boolean> {
  const row = await getRecovery(userId);
  if (!row) return false;
  const [a1, a2, a3] = await Promise.all(answers.map(hashAnswer));
  return a1 === row.a1_hash && a2 === row.a2_hash && a3 === row.a3_hash;
}

export async function clearPin(userId: string): Promise<void> {
  const { error } = await supabase
    .from("profiles")
    .update({ pin_hash: null })
    .eq("id", userId);
  if (error) throw error;
}
