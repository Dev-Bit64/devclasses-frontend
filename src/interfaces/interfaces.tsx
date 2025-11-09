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
    subject: string,
    chapter: string,
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
    subject?: string,
    chapter?: string,
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
    standard: string;
}

export interface GetExamQuestions {
    board: string;
    standard: string;
    subject: string;
    chapter: string;
    noOfQuestions: number;
}