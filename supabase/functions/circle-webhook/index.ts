// Public webhook receiver for Circle notifications.
// Verifies the request originates from Circle before applying any state change:
//   1. If CIRCLE_WEBHOOK_SECRET is configured, require it in X-Webhook-Secret
//      (shared-secret model — set the same value in Circle's webhook config).
//   2. As defense-in-depth, always re-fetch the transaction from Circle's API
//      and derive status from the authoritative response, ignoring the
//      client-supplied state.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import { circleStateToStatus, getCircleTransaction } from "../_shared/circle.ts";

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return mismatch === 0;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  // Shared-secret gate (optional but recommended).
  const configuredSecret = Deno.env.get("CIRCLE_WEBHOOK_SECRET");
  if (configuredSecret) {
    const provided = req.headers.get("X-Webhook-Secret") ?? "";
    if (!safeEqual(provided, configuredSecret)) {
      return new Response("unauthorized", { status: 401 });
    }
  }

  let payload: any = null;
  try {
    payload = await req.json();
  } catch {
    return new Response("bad json", { status: 400 });
  }

  const n = payload?.notification ?? payload ?? {};
  const circleTxId: string | undefined =
    n?.id ?? n?.transactionId ?? n?.transaction?.id ?? payload?.id;

  if (!circleTxId || typeof circleTxId !== "string") {
    return new Response(JSON.stringify({ ok: true, ignored: "no tx id" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Authoritative state: re-fetch from Circle rather than trusting the payload.
  let authoritative: any = null;
  try {
    authoritative = await getCircleTransaction(circleTxId);
  } catch (e) {
    console.error("circle-webhook: verify fetch failed", e);
    return new Response("upstream verification failed", { status: 502 });
  }
  if (!authoritative) {
    return new Response(JSON.stringify({ ok: true, ignored: "unknown tx" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const status = circleStateToStatus(authoritative?.state ?? authoritative?.status);
  const txHash: string | null = authoritative?.txHash ?? null;

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  if (status && status !== "pending") {
    await admin
      .from("transactions")
      .update({ status, tx_hash: txHash, metadata: { circle: authoritative } })
      .eq("circle_tx_id", circleTxId);
  }

  return new Response(JSON.stringify({ ok: true, status, circleTxId }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
