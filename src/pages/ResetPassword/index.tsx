import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "../../components/auth/AuthLayout";
import { ResetPasswordForm } from "../../components/auth/ResetPasswordForm";
import SEO from "../../components/SEO/SEO";

/**
 * Reset password page. Reached from the link in the reset email, which carries ?token=.
 * Behaviour is unchanged — only the presentation has been rebuilt on the new design system.
 */
const ResetPasswordPage: React.FC = () => {
    const navigate = useNavigate();

    React.useEffect(() => {
        document.title = "Reset Password | Dev Classes";
    }, []);

    return (
        <>
            <SEO
                title="Reset your password | Dev Classes"
                description="Set a new password for your Dev Classes account."
            />
            <AuthLayout
                title="Set a new password"
                description="Choose a password you have not used before. It needs at least 8 characters, including uppercase, lowercase and a number."
                footer={
                    <>
                        Remembered your password?{" "}
                        <Link
                            to="/login"
                            className="rounded font-semibold text-primary transition-colors hover:text-primary-hover hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                            Back to login
                        </Link>
                    </>
                }
            >
                <ResetPasswordForm onBackToLogin={() => navigate("/login")} />
            </AuthLayout>
        </>
    );
};

export default ResetPasswordPage;
