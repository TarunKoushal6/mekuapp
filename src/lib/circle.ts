// Client-side Circle wrapper. Talks to our edge functions and lazy-loads the
// Circle web SDK so that its Node-only deps (jsonwebtoken/safe-buffer) don't
// break the app on initial load.
import { supabase } from "@/integrations/supabase/client";

async function invoke<T = any>(name: string, body?: unknown): Promise<T> {
  const { data, error } = await supabase.functions.invoke(name, { body });
  if (error) throw error;
  if ((data as any)?.error) throw new Error((data as any).error);
  return data as T;
}

export interface WalletRow {
  user_id: string;
  circle_user_id: string;
  wallet_id: string | null;
  address: string | null;
  chain: string;
  status: string;
}

export interface InitResponse {
  userToken: string;
  encryptionKey: string;
  challengeId?: string;
  wallet: WalletRow | null;
}

export async function initCircle(): Promise<InitResponse> {
  return invoke<InitResponse>("circle-init");
}

export async function fetchBalance(): Promise<{ wallet: WalletRow | null; balances: any[] }> {
  return invoke("circle-balance");
}

export interface SendArgs {
  destinationAddress?: string;
  recipientUserId?: string;
  amount: string;
  postId?: string;
  commentId?: string;
  kind?: "send" | "tip" | "request";
}

export async function startSend(args: SendArgs) {
  return invoke<{
    challengeId: string;
    userToken: string;
    encryptionKey: string;
    transactionId: string;
  }>("circle-send", args);
}

// Lazy-loaded SDK instance. Importing the SDK eagerly crashes the bundle
// because it pulls jsonwebtoken which expects Node's Buffer global.
let sdkPromise: Promise<any> | null = null;
async function getSdk() {
  if (!sdkPromise) {
    sdkPromise = (async () => {
      // Polyfill Buffer for the SDK's transitive deps before importing it.
      const { Buffer } = await import("buffer");
      (globalThis as any).Buffer ??= Buffer;
      const mod = await import("@circle-fin/w3s-pw-web-sdk");
      const W3SSdk = (mod as any).W3SSdk ?? (mod as any).default;
      return new W3SSdk({ appSettings: { appId: "meku" } });
    })();
  }
  return sdkPromise;
}

// Runs the Circle PIN UI for a given challenge id. Resolves on completion.
export async function executeChallenge(opts: {
  userToken: string;
  encryptionKey: string;
  challengeId: string;
}): Promise<void> {
  const s = await getSdk();
  return new Promise((resolve, reject) => {
    s.setAuthentication({
      userToken: opts.userToken,
      encryptionKey: opts.encryptionKey,
    });
    s.execute(opts.challengeId, (error: unknown) => {
      if (error) return reject(error);
      resolve();
    });
  });
}

// Parse "@handle send 5 usdc" from free text.
const MENTION_SEND_RE = /@(\w{1,32})\s+send\s+([\d.]+)\s*(usdc|usd)?/i;
export function parseMentionSend(text: string) {
  const m = text.match(MENTION_SEND_RE);
  if (!m) return null;
  return { handle: m[1].toLowerCase(), amount: m[2], token: "USDC" };
}
