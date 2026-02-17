import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { prompt, theme, characterName, mood, previousStory, chosenOption, chapterNumber, totalChapters } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const isFirstChapter = chapterNumber === 1;
    const isFinalChapter = chapterNumber >= totalChapters;

    let systemPrompt = `You are a master storyteller creating an interactive branching narrative. Write in vivid, immersive prose with rich sensory details. Each chapter should be 150-250 words.

Style guidelines:
- Write in second person ("You step into the darkness...")
- Use evocative, literary language
- End each chapter at a moment of tension or decision
- Maintain consistency with previous chapters

You MUST respond with valid JSON in this exact format:
{
  "title": "Chapter title",
  "content": "The story text for this chapter...",
  "imagePrompt": "A detailed visual description for generating an illustration of the key scene in this chapter. Be specific about lighting, mood, composition, and style. Always describe it as a fantasy book illustration.",
  "choices": ["Choice 1 text", "Choice 2 text", "Choice 3 text"]
}`;

    if (isFinalChapter) {
      systemPrompt += `\n\nThis is the FINAL chapter. Bring the story to a satisfying, dramatic conclusion. The "choices" array should be EMPTY [].`;
    } else {
      systemPrompt += `\n\nProvide exactly 2-3 meaningful choices that branch the story in genuinely different directions.`;
    }

    let userMessage = "";
    if (isFirstChapter) {
      userMessage = `Create the opening chapter of a story based on this prompt: "${prompt}"`;
      if (theme) userMessage += `\nTheme: ${theme}`;
      if (characterName) userMessage += `\nMain character name: ${characterName}`;
      if (mood) userMessage += `\nMood/Tone: ${mood}`;
      userMessage += `\nThis story will have ${totalChapters} chapters total.`;
    } else {
      userMessage = `Continue the story. Here's what happened so far:\n\n${previousStory}\n\nThe reader chose: "${chosenOption}"\n\nThis is chapter ${chapterNumber} of ${totalChapters}. Write the next chapter based on this choice.`;
    }

    const reqBody = JSON.stringify({
      model: "openai/gpt-5-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
    });
    console.log("Sending request to AI gateway, model: openai/gpt-5-mini");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: reqBody,
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please wait a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content || "";
    
    // Strip markdown code fences if present
    content = content.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();

    // Find JSON boundaries
    const jsonStart = content.search(/[\{\[]/);
    const jsonEnd = content.lastIndexOf(jsonStart !== -1 && content[jsonStart] === '[' ? ']' : '}');
    if (jsonStart === -1 || jsonEnd === -1) throw new Error("No JSON found in AI response");
    content = content.substring(jsonStart, jsonEnd + 1);

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (_e) {
      // Remove control characters and retry
      content = content
        .replace(/[\x00-\x1F\x7F]/g, " ")
        .replace(/,\s*}/g, "}")
        .replace(/,\s*]/g, "]");
      parsed = JSON.parse(content);
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-story error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
