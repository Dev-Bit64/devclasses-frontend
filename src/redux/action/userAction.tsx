/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAsyncThunk } from "@reduxjs/toolkit";
import { deleteApi, getApi, patchApi, postApi } from "../apis";
import { APIEndpoints } from "../../constants/constants";
import { GetUserResultsPayload, GetUsersPayload } from "../../interfaces/interfaces";
import { message } from "antd";

export const getUserProfileAction = createAsyncThunk(
    "GetUserProfile",
    async (userId: string, { rejectWithValue }) => {
        try {
            const response = await getApi(APIEndpoints.GetUserProfile + `?id=${userId}`);
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
 * Async action to delete one or multiple users
 * 
 * @param userIds - A single user ID or an array of user IDs
 */
export const deleteUserAction = createAsyncThunk(
    "DeleteUser(s)",
    async (userIds: string | string[], { rejectWithValue }) => {
        try {
            // Ensure userIds is always an array
            const ids = Array.isArray(userIds) ? userIds : [userIds];

            // Send DELETE request with body
            const response = await deleteApi(APIEndpoints.DeleteUser, { userIds: ids });

            // Check if deletion was successful
            if (response?.data?.statusCode === 200) {
                return response.data;
            } else {
                throw new Error(response?.data?.message || "Failed to delete user(s)");
            }
        } catch (error: any) {
            // Handle network or API errors properly
            if (!error.response) {
                throw error;
            }
            return rejectWithValue(error?.response?.data);
        }
    }
);


/*Get User Results by Id */
export const getUserResultByIdAction = createAsyncThunk(
    "GetUserResults",
    async (payload: GetUserResultsPayload, { rejectWithValue }) => {
        try {
            const response = await postApi(APIEndpoints.GetUserResults, payload);
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


export const getUsersAction = createAsyncThunk(
    "GetUsers",
    async (payload: GetUsersPayload, { rejectWithValue }) => {
        try {
            const response = await postApi(APIEndpoints.GetUsers, payload);
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

/*Update User Profile */
export const updateUserProfileAction = createAsyncThunk(
    "UpdateUserProfile",
    async (payload: any, { rejectWithValue }) => {
        try {
            const response = await patchApi(APIEndpoints.UpdateUserProfile, payload);
            if (response?.data?.statusCode === 200) {
                {
                    message.success(response?.data?.message);
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

