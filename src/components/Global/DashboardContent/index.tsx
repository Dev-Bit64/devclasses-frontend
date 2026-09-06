import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    BarChart3,
    BookOpen,
    CircleHelp,
    FileText,
    Trophy,
    Users as UsersIcon,
    type LucideIcon,
} from "lucide-react";
import { PageShell } from "../../common/PageShell";
import { PageHeader } from "../../common/PageHeader";
import { ErrorState } from "../../common/ErrorState";
import { EmptyState } from "../../common/EmptyState";
import { StatCard, StatCardSkeleton } from "../../dashboard/StatCard";
import CollegeAnalytics, { CollegeAnalyticsSkeleton } from "../../dashboard/CollegeAnalytics";
import {
    ProductSwitcher,
    readStoredProduct,
    storeProduct,
    type DashboardProduct,
} from "../../dashboard/ProductSwitcher";
import { getDasboardDetailsAction } from "../../../redux/action/dasboardAction";
import { getCollegeDashboardDetailsAction } from "../../../redux/action/collegeAnalyticsAction";
import { RootState } from "../../../redux/store";
import { AdminDashboardData, StudentDashboardData } from "../../../interfaces/interfaces";

interface DashboardCard {
    title: string;
    description: string;
    icon: LucideIcon;
    count?: string;
}

// Type guard functions to check dashboard data type
const isAdminDashboardData = (data: any): data is AdminDashboardData => {
    return data && "totalStudentsInSystem" in data;
};

const isStudentDashboardData = (data: any): data is StudentDashboardData => {
    return data && "totalTestsGiven" in data;
};

const DashboardContent: React.FC = () => {
    const dispatch = useDispatch();
    const { dashboardDetails, isLoading, error } = useSelector((state: RootState) => state.dashboard);
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const isAdmin = userData.role === 'ADMIN';

    // College analytics live in their own slice, since they come from a separate database.
    const {
        collegeDashboardDetails,
        isLoading: isCollegeLoading,
        error: collegeError,
    } = useSelector((state: RootState) => state.collegeAnalytics);

    // Students never see the switcher, so their view can only ever be the school one.
    const [product, setProduct] = useState<DashboardProduct>(
        isAdmin ? readStoredProduct() : 'school'
    );

    const handleProductChange = (next: DashboardProduct) => {
        setProduct(next);
        storeProduct(next);
    };

    // Fetch dashboard data on component mount
    useEffect(() => {
        if (userData.id) {
            dispatch(getDasboardDetailsAction(userData.id) as any);
        }
    }, [dispatch, userData.id]);

    // Fetched only when the college view is actually open, so the school dashboard costs
    // exactly what it did before this switcher existed.
    useEffect(() => {
        if (isAdmin && product === 'college') {
            dispatch(getCollegeDashboardDetailsAction() as any);
        }
    }, [dispatch, isAdmin, product]);

    // Generate admin dashboard cards from API data
    const getAdminDashboardCards = (): DashboardCard[] => {
        if (!isAdminDashboardData(dashboardDetails)) return [];

        return [
            {
                title: 'Total Students',
                description: 'Number of students in the system',
                icon: UsersIcon,
                count: dashboardDetails?.totalStudentsInSystem?.toString(),
            },
            {
                title: 'Total Subjects',
                description: 'Number of subjects available',
                icon: BookOpen,
                count: dashboardDetails?.totalSubjecstInSystem?.toString(),
            },
            {
                title: 'Total Questions',
                description: 'Total number of questions in the system',
                icon: CircleHelp,
                count: dashboardDetails?.totalQuestionInSystem?.toString(),
            },
        ];
    };

    // Generate student dashboard cards from API data
    const getStudentDashboardCards = (): DashboardCard[] => {
        if (!isStudentDashboardData(dashboardDetails)) return [];

        return [
            {
                title: 'Tests Given',
                description: 'Total number of tests completed',
                icon: FileText,
                count: dashboardDetails.totalTestsGiven.toString(),
            },
            {
                title: 'Highest Score',
                description: 'Your best performance so far',
                icon: Trophy,
                count: `${dashboardDetails.highestScore}%`,
            },
            {
                title: 'Average Score',
                description: 'Your average performance across all tests',
                icon: BarChart3,
                count: dashboardDetails.averageScore?.toFixed(2) + `%`,
            },
        ];
    };

    const welcomeTitle = `Welcome back, ${userData.firstName} ${userData.lastName}!`;
    const welcomeSubtitle = isAdmin
        ? "Here's an overview of your system stats."
        : "Ready to continue your learning journey? Here's your performance overview.";

    // Rendered for admins only; students have a single product and nothing to switch between.
    const switcher = isAdmin ? (
        <ProductSwitcher value={product} onChange={handleProductChange} />
    ) : undefined;

    // College branch. Kept ahead of the school path and fully self-contained, so the school
    // render below is byte-for-byte the behaviour it had before the switcher existed.
    if (isAdmin && product === 'college') {
        const collegeSubtitle =
            "How the college course in the app is doing. School figures are kept separate.";

        return (
            <PageShell>
                <PageHeader title={welcomeTitle} description={collegeSubtitle} actions={switcher} />
                {isCollegeLoading && <CollegeAnalyticsSkeleton />}
                {!isCollegeLoading && collegeError && (
                    <ErrorState
                        title="Error Loading College Dashboard"
                        description="Failed to load college data. Please try again later."
                    />
                )}
                {!isCollegeLoading && !collegeError && collegeDashboardDetails && (
                    <CollegeAnalytics details={collegeDashboardDetails} />
                )}
            </PageShell>
        );
    }

    // Show loading state with skeleton
    if (isLoading) {
        // Admin and student dashboards render a different number of cards.
        const skeletonCount = isAdmin ? 4 : 3;
        return (
            <PageShell>
                <PageHeader title={welcomeTitle} description={welcomeSubtitle} actions={switcher} />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-5 xl:grid-cols-3">
                    {Array.from({ length: skeletonCount }, (_, index) => (
                        <StatCardSkeleton key={index} />
                    ))}
                </div>
            </PageShell>
        );
    }

    // Show error state
    if (error) {
        return (
            <PageShell>
                <PageHeader title={welcomeTitle} description={welcomeSubtitle} actions={switcher} />
                <ErrorState
                    title="Error Loading Dashboard"
                    description="Failed to load dashboard data. Please try again later."
                />
            </PageShell>
        );
    }

    // Get appropriate dashboard cards based on user role and data availability
    const dashboardCards = isAdmin ? getAdminDashboardCards() : getStudentDashboardCards();

    return (
        <PageShell>
            <PageHeader title={welcomeTitle} description={welcomeSubtitle} actions={switcher} />

            {dashboardCards.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-5 xl:grid-cols-3">
                    {dashboardCards.map((card) => (
                        <StatCard
                            key={card.title}
                            title={card.title}
                            description={card.description}
                            value={card.count}
                            icon={card.icon}
                        />
                    ))}
                </div>
            ) : (
                <EmptyState
                    title="No dashboard data available"
                    description="Your stats will appear here once there is activity to report."
                />
            )}
        </PageShell>
    );
};

export default DashboardContent;
