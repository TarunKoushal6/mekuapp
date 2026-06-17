// Returns the caller's token balances. Prefers DCW wallet when present.
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
    const { data: { user }, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !user) return json({ error: "Unauthorized" }, 401);

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { data: wallet } = await admin
      .from("wallets").select("*").eq("user_id", user.id).maybeSingle();

    const walletId = wallet?.dcw_wallet_id ?? wallet?.wallet_id;
    if (!walletId) return json({ balances: [], wallet: wallet ?? null });

    // DCW balances use API-key auth (no X-User-Token); UCW also works the same.
    const useUserToken = !wallet?.dcw_wallet_id && wallet?.circle_user_id;
    let userToken: string | undefined;
    if (useUserToken) {
      const tk = await circleFetch("/users/token", {
        method: "POST",
        body: JSON.stringify({ userId: wallet.circle_user_id }),
      });
      userToken = tk?.data?.userToken;
    }

    const res = await circleFetch(`/wallets/${walletId}/balances`, {
      method: "GET",
      ...(userToken ? { userToken } : {}),
    });

    return json({ wallet, balances: res?.data?.tokenBalances ?? [] });
  } catch (e: any) {
    console.error("circle-balance", e);
    return json({ error: e.message ?? "Internal error" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
