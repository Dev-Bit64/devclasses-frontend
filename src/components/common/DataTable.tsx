import * as React from "react";
import { ArrowDown, ArrowUp, ChevronRight, ChevronsUpDown } from "lucide-react";
import { Checkbox } from "../ui/checkbox";
import { Skeleton } from "../ui/skeleton";
import { EmptyState } from "./EmptyState";
import { ErrorState } from "./ErrorState";
import { Pagination, type PaginationProps } from "./Pagination";
import { cn } from "../../libs/utils";

/** Breakpoint below which a column is hidden. Mirrors the Tailwind scale. */
export type HideBelow = "sm" | "md" | "lg" | "xl";

const hideBelowClasses: Record<HideBelow, string> = {
  sm: "hidden sm:table-cell",
  md: "hidden md:table-cell",
  lg: "hidden lg:table-cell",
  xl: "hidden xl:table-cell",
};

export interface DataTableColumn<T> {
  key: string;
  title: React.ReactNode;
  // Reads the cell value when no custom render is supplied.
  dataIndex?: keyof T | string;
  render?: (value: any, record: T, index: number) => React.ReactNode;
  align?: "left" | "center" | "right";
  width?: number | string;
  // Drops the column below the given breakpoint instead of forcing a horizontal scroll.
  hideBelow?: HideBelow;
  // Header-mounted filter control, e.g. the existing board/standard pickers.
  filter?: React.ReactNode;
  // Client-side comparator, matching the signature the antd columns already used.
  sorter?: (a: T, b: T) => number;
  className?: string;
}

export interface DataTableRowSelection<T> {
  selectedRowKeys: React.Key[];
  onChange: (keys: React.Key[], rows: T[]) => void;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  dataSource: T[];
  // Key accessor; a string names a field, a function derives the key.
  rowKey: keyof T | ((record: T) => React.Key);
  loading?: boolean;
  error?: boolean;
  onRetry?: () => void;
  rowSelection?: DataTableRowSelection<T>;
  pagination?: Omit<PaginationProps, "className">;
  onRow?: (record: T, index: number) => React.HTMLAttributes<HTMLTableRowElement>;
  rowClassName?: (record: T, index: number) => string;
  emptyTitle?: string;
  emptyDescription?: React.ReactNode;
  emptyAction?: React.ReactNode;
  // Card renderer used below `md`, so dense tables stay usable on phones.
  renderMobileCard?: (record: T, index: number) => React.ReactNode;
  // Renders a nested panel beneath a row when it is expanded.
  expandedRowRender?: (record: T) => React.ReactNode;
  // Decides which rows offer an expand control; defaults to all of them.
  rowExpandable?: (record: T) => boolean;
  // Number of placeholder rows drawn while loading.
  skeletonRows?: number;
  className?: string;
}

const alignClasses = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
} as const;

// Reads a possibly dotted dataIndex path off a record.
const readCell = <T,>(record: T, dataIndex?: keyof T | string): any => {
  if (dataIndex === undefined) return undefined;
  const path = String(dataIndex).split(".");
  return path.reduce<any>((acc, segment) => (acc == null ? acc : acc[segment]), record);
};

/**
 * Presentational data table.
 * It renders rows and reports interactions upward — it never fetches data.
 * Column sorting is applied client-side to the rows it is given, exactly as the previous
 * table did; filtering, pagination state and row actions stay owned by the calling page.
 */
