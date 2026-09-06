/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice } from "@reduxjs/toolkit";
import { toastText } from "../../utils/toast";
import { InitialState } from "../../interfaces/interfaces";
import {
    getCollegeTransferRequestsAction,
    reviewCollegeTransferRequestAction,
} from "../action/collegeDeviceAction";

const initialState: InitialState = {
    isLoading: false,
    error: null,
    data: {},
    message: null,
    collegeTransferRequestLists: [],
    collegeTransferRequestTotalRecords: 0,
    collegeTransferRequestPage: 1,
    collegeTransferRequestTotalPages: 0,
};

const collegeDeviceSlice = createSlice({
    name: "collegeDevice",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getCollegeTransferRequestsAction.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getCollegeTransferRequestsAction.fulfilled, (state, action) => {
                state.isLoading = false;
                state.collegeTransferRequestLists = action?.payload?.data;
                // Pagination metadata sits alongside `data` in the envelope, not inside it.
                state.collegeTransferRequestTotalRecords = action?.payload?.totalRecords;
                state.collegeTransferRequestPage = action?.payload?.page;
                state.collegeTransferRequestTotalPages = action?.payload?.totalPages;
                state.message = action?.payload?.message;
            })
            .addCase(getCollegeTransferRequestsAction.rejected, (state, action: any) => {
                state.isLoading = false;
                state.error = action.payload;
                state.message = action?.payload?.message;
                toastText(action?.payload?.message, "error");
            });

        builder
            .addCase(reviewCollegeTransferRequestAction.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(reviewCollegeTransferRequestAction.fulfilled, (state, action) => {
                state.isLoading = false;
                state.message = action?.payload?.message;
            })
            .addCase(reviewCollegeTransferRequestAction.rejected, (state, action: any) => {
                state.isLoading = false;
                state.error = action.payload;
                state.message = action?.payload?.message;
                toastText(action?.payload?.message, "error");
            });
    },
});

export default collegeDeviceSlice;
