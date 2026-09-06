/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAsyncThunk } from "@reduxjs/toolkit";
import { postApi, getApi, deleteApi, patchApi } from "../apis";
import { APIEndpoints } from "../../constants/constants";
import {
    AddCollegeChapterPayload,
    AddCollegeCoursePayload,
    AddCollegeSemesterPayload,
    AddCollegeSubjectPayload,
    DeleteCollegeEntityPayload,
    UpdateCollegeChapterPayload,
    UpdateCollegeCoursePayload,
    UpdateCollegeSemesterPayload,
    UpdateCollegeSubjectPayload,
} from "../../interfaces/interfaces";

// ---------------------------------------------------------------------------
// Courses
// ---------------------------------------------------------------------------

export const getCollegeCoursesAction = createAsyncThunk(
    "GetCollegeCourses",
    async (_, { rejectWithValue }) => {
        try {
            const response = await getApi(APIEndpoints.CollegeGetCourses);
            if (response?.data?.statusCode === 200) {
                {
                    return response.data;
                }
            } else {
                throw Error(response?.data?.message);
            }
        } catch (error: any) {
            if (!error.response) {
                throw error;
            }
            return rejectWithValue(error?.response?.data);
        }
    }
)

export const addCollegeCourseAction = createAsyncThunk(
    "AddCollegeCourse",
    async (payload: AddCollegeCoursePayload, { rejectWithValue }) => {
        try {
            const response = await postApi(APIEndpoints.CollegeAddCourse, payload);
            if (response?.data?.statusCode === 200) {
                {
                    return response.data;
                }
            } else {
                throw Error(response?.data?.message);
            }
        } catch (error: any) {
            if (!error.response) {
                throw error;
            }
            return rejectWithValue(error?.response?.data);
        }
    }
)

export const updateCollegeCourseAction = createAsyncThunk(
    "UpdateCollegeCourse",
    async (payload: UpdateCollegeCoursePayload, { rejectWithValue }) => {
        try {
            const response = await patchApi(APIEndpoints.CollegeUpdateCourse, payload);
            if (response?.data?.statusCode === 200) {
                {
                    return response.data;
                }
            } else {
                throw Error(response?.data?.message);
            }
        } catch (error: any) {
            if (!error.response) {
                throw error;
            }
            return rejectWithValue(error?.response?.data);
        }
    }
)

export const deleteCollegeCourseAction = createAsyncThunk(
    "DeleteCollegeCourse",
    async (payload: DeleteCollegeEntityPayload, { rejectWithValue }) => {
        try {
            const response = await deleteApi(APIEndpoints.CollegeDeleteCourse, payload);
            if (response?.data?.statusCode === 200) {
                {
                    return response.data;
                }
            } else {
                throw Error(response?.data?.message);
            }
        } catch (error: any) {
            if (!error.response) {
                throw error;
            }
            return rejectWithValue(error?.response?.data);
        }
    }
)

// ---------------------------------------------------------------------------
// Semesters
// ---------------------------------------------------------------------------

export const getCollegeSemestersAction = createAsyncThunk(
    "GetCollegeSemesters",
    async (courseId: string, { rejectWithValue }) => {
        try {
            const response = await getApi(APIEndpoints.CollegeGetSemesters + `?courseId=` + courseId);
            if (response?.data?.statusCode === 200) {
                {
                    return response.data;
                }
            } else {
                throw Error(response?.data?.message);
            }
        } catch (error: any) {
            if (!error.response) {
                throw error;
            }
            return rejectWithValue(error?.response?.data);
        }
    }
)

export const addCollegeSemesterAction = createAsyncThunk(
    "AddCollegeSemester",
    async (payload: AddCollegeSemesterPayload, { rejectWithValue }) => {
        try {
            const response = await postApi(APIEndpoints.CollegeAddSemester, payload);
            if (response?.data?.statusCode === 200) {
                {
                    return response.data;
                }
            } else {
                throw Error(response?.data?.message);
            }
        } catch (error: any) {
            if (!error.response) {
                throw error;
            }
            return rejectWithValue(error?.response?.data);
        }
    }
)

export const updateCollegeSemesterAction = createAsyncThunk(
    "UpdateCollegeSemester",
    async (payload: UpdateCollegeSemesterPayload, { rejectWithValue }) => {
        try {
            const response = await patchApi(APIEndpoints.CollegeUpdateSemester, payload);
            if (response?.data?.statusCode === 200) {
                {
                    return response.data;
                }
            } else {
                throw Error(response?.data?.message);
            }
        } catch (error: any) {
            if (!error.response) {
                throw error;
            }
            return rejectWithValue(error?.response?.data);
        }
    }
)

