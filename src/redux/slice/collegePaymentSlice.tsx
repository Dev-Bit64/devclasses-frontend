/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice } from "@reduxjs/toolkit";
import { toastText } from "../../utils/toast";
import { InitialState } from "../../interfaces/interfaces";
import { getCollegeOrdersAction } from "../action/collegePaymentAction";

const initialState: InitialState = {
    isLoading: false,
    error: null,
    data: {},
    message: null,
    collegeOrderLists: [],
    collegeOrderTotalRecords: 0,
    collegeOrderPage: 1,
    collegeOrderTotalPages: 0,
};

const collegePaymentSlice = createSlice({
    name: "collegePayment",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getCollegeOrdersAction.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getCollegeOrdersAction.fulfilled, (state, action) => {
                state.isLoading = false;
                state.collegeOrderLists = action?.payload?.data;
                // Pagination metadata sits alongside `data` in the envelope, not inside it.
                state.collegeOrderTotalRecords = action?.payload?.totalRecords;
                state.collegeOrderPage = action?.payload?.page;
                state.collegeOrderTotalPages = action?.payload?.totalPages;
                state.message = action?.payload?.message;
            })
            .addCase(getCollegeOrdersAction.rejected, (state, action: any) => {
                state.isLoading = false;
                state.error = action.payload;
                state.message = action?.payload?.message;
                toastText(action?.payload?.message, "error");
            });
    },
});

export default collegePaymentSlice;
