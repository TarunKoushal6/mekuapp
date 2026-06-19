// Same-chain token swap. Circle's swap is only exposed via App Kit, which uses
// Node-only deps that don't bundle in Supabase Edge Runtime (Deno). We surface
// a clear 501 so the UI can route users to Bridge or Send.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  return new Response(JSON.stringify({
    error:
      "On-chain swap isn't available in this build. Circle's swap SDK isn't compatible with our serverless runtime yet. Use Bridge to move USDC across chains, or Send to transfer to another address.",
  }), {
    status: 501,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
