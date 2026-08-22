import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "../../components/auth/AuthLayout";
import { RegisterForm } from "../../components/auth/RegisterForm";
import SEO from "../../components/SEO/SEO";

const RegisterPage = () => {
  const navigate = useNavigate();

  // Signed-in users are sent straight to the dashboard.
  React.useEffect(() => {
    if (localStorage.getItem("accessToken")) navigate("/dashboard", { replace: true });
  }, [navigate]);

  React.useEffect(() => {
    document.title = "Register | Dev Classes";
  }, []);

  return (
    <>
      <SEO
        title="Create your account | Dev Classes"
        description="Register for Dev Classes to practise chapter-wise MCQs for CBSE and GSEB Commerce, 11th and 12th standard."
      />
      <AuthLayout
        wide
        title="Create your account"
        description="Tell us your board and standard, and your practice will follow that syllabus."
        footer={
          <>
            Already have an account?{" "}
            <Link
              to="/login"
              className="rounded font-semibold text-primary transition-colors hover:text-primary-hover hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Log in
            </Link>
          </>
        }
      >
        <RegisterForm />
      </AuthLayout>
    </>
  );
};

export default RegisterPage;
