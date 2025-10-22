/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice } from "@reduxjs/toolkit";
import { toastText } from "../../utils/toast";
import { InitialState } from "../../interfaces/interfaces";
import { getSubjectsForExamAction, getExamQuestionsAction } from "../action/examAction";

/**
 * Initial state for exam slice
 * Manages loading state, error handling, and exam-related data
 */
const initialState: InitialState = {
    isLoading: false,
    error: null,
    data: null,
    message: null,
    examSubjectsList: [],
    examQuestions: [],
};

/**
 * Exam Slice
 * Handles Redux state management for exam-related operations
 * Includes reducers for fetching subjects and questions for exams
 */
const examSlice = createSlice({
    name: "exam",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        /**
         * Handle get subjects for exam action
         * - Fetches available subjects based on board and standard
         * - Stores subjects in examSubjectsList for exam creation
         * - Shows loading state during fetch
         * - Handles errors with toast notifications
         */
        builder
            .addCase(getSubjectsForExamAction.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getSubjectsForExamAction.fulfilled, (state, action) => {
                state.isLoading = false;
                state.examSubjectsList = action?.payload?.data;
                state.message = action?.payload?.message;
            })
            .addCase(getSubjectsForExamAction.rejected, (state, action: any) => {
                state.isLoading = false;
                state.error = action.payload;
                state.message = action?.payload?.message;
                toastText(action?.payload?.message, "error");
            });

        /**
         * Handle get exam questions action
         * - Fetches questions for exam based on subject, chapter, and count
         * - Stores questions in examQuestions for exam display
         * - Shows loading state during fetch
         * - Handles errors with toast notifications
         */
        builder
            .addCase(getExamQuestionsAction.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getExamQuestionsAction.fulfilled, (state, action) => {
                state.isLoading = false;
                state.examQuestions = action?.payload?.data;
                state.message = action?.payload?.message;
            })
            .addCase(getExamQuestionsAction.rejected, (state, action: any) => {
                state.isLoading = false;
                state.error = action.payload;
                state.message = action?.payload?.message;
                toastText(action?.payload?.message, "error");
            });
    },
});

export default examSlice;
