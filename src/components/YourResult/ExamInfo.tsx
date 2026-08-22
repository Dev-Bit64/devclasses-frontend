import React from "react";
import { BookOpen, CalendarDays, GraduationCap, Trophy } from "lucide-react";
import { Card } from "../ui/card";
import { ExamResult } from "../../interfaces/interfaces";
import { cn } from "../../libs/utils";

/**
 * Props interface for ExamInfo component
 */
interface ExamInfoProps {
  examResult: ExamResult;
}

/**
 * ExamInfo Component
 * Displays metadata about the exam: board, standard, date and a performance label.
 */
const ExamInfo: React.FC<ExamInfoProps> = ({ examResult }) => {
  /**
   * Format date to readable string
   */
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  /**
   * Get performance tag based on score percentage.
   * Thresholds and labels are unchanged; only the colours now come from design tokens.
   */
  const getPerformanceTag = () => {
    const percentage = (examResult.score / examResult.totalQuestions) * 100;

    if (percentage >= 90) return { text: "Excellent", tone: "bg-warning/10 text-warning" };
    if (percentage >= 75) return { text: "Very Good", tone: "bg-success/10 text-success" };
    if (percentage >= 60) return { text: "Good", tone: "bg-accent text-accent-foreground" };
    if (percentage >= 40) return { text: "Average", tone: "bg-warning/10 text-warning" };
    return { text: "Needs Improvement", tone: "bg-destructive/10 text-destructive" };
  };

  const performance = getPerformanceTag();

  const items = [
    { icon: BookOpen, label: "Board", value: examResult.board },
    { icon: GraduationCap, label: "Standard", value: examResult.standard },
    { icon: CalendarDays, label: "Exam Date", value: formatDate(examResult.examDate) },
  ];

  return (
    <Card className="p-4 sm:p-5">
      {/* Two columns on phones, one row from `sm` up — no horizontal overflow at any width. */}
      <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="flex items-center gap-2.5">
              <Icon aria-hidden="true" className="size-5 shrink-0 text-muted-foreground" />
              <div className="flex min-w-0 flex-col">
                <dt className="dc-label text-[0.65rem]">{item.label}</dt>
                <dd className="truncate text-sm font-semibold text-foreground">{item.value}</dd>
              </div>
            </div>
          );
        })}

        <div className="flex items-center gap-2.5">
          <Trophy aria-hidden="true" className="size-5 shrink-0 text-muted-foreground" />
          <div className="flex min-w-0 flex-col items-start gap-0.5">
            <dt className="dc-label text-[0.65rem]">Performance</dt>
            <dd>
              <span
                className={cn(
                  "inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold",
                  performance.tone
                )}
              >
                {performance.text}
              </span>
            </dd>
          </div>
        </div>
      </dl>
    </Card>
  );
};

export default ExamInfo;
