import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

interface StoryChoicesProps {
  choices: string[];
  onChoose: (choice: string) => void;
  isLoading: boolean;
}

const CHOICE_LABELS = ["A", "B", "C"];

export function StoryChoices({ choices, onChoose, isLoading }: StoryChoicesProps) {
  if (!choices.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5 }}
      className="space-y-3"
    >
      {/* Divider with label */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-border/60" />
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground font-medium whitespace-nowrap">
          What do you do?
        </p>
        <div className="flex-1 h-px bg-border/60" />
      </div>

      <div className="space-y-2.5">
        {choices.map((choice, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + i * 0.12, duration: 0.4 }}
          >
            <Button
              variant="outline"
              className="w-full justify-between text-left h-auto py-4 px-5 border-border/60 hover:border-primary/50 hover:bg-primary/5 hover:shadow-sm transition-all duration-200 group"
              onClick={() => onChoose(choice)}
              disabled={isLoading}
            >
              <span className="flex items-start gap-3 min-w-0">
                <span className="shrink-0 inline-flex items-center justify-center w-5 h-5 mt-0.5 rounded-md bg-primary/10 text-primary font-bold text-xs">
                  {CHOICE_LABELS[i]}
                </span>
                <span
                  className="text-foreground/85 text-sm leading-relaxed"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {choice}
                </span>
              </span>
              <ChevronRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0 ml-3" />
            </Button>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
