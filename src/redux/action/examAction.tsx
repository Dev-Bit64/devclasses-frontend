/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAsyncThunk } from "@reduxjs/toolkit";
import { getApi, postApi, postApiBlob } from "../apis";
import { APIEndpoints } from "../../constants/constants";
import { GetExamQuestions, GetExamSubjects, StartExamPayload, GetQuestionPayload, SubmitExamPayload, ExportExamPayload } from "../../interfaces/interfaces";

export const getSubjectsForExamAction = createAsyncThunk(
    "GetSubjectsExam",
    async (payload: GetExamSubjects, { rejectWithValue }) => {
        try {
            const response = await getApi(APIEndpoints.GetSubjectsForExam + `?board=${payload.board}`);
            if (response?.data?.statusCode === 200) {
                return response.data;
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


export const getExamQuestionsAction = createAsyncThunk(
    'GetExamQuestions',
    async (payload: GetExamQuestions, { rejectWithValue }) => {
        try {
            const response = await postApi(APIEndpoints.GetQuestionsForExam, payload);
            if (response?.data?.statusCode === 200) {
                return response.data;
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

/**
 * Start Exam Action
 * Creates a new exam session and returns examId, totalQuestions, and startedAt
 * This should be called when user clicks "Generate Exam" button
 */
export const startExamAction = createAsyncThunk(
    'StartExam',
    async (payload: StartExamPayload, { rejectWithValue }) => {
        try {
            const response = await postApi(APIEndpoints.StartExam, payload);
            if (response?.data?.statusCode === 200) {
                return response.data;
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

/**
 * Get Question Action
 * Fetches a single question by page number using examId
 * This should be called when navigating between questions
 */
export const getQuestionAction = createAsyncThunk(
    'GetQuestion',
    async (payload: GetQuestionPayload, { rejectWithValue }) => {
        try {
            const response = await postApi(APIEndpoints.GetQuestion, payload);
            if (response?.data?.statusCode === 200) {
                return response.data;
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

/**
 * Submit Exam Action
 * Submits exam answers and generates result
 * This should be called when user clicks "Submit Test" button
 */
export const submitExamAction = createAsyncThunk(
    'SubmitExam',
    async (payload: SubmitExamPayload, { rejectWithValue }) => {
        try {
            const response = await postApi(APIEndpoints.GenerateExamResult, payload);
            if (response?.data?.statusCode === 200) {
                return response.data;
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


/**
 * Export Exam Action
 * Exports exam results to a PDF file
 * This should be called when user clicks "Export Results" button
 */
export const exportExamResultToPDFAction = createAsyncThunk(
    'ExportExamResultToPDF',
    async (payload: ExportExamPayload, { rejectWithValue }) => {
        try {
            const response = await postApiBlob(APIEndpoints.ExportResultToPDF, payload);
            // For blob responses, return the data directly
            return response.data;
        } catch (error: any) {
            if (!error.response) {
                throw error;
            }
            const errorData = error?.response?.data;
            // Errors of a blob request arrive as a Blob, so read the JSON body out of it
            if (errorData instanceof Blob) {
                try {
                    return rejectWithValue(JSON.parse(await errorData.text()));
                } catch {
                    return rejectWithValue(errorData);
                }
            }
            return rejectWithValue(errorData);
        }
    }
)

/**
 * Analyze Student Performance Action
 * Fetches AI or rule-based analysis and insights for a given student
 */
export const analyzeStudentPerformanceAction = createAsyncThunk(
    'AnalyzeStudentPerformance',
    async (payload: { userId: string }, { rejectWithValue }) => {
        try {
            const response = await postApi(APIEndpoints.AnalyzeStudentPerformance, payload);
            if (response?.data?.statusCode === 200) {
                return response.data;
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


