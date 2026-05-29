import { useState, useRef, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { StorySetup, StoryChapter } from "@/types/story";
import { generateStoryChapter, generateImage } from "@/lib/story-api";
import { StorySetupForm } from "@/components/StorySetupForm";
import { StoryChapterView } from "@/components/StoryChapterView";
import { StoryChoices } from "@/components/StoryChoices";
import { StoryEnd } from "@/components/StoryEnd";
import { StoryProgress } from "@/components/StoryProgress";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useSpeech } from "@/hooks/use-speech";
import { AnimatePresence, motion } from "framer-motion";

const Index = () => {
  const [setup, setSetup] = useState<StorySetup | null>(null);
  const [chapters, setChapters] = useState<StoryChapter[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [imageLoadingIdx, setImageLoadingIdx] = useState<number | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const speech = useSpeech();

  const currentChapter = chapters.length > 0 ? chapters[chapters.length - 1] : null;
  const isStoryComplete = currentChapter ? currentChapter.choices.length === 0 : false;

  useEffect(() => {
    if (chapters.length > 0) {
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 300);
    }
  }, [chapters.length]);

  const buildPreviousStory = () => {
    return chapters
      .map((ch, i) => {
        let s = `Chapter ${i + 1}: ${ch.title}\n${ch.content}`;
        if (ch.chosenOption) s += `\n[Player chose: ${ch.chosenOption}]`;
        return s;
      })
      .join("\n\n");
  };

  const generateChapter = async (
    storySetup: StorySetup,
    chapterNum: number,
    prevStory?: string,
    chosenOpt?: string
  ) => {
    setIsGenerating(true);
    try {
      const chapter = await generateStoryChapter(storySetup, chapterNum, prevStory, chosenOpt);
      const newIdx = chapterNum - 1;
      setChapters((prev) => [...prev, chapter]);
      setImageLoadingIdx(newIdx);

      // Generate image in parallel
      try {
        const imageUrl = await generateImage(chapter.imagePrompt);
        setChapters((prev) =>
          prev.map((ch, i) => (i === newIdx ? { ...ch, imageUrl } : ch))
        );
      } catch (imgErr) {
        console.error("Image generation failed:", imgErr);
        // Story continues without image
      }
      setImageLoadingIdx(null);
    } catch (err: any) {
      toast({
        title: "Story generation failed",
        description: err.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStart = async (s: StorySetup) => {
    setSetup(s);
    setChapters([]);
    await generateChapter(s, 1);
  };

  const handleChoice = async (choice: string) => {
    if (!setup) return;
    // Mark the chosen option on current chapter
    setChapters((prev) =>
      prev.map((ch, i) => (i === prev.length - 1 ? { ...ch, chosenOption: choice } : ch))
    );
    const prevStory = buildPreviousStory() + `\n[Player chose: ${choice}]`;
    await generateChapter(setup, chapters.length + 1, prevStory, choice);
  };

  const handleRestart = () => {
    setSetup(null);
    setChapters([]);
  };

  return (
    <div className="min-h-screen bg-background">
      <ThemeToggle />

      {/* Layered ambient background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,hsl(252_72%_58%_/_0.07),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_80%_80%,hsl(280_60%_55%_/_0.04),transparent)]" />
      </div>

      <main className="relative z-10 max-w-2xl mx-auto px-4 py-14 md:py-24">
        <AnimatePresence mode="wait">
          {!setup ? (
            <StorySetupForm key="setup" onStart={handleStart} isLoading={isGenerating} />
          ) : (
            <motion.div
              key="story"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-10"
            >
              {/* Progress */}
              <StoryProgress current={chapters.length} total={setup.totalChapters} />

              {/* All chapters */}
              {chapters.map((ch, i) => (
                <div key={i} className="space-y-6">
                  <StoryChapterView
                    chapter={ch}
                    chapterNumber={i + 1}
                    totalChapters={setup.totalChapters}
                    imageLoading={imageLoadingIdx === i}
                    onSpeak={() => speech.speak(ch.content, i)}
                    onStop={speech.stop}
                    isSpeaking={speech.isSpeaking}
                    isLoading={speech.isLoading}
                    isMuted={speech.isMuted}
                    onToggleMute={speech.toggleMute}
                    currentWordIndex={speech.currentWordIndex}
                    isActiveChapter={speech.activeChapterIdx === i}
                  />
                  {/* Show choices only for the latest chapter */}
                  {i === chapters.length - 1 && !isStoryComplete && !isGenerating && (
                    <StoryChoices
                      choices={ch.choices}
                      onChoose={handleChoice}
                      isLoading={isGenerating}
                    />
                  )}
                  {i < chapters.length - 1 && ch.chosenOption && (
                    <div className="text-center">
                      <span className="inline-block text-xs uppercase tracking-[0.2em] text-muted-foreground bg-muted/60 px-3 py-1 rounded-full border border-border/50">
                        ✦ You chose: {ch.chosenOption}
                      </span>
                    </div>
                  )}
                </div>
              ))}

              {/* Loading state */}
              {isGenerating && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-16 space-y-4"
                >
                  <div className="relative w-12 h-12 mx-auto">
                    <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping" />
                    <div className="absolute inset-0 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
                  </div>
                  <p className="text-muted-foreground italic text-sm" style={{ fontFamily: "var(--font-body)" }}>
                    The story unfolds…
                  </p>
                </motion.div>
              )}

              {/* Story end */}
              {isStoryComplete && !isGenerating && (
                <StoryEnd chapters={chapters} onRestart={handleRestart} />
              )}

              <div ref={bottomRef} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Index;
