import * as React from "react";
import { BrandLogo } from "../landing/primitives/BrandLogo";
import { ExamTimer } from "../exam/ExamTimer";
import { Progress } from "../ui/progress";
import { cn } from "../../libs/utils";

export interface ExamLayoutProps {
  current: number;
  total?: number;
  msLeft: number;
  children: React.ReactNode;
  // Sticky action bar, e.g. previous / next / submit.
  footer?: React.ReactNode;
  className?: string;
}

/**
 * Distraction-free shell for the exam screen: no application sidebar, timer always visible.
 * Layout only — question, timer and navigation state all stay with the exam page.
 */
const ExamLayout = ({
  current,
  total,
  msLeft,
  children,
  footer,
  className,
}: ExamLayoutProps) => (
  <div className={cn("dc-app flex min-h-[100dvh] flex-col bg-surface", className)}>
    <header className="sticky top-0 z-[800] shrink-0 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-4xl items-center justify-between gap-3 px-4 sm:h-16 sm:px-6">
        {/* The wordmark is dropped on phones so the counter and timer always fit. */}
        <BrandLogo showTagline={false} className="hidden sm:inline-flex" to="/dashboard" />
        <p className="dc-numeric text-sm font-semibold text-foreground sm:text-base">
          <span className="sr-only">Question </span>
          {current}
          <span className="text-muted-foreground"> / {total ?? "-"}</span>
        </p>
        <ExamTimer msLeft={msLeft} />
      </div>
      {/* Progress sits below the bar so it can never overlap the question. */}
      <Progress
        value={current}
        max={total || 1}
        label={`Question ${current} of ${total ?? 0}`}
        className="h-1 rounded-none"
      />
    </header>

    <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-5 sm:px-6 sm:py-8">{children}</main>

    {footer && (
      <div className="sticky bottom-0 z-[800] shrink-0 border-t border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto w-full max-w-4xl px-4 py-3 sm:px-6 sm:py-4">{footer}</div>
      </div>
    )}
  </div>
);

export { ExamLayout };
