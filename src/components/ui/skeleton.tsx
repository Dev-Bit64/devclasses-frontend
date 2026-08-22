import * as React from "react";
import { cn } from "../../libs/utils";

// Placeholder block for async content; aria-hidden because it conveys no information.
const Skeleton = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    aria-hidden="true"
    className={cn("animate-pulse rounded-md bg-muted", className)}
    {...props}
  />
);

export { Skeleton };
