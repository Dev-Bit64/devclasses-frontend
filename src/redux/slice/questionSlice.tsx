
/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice } from "@reduxjs/toolkit";
import { toastText } from "../../utils/toast";
import { InitialState } from "../../interfaces/interfaces";
import { addQuestionAction, getQuestionsAction, updateQuestionAction, deleteQuestionAction } from "../action/questionAction";

const initialState: InitialState = {
    isLoading: false,
    error: null,
    data: null,
    message: null,
    questionLists: null,
};

const QuestionsSlice = createSlice({
    name: "question",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getQuestionsAction.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getQuestionsAction.fulfilled, (state, action) => {
                state.isLoading = false;
                state.questionLists = action?.payload?.data;
                state.message = action?.payload?.message;
            })
            .addCase(getQuestionsAction.rejected, (state, action: any) => {
                state.isLoading = false;
                state.error = action.payload;
                state.message = action?.payload?.message;
                toastText(action?.payload?.message, "error");
            });

        /**
         * Handle add question action
         * - Adds the newly created question to the questions list
         * - Updates the total count
         * - Shows success/error messages
         * - Maintains local state without requiring API refetch
         */
        builder
            .addCase(addQuestionAction.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(addQuestionAction.fulfilled, (state, action) => {
                state.isLoading = false;
                state.message = action?.payload?.message;
                toastText(action?.payload?.message, "success");

                // Add the newly created question to the questions list
                if (state.data && Array.isArray(state.data.data) && action?.payload?.data) {
                    // Add the new question to the beginning of the list
                    state.data.data.unshift(action.payload.data);

                    // Increment total count
                    if (state.data.total !== undefined) {
                        state.data.total += 1;
                    }
                }
            })
            .addCase(addQuestionAction.rejected, (state, action: any) => {
                state.isLoading = false;
                state.error = action.payload;
                state.message = action?.payload?.message;
                toastText(action?.payload?.message, "error");
            });

        /**
         * Handle update question action
         * - Updates the question in the questions list
         * - Finds the question by ID and replaces it with updated data
         * - Shows success/error messages
         * - Maintains local state without requiring API refetch
         */
        builder
            .addCase(updateQuestionAction.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateQuestionAction.fulfilled, (state, action) => {
                state.isLoading = false;
                state.message = action?.payload?.message;
                toastText(action?.payload?.message, "success");

                // Update the question in the questions list
                if (state.data && Array.isArray(state.data.data) && action?.payload?.data) {
                    const updatedQuestion = action.payload.data;
                    const questionIndex = state.data.data.findIndex(
                        (q: any) => q.id === updatedQuestion.id
                    );

                    // Replace the question at the found index
                    if (questionIndex !== -1) {
                        state.data.data[questionIndex] = updatedQuestion;
                    }
                }
            })
            .addCase(updateQuestionAction.rejected, (state, action: any) => {
                state.isLoading = false;
                state.error = action.payload;
                state.message = action?.payload?.message;
                toastText(action?.payload?.message, "error");
            });

        /**
         * Handle delete question action
         * - Removes one or multiple deleted questions from the questions list
         * - Updates the total count based on number of deleted questions
         * - Shows success/error messages
         * - Supports both single and bulk deletion
         */
        builder
            .addCase(deleteQuestionAction.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(deleteQuestionAction.fulfilled, (state, action) => {
                state.isLoading = false;
                state.message = action?.payload?.message;
                toastText(action?.payload?.message, "success");

                // Remove the deleted question(s) from the data array
                if (state.data && Array.isArray(state.data.data)) {
                    // Handle both single deletion and bulk deletion
                    const deletedIds = Array.isArray(action?.payload?.data?.id)
                        ? action?.payload?.data?.id
                        : [action?.payload?.data?.id];

                    // Filter out all deleted questions
                    state.data.data = state.data.data.filter(
                        (q: any) => !deletedIds.includes(q.id)
                    );

                    // Update total count by subtracting number of deleted questions
                    const deletedCount = deletedIds.length;
                    if (state.data.total > 0) {
                        state.data.total = Math.max(0, state.data.total - deletedCount);
                    }
                }
            })
            .addCase(deleteQuestionAction.rejected, (state, action: any) => {
                state.isLoading = false;
                state.error = action.payload;
                state.message = action?.payload?.message;
                toastText(action?.payload?.message, "error");
            });
    },
});

export default QuestionsSlice;
