import { StorySetup, StoryChapter } from "@/types/story";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const headers = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${SUPABASE_KEY}`,
  apikey: SUPABASE_KEY,
};

export async function generateStoryChapter(
  setup: StorySetup,
  chapterNumber: number,
  previousStory?: string,
  chosenOption?: string
): Promise<StoryChapter> {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/generate-story`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      prompt: setup.prompt,
      theme: setup.theme,
      characterName: setup.characterName,
      mood: setup.mood,
      chapterNumber,
      totalChapters: setup.totalChapters,
      previousStory,
      chosenOption,
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to generate story");
  }

  return res.json();
}

export async function generateImage(prompt: string): Promise<string> {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/generate-image`, {
    method: "POST",
    headers,
    body: JSON.stringify({ prompt }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to generate image");
  }

  const data = await res.json();
  return data.imageUrl;
}
