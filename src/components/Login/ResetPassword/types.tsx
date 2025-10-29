/**
 * ResetPassword Component Props Interface
 * Defines the properties passed to the ResetPassword component
 */
export interface ResetPasswordFormProps {
  /**
   * Callback function to navigate back to login
   * Called after successful password reset
   */
  setIsResetPassword: (isReset: boolean) => void;
}

/**
 * Reset Password Form Values Interface
 * Defines the structure of form data submitted
 */
export interface ResetPasswordFormValues {
  /**
   * New password entered by user
   */
  newPassword: string;

  /**
   * Confirmation password to verify match
   */
  confirmPassword: string;
}

/**
 * Reset Password Payload Interface
 * Defines the data structure sent to the API
 */
export interface ResetPasswordPayload {
  /**
   * Reset token from email link
   */
  token?: string;

  /**
   * New password for the user account
   */
  newPassword: string;

  /**
   * Confirmation password (for validation)
   */
  confirmPassword: string;
}

