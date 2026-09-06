/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAsyncThunk } from "@reduxjs/toolkit";
import { getApi, postApi } from "../apis";
import { APIEndpoints } from "../../constants/constants";
import {
    GetCollegeTransferRequestsPayload,
    ReviewCollegeTransferRequestPayload,
} from "../../interfaces/interfaces";

// ---------------------------------------------------------------------------
// Device transfer approval queue. Students raise requests from the app; the portal only
// reviews them, so there is no create action here.
// ---------------------------------------------------------------------------

export const getCollegeTransferRequestsAction = createAsyncThunk(
    "GetCollegeTransferRequests",
    async (payload: GetCollegeTransferRequestsPayload, { rejectWithValue }) => {
        try {
            // Passed as axios params so an unset status/search is dropped from the query string.
            const response = await getApi(APIEndpoints.CollegeGetTransferRequests, payload);
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

export const reviewCollegeTransferRequestAction = createAsyncThunk(
    "ReviewCollegeTransferRequest",
    async (payload: ReviewCollegeTransferRequestPayload, { rejectWithValue }) => {
        try {
            const response = await postApi(APIEndpoints.CollegeReviewTransferRequest, payload);
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
