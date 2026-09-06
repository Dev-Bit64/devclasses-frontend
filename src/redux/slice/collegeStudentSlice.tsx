/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice } from "@reduxjs/toolkit";
import { toastText } from "../../utils/toast";
import { InitialState } from "../../interfaces/interfaces";
import {
    getCollegeStudentDetailAction,
    getCollegeStudentsAction,
} from "../action/collegeStudentAction";

const initialState: InitialState = {
    isLoading: false,
    error: null,
    data: {},
    message: null,
    collegeStudentLists: [],
    collegeStudentTotalRecords: 0,
    collegeStudentPage: 1,
    collegeStudentTotalPages: 0,
    collegeStudentDetail: null,
};

const collegeStudentSlice = createSlice({
    name: "collegeStudent",
    initialState,
    reducers: {
        // Cleared on close so the next student never opens onto the previous one's records.
        clearCollegeStudentDetail: (state) => {
            state.collegeStudentDetail = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getCollegeStudentsAction.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getCollegeStudentsAction.fulfilled, (state, action) => {
                state.isLoading = false;
                state.collegeStudentLists = action?.payload?.data;
                // Pagination metadata sits alongside `data` in the envelope, not inside it.
                state.collegeStudentTotalRecords = action?.payload?.totalRecords;
                state.collegeStudentPage = action?.payload?.page;
                state.collegeStudentTotalPages = action?.payload?.totalPages;
                state.message = action?.payload?.message;
            })
            .addCase(getCollegeStudentsAction.rejected, (state, action: any) => {
                state.isLoading = false;
                state.error = action.payload;
                state.message = action?.payload?.message;
                toastText(action?.payload?.message, "error");
            });

        builder
            .addCase(getCollegeStudentDetailAction.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getCollegeStudentDetailAction.fulfilled, (state, action) => {
                state.isLoading = false;
                state.collegeStudentDetail = action?.payload?.data;
                state.message = action?.payload?.message;
            })
            .addCase(getCollegeStudentDetailAction.rejected, (state, action: any) => {
                state.isLoading = false;
                state.error = action.payload;
                state.message = action?.payload?.message;
                state.collegeStudentDetail = null;
                toastText(action?.payload?.message, "error");
            });
    },
});

export const { clearCollegeStudentDetail } = collegeStudentSlice.actions;
export default collegeStudentSlice;
