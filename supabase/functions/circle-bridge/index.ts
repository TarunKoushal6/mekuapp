// Bridge USDC across chains via Circle App Kit (CCTP) using the caller's DCW.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";

interface Body {
  fromChain?: string;
  toChain?: string;
  amount: string;
  recipientAddress?: string;
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
    const { data: { user }, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !user) return json({ error: "Unauthorized" }, 401);

    const body = (await req.json()) as Body;
    if (!body?.amount || Number(body.amount) <= 0) return json({ error: "amount required" }, 400);
    if (!body.fromChain || !body.toChain) return json({ error: "fromChain and toChain required" }, 400);

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: wallet } = await admin
      .from("wallets").select("*").eq("user_id", user.id).maybeSingle();
    const walletId = wallet?.dcw_wallet_id;
    if (!walletId) {
      return json({ error: "DCW wallet not provisioned. Open Wallet to initialize." }, 400);
    }

    const recipient = body.recipientAddress ?? wallet?.dcw_address ?? wallet?.address;
    if (!recipient) return json({ error: "recipientAddress required" }, 400);

    const { data: txRow } = await admin.from("transactions").insert({
      user_id: user.id,
      kind: "bridge",
      token: "USDC",
      amount: body.amount,
      counterparty_address: recipient,
      status: "pending",
    }).select().single();

    try {
      const { AppKit } = await import("npm:@circle-fin/app-kit");
      const { createCircleWalletsAdapter } = await import("npm:@circle-fin/adapter-circle-wallets");

      const apiKey = Deno.env.get("CIRCLE_API_KEY");
      const entitySecret = Deno.env.get("CIRCLE_ENTITY_SECRET");
      if (!apiKey || !entitySecret) {
        await admin.from("transactions").update({ status: "failed" }).eq("id", txRow?.id);
        return json({ error: "Missing CIRCLE_API_KEY / CIRCLE_ENTITY_SECRET" }, 500);
      }

      const adapter = await createCircleWalletsAdapter({
        apiKey,
        entitySecret,
        walletId,
      });

      const kit = new AppKit();
      const result = await kit.bridge({
        from: { adapter, chain: body.fromChain },
        to: { recipientAddress: recipient, chain: body.toChain, useForwarder: true },
        amount: String(body.amount),
      });

      await admin.from("transactions").update({
        status: result.state === "success" ? "confirmed" : "failed",
      }).eq("id", txRow?.id);

      return json({ result, transactionId: txRow?.id });
    } catch (sdkErr: any) {
      await admin.from("transactions").update({ status: "failed" }).eq("id", txRow?.id);
      return json({ error: sdkErr?.message ?? "App Kit bridge failed" }, 500);
    }
  } catch (e: any) {
    console.error("circle-bridge", e);
    return json({ error: e.message ?? "Internal error" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
