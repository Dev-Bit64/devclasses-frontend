import { createAsyncThunk } from "@reduxjs/toolkit";
import { postApi, putApi } from "../apis";
import { APIEndpoints } from "../../constants/constants";
import { AddQuestionPayload, PagninationPayload, UpdateQuestionPayload } from "../../interfaces/interfaces";

export const getQuestionsAction = createAsyncThunk(
    "getQuestions",
    async (payload: PagninationPayload, { rejectWithValue }) => {
        try {
            const response = await postApi(APIEndpoints.GetQuestions, payload);
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
);

export const addQuestionAction = createAsyncThunk(
    "addQuestion",
    async (payload: AddQuestionPayload, { rejectWithValue }) => {
        try {
            const response = await postApi(APIEndpoints.AddQuestion, payload);
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
);

// export const getChaptersActions = createAsyncThunk(
//     "getChapters",
//     async (_, { rejectWithValue }) => {
//         try {
//             const response = await postApi(APIEndpoints.AddQuestion);
//             if (response?.data?.statusCode === 200) {
//                 {
//                     return response.data;
//                 }
//             } else {
//                 throw Error(response?.data?.message);
//             }
//         } catch (error: any) {
//             if (!error.response) {
//                 throw error;
//             }
//             return rejectWithValue(error?.response?.data);
//         }
//     }
// );

export const updateQuestionAction = createAsyncThunk(
    "updateQuestion",
    async (payload: UpdateQuestionPayload, { rejectWithValue }) => {
        try {
            const response = await putApi(APIEndpoints.UpdateQuestion, payload);
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
);

export const importQuestionsAction = createAsyncThunk(
    "ImportQuestions",
    async (payload: any, { rejectWithValue }) => {
        try {
            const response = await postApi(APIEndpoints.ImportQuestions, payload);
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
);
