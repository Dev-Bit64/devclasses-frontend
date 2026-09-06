import * as React from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "../../libs/utils";

export interface ErrorStateProps {
  title?: string;
  description?: React.ReactNode;
  // Wired to the caller's existing retry handler; this component performs no fetching itself.
  onRetry?: () => void;
  retryLabel?: string;
  action?: React.ReactNode;
  className?: string;
}

// Presentation for a failed request. Announced via role="alert" so it is not missed.
const ErrorState = ({
  title = "Something went wrong",
  description = "We could not load this content. Please try again.",
  onRetry,
  retryLabel = "Try again",
  action,
  className,
}: ErrorStateProps) => (
  <div
    role="alert"
    className={cn(
      "flex flex-col items-center justify-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 px-6 py-12 text-center",
      className
    )}
  >
    <div className="grid size-12 place-items-center rounded-full bg-destructive/10 text-destructive">
      <AlertTriangle aria-hidden="true" className="size-6" />
    </div>
    <div className="flex max-w-sm flex-col gap-1">
      <p className="dc-h4">{title}</p>
      {description && <p className="dc-small">{description}</p>}
    </div>
    <div className="mt-1 flex flex-wrap items-center justify-center gap-2">
      {onRetry && (
        <Button variant="secondary" onClick={onRetry}>
          {retryLabel}
        </Button>
      )}
      {action}
    </div>
  </div>
);

export { ErrorState };
