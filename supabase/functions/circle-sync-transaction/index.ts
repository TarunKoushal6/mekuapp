// Reconciles a MEKU transaction row with Circle's latest onchain transaction state.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import { circleStateToStatus, getCircleTransaction } from "../_shared/circle.ts";

interface Body { transactionId?: string; circleTxId?: string }

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

    const body = (await req.json().catch(() => ({}))) as Body;
    if (!body.transactionId && !body.circleTxId) return json({ error: "transactionId required" }, 400);

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const query = admin.from("transactions").select("*").eq("user_id", user.id);
    const { data: row } = body.transactionId
      ? await query.eq("id", body.transactionId).maybeSingle()
      : await query.eq("circle_tx_id", body.circleTxId).maybeSingle();
    if (!row) return json({ error: "Transaction not found" }, 404);
    if (!row.circle_tx_id) return json({ transaction: row });

    const circleTx = await getCircleTransaction(row.circle_tx_id);
    const status = circleStateToStatus(circleTx?.state ?? circleTx?.status);
    const patch: Record<string, unknown> = { status };
    if (circleTx?.txHash) patch.tx_hash = circleTx.txHash;
    if (circleTx) patch.metadata = { ...(row.metadata ?? {}), circle: circleTx };

    const { data: updated } = await admin
      .from("transactions")
      .update(patch)
      .eq("id", row.id)
      .select()
      .single();

    return json({ transaction: updated, circleState: circleTx?.state ?? null });
  } catch (e: any) {
    console.error("circle-sync-transaction", e);
    return json({ error: e.message ?? "Internal error" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}