import * as React from "react";
import { cn } from "../../libs/utils";

export interface PageHeaderProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  // Buttons or filters aligned to the end of the header on wider screens.
  actions?: React.ReactNode;
  className?: string;
}

// Page title block. Actions stack beneath the title on mobile and sit inline from `sm` up.
const PageHeader = ({ title, description, actions, className }: PageHeaderProps) => (
  <div
    className={cn(
      "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4",
      className
    )}
  >
    <div className="flex min-w-0 flex-col gap-1">
      <h1 className="dc-h1">{title}</h1>
      {description && <p className="dc-small">{description}</p>}
    </div>
    {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
  </div>
);

export { PageHeader };
