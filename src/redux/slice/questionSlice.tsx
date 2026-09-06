
/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice } from "@reduxjs/toolkit";
import { toastText } from "../../utils/toast";
import { InitialState } from "../../interfaces/interfaces";
import { addQuestionAction, getQuestionsAction, updateQuestionAction, deleteQuestionAction, importQuestionsAction } from "../action/questionAction";

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
                state.data = action?.payload?.data; // Also set data for mutations
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
                if (state.data && Array.isArray(state.data.questions) && action?.payload?.data) {
                    // Add the new question to the beginning of the list
                    state.data.questions.unshift(action.payload.data);
                    state.questionLists.questions.unshift(action.payload.data);

                    // Increment total count
                    if (state.data.totalRecords !== undefined) {
                        state.data.totalRecords += 1;
                        state.questionLists.totalRecords += 1;
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
                if (state.data && Array.isArray(state.data.questions) && action?.payload?.data) {
                    const updatedQuestion = action.payload.data;
                    const questionIndex = state.data.questions.findIndex(
                        (q: any) => q.id === updatedQuestion.id
                    );

                    // Replace the question at the found index
                    if (questionIndex !== -1) {
                        state.data.questions[questionIndex] = updatedQuestion;
                        state.questionLists.questions[questionIndex] = updatedQuestion;
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
                if (state.data && Array.isArray(state.data.questions) && action?.payload?.deletedIds) {
                    // Get the deleted IDs from the action payload
                    const deletedIds = action.payload.deletedIds;

                    // Filter out all deleted questions
                    state.data.questions = state.data.questions.filter(
                        (q: any) => !deletedIds.includes(q.id)
                    );

                    if (state.questionLists && Array.isArray(state.questionLists.questions)) {
                        state.questionLists.questions = state.questionLists.questions.filter(
                            (q: any) => !deletedIds.includes(q.id)
                        );
                    }

                    // Update total count by subtracting number of deleted questions
                    const deletedCount = deletedIds.length;
                    if (state.data.totalRecords !== undefined && state.data.totalRecords > 0) {
                        state.data.totalRecords = Math.max(0, state.data.totalRecords - deletedCount);
                    }
                    if (state.questionLists && state.questionLists.totalRecords !== undefined && state.questionLists.totalRecords > 0) {
                        state.questionLists.totalRecords = Math.max(0, state.questionLists.totalRecords - deletedCount);
                    }
                }
            })
            .addCase(deleteQuestionAction.rejected, (state, action: any) => {
                state.isLoading = false;
                state.error = action.payload;
                state.message = action?.payload?.message;
                toastText(action?.payload?.message, "error");
            });

        /**
         * Handle import questions action
         * - Imports multiple questions from Excel file
         * - Appends imported questions to the existing questions list
         * - Updates the total count based on number of imported questions
         * - Shows success/error messages
         * - Maintains local state without requiring API refetch
         */
        builder
            .addCase(importQuestionsAction.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(importQuestionsAction.fulfilled, (state, action) => {
                state.isLoading = false;
                state.message = action?.payload?.message;
                toastText(action?.payload?.message, "success");

                // Append the imported questions to the questions list
                if (state.data && Array.isArray(state.data.questions) && action?.payload?.data) {
                    const importedQuestions = Array.isArray(action.payload.data)
                        ? action.payload.data
                        : [action.payload.data];

                    // Add imported questions to the beginning of the list
                    state.data.questions = [...importedQuestions, ...state.data.questions];
                    state.questionLists.questions = [...importedQuestions, ...state.questionLists.questions];

                    // Update total count by adding number of imported questions
                    if (state.data.totalRecords !== undefined) {
                        state.data.totalRecords += importedQuestions.length;
                        state.questionLists.totalRecords += importedQuestions.length;
                    }
                }
            })
            .addCase(importQuestionsAction.rejected, (state, action: any) => {
                state.isLoading = false;
                state.error = action.payload;
                state.message = action?.payload?.message;
                toastText(action?.payload?.message, "error");
            });
    },
});

export default QuestionsSlice;
