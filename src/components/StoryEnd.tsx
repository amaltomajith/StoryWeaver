import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { StoryChapter } from "@/types/story";
import { BookOpen, RotateCcw } from "lucide-react";

interface StoryEndProps {
  chapters: StoryChapter[];
  onRestart: () => void;
}

export function StoryEnd({ chapters, onRestart }: StoryEndProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.6 }}
      className="text-center space-y-6 py-8"
    >
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10">
        <BookOpen className="w-8 h-8 text-primary" />
      </div>
      <div>
        <h3 className="text-2xl font-bold text-foreground mb-2" style={{ fontFamily: "var(--font-display)" }}>
          The End
        </h3>
        <p className="text-muted-foreground italic">
          Your story concluded in {chapters.length} chapters
        </p>
      </div>
      <Button onClick={onRestart} className="gap-2">
        <RotateCcw className="w-4 h-4" />
        Weave Another Tale
      </Button>
    </motion.div>
  );
}
