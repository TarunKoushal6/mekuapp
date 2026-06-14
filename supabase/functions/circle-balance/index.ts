// supabase/functions/circle-balance/index.ts
// Returns the caller's USDC balance on Arc Testnet.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import { circleFetch } from "../_shared/circle.ts";

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
    const { data: claims, error } = await supabase.auth.getClaims(token);
    if (error || !claims?.claims) return json({ error: "Unauthorized" }, 401);
    const userId = claims.claims.sub as string;

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { data: wallet } = await admin
      .from("wallets").select("*").eq("user_id", userId).maybeSingle();
    if (!wallet?.wallet_id || !wallet?.circle_user_id) {
      return json({ balances: [], wallet: null });
    }

    // get a userToken for this circle user
    const tokenRes = await circleFetch("/users/token", {
      method: "POST",
      body: JSON.stringify({ userId: wallet.circle_user_id }),
    });
    const userToken = tokenRes?.data?.userToken as string;

    const res = await circleFetch(`/wallets/${wallet.wallet_id}/balances`, {
      method: "GET",
      userToken,
    });

    return json({ wallet, balances: res?.data?.tokenBalances ?? [] });
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
