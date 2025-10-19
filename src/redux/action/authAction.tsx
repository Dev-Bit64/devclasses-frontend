/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAsyncThunk } from "@reduxjs/toolkit";
import { postApi } from "../apis";
import { APIEndpoints } from "../../constants/constants";

export const loginAction = createAsyncThunk(
    "login",
    async (data: any, { rejectWithValue }) => {
        try {
            const response = await postApi(APIEndpoints.LOGIN, data);
            if (response?.data?.statusCode === 200) {
                {
                    localStorage.setItem("accessToken", response?.data?.data?.accessToken);
                    localStorage.setItem("user", JSON.stringify(response?.data?.data?.user));
                    return response.data;
                }
            } else {
                return rejectWithValue(response?.data?.message);
            }
        } catch (error: any) {
            if (!error.response) {
                throw error;
            }
            return rejectWithValue(error?.response?.data);
        }
    }
);

export const logoutAction = createAsyncThunk(
    "Logout",
    async (data: any, { rejectWithValue }) => {
        try {
            // Make an API call to log the user out
            const response = await postApi(APIEndpoints.LOGOUT, data);
            if (response?.data?.statusCode === 200) {
                // Clear the accessToken cookie when the user logs out
                localStorage.clear();
            }
            return response.data;
        } catch (error: any) {
            if (!error.response) {
                throw error;
            }
            return rejectWithValue(error?.response?.data);
        }
    }
);

export const registerAction = createAsyncThunk(
    "Register",
    async (data: any, { rejectWithValue }) => {
        try {
            const response = await postApi(APIEndpoints.REGISTER, data);
            if (response?.data?.statusCode === 200) {
                {
                    localStorage.setItem("accessToken", response?.data?.data?.accessToken);
                    localStorage.setItem("user", JSON.stringify(response?.data?.data?.user));
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
