/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAsyncThunk } from "@reduxjs/toolkit";
import { getApi } from "../apis";
import { APIEndpoints } from "../../constants/constants";
import { GetCollegeOrdersPayload } from "../../interfaces/interfaces";

// ---------------------------------------------------------------------------
// Orders ledger — read-only. There is no admin write path onto a payment on purpose.
// ---------------------------------------------------------------------------

export const getCollegeOrdersAction = createAsyncThunk(
    "GetCollegeOrders",
    async (payload: GetCollegeOrdersPayload, { rejectWithValue }) => {
        try {
            // Passed as axios params so an unset status/search is dropped from the query string.
            const response = await getApi(APIEndpoints.CollegeGetOrders, payload);
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
