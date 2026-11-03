/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAsyncThunk } from "@reduxjs/toolkit";
import { deleteApi, getApi, postApi, putApi } from "../apis";
import { APIEndpoints } from "../../constants/constants";
import {
    AccountingBoard,
    AccountingPlacement,
    AccountingQuestionPayload,
    GetAccountingListPayload,
} from "../../interfaces/interfaces";

// Same success/failure contract as every other thunk: resolve on statusCode 200, otherwise
// reject with the API's error body so the slice can toast its message.
const handleRequest = async (request: Promise<any>, rejectWithValue: (value: any) => any) => {
    try {
        const response = await request;
        if (response?.data?.statusCode === 200) {
            return response.data;
        }
        throw Error(response?.data?.message);
    } catch (error: any) {
        if (!error.response) {
            throw error;
        }
        return rejectWithValue(error?.response?.data);
    }
};

// ---------------------------------------------------------------------------
// Shared
// ---------------------------------------------------------------------------

export const getAccountingFormatsAction = createAsyncThunk(
    "GetAccountingFormats",
    async (_: void, { rejectWithValue }) => handleRequest(getApi(APIEndpoints.AccountingGetFormats), rejectWithValue)
);

// ---------------------------------------------------------------------------
// Ledger entries (admin)
// ---------------------------------------------------------------------------

// One board's pool, paginated for the Entry Pool tab.
export const getLedgerEntriesAction = createAsyncThunk(
    "GetLedgerEntries",
    async (payload: { board: AccountingBoard; page: number; limit: number; search?: string }, { rejectWithValue }) =>
        handleRequest(postApi(APIEndpoints.AccountingGetLedgerEntries, payload), rejectWithValue)
);

// Loads one board's whole pool page by page for the question builder; deliberately not stored in the
// slice, so the paginated Entry Pool tab keeps its own page.
export const getAllLedgerEntriesAction = createAsyncThunk(
    "GetAllLedgerEntries",
    async (board: AccountingBoard, { rejectWithValue }) => {
        const PAGE_SIZE = 500;
        const entries: any[] = [];
        for (let page = 1; ; page++) {
            const result = await handleRequest(postApi(APIEndpoints.AccountingGetLedgerEntries, { board, page, limit: PAGE_SIZE }), rejectWithValue);
            const data = (result as any)?.data;
            // A rejected request returns the rejectWithValue wrapper, which has no data.
            if (!data) return result;
            entries.push(...data.entries);
            if (page >= data.totalPages) break;
        }
        return { statusCode: 200, data: { entries } };
    }
);

export const addLedgerEntryAction = createAsyncThunk(
    "AddLedgerEntry",
    async (payload: { board: AccountingBoard; name: string; category?: string }, { rejectWithValue }) =>
        handleRequest(postApi(APIEndpoints.AccountingAddLedgerEntry, payload), rejectWithValue)
);

// Copies entries into the other board's pool; names already there are skipped.
export const copyLedgerEntriesAction = createAsyncThunk(
    "CopyLedgerEntries",
    async (payload: { ids: string[]; toBoard: AccountingBoard }, { rejectWithValue }) =>
        handleRequest(postApi(APIEndpoints.AccountingCopyLedgerEntries, payload), rejectWithValue)
);

export const updateLedgerEntryAction = createAsyncThunk(
    "UpdateLedgerEntry",
    async (payload: { id: string; name?: string; category?: string }, { rejectWithValue }) =>
        handleRequest(putApi(APIEndpoints.AccountingUpdateLedgerEntry, payload), rejectWithValue)
);

export const deleteLedgerEntriesAction = createAsyncThunk(
    "DeleteLedgerEntries",
    async (ids: string[], { rejectWithValue }) =>
        handleRequest(deleteApi(APIEndpoints.AccountingDeleteLedgerEntries, { ids }), rejectWithValue)
);

// Multipart upload — the request interceptor skips encryption for FormData bodies.
export const importLedgerEntriesAction = createAsyncThunk(
    "ImportLedgerEntries",
    async (formData: FormData, { rejectWithValue }) =>
        handleRequest(postApi(APIEndpoints.AccountingImportLedgerEntries, formData, true), rejectWithValue)
);

// ---------------------------------------------------------------------------
// Accounting questions (admin) — the only calls that carry the answer key
// ---------------------------------------------------------------------------

export const getAccountingQuestionsAction = createAsyncThunk(
    "GetAccountingQuestions",
    async (payload: GetAccountingListPayload, { rejectWithValue }) =>
        handleRequest(postApi(APIEndpoints.AccountingGetQuestions, payload), rejectWithValue)
);

export const getAccountingQuestionByIdAction = createAsyncThunk(
    "GetAccountingQuestionById",
    async (questionId: string, { rejectWithValue }) =>
        handleRequest(getApi(APIEndpoints.AccountingGetQuestionById, { questionId }), rejectWithValue)
);

export const createAccountingQuestionAction = createAsyncThunk(
    "CreateAccountingQuestion",
    async (payload: AccountingQuestionPayload, { rejectWithValue }) =>
        handleRequest(postApi(APIEndpoints.AccountingCreateQuestion, payload), rejectWithValue)
);

export const updateAccountingQuestionAction = createAsyncThunk(
    "UpdateAccountingQuestion",
    async (payload: Partial<AccountingQuestionPayload> & { id: string }, { rejectWithValue }) =>
        handleRequest(putApi(APIEndpoints.AccountingUpdateQuestion, payload), rejectWithValue)
);

export const deleteAccountingQuestionsAction = createAsyncThunk(
    "DeleteAccountingQuestions",
    async (ids: string[], { rejectWithValue }) =>
        handleRequest(deleteApi(APIEndpoints.AccountingDeleteQuestions, { ids }), rejectWithValue)
);

// ---------------------------------------------------------------------------
// Student exam flow
// ---------------------------------------------------------------------------

export const getChapterAccountingQuestionsAction = createAsyncThunk(
    "GetChapterAccountingQuestions",
    async (payload: { board: string; standard: string; subjectId: string; chapterId: string }, { rejectWithValue }) =>
        handleRequest(postApi(APIEndpoints.AccountingGetChapterQuestions, payload), rejectWithValue)
);

export const startAccountingAttemptAction = createAsyncThunk(
    "StartAccountingAttempt",
    async (questionId: string, { rejectWithValue }) =>
        handleRequest(postApi(APIEndpoints.AccountingStartAttempt, { questionId }), rejectWithValue)
);

export const submitAccountingAttemptAction = createAsyncThunk(
    "SubmitAccountingAttempt",
    async (payload: { attemptId: string; placements: AccountingPlacement[] }, { rejectWithValue }) =>
        handleRequest(postApi(APIEndpoints.AccountingSubmitAttempt, payload), rejectWithValue)
);

export const getAccountingAttemptResultAction = createAsyncThunk(
    "GetAccountingAttemptResult",
    async (attemptId: string, { rejectWithValue }) =>
        handleRequest(postApi(APIEndpoints.AccountingGetAttemptResult, { attemptId }), rejectWithValue)
);

export const getMyAccountingAttemptsAction = createAsyncThunk(
    "GetMyAccountingAttempts",
    async (payload: { page: number; limit: number }, { rejectWithValue }) =>
        handleRequest(postApi(APIEndpoints.AccountingGetMyAttempts, payload), rejectWithValue)
);
