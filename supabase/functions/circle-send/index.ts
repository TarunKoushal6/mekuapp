// supabase/functions/circle-send/index.ts
// Creates a USDC transfer challenge on Arc Testnet. Client confirms with PIN.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import { circleFetch, entitySecretCiphertext, uuid } from "../_shared/circle.ts";

interface Body {
  destinationAddress?: string;
  recipientUserId?: string; // resolve to wallet address server-side
  amount: string; // human-readable USDC
  tokenId?: string; // optional, otherwise we fetch USDC token id from balances
  postId?: string;
  commentId?: string;
  kind?: "send" | "tip" | "request";
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
    const { data: claims, error } = await supabase.auth.getClaims(token);
    if (error || !claims?.claims) return json({ error: "Unauthorized" }, 401);
    const userId = claims.claims.sub as string;

    const body = (await req.json()) as Body;
    if (!body?.amount) return json({ error: "amount required" }, 400);

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { data: sender } = await admin
      .from("wallets").select("*").eq("user_id", userId).maybeSingle();
    if (!sender?.wallet_id) return json({ error: "Wallet not initialized" }, 400);

    // Resolve destination address
    let dest = body.destinationAddress;
    if (!dest && body.recipientUserId) {
      const { data: recipient } = await admin
        .from("wallets").select("address").eq("user_id", body.recipientUserId).maybeSingle();
      dest = recipient?.address ?? undefined;
    }
    if (!dest) return json({ error: "destination required" }, 400);

    // Fetch USDC token id from the sender's balances if not supplied
    let tokenId = body.tokenId;
    if (!tokenId) {
      const tk = await circleFetch("/users/token", {
        method: "POST",
        body: JSON.stringify({ userId: sender.circle_user_id }),
      });
      const userToken = tk?.data?.userToken;
      const bals = await circleFetch(`/wallets/${sender.wallet_id}/balances`, {
        method: "GET",
        userToken,
      });
      const usdc = (bals?.data?.tokenBalances ?? []).find(
        (b: any) => b.token?.symbol === "USDC" || b.token?.name === "USD Coin",
      );
      tokenId = usdc?.token?.id;
    }
    if (!tokenId) return json({ error: "USDC token not found in wallet" }, 400);

    const userTokenRes = await circleFetch("/users/token", {
      method: "POST",
      body: JSON.stringify({ userId: sender.circle_user_id }),
    });
    const userToken = userTokenRes?.data?.userToken as string;

    const challenge = await circleFetch("/user/transactions/transfer", {
      method: "POST",
      userToken,
      body: JSON.stringify({
        idempotencyKey: uuid(),
        amounts: [String(body.amount)],
        destinationAddress: dest,
        tokenId,
        walletId: sender.wallet_id,
        feeLevel: "MEDIUM",
        entitySecretCiphertext: await entitySecretCiphertext(),
      }),
    });

    // log pending tx
    const { data: txRow } = await admin.from("transactions").insert({
      user_id: userId,
      kind: body.kind ?? "send",
      token: "USDC",
      amount: body.amount,
      counterparty_user_id: body.recipientUserId ?? null,
      counterparty_address: dest,
      post_id: body.postId ?? null,
      comment_id: body.commentId ?? null,
      circle_tx_id: challenge?.data?.id ?? null,
      status: "pending",
    }).select().single();

    return json({
      challengeId: challenge?.data?.challengeId,
      userToken,
      encryptionKey: userTokenRes?.data?.encryptionKey,
      transactionId: txRow?.id,
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
