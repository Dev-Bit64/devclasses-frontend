import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../libs/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full font-medium [&_svg]:size-3.5 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-accent text-accent-foreground",
        outline: "border border-border bg-white text-muted-foreground shadow-dc-xs",
        solid: "bg-primary text-primary-foreground",
        success: "bg-emerald-50 text-emerald-700",
      },
      size: {
        sm: "px-2.5 py-0.5 text-xs",
        md: "px-3 py-1 text-[0.8rem]",
      },
    },
    defaultVariants: { variant: "default", size: "sm" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = ({ className, variant, size, ...props }: BadgeProps) => (
  <span className={cn(badgeVariants({ variant, size }), className)} {...props} />
);

export { Badge, badgeVariants };
