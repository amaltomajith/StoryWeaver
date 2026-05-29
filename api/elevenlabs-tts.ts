import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "content-type, authorization");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { text, voiceId } = req.body;
    const MURF_API_KEY = process.env.MURF_API_KEY;
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
        return res.status(429).json({ error: "Rate limit exceeded, please try again later." });
      }

      throw new Error(`Murf.ai returned ${response.status}: ${errText}`);
    }

    const data = await response.json();

    // Murf returns audioFile (URL) or encodedAudio (base64)
    if (data.audioFile) {
      // Fetch the audio from the URL and stream it back
      const audioRes = await fetch(data.audioFile);
      if (!audioRes.ok) throw new Error("Failed to fetch audio from Murf URL");
      const audioBuffer = await audioRes.arrayBuffer();
      res.setHeader("Content-Type", "audio/mpeg");
      return res.status(200).send(Buffer.from(audioBuffer));
    } else if (data.encodedAudio) {
      // Decode base64 and send raw bytes
      const audioBuffer = Buffer.from(data.encodedAudio, "base64");
      res.setHeader("Content-Type", "audio/mpeg");
      return res.status(200).send(audioBuffer);
    } else {
      throw new Error("No audio data in Murf response");
    }
  } catch (e) {
    console.error("murf-tts error:", e);
    return res.status(500).json({ error: e instanceof Error ? e.message : "Unknown error" });
  }
}
