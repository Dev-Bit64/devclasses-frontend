import { EmailSvg, PasswordSvg } from "../utils/svg";

export enum Roles {
  Admin = "ADMIN",
  Student = "STUDENT",
}

export const FORMDATA = {
  loginFields: [
    {
      title: "Email Address",
      id: "email",
      type: "text",
      name: "email",
      svg: <EmailSvg />,
      placeHolder: "",
      required: true,
      rules: [
        {
          required: true,
          message: "Please Enter Your Email Address",
          validateTrigger: "onChange",
        },
        {
          type: "email",
          message: "Please Enter Valid Email Address",
          validateTrigger: "onChange",
        },
      ],
    },
    {
      title: "Password",
      id: "password",
      type: "password",
      name: "password",
      svg: <PasswordSvg />,
      placeHolder: "",
      required: true,
      rules: [
        {
          required: true,
          message: "Please Enter Your Password",
          validateTrigger: "onChange",
        },
      ],
    },
  ],
}

export const userData = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face&auto=format',
  role: 'Student',
  standard: '12th Grade',
  board: 'State Board'
};

export enum APIEndpoints {
  LOGIN = "/auth/login",
  LOGOUT = "/auth/logout",
  REGISTER = "/auth/register",
  ForgotPasswordMail = "/auth/sendForgotPassEmail",
  ResetPassword = "/auth/resetPassword",
  SendWhatsAppMessage = "/auth/sendWhatsappAlert",
  SubmitInquiry = "/auth/inquiry",

  // QUIZ_LIST = "/quiz/list",
  // QUIZ_DETAILS = "/quiz/details",
  // SUBMIT_QUIZ = "/quiz/submit",

  // RESULTS = "/results/list",

  //Questions
  GetQuestions = "/questions/getQuestions",
  AddQuestion = "/questions/createQuestion",
  UpdateQuestion = "/questions/updateQuestion",
  DeleteQuestion = "/questions/deleteQuestions",
  ImportQuestions = "/questions/importQuestions",

  //Users
  GetUsers = "/user/getAllUsers",
  DeleteUser = "/user/deleteUser",
  GetUserResults = "/user/result",
  UpdateUserProfile = "/user/updateUser",
  GetUserProfile = "/user/getUserProfile",

  //Subjects
  GetSubjects = "/subject/getSubjects",
  AddSubject = "/subject/addSubject",
  UpdateSubject = "/subject/updateSubject",
  DeleteSubject = "/subject/deleteSubject",
  GetSubjectsForDD = "/subject/getSubjectsForDD",

  //Chapters
  AddChapter = "/subject/addChapter",
  DeleteChapters = "/subject/deleteChapters",
  UpdateChapter = "/subject/updateChapter",
  DeleteChapterById = "/subject/deleteChapterById",
  GetChapters = "/subject/getChapters",


  //Dashboard
  GetDashboardDetails = "/dashboard/getDashboardDetails",

  //Exam
  GetSubjectsForExam = "/exam/getSubjectsForExam",
  GetQuestionsForExam = "/exam/getExamQuestions",
  StartExam = "/exam/startExam",
  GetQuestion = "/exam/getQuestion",
  GenerateExamResult = "/exam/generateExamResult",
  ExportResultToPDF = "/exam/exportResultToPDF",
  AnalyzeStudentPerformance = "/exam/analyzeStudentPerformance",

  //College - Courses (separate college database, served under /api/v2)
  CollegeGetCourses = "/api/v2/college/catalog/admin/getCourses",
  CollegeAddCourse = "/api/v2/college/catalog/admin/addCourse",
  CollegeUpdateCourse = "/api/v2/college/catalog/admin/updateCourse",
  CollegeDeleteCourse = "/api/v2/college/catalog/admin/deleteCourse",

  //College - Semesters
  CollegeGetSemesters = "/api/v2/college/catalog/admin/getSemesters",
  CollegeAddSemester = "/api/v2/college/catalog/admin/addSemester",
  CollegeUpdateSemester = "/api/v2/college/catalog/admin/updateSemester",
  CollegeDeleteSemester = "/api/v2/college/catalog/admin/deleteSemester",

  //College - Subjects
  CollegeGetSubjects = "/api/v2/college/catalog/admin/getSubjects",
  CollegeAddSubject = "/api/v2/college/catalog/admin/addSubject",
  CollegeUpdateSubject = "/api/v2/college/catalog/admin/updateSubject",
  CollegeDeleteSubject = "/api/v2/college/catalog/admin/deleteSubject",

  //College - Chapters
  CollegeGetChapters = "/api/v2/college/catalog/admin/getChapters",
  CollegeAddChapter = "/api/v2/college/catalog/admin/addChapter",
  CollegeUpdateChapter = "/api/v2/college/catalog/admin/updateChapter",
  CollegeDeleteChapter = "/api/v2/college/catalog/admin/deleteChapter",

  //College - Videos (admin CRUD; student playback is mobile-only)
  CollegeGetVideos = "/api/v2/college/content/admin/getVideos",
  CollegeAddVideo = "/api/v2/college/content/admin/addVideo",
  CollegeUpdateVideo = "/api/v2/college/content/admin/updateVideo",
  CollegeDeleteVideo = "/api/v2/college/content/admin/deleteVideo",
  // The file itself goes browser -> R2 on a presigned PUT; the API only mints the URL.
  CollegeGetVideoUploadUrl = "/api/v2/college/content/admin/getVideoUploadUrl",
  CollegeGetThumbnailUploadUrl = "/api/v2/college/content/admin/getThumbnailUploadUrl",
  CollegeGetVideoPreviewUrl = "/api/v2/college/content/admin/getVideoPreviewUrl",

  //College - Notes (admin CRUD; a note is either an uploaded PDF or written inline)
  CollegeGetNotes = "/api/v2/college/content/admin/getNotes",
  CollegeAddNote = "/api/v2/college/content/admin/addNote",
  CollegeUpdateNote = "/api/v2/college/content/admin/updateNote",
  CollegeDeleteNote = "/api/v2/college/content/admin/deleteNote",
  CollegeGetNoteUploadUrl = "/api/v2/college/content/admin/getNoteUploadUrl",
  CollegeGetNotePreviewUrl = "/api/v2/college/content/admin/getNotePreviewUrl",

  //College - Practice questions (admin CRUD; the student set is mobile-only)
  CollegeGetPracticeQuestions = "/api/v2/college/practice/admin/getQuestions",
  CollegeAddPracticeQuestion = "/api/v2/college/practice/admin/addQuestion",
  CollegeUpdatePracticeQuestion = "/api/v2/college/practice/admin/updateQuestion",
  CollegeDeletePracticeQuestion = "/api/v2/college/practice/admin/deleteQuestion",
  CollegeImportPracticeQuestions = "/api/v2/college/practice/admin/importQuestions",

  //College - Payments (read-only admin ledger; student payment routes are mobile-only)
  CollegeGetOrders = "/api/v2/college/payment/admin/getOrders",

  //College - Device transfers (approval queue; the request side is mobile-only)
  CollegeGetTransferRequests = "/api/v2/college/device/admin/getTransferRequests",
  CollegeReviewTransferRequest = "/api/v2/college/device/admin/reviewTransferRequest",

  //College - Analytics (admin dashboard; the student dashboard is mobile-only)
  CollegeGetDashboardDetails = "/api/v2/college/analytics/getDashboardDetails",

  //College - Mobile users (read-only admin view of the app's students)
  CollegeGetStudents = "/api/v2/college/students/admin/getStudents",
  CollegeGetStudentDetail = "/api/v2/college/students/admin/getStudentDetail",
}