/* eslint-disable no-useless-escape */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ResetPasswordFormProps, ResetPasswordFormValues } from "./types";
import { Row, Col, Form, Input, Button } from "antd";
import { LockOutlined, ExclamationCircleOutlined, CheckCircleOutlined, SmileOutlined } from "@ant-design/icons";
import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { AppDispatch } from "../../../redux/store";
import { resetPasswordAction } from "../../../redux/action/authAction";
import styles from "./index.module.scss";

/**
 * ResetPassword Component
 * Provides a form for users to reset their password
 * Includes password validation, strength indicator, and Redux integration
 * 
 * Features:
 * - Password and confirm password fields with validation
 * - Password strength indicator
 * - Responsive design for all screen sizes
 * - Toast notifications for success/error feedback
 * - Loading state during API call
 */
const ResetPasswordForm: React.FC<ResetPasswordFormProps> = (props) => {
    const { setIsResetPassword } = props;
    const dispatch = useDispatch<AppDispatch>();
    const [form] = Form.useForm();
    const [isLoading, setIsLoading] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState<"weak" | "medium" | "strong" | null>(null);
    const [searchParams] = useSearchParams();
    const [resetToken, setResetToken] = useState<string | null>(null);
    const [tokenError, setTokenError] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);

    /**
     * Extract and validate reset token from URL query parameters
     * Token is required to proceed with password reset
     */
    useEffect(() => {
        const token = searchParams.get("token");
        if (!token) {
            setTokenError("Invalid or missing reset token. Please check your email link.");
        } else {
            setResetToken(token);
            setTokenError(null);
        }
    }, [searchParams]);

    /**
     * Calculate password strength based on criteria
     * Checks for length, uppercase, lowercase, numbers, and special characters
     * 
     * @param password - The password to evaluate
     * @returns Strength level: 'weak', 'medium', or 'strong'
     */
    const calculatePasswordStrength = (password: string): "weak" | "medium" | "strong" => {
        let strength = 0;

        // Check password length
        if (password.length >= 8) strength++;
        if (password.length >= 12) strength++;

        // Check for uppercase letters
        if (/[A-Z]/.test(password)) strength++;

        // Check for lowercase letters
        if (/[a-z]/.test(password)) strength++;

        // Check for numbers
        if (/[0-9]/.test(password)) strength++;

        // Check for special characters
        if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) strength++;

        if (strength <= 2) return "weak";
        if (strength <= 4) return "medium";
        return "strong";
    };

    /**
     * Handle password field change
     * Updates password strength indicator in real-time
     * 
     * @param e - Input change event
     */
    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const password = e.target.value;
        if (password) {
            setPasswordStrength(calculatePasswordStrength(password));
        } else {
            setPasswordStrength(null);
        }
    };

    /**
     * Handle form submission
     * Validates form data and dispatches resetPasswordAction with token
     * Handles loading state and error scenarios
     *
     * @param values - Form values containing newPassword and confirmPassword
     */
    const onFinish = async (values: ResetPasswordFormValues) => {
        try {
            // Validate token exists before submission
            if (!resetToken) {
                setTokenError("Reset token is missing. Please request a new password reset link.");
                return;
            }

            setIsLoading(true);

            // Prepare payload for API call with reset token
            const payload = {
                token: resetToken,
                newPassword: values.newPassword,
            };

            // Dispatch reset password action
            const result = await dispatch(resetPasswordAction(payload));

            // Check if the action was fulfilled (successful)
            if (resetPasswordAction.fulfilled.match(result)) {
                // Set success state to show success section
                setIsSuccess(true);

                // Reset form after successful submission
                form.resetFields();
                setPasswordStrength(null);

                // Navigate back to login after a delay
                setTimeout(() => {
                    setIsResetPassword(false);
                }, 3000);
            }
        } catch (error) {
            console.error("Error resetting password:", error);
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Custom validator for password confirmation
     * Ensures both password fields match
     */
    const validatePasswordMatch = (_: any, value: string) => {
        if (!value) {
            return Promise.reject(new Error("Please confirm your password!"));
        }
        if (value !== form.getFieldValue("newPassword")) {
            return Promise.reject(new Error("Passwords do not match!"));
        }
        return Promise.resolve();
    };

    return (
        <div className={styles["login-form__container"]}>
            {/* Success Section - Shown after successful password reset */}
            {isSuccess ? (
                <div className={styles["success-section"]}>
                    {/* Success Icon */}
                    <div className={styles["success-icon"]}>
                        <SmileOutlined />
                    </div>

                    {/* Success Title */}
                    <h2 className={styles["success-title"]}>Password Reset Successfully!</h2>

                    {/* Success Message */}
                    <p className={styles["success-message"]}>
                        Your password has been changed successfully. You will be redirected to the login page shortly.
                    </p>

                    {/* Success Checkmark */}
                    <div className={styles["success-checkmark"]}>
                        <CheckCircleOutlined />
                    </div>

                    {/* Manual Redirect Link */}
                    <p className={styles["success-redirect"]}>
                        If you're not redirected automatically,{" "}
                        <a onClick={() => setIsResetPassword(false)}>click here to go back to login</a>
                    </p>
                </div>
            ) : (
                <>
                    {/* Form Title */}
                    <h2 className={styles["login-form__title"]}>Reset Password</h2>

                    {/* Form Description */}
                    <p className={styles["login-form__description"]}>
                        Enter your new password below. Make sure it's strong and secure.
                    </p>

                    {/* Token Status Display */}
                    {tokenError && (
                        <div className={styles["token-status"] + " " + styles["invalid"]}>
                            <ExclamationCircleOutlined />
                            <span>{tokenError}</span>
                        </div>
                    )}

                    {resetToken && !tokenError && (
                        <div className={styles["token-status"] + " " + styles["valid"]}>
                            <CheckCircleOutlined />
                            <span>Reset link verified. You can now set your new password.</span>
                        </div>
                    )}

                    {/* Reset Password Form */}
                    <Form
                form={form}
                name="reset-password"
                onFinish={onFinish}
                layout="vertical"
                autoComplete="off"
                disabled={!resetToken || !!tokenError}
            >
                {/* New Password Field */}
                <Row gutter={16}>
                    <Col span={24}>
                        <Form.Item
                            name="newPassword"
                            label={<span>New Password</span>}
                            rules={[
                                {
                                    required: true,
                                    message: "Please enter your new password!",
                                },
                                {
                                    min: 8,
                                    message: "Password must be at least 8 characters long!",
                                },
                                {
                                    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                                    message:
                                        "Password must contain uppercase, lowercase, and numbers!",
                                },
                            ]}
                        >
                            <Input.Password
                                prefix={<LockOutlined />}
                                placeholder="Enter new password"
                                onChange={handlePasswordChange}
                            />
                        </Form.Item>

                        {/* Password Strength Indicator */}
                        {passwordStrength && (
                            <div className={styles["password-strength-indicator"]}>
                                <div
                                    className={`${styles["strength-bar"]} ${styles[passwordStrength]}`}
                                />
                            </div>
                        )}
                    </Col>
                </Row>

                {/* Confirm Password Field */}
                <Row gutter={16}>
                    <Col span={24}>
                        <Form.Item
                            name="confirmPassword"
                            label={<span>Confirm Password</span>}
                            rules={[
                                {
                                    required: true,
                                    message: "Please confirm your password!",
                                },
                                {
                                    validator: validatePasswordMatch,
                                },
                            ]}
                        >
                            <Input.Password
                                prefix={<LockOutlined />}
                                placeholder="Confirm new password"
                            />
                        </Form.Item>
                    </Col>
                </Row>

                {/* Password Requirements */}
                {/* <div className={styles["password-requirements"]}>
                    <strong>Password Requirements:</strong>
                    <ul>
                        <li>At least 8 characters long</li>
                        <li>Contains uppercase letters (A-Z)</li>
                        <li>Contains lowercase letters (a-z)</li>
                        <li>Contains numbers (0-9)</li>
                        <li>Optional: Special characters for extra security</li>
                    </ul>
                </div> */}

                {/* Submit Button */}
                <Form.Item style={{ marginTop: "0.3rem", marginBottom: "0.5rem" }}>
                    <Button
                        type="primary"
                        size="large"
                        htmlType="submit"
                        block
                        loading={isLoading}
                    >
                        Reset Password
                    </Button>
                </Form.Item>

                    {/* Back to Login Link */}
                    <div className={styles["login-form__links"]}>
                        Remember your password?{" "}
                        <a onClick={() => setIsResetPassword(false)}>Back to login</a>
                    </div>
                </Form>
                </>
            )}
        </div>
    );
};

export default ResetPasswordForm;

