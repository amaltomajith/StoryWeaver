import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StorySetup } from "@/types/story";
import { BookOpen, Sparkles } from "lucide-react";

interface StorySetupFormProps {
  onStart: (setup: StorySetup) => void;
  isLoading: boolean;
}

const moods = ["Epic", "Dark", "Whimsical", "Romantic", "Mysterious", "Horror", "Comedic", "Melancholic"];

export function StorySetupForm({ onStart, isLoading }: StorySetupFormProps) {
  const [prompt, setPrompt] = useState("");
  const [theme, setTheme] = useState("");
  const [characterName, setCharacterName] = useState("");
  const [mood, setMood] = useState("");
  const [totalChapters, setTotalChapters] = useState("4");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    onStart({
      prompt: prompt.trim(),
      theme: theme.trim() || undefined,
      characterName: characterName.trim() || undefined,
      mood: mood || undefined,
      totalChapters: parseInt(totalChapters),
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="w-full max-w-xl mx-auto"
    >
      <div className="text-center mb-10">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6"
        >
          <BookOpen className="w-8 h-8 text-primary" />
        </motion.div>
        <h1 className="text-5xl font-bold text-foreground mb-3 tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
          Story Weaver
        </h1>
        <p className="text-muted-foreground text-lg">
          Create interactive stories powered by AI ✨
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="rounded-2xl border bg-card p-6 space-y-5 shadow-sm">
          <div className="space-y-2">
            <Label htmlFor="prompt" className="text-primary font-semibold">
              Your Story Seed *
            </Label>
            <Textarea
              id="prompt"
              placeholder="A lone astronaut discovers an ancient library floating in the void between galaxies..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[100px] resize-none bg-muted/50 border-border/50 focus:border-primary"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="character" className="text-secondary-foreground">
                Character Name
              </Label>
              <Input
                id="character"
                placeholder="e.g. Elara"
                value={characterName}
                onChange={(e) => setCharacterName(e.target.value)}
                className="bg-muted/50 border-border/50 focus:border-primary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="theme" className="text-secondary-foreground">
                Theme
              </Label>
              <Input
                id="theme"
                placeholder="e.g. Redemption"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="bg-muted/50 border-border/50 focus:border-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-secondary-foreground">Mood</Label>
              <Select value={mood} onValueChange={setMood}>
                <SelectTrigger className="bg-muted/50 border-border/50">
                  <SelectValue placeholder="Auto-detect" />
                </SelectTrigger>
                <SelectContent>
                  {moods.map((m) => (
                    <SelectItem key={m} value={m.toLowerCase()}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-secondary-foreground">Story Length</Label>
              <Select value={totalChapters} onValueChange={setTotalChapters}>
                <SelectTrigger className="bg-muted/50 border-border/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 Chapters</SelectItem>
                  <SelectItem value="4">4 Chapters</SelectItem>
                  <SelectItem value="5">5 Chapters</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isLoading || !prompt.trim()}
          className="w-full h-12 text-lg font-semibold gap-2"
          size="lg"
        >
          <Sparkles className="w-5 h-5" />
          {isLoading ? "Weaving your story..." : "Begin Your Story"}
        </Button>
      </form>
    </motion.div>
  );
}
