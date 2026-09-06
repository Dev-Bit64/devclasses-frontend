/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice } from "@reduxjs/toolkit";
import { toastText } from "../../utils/toast";
import { InitialState } from "../../interfaces/interfaces";
import {
    addCollegeChapterAction,
    addCollegeCourseAction,
    addCollegeSemesterAction,
    addCollegeSubjectAction,
    deleteCollegeChapterAction,
    deleteCollegeCourseAction,
    deleteCollegeSemesterAction,
    deleteCollegeSubjectAction,
    getCollegeChaptersAction,
    getCollegeCoursesAction,
    getCollegeSemestersAction,
    getCollegeSubjectsAction,
    updateCollegeChapterAction,
    updateCollegeCourseAction,
    updateCollegeSemesterAction,
    updateCollegeSubjectAction,
} from "../action/collegeCatalogAction";

const initialState: InitialState = {
    isLoading: false,
    error: null,
    data: {},
    message: null,
    collegeCourseLists: [],
    collegeSemesterLists: [],
    collegeSubjectLists: [],
    collegeChapterLists: [],
};

const collegeCatalogSlice = createSlice({
    name: "collegeCatalog",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        // ---- Courses ----
        builder
            .addCase(getCollegeCoursesAction.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getCollegeCoursesAction.fulfilled, (state, action) => {
                state.isLoading = false;
                state.collegeCourseLists = action?.payload?.data;
                state.message = action?.payload?.message;
            })
            .addCase(getCollegeCoursesAction.rejected, (state, action: any) => {
                state.isLoading = false;
                state.error = action.payload;
                state.message = action?.payload?.message;
                toastText(action?.payload?.message, "error");
            });

        builder
            .addCase(addCollegeCourseAction.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(addCollegeCourseAction.fulfilled, (state, action) => {
                state.isLoading = false;
                state.message = action?.payload?.message;
            })
            .addCase(addCollegeCourseAction.rejected, (state, action: any) => {
                state.isLoading = false;
                state.error = action.payload;
                state.message = action?.payload?.message;
                toastText(action?.payload?.message, "error");
            });

        builder
            .addCase(updateCollegeCourseAction.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateCollegeCourseAction.fulfilled, (state, action) => {
                state.isLoading = false;
                state.message = action?.payload?.message;
            })
            .addCase(updateCollegeCourseAction.rejected, (state, action: any) => {
                state.isLoading = false;
                state.error = action.payload;
                state.message = action?.payload?.message;
                toastText(action?.payload?.message, "error");
            });

        builder
            .addCase(deleteCollegeCourseAction.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(deleteCollegeCourseAction.fulfilled, (state, action) => {
                state.isLoading = false;
                state.message = action?.payload?.message;
            })
            .addCase(deleteCollegeCourseAction.rejected, (state, action: any) => {
                state.isLoading = false;
                state.error = action.payload;
                state.message = action?.payload?.message;
                toastText(action?.payload?.message, "error");
            });

        // ---- Semesters ----
        builder
            .addCase(getCollegeSemestersAction.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getCollegeSemestersAction.fulfilled, (state, action) => {
                state.isLoading = false;
                state.collegeSemesterLists = action?.payload?.data;
                state.message = action?.payload?.message;
            })
            .addCase(getCollegeSemestersAction.rejected, (state, action: any) => {
                state.isLoading = false;
                state.error = action.payload;
                state.message = action?.payload?.message;
                toastText(action?.payload?.message, "error");
            });

        builder
            .addCase(addCollegeSemesterAction.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(addCollegeSemesterAction.fulfilled, (state, action) => {
                state.isLoading = false;
                state.message = action?.payload?.message;
            })
            .addCase(addCollegeSemesterAction.rejected, (state, action: any) => {
                state.isLoading = false;
                state.error = action.payload;
                state.message = action?.payload?.message;
                toastText(action?.payload?.message, "error");
            });

        builder
            .addCase(updateCollegeSemesterAction.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateCollegeSemesterAction.fulfilled, (state, action) => {
                state.isLoading = false;
                state.message = action?.payload?.message;
            })
            .addCase(updateCollegeSemesterAction.rejected, (state, action: any) => {
                state.isLoading = false;
                state.error = action.payload;
                state.message = action?.payload?.message;
                toastText(action?.payload?.message, "error");
            });

        builder
            .addCase(deleteCollegeSemesterAction.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(deleteCollegeSemesterAction.fulfilled, (state, action) => {
                state.isLoading = false;
                state.message = action?.payload?.message;
            })
            .addCase(deleteCollegeSemesterAction.rejected, (state, action: any) => {
                state.isLoading = false;
                state.error = action.payload;
                state.message = action?.payload?.message;
                toastText(action?.payload?.message, "error");
            });

        // ---- Subjects ----
        builder
            .addCase(getCollegeSubjectsAction.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getCollegeSubjectsAction.fulfilled, (state, action) => {
                state.isLoading = false;
                state.collegeSubjectLists = action?.payload?.data;
                state.message = action?.payload?.message;
            })
            .addCase(getCollegeSubjectsAction.rejected, (state, action: any) => {
                state.isLoading = false;
                state.error = action.payload;
                state.message = action?.payload?.message;
                toastText(action?.payload?.message, "error");
            });

        builder
            .addCase(addCollegeSubjectAction.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(addCollegeSubjectAction.fulfilled, (state, action) => {
                state.isLoading = false;
                state.message = action?.payload?.message;
            })
            .addCase(addCollegeSubjectAction.rejected, (state, action: any) => {
                state.isLoading = false;
                state.error = action.payload;
                state.message = action?.payload?.message;
                toastText(action?.payload?.message, "error");
            });

        builder
            .addCase(updateCollegeSubjectAction.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateCollegeSubjectAction.fulfilled, (state, action) => {
                state.isLoading = false;
                state.message = action?.payload?.message;
            })
            .addCase(updateCollegeSubjectAction.rejected, (state, action: any) => {
                state.isLoading = false;
                state.error = action.payload;
                state.message = action?.payload?.message;
                toastText(action?.payload?.message, "error");
            });

        builder
            .addCase(deleteCollegeSubjectAction.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(deleteCollegeSubjectAction.fulfilled, (state, action) => {
                state.isLoading = false;
                state.message = action?.payload?.message;
            })
            .addCase(deleteCollegeSubjectAction.rejected, (state, action: any) => {
                state.isLoading = false;
                state.error = action.payload;
                state.message = action?.payload?.message;
                toastText(action?.payload?.message, "error");
            });

        // ---- Chapters ----
        builder
            .addCase(getCollegeChaptersAction.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getCollegeChaptersAction.fulfilled, (state, action) => {
                state.isLoading = false;
                state.collegeChapterLists = action?.payload?.data;
                state.message = action?.payload?.message;
            })
            .addCase(getCollegeChaptersAction.rejected, (state, action: any) => {
                state.isLoading = false;
                state.error = action.payload;
                state.message = action?.payload?.message;
                toastText(action?.payload?.message, "error");
            });

        builder
            .addCase(addCollegeChapterAction.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(addCollegeChapterAction.fulfilled, (state, action) => {
                state.isLoading = false;
                state.message = action?.payload?.message;
            })
            .addCase(addCollegeChapterAction.rejected, (state, action: any) => {
                state.isLoading = false;
                state.error = action.payload;
                state.message = action?.payload?.message;
                toastText(action?.payload?.message, "error");
            });

        builder
            .addCase(updateCollegeChapterAction.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateCollegeChapterAction.fulfilled, (state, action) => {
                state.isLoading = false;
                state.message = action?.payload?.message;
            })
            .addCase(updateCollegeChapterAction.rejected, (state, action: any) => {
                state.isLoading = false;
                state.error = action.payload;
                state.message = action?.payload?.message;
                toastText(action?.payload?.message, "error");
            });

        builder
            .addCase(deleteCollegeChapterAction.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(deleteCollegeChapterAction.fulfilled, (state, action) => {
                state.isLoading = false;
                state.message = action?.payload?.message;
            })
            .addCase(deleteCollegeChapterAction.rejected, (state, action: any) => {
                state.isLoading = false;
                state.error = action.payload;
                state.message = action?.payload?.message;
                toastText(action?.payload?.message, "error");
            });
    },
});

export default collegeCatalogSlice;
