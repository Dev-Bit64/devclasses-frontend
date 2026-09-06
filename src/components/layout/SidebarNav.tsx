import { useId } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import type { AppNavItem, AppNavSection } from "./types";
import { cn } from "../../libs/utils";

export interface SidebarNavProps {
  sections: AppNavSection[];
  // Route path of the active item, produced by the layout's existing selected-key logic.
  activeKey?: string;
  collapsed?: boolean;
  onNavigate: (key: string) => void;
}

/**
 * Sidebar destination list, shared by the desktop rail and the mobile drawer.
 * Navigation itself stays with the layout; this only reports which item was chosen.
 * Sections carry the two products apart — the school portal and the college app —
 * which otherwise read as one undifferentiated run of eleven links.
 */
const SidebarNav = ({ sections, activeKey, collapsed = false, onNavigate }: SidebarNavProps) => {
  const headingId = useId();

  const renderItem = (item: AppNavItem) => {
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
  };

  return (
    <TooltipProvider delayDuration={150}>
      <nav aria-label="Main" className="dc-scroll dc-scroll-dark flex-1 overflow-y-auto px-3 py-4">
        {sections.map((section, index) => {
          const labelId = `${headingId}-${index}`;

          return (
            <div key={section.label ?? index} className={index > 0 ? "mt-5" : undefined}>
              {section.label && (
                <>
                  {/* Collapsed to icons there is no room for a heading, so the groups are
                      separated by a rule instead — the heading stays for screen readers. */}
                  {collapsed && index > 0 && (
                    <hr aria-hidden="true" className="mb-4 border-sidebar-border" />
                  )}
                  <h2
                    id={labelId}
                    className={cn(
                      "px-3 pb-2 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-sidebar-foreground/60",
                      collapsed && "sr-only"
                    )}
                  >
                    {section.label}
                  </h2>
                </>
              )}

              <ul
                className="flex flex-col gap-1"
                {...(section.label ? { "aria-labelledby": labelId } : {})}
              >
                {section.items.map(renderItem)}
              </ul>
            </div>
          );
        })}
      </nav>
    </TooltipProvider>
  );
};

export { SidebarNav };
