import { GraduationCap, School } from "lucide-react";
import { cn } from "../../libs/utils";

export type DashboardProduct = "school" | "college";

// Persisted so a refresh keeps the admin on the product they were looking at.
const STORAGE_KEY = "dashboardProduct";

/** Reads the stored choice, defaulting to school — the product that already existed. */
export const readStoredProduct = (): DashboardProduct =>
  localStorage.getItem(STORAGE_KEY) === "college" ? "college" : "school";

export const storeProduct = (product: DashboardProduct) => {
  localStorage.setItem(STORAGE_KEY, product);
};

const OPTIONS: { value: DashboardProduct; label: string; icon: typeof School }[] = [
  { value: "school", label: "School", icon: School },
  { value: "college", label: "College", icon: GraduationCap },
];

export interface ProductSwitcherProps {
  value: DashboardProduct;
  onChange: (product: DashboardProduct) => void;
}

/**
 * School / College toggle for the admin dashboard. Presentation only — each dashboard API
 * authorises its own call, so this never decides who may see what.
 */
const ProductSwitcher = ({ value, onChange }: ProductSwitcherProps) => (
  <div
    role="tablist"
    aria-label="Choose which product to view"
    // Full width on a phone so both options stay comfortably tappable, inline from `sm` up.
    className="flex w-full gap-1 rounded-xl border border-border bg-muted p-1 sm:w-auto"
  >
    {OPTIONS.map((option) => {
      const Icon = option.icon;
      const isSelected = value === option.value;

      return (
        <button
          key={option.value}
          type="button"
          role="tab"
          aria-selected={isSelected}
          onClick={() => onChange(option.value)}
          className={cn(
            "flex min-h-10 flex-1 items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium transition-colors sm:flex-none",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
            isSelected
              ? "bg-card text-foreground shadow-dc-xs"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Icon aria-hidden="true" className="size-4" />
          {option.label}
        </button>
      );
    })}
  </div>
);

export { ProductSwitcher };
