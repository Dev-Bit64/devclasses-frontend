/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { PasswordInput } from "../ui/password-input";
import { FormField } from "../ui/form-field";
import { AppDispatch } from "../../redux/store";
import { loginAction } from "../../redux/action/authAction";
import { toastText } from "../../utils/toast";

// Same rules the previous antd form enforced.
const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Please input your email!")
    .email("The input is not valid E-mail!"),
  password: z.string().min(1, "Please input your password!"),
});

type LoginValues = z.infer<typeof loginSchema>;

export interface LoginFormProps {
  // Defaults to navigating to /dashboard, matching the previous behaviour.
  onSuccess?: () => void;
  onForgotPassword?: () => void;
}

export const LoginForm = ({ onSuccess, onForgotPassword }: LoginFormProps) => {
  const [isLoading, setIsLoading] = React.useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  // Payload, action, toasts and redirect are unchanged from the original implementation.
  const onSubmit = (values: LoginValues) => {
    setIsLoading(true);
    dispatch(loginAction({ email: values.email, password: values.password }))
      .unwrap()
      .then((response: any) => {
        toastText(response?.message || "User logged in successfully!", "success");
        setIsLoading(false);
        if (onSuccess) onSuccess();
        else navigate("/dashboard");
      })
      .catch((err: any) => {
        toastText(err?.message || "User login failed!", "error");
        setIsLoading(false);
      });
  };

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <FormField id="login-email" label="Email" required error={errors.email?.message}>
        {(aria) => (
          <Input
            {...aria}
            {...register("email")}
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            invalid={Boolean(errors.email)}
          />
        )}
      </FormField>

      <div className="flex flex-col gap-1.5">
        <FormField id="login-password" label="Password" required error={errors.password?.message}>
          {(aria) => (
            <PasswordInput
              {...aria}
              {...register("password")}
              autoComplete="current-password"
              placeholder="Enter your password"
              invalid={Boolean(errors.password)}
            />
          )}
        </FormField>
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onForgotPassword}
            className="rounded text-sm font-medium text-primary transition-colors hover:text-primary-hover hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Forgot password?
          </button>
        </div>
      </div>

      <Button type="submit" size="lg" block disabled={isLoading} className="mt-1">
        {isLoading ? (
          <>
            <Loader2 aria-hidden="true" className="animate-spin" />
            Logging in…
          </>
        ) : (
          "Log in"
        )}
      </Button>
    </form>
  );
};
