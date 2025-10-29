import { AuthLayout } from "../components/Global/AuthLayout";
import DashboardContent from "../components/Global/DashboardContent";
import { GlobalLayout } from "../layouts";
import EditProfile from "../pages/EditProfile";
import LandingPage from "../pages/LandingPage";
// import Login from "../pages/Login";
import PageNotFound from "../pages/NotFound";
import { createBrowserRouter } from "react-router-dom";
import Results from "../pages/Results";
import YourResult from "../pages/YourResult";
import QuizDetailsPage from "../pages/QuizDetails";
import TestPage from "../pages/Test";
import UsersPage from "../pages/Users";
import QuestionsPage from "../pages/Questions";
import SubjectsPage from "../pages/Subjects";
import ResetPasswordPage from "../pages/ResetPassword";

const router = createBrowserRouter([
    {
        element: <AuthLayout />, // All authenticated pages
        children: [
            {
                path: "/dashboard",
                element: <GlobalLayout />,
                children: [
                    {
                        index: true,
                        element: <DashboardContent />,
                    },
                ],
            },
            {
                path: "/profile",
                element: <GlobalLayout />,
                children: [
                    {
                        index: true,
                        element: <EditProfile />,
                    },
                ],
            },
            {
                path: "/results",
                element: <GlobalLayout />,
                children: [
                    {
                        index: true,
                        element: <Results />,
                    },
                ],
            },
            {
                path: "/your-result",
                element: <GlobalLayout />,
                children: [
                    {
                        index: true,
                        element: <YourResult />,
                    },
                ],
            },
            {
                path: "/quiz-details",
                element: <GlobalLayout />,
                children: [
                    {
                        index: true,
                        element: <QuizDetailsPage />,
                    },
                ],
            },
            {
                path: "/quiz",
                element: <GlobalLayout />,
                children: [
                    {
                        index: true,
                        element: <TestPage />,
                    },
                ],
            },
            {
                path: "/users",
                element: <GlobalLayout />,
                children: [
                    {
                        index: true,
                        element: <UsersPage />,
                    },
                ],
            },
            {
                path: "/questions",
                element: <GlobalLayout />,
                children: [
                    {
                        index: true,
                        element: <QuestionsPage />,
                    },
                ],
            },
            {
                path: "/subjects",
                element: <GlobalLayout />,
                children: [
                    {
                        index: true,
                        element: <SubjectsPage />,
                    },
                ],
            },
        ],
    },

    // {
    //     path: "/login",
    //     element: <Login />,
    // },

    /**
     * Reset Password Route
     * Accessible via /reset-password?token=<reset_token>
     * Allows users to reset their password using a token from email
     */
    {
        path: "/reset-password",
        element: <ResetPasswordPage />,
    },

    {
        path: "/",
        element: <LandingPage />,
    },
    {
        path: "*",
        element: <PageNotFound />,
    },
]);

export default router;