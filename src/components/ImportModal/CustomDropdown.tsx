import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "../../libs/utils";

// Dropdown option type
export interface DropdownOption {
  value: string;
  label: string;
}

/**
 * `value` and `onChange` stay optional so the control can be driven either directly or through
 * a react-hook-form Controller, which is how the question and subject forms use it.
 */
export interface CustomDropdownProps {
  options?: DropdownOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  size?: "small" | "middle" | "large";
  dropdownStyle?: React.CSSProperties;
  style?: React.CSSProperties;
  id?: string;
}

// Matches the trigger height to the shared Input scale.
const sizeClasses: Record<NonNullable<CustomDropdownProps["size"]>, string> = {
  small: "h-9 px-3 text-sm",
  middle: "h-11 px-3.5 text-sm",
  large: "h-12 px-4 text-base",
};

/**
 * CustomDropdown - accessible single-select listbox.
 * Supports mouse, keyboard (arrows, Home/End, Enter, Escape) and type-ahead selection.
 */
const CustomDropdown: React.FC<CustomDropdownProps> = ({
  options = [],
  value,
  onChange,
  placeholder = "Select",
  disabled = false,
  className = "",
  size = "middle",
  dropdownStyle,
  style,
  id,
}) => {
  const [open, setOpen] = useState(false);
  // Index of the visually highlighted option while navigating with the keyboard.
  const [activeIndex, setActiveIndex] = useState(-1);
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const typeaheadRef = useRef({ query: "", at: 0 });
  const reactId = useId();
  const listboxId = `${id ?? reactId}-listbox`;

  const selectedIndex = useMemo(
    () => options.findIndex((opt) => opt.value === value),
    [options, value]
  );
  const selectedLabel = selectedIndex >= 0 ? options[selectedIndex].label : undefined;

  // Close when a click lands outside the component.
  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  // Opening highlights the current selection so arrow keys continue from there.
  useEffect(() => {
    if (open) setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
  }, [open, selectedIndex]);

  // Keep the highlighted option inside the scrollable list.
  useEffect(() => {
    if (!open || activeIndex < 0) return;
    listRef.current
      ?.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [open, activeIndex]);

  const commitSelection = useCallback(
    (optionValue: string) => {
      onChange?.(optionValue);
      setOpen(false);
    },
    [onChange]
  );

  // Jump to the next option starting with the typed characters.
  const runTypeahead = useCallback(
    (char: string) => {
      const now = Date.now();
      const state = typeaheadRef.current;
      state.query = now - state.at > 600 ? char : state.query + char;
      state.at = now;

      const match = options.findIndex((opt) =>
        opt.label.toLowerCase().startsWith(state.query.toLowerCase())
      );
      if (match >= 0) setActiveIndex(match);
    },
    [options]
  );

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        if (!open) setOpen(true);
        else setActiveIndex((prev) => Math.min(prev + 1, options.length - 1));
        break;
      case "ArrowUp":
        event.preventDefault();
        if (!open) setOpen(true);
        else setActiveIndex((prev) => Math.max(prev - 1, 0));
        break;
      case "Home":
        if (open) {
          event.preventDefault();
          setActiveIndex(0);
        }
        break;
      case "End":
        if (open) {
          event.preventDefault();
          setActiveIndex(options.length - 1);
        }
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        if (open && activeIndex >= 0 && options[activeIndex]) {
          commitSelection(options[activeIndex].value);
        } else {
          setOpen((prev) => !prev);
        }
        break;
      case "Escape":
        setOpen(false);
        break;
      case "Tab":
        setOpen(false);
        break;
      default:
        if (open && event.key.length === 1) runTypeahead(event.key);
    }
  };

  // Long option lists get an internal scrollbar; callers may override via dropdownStyle.
  const mergedDropdownStyle: React.CSSProperties = {
    maxHeight: 260,
    overflowY: "auto",
    overflowX: "hidden",
    ...dropdownStyle,
  };

  return (
    // `dc-app` keeps the scoped reset applied even if this is rendered outside a scoped page.
    <div ref={rootRef} className={cn("dc-app relative w-full", className)} style={style}>
      <button
        type="button"
        id={id}
        disabled={disabled}
        onClick={() => !disabled && setOpen((prev) => !prev)}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        aria-activedescendant={
          open && activeIndex >= 0 ? `${listboxId}-opt-${activeIndex}` : undefined
        }
        className={cn(
          "flex w-full items-center justify-between gap-2 rounded-lg border border-input bg-white text-left shadow-dc-xs transition-colors",
          "focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/25",
          "disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-60",
          open && "border-primary ring-2 ring-ring/25",
          sizeClasses[size]
        )}
      >
        <span
          className={cn("truncate", selectedLabel ? "text-foreground" : "text-muted-foreground")}
        >
          {selectedLabel || placeholder}
        </span>
        <ChevronDown
          aria-hidden="true"
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <div
          ref={listRef}
          id={listboxId}
          role="listbox"
          aria-label={placeholder}
          style={mergedDropdownStyle}
          className="absolute left-0 top-[calc(100%+4px)] z-[1150] w-full rounded-xl border border-border bg-popover p-1.5 shadow-dc-lg"
        >
          {options.length === 0 ? (
            <div className="px-3 py-2.5 text-sm text-muted-foreground">No options</div>
          ) : (
            options.map((opt, index) => {
              const isSelected = opt.value === value;
              return (
                <div
                  key={opt.value}
                  id={`${listboxId}-opt-${index}`}
                  data-index={index}
                  role="option"
                  aria-selected={isSelected}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={(event) => {
                    event.stopPropagation();
                    commitSelection(opt.value);
                  }}
                  className={cn(
                    "flex cursor-pointer items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-sm transition-colors",
                    index === activeIndex ? "bg-muted" : "bg-transparent",
                    isSelected ? "font-semibold text-primary" : "text-foreground"
                  )}
                >
                  <span className="truncate">{opt.label}</span>
                  {isSelected && <Check aria-hidden="true" className="size-4 shrink-0" />}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default CustomDropdown;
