import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "../../libs/utils";

export interface SpinnerProps extends React.SVGAttributes<SVGSVGElement> {
  // Accessible name; omit when a nearby element already describes the wait.
  label?: string;
}

// Indeterminate activity indicator used inside buttons and inline loading rows.
const Spinner = ({ className, label, ...props }: SpinnerProps) => (
  <Loader2
    role={label ? "status" : undefined}
    aria-label={label}
    aria-hidden={label ? undefined : true}
    className={cn("size-4 animate-spin", className)}
    {...props}
  />
);

export { Spinner };
