// Bridge USDC across chains via Circle W3S REST + CCTP V2.
// Fixes:
//  - Arc USDC = 0x3600...000, Arc CCTP domain = 26
//  - Per-chain USDC + TokenMessengerV2 addresses
//  - BigInt amount conversion (no float rounding)
//  - approve() polled to CONFIRMED before depositForBurn
//  - Records burn tx for later mint completion (see circle-bridge-complete)
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import {
  circleFetch,
  entitySecretCiphertext,
  getCircleTransaction,
  uuid,
  verifyWalletPin,
} from "../_shared/circle.ts";

interface Body {
  fromChain?: string;
  toChain?: string;
  amount: string;
  recipientAddress?: string;
  pin?: string;
  pinHash?: string;
}

// CCTP V2 testnet config. TokenMessengerV2 happens to share the same address
// across V2 testnet chains; USDC addresses differ per chain.
const CHAINS: Record<string, {
  blockchain: string;
  usdc: string;
  tokenMessenger: string;
  messageTransmitter: string;
  domain: number;
}> = {
  Arc_Testnet: {
    blockchain: "ARC-TESTNET",
    usdc: "0x3600000000000000000000000000000000000000",
    tokenMessenger: "0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA",
    messageTransmitter: "0xE737e5cEBEEBa77EFE34D4aa090756590b1CE275",
    domain: 26,
  },
  Base_Sepolia: {
    blockchain: "BASE-SEPOLIA",
    usdc: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
    tokenMessenger: "0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA",
    messageTransmitter: "0xE737e5cEBEEBa77EFE34D4aa090756590b1CE275",
    domain: 6,
  },
  Ethereum_Sepolia: {
    blockchain: "ETH-SEPOLIA",
    usdc: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
    tokenMessenger: "0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA",
    messageTransmitter: "0xE737e5cEBEEBa77EFE34D4aa090756590b1CE275",
    domain: 0,
  },
  Arbitrum_Sepolia: {
    blockchain: "ARB-SEPOLIA",
    usdc: "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d",
    tokenMessenger: "0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA",
    messageTransmitter: "0xE737e5cEBEEBa77EFE34D4aa090756590b1CE275",
    domain: 3,
  },
};

// Convert a decimal USDC string to a 6-decimal integer string without float math.
function usdcToUnits(amount: string): string {
  const trimmed = String(amount).trim();
  if (!/^\d+(\.\d+)?$/.test(trimmed)) throw new Error(`Invalid amount: ${amount}`);
  const [whole, frac = ""] = trimmed.split(".");
  const fracPadded = (frac + "000000").slice(0, 6);
  const units = BigInt(whole) * 1_000_000n + BigInt(fracPadded || "0");
  return units.toString();
}

