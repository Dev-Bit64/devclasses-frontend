/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAsyncThunk } from "@reduxjs/toolkit";
import { getApi } from "../apis";
import { APIEndpoints } from "../../constants/constants";

// ---------------------------------------------------------------------------
// College analytics. Takes no arguments: the endpoint aggregates the whole college
// database and authorises the caller itself.
// ---------------------------------------------------------------------------

export const getCollegeDashboardDetailsAction = createAsyncThunk(
    "GetCollegeDashboardDetails",
    async (_payload: void, { rejectWithValue }) => {
        try {
            const response = await getApi(APIEndpoints.CollegeGetDashboardDetails);
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
