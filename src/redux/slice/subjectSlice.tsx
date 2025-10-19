/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice } from "@reduxjs/toolkit";
import { toastText } from "../../utils/toast";
import { InitialState } from "../../interfaces/interfaces";
import { addChapterAction, addSubjectAction, deleteChapterByIdAction, deleteMultipleChaptersAction, deleteSubjectAction, getchaptersBySubjectIdAction, getSubjectsAction, updateChapterAction, updateSubjectAction } from "../action/subjectAction";


const initialState: InitialState = {
    isLoading: false,
    error: null,
    data: {},
    message: null,
    subjectLists: [],
    chapterLists: [],
    updatedSubject: null,
    updatedChapter: null,
};

const subjectSlice = createSlice({
    name: "subject",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getSubjectsAction.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getSubjectsAction.fulfilled, (state, action) => {
                state.isLoading = false;
                state.subjectLists = action?.payload?.data;
                state.message = action?.payload?.message;
            })
            .addCase(getSubjectsAction.rejected, (state, action: any) => {
                state.isLoading = false;
                state.error = action.payload;
                state.message = action?.payload?.message;
                toastText(action?.payload?.message, "error");
            });


        builder
            .addCase(getchaptersBySubjectIdAction.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getchaptersBySubjectIdAction.fulfilled, (state, action) => {
                state.isLoading = false;
                state.chapterLists = action?.payload?.data;
                state.message = action?.payload?.message;
            })
            .addCase(getchaptersBySubjectIdAction.rejected, (state, action: any) => {
                state.isLoading = false;
                state.error = action.payload;
                state.message = action?.payload?.message;
                toastText(action?.payload?.message, "error");
            });


        builder
            .addCase(deleteChapterByIdAction.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(deleteChapterByIdAction.fulfilled, (state, action) => {
                state.isLoading = false;
                // state.chapterLists = action?.payload?.data;
                state.message = action?.payload?.message;
            })
            .addCase(deleteChapterByIdAction.rejected, (state, action: any) => {
                state.isLoading = false;
                state.error = action.payload;
                state.message = action?.payload?.message;
                toastText(action?.payload?.message, "error");
            });

        builder
            .addCase(deleteMultipleChaptersAction.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(deleteMultipleChaptersAction.fulfilled, (state, action) => {
                state.isLoading = false;
                // state.chapterLists = action?.payload?.data;
                state.message = action?.payload?.message;
            })
            .addCase(deleteMultipleChaptersAction.rejected, (state, action: any) => {
                state.isLoading = false;
                state.error = action.payload;
                state.message = action?.payload?.message;
                toastText(action?.payload?.message, "error");
            });


        builder
            .addCase(updateSubjectAction.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateSubjectAction.fulfilled, (state, action) => {
                state.isLoading = false;
                state.updatedSubject = action?.payload?.data;
                state.message = action?.payload?.message;
            })
            .addCase(updateSubjectAction.rejected, (state, action: any) => {
                state.isLoading = false;
                state.error = action.payload;
                state.message = action?.payload?.message;
                toastText(action?.payload?.message, "error");
            });

        builder
            .addCase(updateChapterAction.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateChapterAction.fulfilled, (state, action) => {
                state.isLoading = false;
                state.updatedChapter = action?.payload?.data;
                state.message = action?.payload?.message;
            })
            .addCase(updateChapterAction.rejected, (state, action: any) => {
                state.isLoading = false;
                state.error = action.payload;
                state.message = action?.payload?.message;
                toastText(action?.payload?.message, "error");
            });


        builder
            .addCase(deleteSubjectAction.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(deleteSubjectAction.fulfilled, (state, action) => {
                state.isLoading = false;
                // state.chapterLists = action?.payload?.data;
                state.message = action?.payload?.message;
            })
            .addCase(deleteSubjectAction.rejected, (state, action: any) => {
                state.isLoading = false;
                state.error = action.payload;
                state.message = action?.payload?.message;
                toastText(action?.payload?.message, "error");
            });


        builder
            .addCase(addChapterAction.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(addChapterAction.fulfilled, (state, action) => {
                state.isLoading = false;
                state.updatedChapter = action?.payload?.data;
                state.message = action?.payload?.message;
            })
            .addCase(addChapterAction.rejected, (state, action: any) => {
                state.isLoading = false;
                state.error = action.payload;
                state.message = action?.payload?.message;
                toastText(action?.payload?.message, "error");
            });


        builder
            .addCase(addSubjectAction.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(addSubjectAction.fulfilled, (state, action) => {
                state.isLoading = false;
                state.updatedSubject = action?.payload?.data;
                state.message = action?.payload?.message;
            })
            .addCase(addSubjectAction.rejected, (state, action: any) => {
                state.isLoading = false;
                state.error = action.payload;
                state.message = action?.payload?.message;
                toastText(action?.payload?.message, "error");
            });
    },
});

export default subjectSlice;
