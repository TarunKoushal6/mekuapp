// Same-chain swap. Circle's swap SDKs (App Kit / Swap Kit) cannot be bundled
// into the Deno edge runtime (their viem-heavy graph times out the bundler).
// This function proxies to an external Node service that runs @circle-fin/swap-kit
// with the Circle Wallets adapter. Set SWAP_SERVICE_URL + SWAP_SHARED_SECRET to enable.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";

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

    const SWAP_URL = Deno.env.get("SWAP_SERVICE_URL");
    const SWAP_SECRET = Deno.env.get("SWAP_SHARED_SECRET");
    if (!SWAP_URL || !SWAP_SECRET) {
      return json({
        error: "Swap service not configured. Deploy the swap node service and set SWAP_SERVICE_URL + SWAP_SHARED_SECRET.",
      }, 501);
    }

    const body = await req.json().catch(() => ({}));
    const { tokenIn, tokenOut, amountIn, chain = "Arc_Testnet", estimateOnly = false } = body ?? {};
    if (!tokenIn || !tokenOut || !amountIn) return json({ error: "tokenIn, tokenOut, amountIn required" }, 400);

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { data: wallet } = await admin.from("wallets").select("*").eq("user_id", userId).maybeSingle();
    const address = wallet?.dcw_address ?? wallet?.address;
    if (!address) return json({ error: "Wallet not provisioned" }, 400);

    const upstream = await fetch(`${SWAP_URL.replace(/\/$/, "")}/swap`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Shared-Secret": SWAP_SECRET },
      body: JSON.stringify({ userId, address, chain, tokenIn, tokenOut, amountIn, estimateOnly }),
    });
    const data = await upstream.json().catch(() => ({}));
    if (!upstream.ok) return json({ error: data?.error ?? `Swap service ${upstream.status}` }, upstream.status);

    if (!estimateOnly && data?.result) {
      try {
        await admin.from("transactions").insert({
          user_id: userId, kind: "swap", token: tokenIn,
          amount: Number(amountIn), chain,
          tx_hash: data.result?.txHash ?? null,
          status: "confirmed", metadata: { result: data.result },
        });
      } catch (e) { console.warn("tx insert failed", e); }
    }

    return json(data);
  } catch (e: any) {
    console.error("circle-swap", e);
    return json({ error: e?.message ?? "Swap failed" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status, headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
