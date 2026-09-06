import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../../libs/utils";

export interface NativeSelectOption {
  value: string;
  label: string;
}

export interface NativeSelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: NativeSelectOption[];
  placeholder?: string;
  invalid?: boolean;
}

/**
 * A styled native <select>. Deliberately native rather than a Radix listbox so mobile users get
 * the real OS picker and keyboard/screen-reader behaviour comes for free.
 */
const NativeSelect = React.forwardRef<HTMLSelectElement, NativeSelectProps>(
  ({ className, options, placeholder, invalid, value, ...props }, ref) => {
    const isEmpty = value === "" || value === undefined || value === null;

    return (
      <div className="relative">
        <select
          ref={ref}
          value={value ?? ""}
          aria-invalid={invalid || undefined}
          className={cn(
            "h-11 w-full appearance-none rounded-lg border border-input bg-white pl-3.5 pr-10 text-sm shadow-dc-xs transition-colors",
            "focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/25",
            "disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-60",
            // Mirrors the placeholder colour of Input while nothing is chosen.
            isEmpty ? "text-muted-foreground" : "text-foreground",
            invalid && "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/25",
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value} className="text-foreground">
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          aria-hidden="true"
          className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        />
      </div>
    );
  }
);
NativeSelect.displayName = "NativeSelect";

export { NativeSelect };
