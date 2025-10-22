/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAsyncThunk } from "@reduxjs/toolkit";
import { getApi, postApi } from "../apis";
import { APIEndpoints } from "../../constants/constants";
import { GetExamQuestions, GetExamSubjects } from "../../interfaces/interfaces";

export const getSubjectsForExamAction = createAsyncThunk(
    "GetSubjectsExam",
    async (payload: GetExamSubjects, { rejectWithValue }) => {
        try {
            const response = await getApi(APIEndpoints.GetSubjectsForExam + `?board=${payload.board}&standard=${payload.standard}`);
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

