import React from "react";
import { Star, Trophy } from "lucide-react";
import { cn } from "../../libs/utils";

interface ResultHeaderProps {
  scorePercentage: number;
}

// Thresholds are unchanged from the previous implementation.
const getPerformanceMessage = (percentage: number) => {
  if (percentage >= 90) return "Excellent Performance!";
  if (percentage >= 80) return "Great Job!";
  if (percentage >= 70) return "Good Work!";
  if (percentage >= 60) return "Not Bad!";
  return "Keep Practicing!";
};

const getStarRating = (percentage: number) => {
  if (percentage >= 90) return 5;
  if (percentage >= 80) return 4;
  if (percentage >= 70) return 3;
  if (percentage >= 60) return 2;
  return 1;
};

const ResultHeader: React.FC<ResultHeaderProps> = ({ scorePercentage }) => {
  const stars = getStarRating(scorePercentage);

  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <div className="grid size-14 place-items-center rounded-2xl bg-accent text-accent-foreground">
        <Trophy aria-hidden="true" className="size-7" />
      </div>
      <h1 className="dc-h1">Your Results</h1>
      <div className="flex items-center gap-1" role="img" aria-label={stars + " out of 5 stars"}>
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            aria-hidden="true"
            className={cn(
              "size-5",
              i < stars ? "fill-warning text-warning" : "fill-muted text-muted"
            )}
          />
        ))}
      </div>
      <p className="dc-body font-medium text-muted-foreground">
        {getPerformanceMessage(scorePercentage)}
      </p>
    </div>
  );
};

export default ResultHeader;
