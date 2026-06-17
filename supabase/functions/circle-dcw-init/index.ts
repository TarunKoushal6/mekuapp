// Provisions a per-user Developer-Controlled Wallet (DCW) on Arc Testnet
// inside the configured Wallet Set. Idempotent — returns existing wallet if
// already provisioned.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import { circleFetch, entitySecretCiphertext, uuid, ARC_TESTNET } from "../_shared/circle.ts";

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

    const walletSetId = Deno.env.get("CIRCLE_WALLET_SET_ID");
    if (!walletSetId) return json({ error: "CIRCLE_WALLET_SET_ID not configured" }, 500);

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: existing } = await admin
      .from("wallets").select("*").eq("user_id", user.id).maybeSingle();

    if (existing?.dcw_wallet_id && existing?.dcw_address) {
      return json({ wallet: existing });
    }

    // Create a new DCW wallet on Arc Testnet for this user
    const refId = `meku-${user.id}`;
    const res = await circleFetch("/developer/wallets", {
      method: "POST",
      body: JSON.stringify({
        idempotencyKey: uuid(),
        entitySecretCiphertext: await entitySecretCiphertext(),
        blockchains: [ARC_TESTNET],
        walletSetId,
        count: 1,
        accountType: "EOA",
        metadata: [{ name: `MEKU ${user.id.slice(0, 8)}`, refId }],
      }),
    });

    const w = res?.data?.wallets?.[0];
    if (!w?.id) {
      return json({ error: "Circle did not return a wallet", raw: res }, 500);
    }

    const upsert = {
      user_id: user.id,
      circle_user_id: existing?.circle_user_id ?? user.id,
      chain: ARC_TESTNET,
      status: "ready",
      custody: "DCW",
      dcw_wallet_id: w.id,
      dcw_address: w.address,
      // Mirror DCW into primary fields so the rest of the app uses DCW
      wallet_id: w.id,
      address: w.address,
    };
    await admin.from("wallets").upsert(upsert, { onConflict: "user_id" });

    const { data: walletRow } = await admin
      .from("wallets").select("*").eq("user_id", user.id).maybeSingle();

    return json({ wallet: walletRow });
  } catch (e: any) {
    console.error("circle-dcw-init", e);
    return json({ error: e.message ?? "Internal error" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
