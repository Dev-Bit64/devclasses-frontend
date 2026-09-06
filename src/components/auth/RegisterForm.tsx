/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { NativeSelect } from "../ui/native-select";
import { PasswordInput } from "../ui/password-input";
import { FormField } from "../ui/form-field";
import { AppDispatch } from "../../redux/store";
import { RegisterForm as RegisterPayload } from "../../interfaces/interfaces";
import { registerAction } from "../../redux/action/authAction";
import { toastText } from "../../utils/toast";
import { BOARDS, STANDARDS } from "../landing/content";

// Options match the values the registration API accepts — unchanged.
const BOARD_OPTIONS = BOARDS.map((value) => ({ value, label: value }));
const STANDARD_OPTIONS = STANDARDS.map((value) => ({ value, label: value }));

// Mirrors the original antd rules: every field required, passwords must match.
const registerSchema = z
  .object({
    firstName: z.string().trim().min(1, "Please input your firstname!"),
    lastName: z.string().trim().min(1, "Please input your lastname!"),
    email: z.string().trim().min(1, "Please input your email!"),
    board: z.string().min(1, "Please select your board!"),
    standard: z.string().min(1, "Please select your standard!"),
    password: z.string().min(1, "Please input your password!"),
    confirmPassword: z.string().min(1, "Please confirm your password!"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match!",
    path: ["confirmPassword"],
  });

type RegisterValues = z.infer<typeof registerSchema>;

export interface RegisterFormProps {
  onSuccess?: () => void;
}

export const RegisterForm = ({ onSuccess }: RegisterFormProps) => {
  const [isLoading, setIsLoading] = React.useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // The landing page can pre-seed board/standard via query params; anything else is ignored.
  const presetBoard = searchParams.get("board");
  const presetStandard = searchParams.get("standard");

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      board: BOARDS.includes(presetBoard as any) ? (presetBoard as string) : "",
      standard: STANDARDS.includes(presetStandard as any) ? (presetStandard as string) : "",
      password: "",
      confirmPassword: "",
    },
  });

  // Payload shape, action and redirect are identical to the original implementation.
  const onSubmit = (values: RegisterValues) => {
    const payload: RegisterPayload = {
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      role: "STUDENT",
      password: values.password,
      board: values.board,
      standard: values.standard,
    };

    setIsLoading(true);
    dispatch(registerAction(payload))
      .unwrap()
      .then((response: any) => {
        toastText(response?.message || "Registration successful!", "success");
        setIsLoading(false);
        if (onSuccess) onSuccess();
        else navigate("/dashboard");
      })
      .catch((error: any) => {
        console.error("Registration error:", error);
        toastText(error?.message || "Registration failed!", "error");
        setIsLoading(false);
      });
  };

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField id="register-firstname" label="First name" required error={errors.firstName?.message}>
          {(aria) => (
            <Input
              {...aria}
              {...register("firstName")}
              autoComplete="given-name"
              placeholder="First name"
              invalid={Boolean(errors.firstName)}
            />
          )}
        </FormField>

        <FormField id="register-lastname" label="Last name" required error={errors.lastName?.message}>
          {(aria) => (
            <Input
              {...aria}
              {...register("lastName")}
              autoComplete="family-name"
              placeholder="Last name"
              invalid={Boolean(errors.lastName)}
            />
          )}
        </FormField>
      </div>

      <FormField id="register-email" label="Email" required error={errors.email?.message}>
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

      <div className="grid gap-5 sm:grid-cols-2">
        {/* Controlled via Controller so the placeholder state stays in sync with the value. */}
        <FormField id="register-board" label="Board" required error={errors.board?.message}>
          {(aria) => (
            <Controller
              name="board"
              control={control}
              render={({ field }) => (
                <NativeSelect
                  {...aria}
                  {...field}
                  options={BOARD_OPTIONS}
                  placeholder="Select board"
                  invalid={Boolean(errors.board)}
                />
              )}
            />
          )}
        </FormField>

        <FormField id="register-standard" label="Standard" required error={errors.standard?.message}>
          {(aria) => (
            <Controller
              name="standard"
              control={control}
              render={({ field }) => (
                <NativeSelect
                  {...aria}
                  {...field}
                  options={STANDARD_OPTIONS}
                  placeholder="Select standard"
                  invalid={Boolean(errors.standard)}
                />
              )}
            />
          )}
        </FormField>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField id="register-password" label="Password" required error={errors.password?.message}>
          {(aria) => (
            <PasswordInput
              {...aria}
              {...register("password")}
              autoComplete="new-password"
              placeholder="Create a password"
              invalid={Boolean(errors.password)}
            />
          )}
        </FormField>

        <FormField
          id="register-confirm-password"
          label="Confirm password"
          required
          error={errors.confirmPassword?.message}
        >
          {(aria) => (
            <PasswordInput
              {...aria}
              {...register("confirmPassword")}
              autoComplete="new-password"
              placeholder="Re-enter password"
              invalid={Boolean(errors.confirmPassword)}
            />
          )}
        </FormField>
      </div>

      <Button type="submit" size="lg" block disabled={isLoading} className="mt-1">
        {isLoading ? (
          <>
            <Loader2 aria-hidden="true" className="animate-spin" />
            Creating account…
          </>
        ) : (
          "Create account"
        )}
      </Button>
    </form>
  );
};
