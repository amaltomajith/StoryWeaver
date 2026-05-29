import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "content-type, authorization");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { prompt } = req.body;
    const POLLINATION_API_KEY = process.env.POLLINATION_API_KEY;
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
    const base64 = Buffer.from(arrayBuf).toString("base64");
    const contentType = imgRes.headers.get("content-type") || "image/jpeg";
    const imageUrl = `data:${contentType};base64,${base64}`;

    return res.status(200).json({ imageUrl });
  } catch (e) {
    console.error("generate-image error:", e);
    return res.status(500).json({ error: e instanceof Error ? e.message : "Unknown error" });
  }
}
