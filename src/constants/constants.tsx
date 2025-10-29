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

  // QUIZ_LIST = "/quiz/list",
  // QUIZ_DETAILS = "/quiz/details",
  // SUBMIT_QUIZ = "/quiz/submit",

  // RESULTS = "/results/list",

  //Questions
  GetQuestions = "/questions/getQuestions",
  AddQuestion = "/questions/createQuestion",
  UpdateQuestion = "/questions/updateQuestion",
  DeleteQuestion = "/questions/deleteQuestion",
  ImportQuestions = "/questions/importQuestions",

  //Users
  GetUsers = "/user/getAllUsers",
  DeleteUser = "/user/deleteUser",
  GetUserResults = "/user/results",
  UpdateUserProfile = "/user/updateUser",
  GetUserProfile = "/user/getUserProfile",

  //Subjects
  GetSubjects = "/subject/getSubjects",
  AddSubject = "/subject/addSubject",
  UpdateSubject = "/subject/updateSubject",
  DeleteSubject = "/subject/deleteSubject",

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

}