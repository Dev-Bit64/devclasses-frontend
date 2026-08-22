/* eslint-disable no-useless-escape */
import * as React from "react";
import { useDispatch } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertCircle, CheckCircle2, Loader2, PartyPopper } from "lucide-react";
import { Button } from "../ui/button";
import { PasswordInput } from "../ui/password-input";
import { FormField } from "../ui/form-field";
import { AppDispatch } from "../../redux/store";
import { resetPasswordAction } from "../../redux/action/authAction";
import { cn } from "../../libs/utils";

// Identical rules to the previous antd form: 8+ chars, and upper + lower + digit.
const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(1, "Please enter your new password!")
      .min(8, "Password must be at least 8 characters long!")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain uppercase, lowercase, and numbers!"
      ),
    confirmPassword: z.string().min(1, "Please confirm your password!"),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: "Passwords do not match!",
    path: ["confirmPassword"],
  });

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

/** Same scoring as before: length, case, digits and symbols. */
const calculatePasswordStrength = (password: string): "weak" | "medium" | "strong" => {
  let strength = 0;
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) strength++;

  if (strength <= 2) return "weak";
  if (strength <= 4) return "medium";
  return "strong";
};

const STRENGTH_STYLES = {
  weak: { width: "33%", bar: "bg-rose-500", label: "Weak", text: "text-rose-600" },
  medium: { width: "66%", bar: "bg-amber-500", label: "Medium", text: "text-amber-600" },
  strong: { width: "100%", bar: "bg-emerald-500", label: "Strong", text: "text-emerald-600" },
} as const;

export interface ResetPasswordFormProps {
  // Called on the "back to login" links and after the success delay.
  onBackToLogin: () => void;
}

export const ResetPasswordForm = ({ onBackToLogin }: ResetPasswordFormProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [resetToken, setResetToken] = React.useState<string | null>(null);
  const [tokenError, setTokenError] = React.useState<string | null>(null);
  const [passwordStrength, setPasswordStrength] = React.useState<
    "weak" | "medium" | "strong" | null
  >(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  // The reset token arrives as ?token= on the URL — unchanged.
  React.useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setTokenError("Invalid or missing reset token. Please check your email link.");
    } else {
      setResetToken(token);
      setTokenError(null);
    }
  }, [searchParams]);

  const isDisabled = !resetToken || Boolean(tokenError);

  const onSubmit = async (values: ResetPasswordValues) => {
    if (!resetToken) {
      setTokenError("Reset token is missing. Please request a new password reset link.");
      return;
    }

    setIsLoading(true);
    try {
      const result = await dispatch(
        resetPasswordAction({ token: resetToken, newPassword: values.newPassword })
      );

      if (resetPasswordAction.fulfilled.match(result)) {
        setIsSuccess(true);
        reset();
        setPasswordStrength(null);
        // Same 3s delay before returning to login as the original implementation.
        setTimeout(onBackToLogin, 3000);
      }
    } catch (error) {
      console.error("Error resetting password:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center rounded-2xl border border-emerald-200 bg-emerald-50/60 p-8 text-center">
        <span className="grid size-14 place-items-center rounded-full bg-emerald-600 text-white">
          <PartyPopper aria-hidden="true" className="size-7" />
        </span>
        <h2 className="mt-5 text-lg font-bold text-foreground">Password reset successfully</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Your password has been changed. You will be taken back to the login page shortly.
        </p>
        <button
          type="button"
          onClick={onBackToLogin}
          className="mt-5 rounded text-sm font-semibold text-primary transition-colors hover:text-primary-hover hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Go back to login now
        </button>
      </div>
    );
  }

  const strength = passwordStrength ? STRENGTH_STYLES[passwordStrength] : null;

  return (
    <div className="flex flex-col gap-5">
      {/* Token status */}
      {tokenError ? (
        <p
          role="alert"
          className="flex items-start gap-2.5 rounded-xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm font-medium text-destructive"
        >
          <AlertCircle aria-hidden="true" className="mt-px size-4 shrink-0" />
          {tokenError}
        </p>
      ) : (
        resetToken && (
          <p className="flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
            <CheckCircle2 aria-hidden="true" className="mt-px size-4 shrink-0" />
            Reset link verified. You can now set your new password.
          </p>
        )
      )}

      <form noValidate onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <fieldset disabled={isDisabled} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <FormField
              id="reset-new-password"
              label="New password"
              required
              error={errors.newPassword?.message}
            >
              {(aria) => (
                <PasswordInput
                  {...aria}
                  {...register("newPassword", {
                    onChange: (event) =>
                      setPasswordStrength(
                        event.target.value
                          ? calculatePasswordStrength(event.target.value)
                          : null
                      ),
                  })}
                  autoComplete="new-password"
                  placeholder="Enter new password"
                  invalid={Boolean(errors.newPassword)}
                />
              )}
            </FormField>

            {strength && (
              <div className="flex items-center gap-3">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={cn("h-full rounded-full transition-all duration-300", strength.bar)}
                    style={{ width: strength.width }}
                  />
                </div>
                <span className={cn("text-xs font-semibold", strength.text)}>{strength.label}</span>
              </div>
            )}
          </div>

          <FormField
            id="reset-confirm-password"
            label="Confirm password"
            required
            error={errors.confirmPassword?.message}
          >
            {(aria) => (
              <PasswordInput
                {...aria}
                {...register("confirmPassword")}
                autoComplete="new-password"
                placeholder="Confirm new password"
                invalid={Boolean(errors.confirmPassword)}
              />
            )}
          </FormField>

          <Button type="submit" size="lg" block disabled={isLoading || isDisabled}>
            {isLoading ? (
              <>
                <Loader2 aria-hidden="true" className="animate-spin" />
                Resetting…
              </>
            ) : (
              "Reset password"
            )}
          </Button>
        </fieldset>
      </form>
    </div>
  );
};
