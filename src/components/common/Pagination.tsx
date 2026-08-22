import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../../libs/utils";

export interface PaginationProps {
  current: number;
  pageSize: number;
  total: number;
  // Same signature as the existing antd pagination onChange, so call sites are unchanged.
  onChange: (page: number) => void;
  // Renders the "1-10 of 42 items" summary; matches antd showTotal.
  showTotal?: (total: number, range: [number, number]) => React.ReactNode;
  className?: string;
}

// Builds a compact page list with ellipses, e.g. 1 ... 4 5 6 ... 20.
const buildPages = (current: number, totalPages: number): (number | "gap")[] => {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);

  const pages = new Set<number>([1, totalPages, current, current - 1, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);

  return sorted.reduce<(number | "gap")[]>((acc, page, index) => {
    if (index > 0 && page - (sorted[index - 1] as number) > 1) acc.push("gap");
    acc.push(page);
    return acc;
  }, []);
};

const Pagination = ({
  current,
  pageSize,
  total,
  onChange,
  showTotal,
  className,
}: PaginationProps) => {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (total === 0) return null;

  const from = (current - 1) * pageSize + 1;
  const to = Math.min(current * pageSize, total);
  const pages = buildPages(current, totalPages);

  const navButton =
    "inline-flex h-9 min-w-9 items-center justify-center gap-1 rounded-lg border border-border bg-white px-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

  return (
    <nav
      aria-label="Pagination"
      className={cn(
        "flex flex-col items-center justify-between gap-3 sm:flex-row sm:gap-4",
        className
      )}
    >
      {showTotal && <p className="dc-caption order-2 sm:order-1">{showTotal(total, [from, to])}</p>}

      <div className="order-1 flex items-center gap-1.5 sm:order-2">
        <button
          type="button"
          className={navButton}
          onClick={() => onChange(current - 1)}
          disabled={current <= 1}
          aria-label="Previous page"
        >
          <ChevronLeft aria-hidden="true" className="size-4" />
        </button>

        {/* Page numbers are hidden on the narrowest screens; prev/next remain usable. */}
        <div className="hidden items-center gap-1.5 sm:flex">
          {pages.map((page, index) =>
            page === "gap" ? (
              <span key={`gap-${index}`} className="px-1 text-sm text-muted-foreground">
                &hellip;
              </span>
            ) : (
              <button
                key={page}
                type="button"
                onClick={() => onChange(page)}
                aria-current={page === current ? "page" : undefined}
                className={cn(
                  navButton,
                  page === current &&
                    "border-primary bg-primary text-primary-foreground hover:bg-primary-hover"
                )}
              >
                {page}
              </button>
            )
          )}
        </div>

        {/* Compact indicator for the narrowest screens. */}
        <span className="dc-caption px-2 sm:hidden">
          {current} / {totalPages}
        </span>

        <button
          type="button"
          className={navButton}
          onClick={() => onChange(current + 1)}
          disabled={current >= totalPages}
          aria-label="Next page"
        >
          <ChevronRight aria-hidden="true" className="size-4" />
        </button>
      </div>
    </nav>
  );
};

export { Pagination };
