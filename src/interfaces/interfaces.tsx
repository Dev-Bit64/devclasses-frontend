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
    subjectName:string,
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
    id:string;
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