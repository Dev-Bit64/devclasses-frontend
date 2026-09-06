/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice } from "@reduxjs/toolkit";
import { toastText } from "../../utils/toast";
import { InitialState } from "../../interfaces/interfaces";
import { getSubjectsForExamAction, getExamQuestionsAction, startExamAction, getQuestionAction, submitExamAction, exportExamResultToPDFAction } from "../action/examAction";

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
    examId: null,
    totalQuestions: 0,
    currentQuestion: null,
    currentPage: 1,
    examResult: null,
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
         * - Backend returns { subjects: [...] }, so we access data.subjects
         */
        builder
            .addCase(getSubjectsForExamAction.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getSubjectsForExamAction.fulfilled, (state, action) => {
                state.isLoading = false;
                // Backend returns { subjects: [...] }, so we access data.subjects
                state.examSubjectsList = action?.payload?.data?.subjects || [];
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

        /**
         * Handle start exam action
         * - Creates a new exam session
         * - Stores examId, totalQuestions, and startedAt
         * - Shows loading state during creation
         * - Handles errors with toast notifications
         */
        builder
            .addCase(startExamAction.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(startExamAction.fulfilled, (state, action) => {
                state.isLoading = false;
                state.examId = action?.payload?.data?.examId;
                state.totalQuestions = action?.payload?.data?.totalQuestions;
                state.message = action?.payload?.message;
                state.currentPage = 1; // Reset to first page
            })
            .addCase(startExamAction.rejected, (state, action: any) => {
                state.isLoading = false;
                state.error = action.payload;
                state.message = action?.payload?.message;
                toastText(action?.payload?.message, "error");
            });

        /**
         * Handle get question action
         * - Fetches a single question by page number
         * - Stores current question data
         * - Shows loading state during fetch
         * - Handles errors with toast notifications
         */
        builder
            .addCase(getQuestionAction.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getQuestionAction.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentQuestion = action?.payload?.data;
                state.currentPage = action?.payload?.data?.page;
                state.message = action?.payload?.message;
            })
            .addCase(getQuestionAction.rejected, (state, action: any) => {
                state.isLoading = false;
                state.error = action.payload;
                state.message = action?.payload?.message;
                toastText(action?.payload?.message, "error");
            });

        /**
         * Handle submit exam action
         * - Submits exam answers and generates result
         * - Stores exam result data
         * - Shows loading state during submission
         * - Handles errors with toast notifications
         */
        builder
            .addCase(submitExamAction.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(submitExamAction.fulfilled, (state, action) => {
                state.isLoading = false;
                state.examResult = action?.payload?.data;
                state.message = action?.payload?.message;
            })
            .addCase(submitExamAction.rejected, (state, action: any) => {
                state.isLoading = false;
                state.error = action.payload;
                state.message = action?.payload?.message;
                toastText(action?.payload?.message, "error");
            });


        /**
         * Handle export exam result to PDF action
         * - Exports exam results to a PDF file
         * - Shows loading state during export
         * - Error messaging is handled by the calling component
         */
        builder
            .addCase(exportExamResultToPDFAction.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(exportExamResultToPDFAction.fulfilled, (state, action) => {
                state.isLoading = false;
                state.data = action?.payload?.data;
                state.message = action?.payload?.message;
            })
            .addCase(exportExamResultToPDFAction.rejected, (state, action: any) => {
                state.isLoading = false;
                state.error = action.payload;
                state.message = action?.payload?.message;
                // Toast is raised by the component so the export failure is reported only once
            });
    },
});

export default examSlice;
