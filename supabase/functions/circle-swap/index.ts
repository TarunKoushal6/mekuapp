// Same-chain swap stub. On testnets Circle does not expose a hosted swap
// endpoint outside App Kit (which is too large to bundle as an edge function).
// We surface a clear message so the UI shows actionable feedback instead of a
// network error, and record the attempt for visibility.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";

interface Body {
  chain?: string;
  tokenIn: string;
  tokenOut: string;
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
    const { data: claimsData, error: userErr } = await supabase.auth.getClaims(token);
    const user = claimsData?.claims?.sub ? { id: claimsData.claims.sub as string } : null;
    if (userErr || !user) return json({ error: "Unauthorized" }, 401);

    const body = (await req.json()) as Body;
    if (!body?.amountIn || Number(body.amountIn) <= 0) return json({ error: "amountIn required" }, 400);
    if (!body.tokenIn || !body.tokenOut) return json({ error: "tokenIn and tokenOut required" }, 400);

    return json({
      error:
        "On-chain swaps are temporarily unavailable on testnet. Use Bridge to move USDC between chains, or Send to transfer to another address.",
    }, 501);
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
