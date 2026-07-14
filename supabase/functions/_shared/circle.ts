// Shared Circle W3S REST helpers (UCW + Arc Testnet)
export const CIRCLE_BASE = "https://api.circle.com/v1/w3s";

export function uuid() {
  return crypto.randomUUID();
}

export async function circleFetch(
  path: string,
  init: RequestInit & { userToken?: string } = {},
) {
  const apiKey = Deno.env.get("CIRCLE_API_KEY");
  if (!apiKey) throw new Error("CIRCLE_API_KEY not set");
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${apiKey}`);
  headers.set("Content-Type", "application/json");
  headers.set("Accept", "application/json");
  if (init.userToken) headers.set("X-User-Token", init.userToken);
  const res = await fetch(`${CIRCLE_BASE}${path}`, { ...init, headers });
  const text = await res.text();
  let body: any = null;
  try { body = text ? JSON.parse(text) : null; } catch { body = text; }
  if (!res.ok) {
    throw new Error(
      `Circle ${path} ${res.status}: ${typeof body === "string" ? body : JSON.stringify(body)}`,
    );
  }
  return body;
}

export async function getCircleTransaction(transactionId: string) {
  try {
    const direct = await circleFetch(`/transactions/${encodeURIComponent(transactionId)}`, { method: "GET" });
    return direct?.data?.transaction ?? direct?.data ?? direct;
  } catch (_) {
    const listed = await circleFetch("/transactions?order=DESC&pageSize=50", { method: "GET" });
    const txs = listed?.data?.transactions ?? [];
    return txs.find((t: any) => t?.id === transactionId) ?? null;
  }
}

export function circleStateToStatus(state?: string | null) {
  const s = String(state ?? "").toUpperCase();
  if (["COMPLETE", "CONFIRMED", "SUCCESS"].includes(s)) return "confirmed";
  if (["FAILED", "DENIED", "CANCELLED", "ERROR"].includes(s)) return "failed";
  return "pending";
}

// Circle requires a fresh RSA-encrypted ciphertext per request. The simpler
// alternative they support: send the raw 32-byte hex entitySecret via the
// `/v1/w3s/config/entity/publicKey` endpoint to encrypt, but for Deno we
// generate ciphertext using their public key. To keep this lightweight, this
// helper supports both: if CIRCLE_ENTITY_SECRET_CIPHERTEXT is provided, use it.
// Otherwise we fetch their public key and encrypt the 32-byte secret.
let cachedPubKey: CryptoKey | null = null;
export async function entitySecretCiphertext(): Promise<string> {
  const cached = Deno.env.get("CIRCLE_ENTITY_SECRET_CIPHERTEXT");
  if (cached) return cached;

  const secretHex = Deno.env.get("CIRCLE_ENTITY_SECRET");
  if (!secretHex) throw new Error("CIRCLE_ENTITY_SECRET not set");

  if (!cachedPubKey) {
    const pk = await circleFetch("/config/entity/publicKey", { method: "GET" });
    const pemKey: string = pk?.data?.publicKey;
    if (!pemKey) throw new Error("No Circle public key returned");
    const b64 = pemKey
      .replace(/-----BEGIN PUBLIC KEY-----/, "")
      .replace(/-----END PUBLIC KEY-----/, "")
      .replace(/\s+/g, "");
    const der = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    cachedPubKey = await crypto.subtle.importKey(
      "spki", der, { name: "RSA-OAEP", hash: "SHA-256" }, false, ["encrypt"],
    );
  }

  const secretBytes = hexToBytes(secretHex);
  const cipher = await crypto.subtle.encrypt(
    { name: "RSA-OAEP" }, cachedPubKey, secretBytes,
  );
  return btoa(String.fromCharCode(...new Uint8Array(cipher)));
}

function hexToBytes(hex: string): Uint8Array {
  const clean = hex.startsWith("0x") ? hex.slice(2) : hex;
  const out = new Uint8Array(clean.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(clean.substr(i * 2, 2), 16);
  }
  return out;
}

// Arc Testnet blockchain identifier in Circle UCW. Adjust if Circle exposes a
// different code in the future.
export const ARC_TESTNET = "ARC-TESTNET";
export const USDC_TOKEN_ALIAS = "USDC";

// ---------------- PIN verification ----------------
// Server-side check that the caller supplied the correct wallet PIN before
// signing a transfer. Client sends `pinHash` computed with the same salt as
// src/lib/pin.ts. If the user has no PIN set, the check is skipped.
const PIN_SALT = "meku.wallet.pin.v1";

export async function hashPinServer(pin: string): Promise<string> {
  const buf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(`${PIN_SALT}:${pin}`),
  );
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Returns null on success, or an error message string on failure. */
export async function verifyWalletPin(
  admin: any,
  userId: string,
  supplied: { pin?: string; pinHash?: string } | null | undefined,
): Promise<string | null> {
  const { data } = await admin
    .from("wallet_pins")
    .select("pin_hash")
    .eq("user_id", userId)
    .maybeSingle();
  const stored: string | undefined = data?.pin_hash;
  if (!stored) return null; // no pin set — nothing to verify
  const candidate = supplied?.pinHash
    ? String(supplied.pinHash).toLowerCase()
    : supplied?.pin
      ? await hashPinServer(String(supplied.pin))
      : null;
  if (!candidate) return "Wallet PIN required";
  // constant-time compare
  const a = candidate;
  const b = stored.toLowerCase();
  if (a.length !== b.length) return "Wrong wallet PIN";
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0 ? null : "Wrong wallet PIN";
}
