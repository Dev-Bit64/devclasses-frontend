/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAsyncThunk } from "@reduxjs/toolkit";
import { postApi, putApi, getApi, deleteApi } from "../apis";
import { APIEndpoints } from "../../constants/constants";
import { AddChapter, AddSubjectPayload, UpdateChapter, UpdateSubject } from "../../interfaces/interfaces";


export const getSubjectsAction = createAsyncThunk(
    "GetSubjects",
    async (payload: any, { rejectWithValue }) => {
        try {
            const response = await getApi(APIEndpoints.GetSubjects, payload);
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

export const addSubjectAction = createAsyncThunk(
    "AddSubject",
    async (payload: AddSubjectPayload, { rejectWithValue }) => {
        try {
            const response = await postApi(APIEndpoints.AddSubject, payload);
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

export const updateSubjectAction = createAsyncThunk(
    "UpdateSubject",
    async (payload: UpdateSubject, { rejectWithValue }) => {
        try {
            const response = await putApi(APIEndpoints.UpdateSubject, payload);
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

export const deleteSubjectAction = createAsyncThunk(
    "DeleteSubject",
    async (payload: string[], { rejectWithValue }) => {
        try {
            const response = await deleteApi(APIEndpoints.DeleteSubject, payload);
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

export const addChapterAction = createAsyncThunk(
    "AddChapter",
    async (payload: AddChapter, { rejectWithValue }) => {
        try {
            const response = await postApi(APIEndpoints.AddChapter, payload);
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


export const updateChapterAction = createAsyncThunk(
    "UpdateChapter",
    async (payload: UpdateChapter, { rejectWithValue }) => {
        try {
            const response = await putApi(APIEndpoints.UpdateChapter, payload);
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

export const deleteChapterByIdAction = createAsyncThunk(
    "DeleteChapter",
    async (id: string, { rejectWithValue }) => {
        try {
            const response = await deleteApi(APIEndpoints.DeleteChapterById + `?chapterId=` + id);
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

export const deleteMultipleChaptersAction = createAsyncThunk(
    "DeleteChapters",
    async (id: string[], { rejectWithValue }) => {
        try {
            const response = await deleteApi(APIEndpoints.DeleteChapters, id);
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

export const getchaptersBySubjectIdAction = createAsyncThunk(
    "GetChapters",
    async (subjectId: string, { rejectWithValue }) => {
        try {
            const response = await getApi(APIEndpoints.GetChapters + `?subjectId=` + subjectId);
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
