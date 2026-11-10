/* eslint-disable @typescript-eslint/no-explicit-any */
export interface RegisterForm {
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    password: string;
    board: string;
    standard: string;
}

// Dashboard data interfaces for different user roles
export interface AdminDashboardData {
    totalUsersInSystem: number;
    totalStudentsInSystem: number;
    totalSubjecstInSystem: number;
    totalQuestionInSystem: number;
}

export interface StudentDashboardData {
    totalTestsGiven: number;
    highestScore: number;
    averageScore: number;
}

// Union type for dashboard data
export type DashboardData = AdminDashboardData | StudentDashboardData;

// API response interface
export interface DashboardApiResponse {
    status: number;
    message: string;
    data: DashboardData;
}

export interface InitialState {
    isLoading: boolean;
    error: any;
    data: any;
    message: string | null;
    dashboardDetails?: DashboardData | null;
    questionLists?: any;
    subjectLists?: any;
    chapterLists?: any
    updatedChapter?: any;
    updatedSubject?: any;
    examSubjectsList?: any
    examQuestions?: any;
    userLists?: any;
    subjectDropdownList?: any;
    totalUsers?: number;
    currentPage?: number;
    totalPages?: number;
    // New fields for exam session management
    examId?: string | null;
    totalQuestions?: number;
    currentQuestion?: any;
    examResult?: ExamResult | null;
    // College/mobile catalog — optional so the shared shape stays valid for school slices
    collegeCourseLists?: any;
    collegeSemesterLists?: any;
    collegeSubjectLists?: any;
    collegeChapterLists?: any;
    // College videos and practice questions — both loaded one chapter at a time, so there is
    // no pagination metadata to carry
    collegeVideoLists?: any;
    collegeNoteLists?: any;
    collegePracticeQuestionLists?: any;
    // College payments ledger — server-paginated, so the page metadata lives beside the rows
    collegeOrderLists?: any;
    collegeOrderTotalRecords?: number;
    collegeOrderPage?: number;
    collegeOrderTotalPages?: number;
    // College device transfer queue — also server-paginated
    collegeTransferRequestLists?: any;
    collegeTransferRequestTotalRecords?: number;
    collegeTransferRequestPage?: number;
    collegeTransferRequestTotalPages?: number;
    // College analytics — one pre-shaped object, so the chart components stay dumb
    collegeDashboardDetails?: CollegeDashboardDetails | null;
    // College (mobile) students — server-paginated list plus the open detail record
    collegeStudentLists?: any;
    collegeStudentTotalRecords?: number;
    collegeStudentPage?: number;
    collegeStudentTotalPages?: number;
    collegeStudentDetail?: CollegeStudentDetail | null;
}

export interface PagninationPayload {
    page: number;
    limit: number;
    search: string;
    sortField: string;
    sortOrder: string;
    board?: string;
    standard?: string;
    subject?: string;
    chapter?: string;
}

export interface GetUserResultsPayload {
    page: number;
    limit: number;
    userId: string,
    sortField: string,
    sortOrder: string,
    subjectId?: string;
    startDate?: Date;
    endDate?: Date;
}

export interface GetUsersPayload {
    page: number;
    limit: number;
    search: string;
    sortField: string,
    sortOrder: string,
    board: string,
    standard: string
}

export interface AddQuestionPayload {
    board: string,
    standard: string,
    question: string,
    optionA: string,
    optionB: string,
    optionC: string,
    subjectId: string,
    chapterId: string,
    optionD: string,
    correctAnswer: string
}

export interface UpdateQuestionPayload {
    id: string;
    board?: string,
    subjectId?: string,
    chapterId?: string,
    standard?: string,
    question?: string,
    optionA?: string,
    optionB?: string,
    optionC?: string,
    optionD?: string,
    correctAnswer?: string
}

export interface AddSubjectPayload {
    subjectName: string,
    subjectDescription: string,
    board: string,
    standard: string
}

export interface UpdateSubject {
    id: string;
    subjectName: string;
    subjectDescription: string;
    board: string;
    standard: string;
}

export interface AddChapter {
    subjectId: string;
    chapterName: string
}

export interface UpdateChapter {
    id: string;
    chapterName: string;
}

export interface GetExamSubjects {
    board: string;
}

