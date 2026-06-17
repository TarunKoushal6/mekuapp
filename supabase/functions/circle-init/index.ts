// supabase/functions/circle-init/index.ts
// Ensure caller has a Circle user + initialized wallet on Arc Testnet.
// Returns userToken + encryptionKey for the web SDK to set PIN / sign tx,
// and a challengeId if PIN setup is still required.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import { circleFetch, entitySecretCiphertext, uuid, ARC_TESTNET } from "../_shared/circle.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return json({ error: "Unauthorized" }, 401);
    }
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !user) return json({ error: "Unauthorized" }, 401);
    const userId = user.id;

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // 1. ensure wallets row
    const { data: existing } = await admin
      .from("wallets").select("*").eq("user_id", userId).maybeSingle();

    const circleUserId = existing?.circle_user_id ?? userId;

    // 2. ensure circle user exists (idempotent)
    try {
      await circleFetch("/users", {
        method: "POST",
        body: JSON.stringify({ userId: circleUserId }),
      });
    } catch (e: any) {
      // 409 means already exists — ignore
      if (!String(e.message).includes("already")) {
        console.log("create user:", e.message);
      }
    }

    // 3. get user token for client SDK
    const tokenRes = await circleFetch("/users/token", {
      method: "POST",
      body: JSON.stringify({ userId: circleUserId }),
    });
    const userToken: string = tokenRes?.data?.userToken;
    const encryptionKey: string = tokenRes?.data?.encryptionKey;

    // 4. status — if no wallet yet, request initialize challenge.
    // Circle returns 409/155106 if the user was already initialized in a
    // previous attempt (e.g. the local wallets row was wiped or the PIN
    // setup was abandoned). Treat that as "already done" and continue to
    // the wallet-fetch step instead of bubbling a 500.
    let challengeId: string | undefined;
    if (!existing?.wallet_id) {
      try {
        const initRes = await circleFetch("/user/initialize", {
          method: "POST",
          userToken,
          body: JSON.stringify({
            idempotencyKey: uuid(),
            accountType: "EOA",
            blockchains: [ARC_TESTNET],
            entitySecretCiphertext: await entitySecretCiphertext(),
          }),
        });
        challengeId = initRes?.data?.challengeId;
      } catch (e: any) {
        const msg = String(e?.message ?? "");
        const alreadyInit = msg.includes("155106") || msg.includes("already been initialized");
        if (!alreadyInit) throw e;
        console.log("user already initialized — skipping challenge");
      }

      await admin.from("wallets").upsert({
        user_id: userId,
        circle_user_id: circleUserId,
        chain: ARC_TESTNET,
        status: challengeId ? "challenge_pending" : "ready",
      });
    }

    // 5. if wallet should now exist, fetch + persist address.
    // Circle's user-controlled `GET /wallets` is scoped by the X-User-Token
    // header — passing `?userId=` returns "API parameter invalid".
    if (!existing?.address) {
      try {
        const list = await circleFetch(`/wallets`, {
          method: "GET",
          userToken,
        });
        const wallet = list?.data?.wallets?.[0];
        if (wallet) {
          await admin.from("wallets").update({
            wallet_id: wallet.id,
            address: wallet.address,
            status: "ready",
          }).eq("user_id", userId);
        }
      } catch (e) {
        console.log("wallet fetch:", (e as Error).message);
      }
    }

    const { data: walletRow } = await admin
      .from("wallets").select("*").eq("user_id", userId).maybeSingle();

    return json({
      userToken,
      encryptionKey,
      challengeId,
      wallet: walletRow,
      appId: Deno.env.get("CIRCLE_APP_ID") ?? null,
    });
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
