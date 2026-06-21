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
    const { data: claimsData, error: userErr } = await supabase.auth.getClaims(token);
    const user = claimsData?.claims?.sub ? { id: claimsData.claims.sub as string } : null;
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

    // Best-effort: sync inbound Circle transactions (e.g. faucet drops) into
    // our own `transactions` table so the Activity tab reflects them.
    try {
      const list = await circleFetch(
        `/transactions?walletIds=${walletId}&order=DESC&pageSize=25`,
        { method: "GET", ...(userToken ? { userToken } : {}) },
      );
      const txs: any[] = list?.data?.transactions ?? [];
      const myAddr = (wallet?.address ?? "").toLowerCase();
      for (const t of txs) {
        const dest = (t?.destinationAddress ?? "").toLowerCase();
        const src  = (t?.sourceAddress ?? "").toLowerCase();
        // Only inbound (we are destination, not source).
        if (!myAddr || dest !== myAddr || src === myAddr) continue;
        const circleTxId = t?.id;
        if (!circleTxId) continue;
        const { data: existing } = await admin
          .from("transactions").select("id").eq("circle_tx_id", circleTxId).maybeSingle();
        if (existing) continue;
        const amount = String(
          t?.amounts?.[0] ?? t?.amount ?? "0",
        );
        const tokenSymbol = t?.tokenSymbol ?? t?.token?.symbol ?? "USDC";
        const status =
          ["COMPLETE","CONFIRMED","SUCCESS"].includes(String(t?.state ?? "").toUpperCase())
            ? "confirmed"
            : ["FAILED","DENIED","CANCELLED"].includes(String(t?.state ?? "").toUpperCase())
              ? "failed"
              : "pending";
        await admin.from("transactions").insert({
          user_id: user.id,
          kind: "receive",
          token: tokenSymbol,
          amount: Number(amount) || 0,
          counterparty_address: t?.sourceAddress ?? null,
          chain: t?.blockchain ?? "ARC-TESTNET",
          tx_hash: t?.txHash ?? null,
          status,
          circle_tx_id: circleTxId,
          metadata: { source: "circle-balance-sync" },
        });
      }
    } catch (e) {
      console.warn("receive sync skipped", e);
    }

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
