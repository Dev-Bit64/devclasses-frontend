/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAsyncThunk } from "@reduxjs/toolkit";
import { postApi, getApi, deleteApi, patchApi } from "../apis";
import { APIEndpoints } from "../../constants/constants";
import {
    AddCollegeNotePayload,
    AddCollegeVideoPayload,
    CollegeUploadUrlPayload,
    DeleteCollegeEntityPayload,
    UpdateCollegeNotePayload,
    UpdateCollegeVideoPayload,
} from "../../interfaces/interfaces";

// ---------------------------------------------------------------------------
// Videos
// ---------------------------------------------------------------------------

export const getCollegeVideosAction = createAsyncThunk(
    "GetCollegeVideos",
    async (chapterId: string, { rejectWithValue }) => {
        try {
            const response = await getApi(APIEndpoints.CollegeGetVideos + `?chapterId=` + chapterId);
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

export const addCollegeVideoAction = createAsyncThunk(
    "AddCollegeVideo",
    async (payload: AddCollegeVideoPayload, { rejectWithValue }) => {
        try {
            const response = await postApi(APIEndpoints.CollegeAddVideo, payload);
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

export const updateCollegeVideoAction = createAsyncThunk(
    "UpdateCollegeVideo",
    async (payload: UpdateCollegeVideoPayload, { rejectWithValue }) => {
        try {
            const response = await patchApi(APIEndpoints.CollegeUpdateVideo, payload);
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

export const deleteCollegeVideoAction = createAsyncThunk(
    "DeleteCollegeVideo",
    async (payload: DeleteCollegeEntityPayload, { rejectWithValue }) => {
        try {
            const response = await deleteApi(APIEndpoints.CollegeDeleteVideo, payload);
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

// ---------------------------------------------------------------------------
// Notes
// ---------------------------------------------------------------------------

export const getCollegeNotesAction = createAsyncThunk(
    "GetCollegeNotes",
    async (chapterId: string, { rejectWithValue }) => {
        try {
            const response = await getApi(APIEndpoints.CollegeGetNotes + `?chapterId=` + chapterId);
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

export const addCollegeNoteAction = createAsyncThunk(
    "AddCollegeNote",
    async (payload: AddCollegeNotePayload, { rejectWithValue }) => {
        try {
            const response = await postApi(APIEndpoints.CollegeAddNote, payload);
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

export const updateCollegeNoteAction = createAsyncThunk(
    "UpdateCollegeNote",
    async (payload: UpdateCollegeNotePayload, { rejectWithValue }) => {
        try {
            const response = await patchApi(APIEndpoints.CollegeUpdateNote, payload);
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

export const deleteCollegeNoteAction = createAsyncThunk(
    "DeleteCollegeNote",
    async (payload: DeleteCollegeEntityPayload, { rejectWithValue }) => {
        try {
            const response = await deleteApi(APIEndpoints.CollegeDeleteNote, payload);
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

// ---------------------------------------------------------------------------
// Signed URLs. These only mint links — the video or PDF file itself is PUT straight from the
// browser to R2, outside this axios instance, so it never meets the payload encryption.
// ---------------------------------------------------------------------------

export const getCollegeVideoUploadUrlAction = createAsyncThunk(
    "GetCollegeVideoUploadUrl",
    async (payload: CollegeUploadUrlPayload, { rejectWithValue }) => {
        try {
            const response = await postApi(APIEndpoints.CollegeGetVideoUploadUrl, payload);
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

export const getCollegeThumbnailUploadUrlAction = createAsyncThunk(
    "GetCollegeThumbnailUploadUrl",
    async (payload: CollegeUploadUrlPayload, { rejectWithValue }) => {
        try {
            const response = await postApi(APIEndpoints.CollegeGetThumbnailUploadUrl, payload);
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

export const getCollegeVideoPreviewUrlAction = createAsyncThunk(
    "GetCollegeVideoPreviewUrl",
    async (videoId: string, { rejectWithValue }) => {
        try {
            const response = await getApi(APIEndpoints.CollegeGetVideoPreviewUrl + `?videoId=` + videoId);
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

export const getCollegeNoteUploadUrlAction = createAsyncThunk(
    "GetCollegeNoteUploadUrl",
    async (payload: CollegeUploadUrlPayload, { rejectWithValue }) => {
        try {
            const response = await postApi(APIEndpoints.CollegeGetNoteUploadUrl, payload);
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

export const getCollegeNotePreviewUrlAction = createAsyncThunk(
    "GetCollegeNotePreviewUrl",
    async (noteId: string, { rejectWithValue }) => {
        try {
            const response = await getApi(APIEndpoints.CollegeGetNotePreviewUrl + `?noteId=` + noteId);
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
