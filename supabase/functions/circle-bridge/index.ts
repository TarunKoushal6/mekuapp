// Bridge USDC across chains via Circle W3S REST (CCTP).
// Submits a contract execution (TokenMessenger.depositForBurn) using the
// caller's developer-controlled wallet, then records a pending transaction
// row. The client polls circle-sync-transaction to update the final status.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import {
  circleFetch,
  entitySecretCiphertext,
  uuid,
} from "../_shared/circle.ts";

interface Body {
  fromChain?: string;
  toChain?: string;
  amount: string;
  recipientAddress?: string;
}

// CCTP v2 TokenMessenger + USDC addresses per Circle testnet docs.
const CHAINS: Record<string, {
  blockchain: string;
  usdc: string;
  tokenMessenger: string;
  destinationDomain: number;
}> = {
  Arc_Testnet: {
    blockchain: "ARC-TESTNET",
    usdc: "0x5fd84259d66Cd46123540766Be93DFE6D43130D7",
    tokenMessenger: "0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA",
    destinationDomain: 13,
  },
  Base_Sepolia: {
    blockchain: "BASE-SEPOLIA",
    usdc: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
    tokenMessenger: "0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA",
    destinationDomain: 6,
  },
  Ethereum_Sepolia: {
    blockchain: "ETH-SEPOLIA",
    usdc: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
    tokenMessenger: "0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA",
    destinationDomain: 0,
  },
  Arbitrum_Sepolia: {
    blockchain: "ARB-SEPOLIA",
    usdc: "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d",
    tokenMessenger: "0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA",
    destinationDomain: 3,
  },
};

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
    const { data: { user }, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !user) return json({ error: "Unauthorized" }, 401);

    const body = (await req.json()) as Body;
    if (!body?.amount || Number(body.amount) <= 0) return json({ error: "amount required" }, 400);
    if (!body.fromChain || !body.toChain) return json({ error: "fromChain and toChain required" }, 400);

    const src = CHAINS[body.fromChain];
    const dst = CHAINS[body.toChain];
    if (!src || !dst) return json({ error: `Unsupported chain pair ${body.fromChain} -> ${body.toChain}` }, 400);

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: wallet } = await admin
      .from("wallets").select("*").eq("user_id", user.id).maybeSingle();
    const walletId = wallet?.dcw_wallet_id;
    if (!walletId) {
      return json({ error: "DCW wallet not provisioned. Open Wallet to initialize." }, 400);
    }
    const recipient = body.recipientAddress ?? wallet?.dcw_address ?? wallet?.address;
    if (!recipient) return json({ error: "recipientAddress required" }, 400);

    const { data: txRow } = await admin.from("transactions").insert({
      user_id: user.id,
      kind: "bridge",
      token: "USDC",
      amount: body.amount,
      counterparty_address: recipient,
      status: "pending",
    }).select().single();

    try {
      // amount in USDC units (6 decimals)
      const amountUnits = BigInt(Math.round(Number(body.amount) * 1_000_000)).toString();
      const mintRecipientBytes32 = "0x" + recipient.replace(/^0x/, "").toLowerCase().padStart(64, "0");

      // depositForBurn(uint256 amount, uint32 destinationDomain, bytes32 mintRecipient, address burnToken)
      const ciphertext = await entitySecretCiphertext();
      const exec = await circleFetch("/developer/transactions/contractExecution", {
        method: "POST",
        body: JSON.stringify({
          idempotencyKey: uuid(),
          entitySecretCiphertext: ciphertext,
          walletId,
          contractAddress: src.tokenMessenger,
          abiFunctionSignature: "depositForBurn(uint256,uint32,bytes32,address)",
          abiParameters: [amountUnits, String(dst.destinationDomain), mintRecipientBytes32, src.usdc],
          feeLevel: "MEDIUM",
        }),
      });

      const circleTxId = exec?.data?.id ?? exec?.id ?? null;
      await admin.from("transactions").update({ circle_tx_id: circleTxId }).eq("id", txRow?.id);

      return json({ transactionId: txRow?.id, circleTxId, status: "pending" });
    } catch (sdkErr: any) {
      await admin.from("transactions").update({ status: "failed" }).eq("id", txRow?.id);
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
