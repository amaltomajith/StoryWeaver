import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { text, voiceId } = await req.json();
    const MURF_API_KEY = Deno.env.get("MURF_API_KEY");
    if (!MURF_API_KEY) throw new Error("MURF_API_KEY is not configured");

    const selectedVoice = voiceId || "en-US-natalie";

    const response = await fetch("https://api.murf.ai/v1/speech/generate", {
      method: "POST",
      headers: {
        "api-key": MURF_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        voiceId: selectedVoice,
        format: "MP3",
        sampleRate: 44100,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Murf.ai error:", response.status, errText);

      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      throw new Error(`Murf.ai returned ${response.status}: ${errText}`);
    }

    const data = await response.json();

    // Murf returns audioFile (URL) or encodedAudio (base64)
    if (data.audioFile) {
      // Fetch the audio from the URL and return it
      const audioRes = await fetch(data.audioFile);
      if (!audioRes.ok) throw new Error("Failed to fetch audio from Murf URL");
      const audioBuffer = await audioRes.arrayBuffer();
      return new Response(audioBuffer, {
        headers: { ...corsHeaders, "Content-Type": "audio/mpeg" },
      });
    } else if (data.encodedAudio) {
      // Decode base64
      const binaryStr = atob(data.encodedAudio);
      const bytes = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }
      return new Response(bytes.buffer, {
        headers: { ...corsHeaders, "Content-Type": "audio/mpeg" },
      });
    } else {
      throw new Error("No audio data in Murf response");
    }
  } catch (e) {
    console.error("murf-tts error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
