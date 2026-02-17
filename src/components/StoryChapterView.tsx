import { motion } from "framer-motion";
import { StoryChapter } from "@/types/story";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX, Square, Loader2 } from "lucide-react";

interface StoryChapterViewProps {
  chapter: StoryChapter;
  chapterNumber: number;
  totalChapters: number;
  imageLoading: boolean;
  onSpeak?: () => void;
  onStop?: () => void;
  isSpeaking?: boolean;
  isLoading?: boolean;
  isMuted?: boolean;
  onToggleMute?: () => void;
  currentWordIndex?: number;
  isActiveChapter?: boolean;
}

function KaraokeText({ content, currentWordIndex, isActive }: { content: string; currentWordIndex: number; isActive: boolean }) {
  const paragraphs = content.split("\n");
  let globalWordIdx = 0;

  return (
    <div className="prose max-w-none text-foreground/80 leading-relaxed text-[1.05rem]" style={{ fontFamily: "var(--font-body)" }}>
      {paragraphs.map((paragraph, pIdx) => {
        const words = paragraph.split(/\s+/).filter(Boolean);
        const startIdx = globalWordIdx;
        globalWordIdx += words.length;

        return (
          <p key={pIdx} className={pIdx > 0 ? "mt-4" : ""}>
            {words.map((word, wIdx) => {
              const absIdx = startIdx + wIdx;
              const isHighlighted = isActive && absIdx < currentWordIndex;
              const isCurrent = isActive && absIdx === currentWordIndex;
              return (
                <span
                  key={wIdx}
                  className={`transition-colors duration-150 ${
                    isCurrent
                      ? "text-primary font-semibold"
                      : isHighlighted
                      ? "text-primary/80"
                      : ""
                  }`}
                >
                  {word}{" "}
                </span>
              );
            })}
          </p>
        );
      })}
    </div>
  );
}

export function StoryChapterView({
  chapter,
  chapterNumber,
  totalChapters,
  imageLoading,
  onSpeak,
  onStop,
  isSpeaking,
  isLoading,
  isMuted,
  onToggleMute,
  currentWordIndex = -1,
  isActiveChapter = false,
}: StoryChapterViewProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="space-y-6"
    >
      {/* Chapter heading */}
      <div className="text-center space-y-1">
        <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">
          Chapter {chapterNumber} of {totalChapters}
        </p>
        <h2
          className="text-3xl md:text-4xl font-bold text-foreground"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {chapter.title}
        </h2>
      </div>

      {/* Image */}
      {imageLoading ? (
        <div className="relative rounded-2xl overflow-hidden border shadow-sm aspect-video bg-muted">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center space-y-3">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm text-muted-foreground italic">Painting your scene...</p>
            </div>
          </div>
        </div>
      ) : chapter.imageUrl ? (
        <div className="relative rounded-2xl overflow-hidden border shadow-sm aspect-video bg-muted">
          <motion.img
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            src={chapter.imageUrl}
            alt={chapter.title}
            className="w-full h-full object-cover"
          />
        </div>
      ) : null}

      {/* Story text with karaoke + controls */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="bg-card border rounded-2xl p-6 md:p-8 shadow-sm"
      >
        <KaraokeText
          content={chapter.content}
          currentWordIndex={currentWordIndex}
          isActive={isActiveChapter}
        />

        {/* TTS Controls */}
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
          {isLoading ? (
            <Button variant="ghost" size="sm" disabled className="gap-1.5 text-muted-foreground">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Generating voice...
            </Button>
          ) : isActiveChapter && isSpeaking ? (
            <Button variant="ghost" size="sm" onClick={onStop} className="gap-1.5 text-muted-foreground">
              <Square className="w-3.5 h-3.5" />
              Stop
            </Button>
          ) : (
            <Button variant="ghost" size="sm" onClick={onSpeak} disabled={isMuted} className="gap-1.5 text-muted-foreground">
              <Volume2 className="w-3.5 h-3.5" />
              Read Aloud
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground"
            onClick={onToggleMute}
            aria-label={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
