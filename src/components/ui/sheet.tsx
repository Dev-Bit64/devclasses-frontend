import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { PORTAL_SCOPE } from "./portal-scope";
import { cn } from "../../libs/utils";

// Sheet is a side-anchored dialog; used for the mobile navigation drawer.
const Sheet = DialogPrimitive.Root;
const SheetTrigger = DialogPrimitive.Trigger;
const SheetClose = DialogPrimitive.Close;

// Anchor styles per side, including the matching slide-in direction.
const sideClasses = {
  right:
    "inset-y-0 right-0 border-l data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right",
  left:
    "inset-y-0 left-0 border-r data-[state=open]:slide-in-from-left data-[state=closed]:slide-out-to-left",
} as const;

interface SheetContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  title?: string;
  // Defaults to the right edge, matching the public navigation drawer.
  side?: keyof typeof sideClasses;
  // Hides the built-in close button when the content supplies its own.
  hideClose?: boolean;
}

const SheetContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  SheetContentProps
>(({ className, children, title = "Menu", side = "right", hideClose, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <div className={PORTAL_SCOPE}>
      <DialogPrimitive.Overlay
        className={cn(
          "fixed inset-0 z-[1100] bg-slate-950/50 backdrop-blur-sm",
          "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0"
        )}
      />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          "fixed z-[1101] flex w-[86%] max-w-sm flex-col gap-2 border-border bg-background p-6 shadow-dc-xl",
          "data-[state=open]:animate-in data-[state=closed]:animate-out duration-300",
          sideClasses[side],
          className
        )}
        {...props}
      >
        {/* Radix requires an accessible title; it is visually hidden here. */}
        <DialogPrimitive.Title className="sr-only">{title}</DialogPrimitive.Title>
        {!hideClose && (
          <DialogPrimitive.Close
            className="absolute right-4 top-4 grid size-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Close menu"
          >
            <X className="size-5" />
          </DialogPrimitive.Close>
        )}
        {children}
      </DialogPrimitive.Content>
    </div>
  </DialogPrimitive.Portal>
));
SheetContent.displayName = "SheetContent";

export { Sheet, SheetTrigger, SheetClose, SheetContent };
