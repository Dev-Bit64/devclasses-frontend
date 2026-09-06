/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAsyncThunk } from "@reduxjs/toolkit";
import { getApi } from "../apis";
import { APIEndpoints } from "../../constants/constants";
import { GetCollegeStudentsPayload } from "../../interfaces/interfaces";

// ---------------------------------------------------------------------------
// College (mobile) students — read-only. Account changes belong to the student in the app,
// and the device slot moves only through the transfer approval queue.
// ---------------------------------------------------------------------------

export const getCollegeStudentsAction = createAsyncThunk(
    "GetCollegeStudents",
    async (payload: GetCollegeStudentsPayload, { rejectWithValue }) => {
        try {
            // Passed as axios params so an unset semester/search is dropped from the query string.
            const response = await getApi(APIEndpoints.CollegeGetStudents, payload);
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

export const getCollegeStudentDetailAction = createAsyncThunk(
    "GetCollegeStudentDetail",
    async (payload: { userId: string }, { rejectWithValue }) => {
        try {
            const response = await getApi(APIEndpoints.CollegeGetStudentDetail, payload);
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
