/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, isFulfilled, isPending, isRejected } from "@reduxjs/toolkit";
import { toastText } from "../../utils/toast";
import {
    AccountingAttemptSession,
    AccountingAttemptSummary,
    AccountingChapterQuestion,
    AccountingFormat,
    AccountingQuestion,
    AccountingResult,
    LedgerEntry,
} from "../../interfaces/interfaces";
import {
    addLedgerEntryAction,
    copyLedgerEntriesAction,
    createAccountingQuestionAction,
    deleteAccountingQuestionsAction,
    deleteLedgerEntriesAction,
    getAccountingAttemptResultAction,
    getAccountingFormatsAction,
    getAccountingQuestionByIdAction,
    getAccountingQuestionsAction,
    getAllLedgerEntriesAction,
    getChapterAccountingQuestionsAction,
    getLedgerEntriesAction,
    getMyAccountingAttemptsAction,
    importLedgerEntriesAction,
    startAccountingAttemptAction,
    submitAccountingAttemptAction,
    updateAccountingQuestionAction,
    updateLedgerEntryAction,
} from "../action/accountingAction";

// Own state shape, so the shared InitialState used by the MCQ slices stays untouched.
interface AccountingState {
    isLoading: boolean;
    error: any;
    message: string | null;
    formats: AccountingFormat[];
    ledgerEntries: LedgerEntry[];
    ledgerTotalRecords: number;
    questionLists: AccountingQuestion[];
    questionTotalRecords: number;
    chapterQuestions: AccountingChapterQuestion[];
    attempt: AccountingAttemptSession | null;
    result: AccountingResult | null;
    myAttempts: AccountingAttemptSummary[];
    myAttemptsTotalRecords: number;
}

const initialState: AccountingState = {
    isLoading: false,
    error: null,
    message: null,
    formats: [],
    ledgerEntries: [],
    ledgerTotalRecords: 0,
    questionLists: [],
    questionTotalRecords: 0,
    chapterQuestions: [],
    attempt: null,
    result: null,
    myAttempts: [],
    myAttemptsTotalRecords: 0,
};

// Every thunk shares one loading flag, as the other slices do.
const allActions = [
    getAccountingFormatsAction,
    getLedgerEntriesAction,
    getAllLedgerEntriesAction,
    addLedgerEntryAction,
    updateLedgerEntryAction,
    deleteLedgerEntriesAction,
    importLedgerEntriesAction,
    copyLedgerEntriesAction,
    getAccountingQuestionsAction,
    getAccountingQuestionByIdAction,
    createAccountingQuestionAction,
    updateAccountingQuestionAction,
    deleteAccountingQuestionsAction,
    getChapterAccountingQuestionsAction,
    startAccountingAttemptAction,
    submitAccountingAttemptAction,
    getAccountingAttemptResultAction,
    getMyAccountingAttemptsAction,
] as const;

// Mutations confirm success with the API's own message.
const mutationActions = [
    addLedgerEntryAction,
    updateLedgerEntryAction,
    deleteLedgerEntriesAction,
    importLedgerEntriesAction,
    copyLedgerEntriesAction,
    createAccountingQuestionAction,
    updateAccountingQuestionAction,
    deleteAccountingQuestionsAction,
] as const;

const accountingSlice = createSlice({
    name: "accounting",
    initialState,
    reducers: {
        // Clears the in-progress attempt once it is submitted or abandoned.
        clearAccountingAttempt: (state) => {
            state.attempt = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getAccountingFormatsAction.fulfilled, (state, action) => {
                state.formats = action?.payload?.data?.formats || [];
            })
            .addCase(getLedgerEntriesAction.fulfilled, (state, action) => {
                state.ledgerEntries = action?.payload?.data?.entries || [];
                state.ledgerTotalRecords = action?.payload?.data?.totalRecords || 0;
            })
            .addCase(getAccountingQuestionsAction.fulfilled, (state, action) => {
                state.questionLists = action?.payload?.data?.questions || [];
                state.questionTotalRecords = action?.payload?.data?.totalRecords || 0;
            })
            .addCase(getChapterAccountingQuestionsAction.pending, (state) => {
                state.chapterQuestions = [];
            })
            .addCase(getChapterAccountingQuestionsAction.fulfilled, (state, action) => {
                state.chapterQuestions = action?.payload?.data?.questions || [];
            })
            .addCase(startAccountingAttemptAction.fulfilled, (state, action) => {
                state.attempt = action?.payload?.data || null;
                state.result = null;
            })
            .addCase(submitAccountingAttemptAction.fulfilled, (state, action) => {
                state.result = action?.payload?.data || null;
                state.attempt = null;
            })
            .addCase(getAccountingAttemptResultAction.pending, (state) => {
                state.result = null;
            })
            .addCase(getAccountingAttemptResultAction.fulfilled, (state, action) => {
                state.result = action?.payload?.data || null;
            })
            .addCase(getMyAccountingAttemptsAction.fulfilled, (state, action) => {
                state.myAttempts = action?.payload?.data?.items || [];
                state.myAttemptsTotalRecords = action?.payload?.data?.totalRecords || 0;
            });

        builder
            .addMatcher(isFulfilled(...mutationActions), (_state, action: any) => {
                toastText(action?.payload?.message, "success");
            })
            .addMatcher(isPending(...allActions), (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addMatcher(isFulfilled(...allActions), (state, action: any) => {
                state.isLoading = false;
                state.message = action?.payload?.message;
            })
            .addMatcher(isRejected(...allActions), (state, action: any) => {
                state.isLoading = false;
                state.error = action.payload;
                state.message = action?.payload?.message;
                // Network failures arrive without a payload, so fall back to the thrown message.
                toastText(action?.payload?.message || action?.error?.message || "Something went wrong", "error");
            });
    },
});

export const { clearAccountingAttempt } = accountingSlice.actions;
export default accountingSlice;
