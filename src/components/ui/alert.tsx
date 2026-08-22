import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { AlertCircle, CheckCircle2, Info, TriangleAlert } from "lucide-react";
import { cn } from "../../libs/utils";

const alertVariants = cva("flex gap-3 rounded-xl border p-4", {
  variants: {
    variant: {
      info: "border-info/25 bg-info/5 text-foreground",
      success: "border-success/25 bg-success/5 text-foreground",
      warning: "border-warning/30 bg-warning/5 text-foreground",
      error: "border-destructive/25 bg-destructive/5 text-foreground",
    },
  },
  defaultVariants: { variant: "info" },
});

// Each variant pairs a colour with an icon, so state never depends on colour alone.
const variantIcons = {
  info: Info,
  success: CheckCircle2,
  warning: TriangleAlert,
  error: AlertCircle,
} as const;

const iconTones = {
  info: "text-info",
  success: "text-success",
  warning: "text-warning",
  error: "text-destructive",
} as const;

export interface AlertProps
  // `title` is omitted so it can accept rich content instead of the native string attribute.
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'>,
    VariantProps<typeof alertVariants> {
  title?: React.ReactNode;
  description?: React.ReactNode;
}

const Alert = ({ className, variant, title, description, children, ...props }: AlertProps) => {
  const tone = variant ?? "info";
  const Icon = variantIcons[tone];

  return (
    <div
      role={tone === "error" || tone === "warning" ? "alert" : "status"}
      className={cn(alertVariants({ variant }), className)}
      {...props}
    >
      <Icon aria-hidden="true" className={cn("mt-0.5 size-5 shrink-0", iconTones[tone])} />
      <div className="flex min-w-0 flex-col gap-1">
        {title && <p className="text-sm font-semibold text-foreground">{title}</p>}
        {description && (
          <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
        )}
        {children}
      </div>
    </div>
  );
};

export { Alert, alertVariants };
