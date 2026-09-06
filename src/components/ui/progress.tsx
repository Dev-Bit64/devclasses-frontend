import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../libs/utils";

const indicatorVariants = cva("h-full rounded-full transition-[width] duration-500 ease-out", {
  variants: {
    tone: {
      primary: "bg-primary",
      success: "bg-success",
      warning: "bg-warning",
      destructive: "bg-destructive",
    },
  },
  defaultVariants: { tone: "primary" },
});

export interface ProgressProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof indicatorVariants> {
  value: number;
  max?: number;
  // Announced to assistive tech in place of the raw percentage.
  label?: string;
}

/**
 * Determinate progress bar. Rendered as a plain div with ARIA rather than the Radix
 * primitive so the value can be labelled without an extra wrapper.
 */
const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value, max = 100, tone, label, ...props }, ref) => {
    const percent = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;

    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuenow={Math.round(percent)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
        className={cn("h-2 w-full overflow-hidden rounded-full bg-muted", className)}
        {...props}
      >
        <div className={cn(indicatorVariants({ tone }))} style={{ width: `${percent}%` }} />
      </div>
    );
  }
);
Progress.displayName = "Progress";

export { Progress };
