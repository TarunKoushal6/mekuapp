// Client-side Circle wrapper. Talks to our edge functions and the Circle web SDK.
import { W3SSdk } from "@circle-fin/w3s-pw-web-sdk";
import { supabase } from "@/integrations/supabase/client";

let sdk: W3SSdk | null = null;

function getSdk(appId = "meku"): W3SSdk {
  if (!sdk) {
    sdk = new W3SSdk({ appSettings: { appId } });
  }
  return sdk;
}

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

// Runs the Circle PIN UI for a given challenge id. Resolves on completion.
export function executeChallenge(opts: {
  userToken: string;
  encryptionKey: string;
  challengeId: string;
}): Promise<void> {
  return new Promise((resolve, reject) => {
    const s = getSdk();
    s.setAuthentication({
      userToken: opts.userToken,
      encryptionKey: opts.encryptionKey,
    });
    s.execute(opts.challengeId, (error, result) => {
      if (error) return reject(error);
      if (result?.resultType) return resolve();
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
