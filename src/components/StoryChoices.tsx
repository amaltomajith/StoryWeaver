import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

interface StoryChoicesProps {
  choices: string[];
  onChoose: (choice: string) => void;
  isLoading: boolean;
}

export function StoryChoices({ choices, onChoose, isLoading }: StoryChoicesProps) {
  if (!choices.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
      className="space-y-3"
    >
      <p className="text-center text-sm uppercase tracking-[0.2em] text-muted-foreground">
        What do you do?
      </p>
      <div className="space-y-2">
        {choices.map((choice, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 + i * 0.15 }}
          >
            <Button
              variant="outline"
              className="w-full justify-between text-left h-auto py-4 px-5 border-border/60 hover:border-primary hover:bg-primary/5 transition-all group"
              onClick={() => onChoose(choice)}
              disabled={isLoading}
            >
              <span className="flex items-start gap-3">
                <span className="text-primary font-bold text-sm mt-0.5">{String.fromCharCode(65 + i)}.</span>
                <span className="text-foreground/90" style={{ fontFamily: "var(--font-body)" }}>{choice}</span>
              </span>
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0 ml-2" />
            </Button>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
