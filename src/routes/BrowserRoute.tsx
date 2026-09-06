import React, { Suspense } from "react";
import { AuthLayout } from "../components/Global/AuthLayout";
import { GlobalLayout } from "../layouts";
import { createBrowserRouter, Navigate, useLocation, type RouteObject } from "react-router-dom";
import { BookOpen } from "lucide-react";
import { isAdmin } from "../utils/session";
import RouteErrorBoundary from "./RouteErrorBoundary";

// Route guard that hides admin-only pages.
// This is navigation UX, not a security boundary — the API must authorise these calls itself.
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
    // Redirect to dashboard if the user is not logged in or is not an ADMIN
    if (!isAdmin()) {
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
const LoginPage = React.lazy(() => import("../pages/Login"));
const RegisterPage = React.lazy(() => import("../pages/Register"));
const CollegeCurriculumPage = React.lazy(() => import("../pages/CollegeCurriculum"));
const CollegeContentPage = React.lazy(() => import("../pages/CollegeContent"));
const CollegeOrdersPage = React.lazy(() => import("../pages/CollegeOrders"));
const CollegeDeviceRequestsPage = React.lazy(() => import("../pages/CollegeDeviceRequests"));
const CollegeStudentsPage = React.lazy(() => import("../pages/CollegeStudents"));

const LoadingFallback = () => (
    // Full-screen route transition placeholder, styled on the shared design tokens.
    <div
        role="status"
        aria-live="polite"
        className="dc-app fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-5 bg-surface"
    >
        <div className="grid size-16 place-items-center rounded-2xl bg-accent text-accent-foreground motion-safe:animate-pulse">
            <BookOpen aria-hidden="true" className="size-8" strokeWidth={1.75} />
        </div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Loading
        </p>
    </div>
);

// Old per-kind content URLs now resolve to one tabbed screen. The chapter ids already in the
// query string are carried across, so a deep link keeps landing on the same chapter.
const ContentTabRedirect = ({ tab }: { tab: string }) => {
    const { search } = useLocation();
    const params = new URLSearchParams(search);
    params.set("tab", tab);
    return <Navigate to={`/college-content?${params.toString()}`} replace />;
};

const withSuspense = (Component: React.ComponentType) => (
    <Suspense fallback={<LoadingFallback />}>
        <Component />
    </Suspense>
);

// Every application route lives here; the router below wraps them in one shared error boundary.
const appRoutes: RouteObject[] = [
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
            {
                path: "/college-curriculum",
                element: <GlobalLayout />,
                children: [
                    {
                        index: true,
                        element: <AdminRoute>{withSuspense(CollegeCurriculumPage)}</AdminRoute>,
                    },
                ],
            },
            {
                path: "/college-content",
                element: <GlobalLayout />,
                children: [
                    {
                        index: true,
                        element: <AdminRoute>{withSuspense(CollegeContentPage)}</AdminRoute>,
                    },
                ],
            },
            // Videos, notes and practice used to be three screens. Anything already bookmarked
            // or linked lands on the matching tab instead of a dead URL.
            { path: "/college-videos", element: <ContentTabRedirect tab="videos" /> },
            { path: "/college-notes", element: <ContentTabRedirect tab="notes" /> },
            { path: "/college-practice", element: <ContentTabRedirect tab="practice" /> },
            {
                path: "/college-orders",
                element: <GlobalLayout />,
                children: [
                    {
                        index: true,
                        element: <AdminRoute>{withSuspense(CollegeOrdersPage)}</AdminRoute>,
                    },
                ],
            },
            {
                path: "/college-students",
                element: <GlobalLayout />,
                children: [
                    {
                        index: true,
                        element: <AdminRoute>{withSuspense(CollegeStudentsPage)}</AdminRoute>,
                    },
                ],
            },
            {
                path: "/college-device-requests",
                element: <GlobalLayout />,
                children: [
                    {
                        index: true,
                        element: <AdminRoute>{withSuspense(CollegeDeviceRequestsPage)}</AdminRoute>,
                    },
                ],
            },
        ],
    },

    // Public auth routes — deliberately outside AuthLayout, which redirects unauthenticated users.
    {
        path: "/login",
        element: withSuspense(LoginPage),
    },
    {
        path: "/register",
        element: withSuspense(RegisterPage),
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
];

const router = createBrowserRouter([
    {
        // Pathless root route: a single error boundary for the whole tree. A thrown render or
        // lazy-load error in any nested route bubbles here and shows a recovery screen, not a blank page.
        errorElement: <RouteErrorBoundary />,
        children: appRoutes,
    },
]);

export default router;