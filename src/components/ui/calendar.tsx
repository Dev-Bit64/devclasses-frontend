import { DayPicker, type DayPickerRangeProps } from "react-day-picker";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../../libs/utils";

export type CalendarProps = Omit<DayPickerRangeProps, "mode"> & {
  className?: string;
};

/**
 * Range calendar. Styled entirely through classNames so react-day-picker's stylesheet is
 * never loaded, keeping the calendar on the Dev Classes design tokens.
 */
const Calendar = ({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) => (
  <DayPicker
    mode="range"
    showOutsideDays={showOutsideDays}
    className={cn("p-1", className)}
    classNames={{
      months: "flex flex-col gap-4 sm:flex-row",
      month: "flex flex-col gap-3",
      caption: "relative flex items-center justify-center pt-1",
      caption_label: "text-sm font-semibold text-foreground",
      nav: "flex items-center",
      nav_button:
        "inline-flex size-7 items-center justify-center rounded-md border border-border bg-white text-muted-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40",
      nav_button_previous: "absolute left-1",
      nav_button_next: "absolute right-1",
      table: "w-full border-collapse",
      head_row: "flex",
      head_cell: "w-9 text-[0.7rem] font-medium uppercase text-muted-foreground",
      row: "mt-1 flex w-full",
      cell: "relative p-0 text-center text-sm focus-within:relative",
      day: "inline-flex size-9 items-center justify-center rounded-md text-sm text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring aria-selected:opacity-100",
      day_selected:
        "bg-primary text-primary-foreground hover:bg-primary-hover focus:bg-primary-hover",
      // The span between the two endpoints reads as a connected block.
      day_range_middle: "rounded-none bg-accent text-accent-foreground hover:bg-accent",
      day_range_start: "rounded-l-md",
      day_range_end: "rounded-r-md",
      day_today: "font-bold text-primary",
      day_outside: "text-muted-foreground opacity-40",
      day_disabled: "text-muted-foreground opacity-40",
      day_hidden: "invisible",
      ...classNames,
    }}
    components={{
      IconLeft: () => <ChevronLeft aria-hidden="true" className="size-4" />,
      IconRight: () => <ChevronRight aria-hidden="true" className="size-4" />,
    }}
    {...props}
  />
);

export { Calendar };
