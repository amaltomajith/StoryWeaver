import { motion, AnimatePresence } from "framer-motion";
import { StoryChapter } from "@/types/story";
import { Button } from "@/components/ui/button";
import { Volume2, Square, Loader2, VolumeX } from "lucide-react";

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

function KaraokeText({
  content,
  currentWordIndex,
  isActive,
}: {
  content: string;
  currentWordIndex: number;
  isActive: boolean;
}) {
  const paragraphs = content.split("\n");
  let globalWordIdx = 0;

  return (
    <div
      className="prose max-w-none text-foreground/80 leading-relaxed text-[1.07rem]"
      style={{ fontFamily: "var(--font-body)" }}
    >
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
                  className={`transition-all duration-100 ${
                    isCurrent
                      ? "text-primary font-semibold bg-primary/10 rounded px-0.5"
                      : isHighlighted
                      ? "text-primary/70"
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
  const isThisChapterActive = isActiveChapter;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="space-y-5"
    >
      {/* Chapter heading */}
      <div className="text-center space-y-1.5">
        <span className="inline-block text-xs uppercase tracking-[0.3em] text-primary/60 font-medium bg-primary/8 px-3 py-1 rounded-full border border-primary/15">
          Chapter {chapterNumber} · {totalChapters}
        </span>
        <h2
          className="text-3xl md:text-4xl font-bold text-foreground mt-2"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {chapter.title}
        </h2>
      </div>

      {/* Image */}
      <AnimatePresence mode="wait">
        {imageLoading ? (
          <motion.div
            key="img-loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative rounded-2xl overflow-hidden border border-border/60 shadow-md aspect-video bg-muted/60"
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center space-y-3">
                <div className="relative w-10 h-10 mx-auto">
                  <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping" />
                  <div className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                </div>
                <p className="text-sm text-muted-foreground italic">Painting your scene…</p>
              </div>
            </div>
          </motion.div>
        ) : chapter.imageUrl ? (
          <motion.div
            key="img-loaded"
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7 }}
            className="relative rounded-2xl overflow-hidden border border-border/60 shadow-md aspect-video bg-muted"
          >
            <img
              src={chapter.imageUrl}
              alt={chapter.title}
              className="w-full h-full object-cover"
            />
            {/* Subtle bottom gradient for depth */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Story text + single combined audio control */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.55 }}
        className="bg-card border border-border/60 rounded-2xl p-6 md:p-8 shadow-sm relative"
      >
        <KaraokeText
          content={chapter.content}
          currentWordIndex={currentWordIndex}
          isActive={isThisChapterActive}
        />

        {/* Single consolidated audio control row */}
        <div className="flex items-center gap-2 mt-5 pt-4 border-t border-border/50">
          {isLoading && isThisChapterActive ? (
            <Button
              variant="ghost"
              size="sm"
              disabled
              className="gap-2 text-muted-foreground h-8 px-3 text-xs"
            >
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Generating voice…
            </Button>
          ) : isThisChapterActive && isSpeaking ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={onStop}
              className="gap-2 text-muted-foreground hover:text-foreground h-8 px-3 text-xs"
            >
              <Square className="w-3 h-3 fill-current" />
              Stop
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={isMuted ? onToggleMute : onSpeak}
              className="gap-2 text-muted-foreground hover:text-primary h-8 px-3 text-xs transition-colors"
            >
              {isMuted ? (
                <>
                  <VolumeX className="w-3.5 h-3.5" />
                  Unmute to listen
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5" />
                  Read Aloud
                </>
              )}
            </Button>
          )}

          {/* Mute toggle — only show when not in loading state */}
          {!isLoading && (
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 ml-auto transition-colors ${
                isMuted ? "text-destructive/70 hover:text-destructive" : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={onToggleMute}
              aria-label={isMuted ? "Unmute" : "Mute"}
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? (
                <VolumeX className="w-3.5 h-3.5" />
              ) : (
                <Volume2 className="w-3.5 h-3.5" />
              )}
            </Button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
