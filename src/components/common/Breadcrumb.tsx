import * as React from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { cn } from "../../libs/utils";

export interface BreadcrumbItem {
  label: React.ReactNode;
  // Omit `to` for the current page, which is rendered as plain text.
  to?: string;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

// Trail of ancestor pages; the final item is marked as the current page.
const Breadcrumb = ({ items, className }: BreadcrumbProps) => (
  <nav aria-label="Breadcrumb" className={className}>
    <ol className="flex flex-wrap items-center gap-1.5">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <li key={index} className="flex items-center gap-1.5">
            {item.to && !isLast ? (
              <Link
                to={item.to}
                className="inline-flex items-center gap-1.5 rounded text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {item.label}
              </Link>
            ) : (
              <span
                aria-current={isLast ? "page" : undefined}
                className={cn(
                  "inline-flex items-center gap-1.5 text-sm",
                  isLast ? "font-medium text-foreground" : "text-muted-foreground"
                )}
              >
                {item.label}
              </span>
            )}
            {!isLast && (
              <ChevronRight aria-hidden="true" className="size-3.5 text-muted-foreground" />
            )}
          </li>
        );
      })}
    </ol>
  </nav>
);

export { Breadcrumb };
