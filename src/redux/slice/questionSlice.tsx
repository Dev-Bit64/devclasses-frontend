
/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice } from "@reduxjs/toolkit";
import { toastText } from "../../utils/toast";
import { InitialState } from "../../interfaces/interfaces";
import { addQuestionAction, getQuestionsAction, updateQuestionAction } from "../action/questionAction";

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

        builder
            .addCase(addQuestionAction.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(addQuestionAction.fulfilled, (state, action) => {
                state.isLoading = false;
                // state.data = action?.payload;
                state.message = action?.payload?.message;
            })
            .addCase(addQuestionAction.rejected, (state, action: any) => {
                state.isLoading = false;
                state.error = action.payload;
                state.message = action?.payload?.message;
                toastText(action?.payload?.message, "error");
            });

        builder
            .addCase(updateQuestionAction.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateQuestionAction.fulfilled, (state, action) => {
                state.isLoading = false;
                state.data = action?.payload?.data;
                state.message = action?.payload?.message;
            })
            .addCase(updateQuestionAction.rejected, (state, action: any) => {
                state.isLoading = false;
                state.error = action.payload;
                state.message = action?.payload?.message;
                toastText(action?.payload?.message, "error");
            });
    },
});

export default QuestionsSlice;
