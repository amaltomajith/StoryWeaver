import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StorySetup } from "@/types/story";
import { BookOpen, Sparkles, Wand2 } from "lucide-react";

interface StorySetupFormProps {
  onStart: (setup: StorySetup) => void;
  isLoading: boolean;
}

const moods = [
  "Epic",
  "Dark",
  "Whimsical",
  "Romantic",
  "Mysterious",
  "Horror",
  "Comedic",
  "Melancholic",
];

const EXAMPLE_PROMPTS = [
  "A lone astronaut discovers an ancient library floating in the void between galaxies…",
  "A blind cartographer is hired to map a kingdom that only exists in dreams…",
  "The last dragon egg hatches in a world where magic has been outlawed for centuries…",
];

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

  const fillExample = () => {
    const ex = EXAMPLE_PROMPTS[Math.floor(Math.random() * EXAMPLE_PROMPTS.length)];
    setPrompt(ex);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="w-full max-w-xl mx-auto"
    >
      {/* Hero */}
      <div className="text-center mb-10">
        <motion.div
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.15, type: "spring", stiffness: 220, damping: 14 }}
          className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 mb-6 shadow-lg shadow-primary/10"
        >
          <BookOpen className="w-9 h-9 text-primary" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-5xl md:text-6xl font-bold text-foreground mb-3 tracking-tight"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Story Weaver
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
          className="text-muted-foreground text-lg"
        >
          Craft interactive narratives powered by AI ✨
        </motion.p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-2xl border border-border/70 bg-card p-6 space-y-5 shadow-sm"
        >
          {/* Prompt */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="prompt" className="text-primary font-semibold text-sm">
                Your Story Seed *
              </Label>
              <button
                type="button"
                onClick={fillExample}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                <Wand2 className="w-3 h-3" />
                Inspire me
              </button>
            </div>
            <Textarea
              id="prompt"
              placeholder="Describe your story idea…"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[110px] resize-none bg-muted/40 border-border/50 focus:border-primary/60 focus-visible:ring-primary/20 transition-colors"
              required
            />
          </div>

          {/* Character + Theme */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="character" className="text-secondary-foreground text-sm">
                Character Name
              </Label>
              <Input
                id="character"
                placeholder="e.g. Elara"
                value={characterName}
                onChange={(e) => setCharacterName(e.target.value)}
                className="bg-muted/40 border-border/50 focus:border-primary/60 focus-visible:ring-primary/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="theme" className="text-secondary-foreground text-sm">
                Theme
              </Label>
              <Input
                id="theme"
                placeholder="e.g. Redemption"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="bg-muted/40 border-border/50 focus:border-primary/60 focus-visible:ring-primary/20"
              />
            </div>
          </div>

          {/* Mood + Length */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-secondary-foreground text-sm">Mood</Label>
              <Select value={mood} onValueChange={setMood}>
                <SelectTrigger className="bg-muted/40 border-border/50">
                  <SelectValue placeholder="Auto-detect" />
                </SelectTrigger>
                <SelectContent>
                  {moods.map((m) => (
                    <SelectItem key={m} value={m.toLowerCase()}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-secondary-foreground text-sm">Story Length</Label>
              <Select value={totalChapters} onValueChange={setTotalChapters}>
                <SelectTrigger className="bg-muted/40 border-border/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 Chapters</SelectItem>
                  <SelectItem value="4">4 Chapters</SelectItem>
                  <SelectItem value="5">5 Chapters</SelectItem>
                  <SelectItem value="6">6 Chapters</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
        >
          <Button
            type="submit"
            disabled={isLoading || !prompt.trim()}
            className="w-full h-12 text-base font-semibold gap-2 shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-shadow"
            size="lg"
          >
            <Sparkles className="w-4 h-4" />
            {isLoading ? "Weaving your story…" : "Begin Your Story"}
          </Button>
        </motion.div>
      </form>
    </motion.div>
  );
}
