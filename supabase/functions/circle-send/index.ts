// Server-signed USDC transfer on Arc Testnet using the caller's DCW.
// No PIN modal — Circle signs with the entity secret on the server.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import { circleFetch, circleStateToStatus, entitySecretCiphertext, getCircleTransaction, uuid } from "../_shared/circle.ts";

interface Body {
  destinationAddress?: string;
  recipientUserId?: string;
  amount: string;
  tokenId?: string;
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
    const { data: claimsData, error: userErr } = await supabase.auth.getClaims(token);
    const user = claimsData?.claims?.sub ? { id: claimsData.claims.sub as string } : null;
    if (userErr || !user) return json({ error: "Unauthorized" }, 401);
    const userId = user.id;

    const body = (await req.json()) as Body;
    const amountNum = Number(body?.amount);
    if (!body?.amount || !Number.isFinite(amountNum) || amountNum <= 0) {
      return json({ error: "amount must be a positive number" }, 400);
    }
    const ALLOWED_KINDS = ["send", "tip", "request"] as const;
    const kind: (typeof ALLOWED_KINDS)[number] =
      (ALLOWED_KINDS as readonly string[]).includes(body.kind ?? "")
        ? (body.kind as (typeof ALLOWED_KINDS)[number])
        : "send";


    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { data: sender } = await admin
      .from("wallets").select("*").eq("user_id", userId).maybeSingle();
    const walletId = sender?.dcw_wallet_id;
    if (!walletId) return json({ error: "DCW wallet not provisioned" }, 400);

    let dest = body.destinationAddress?.trim();
    if (!dest && body.recipientUserId) {
      const { data: recipient } = await admin
        .from("wallets").select("dcw_address,address").eq("user_id", body.recipientUserId).maybeSingle();
      dest = (recipient?.dcw_address ?? recipient?.address ?? undefined)?.trim();
      if (!dest) {
        return json({ error: "Recipient hasn't set up their MEKU wallet yet." }, 400);
      }
    }
    if (!dest) return json({ error: "destination required" }, 400);
    if (!/^0x[a-fA-F0-9]{40}$/.test(dest)) {
      return json({ error: `Invalid destination address: ${dest}` }, 400);
    }
    if (sender?.dcw_address && dest.toLowerCase() === String(sender.dcw_address).toLowerCase()) {
      return json({ error: "Cannot send to your own wallet." }, 400);
    }

    // Look up USDC tokenId from DCW balances (no userToken needed).
    let tokenId = body.tokenId;
    if (!tokenId) {
      const bals = await circleFetch(`/wallets/${walletId}/balances`, { method: "GET" });
      const usdc = (bals?.data?.tokenBalances ?? []).find(
        (b: any) => b.token?.symbol === "USDC" || b.token?.name === "USD Coin",
      );
      tokenId = usdc?.token?.id;
    }
    if (!tokenId) return json({ error: "USDC token not found in wallet" }, 400);

    const tx = await circleFetch("/developer/transactions/transfer", {
      method: "POST",
      body: JSON.stringify({
        idempotencyKey: uuid(),
        entitySecretCiphertext: await entitySecretCiphertext(),
        amounts: [String(body.amount)],
        destinationAddress: dest,
        tokenId,
        walletId,
        feeLevel: "MEDIUM",
      }),
    });

    const circleTxId = tx?.data?.id ?? null;
    const { data: txRow } = await admin.from("transactions").insert({
      user_id: userId,
      kind: body.kind ?? "send",
      token: "USDC",
      amount: body.amount,
      counterparty_user_id: body.recipientUserId ?? null,
      counterparty_address: dest,
      post_id: body.postId ?? null,
      comment_id: body.commentId ?? null,
      circle_tx_id: circleTxId,
      status: "pending",
    }).select().single();

    let finalRow = txRow;
    if (circleTxId && txRow?.id) {
      for (let i = 0; i < 8; i++) {
        await new Promise((resolve) => setTimeout(resolve, i === 0 ? 750 : 1500));
        const latest = await getCircleTransaction(circleTxId);
        const status = circleStateToStatus(latest?.state ?? latest?.status);
        if (status !== "pending") {
          const { data: updated } = await admin.from("transactions").update({
            status,
            tx_hash: latest?.txHash ?? null,
            metadata: { circle: latest },
          }).eq("id", txRow.id).select().single();
          finalRow = updated ?? txRow;
          break;
        }
      }
    }

    return json({
      transactionId: finalRow?.id,
      circleTxId,
      status: finalRow?.status ?? "pending",
      state: tx?.data?.state ?? "INITIATED",
    });
  } catch (e: any) {
    console.error("circle-send", e);
    return json({ error: e.message ?? "Internal error" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
