// supabase/functions/circle-swap/index.ts
// Swap tokens on a single chain via Circle App Kit (LiFi aggregator).
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";

interface Body {
  chain?: string;       // e.g. "Arc_Testnet"
  tokenIn: string;      // symbol
  tokenOut: string;     // symbol
  amountIn: string;
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
    if (!body?.amountIn || Number(body.amountIn) <= 0) return json({ error: "amountIn required" }, 400);
    if (!body.tokenIn || !body.tokenOut) return json({ error: "tokenIn and tokenOut required" }, 400);

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: txRow } = await admin.from("transactions").insert({
      user_id: user.id,
      kind: "swap",
      token: body.tokenIn,
      amount: body.amountIn,
      status: "pending",
    }).select().single();

    try {
      const { AppKit } = await import("npm:@circle-fin/app-kit");
      const { createCircleWalletsAdapter } = await import("npm:@circle-fin/adapter-circle-wallets");

      const apiKey = Deno.env.get("CIRCLE_API_KEY");
      const entitySecret = Deno.env.get("CIRCLE_ENTITY_SECRET");
      const kitKey = Deno.env.get("KIT_KEY");
      const evmWalletId = Deno.env.get("CIRCLE_DCW_EVM_WALLET_ID");
      if (!apiKey || !entitySecret || !kitKey || !evmWalletId) {
        await admin.from("transactions").update({ status: "failed" }).eq("id", txRow?.id);
        return json({
          error: "Swap needs KIT_KEY and a developer-controlled relay wallet. Configure CIRCLE_DCW_EVM_WALLET_ID.",
        }, 501);
      }

      const adapter = await createCircleWalletsAdapter({
        apiKey,
        entitySecret,
        walletId: evmWalletId,
      });

      const kit = new AppKit();
      const result = await kit.swap({
        from: { adapter, chain: body.chain ?? "Arc_Testnet" },
        tokenIn: body.tokenIn,
        tokenOut: body.tokenOut,
        amountIn: String(body.amountIn),
        config: { kitKey },
      });

      await admin.from("transactions").update({
        status: result?.txHash ? "confirmed" : "failed",
        circle_tx_id: result?.txHash ?? null,
      }).eq("id", txRow?.id);

      return json({ result, transactionId: txRow?.id });
    } catch (sdkErr: any) {
      await admin.from("transactions").update({ status: "failed" }).eq("id", txRow?.id);
      return json({ error: sdkErr?.message ?? "App Kit swap failed" }, 500);
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
