import * as React from "react";
import { AlertCircle } from "lucide-react";
import { Label } from "./label";
import { cn } from "../../libs/utils";

export interface FormFieldProps {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
  // Receives the wiring the control needs so errors are announced correctly.
  children: (aria: {
    id: string;
    "aria-invalid": boolean;
    "aria-describedby": string | undefined;
  }) => React.ReactNode;
}

/**
 * Label + control + error message, wired together for assistive tech.
 * Errors use role="alert" so they are announced the moment validation fails.
 */
const FormField = ({
  id,
  label,
  error,
  hint,
  required,
  className,
  children,
}: FormFieldProps) => {
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const describedBy = [error ? errorId : null, hint ? hintId : null]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label htmlFor={id} required={required}>
        {label}
      </Label>
      {children({
        id,
        "aria-invalid": Boolean(error),
        "aria-describedby": describedBy || undefined,
      })}
      {hint && !error && (
        <p id={hintId} className="text-xs text-muted-foreground">
          {hint}
        </p>
      )}
      {error && (
        <p
          id={errorId}
          role="alert"
          className="flex items-start gap-1.5 text-xs font-medium text-destructive"
        >
          <AlertCircle aria-hidden="true" className="mt-px size-3.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
};

export { FormField };
