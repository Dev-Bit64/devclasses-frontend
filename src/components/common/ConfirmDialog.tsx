import * as React from "react";
import { AlertTriangle, Info, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import { Button } from "../ui/button";
import { Spinner } from "../ui/spinner";
import { cn } from "../../libs/utils";

type ConfirmVariant = "default" | "warning" | "destructive";

// Each variant pairs an icon with a tone so intent is clear without relying on colour.
const variantConfig: Record<
  ConfirmVariant,
  { icon: typeof Info; iconClass: string; button: "primary" | "destructive" }
> = {
  default: { icon: Info, iconClass: "bg-accent text-accent-foreground", button: "primary" },
  warning: { icon: AlertTriangle, iconClass: "bg-warning/10 text-warning", button: "primary" },
  destructive: { icon: Trash2, iconClass: "bg-destructive/10 text-destructive", button: "destructive" },
};

export interface ConfirmDialogProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmVariant;
  // Invoked on confirm; the caller keeps ownership of the action and its side effects.
  onConfirm: () => void;
  loading?: boolean;
  // The element that opens the dialog, mirroring how Popconfirm wrapped its child.
  trigger: React.ReactNode;
  className?: string;
}

/**
 * Confirmation prompt for irreversible or disruptive actions.
 * Purely presentational: it renders the prompt and calls back, nothing more.
 */
const ConfirmDialog = ({
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  onConfirm,
  loading = false,
  trigger,
  className,
}: ConfirmDialogProps) => {
  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent className={className}>
        <div className="flex gap-4">
          <div
            className={cn(
              "grid size-11 shrink-0 place-items-center rounded-full",
              config.iconClass
            )}
          >
            <Icon aria-hidden="true" className="size-5" />
          </div>
          <div className="flex min-w-0 flex-col gap-1.5">
            <AlertDialogTitle>{title}</AlertDialogTitle>
            {description && <AlertDialogDescription>{description}</AlertDialogDescription>}
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="secondary" disabled={loading}>
              {cancelLabel}
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button variant={config.button} onClick={onConfirm} disabled={loading}>
              {loading && <Spinner />}
              {confirmLabel}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export { ConfirmDialog };
