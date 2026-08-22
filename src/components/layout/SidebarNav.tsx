import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import type { AppNavItem } from "./types";
import { cn } from "../../libs/utils";

export interface SidebarNavProps {
  items: AppNavItem[];
  // Route path of the active item, produced by the layout's existing selected-key logic.
  activeKey?: string;
  collapsed?: boolean;
  onNavigate: (key: string) => void;
}

/**
 * Sidebar destination list, shared by the desktop rail and the mobile drawer.
 * Navigation itself stays with the layout; this only reports which item was chosen.
 */
const SidebarNav = ({ items, activeKey, collapsed = false, onNavigate }: SidebarNavProps) => (
  <TooltipProvider delayDuration={150}>
    <nav aria-label="Main" className="flex-1 overflow-y-auto px-3 py-4">
      <ul className="flex flex-col gap-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = item.key === activeKey;

          const button = (
            <button
              type="button"
              onClick={() => onNavigate(item.key)}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "group relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar",
                isActive
                  ? "bg-sidebar-accent text-white"
                  : "text-sidebar-foreground hover:bg-white/5 hover:text-white",
                collapsed && "justify-center px-0"
              )}
            >
              {/* Active rail gives the state a second, non-colour cue. */}
              {isActive && !collapsed && (
                <span
                  aria-hidden="true"
                  className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-white"
                />
              )}
              <Icon aria-hidden="true" className="size-[18px] shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </button>
          );

          return (
            <li key={item.key}>
              {collapsed ? (
                <Tooltip>
                  <TooltipTrigger asChild>{button}</TooltipTrigger>
                  <TooltipContent side="right">{item.label}</TooltipContent>
                </Tooltip>
              ) : (
                button
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  </TooltipProvider>
);

export { SidebarNav };
