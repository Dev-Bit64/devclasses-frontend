import React, { Suspense } from "react";
import { AuthLayout } from "../components/Global/AuthLayout";
import { GlobalLayout } from "../layouts";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { BookOpen } from "lucide-react";

// Route guard to protect admin-only pages
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
    let user = null;
    try {
        user = JSON.parse(localStorage.getItem("user") || "null");
    } catch (e) {
        user = null;
    }
    // Redirect to dashboard if the user is not logged in or is not an ADMIN
    if (!user || user.role !== "ADMIN") {
        return <Navigate to="/dashboard" replace />;
    }
    return <>{children}</>;
};

const DashboardContent = React.lazy(() => import("../components/Global/DashboardContent"));
const EditProfile = React.lazy(() => import("../pages/EditProfile"));
const LandingPage = React.lazy(() => import("../pages/LandingPage"));
const PageNotFound = React.lazy(() => import("../pages/NotFound"));
const Results = React.lazy(() => import("../pages/Results"));
const YourResult = React.lazy(() => import("../pages/YourResult"));
const QuizDetailsPage = React.lazy(() => import("../pages/QuizDetails"));
const TestPage = React.lazy(() => import("../pages/Test"));
const UsersPage = React.lazy(() => import("../pages/Users"));
const QuestionsPage = React.lazy(() => import("../pages/Questions"));
const SubjectsPage = React.lazy(() => import("../pages/Subjects"));
const ResetPasswordPage = React.lazy(() => import("../pages/ResetPassword"));

const LoadingFallback = () => (
    <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh', 
        width: '100vw', 
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)', // Match dashboard layout background
        color: '#262626', 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        zIndex: 9999 
    }}>
        <style>
            {`
                @keyframes pulse-book {
                    0%, 100% { transform: scale(1) translateY(0); opacity: 0.8; }
                    50% { transform: scale(1.08) translateY(-8px); opacity: 1; }
                }
                @keyframes fade-text {
                    0%, 100% { opacity: 0.6; }
                    50% { opacity: 1; }
                }
            `}
        </style>
        <div style={{ animation: 'pulse-book 1.5s infinite ease-in-out', marginBottom: '20px' }}>
            <BookOpen size={72} color="#1890ff" strokeWidth={1.5} /> {/* Match primary brand color */}
        </div>
        <h2 style={{ fontSize: '18px', fontWeight: '600', letterSpacing: '3px', color: '#595959', animation: 'fade-text 1.5s infinite ease-in-out' }}>
            LOADING...
        </h2>
    </div>
);

const withSuspense = (Component: React.ComponentType) => (
    <Suspense fallback={<LoadingFallback />}>
        <Component />
    </Suspense>
);

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
                        element: withSuspense(DashboardContent),
                    },
                ],
            },
            {
                path: "/profile",
                element: <GlobalLayout />,
                children: [
                    {
                        index: true,
                        element: withSuspense(EditProfile),
                    },
                ],
            },
            {
                path: "/results",
                element: <GlobalLayout />,
                children: [
                    {
                        index: true,
                        element: withSuspense(Results),
                    },
                ],
            },
            {
                path: "/your-result",
                element: <GlobalLayout />,
                children: [
                    {
                        index: true,
                        element: withSuspense(YourResult),
                    },
                ],
            },
            {
                path: "/quiz-details",
                element: <GlobalLayout />,
                children: [
                    {
                        index: true,
                        element: withSuspense(QuizDetailsPage),
                    },
                ],
            },
            {
                path: "/quiz",
                element: <GlobalLayout />,
                children: [
                    {
                        index: true,
                        element: withSuspense(TestPage),
                    },
                ],
            },
            {
                path: "/users",
                element: <GlobalLayout />,
                children: [
                    {
                        index: true,
                        element: <AdminRoute>{withSuspense(UsersPage)}</AdminRoute>,
                    },
                ],
            },
            {
                path: "/questions",
                element: <GlobalLayout />,
                children: [
                    {
                        index: true,
                        element: <AdminRoute>{withSuspense(QuestionsPage)}</AdminRoute>,
                    },
                ],
            },
            {
                path: "/subjects",
                element: <GlobalLayout />,
                children: [
                    {
                        index: true,
                        element: <AdminRoute>{withSuspense(SubjectsPage)}</AdminRoute>,
                    },
                ],
            },
        ],
    },

    {
        path: "/reset-password",
        element: withSuspense(ResetPasswordPage),
    },

    {
        path: "/",
        element: withSuspense(LandingPage),
    },
    {
        path: "*",
        element: withSuspense(PageNotFound),
    },
]);

export default router;