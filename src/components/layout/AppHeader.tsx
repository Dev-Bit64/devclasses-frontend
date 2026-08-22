import { LogOut, Menu, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { cn } from "../../libs/utils";

export interface AppHeaderProps {
  // Opens the mobile navigation drawer; omitted on desktop where the sidebar is persistent.
  onOpenMobileNav?: () => void;
  title?: string;
  userName: string;
  userEmail?: string;
  onEditProfile: () => void;
  onLogout: () => void;
}

const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "U";

/**
 * Sticky application header: mobile menu trigger, current page title and the user menu.
 * All actions are delegated to the caller.
 */
const AppHeader = ({
  onOpenMobileNav,
  title,
  userName,
  userEmail,
  onEditProfile,
  onLogout,
}: AppHeaderProps) => (
  <header className="sticky top-0 z-[800] flex h-16 shrink-0 items-center justify-between gap-3 border-b border-border bg-background/85 px-4 backdrop-blur-md sm:px-6">
    <div className="flex min-w-0 items-center gap-3">
      {onOpenMobileNav && (
        <button
          type="button"
          onClick={onOpenMobileNav}
          aria-label="Open navigation menu"
          className="grid size-10 shrink-0 place-items-center rounded-lg text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Menu aria-hidden="true" className="size-5" />
        </button>
      )}
      {title && <h2 className="truncate text-base font-semibold text-foreground">{title}</h2>}
    </div>

    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Open user menu"
          className={cn(
            "flex items-center gap-2.5 rounded-full py-1 pl-1 pr-2 transition-colors",
            "hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          )}
        >
          <span
            aria-hidden="true"
            className="grid size-9 shrink-0 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground"
          >
            {getInitials(userName)}
          </span>
          {/* The name is redundant on small screens, where space is tighter. */}
          <span className="hidden max-w-[10rem] truncate text-sm font-medium text-foreground sm:block">
            {userName}
          </span>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent>
        <DropdownMenuLabel>
          <span className="block truncate text-sm font-semibold text-foreground">{userName}</span>
          {userEmail && (
            <span className="block truncate text-xs text-muted-foreground">{userEmail}</span>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={onEditProfile}>
          <User aria-hidden="true" />
          Edit Profile
        </DropdownMenuItem>
        <DropdownMenuItem destructive onSelect={onLogout}>
          <LogOut aria-hidden="true" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </header>
);

export { AppHeader };
