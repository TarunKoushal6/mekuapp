import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import { verifyWalletPin } from "../_shared/circle.ts";

const SUPPORTED_CHAINS = new Set(["Arc_Testnet"]);
const SUPPORTED_TOKENS = new Set(["USDC", "EURC"]);

function validAmount(value: unknown) {
  const amount = String(value ?? "").trim();
  if (!/^\d+(\.\d{1,6})?$/.test(amount)) return null;
  const n = Number(amount);
  if (!Number.isFinite(n) || n <= 0) return null;
  return amount;
}

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
    const chain = String(body?.chain ?? "Arc_Testnet");
    const tokenIn = String(body?.tokenIn ?? "").toUpperCase();
    const tokenOut = String(body?.tokenOut ?? "").toUpperCase();
    const amountIn = validAmount(body?.amountIn);
    const estimateOnly = body?.estimateOnly === true;
    const slippageBps = Number.isInteger(body?.slippageBps) ? Number(body.slippageBps) : 50;

    if (!SUPPORTED_CHAINS.has(chain)) return json({ error: "Unsupported swap chain" }, 400);
    if (!SUPPORTED_TOKENS.has(tokenIn) || !SUPPORTED_TOKENS.has(tokenOut)) return json({ error: "Unsupported swap token" }, 400);
    if (tokenIn === tokenOut) return json({ error: "Choose two different tokens to swap" }, 400);
    if (!amountIn) return json({ error: "amountIn must be a positive number with up to 6 decimals" }, 400);
    if (!Number.isInteger(slippageBps) || slippageBps < 10 || slippageBps > 500) {
      return json({ error: "slippageBps must be between 10 and 500" }, 400);
    }

    const SWAP_URL = Deno.env.get("SWAP_SERVICE_URL");
    const SWAP_SECRET = Deno.env.get("SWAP_SHARED_SECRET");
    if (!SWAP_URL || !SWAP_SECRET) {
      return json({
        error: "Swap service not configured. Deploy the MEKU swap service and set SWAP_SERVICE_URL + SWAP_SHARED_SECRET.",
      }, 501);
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    if (!estimateOnly) {
      const pinErr = await verifyWalletPin(admin, userId, { pin: body?.pin, pinHash: body?.pinHash });
      if (pinErr) return json({ error: pinErr }, 401);
    }

    const { data: wallet } = await admin.from("wallets").select("*").eq("user_id", userId).maybeSingle();
    const address = wallet?.dcw_address ?? wallet?.address;
    if (!address) return json({ error: "Wallet not provisioned" }, 400);

    const upstream = await fetch(`${SWAP_URL.replace(/\/$/, "")}/swap`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Shared-Secret": SWAP_SECRET },
      body: JSON.stringify({ userId, address, chain, tokenIn, tokenOut, amountIn, estimateOnly, slippageBps }),
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
