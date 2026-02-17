import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { prompt } = await req.json();
    const POLLINATION_API_KEY = Deno.env.get("POLLINATION_API_KEY");
    if (!POLLINATION_API_KEY) throw new Error("POLLINATION_API_KEY not configured");

    const encodedPrompt = encodeURIComponent(
      `Beautiful, atmospheric fantasy book illustration: ${prompt}. Style: rich oil painting with dramatic lighting, detailed textures, cinematic composition.`
    );

    const url = `https://gen.pollinations.ai/image/${encodedPrompt}?model=flux&width=1024&height=576&key=${POLLINATION_API_KEY}&nologo=true`;

    const imgRes = await fetch(url);
    if (!imgRes.ok) {
      console.error("Pollination error:", imgRes.status);
      throw new Error(`Pollination returned ${imgRes.status}`);
    }

    const arrayBuf = await imgRes.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuf)));
    const contentType = imgRes.headers.get("content-type") || "image/jpeg";
    const imageUrl = `data:${contentType};base64,${base64}`;

    return new Response(JSON.stringify({ imageUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-image error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
