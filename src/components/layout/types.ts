import type { LucideIcon } from "lucide-react";

/** A single sidebar destination. `key` is the route path, matching the existing menu config. */
export interface AppNavItem {
  key: string;
  label: string;
  icon: LucideIcon;
}

/**
 * A labelled run of destinations, e.g. the school portal versus the college app.
 * `label` is optional so a menu with nothing to separate stays a plain list.
 */
export interface AppNavSection {
  // Doubles as the group's accessible name, so it is announced even when hidden.
  label?: string;
  items: AppNavItem[];
}
