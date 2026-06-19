// Bridge USDC across chains using Circle App Kit + the Circle Wallets adapter.
// The Forwarding Service handles attestation fetch + destination mint, so we
// don't need a destination wallet or IRIS polling.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import { AppKit } from "npm:@circle-fin/app-kit";
import { createCircleWalletsAdapter } from "npm:@circle-fin/adapter-circle-wallets";

interface Body {
  fromChain?: string;
  toChain?: string;
  amount: string;
  recipientAddress?: string;
}

// Map UI keys -> App Kit chain identifiers.
const CHAINS: Record<string, string> = {
  Arc_Testnet: "Arc_Testnet",
  Base_Sepolia: "Base_Sepolia",
  Ethereum_Sepolia: "Ethereum_Sepolia",
  Arbitrum_Sepolia: "Arbitrum_Sepolia",
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
    const { data: claimsData, error: userErr } = await supabase.auth.getClaims(token);
    const user = claimsData?.claims?.sub ? { id: claimsData.claims.sub as string } : null;
    if (userErr || !user) return json({ error: "Unauthorized" }, 401);

    const body = (await req.json()) as Body;
    if (!body?.amount || Number(body.amount) <= 0) return json({ error: "amount required" }, 400);
    if (!body.fromChain || !body.toChain) return json({ error: "fromChain and toChain required" }, 400);

    const fromChain = CHAINS[body.fromChain];
    const toChain = CHAINS[body.toChain];
    if (!fromChain || !toChain) {
      return json({ error: `Unsupported chain pair ${body.fromChain} -> ${body.toChain}` }, 400);
    }
    if (fromChain === toChain) return json({ error: "fromChain and toChain must differ" }, 400);

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { data: wallet } = await admin
      .from("wallets").select("*").eq("user_id", user.id).maybeSingle();
    const walletId = wallet?.dcw_wallet_id;
    if (!walletId) {
      return json({ error: "Wallet not provisioned. Open Wallet to initialize." }, 400);
    }
    const recipient = (body.recipientAddress ?? wallet?.dcw_address ?? wallet?.address ?? "").trim();
    if (!/^0x[a-fA-F0-9]{40}$/.test(recipient)) {
      return json({ error: "Valid recipientAddress required" }, 400);
    }

    const apiKey = Deno.env.get("CIRCLE_API_KEY");
    const entitySecret = Deno.env.get("CIRCLE_ENTITY_SECRET");
    if (!apiKey || !entitySecret) return json({ error: "Circle credentials not configured" }, 500);

    const { data: txRow } = await admin.from("transactions").insert({
      user_id: user.id,
      kind: "bridge",
      token: "USDC",
      amount: body.amount,
      counterparty_address: recipient,
      status: "pending",
      metadata: { fromChain, toChain },
    }).select().single();

    try {
      const adapter = createCircleWalletsAdapter({ apiKey, entitySecret, walletId });
      const kit = new AppKit();

      const result = await kit.bridge({
        from: { adapter, chain: fromChain },
        to: { recipientAddress: recipient, chain: toChain, useForwarder: true },
        amount: String(body.amount),
      });

      const burnStep = (result?.steps ?? []).find((s: any) => s.name === "burn");
      const mintStep = (result?.steps ?? []).find((s: any) => s.name === "mint");
      const txHash = mintStep?.txHash ?? burnStep?.txHash ?? null;
      const status = result?.state === "success" ? "confirmed"
        : result?.state === "error" ? "failed" : "pending";

      await admin.from("transactions").update({
        status,
        tx_hash: txHash,
        metadata: { fromChain, toChain, bridge: result },
      }).eq("id", txRow?.id);

      if (status === "failed") {
        const failed = (result?.steps ?? []).find((s: any) => s.state === "error");
        return json({
          transactionId: txRow?.id,
          status,
          error: failed?.error ?? "Bridge failed",
          result,
        }, 500);
      }

      return json({ transactionId: txRow?.id, status, txHash, result });
    } catch (sdkErr: any) {
      console.error("circle-bridge SDK error", sdkErr);
      await admin.from("transactions").update({
        status: "failed",
        metadata: { fromChain, toChain, error: String(sdkErr?.message ?? sdkErr) },
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
