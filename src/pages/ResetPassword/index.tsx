import React from "react";
import { useNavigate } from "react-router-dom";
import LoginLayout from "../../layouts/Login";
import ResetPasswordForm from "../../components/Login/ResetPassword";

/**
 * ResetPassword Page Component
 *
 * This page serves as the main entry point for password reset functionality.
 * It wraps the ResetPasswordForm component with the LoginLayout to provide
 * a consistent UI/UX with the login and registration pages.
 *
 * Layout Structure:
 * - Desktop (> 768px): 50% image on left, 50% form on right
 * - Mobile (< 768px): Full-width form, image hidden
 * - Tablet: Responsive 50-50 split
 *
 * The page receives a reset token via URL query parameters (e.g., /reset-password?token=xyz)
 * and passes it to the form component for API submission.
 *
 * Features:
 * - Responsive layout matching login/register pages
 * - Token extraction from URL
 * - Navigation back to login on success
 * - Error handling and user feedback
 * - Proper scrolling behavior on all screen sizes
 *
 * @returns ResetPassword page component
 */
const ResetPasswordPage: React.FC = () => {
    const navigate = useNavigate();

    /**
     * Handle navigation back to login
     * Called when user clicks "Back to login" link or after successful password reset
     *
     * @param value - Boolean indicating whether to show reset password form
     */
    const handleBackToLogin = (value: boolean) => {
        if (!value) {
            // Navigate to home page which shows login modal
            navigate("/");
        }
    };

    return (
        <LoginLayout>
            <ResetPasswordForm setIsResetPassword={handleBackToLogin} />
        </LoginLayout>
    );
};

export default ResetPasswordPage;

