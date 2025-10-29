/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice } from "@reduxjs/toolkit";
import { toastText } from "../../utils/toast";
import { loginAction, registerAction, logoutAction, forgotPasswordMailAction, resetPasswordAction } from "../action/authAction";
import { InitialState } from "../../interfaces/interfaces";


const initialState: InitialState = {
  isLoading: false,
  error: null,
  data: {},
  message: null
};

const AuthSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(loginAction.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(loginAction.fulfilled, (state: any, action: any) => {
      state.isLoading = false;
      action?.payload?.message, "success";
      state.data = action?.payload;
    });
    builder.addCase(loginAction.rejected, (state, action: any) => {
      state.isLoading = false;
      state.error = action.payload;
      state.message = action?.payload?.message;
    });

    builder.addCase(registerAction.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(registerAction.fulfilled, (state: any, action: any) => {
      state.isLoading = false;
      action?.payload?.message, "success";
      state.data = action?.payload
    });
    builder.addCase(registerAction.rejected, (state, action: any) => {
      state.isLoading = false;
      state.error = action.payload;
      state.message = action?.payload?.message;
    });

    builder.addCase(logoutAction.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(logoutAction.fulfilled, (state, action) => {
      state.isLoading = false;
      localStorage.clear();
      toastText(action?.payload?.message, "success");
    });
    builder.addCase(logoutAction.rejected, (state, action: any) => {
      state.isLoading = false;
      state.error = action.payload;
      toastText(action?.payload?.message, "error");
    });

    // Handle forgotPasswordMailAction - send password reset email
    builder.addCase(forgotPasswordMailAction.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(forgotPasswordMailAction.fulfilled, (state, action) => {
      state.isLoading = false;
      state.message = action?.payload?.message;
      // Show success toast notification
      toastText(action?.payload?.message || "Password reset email sent successfully.", "success");
    });
    builder.addCase(forgotPasswordMailAction.rejected, (state, action: any) => {
      state.isLoading = false;
      state.error = action.payload;
      state.message = action?.payload?.message;
      // Show error toast notification
      toastText(action?.payload?.message || "Failed to send password reset email. Please try again.", "error");
    });

    // Handle resetPasswordAction - reset user password
    builder.addCase(resetPasswordAction.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(resetPasswordAction.fulfilled, (state, action) => {
      state.isLoading = false;
      state.message = action?.payload?.message;
      // Show success toast notification
      toastText(action?.payload?.message || "Password reset successfully.", "success");
    });
    builder.addCase(resetPasswordAction.rejected, (state, action: any) => {
      state.isLoading = false;
      state.error = action.payload;
      state.message = action?.payload?.message;
      // Show error toast notification
      toastText(action?.payload?.message || "Failed to reset password. Please try again.", "error");
    });
  },
});

export default AuthSlice;
