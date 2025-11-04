
/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice } from "@reduxjs/toolkit";
import { toastText } from "../../utils/toast";
import { InitialState } from "../../interfaces/interfaces";
import { getUserProfileAction, getUsersAction, deleteUserAction } from "../action/userAction";


const initialState: InitialState = {
    isLoading: false,
    error: null,
    data: {},
    message: null,
    userLists: []
};

const UserSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        // Handle getUserProfileAction
        builder.addCase(getUserProfileAction.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(getUserProfileAction.fulfilled, (state, action) => {
            state.isLoading = false;
            state.data = action?.payload;
            state.message = action?.payload?.message;
        });
        builder.addCase(getUserProfileAction.rejected, (state, action: any) => {
            state.isLoading = false;
            state.error = action.payload;
            state.message = action?.payload?.message;
            toastText(action?.payload?.message, "error");
        });

        // Handle getUsersAction - fetch all users
        builder.addCase(getUsersAction.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(getUsersAction.fulfilled, (state, action) => {
            state.isLoading = false;
            state.userLists = action?.payload?.data || [];
            state.message = action?.payload?.message;
            // toastText(action?.payload?.message, "success");
        });
        builder.addCase(getUsersAction.rejected, (state, action: any) => {
            state.isLoading = false;
            state.error = action.payload;
            state.message = action?.payload?.message;
            toastText(action?.payload?.message, "error");
        });

        // Handle deleteUserAction - delete one or multiple users
        builder.addCase(deleteUserAction.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(deleteUserAction.fulfilled, (state, action) => {
            state.isLoading = false;
            state.message = action?.payload?.message;
            toastText(action?.payload?.message, "success");
        });
        builder.addCase(deleteUserAction.rejected, (state, action: any) => {
            state.isLoading = false;
            state.error = action.payload;
            state.message = action?.payload?.message;
            toastText(action?.payload?.message, "error");
        });
    },
});

export default UserSlice;
