/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice } from "@reduxjs/toolkit";
import { toastText } from "../../utils/toast";
import { InitialState } from "../../interfaces/interfaces";
import {
    addCollegePracticeQuestionAction,
    deleteCollegePracticeQuestionAction,
    getCollegePracticeQuestionsAction,
    importCollegePracticeQuestionsAction,
    updateCollegePracticeQuestionAction,
} from "../action/collegePracticeAction";

const initialState: InitialState = {
    isLoading: false,
    error: null,
    data: {},
    message: null,
    collegePracticeQuestionLists: [],
};

const collegePracticeSlice = createSlice({
    name: "collegePractice",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getCollegePracticeQuestionsAction.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getCollegePracticeQuestionsAction.fulfilled, (state, action) => {
                state.isLoading = false;
                state.collegePracticeQuestionLists = action?.payload?.data;
                state.message = action?.payload?.message;
            })
            .addCase(getCollegePracticeQuestionsAction.rejected, (state, action: any) => {
                state.isLoading = false;
                state.error = action.payload;
                state.message = action?.payload?.message;
                toastText(action?.payload?.message, "error");
            });

        builder
            .addCase(addCollegePracticeQuestionAction.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(addCollegePracticeQuestionAction.fulfilled, (state, action) => {
                state.isLoading = false;
                state.message = action?.payload?.message;
            })
            .addCase(addCollegePracticeQuestionAction.rejected, (state, action: any) => {
                state.isLoading = false;
                state.error = action.payload;
                state.message = action?.payload?.message;
                toastText(action?.payload?.message, "error");
            });

        builder
            .addCase(updateCollegePracticeQuestionAction.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateCollegePracticeQuestionAction.fulfilled, (state, action) => {
                state.isLoading = false;
                state.message = action?.payload?.message;
            })
            .addCase(updateCollegePracticeQuestionAction.rejected, (state, action: any) => {
                state.isLoading = false;
                state.error = action.payload;
                state.message = action?.payload?.message;
                toastText(action?.payload?.message, "error");
            });

        builder
            .addCase(deleteCollegePracticeQuestionAction.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(deleteCollegePracticeQuestionAction.fulfilled, (state, action) => {
                state.isLoading = false;
                state.message = action?.payload?.message;
            })
            .addCase(deleteCollegePracticeQuestionAction.rejected, (state, action: any) => {
                state.isLoading = false;
                state.error = action.payload;
                state.message = action?.payload?.message;
                toastText(action?.payload?.message, "error");
            });

        builder
            .addCase(importCollegePracticeQuestionsAction.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(importCollegePracticeQuestionsAction.fulfilled, (state, action) => {
                state.isLoading = false;
                state.message = action?.payload?.message;
            })
            .addCase(importCollegePracticeQuestionsAction.rejected, (state, action: any) => {
                state.isLoading = false;
                state.error = action.payload;
                state.message = action?.payload?.message;
                // The API names the offending row ("Row 4: ..."), so it is worth surfacing whole.
                toastText(action?.payload?.message, "error");
            });
    },
});

export default collegePracticeSlice;
