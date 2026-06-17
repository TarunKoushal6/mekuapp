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
