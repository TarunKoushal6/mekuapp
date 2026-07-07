import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import { AppKit } from "npm:@circle-fin/app-kit";
import { createCircleWalletsAdapter } from "npm:@circle-fin/adapter-circle-wallets";

const kit = new AppKit();

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

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { data: wallet } = await admin.from("wallets").select("*").eq("user_id", userId).maybeSingle();
    const address = wallet?.dcw_address ?? wallet?.address;
    if (!address) return json({ error: "Wallet not provisioned" }, 400);

    const apiKey = Deno.env.get("CIRCLE_API_KEY");
    const entitySecret = Deno.env.get("CIRCLE_ENTITY_SECRET");
    const kitKey = Deno.env.get("KIT_KEY");
    if (!apiKey || !entitySecret || !kitKey) return json({ error: "Swap credentials are not configured" }, 500);

    const adapter = createCircleWalletsAdapter({ apiKey, entitySecret });
    const swapParams = {
      from: { adapter, chain, address },
      tokenIn,
      tokenOut,
      amountIn,
      config: { kitKey, slippageBps, allowanceStrategy: "approve" },
    } as any;

    const result = estimateOnly
      ? await kit.estimateSwap(swapParams)
      : await kit.swap(swapParams);
    const data = estimateOnly ? { estimate: result } : { result };

    if (!estimateOnly && result) {
      try {
        await admin.from("transactions").insert({
          user_id: userId, kind: "swap", token: tokenIn,
          amount: Number(amountIn), chain,
          tx_hash: (result as any)?.txHash ?? null,
          status: "confirmed", metadata: { result },
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
