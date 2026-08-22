import type { LucideIcon } from "lucide-react";

/** A single sidebar destination. `key` is the route path, matching the existing menu config. */
export interface AppNavItem {
  key: string;
  label: string;
  icon: LucideIcon;
}
