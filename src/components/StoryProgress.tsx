import { Progress } from "@/components/ui/progress";

interface StoryProgressProps {
  current: number;
  total: number;
}

export function StoryProgress({ current, total }: StoryProgressProps) {
  const pct = (current / total) * 100;
  return (
    <div className="space-y-1">
      <Progress value={pct} className="h-1.5 bg-muted" />
    </div>
  );
}
