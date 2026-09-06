import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { FormField } from "../ui/form-field";
import { AppDispatch, RootState } from "../../redux/store";
import { forgotPasswordMailAction } from "../../redux/action/authAction";

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Please input your email!")
    .email("The input is not valid E-mail!"),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export const ForgotPasswordForm = () => {
  const dispatch = useDispatch<AppDispatch>();
  // Loading state and success/error toasts are both owned by the auth slice — unchanged.
  const { isLoading } = useSelector((state: RootState) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (values: ForgotPasswordValues) => {
    try {
      await dispatch(forgotPasswordMailAction(values.email));
    } catch (error) {
      console.error("Error sending forgot password email:", error);
    }
  };

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <FormField
        id="forgot-email"
        label="Email"
        required
        hint="We will email you a link to set a new password."
        error={errors.email?.message}
      >
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

      <Button type="submit" size="lg" block disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 aria-hidden="true" className="animate-spin" />
            Sending…
          </>
        ) : (
          "Send reset link"
        )}
      </Button>
    </form>
  );
};
