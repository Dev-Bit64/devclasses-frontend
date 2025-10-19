
/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice } from "@reduxjs/toolkit";
import { toastText } from "../../utils/toast";
import { InitialState, DashboardData } from "../../interfaces/interfaces";
import { getDasboardDetailsAction } from "../action/dasboardAction";

const initialState: InitialState = {
    isLoading: false,
    error: null,
    data: null,
    message: null,
    dashboardDetails: null,
};

const DashboardSlice = createSlice({
    name: "dashboard",
    initialState,
    reducers: {
        // Clear dashboard data when user logs out
        clearDashboardData: (state) => {
            state.dashboardDetails = null;
            state.message = null;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getDasboardDetailsAction.pending, (state) => {
                state.isLoading = true;
                state.error = null;
                state.message = null;
            })
            .addCase(getDasboardDetailsAction.fulfilled, (state, action) => {
                state.isLoading = false;
                state.dashboardDetails = action?.payload?.data as DashboardData;
                state.message = action?.payload?.message;
                state.error = null;
            })
            .addCase(getDasboardDetailsAction.rejected, (state, action: any) => {
                state.isLoading = false;
                state.error = action.payload;
                state.message = action?.payload?.message || "Failed to fetch dashboard data";
                state.dashboardDetails = null;
                toastText(action?.payload?.message || "Failed to fetch dashboard data", "error");
            });
    },
});

// Export actions
export const { clearDashboardData } = DashboardSlice.actions;

export default DashboardSlice;
