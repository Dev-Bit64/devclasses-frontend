/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice } from "@reduxjs/toolkit";
import { toastText } from "../../utils/toast";
import { InitialState } from "../../interfaces/interfaces";
import {
    addCollegeNoteAction,
    addCollegeVideoAction,
    deleteCollegeNoteAction,
    deleteCollegeVideoAction,
    getCollegeNotePreviewUrlAction,
    getCollegeNoteUploadUrlAction,
    getCollegeNotesAction,
    getCollegeThumbnailUploadUrlAction,
    getCollegeVideoPreviewUrlAction,
    getCollegeVideoUploadUrlAction,
    getCollegeVideosAction,
    updateCollegeNoteAction,
    updateCollegeVideoAction,
} from "../action/collegeContentAction";

const initialState: InitialState = {
    isLoading: false,
    error: null,
    data: {},
    message: null,
    collegeVideoLists: [],
    collegeNoteLists: [],
};

const collegeContentSlice = createSlice({
    name: "collegeContent",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        // ---- Videos ----
        builder
            .addCase(getCollegeVideosAction.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getCollegeVideosAction.fulfilled, (state, action) => {
                state.isLoading = false;
                state.collegeVideoLists = action?.payload?.data;
                state.message = action?.payload?.message;
            })
            .addCase(getCollegeVideosAction.rejected, (state, action: any) => {
                state.isLoading = false;
                state.error = action.payload;
                state.message = action?.payload?.message;
                toastText(action?.payload?.message, "error");
            });

        builder
            .addCase(addCollegeVideoAction.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(addCollegeVideoAction.fulfilled, (state, action) => {
                state.isLoading = false;
                state.message = action?.payload?.message;
            })
            .addCase(addCollegeVideoAction.rejected, (state, action: any) => {
                state.isLoading = false;
                state.error = action.payload;
                state.message = action?.payload?.message;
                toastText(action?.payload?.message, "error");
            });

        builder
            .addCase(updateCollegeVideoAction.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateCollegeVideoAction.fulfilled, (state, action) => {
                state.isLoading = false;
                state.message = action?.payload?.message;
            })
            .addCase(updateCollegeVideoAction.rejected, (state, action: any) => {
                state.isLoading = false;
                state.error = action.payload;
                state.message = action?.payload?.message;
                toastText(action?.payload?.message, "error");
            });

        builder
            .addCase(deleteCollegeVideoAction.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(deleteCollegeVideoAction.fulfilled, (state, action) => {
                state.isLoading = false;
                state.message = action?.payload?.message;
            })
            .addCase(deleteCollegeVideoAction.rejected, (state, action: any) => {
                state.isLoading = false;
                state.error = action.payload;
                state.message = action?.payload?.message;
                toastText(action?.payload?.message, "error");
            });

        // ---- Notes ----
        builder
            .addCase(getCollegeNotesAction.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getCollegeNotesAction.fulfilled, (state, action) => {
                state.isLoading = false;
                state.collegeNoteLists = action?.payload?.data;
                state.message = action?.payload?.message;
            })
            .addCase(getCollegeNotesAction.rejected, (state, action: any) => {
                state.isLoading = false;
                state.error = action.payload;
                state.message = action?.payload?.message;
                toastText(action?.payload?.message, "error");
            });

        builder
            .addCase(addCollegeNoteAction.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(addCollegeNoteAction.fulfilled, (state, action) => {
                state.isLoading = false;
                state.message = action?.payload?.message;
            })
            .addCase(addCollegeNoteAction.rejected, (state, action: any) => {
                state.isLoading = false;
                state.error = action.payload;
                state.message = action?.payload?.message;
                toastText(action?.payload?.message, "error");
            });

        builder
            .addCase(updateCollegeNoteAction.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateCollegeNoteAction.fulfilled, (state, action) => {
                state.isLoading = false;
                state.message = action?.payload?.message;
            })
            .addCase(updateCollegeNoteAction.rejected, (state, action: any) => {
                state.isLoading = false;
                state.error = action.payload;
                state.message = action?.payload?.message;
                toastText(action?.payload?.message, "error");
            });

        builder
            .addCase(deleteCollegeNoteAction.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(deleteCollegeNoteAction.fulfilled, (state, action) => {
                state.isLoading = false;
                state.message = action?.payload?.message;
            })
            .addCase(deleteCollegeNoteAction.rejected, (state, action: any) => {
                state.isLoading = false;
                state.error = action.payload;
                state.message = action?.payload?.message;
                toastText(action?.payload?.message, "error");
            });

        // ---- Signed URLs ----
        // These deliberately leave `isLoading` alone: the page runs its own upload progress
        // and the table below it must not flip to skeletons while a file is being sent.
        builder
            .addCase(getCollegeVideoUploadUrlAction.rejected, (state, action: any) => {
                state.error = action.payload;
                state.message = action?.payload?.message;
                toastText(action?.payload?.message, "error");
            });

        builder
            .addCase(getCollegeThumbnailUploadUrlAction.rejected, (state, action: any) => {
                state.error = action.payload;
                state.message = action?.payload?.message;
                toastText(action?.payload?.message, "error");
            });

        builder
            .addCase(getCollegeVideoPreviewUrlAction.rejected, (state, action: any) => {
                state.error = action.payload;
                state.message = action?.payload?.message;
                toastText(action?.payload?.message, "error");
            });

        builder
            .addCase(getCollegeNoteUploadUrlAction.rejected, (state, action: any) => {
                state.error = action.payload;
                state.message = action?.payload?.message;
                toastText(action?.payload?.message, "error");
            });

        builder
            .addCase(getCollegeNotePreviewUrlAction.rejected, (state, action: any) => {
                state.error = action.payload;
                state.message = action?.payload?.message;
                toastText(action?.payload?.message, "error");
            });
    },
});

export default collegeContentSlice;
