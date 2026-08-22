import React, { useState, useEffect } from "react";
import { Flame, Rocket, Trophy } from "lucide-react";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { cn } from "../../libs/utils";

interface ScoreCardProps {
  scorePercentage: number;
  correctAnswers: number;
  totalQuestions: number;
  isSmallScreen: boolean;
}

// Colour thresholds are unchanged; they now resolve to design tokens.
const getScoreTone = (percentage: number) => {
  if (percentage >= 80) return { ring: "text-success", chip: "bg-success/10 text-success" };
  if (percentage >= 60) return { ring: "text-warning", chip: "bg-warning/10 text-warning" };
  return { ring: "text-destructive", chip: "bg-destructive/10 text-destructive" };
};

const getScoreIcon = (percentage: number) => {
  if (percentage >= 90) return Trophy;
  if (percentage >= 70) return Flame;
  return Rocket;
};

const ScoreCard: React.FC<ScoreCardProps> = ({
  scorePercentage,
  correctAnswers,
  totalQuestions,
  isSmallScreen,
}) => {
  const [animatedPercentage, setAnimatedPercentage] = useState(0);

  // Same 500ms delay before the ring animates to its final value.
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedPercentage(scorePercentage);
    }, 500);
    return () => clearTimeout(timer);
  }, [scorePercentage]);

  const tone = getScoreTone(scorePercentage);
  const Icon = getScoreIcon(scorePercentage);

  // SVG ring geometry; the stroke dash offset encodes the percentage.
  const size = isSmallScreen ? 140 : 200;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedPercentage / 100) * circumference;

  return (
    <Card className="flex flex-col items-center gap-4 p-6 sm:p-8">
      <div className={cn("grid size-11 place-items-center rounded-full", tone.chip)}>
        <Icon aria-hidden="true" className="size-5" />
      </div>

      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          role="img"
          aria-label={`Score ${scorePercentage} percent`}
          className="-rotate-90"
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            className="stroke-muted"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={cn("stroke-current transition-[stroke-dashoffset] duration-1000 ease-out", tone.ring)}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="dc-numeric text-3xl font-bold text-foreground sm:text-4xl">
            {animatedPercentage}%
          </span>
          <span className="dc-numeric dc-small">
            {correctAnswers}/{totalQuestions}
          </span>
        </div>
      </div>

      <h2 className="dc-h3">Overall Score</h2>

      {/* Badge thresholds mirror the previous implementation. */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {scorePercentage >= 90 && <Badge variant="success" size="md">Excellence</Badge>}
        {scorePercentage >= 80 && <Badge variant="success" size="md">Great</Badge>}
        {scorePercentage >= 70 && <Badge size="md">Good</Badge>}
      </div>
    </Card>
  );
};

export default ScoreCard;
