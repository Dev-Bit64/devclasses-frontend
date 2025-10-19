 
/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice } from "@reduxjs/toolkit";
import { toastText } from "../../utils/toast";
import { InitialState } from "../../interfaces/interfaces";
import { getUserProfileAction } from "../action/userAction";


const initialState: InitialState = {
    isLoading: false,
    error: null,
    data: {},
    message: null
};

const UserSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
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
    },
});

export default UserSlice;
