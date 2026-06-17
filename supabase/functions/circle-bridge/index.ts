// supabase/functions/circle-bridge/index.ts
// Bridge USDC across chains via Circle App Kit (CCTP).
// Uses the Circle Wallets adapter (developer-controlled). The user's UCW
// must be funded into the developer-controlled wallet first, OR this is
// invoked from server-managed liquidity. Returns route/tx info or a clear
// configuration error so the UI surfaces actionable state.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";

interface Body {
  fromChain?: string;   // e.g. "Arc_Testnet"
  toChain?: string;     // e.g. "Base_Sepolia"
  amount: string;       // human-readable USDC
  recipientAddress?: string;
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
    const { data: { user }, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !user) return json({ error: "Unauthorized" }, 401);

    const body = (await req.json()) as Body;
    if (!body?.amount || Number(body.amount) <= 0) return json({ error: "amount required" }, 400);
    if (!body.fromChain || !body.toChain) return json({ error: "fromChain and toChain required" }, 400);
    if (!body.recipientAddress) return json({ error: "recipientAddress required" }, 400);

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Log the intent so the UI shows it in Activity immediately.
    const { data: txRow } = await admin.from("transactions").insert({
      user_id: user.id,
      kind: "bridge",
      token: "USDC",
      amount: body.amount,
      counterparty_address: body.recipientAddress,
      status: "pending",
    }).select().single();

    // Attempt to load App Kit. If the developer-controlled wallet isn't
    // configured, return a structured error the client can act on.
    try {
      const { AppKit } = await import("npm:@circle-fin/app-kit");
      const { createCircleWalletsAdapter } = await import("npm:@circle-fin/adapter-circle-wallets");

      const apiKey = Deno.env.get("CIRCLE_API_KEY");
      const entitySecret = Deno.env.get("CIRCLE_ENTITY_SECRET");
      const evmWalletId = Deno.env.get("CIRCLE_DCW_EVM_WALLET_ID");
      if (!apiKey || !entitySecret || !evmWalletId) {
        await admin.from("transactions").update({ status: "failed" }).eq("id", txRow?.id);
        return json({
          error: "Bridge needs a developer-controlled relay wallet. Set CIRCLE_DCW_EVM_WALLET_ID in secrets.",
        }, 501);
      }

      const adapter = await createCircleWalletsAdapter({
        apiKey,
        entitySecret,
        walletId: evmWalletId,
      });

      const kit = new AppKit();
      const result = await kit.bridge({
        from: { adapter, chain: body.fromChain },
        to: { recipientAddress: body.recipientAddress, chain: body.toChain, useForwarder: true },
        amount: String(body.amount),
      });

      await admin.from("transactions").update({
        status: result.state === "success" ? "confirmed" : "failed",
      }).eq("id", txRow?.id);

      return json({ result, transactionId: txRow?.id });
    } catch (sdkErr: any) {
      await admin.from("transactions").update({ status: "failed" }).eq("id", txRow?.id);
      return json({ error: sdkErr?.message ?? "App Kit bridge failed" }, 500);
    }
  } catch (e: any) {
    console.error(e);
    return json({ error: e.message ?? "Internal error" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
