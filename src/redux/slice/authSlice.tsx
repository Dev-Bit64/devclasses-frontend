/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice } from "@reduxjs/toolkit";
import { toastText } from "../../utils/toast";
import { loginAction, registerAction, logoutAction } from "../action/authAction";
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
  },
});

export default AuthSlice;
