import { createAsyncThunk } from "@reduxjs/toolkit";
import { getApi } from "../apis";
import { APIEndpoints } from "../../constants/constants";

export const getDasboardDetailsAction = createAsyncThunk(
    "GetDashboardDetails",
    async (userId: string, { rejectWithValue }) => {
        try {
            const response = await getApi(APIEndpoints.GetDashboardDetails + `?userId=${userId}`);
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