export interface GetExamQuestions {
    board: string;
    standard: string;
    subject: string;
    chapter: string;
    noOfQuestions: number;
}

/**
 * Interface for starting an exam session
 * Creates a new exam session and returns examId
 */
export interface StartExamPayload {
    board: string;
    standard: string;
    subject: string;
    chapter: string;
    numberOfQuestions: number;
}

/**
 * Interface for fetching a single question by page
 * Uses examId from the session
 */
export interface GetQuestionPayload {
    examId: string;
    page: number;
}

/**
 * Interface for submitting exam answers
 * Generates exam result and saves to database
 */
export interface SubmitExamPayload {
    userId: string;
    examId: string;
    answers: {
        questionId: string;
        selectedOption: string;
    }[];
}

/**
 * Interface for detailed result of a single question
 * Shows question, selected answer, correct answer, and whether it was correct
 * selectedOption can be null if the question was not answered
 */
export interface DetailedQuestionResult {
    questionId: string;
    question: string;
    options?: { // Option text values (A, B, C, D) for review page
        A?: string;
        B?: string;
        C?: string;
        D?: string;
    } | null;
    selectedOption: string | null;
    correctOption: string;
    isCorrect: boolean;
}

/**
 * Interface for exam result response
 * Contains overall score and detailed results for each question
 */
export interface ExamResult {
    resultId: string;
    examSessionId: string;
    userId: string;
    subjectId: string;
    standard: string;
    board: string;
    chapterId: string;
    score: number;
    wrongAnswers: number;
    totalQuestions: number;
    examDate: string;
    detailedResults: DetailedQuestionResult[];
}

/**
 * Interface for exam session response
 * Returned when starting an exam
 */
export interface ExamSessionResponse {
    examId: string;
    totalQuestions: number;
    startedAt: string;
}

/**
 * Interface for single question response
 * Returned when fetching a question by page
 */
export interface QuestionResponse {
    id: string;
    question: string;
    options: {
        A: string;
        B: string;
        C: string;
        D: string;
    };
    page: number;
    totalPages: number;
}

/**
 * Interface for export exam payload
 * Contains examId and userId
 */
export interface ExportExamPayload {
    examId: string;
    userId: string;
}

/**
 * College/mobile catalog payloads (separate college database, served under /api/v2).
 * Kept distinct from the school Subject/Chapter types on purpose — the two products have
 * different hierarchies and must not share shapes.
 */
export interface AddCollegeCoursePayload {
    name: string;
    description?: string;
    isPublished?: boolean;
}

export interface UpdateCollegeCoursePayload {
    courseId: string;
    name?: string;
    description?: string;
    isPublished?: boolean;
}

export interface AddCollegeSemesterPayload {
    courseId: string;
    number: number;
    title?: string;
    isPublished?: boolean;
}

export interface UpdateCollegeSemesterPayload {
    semesterId: string;
    title?: string;
    isPublished?: boolean;
}

export interface AddCollegeSubjectPayload {
    semesterId: string;
    name: string;
    description?: string;
    orderIndex?: number;
    isPublished?: boolean;
}

export interface UpdateCollegeSubjectPayload {
    subjectId: string;
    name?: string;
    description?: string;
    orderIndex?: number;
    isPublished?: boolean;
}

/** Money is always integer paise, never rupees as a float. */
export interface AddCollegeChapterPayload {
    subjectId: string;
    name: string;
    description?: string;
    orderIndex?: number;
    isFree?: boolean;
    priceInPaise?: number;
    accessDurationDays?: number;
    maxViewCount?: number;
    isPublished?: boolean;
}

export interface UpdateCollegeChapterPayload {
    chapterId: string;
    name?: string;
    description?: string;
    orderIndex?: number;
    isFree?: boolean;
    priceInPaise?: number;
    accessDurationDays?: number;
    maxViewCount?: number;
    isPublished?: boolean;
}

/**
 * College videos. `storageKey` is an object key, never a URL — playback and preview links are
 * presigned per request and are never stored on the row.
 */
