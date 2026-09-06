/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAsyncThunk } from "@reduxjs/toolkit";
import { postApi, putApi, deleteApi } from "../apis";
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

/**
 * Delete one or multiple questions by ID(s)
 *
 * @param ids - Single question ID (string) or array of question IDs to delete
 */
export const deleteQuestionAction = createAsyncThunk(
    "deleteQuestion",
    async (ids: string | string[], { rejectWithValue }) => {
        try {
            // Send IDs in request body
            // For single deletion: ids will be a string
            // For multiple deletion: ids will be an array
            const payload = { ids };
            const response = await deleteApi(APIEndpoints.DeleteQuestion, payload);
            if (response?.data?.statusCode === 200) {
                // Return both the response and the original IDs for state update
                return {
                    ...response.data,
                    deletedIds: Array.isArray(ids) ? ids : [ids]
                };
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

/**
 * Import questions from Excel file
 *
 * @param payload - FormData containing file and metadata (board, standard, subjectId, chapterId)
 */
export const importQuestionsAction = createAsyncThunk(
    "ImportQuestions",
    async (payload: FormData, { rejectWithValue }) => {
        try {
            // Pass true as third parameter to set Content-Type to multipart/form-data
            const response = await postApi(APIEndpoints.ImportQuestions, payload, true);
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
