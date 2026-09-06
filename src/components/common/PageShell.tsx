import * as React from "react";
import { cn } from "../../libs/utils";

export interface PageShellProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

/**
 * Standard page container for authenticated screens.
 * Owns the responsive gutter and vertical rhythm so no page invents its own spacing.
 */
const PageShell = ({ className, children, ...props }: PageShellProps) => (
  <div
    className={cn(
      "mx-auto w-full max-w-[1400px] px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8",
      "flex flex-col gap-5 sm:gap-6 lg:gap-8",
      className
    )}
    {...props}
  >
    {children}
  </div>
);

export { PageShell };
