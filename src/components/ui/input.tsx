import * as React from "react";
import { cn } from "../../libs/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  // Renders the error styling; pair with aria-invalid + aria-describedby on the caller.
  invalid?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", invalid, ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      aria-invalid={invalid || undefined}
      className={cn(
        "flex h-11 w-full rounded-lg border border-input bg-white px-3.5 text-sm text-foreground shadow-dc-xs transition-colors",
        "placeholder:text-muted-foreground",
        "focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/25",
        "disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-60",
        invalid && "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/25",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";

export { Input };
