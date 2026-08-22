import * as React from "react";
import type { DateRange } from "react-day-picker";
import dayjs, { type Dayjs } from "dayjs";
import { CalendarDays, X } from "lucide-react";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { cn } from "../../libs/utils";

export interface DateRangePickerProps {
  // Kept as a Dayjs tuple so existing callers and their filter logic are unchanged.
  value: [Dayjs, Dayjs] | null;
  onChange: (range: [Dayjs, Dayjs] | null) => void;
  placeholder?: string;
  id?: string;
  className?: string;
}

const formatLabel = (range: [Dayjs, Dayjs] | null, placeholder: string) =>
  range ? `${range[0].format("MMM D, YYYY")} - ${range[1].format("MMM D, YYYY")}` : placeholder;

/**
 * Date range filter. Converts between react-day-picker's Date range and the Dayjs tuple the
 * pages already use, so no downstream date handling changes.
 */
const DateRangePicker = ({
  value,
  onChange,
  placeholder = "Select date range",
  id,
  className,
}: DateRangePickerProps) => {
  const [open, setOpen] = React.useState(false);

  const selected: DateRange | undefined = value
    ? { from: value[0].toDate(), to: value[1].toDate() }
    : undefined;

  const handleSelect = (range: DateRange | undefined) => {
    // Only report a complete range; a half-picked range leaves the current filter in place.
    if (range?.from && range?.to) {
      onChange([dayjs(range.from), dayjs(range.to)]);
      setOpen(false);
    } else if (!range?.from) {
      onChange(null);
    }
  };

  const clear = (event: React.MouseEvent) => {
    event.stopPropagation();
    onChange(null);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          id={id}
          className={cn(
            "flex h-11 w-full items-center justify-between gap-2 rounded-lg border border-input bg-white px-3.5 text-sm shadow-dc-xs transition-colors",
            "focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/25",
            open && "border-primary ring-2 ring-ring/25",
            className
          )}
        >
          <span className="flex min-w-0 items-center gap-2">
            <CalendarDays aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
            <span className={cn("truncate", value ? "text-foreground" : "text-muted-foreground")}>
              {formatLabel(value, placeholder)}
            </span>
          </span>
          {value && (
            // Rendered as a span so it is not a button nested inside a button.
            <span
              role="button"
              tabIndex={0}
              aria-label="Clear date range"
              onClick={clear}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  clear(event as unknown as React.MouseEvent);
                }
              }}
              className="grid size-5 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <X aria-hidden="true" className="size-3.5" />
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-3">
        {/* Two months on wider screens makes picking a span far quicker. */}
        <Calendar
          selected={selected}
          onSelect={handleSelect}
          defaultMonth={value?.[0]?.toDate()}
          numberOfMonths={1}
          className="sm:hidden"
        />
        <Calendar
          selected={selected}
          onSelect={handleSelect}
          defaultMonth={value?.[0]?.toDate()}
          numberOfMonths={2}
          className="hidden sm:block"
        />
      </PopoverContent>
    </Popover>
  );
};

export { DateRangePicker };
