import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "../../components/auth/AuthLayout";
import { LoginForm } from "../../components/auth/LoginForm";
import { ForgotPasswordForm } from "../../components/auth/ForgotPasswordForm";
import SEO from "../../components/SEO/SEO";

/** Login page. Forgot-password is an inline mode rather than a separate route, as before. */
const LoginPage = () => {
  const [mode, setMode] = React.useState<"login" | "forgot">("login");
  const navigate = useNavigate();

  // Signed-in users have no reason to sit on the login screen.
  React.useEffect(() => {
    if (localStorage.getItem("accessToken")) navigate("/dashboard", { replace: true });
  }, [navigate]);

  React.useEffect(() => {
    document.title = "Login | Dev Classes";
  }, []);

  if (mode === "forgot") {
    return (
      <>
        <SEO
          title="Reset your password | Dev Classes"
          description="Request a password reset link for your Dev Classes account."
        />
        <AuthLayout
          title="Reset your password"
          description="Enter the email you registered with and we will send you a reset link."
          footer={
            <>
              Remembered your password?{" "}
              <button
                type="button"
                onClick={() => setMode("login")}
                className="rounded font-semibold text-primary transition-colors hover:text-primary-hover hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Back to login
              </button>
            </>
          }
        >
          <ForgotPasswordForm />
        </AuthLayout>
      </>
    );
  }

  return (
    <>
      <SEO
        title="Login | Dev Classes"
        description="Log in to Dev Classes to practise chapter-wise MCQs and review your results."
      />
      <AuthLayout
        title="Welcome back"
        description="Log in to pick up your practice where you left off."
        footer={
          <>
            Don't have an account?{" "}
            <Link
              to="/register"
              className="rounded font-semibold text-primary transition-colors hover:text-primary-hover hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Create one
            </Link>
          </>
        }
      >
        <LoginForm onForgotPassword={() => setMode("forgot")} />
      </AuthLayout>
    </>
  );
};

export default LoginPage;
