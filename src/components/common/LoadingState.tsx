import { Spinner } from "../ui/spinner";
import { cn } from "../../libs/utils";

export interface LoadingStateProps {
  label?: string;
  className?: string;
}

// Inline indeterminate loader for regions with no meaningful skeleton shape.
const LoadingState = ({ label = "Loading...", className }: LoadingStateProps) => (
  <div
    role="status"
    aria-live="polite"
    className={cn("flex flex-col items-center justify-center gap-3 py-16", className)}
  >
    <Spinner className="size-7 text-primary" />
    <p className="dc-small">{label}</p>
  </div>
);

export { LoadingState };
