// Same-chain token swap via Circle App Kit + Circle Wallets adapter.
// Requires KIT_KEY (App Kit credential). Testnet support is limited to
// chains that App Kit lists for swap; on Arc Testnet swap may be unavailable
// and we surface the SDK error to the UI.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import { AppKit } from "npm:@circle-fin/app-kit";
import { createCircleWalletsAdapter } from "npm:@circle-fin/adapter-circle-wallets";

interface Body {
  chain?: string;
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
}

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
    if (!body?.amountIn || Number(body.amountIn) <= 0) return json({ error: "amountIn required" }, 400);
    if (!body.tokenIn || !body.tokenOut) return json({ error: "tokenIn and tokenOut required" }, 400);
    if (body.tokenIn === body.tokenOut) return json({ error: "tokenIn and tokenOut must differ" }, 400);

    const chain = CHAINS[body.chain ?? "Arc_Testnet"];
    if (!chain) return json({ error: `Unsupported chain ${body.chain}` }, 400);

    const apiKey = Deno.env.get("CIRCLE_API_KEY");
    const entitySecret = Deno.env.get("CIRCLE_ENTITY_SECRET");
    const kitKey = Deno.env.get("KIT_KEY");
    if (!apiKey || !entitySecret) return json({ error: "Circle credentials not configured" }, 500);
    if (!kitKey) return json({ error: "KIT_KEY not configured" }, 500);

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { data: wallet } = await admin
      .from("wallets").select("*").eq("user_id", user.id).maybeSingle();
    const walletId = wallet?.dcw_wallet_id;
    if (!walletId) return json({ error: "Wallet not provisioned." }, 400);

    const { data: txRow } = await admin.from("transactions").insert({
      user_id: user.id,
      kind: "swap",
      token: body.tokenIn,
      amount: body.amountIn,
      status: "pending",
      metadata: { chain, tokenIn: body.tokenIn, tokenOut: body.tokenOut },
    }).select().single();

    try {
      const adapter = createCircleWalletsAdapter({ apiKey, entitySecret, walletId });
      const kit = new AppKit();
      const result = await kit.swap({
        from: { adapter, chain },
        tokenIn: body.tokenIn,
        tokenOut: body.tokenOut,
        amountIn: String(body.amountIn),
        config: { kitKey },
      });

      await admin.from("transactions").update({
        status: "confirmed",
        tx_hash: result?.txHash ?? null,
        metadata: { chain, swap: result },
      }).eq("id", txRow?.id);

      return json({
        transactionId: txRow?.id,
        status: "confirmed",
        txHash: result?.txHash ?? null,
        amountOut: result?.amountOut ?? null,
        result,
      });
    } catch (sdkErr: any) {
      console.error("circle-swap SDK error", sdkErr);
      await admin.from("transactions").update({
        status: "failed",
        metadata: { chain, error: String(sdkErr?.message ?? sdkErr) },
      }).eq("id", txRow?.id);
      return json({ error: sdkErr?.message ?? "Swap failed" }, 500);
    }
  } catch (e: any) {
    console.error("circle-swap", e);
    return json({ error: e.message ?? "Internal error" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