async function pollCircleTx(id: string, maxMs = 22_000) {
  const start = Date.now();
  let delay = 1200;
  while (Date.now() - start < maxMs) {
    const tx = await getCircleTransaction(id);
    const state = String(tx?.state ?? tx?.status ?? "").toUpperCase();
    if (["CONFIRMED", "COMPLETE"].includes(state)) return { ok: true, tx };
    if (["FAILED", "DENIED", "CANCELLED"].includes(state)) return { ok: false, tx };
    await new Promise((r) => setTimeout(r, delay));
    delay = Math.min(delay + 400, 2500);
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
    const user = claimsData?.claims?.sub ? { id: claimsData.claims.sub as string } : null;
    if (userErr || !user) return json({ error: "Unauthorized" }, 401);

    const body = (await req.json()) as Body;
    if (!body?.amount || Number(body.amount) <= 0) return json({ error: "amount required" }, 400);
    if (!body.fromChain || !body.toChain) return json({ error: "fromChain and toChain required" }, 400);

    const src = CHAINS[body.fromChain];
    const dst = CHAINS[body.toChain];
    if (!src || !dst) return json({ error: `Unsupported chain pair ${body.fromChain} -> ${body.toChain}` }, 400);
    if (src.domain === dst.domain) return json({ error: "fromChain and toChain must differ" }, 400);

    // Arc-originating CCTPv2 burns must clear the dynamic max fee (~1.4 USDC).
    if (src.blockchain === "ARC-TESTNET" && Number(body.amount) < 1.5) {
      return json({
        error: "Bridges originating from Arc Testnet require at least ~1.5 USDC to cover the CCTP V2 max fee.",
      }, 400);
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { data: wallet } = await admin
      .from("wallets").select("*").eq("user_id", user.id).maybeSingle();
    const walletId = wallet?.dcw_wallet_id;
    if (!walletId) return json({ error: "Wallet not provisioned. Open Wallet to initialize." }, 400);

    const recipient = (body.recipientAddress ?? wallet?.dcw_address ?? wallet?.address ?? "").trim();
    if (!/^0x[a-fA-F0-9]{40}$/.test(recipient)) {
      return json({ error: "Valid recipientAddress required" }, 400);
    }

    const amountUnits = usdcToUnits(body.amount);
    const mintRecipient = "0x" + recipient.replace(/^0x/, "").toLowerCase().padStart(64, "0");

    const { data: txRow } = await admin.from("transactions").insert({
      user_id: user.id,
      kind: "bridge",
      token: "USDC",
      amount: body.amount,
      counterparty_address: recipient,
      status: "pending",
      metadata: {
        fromChain: body.fromChain,
        toChain: body.toChain,
        srcDomain: src.domain,
        dstDomain: dst.domain,
        stage: "approving",
      },
    }).select().single();

    try {
      // 1) Approve TokenMessenger to spend USDC.
      const approve = await circleFetch("/developer/transactions/contractExecution", {
        method: "POST",
        body: JSON.stringify({
          idempotencyKey: uuid(),
          entitySecretCiphertext: await entitySecretCiphertext(),
          walletId,
          contractAddress: src.usdc,
          abiFunctionSignature: "approve(address,uint256)",
          abiParameters: [src.tokenMessenger, amountUnits],
          feeLevel: "MEDIUM",
        }),
      });
      const approveId = approve?.data?.id;
      if (!approveId) throw new Error("approve: no transaction id returned");

      const approveRes = await pollCircleTx(approveId);
      if (!approveRes.ok) {
        await admin.from("transactions").update({
          status: approveRes.timeout ? "pending" : "failed",
          metadata: { stage: "approve", approve: approveRes.tx ?? null, timeout: !!approveRes.timeout },
        }).eq("id", txRow?.id);
        return json({
          error: approveRes.timeout
            ? "USDC approval still pending on chain. Try again in a moment."
            : "USDC approval failed.",
          transactionId: txRow?.id,
        }, 500);
      }

      // 2) depositForBurn (CCTP V2 standard 4-arg signature on Arc and CCTPV2 chains).
      const burn = await circleFetch("/developer/transactions/contractExecution", {
        method: "POST",
        body: JSON.stringify({
          idempotencyKey: uuid(),
          entitySecretCiphertext: await entitySecretCiphertext(),
          walletId,
          contractAddress: src.tokenMessenger,
          abiFunctionSignature: "depositForBurn(uint256,uint32,bytes32,address)",
          abiParameters: [amountUnits, String(dst.domain), mintRecipient, src.usdc],
          feeLevel: "MEDIUM",
        }),
      });
      const burnId = burn?.data?.id;
      if (!burnId) throw new Error("depositForBurn: no transaction id returned");

      const burnRes = await pollCircleTx(burnId, 24_000);
      const burnTxHash = (burnRes.tx as any)?.txHash ?? null;
      const finalState = burnRes.ok ? "burned" : burnRes.timeout ? "burning" : "burn_failed";

      await admin.from("transactions").update({
        status: burnRes.ok ? "pending" : burnRes.timeout ? "pending" : "failed",
        tx_hash: burnTxHash,
        circle_tx_id: burnId,
        metadata: {
          fromChain: body.fromChain,
          toChain: body.toChain,
          srcDomain: src.domain,
          dstDomain: dst.domain,
          stage: finalState,
          approveId,
          burnId,
          burnTxHash,
          // Mint completion (poll IRIS + receiveMessage on destination) is handled
          // out of band — see circle-bridge-complete.
        },
      }).eq("id", txRow?.id);

      if (!burnRes.ok && !burnRes.timeout) {
        return json({ error: "Bridge burn failed.", transactionId: txRow?.id }, 500);
      }

      return json({
        transactionId: txRow?.id,
        burnTxHash,
        burnId,
        status: "pending",
        note:
          "Burn submitted on source chain. Funds will mint on destination once Circle's attestation is available and receiveMessage is submitted.",
      });
    } catch (sdkErr: any) {
      console.error("circle-bridge SDK error", sdkErr);
      await admin.from("transactions").update({
        status: "failed",
        metadata: { error: String(sdkErr?.message ?? sdkErr) },
      }).eq("id", txRow?.id);
      return json({ error: sdkErr?.message ?? "Bridge submission failed" }, 500);
    }
  } catch (e: any) {
    console.error("circle-bridge", e);
    return json({ error: e.message ?? "Internal error" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
