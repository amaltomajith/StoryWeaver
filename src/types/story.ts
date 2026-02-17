export interface StoryChapter {
  title: string;
  content: string;
  imagePrompt: string;
  imageUrl?: string;
  choices: string[];
  chosenOption?: string;
}

export interface StorySetup {
  prompt: string;
  theme?: string;
  characterName?: string;
  mood?: string;
  totalChapters: number;
}
