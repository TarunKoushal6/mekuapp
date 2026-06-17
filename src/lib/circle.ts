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
  appId?: string | null;
}

let cachedAppId: string | null = null;
export function getAppId(): string | null { return cachedAppId; }

export async function initCircle(): Promise<InitResponse> {
  const r = await invoke<InitResponse>("circle-init");
  if (r.appId) cachedAppId = r.appId;
  return r;
}

export async function initDcw(): Promise<{ wallet: WalletRow | null }> {
  return invoke("circle-dcw-init");
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

// Server-signed DCW transfer — no PIN modal needed.
export async function sendUsdc(args: SendArgs) {
  return invoke<{ transactionId: string; circleTxId?: string; state?: string }>(
    "circle-send",
    args,
  );
}

export async function syncTransaction(transactionId: string) {
  return invoke<{ transaction?: any; circleState?: string }>("circle-sync-transaction", { transactionId });
}


// Lazy-loaded SDK instance. Importing the SDK eagerly crashes the bundle
// because it pulls jsonwebtoken which expects Node's Buffer global.
let sdkPromise: Promise<any> | null = null;
let sdkAppId: string | null = null;
async function getSdk(appId: string) {
  if (!appId) throw new Error("Circle App ID missing — set CIRCLE_APP_ID secret");
  if (!sdkPromise || sdkAppId !== appId) {
    sdkAppId = appId;
    sdkPromise = (async () => {
      const { Buffer } = await import("buffer");
      (globalThis as any).Buffer ??= Buffer;
      const mod = await import("@circle-fin/w3s-pw-web-sdk");
      const W3SSdk = (mod as any).W3SSdk ?? (mod as any).default;
      return new W3SSdk({ appSettings: { appId } });
    })();
  }
  return sdkPromise;
}

// Runs the Circle PIN UI for a given challenge id. Resolves on completion.
export async function executeChallenge(opts: {
  userToken: string;
  encryptionKey: string;
  challengeId: string;
  appId?: string;
}): Promise<void> {
  const appId = opts.appId ?? cachedAppId;
  if (!appId) throw new Error("Circle App ID missing — set CIRCLE_APP_ID secret");
  const s = await getSdk(appId);
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
