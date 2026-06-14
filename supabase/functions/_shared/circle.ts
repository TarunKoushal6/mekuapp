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

// Circle requires a fresh RSA-encrypted ciphertext per request. The simpler
// alternative they support: send the raw 32-byte hex entitySecret via the
// `/v1/w3s/config/entity/publicKey` endpoint to encrypt, but for Deno we
// generate ciphertext using their public key. To keep this lightweight, this
// helper supports both: if CIRCLE_ENTITY_SECRET_CIPHERTEXT is provided, use it.
// Otherwise we fetch their public key and encrypt the 32-byte secret.
export async function entitySecretCiphertext(): Promise<string> {
  const cached = Deno.env.get("CIRCLE_ENTITY_SECRET_CIPHERTEXT");
  if (cached) return cached;

  const secretHex = Deno.env.get("CIRCLE_ENTITY_SECRET");
  if (!secretHex) throw new Error("CIRCLE_ENTITY_SECRET not set");

  // 1. fetch public key
  const pk = await circleFetch("/config/entity/publicKey", { method: "GET" });
  const pemKey: string = pk?.data?.publicKey;
  if (!pemKey) throw new Error("No Circle public key returned");

  // 2. import the PEM key
  const b64 = pemKey
    .replace(/-----BEGIN PUBLIC KEY-----/, "")
    .replace(/-----END PUBLIC KEY-----/, "")
    .replace(/\s+/g, "");
  const der = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  const cryptoKey = await crypto.subtle.importKey(
    "spki",
    der,
    { name: "RSA-OAEP", hash: "SHA-256" },
    false,
    ["encrypt"],
  );

  // 3. encrypt the 32-byte entity secret
  const secretBytes = hexToBytes(secretHex);
  const cipher = await crypto.subtle.encrypt(
    { name: "RSA-OAEP" },
    cryptoKey,
    secretBytes,
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
