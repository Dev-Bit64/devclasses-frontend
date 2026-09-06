import { ChevronLeft, LogOut } from "lucide-react";
import { BrandLogo } from "../landing/primitives/BrandLogo";
import { ConfirmDialog } from "../common/ConfirmDialog";
import { SidebarNav } from "./SidebarNav";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import type { AppNavSection } from "./types";
import { cn } from "../../libs/utils";

export interface AppSidebarProps {
  sections: AppNavSection[];
  activeKey?: string;
  collapsed?: boolean;
  onNavigate: (key: string) => void;
  // Omitted in the mobile drawer, where the collapse control has no meaning.
  onToggleCollapse?: () => void;
  onLogout: () => void;
  userName: string;
  userRole?: string;
}

// Initials stand in for an avatar image, which this app does not store.
const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "U";

/**
 * Dark application sidebar: brand, destinations and the signed-in user.
 * Presentational — navigation and logout are handled by the caller.
 */
const AppSidebar = ({
  sections,
  activeKey,
  collapsed = false,
  onNavigate,
  onToggleCollapse,
  onLogout,
  userName,
  userRole,
}: AppSidebarProps) => (
  <div className="flex h-full flex-col bg-sidebar">
    <div
      className={cn(
        "flex h-16 shrink-0 items-center border-b border-sidebar-border px-4",
        collapsed ? "justify-center" : "justify-between gap-2"
      )}
    >
      {collapsed ? (
        <BrandLogo tone="light" showTagline={false} to="/dashboard" className="[&_span]:hidden" />
      ) : (
        <BrandLogo tone="light" showTagline={false} to="/dashboard" />
      )}

      {/* Desktop-only collapse toggle. */}
      {onToggleCollapse && !collapsed && (
        <button
          type="button"
          onClick={onToggleCollapse}
          aria-label="Collapse sidebar"
          className="grid size-8 shrink-0 place-items-center rounded-lg text-sidebar-foreground transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
        >
          <ChevronLeft aria-hidden="true" className="size-4" />
        </button>
      )}
    </div>

    {onToggleCollapse && collapsed && (
      <button
        type="button"
        onClick={onToggleCollapse}
        aria-label="Expand sidebar"
        className="mx-3 mt-3 grid h-8 place-items-center rounded-lg text-sidebar-foreground transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
      >
        <ChevronLeft aria-hidden="true" className="size-4 rotate-180" />
      </button>
    )}

    <SidebarNav
      sections={sections}
      activeKey={activeKey}
      collapsed={collapsed}
      onNavigate={onNavigate}
    />

    <div className="shrink-0 border-t border-sidebar-border p-3">
      <div
        className={cn(
          "flex items-center gap-3 rounded-lg px-2 py-2",
          collapsed && "justify-center px-0"
        )}
      >
        <span
          aria-hidden="true"
          className="grid size-9 shrink-0 place-items-center rounded-full bg-sidebar-accent text-xs font-bold text-white"
        >
          {getInitials(userName)}
        </span>
        {!collapsed && (
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-semibold text-white">{userName}</span>
            {userRole && (
              <span className="truncate text-xs capitalize text-sidebar-foreground">
                {userRole.toLowerCase()}
              </span>
            )}
          </div>
        )}
      </div>

      <TooltipProvider delayDuration={150}>
        {collapsed ? (
          // Both triggers are asChild and chained — dialog trigger, then tooltip trigger,
          // then the button. The Tooltip *root* must never be the dialog's trigger: it is a
          // plain function component, so the ref the trigger hands down lands nowhere.
          <Tooltip>
            <ConfirmDialog
              variant="warning"
              title="Log out of Dev Classes?"
              description="You will need to sign in again to continue practising."
              confirmLabel="Log out"
              cancelLabel="Stay signed in"
              onConfirm={onLogout}
              trigger={
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    aria-label="Log out"
                    className="mt-1 grid h-9 w-full place-items-center rounded-lg text-sidebar-foreground transition-colors hover:bg-destructive/20 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
                  >
                    <LogOut aria-hidden="true" className="size-[18px]" />
                  </button>
                </TooltipTrigger>
              }
            />
            <TooltipContent side="right">Log out</TooltipContent>
          </Tooltip>
        ) : (
          <ConfirmDialog
            variant="warning"
            title="Log out of Dev Classes?"
            description="You will need to sign in again to continue practising."
            confirmLabel="Log out"
            cancelLabel="Stay signed in"
            onConfirm={onLogout}
            trigger={
              <button
                type="button"
                className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-destructive/20 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
              >
                <LogOut aria-hidden="true" className="size-[18px] shrink-0" />
                Log out
              </button>
            }
          />
        )}
      </TooltipProvider>
    </div>
  </div>
);

export { AppSidebar };
