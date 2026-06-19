// Same-chain token swap on Arc Testnet via Circle App Kit + DCW adapter.
// Runs entirely server-side using the user's developer-controlled wallet.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import { SwapKit } from "npm:@circle-fin/swap-kit";
import { createCircleWalletsAdapter } from "npm:@circle-fin/adapter-circle-wallets";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const auth = req.headers.get("Authorization");
    if (!auth?.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: auth } } },
    );
    const { data: claims, error: cErr } = await supabase.auth.getClaims(auth.replace("Bearer ", ""));
    if (cErr || !claims?.claims?.sub) return json({ error: "Unauthorized" }, 401);
    const userId = claims.claims.sub as string;

    const body = await req.json().catch(() => ({}));
    const {
      tokenIn, tokenOut, amountIn,
      chain = "Arc_Testnet",
      slippageBps,
      estimateOnly = false,
    } = body ?? {};

    if (!tokenIn || !tokenOut || !amountIn) {
      return json({ error: "tokenIn, tokenOut and amountIn are required" }, 400);
    }
    if (tokenIn === tokenOut) return json({ error: "tokenIn and tokenOut must differ" }, 400);
    if (Number(amountIn) <= 0) return json({ error: "amountIn must be > 0" }, 400);

    const apiKey = Deno.env.get("CIRCLE_API_KEY");
    const entitySecret = Deno.env.get("CIRCLE_ENTITY_SECRET");
    const kitKey = Deno.env.get("KIT_KEY");
    if (!apiKey || !entitySecret || !kitKey) {
      return json({ error: "Server missing Circle credentials" }, 500);
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { data: wallet } = await admin.from("wallets").select("*").eq("user_id", userId).maybeSingle();
    const address = wallet?.dcw_address ?? wallet?.address;
    if (!address) return json({ error: "Wallet not provisioned yet" }, 400);

    const kit = new SwapKit();
    const adapter = createCircleWalletsAdapter({ apiKey, entitySecret });

    const params: any = {
      from: { adapter, chain, address },
      tokenIn,
      tokenOut,
      amountIn: String(amountIn),
      config: {
        kitKey,
        ...(slippageBps ? { slippageBps: Number(slippageBps) } : {}),
        // Circle Wallets SCA swaps require approve, EOA works either way.
        allowanceStrategy: "approve",
      },
    };

    if (estimateOnly) {
      const estimate = await kit.estimate(params);
      return json({ estimate });
    }

    const result = await kit.swap(params);

    // Record transaction (best-effort; don't fail the swap if insert fails)
    try {
      await admin.from("transactions").insert({
        user_id: userId,
        kind: "swap",
        token: tokenIn,
        amount: Number(amountIn),
        chain,
        tx_hash: (result as any)?.txHash ?? null,
        status: "confirmed",
        metadata: { result },
      });
    } catch (e) { console.warn("tx insert failed", e); }

    return json({ result });
  } catch (e: any) {
    console.error("circle-swap", e);
    return json({ error: e?.message ?? "Swap failed" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
