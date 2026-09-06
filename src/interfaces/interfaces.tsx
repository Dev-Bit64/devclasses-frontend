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
