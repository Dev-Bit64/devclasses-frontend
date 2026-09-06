/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice } from "@reduxjs/toolkit";
import { toastText } from "../../utils/toast";
import { InitialState } from "../../interfaces/interfaces";
import { getCollegeDashboardDetailsAction } from "../action/collegeAnalyticsAction";

const initialState: InitialState = {
    isLoading: false,
    error: null,
    data: {},
    message: null,
    collegeDashboardDetails: null,
};

const collegeAnalyticsSlice = createSlice({
    name: "collegeAnalytics",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getCollegeDashboardDetailsAction.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getCollegeDashboardDetailsAction.fulfilled, (state, action) => {
                state.isLoading = false;
                state.collegeDashboardDetails = action?.payload?.data;
                state.message = action?.payload?.message;
            })
            .addCase(getCollegeDashboardDetailsAction.rejected, (state, action: any) => {
                state.isLoading = false;
                state.error = action.payload;
                state.message = action?.payload?.message;
                // Cleared so a failed college fetch cannot leave the previous product's
                // numbers on screen under the college heading.
                state.collegeDashboardDetails = null;
                toastText(action?.payload?.message, "error");
            });
    },
});

export default collegeAnalyticsSlice;
