// Completes a CCTP V2 bridge by:
//  1) Polling Circle IRIS for the attestation of the burn tx
//  2) Ensuring the user has a DCW wallet on the destination chain (EOA — same address)
//  3) Calling MessageTransmitterV2.receiveMessage(message, attestation) on dest chain
//  4) Updating the transactions row
//
// Call from the client after circle-bridge returns: pass { transactionId }.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import {
  circleFetch,
  entitySecretCiphertext,
  getCircleTransaction,
  uuid,
} from "../_shared/circle.ts";

const IRIS_BASE = "https://iris-api-sandbox.circle.com"; // testnet

const CHAINS: Record<string, {
  blockchain: string;
  messageTransmitter: string;
  domain: number;
}> = {
  Arc_Testnet:      { blockchain: "ARC-TESTNET",  messageTransmitter: "0xE737e5cEBEEBa77EFE34D4aa090756590b1CE275", domain: 26 },
  Base_Sepolia:     { blockchain: "BASE-SEPOLIA", messageTransmitter: "0xE737e5cEBEEBa77EFE34D4aa090756590b1CE275", domain: 6  },
  Ethereum_Sepolia: { blockchain: "ETH-SEPOLIA",  messageTransmitter: "0xE737e5cEBEEBa77EFE34D4aa090756590b1CE275", domain: 0  },
  Arbitrum_Sepolia: { blockchain: "ARB-SEPOLIA",  messageTransmitter: "0xE737e5cEBEEBa77EFE34D4aa090756590b1CE275", domain: 3  },
};

async function fetchAttestation(srcDomain: number, burnTxHash: string, maxMs = 90_000) {
  const start = Date.now();
  let delay = 2_000;
  while (Date.now() - start < maxMs) {
    try {
      const res = await fetch(`${IRIS_BASE}/v2/messages/${srcDomain}?transactionHash=${burnTxHash}`);
      if (res.ok) {
        const json = await res.json();
        const m = json?.messages?.[0];
        if (m?.status === "complete" && m?.attestation && m?.attestation !== "PENDING" && m?.message) {
          return { message: m.message as string, attestation: m.attestation as string };
        }
      }
    } catch (_) { /* swallow + retry */ }
    await new Promise((r) => setTimeout(r, delay));
    delay = Math.min(delay + 500, 4_000);
  }
  return null;
}

async function ensureDestinationWallet(admin: any, userId: string, dstBlockchain: string, srcWalletId: string) {
  // Look up the wallet set's wallets for this user on dstBlockchain.
  const refId = `meku-${userId}`;
  const list = await circleFetch(
    `/wallets?refId=${encodeURIComponent(refId)}&blockchain=${dstBlockchain}&pageSize=10`,
    { method: "GET" },
  ).catch(() => null);
  const existing = list?.data?.wallets?.find((w: any) => w?.blockchain === dstBlockchain);
  if (existing?.id) return existing;

  // Create one in the same wallet set. EOA on EVM = same address as source.
  const walletSetId = Deno.env.get("CIRCLE_WALLET_SET_ID");
  if (!walletSetId) throw new Error("CIRCLE_WALLET_SET_ID not configured");
  const res = await circleFetch("/developer/wallets", {
    method: "POST",
    body: JSON.stringify({
      idempotencyKey: uuid(),
      entitySecretCiphertext: await entitySecretCiphertext(),
      blockchains: [dstBlockchain],
      walletSetId,
      count: 1,
      accountType: "EOA",
      metadata: [{ name: `MEKU ${userId.slice(0, 8)} ${dstBlockchain}`, refId }],
    }),
  });
  const w = res?.data?.wallets?.[0];
  if (!w?.id) throw new Error("Failed to provision destination wallet");
  return w;
}

async function pollCircleTx(id: string, maxMs = 30_000) {
  const start = Date.now();
  let delay = 1500;
  while (Date.now() - start < maxMs) {
    const tx = await getCircleTransaction(id);
    const state = String(tx?.state ?? tx?.status ?? "").toUpperCase();
    if (["CONFIRMED", "COMPLETE"].includes(state)) return { ok: true, tx };
    if (["FAILED", "DENIED", "CANCELLED"].includes(state)) return { ok: false, tx };
    await new Promise((r) => setTimeout(r, delay));
    delay = Math.min(delay + 500, 3000);
  }
  return { ok: false, timeout: true };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: userErr } = await supabase.auth.getClaims(token);
    if (userErr || !claimsData?.claims?.sub) return json({ error: "Unauthorized" }, 401);
    const userId = claimsData.claims.sub as string;

    const { transactionId } = await req.json();
    if (!transactionId) return json({ error: "transactionId required" }, 400);

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { data: tx } = await admin
      .from("transactions").select("*").eq("id", transactionId).eq("user_id", userId).maybeSingle();
    if (!tx) return json({ error: "Transaction not found" }, 404);
    if (tx.kind !== "bridge") return json({ error: "Not a bridge transaction" }, 400);
    if (tx.status === "confirmed") return json({ ok: true, alreadyComplete: true });

    const meta = (tx.metadata ?? {}) as any;
    const src = CHAINS[meta.fromChain];
    const dst = CHAINS[meta.toChain];
    if (!src || !dst) return json({ error: "Unknown chain pair in transaction metadata" }, 400);

    const burnTxHash = tx.tx_hash ?? meta.burnTxHash;
    if (!burnTxHash) return json({ error: "Burn tx hash not yet recorded. Retry shortly." }, 409);

    // 1) Attestation
    const att = await fetchAttestation(src.domain, burnTxHash);
    if (!att) {
      await admin.from("transactions").update({
        metadata: { ...meta, stage: "awaiting_attestation" },
      }).eq("id", transactionId);
      return json({ status: "pending", stage: "awaiting_attestation" }, 202);
    }

    // 2) Destination wallet
    const { data: wallet } = await admin.from("wallets").select("*").eq("user_id", userId).maybeSingle();
    if (!wallet?.dcw_wallet_id) return json({ error: "Source wallet missing" }, 400);
    const destWallet = await ensureDestinationWallet(admin, userId, dst.blockchain, wallet.dcw_wallet_id);

    // 3) receiveMessage on destination MessageTransmitterV2
    const exec = await circleFetch("/developer/transactions/contractExecution", {
      method: "POST",
      body: JSON.stringify({
        idempotencyKey: uuid(),
        entitySecretCiphertext: await entitySecretCiphertext(),
        walletId: destWallet.id,
        contractAddress: dst.messageTransmitter,
        abiFunctionSignature: "receiveMessage(bytes,bytes)",
        abiParameters: [att.message, att.attestation],
        feeLevel: "MEDIUM",
      }),
    });
    const mintId = exec?.data?.id;
    if (!mintId) throw new Error("receiveMessage: no transaction id returned");

    const mintRes = await pollCircleTx(mintId);
    const mintHash = (mintRes.tx as any)?.txHash ?? null;

    await admin.from("transactions").update({
      status: mintRes.ok ? "confirmed" : mintRes.timeout ? "pending" : "failed",
      metadata: {
        ...meta,
        stage: mintRes.ok ? "minted" : mintRes.timeout ? "minting" : "mint_failed",
        mintId,
        mintTxHash: mintHash,
        destWalletId: destWallet.id,
        destAddress: destWallet.address,
      },
    }).eq("id", transactionId);

    return json({
      status: mintRes.ok ? "confirmed" : "pending",
      mintTxHash: mintHash,
      destAddress: destWallet.address,
    });
  } catch (e: any) {
    console.error("circle-bridge-complete", e);
    return json({ error: e.message ?? "Internal error" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
