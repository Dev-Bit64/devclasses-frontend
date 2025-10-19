
import React, { useEffect } from 'react';
import { Card, Typography, Skeleton, Alert } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import {
  BookOutlined,
  FileTextOutlined,
  CalendarOutlined,
  TrophyOutlined,
  UserOutlined,
  QuestionCircleOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import { UserSvg } from '../../../utils/svg';
import { getDasboardDetailsAction } from '../../../redux/action/dasboardAction';
import { RootState } from '../../../redux/store';
import { AdminDashboardData, StudentDashboardData } from '../../../interfaces/interfaces';

const { Title, Text } = Typography;

// Type guard functions to check dashboard data type
const isAdminDashboardData = (data: any): data is AdminDashboardData => {
  return data && 'totalUsersInSystem' in data;
};

const isStudentDashboardData = (data: any): data is StudentDashboardData => {
  return data && 'totalTestsGiven' in data;
};

const DashboardContent: React.FC = () => {
    const dispatch = useDispatch();
    const { dashboardDetails, isLoading, error } = useSelector((state: RootState) => state.dashboard);
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const isAdmin = userData.role === 'ADMIN';

    // Fetch dashboard data on component mount
    useEffect(() => {
        if (userData.id) {
            dispatch(getDasboardDetailsAction(userData.id) as any);
        }
    }, [dispatch, userData.id]);

    // Generate admin dashboard cards from API data
    const getAdminDashboardCards = () => {
        // if (!isAdminDashboardData(dashboardDetails)) return [];
        
        return [
            {
                title: 'Total Students',
                description: 'Number of students in the system',
                icon: <UserOutlined />,
                count: dashboardDetails?.totalStudentsInSystem?.toString(),
            },
            {
                title: 'Total Subjects',
                description: 'Number of subjects available',
                icon: <BookOutlined />,
                count: dashboardDetails?.totalSubjecstInSystem?.toString(),
            },
            {
                title: 'Total Questions',
                description: 'Total number of questions in the system',
                icon: <QuestionCircleOutlined />,
                count: dashboardDetails?.totalQuestionInSystem?.toString(),
            },
        ];
    };

    // Generate student dashboard cards from API data
    const getStudentDashboardCards = () => {
        if (!isStudentDashboardData(dashboardDetails)) return [];
        
        return [
            {
                title: 'Tests Given',
                description: 'Total number of tests completed',
                icon: <FileTextOutlined />,
                count: dashboardDetails.totalTestsGiven.toString(),
            },
            {
                title: 'Highest Score',
                description: 'Your best performance so far',
                icon: <TrophyOutlined />,
                count: `${dashboardDetails.highestScore}%`,
            },
            {
                title: 'Average Score',
                description: 'Your average performance across all tests',
                icon: <BarChartOutlined />,
                count: `${dashboardDetails.averageScore}%`,
            },
        ];
    };

    // Generate skeleton cards for loading state
    const getSkeletonCards = () => {
        const cardCount = isAdmin ? 4 : 3; // Admin has 4 cards, Student has 3 cards
        return Array.from({ length: cardCount }, (_, index) => (
            <Card key={index} className="dashboard-card">
                <div className="card-icon">
                    <Skeleton.Avatar size={40} shape="circle" />
                </div>
                <Skeleton.Input 
                    active 
                    size="small" 
                    style={{ width: '60%', marginBottom: '8px' }} 
                />
                <Skeleton.Input 
                    active 
                    size="small" 
                    style={{ width: '100%', marginBottom: '16px' }} 
                />
                <Skeleton.Input 
                    active 
                    size="small" 
                    style={{ width: '40%' }} 
                />
            </Card>
        ));
    };

    // Show loading state with skeleton
    if (isLoading) {
        return (
            <>
                {/* Welcome Section Skeleton */}
                <div className="welcome-section">
                    <Skeleton.Input 
                        active 
                        size="large" 
                        style={{ width: '60%', marginBottom: '8px' }} 
                    />
                    <Skeleton.Input 
                        active 
                        size="small" 
                        style={{ width: '80%' }} 
                    />
                </div>

                {/* Dashboard Cards Skeleton */}
                <div className="dashboard-cards">
                    {getSkeletonCards()}
                </div>
            </>
        );
    }

    // Show error state
    if (error) {
        return (
            <div style={{ padding: '20px' }}>
                <Alert
                    message="Error Loading Dashboard"
                    description="Failed to load dashboard data. Please try again later."
                    type="error"
                    showIcon
                />
            </div>
        );
    }

    // Get appropriate dashboard cards based on user role and data availability
    const dashboardCards = isAdmin ? getAdminDashboardCards() : getStudentDashboardCards();

    return (
        <>
            {/* Welcome Section */}
            <div className="welcome-section">
                <Title level={2} className="welcome-title">
                    Welcome back, {`${userData.firstName} ${userData.lastName}`}! 👋
                </Title>
                <Text className="welcome-subtitle">
                    {isAdmin
                        ? "Here's an overview of your system stats."
                        : "Ready to continue your learning journey? Here's your performance overview."}
                </Text>
            </div>

            {/* Dashboard Cards */}
            <div className="dashboard-cards">
                {dashboardCards.length > 0 ? (
                    dashboardCards.map((card, index) => (
                        <Card 
                            key={index}
                            className="dashboard-card"
                            hoverable
                            onClick={() => console.log(`Clicked on ${card.title}`)}
                        >
                            <div className="card-icon">
                                {card.icon}
                            </div>
                            <Title level={4} className="card-title">
                                {card.title}
                            </Title>
                            <Text className="card-description">
                                {card.description}
                            </Text>
                            <div style={{ marginTop: 16 }}>
                                <Text strong style={{ color: '#1890ff' }}>
                                    {card.count}
                                </Text>
                            </div>
                        </Card>
                    ))
                ) : (
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                        <Text>No dashboard data available</Text>
                    </div>
                )}
            </div>
        </>
    );
};

export default DashboardContent;
