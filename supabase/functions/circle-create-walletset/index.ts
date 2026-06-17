import { circleFetch, entitySecretCiphertext, uuid } from "../_shared/circle.ts";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  try {
    const { name = "MEKU Users" } = await req.json().catch(() => ({}));
    const ciphertext = await entitySecretCiphertext();
    const res = await circleFetch("/developer/walletSets", {
      method: "POST",
      body: JSON.stringify({
        idempotencyKey: uuid(),
        entitySecretCiphertext: ciphertext,
        name,
      }),
    });
    return new Response(JSON.stringify(res), {
      headers: { ...cors, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }
});
