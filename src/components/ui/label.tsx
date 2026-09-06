import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cn } from "../../libs/utils";

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> & { required?: boolean }
>(({ className, required, children, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(
      "block text-sm font-medium text-foreground peer-disabled:opacity-60",
      className
    )}
    {...props}
  >
    {children}
    {/* Asterisk is decorative; the input itself carries `required` for assistive tech. */}
    {required && (
      <span aria-hidden="true" className="ml-0.5 text-destructive">
        *
      </span>
    )}
  </LabelPrimitive.Root>
));
Label.displayName = "Label";

export { Label };
