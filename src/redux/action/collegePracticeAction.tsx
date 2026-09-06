/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAsyncThunk } from "@reduxjs/toolkit";
import { postApi, getApi, deleteApi, patchApi } from "../apis";
import { APIEndpoints } from "../../constants/constants";
import {
    AddCollegePracticeQuestionPayload,
    DeleteCollegeEntityPayload,
    ImportCollegePracticeQuestionsPayload,
    UpdateCollegePracticeQuestionPayload,
} from "../../interfaces/interfaces";

// ---------------------------------------------------------------------------
// Practice questions (admin). These are the only endpoints that carry the answer key.
// ---------------------------------------------------------------------------

export const getCollegePracticeQuestionsAction = createAsyncThunk(
    "GetCollegePracticeQuestions",
    async (chapterId: string, { rejectWithValue }) => {
        try {
            const response = await getApi(APIEndpoints.CollegeGetPracticeQuestions + `?chapterId=` + chapterId);
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

export const addCollegePracticeQuestionAction = createAsyncThunk(
    "AddCollegePracticeQuestion",
    async (payload: AddCollegePracticeQuestionPayload, { rejectWithValue }) => {
        try {
            const response = await postApi(APIEndpoints.CollegeAddPracticeQuestion, payload);
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

export const updateCollegePracticeQuestionAction = createAsyncThunk(
    "UpdateCollegePracticeQuestion",
    async (payload: UpdateCollegePracticeQuestionPayload, { rejectWithValue }) => {
        try {
            const response = await patchApi(APIEndpoints.CollegeUpdatePracticeQuestion, payload);
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

export const deleteCollegePracticeQuestionAction = createAsyncThunk(
    "DeleteCollegePracticeQuestion",
    async (payload: DeleteCollegeEntityPayload, { rejectWithValue }) => {
        try {
            const response = await deleteApi(APIEndpoints.CollegeDeletePracticeQuestion, payload);
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

export const importCollegePracticeQuestionsAction = createAsyncThunk(
    "ImportCollegePracticeQuestions",
    async (payload: ImportCollegePracticeQuestionsPayload, { rejectWithValue }) => {
        try {
            const response = await postApi(APIEndpoints.CollegeImportPracticeQuestions, payload);
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