export interface CollegeVideo {
    id: string;
    chapterId: string;
    title: string;
    description?: string | null;
    storageKey: string;
    thumbnailKey?: string | null;
    durationSeconds?: number | null;
    orderIndex: number;
    isPublished: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface CollegeUploadUrlPayload {
    chapterId: string;
    fileName: string;
    // Checked against a server-side allow-list before the URL is signed.
    contentType: string;
}

export interface AddCollegeVideoPayload {
    chapterId: string;
    title: string;
    // Comes back from the upload-URL call; the file must be PUT to R2 before this is sent.
    storageKey: string;
    description?: string;
    thumbnailKey?: string;
    durationSeconds?: number;
    orderIndex?: number;
    isPublished?: boolean;
}

export interface UpdateCollegeVideoPayload {
    videoId: string;
    title?: string;
    description?: string;
    storageKey?: string;
    thumbnailKey?: string;
    durationSeconds?: number;
    orderIndex?: number;
    isPublished?: boolean;
}

/** Short-lived signed links for the admin preview. Nothing here is safe to persist. */
export interface CollegeVideoPreview {
    videoId: string;
    title: string;
    durationSeconds?: number | null;
    isPublished: boolean;
    previewUrl: string;
    thumbnailUrl?: string | null;
    expiresInSeconds: number;
}

/**
 * College notes. Every note is either an uploaded PDF (`storageKey`) or inline text
 * (`contentHtml`) — never neither, which the API enforces on both add and update.
 */
export interface CollegeNote {
    id: string;
    chapterId: string;
    title: string;
    storageKey?: string | null;
    contentHtml?: string | null;
    orderIndex: number;
    isPublished: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface AddCollegeNotePayload {
    chapterId: string;
    title: string;
    storageKey?: string;
    contentHtml?: string;
    orderIndex?: number;
    isPublished?: boolean;
}

export interface UpdateCollegeNotePayload {
    noteId: string;
    title?: string;
    // An empty string clears the stored file — that is how a PDF note becomes a text note.
    storageKey?: string;
    contentHtml?: string;
    orderIndex?: number;
    isPublished?: boolean;
}

/** Short-lived signed link for the admin preview. Inline notes never have one. */
export interface CollegeNotePreview {
    noteId: string;
    title: string;
    isPublished: boolean;
    previewUrl: string;
    expiresInSeconds: number;
}

/**
 * College practice questions. The admin endpoints are the only ones that carry the answer key —
 * the student endpoints omit `correctAnswer` and `explanation` until a set is submitted.
 */
export interface CollegePracticeQuestion {
    id: string;
    chapterId: string;
    question: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    correctAnswer: string;
    explanation?: string | null;
    orderIndex: number;
    isPublished: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface AddCollegePracticeQuestionPayload {
    chapterId: string;
    question: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    correctAnswer: string;
    explanation?: string;
    orderIndex?: number;
    isPublished?: boolean;
}

export interface UpdateCollegePracticeQuestionPayload {
    questionId: string;
    question?: string;
    optionA?: string;
    optionB?: string;
    optionC?: string;
    optionD?: string;
    correctAnswer?: string;
    explanation?: string;
    orderIndex?: number;
    isPublished?: boolean;
}

/** Bulk import. Rows are validated one by one server-side, which names the offending row. */
export interface ImportCollegePracticeQuestionsPayload {
    chapterId: string;
    questions: {
        question: string;
        optionA: string;
        optionB: string;
        optionC: string;
        optionD: string;
        correctAnswer: string;
        explanation?: string;
    }[];
    isPublished?: boolean;
}

/** Every college delete endpoint takes the same { ids } body. */
export interface DeleteCollegeEntityPayload {
    ids: string[];
}

/**
 * College payments ledger (read-only). `status` and `search` are optional so an unfiltered
 * page never sends empty query params the API would have to ignore.
 */
export interface GetCollegeOrdersPayload {
    page: number;
    limit: number;
    status?: string;
    search?: string;
}

/** One ledger row as the admin getOrders endpoint selects it. Money is integer paise. */
export interface CollegeOrder {
    id: string;
    provider: string;
    providerOrderId: string;
    providerPaymentId?: string | null;
    amountInPaise: number;
    currency: string;
    status: string;
    createdAt: string;
    paidAt?: string | null;
    user?: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
    } | null;
    chapter?: {
        id: string;
        name: string;
        subject?: { id: string; name: string } | null;
    } | null;
}

/**
 * College (mobile) students. Read-only: the portal has no write path onto these accounts.
 */
export interface GetCollegeStudentsPayload {
    page: number;
    limit: number;
    semester?: number;
    search?: string;
}

export interface CollegeStudentSummary {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string | null;
    course: string;
    semester: number;
    isActive: boolean;
    hasActiveDevice: boolean;
    joinedAt: string;
    entitlementCount: number;
    orderCount: number;
    deviceCount: number;
}

export interface CollegeStudentDetail {
    student: CollegeStudentSummary;
    // The device key itself never leaves the API; only these labels do.
    devices: {
        id: string;
        platform?: string | null;
        model?: string | null;
        osVersion?: string | null;
        appVersion?: string | null;
        firstSeenAt: string;
        lastSeenAt: string;
        isActiveDevice: boolean;
    }[];
    entitlements: {
        id: string;
        status: string;
        chapterId: string | null;
        chapterName: string;
        subjectName: string;
        grantedAt: string;
        expiresAt: string | null;
        pricePaidInPaise: number;
        maxViewCountAtPurchase: number | null;
        viewsConsumed: number;
        // Null means "no limit of that kind", not "nothing left".
        daysRemaining: number | null;
        viewsRemaining: number | null;
    }[];
    orders: {
        id: string;
        amountInPaise: number;
        currency: string;
        status: string;
        createdAt: string;
        paidAt?: string | null;
        chapter?: { id: string; name: string } | null;
    }[];
    transferRequests: {
        id: string;
        status: string;
        toDeviceLabel?: string | null;
        reason?: string | null;
        requestedAt: string;
        reviewedAt?: string | null;
        adminNote?: string | null;
    }[];
    progress: {
        videoId: string;
        title: string;
        chapterId: string | null;
        chapterName: string;
        // Marks whether the watched video's chapter is free, so the Watching tab can badge it.
        isFree: boolean;
        lastPositionSeconds: number;
        completionCount: number;
        durationSeconds: number | null;
        lastWatchedAt: string | null;
    }[];
    summary: {
        totalPaidInPaise: number;
        activeEntitlements: number;
        videosStarted: number;
        videosCompleted: number;
        questionsAnswered: number;
        questionsCorrect: number;
        practiceAccuracy: number;
    };
}

/**
 * College analytics, pre-shaped by the API so the chart components do no maths.
 * Every money figure is integer paise; format it with integer arithmetic only.
 */
export interface CollegeDashboardDetails {
    counters: {
        totalStudents: number;
        publishedChapters: number;
        activeEntitlements: number;
        pendingTransferRequests: number;
        totalRevenueInPaise: number;
        revenueThisMonthInPaise: number;
        revenueLastMonthInPaise: number;
        newStudentsThisMonth: number;
        newStudentsLastMonth: number;
    };
    /** Twelve dense months, oldest first. Empty months are present with zero. */
    revenueByMonth: { month: string; revenueInPaise: number }[];
    enrolmentsBySemester: { semester: number; studentCount: number }[];
    topChapters: {
        chapterId: string;
        chapterName: string;
        subjectName: string;
        purchases: number;
        revenueInPaise: number;
    }[];
    orderStatusBreakdown: { status: string; count: number }[];
}

/**
 * College device transfer queue. Same optional-filter reasoning as the orders ledger.
 */
export interface GetCollegeTransferRequestsPayload {
    page: number;
    limit: number;
    status?: string;
    search?: string;
}

/**
 * Reviewing a queued request. The target device key is never sent from here — it was captured
 * from the requesting handset's x-device-key header when the student asked.
 */
export interface ReviewCollegeTransferRequestPayload {
    requestId: string;
    action: "APPROVE" | "REJECT";
    adminNote?: string;
}

/** One queue row as the admin getTransferRequests endpoint selects it. */
export interface CollegeTransferRequest {
    id: string;
    userId: string;
    fromDeviceId?: string | null;
    toDeviceKey: string;
    toDeviceLabel?: string | null;
    reason?: string | null;
    status: string;
    requestedAt: string;
    reviewedAt?: string | null;
    reviewedByAdminId?: string | null;
    adminNote?: string | null;
    user?: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        phone?: string | null;
        course: string;
        semester: number;
        activeDeviceId?: string | null;
    } | null;
}

// ---------------------------------------------------------------------------
// Accounting exams (balance sheets and accounts, drag-and-drop)
// ---------------------------------------------------------------------------

// Any statement type key served by /accounting/getFormats (e.g. HORIZONTAL, TRADING).
export type AccountingFormatKey = string;

export type AccountingBoard = "GSEB" | "CBSE";

// Partner column of a columnar statement such as Partners' Capital Accounts.
export interface AccountingColumn {
    key: string;
    label: string;
}

export interface AccountingSection {
    key: string;
    label: string;
    // Main head shown above a run of sub-heads (Schedule III only).
    group?: string;
    // Overrides the format's allowsDeduction for this head (e.g. Sales less Sales Returns in Final Accounts); absent on older servers.
    allowsDeduction?: boolean;
    // Every line under this head is added (ADD) or deducted (LESS), so no Add/Less toggle is shown; absent lets each line choose.
    sign?: "ADD" | "LESS";
    // Totals printed after this head: GROUP adds up its main head so far, SIDE the whole side so far (e.g. "(D) Operating Profit…").
    runningTotals?: { label: string; scope: "GROUP" | "SIDE" }[];
}

export interface AccountingSide {
    key: string;
    label: string;
    // Indian T-account wording before each line: "To" on the debit side, "By" on the credit side.
    prefix?: "To" | "By";
    // Name of the side's bottom line in place of "Total" (e.g. a working note's result); absent on older servers.
    totalLabel?: string;
    sections: AccountingSection[];
}

// One statement inside a multi-statement question, e.g. the Trading A/c within Final Accounts.
export interface AccountingStatement {
    key: string;
    label: string;
    layout?: "SIDE_BY_SIDE" | "VERTICAL";
    sides: AccountingSide[];
}

export interface AccountingFormat {
    key: AccountingFormatKey;
    label: string;
    // Compact name for badges; optional so an older server response still renders.
    shortLabel?: string;
    // CASH_FLOW balances against closing cash; COMPUTATION is a one-column working note that ends in a result instead of balancing.
    kind?: "BALANCE_SHEET" | "ACCOUNT" | "FINAL_ACCOUNTS" | "CASH_FLOW" | "COMPUTATION";
    // SIDE_BY_SIDE puts the two sides next to each other on wide screens; VERTICAL stacks them.
    layout?: "SIDE_BY_SIDE" | "VERTICAL";
    boards?: AccountingBoard[];
    // Present only on columnar statements, e.g. 2–6 partners.
    columns?: { min: number; max: number; noun: string };
    // False when no line may be marked "Less" (Final Accounts without adjustments).
    allowsDeduction?: boolean;
    // Present only on multi-statement types; their sides live here and the top-level sides are empty.
    statements?: AccountingStatement[];
    // Pool entries never offered for this type, matched by name case-insensitively; absent offers the whole pool.
    excludedEntries?: string[];
    // True shows negative amounts (outflows, deductions, a net loss) in red brackets, as printed in Cash Flow Statements.
    negativesInBrackets?: boolean;
    // TYPED: students type each particular's name and amount and the totals, with no entry pool; absent means drag and drop.
    answerMode?: "TYPED";
    // True lets the admin add an optional two-column table of given figures to a question (Cash Flow types).
    givenTable?: boolean;
    sides: AccountingSide[];
}

// Optional table of given figures under a question's problem, e.g. closing and opening balances.
export interface AccountingGivenTable {
    firstHeading: string;
    secondHeading: string;
    // A null or zero amount is shown as '-'.
    rows: { particular: string; first: number | null; second: number | null }[];
    // Additional information shown under the table; null when there is none.
    note: string | null;
}

export interface LedgerEntry {
    id: string;
    board?: AccountingBoard;
    name: string;
    category?: string | null;
    createdAt?: string;
    usedInQuestions?: number;
}

export interface AccountingAnswerKeyRow {
    entryId: string;
    entryName?: string;
    sectionKey: string;
    amount: number;
    isDeduction: boolean;
    // Partner column of a columnar statement; omitted or '' for single-column ones.
    columnKey?: string;
}

export interface AccountingQuestion {
    id: string;
    board: string;
    standard: string;
    title: string;
    problem?: string;
    format: AccountingFormatKey;
    columns?: AccountingColumn[] | null;
    // Absent or null when the question has no table of given figures.
    givenTable?: AccountingGivenTable | null;
    timeLimitMinutes?: number | null;
    isPublished: boolean;
    createdAt?: string;
    entryCount: number;
    subject?: { id: string; subname: string };
    chapter?: { id: string; name: string };
    answerKey?: AccountingAnswerKeyRow[];
}

export interface AccountingQuestionPayload {
    board: string;
    standard: string;
    subjectId: string;
    chapterId: string;
    title: string;
    problem: string;
    format: AccountingFormatKey;
    // Sent only for columnar statements on create; null clears them on update.
    columns?: AccountingColumn[] | null;
    // Sent on create only when there is a table; null removes it on update.
    givenTable?: AccountingGivenTable | null;
    timeLimitMinutes?: number | null;
    isPublished: boolean;
    answerKey: Omit<AccountingAnswerKeyRow, "entryName">[];
}

export interface GetAccountingListPayload {
    page: number;
    limit: number;
    search?: string;
    board?: string;
    standard?: string;
    subject?: string;
    chapter?: string;
}

export interface AccountingChapterQuestion {
    id: string;
    title: string;
    format: AccountingFormatKey;
    timeLimitMinutes?: number | null;
}

export interface AccountingAttemptSession {
    attemptId: string;
    startedAt: string;
    question: {
        id: string;
        title: string;
        problem: string;
        format: AccountingFormatKey;
        // Partner columns of a columnar statement; null or absent for one amount per line.
        columns?: AccountingColumn[] | null;
        // Table of given figures shown under the problem; null or absent when there is none.
        givenTable?: AccountingGivenTable | null;
        timeLimitMinutes?: number | null;
        subject?: { subname: string };
        chapter?: { name: string };
    };
    formatDefinition: AccountingFormat;
    // Entry pool — names only, so nothing on a card hints at the answer.
    pool: { id: string; name: string }[];
}

export interface AccountingPlacement {
    entryId: string;
    sectionKey: string;
    amount: number;
    isDeduction: boolean;
    // Partner column of a columnar statement; omitted for single-column ones.
    columnKey?: string;
}

export interface AccountingGradedItem {
    entryId: string;
    name: string;
    // Partner column of a columnar statement; '' or absent for single-column ones.
    columnKey?: string;
    // Statement within a multi-statement question; '' or absent for single-statement ones.
    statementKey?: string;
    status: "CORRECT" | "WRONG" | "MISSED";
    reason?: "NOT_IN_ANSWER" | "WRONG_SECTION" | "WRONG_AMOUNT" | "WRONG_SIGN";
    placed: Omit<AccountingPlacement, "entryId" | "columnKey"> | null;
    expected: Omit<AccountingPlacement, "entryId" | "columnKey"> | null;
    // Typed answers only: the row's id ("typed-<n>", or a total's key), the student's own wording, and whether it is a typed total.
    lineId?: string;
    typedName?: string;
    isTotal?: boolean;
}

// One row a student typed in a typed answer (the working note); a negative amount is a net loss.
export interface AccountingTypedLine {
    sectionKey: string;
    name: string;
    amount: number;
}

// One total a student typed, keyed "<section>#<index>" for a running total or "side:<side>" for a side's bottom line.
export interface AccountingTypedTotal {
    key: string;
    amount: number;
}

export interface AccountingResult {
    attemptId: string;
    questionId: string;
    title: string;
    format: AccountingFormatKey;
    submittedAt: string;
    correctCount: number;
    wrongCount: number;
    missedCount: number;
    totalEntries: number;
    marks: number;
    scorePercent: number;
    totals: { submitted: Record<string, number>; expected: Record<string, number> };
    items: AccountingGradedItem[];
    formatDefinition: AccountingFormat | null;
    // Present only on columnar results: the partner columns and each partner's side totals.
    columns?: AccountingColumn[];
    columnTotals?: Record<string, { submitted: Record<string, number>; expected: Record<string, number> }>;
    // Present only on multi-statement results: each statement's side totals.
    statementTotals?: Record<string, { submitted: Record<string, number>; expected: Record<string, number> }>;
}

export interface AccountingAttemptSummary {
    id: string;
    title: string;
    format: AccountingFormatKey;
    subject?: string;
    chapter?: string;
    correctCount: number;
    wrongCount: number;
    missedCount: number;
    totalEntries: number;
    marks: number;
    scorePercent: number;
    startedAt: string;
    submittedAt: string;
}