function DataTable<T extends object>({
  columns,
  dataSource,
  rowKey,
  loading = false,
  error = false,
  onRetry,
  rowSelection,
  pagination,
  onRow,
  rowClassName,
  emptyTitle = "Nothing to show yet",
  emptyDescription,
  emptyAction,
  renderMobileCard,
  expandedRowRender,
  rowExpandable,
  skeletonRows = 6,
  className,
}: DataTableProps<T>) {
  const getKey = React.useCallback(
    (record: T, index: number): React.Key => {
      if (typeof rowKey === "function") return rowKey(record);
      const value = record[rowKey];
      return (value as unknown as React.Key) ?? index;
    },
    [rowKey]
  );

  // Keys of the rows currently expanded.
  const [expandedKeys, setExpandedKeys] = React.useState<React.Key[]>([]);

  const toggleExpanded = (key: React.Key) => {
    setExpandedKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  // Tri-state client-side sort: ascending, descending, then back to the source order.
  const [sort, setSort] = React.useState<{ key: string; order: "asc" | "desc" } | null>(null);

  const sortedData = React.useMemo(() => {
    if (!sort) return dataSource;
    const column = columns.find((c) => c.key === sort.key);
    if (!column?.sorter) return dataSource;
    const factor = sort.order === "asc" ? 1 : -1;
    return [...dataSource].sort((a, b) => column.sorter!(a, b) * factor);
  }, [dataSource, columns, sort]);

  const toggleSort = (key: string) => {
    setSort((prev) => {
      if (prev?.key !== key) return { key, order: "asc" };
      if (prev.order === "asc") return { key, order: "desc" };
      return null;
    });
  };

  const selectedKeys = rowSelection?.selectedRowKeys ?? [];
  const allSelected = sortedData.length > 0 && selectedKeys.length === sortedData.length;
  const someSelected = selectedKeys.length > 0 && !allSelected;

  // Header checkbox selects or clears every row on the current page.
  const toggleAll = () => {
    if (!rowSelection) return;
    if (allSelected) rowSelection.onChange([], []);
    else rowSelection.onChange(sortedData.map(getKey), sortedData);
  };

  const toggleRow = (record: T, index: number) => {
    if (!rowSelection) return;
    const key = getKey(record, index);
    const next = selectedKeys.includes(key)
      ? selectedKeys.filter((k) => k !== key)
      : [...selectedKeys, key];
    rowSelection.onChange(
      next,
      sortedData.filter((row, i) => next.includes(getKey(row, i)))
    );
  };

  if (error) {
    return <ErrorState onRetry={onRetry} className={className} />;
  }

  const showEmpty = !loading && sortedData.length === 0;

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {showEmpty ? (
        <EmptyState title={emptyTitle} description={emptyDescription} action={emptyAction} />
      ) : (
        <>
          {/* Mobile card list — only rendered when the caller supplies a card renderer. */}
          {renderMobileCard && (
            <div className="flex flex-col gap-3 md:hidden">
              {loading
                ? Array.from({ length: skeletonRows }, (_, i) => (
                    <Skeleton key={i} className="h-28 w-full rounded-xl" />
                  ))
                : sortedData.map((record, index) => (
                    <React.Fragment key={getKey(record, index)}>
                      {renderMobileCard(record, index)}
                    </React.Fragment>
                  ))}
            </div>
          )}

          <div
            className={cn(
              "overflow-x-auto rounded-xl border border-border bg-card",
              renderMobileCard && "hidden md:block"
            )}
          >
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/60">
                  {expandedRowRender && <th scope="col" className="w-10 px-2 py-3" />}
                  {rowSelection && (
                    <th scope="col" className="w-12 px-4 py-3">
                      <Checkbox
                        checked={allSelected ? true : someSelected ? "indeterminate" : false}
                        onCheckedChange={toggleAll}
                        aria-label="Select all rows"
                      />
                    </th>
                  )}
                  {columns.map((column) => (
                    <th
                      key={column.key}
                      scope="col"
                      style={column.width ? { width: column.width } : undefined}
                      aria-sort={
                        sort?.key === column.key
                          ? sort.order === "asc"
                            ? "ascending"
                            : "descending"
                          : column.sorter
                            ? "none"
                            : undefined
                      }
                      className={cn(
                        "whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground",
                        alignClasses[column.align ?? "left"],
                        column.hideBelow && hideBelowClasses[column.hideBelow],
                        column.className
                      )}
                    >
                      <span className="inline-flex items-center gap-1.5">
                        {column.sorter ? (
                          <button
                            type="button"
                            onClick={() => toggleSort(column.key)}
                            className="inline-flex items-center gap-1.5 rounded transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            {column.title}
                            {sort?.key === column.key ? (
                              sort.order === "asc" ? (
                                <ArrowUp aria-hidden="true" className="size-3.5" />
                              ) : (
                                <ArrowDown aria-hidden="true" className="size-3.5" />
                              )
                            ) : (
                              <ChevronsUpDown aria-hidden="true" className="size-3.5 opacity-50" />
                            )}
                          </button>
                        ) : (
                          column.title
                        )}
                        {column.filter}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {loading
                  ? Array.from({ length: skeletonRows }, (_, rowIndex) => (
                      <tr key={rowIndex} className="border-b border-border last:border-0">
                        {expandedRowRender && <td className="px-2 py-3.5" />}
                        {rowSelection && (
                          <td className="px-4 py-3.5">
                            <Skeleton className="size-[18px] rounded-[5px]" />
                          </td>
                        )}
                        {columns.map((column) => (
                          <td
                            key={column.key}
                            className={cn(
                              "px-4 py-3.5",
                              column.hideBelow && hideBelowClasses[column.hideBelow]
                            )}
                          >
                            <Skeleton className="h-4 w-full max-w-[140px]" />
                          </td>
                        ))}
                      </tr>
                    ))
                  : sortedData.map((record, index) => {
                      const key = getKey(record, index);
                      const isSelected = selectedKeys.includes(key);
                      const rowProps = onRow?.(record, index) ?? {};
                      const isExpanded = expandedKeys.includes(key);
                      const canExpand = expandedRowRender
                        ? (rowExpandable?.(record) ?? true)
                        : false;

                      return (
                        <React.Fragment key={key}>
                        <tr
                          {...rowProps}
                          data-selected={isSelected || undefined}
                          className={cn(
                            "border-b border-border transition-colors last:border-0",
                            "hover:bg-muted/50 data-[selected]:bg-accent",
                            rowProps.className,
                            rowClassName?.(record, index)
                          )}
                        >
                          {expandedRowRender && (
                            <td className="px-2 py-3.5">
                              {canExpand && (
                                <button
                                  type="button"
                                  onClick={() => toggleExpanded(key)}
                                  aria-expanded={isExpanded}
                                  aria-label={isExpanded ? "Collapse row" : "Expand row"}
                                  className="grid size-7 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                >
                                  <ChevronRight
                                    aria-hidden="true"
                                    className={cn(
                                      "size-4 transition-transform",
                                      isExpanded && "rotate-90"
                                    )}
                                  />
                                </button>
                              )}
                            </td>
                          )}
                          {rowSelection && (
                            <td className="px-4 py-3.5">
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={() => toggleRow(record, index)}
                                aria-label="Select row"
                              />
                            </td>
                          )}
                          {columns.map((column) => {
                            const value = readCell(record, column.dataIndex);
                            return (
                              <td
                                key={column.key}
                                className={cn(
                                  "px-4 py-3.5 align-middle text-foreground",
                                  alignClasses[column.align ?? "left"],
                                  column.hideBelow && hideBelowClasses[column.hideBelow],
                                  column.className
                                )}
                              >
                                {column.render
                                  ? column.render(value, record, index)
                                  : (value as React.ReactNode)}
                              </td>
                            );
                          })}
                        </tr>

                        {isExpanded && expandedRowRender && (
                          <tr className="border-b border-border last:border-0">
                            <td
                              colSpan={
                                columns.length + (rowSelection ? 1 : 0) + 1
                              }
                              className="bg-muted/30 p-0"
                            >
                              {expandedRowRender(record)}
                            </td>
                          </tr>
                        )}
                        </React.Fragment>
                      );
                    })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {pagination && !loading && <Pagination {...pagination} />}
    </div>
  );
}

export { DataTable };
