import * as React from "react";
import { type LucideIcon, Inbox } from "lucide-react";
import { cn } from "../../libs/utils";

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: React.ReactNode;
  // Optional call to action, e.g. a button that opens a create dialog.
  action?: React.ReactNode;
  className?: string;
}

// Shown when a request succeeded but returned nothing, so blank areas are never unexplained.
const EmptyState = ({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
}: EmptyStateProps) => (
  <div
    className={cn(
      "flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-card px-6 py-12 text-center",
      className
    )}
  >
    <div className="grid size-12 place-items-center rounded-full bg-muted text-muted-foreground">
      <Icon aria-hidden="true" className="size-6" />
    </div>
    <div className="flex max-w-sm flex-col gap-1">
      <p className="dc-h4">{title}</p>
      {description && <p className="dc-small">{description}</p>}
    </div>
    {action && <div className="mt-1">{action}</div>}
  </div>
);

export { EmptyState };
