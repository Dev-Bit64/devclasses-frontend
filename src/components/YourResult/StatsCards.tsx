import React from "react";
import { CheckCircle2, CircleHelp, Percent, XCircle } from "lucide-react";
import { Card } from "../ui/card";
import { cn } from "../../libs/utils";

interface StatsCardsProps {
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
}

const StatsCards: React.FC<StatsCardsProps> = ({
  totalQuestions,
  correctAnswers,
  wrongAnswers,
}) => {
  // Accuracy calculation is unchanged.
  const accuracy = totalQuestions ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

  const stats = [
    {
      key: "total",
      label: "Total Questions",
      value: totalQuestions,
      icon: CircleHelp,
      tone: "bg-accent text-accent-foreground",
    },
    {
      key: "correct",
      label: "Correct",
      value: correctAnswers,
      icon: CheckCircle2,
      tone: "bg-success/10 text-success",
    },
    {
      key: "wrong",
      label: "Wrong",
      value: wrongAnswers,
      icon: XCircle,
      tone: "bg-destructive/10 text-destructive",
    },
    {
      key: "accuracy",
      label: "Accuracy",
      value: accuracy + "%",
      icon: Percent,
      tone: "bg-secondary/10 text-secondary",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.key} className="flex flex-col items-center gap-2 p-4 text-center sm:p-5">
            <div className={cn("grid size-10 place-items-center rounded-full", stat.tone)}>
              <Icon aria-hidden="true" className="size-5" />
            </div>
            <span className="dc-numeric text-2xl font-bold text-foreground">{stat.value}</span>
            <span className="dc-caption uppercase tracking-wide">{stat.label}</span>
          </Card>
        );
      })}
    </div>
  );
};

export default StatsCards;
