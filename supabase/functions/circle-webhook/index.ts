// Public webhook receiver for Circle notifications.
// Marks transactions.status = "confirmed" / "failed" when Circle reports
// terminal state for a previously created transfer.
//
// Register the public URL of this function in Circle's notification settings.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  let payload: any = null;
  try {
    payload = await req.json();
  } catch {
    return new Response("bad json", { status: 400 });
  }

  // Circle sends a {notificationType, notification: {...}} envelope. Also
  // accept a flat shape for testing.
  const n = payload?.notification ?? payload ?? {};
  const circleTxId: string | undefined =
    n?.id ?? n?.transactionId ?? n?.transaction?.id ?? payload?.id;
  const state: string | undefined = (
    n?.state ?? n?.status ?? n?.transaction?.state ?? payload?.state ?? ""
  ).toString().toUpperCase();
  const txHash: string | undefined =
    n?.txHash ?? n?.transaction?.txHash ?? null;

  if (!circleTxId) {
    return new Response(JSON.stringify({ ok: true, ignored: "no tx id" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const TERMINAL_OK = new Set(["COMPLETE", "CONFIRMED", "SUCCESS"]);
  const TERMINAL_FAIL = new Set(["FAILED", "DENIED", "CANCELLED"]);
  let status: string | null = null;
  if (TERMINAL_OK.has(state)) status = "confirmed";
  else if (TERMINAL_FAIL.has(state)) status = "failed";

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  if (status) {
    await admin
      .from("transactions")
      .update({ status, tx_hash: txHash ?? undefined })
      .eq("circle_tx_id", circleTxId);
  }

  return new Response(JSON.stringify({ ok: true, status, circleTxId }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