export const deleteCollegeSemesterAction = createAsyncThunk(
    "DeleteCollegeSemester",
    async (payload: DeleteCollegeEntityPayload, { rejectWithValue }) => {
        try {
            const response = await deleteApi(APIEndpoints.CollegeDeleteSemester, payload);
            if (response?.data?.statusCode === 200) {
                {
                    return response.data;
                }
            } else {
                throw Error(response?.data?.message);
            }
        } catch (error: any) {
            if (!error.response) {
                throw error;
            }
            return rejectWithValue(error?.response?.data);
        }
    }
)

// ---------------------------------------------------------------------------
// Subjects
// ---------------------------------------------------------------------------

export const getCollegeSubjectsAction = createAsyncThunk(
    "GetCollegeSubjects",
    async (semesterId: string, { rejectWithValue }) => {
        try {
            const response = await getApi(APIEndpoints.CollegeGetSubjects + `?semesterId=` + semesterId);
            if (response?.data?.statusCode === 200) {
                {
                    return response.data;
                }
            } else {
                throw Error(response?.data?.message);
            }
        } catch (error: any) {
            if (!error.response) {
                throw error;
            }
            return rejectWithValue(error?.response?.data);
        }
    }
)

export const addCollegeSubjectAction = createAsyncThunk(
    "AddCollegeSubject",
    async (payload: AddCollegeSubjectPayload, { rejectWithValue }) => {
        try {
            const response = await postApi(APIEndpoints.CollegeAddSubject, payload);
            if (response?.data?.statusCode === 200) {
                {
                    return response.data;
                }
            } else {
                throw Error(response?.data?.message);
            }
        } catch (error: any) {
            if (!error.response) {
                throw error;
            }
            return rejectWithValue(error?.response?.data);
        }
    }
)

export const updateCollegeSubjectAction = createAsyncThunk(
    "UpdateCollegeSubject",
    async (payload: UpdateCollegeSubjectPayload, { rejectWithValue }) => {
        try {
            const response = await patchApi(APIEndpoints.CollegeUpdateSubject, payload);
            if (response?.data?.statusCode === 200) {
                {
                    return response.data;
                }
            } else {
                throw Error(response?.data?.message);
            }
        } catch (error: any) {
            if (!error.response) {
                throw error;
            }
            return rejectWithValue(error?.response?.data);
        }
    }
)

export const deleteCollegeSubjectAction = createAsyncThunk(
    "DeleteCollegeSubject",
    async (payload: DeleteCollegeEntityPayload, { rejectWithValue }) => {
        try {
            const response = await deleteApi(APIEndpoints.CollegeDeleteSubject, payload);
            if (response?.data?.statusCode === 200) {
                {
                    return response.data;
                }
            } else {
                throw Error(response?.data?.message);
            }
        } catch (error: any) {
            if (!error.response) {
                throw error;
            }
            return rejectWithValue(error?.response?.data);
        }
    }
)

// ---------------------------------------------------------------------------
// Chapters
// ---------------------------------------------------------------------------

export const getCollegeChaptersAction = createAsyncThunk(
    "GetCollegeChapters",
    async (subjectId: string, { rejectWithValue }) => {
        try {
            const response = await getApi(APIEndpoints.CollegeGetChapters + `?subjectId=` + subjectId);
            if (response?.data?.statusCode === 200) {
                {
                    return response.data;
                }
            } else {
                throw Error(response?.data?.message);
            }
        } catch (error: any) {
            if (!error.response) {
                throw error;
            }
            return rejectWithValue(error?.response?.data);
        }
    }
)

export const addCollegeChapterAction = createAsyncThunk(
    "AddCollegeChapter",
    async (payload: AddCollegeChapterPayload, { rejectWithValue }) => {
        try {
            const response = await postApi(APIEndpoints.CollegeAddChapter, payload);
            if (response?.data?.statusCode === 200) {
                {
                    return response.data;
                }
            } else {
                throw Error(response?.data?.message);
            }
        } catch (error: any) {
            if (!error.response) {
                throw error;
            }
            return rejectWithValue(error?.response?.data);
        }
    }
)

export const updateCollegeChapterAction = createAsyncThunk(
    "UpdateCollegeChapter",
    async (payload: UpdateCollegeChapterPayload, { rejectWithValue }) => {
        try {
            const response = await patchApi(APIEndpoints.CollegeUpdateChapter, payload);
            if (response?.data?.statusCode === 200) {
                {
                    return response.data;
                }
            } else {
                throw Error(response?.data?.message);
            }
        } catch (error: any) {
            if (!error.response) {
                throw error;
            }
            return rejectWithValue(error?.response?.data);
        }
    }
)

export const deleteCollegeChapterAction = createAsyncThunk(
    "DeleteCollegeChapter",
    async (payload: DeleteCollegeEntityPayload, { rejectWithValue }) => {
        try {
            const response = await deleteApi(APIEndpoints.CollegeDeleteChapter, payload);
            if (response?.data?.statusCode === 200) {
                {
                    return response.data;
                }
            } else {
                throw Error(response?.data?.message);
            }
        } catch (error: any) {
            if (!error.response) {
                throw error;
            }
            return rejectWithValue(error?.response?.data);
        }
    }
)
