import React from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import { Card } from "../ui/card";
import { DetailedQuestionResult } from "../../interfaces/interfaces";
import { cn } from "../../libs/utils";

/**
 * Props interface for DetailedResults component
 */
interface DetailedResultsProps {
  detailedResults: DetailedQuestionResult[];
}

/**
 * Format option label (e.g., "OPTIONA" -> "A")
 * Handles null values for unanswered questions
 */
const formatOption = (option: string | null): string => {
  if (!option) {
    return "Not Answered";
  }
  if (option.startsWith("OPTION")) {
    return option.replace("OPTION", "");
  }
  return option;
};

/**
 * DetailedResults Component
 * Displays a question-by-question breakdown: the question, every option with the correct
 * and selected ones marked, and the answers side by side.
 */
const DetailedResults: React.FC<DetailedResultsProps> = ({ detailedResults }) => {
  const correctCount = detailedResults.filter((r) => r.isCorrect).length;
  const wrongCount = detailedResults.filter((r) => !r.isCorrect).length;

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4 sm:p-5">
        <h2 className="dc-h3">Question-by-Question Breakdown</h2>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1 text-xs font-semibold text-success">
            <CheckCircle2 aria-hidden="true" className="size-3.5" />
            {correctCount} correct
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-semibold text-destructive">
            <XCircle aria-hidden="true" className="size-3.5" />
            {wrongCount} wrong
          </span>
        </div>
      </div>

      {/* Multiple panels may be open at once, as the previous Collapse allowed. */}
      <Accordion type="multiple" className="flex flex-col gap-2.5 p-3 sm:p-4">
        {detailedResults.map((result, index) => (
          <AccordionItem
            key={result.questionId}
            value={result.questionId}
            className={cn(
              "border",
              result.isCorrect ? "border-success/30" : "border-destructive/30"
            )}
          >
            <AccordionTrigger className="px-4 py-3.5">
              <span className="flex min-w-0 flex-1 items-center gap-3">
                <span
                  aria-hidden="true"
                  className={cn(
                    "grid size-8 shrink-0 place-items-center rounded-lg text-sm font-bold text-white",
                    result.isCorrect ? "bg-success" : "bg-destructive"
                  )}
                >
                  {index + 1}
                </span>
                <span className="truncate">Question {index + 1}</span>
                <span
                  className={cn(
                    "ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold",
                    result.isCorrect
                      ? "bg-success/10 text-success"
                      : "bg-destructive/10 text-destructive"
                  )}
                >
                  {result.isCorrect ? (
                    <CheckCircle2 aria-hidden="true" className="size-3.5" />
                  ) : (
                    <XCircle aria-hidden="true" className="size-3.5" />
                  )}
                  {result.isCorrect ? "Correct" : "Wrong"}
                </span>
              </span>
            </AccordionTrigger>

            <AccordionContent className="px-4 pb-4">
              <div className="flex flex-col gap-4">
                {/* Question Text */}
                <p
                  className={cn(
                    "break-words rounded-lg border-l-[3px] bg-muted/50 p-3.5 text-sm leading-relaxed text-foreground",
                    result.isCorrect ? "border-l-success" : "border-l-destructive"
                  )}
                >
                  {result.question}
                </p>

                {/* Options List Review - all options with correctness markers if available */}
                {result.options && (
                  <ul className="flex flex-col gap-2">
                    {Object.entries(result.options).map(([key, text]) => {
                      if (!text) return null;
                      const optionKeyUpper = key.toUpperCase();
                      const isSelected = result.selectedOption === optionKeyUpper;
                      const isCorrect = result.correctOption === optionKeyUpper;

                      return (
                        <li
                          key={key}
                          className={cn(
                            "flex items-center gap-3 rounded-lg border p-2.5 px-3.5",
                            isCorrect && "border-success/40 bg-success/5",
                            !isCorrect && isSelected && "border-destructive/40 bg-destructive/5",
                            !isCorrect && !isSelected && "border-border bg-card"
                          )}
                        >
                          <span
                            aria-hidden="true"
                            className={cn(
                              "grid size-6 shrink-0 place-items-center rounded-full text-xs font-bold",
                              isCorrect && "bg-success text-white",
                              !isCorrect && isSelected && "bg-destructive text-white",
                              !isCorrect && !isSelected && "bg-muted text-muted-foreground"
                            )}
                          >
                            {optionKeyUpper}
                          </span>
                          {/* Icons carry the meaning so it is not conveyed by colour alone. */}
                          {isCorrect && (
                            <CheckCircle2 aria-label="Correct answer" className="size-4 shrink-0 text-success" />
                          )}
                          {!isCorrect && isSelected && (
                            <XCircle aria-label="Your answer" className="size-4 shrink-0 text-destructive" />
                          )}
                          <span
                            className={cn(
                              "min-w-0 break-words text-sm text-foreground",
                              (isSelected || isCorrect) && "font-medium"
                            )}
                          >
                            {text}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                )}

                {/* Answer Information */}
                <div
                  className={cn(
                    "grid gap-3",
                    result.isCorrect ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2"
                  )}
                >
                  <div
                    className={cn(
                      "rounded-lg border p-3.5",
                      result.isCorrect
                        ? "border-success/40 bg-success/5"
                        : "border-destructive/40 bg-destructive/5"
                    )}
                  >
                    <p className="dc-label text-[0.65rem]">Your Answer</p>
                    <p
                      className={cn(
                        "mt-1.5 text-lg font-bold",
                        result.isCorrect ? "text-success" : "text-destructive"
                      )}
                    >
                      {formatOption(result.selectedOption)}
                    </p>
                  </div>

                  {!result.isCorrect && (
                    <div className="rounded-lg border border-success/40 bg-success/5 p-3.5">
                      <p className="dc-label text-[0.65rem]">Correct Answer</p>
                      <p className="mt-1.5 text-lg font-bold text-success">
                        {formatOption(result.correctOption)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </Card>
  );
};

export default DetailedResults;
