import * as React from "react";
import { Filter } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Checkbox } from "../ui/checkbox";
import { Button } from "../ui/button";
import { cn } from "../../libs/utils";

export interface ColumnFilterOption {
  text: string;
  value: string;
}

export interface ColumnFilterProps {
  label: string;
  options: ColumnFilterOption[];
  // Currently applied values, owned by the page.
  value: string[];
  // Fired when OK is pressed; the page decides what to re-fetch.
  onApply: (values: string[]) => void;
  onReset: () => void;
}

/**
 * Header-mounted column filter.
 * Selection is single-value, matching the previous filter dropdown, and nothing is applied
 * until OK is pressed — so the page controls exactly when it refetches.
 */
const ColumnFilter = ({ label, options, value, onApply, onReset }: ColumnFilterProps) => {
  const [open, setOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<string[]>(value);

  // Re-sync the draft selection whenever the applied value changes or the popover reopens.
  React.useEffect(() => {
    if (open) setSelected(value);
  }, [open, value]);

  const isActive = value.length > 0;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`Filter by ${label}`}
          className={cn(
            "grid size-6 shrink-0 place-items-center rounded transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            isActive ? "text-primary" : "text-muted-foreground"
          )}
        >
          <Filter aria-hidden="true" className={cn("size-3.5", isActive && "fill-current")} />
        </button>
      </PopoverTrigger>

      <PopoverContent align="start" className="w-52 p-2">
        <div className="flex flex-col gap-1 pb-2">
          {options.map((option) => (
            <label
              key={option.value}
              className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm font-normal normal-case tracking-normal text-foreground transition-colors hover:bg-muted"
            >
              <Checkbox
                checked={selected.includes(option.value)}
                // Only one value at a time, as the previous dropdown enforced.
                onCheckedChange={(checked) => setSelected(checked ? [option.value] : [])}
              />
              {option.text}
            </label>
          ))}
        </div>

        <div className="flex gap-2 border-t border-border pt-2">
          <Button
            size="sm"
            className="flex-1"
            onClick={() => {
              onApply(selected);
              setOpen(false);
            }}
          >
            OK
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="flex-1"
            onClick={() => {
              setSelected([]);
              onReset();
              setOpen(false);
            }}
          >
            Reset
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export { ColumnFilter };
