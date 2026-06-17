/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Drawer, Table, Button, message, Typography, Row, Col, Skeleton, Tabs, Tag, Card, Divider, Spin } from 'antd';
import { FilePdfOutlined, ReloadOutlined, InfoCircleOutlined, BulbOutlined, CheckCircleOutlined, CloseCircleOutlined, StarOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useDispatch, useSelector } from 'react-redux';
import { getUserResultByIdAction } from '../../redux/action/userAction';
import { RootState, AppDispatch } from '../../redux/store';
import './index.scss';
import { exportExamResultToPDFAction, analyzeStudentPerformanceAction } from '../../redux/action/examAction';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie
} from 'recharts';

const { Title, Text } = Typography;

// Interface for user result data from API
interface UserResult {
  id: string;
  examDate: string;
  examSessionId: string;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  totalTestsGiven: number;
  subject: {
    subname: string;
  };
  chapter: {
    name: string;
  };
  standard: string;
  board: string;
}

// Interface for AI/Rule-based performance insights
interface AIInsights {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  isAI: boolean;
}

// Props interface for the drawer component (backward compatible props name)
interface UserResultsModalProps {
  visible: boolean;
  onClose: () => void;
  userName: string;
  userId: string | number;
}

const UserResultsModal: React.FC<UserResultsModalProps> = ({
  visible,
  onClose,
  userName,
  userId,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [loadingExamId, setLoadingExamId] = useState<string | null>(null);

  // States for paginated results table
  const [userResults, setUserResults] = useState<UserResult[]>([]);
  const [page, setPage] = useState<number>(1);
  const [totalResults, setTotalResults] = useState<number>(0);
  const PAGE_SIZE = 10;

  // States for all results (used in charts computation)
  const [allResults, setAllResults] = useState<UserResult[]>([]);
  const [loadingAllResults, setLoadingAllResults] = useState<boolean>(false);

  // States for AI Insights
  const [insights, setInsights] = useState<AIInsights | null>(null);
  const [loadingInsights, setLoadingInsights] = useState<boolean>(false);

  // Get loading state from Redux (for table skeleton loaders)
  const isLoadingResults = useSelector((state: RootState) => state.user.isLoading);

  /**
   * Fetch paginated results for the table view
   */
  const fetchUserResults = useCallback(async (pageNum: number) => {
    if (!userId) return;
    try {
      const payload = {
        userId: String(userId),
        page: pageNum,
        limit: PAGE_SIZE,
        sortField: 'examDate',
        sortOrder: 'desc',
      };

      const response = await dispatch(getUserResultByIdAction(payload)).unwrap();

      if (response?.data?.results) {
        setUserResults(response.data.results);
        setTotalResults(response.data.total || 0);
      } else {
        setUserResults([]);
        setTotalResults(0);
      }
    } catch (error: any) {
      console.error('Error fetching user results:', error);
      message.error(error?.message || 'Failed to fetch user results');
      setUserResults([]);
      setTotalResults(0);
    }
  }, [dispatch, userId, PAGE_SIZE]);

  /**
   * Fetch all user results with limit=-1 for calculating chart metrics
   */
  const fetchAllResultsForCharts = useCallback(async () => {
    if (!userId) return;
    try {
      setLoadingAllResults(true);
      const payload = {
        userId: String(userId),
        page: 1,
        limit: -1,
        sortField: 'examDate',
        sortOrder: 'asc', // Ascending order gives chronological flow for trend lines
      };

      const response = await dispatch(getUserResultByIdAction(payload)).unwrap();

      if (response?.data?.results) {
        setAllResults(response.data.results);
      } else {
        setAllResults([]);
      }
    } catch (error) {
      console.error('Error fetching all user results for charts:', error);
    } finally {
      setLoadingAllResults(false);
    }
  }, [dispatch, userId]);

  /**
   * Fetch AI/Rule-based performance insights
   */
  const fetchAIInsights = useCallback(async () => {
    if (!userId) return;
    try {
      setLoadingInsights(true);
      const response = await dispatch(analyzeStudentPerformanceAction({ userId: String(userId) })).unwrap();
      if (response?.data) {
        setInsights(response.data);
      } else {
        setInsights(null);
      }
    } catch (error: any) {
      console.error('Error fetching student insights:', error);
      message.error('Failed to load academic insights');
    } finally {
      setLoadingInsights(false);
    }
  }, [dispatch, userId]);

  /**
   * Fetch data when drawer gets visible or paginated page changes
   */
  useEffect(() => {
    if (visible && userId) {
      fetchUserResults(page);
    }
  }, [visible, userId, page, fetchUserResults]);

  /**
   * Fetch charts and AI diagnostics only once when drawer opens
   */
  useEffect(() => {
    if (visible && userId) {
      fetchAllResultsForCharts();
      fetchAIInsights();
    }
  }, [visible, userId, fetchAllResultsForCharts, fetchAIInsights]);

  /**
   * Reset states on drawer closure
   */
  const handleClose = () => {
    setPage(1);
    setUserResults([]);
    setAllResults([]);
    setInsights(null);
    setTotalResults(0);
    onClose();
  };

  /**
   * PDF Export Handler
   */
  const handleExportToPDF = async (record: UserResult) => {
    try {
      setLoadingExamId(record.examSessionId);
      const payload = {
        examId: record.examSessionId,
        userId: String(userId),
      };

      const response = await dispatch(exportExamResultToPDFAction(payload)).unwrap();

      const blob = response;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${userName}_${record.subject?.subname || 'result'}_report.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      message.success('Result PDF exported successfully!');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      message.error('Failed to export PDF result report.');
    } finally {
      setLoadingExamId(null);
    }
  };

  // Computations for Recharts
  const trendData = useMemo(() => {
    return allResults.map((r, index) => {
      const d = new Date(r.examDate);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const percentage = r.totalQuestions > 0 ? (r.correctAnswers / r.totalQuestions) * 100 : 0;
      return {
        name: `Test ${index + 1}`,
        date: `${day}/${month}`,
        score: Math.round(percentage),
        subject: r.subject?.subname || 'N/A',
      };
    });
  }, [allResults]);

  const subjectData = useMemo(() => {
    const subjectsMap: Record<string, { correct: number; total: number }> = {};
    allResults.forEach(r => {
      const sub = r.subject?.subname || 'N/A';
      if (!subjectsMap[sub]) {
        subjectsMap[sub] = { correct: 0, total: 0 };
      }
      subjectsMap[sub].correct += r.correctAnswers;
      subjectsMap[sub].total += r.totalQuestions;
    });
    return Object.keys(subjectsMap).map(sub => {
      const total = subjectsMap[sub].total;
      const accuracy = total > 0 ? (subjectsMap[sub].correct / total) * 100 : 0;
      return {
        subject: sub,
        accuracy: Math.round(accuracy),
      };
    });
  }, [allResults]);

  const accuracyData = useMemo(() => {
    let totalCorrect = 0;
    let totalWrong = 0;
    allResults.forEach(r => {
      totalCorrect += r.correctAnswers;
      totalWrong += r.wrongAnswers;
    });
    return [
      { name: 'Correct', value: totalCorrect, color: '#52c41a' },
      { name: 'Wrong', value: totalWrong, color: '#ff4d4f' }
    ];
  }, [allResults]);

  const chapterData = useMemo(() => {
    const chaptersMap: Record<string, { correct: number; total: number; subject: string }> = {};
    allResults.forEach(r => {
      const chap = r.chapter?.name || 'N/A';
      const sub = r.subject?.subname || 'N/A';
      const key = `${chap} (${sub})`;
      if (!chaptersMap[key]) {
        chaptersMap[key] = { correct: 0, total: 0, subject: sub };
      }
      chaptersMap[key].correct += r.correctAnswers;
      chaptersMap[key].total += r.totalQuestions;
    });
    return Object.keys(chaptersMap).map(key => {
      const total = chaptersMap[key].total;
      const accuracy = total > 0 ? (chaptersMap[key].correct / total) * 100 : 0;
      // Truncate displayed axis label if too long, keeping subject name visible
      const truncatedKey = key.length > 28 ? `${key.slice(0, 25)}...` : key;
      return {
        chapter: truncatedKey,
        fullChapter: key,
        accuracy: Math.round(accuracy),
        subject: chaptersMap[key].subject,
      };
    }).slice(0, 8); // limit top 8 chapters to maintain clean visualization spacing
  }, [allResults]);

  // Memoized overall stats calculated over complete history (avoid paginated discrepancies)
  const overallStats = useMemo(() => {
    const dataToUse = allResults.length > 0 ? allResults : userResults;
    const totalExams = allResults.length > 0 ? allResults.length : totalResults;
    const totalCorrect = dataToUse.reduce((sum, r) => sum + r.correctAnswers, 0);
    const avgScore = dataToUse.length > 0
      ? (
          dataToUse.reduce((sum, r) =>
            sum + (r.totalQuestions > 0 ? (r.correctAnswers / r.totalQuestions) * 100 : 0), 0
          ) / dataToUse.length
        ).toFixed(1)
      : '0.0';
    return { totalExams, totalCorrect, avgScore };
  }, [allResults, userResults, totalResults]);

  // Ant Design Table Columns Config
  const columns: ColumnsType<UserResult> = [
    {
      title: 'No.',
      dataIndex: 'key',
      key: 'no',
      align: 'center',
      width: 60,
      render: (_: any, __: UserResult, index: number) => isLoadingResults ? <Skeleton.Input active size="small" style={{ width: 30, minWidth: 30 }} /> : index + 1 + (page - 1) * PAGE_SIZE,
      responsive: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    {
      title: 'Exam Date',
      dataIndex: 'examDate',
      key: 'examDate',
      align: 'center',
      width: 120,
      render: (date: string) => {
        if (isLoadingResults) return <Skeleton.Input active size="small" style={{ width: 80, minWidth: 80 }} />;
        const d = new Date(date);
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}-${month}-${year}`;
      },
      responsive: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    {
      title: 'Subject',
      dataIndex: 'subject',
      key: 'subject',
      align: 'center',
      width: 130,
      responsive: ['sm', 'md', 'lg', 'xl'],
      render: (subject: any) => isLoadingResults ? <Skeleton.Input active size="small" style={{ width: 80, minWidth: 80 }} /> : (
        <span style={{ color: '#1890ff', fontWeight: '500' }}>
          {subject?.subname || 'N/A'}
        </span>
      ),
    },
    {
      title: 'Chapter',
      dataIndex: 'chapter',
      key: 'chapter',
      align: 'center',
      width: 170,
      responsive: ['md', 'lg', 'xl'],
      render: (chapter: any) => isLoadingResults ? <Skeleton.Input active size="small" style={{ width: 100, minWidth: 100 }} /> : (
        <span style={{ color: '#722ed1', fontWeight: '500' }}>
          {chapter?.name || 'N/A'}
        </span>
      ),
    },
    {
      title: 'Questions',
      dataIndex: 'totalQuestions',
      key: 'totalQuestions',
      align: 'center',
      width: 100,
      responsive: ['xs', 'sm', 'md', 'lg', 'xl'],
      render: (totalQuestions: number) => isLoadingResults ? <Skeleton.Input active size="small" style={{ width: 40, minWidth: 40 }} /> : (
        <span style={{ color: '#595959', fontWeight: '500' }}>
          {totalQuestions}
        </span>
      ),
    },
    {
      title: 'Correct',
      dataIndex: 'correctAnswers',
      key: 'correctAnswers',
      align: 'center',
      width: 90,
      render: (correct: number) => isLoadingResults ? <Skeleton.Input active size="small" style={{ width: 40, minWidth: 40 }} /> : (
        <span style={{ color: '#52c41a', fontWeight: 'bold' }}>
          {correct}
        </span>
      ),
      responsive: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    {
      title: 'Wrong',
      dataIndex: 'wrongAnswers',
      key: 'wrongAnswers',
      align: 'center',
      width: 90,
      render: (wrong: number) => isLoadingResults ? <Skeleton.Input active size="small" style={{ width: 40, minWidth: 40 }} /> : (
        <span style={{ color: '#ff4d4f', fontWeight: 'bold' }}>
          {wrong}
        </span>
      ),
      responsive: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    {
      title: 'Score %',
      key: 'score',
      align: 'center',
      width: 100,
      render: (_: any, record: UserResult) => {
        if (isLoadingResults) return <Skeleton.Input active size="small" style={{ width: 40, minWidth: 40 }} />;
        const percentage = record.totalQuestions > 0 ? ((record.correctAnswers / record.totalQuestions) * 100).toFixed(1) : '0.0';
        const color = parseFloat(percentage) >= 70 ? '#52c41a' : parseFloat(percentage) >= 50 ? '#faad14' : '#ff4d4f';
        return (
          <span style={{ color, fontWeight: 'bold' }}>
            {percentage}%
          </span>
        );
      },
      responsive: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    {
      title: 'Action',
      key: 'action',
      align: 'center',
      width: 110,
      render: (_: any, record: UserResult) => isLoadingResults ? <Skeleton.Input active size="small" style={{ width: 80, minWidth: 80 }} /> : (
        <Button
          type="primary"
          icon={<FilePdfOutlined />}
          size="small"
          loading={loadingExamId === record.examSessionId}
          onClick={() => handleExportToPDF(record)}
          style={{
            borderRadius: 6,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto',
            gap: 4
          }}
        >
          <span>Export</span>
        </Button>
      ),
      responsive: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
  ];

  const tableData = isLoadingResults
    ? Array.from({ length: 5 }).map((_, index) => ({
      id: `skeleton-${index}`,
      examDate: '',
      examSessionId: '',
      totalQuestions: 0,
      correctAnswers: 0,
      wrongAnswers: 0,
      totalTestsGiven: 0,
      subject: { subname: '' },
      chapter: { name: '' },
      standard: '',
      board: '',
    } as UserResult))
    : userResults;

  // Custom tooltips for Recharts
  const CustomRechartsTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="custom-recharts-tooltip" style={{
          background: 'rgba(255, 255, 255, 0.95)',
          padding: '8px 12px',
          border: '1px solid #d9d9d9',
          borderRadius: 4,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <p style={{ margin: 0, fontWeight: 'bold', color: '#1f1f1f' }}>{data.fullChapter || data.subject || data.name}</p>
          {data.date && <p style={{ margin: '4px 0 0 0', fontSize: 12, color: '#8c8c8c' }}>Date: {data.date}</p>}
          <p style={{ margin: '4px 0 0 0', fontWeight: '600', color: '#1890ff' }}>
            Score: {payload[0].value}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Drawer
      title={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <BulbOutlined style={{ color: '#722ed1', fontSize: 22 }} />
            <div>
              <Title level={4} style={{ margin: 0 }}>
                {userName}'s Academic Profile
              </Title>
              <Text type="secondary" style={{ fontSize: 12 }}>Detailed diagnostics & exam results analytics</Text>
            </div>
          </div>
        </div>
      }
      placement="right"
      width="85%"
      onClose={handleClose}
      open={visible}
      destroyOnClose
      className="user-results-drawer"
      extra={
        <Tag color="purple" style={{ marginRight: 8, fontSize: 13, padding: '2px 8px' }}>
          Student Profile View
        </Tag>
      }
    >
      <div className="user-results-content">
        <Tabs
          defaultActiveKey="1"
          type="card"
          items={[
            {
              key: '1',
              label: (
                <span>
                  <BulbOutlined />
                  Performance Analytics
                </span>
              ),
              children: (
                <div className="analytics-tab-pane">
                  {loadingAllResults ? (
                    <div style={{ padding: 40, textAlign: 'center' }}>
                      <Spin size="large" tip="Loading analytics and compiling academic metrics..." />
                    </div>
                  ) : allResults.length === 0 ? (
                    <Card style={{ textAlign: 'center', padding: 40, borderRadius: 12 }}>
                      <InfoCircleOutlined style={{ fontSize: 48, color: '#bfbfbf', marginBottom: 16 }} />
                      <Title level={4}>No Test Data Available</Title>
                      <Text type="secondary">This student hasn't completed any quizzes or exam sessions yet.</Text>
                    </Card>
                  ) : (
                    <>
                      {/* Top Row: Key stats summaries */}
                      <div className="results-summary" style={{
                        marginBottom: 24,
                        padding: '20px 16px',
                        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                        borderRadius: 12,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                      }}>
                        <Row gutter={[16, 16]} align="middle">
                          <Col xs={24} sm={8}>
                            <div style={{ textAlign: 'center' }}>
                              <div style={{ fontSize: 32, fontWeight: 'bold', color: '#1890ff', lineHeight: 1.2 }}>
                                {overallStats.totalExams}
                              </div>
                              <Text strong type="secondary" style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>Total Quizzes Taken</Text>
                            </div>
                          </Col>
                          <Col xs={24} sm={8}>
                            <div style={{ textAlign: 'center' }}>
                              <div style={{ fontSize: 32, fontWeight: 'bold', color: '#52c41a', lineHeight: 1.2 }}>
                                {overallStats.totalCorrect}
                              </div>
                              <Text strong type="secondary" style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>Correct Answers</Text>
                            </div>
                          </Col>
                          <Col xs={24} sm={8}>
                            <div style={{ textAlign: 'center' }}>
                              <div style={{ fontSize: 32, fontWeight: 'bold', color: '#faad14', lineHeight: 1.2 }}>
                                {overallStats.avgScore}%
                              </div>
                              <Text strong type="secondary" style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>Average Test Score</Text>
                            </div>
                          </Col>
                        </Row>
                      </div>

                      {/* AI Diagnostics Card */}
                      <Card
                        className="ai-insights-card"
                        style={{ marginBottom: 24, borderRadius: 12, border: '1px solid #d3adf7', boxShadow: '0 4px 12px rgba(114, 46, 209, 0.05)' }}
                        title={
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <StarOutlined style={{ color: '#722ed1', fontSize: 18 }} />
                            <span style={{ fontSize: 16, fontWeight: 'bold' }}>
                              AI Diagnostic Insights & Recommendations
                            </span>
                          </div>
                        }
                        extra={
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            {insights && (
                              <Tag color={insights.isAI ? 'purple' : 'blue'} style={{ margin: 0, padding: '2px 8px', borderRadius: 4, display: 'inline-flex', alignItems: 'center' }}>
                                {insights.isAI ? 'Gemini AI active' : 'Academic Analyzer'}
                              </Tag>
                            )}
                            <Button
                              type="primary"
                              ghost
                              size="small"
                              icon={<ReloadOutlined />}
                              loading={loadingInsights}
                              onClick={fetchAIInsights}
                              style={{ borderRadius: 6, display: 'inline-flex', alignItems: 'center' }}
                            >
                              Refresh
                            </Button>
                          </div>
                        }
                      >
                        {loadingInsights ? (
                          <Skeleton active paragraph={{ rows: 4 }} />
                        ) : insights ? (
                          <div className="insights-content">
                            <div className="insight-section summary-box" style={{ padding: 12, backgroundColor: '#f9f0ff', borderRadius: 8, marginBottom: 16 }}>
                              <Text style={{ fontSize: 14, color: '#4a154b', fontStyle: 'italic' }}>
                                "{insights.summary}"
                              </Text>
                            </div>

                            <Row gutter={[20, 20]}>
                              <Col xs={24} md={12}>
                                <Title level={5} style={{ color: '#52c41a', display: 'flex', alignItems: 'center', gap: 6 }}>
                                  <CheckCircleOutlined /> Key Strengths
                                </Title>
                                <ul style={{ paddingLeft: 20, margin: 0 }}>
                                  {insights.strengths.map((s, idx) => (
                                    <li key={idx} style={{ marginBottom: 6, color: '#434343' }}>{s}</li>
                                  ))}
                                </ul>
                              </Col>
                              <Col xs={24} md={12}>
                                <Title level={5} style={{ color: '#ff4d4f', display: 'flex', alignItems: 'center', gap: 6 }}>
                                  <CloseCircleOutlined /> Areas for Improvement
                                </Title>
                                <ul style={{ paddingLeft: 20, margin: 0 }}>
                                  {insights.weaknesses.map((w, idx) => (
                                    <li key={idx} style={{ marginBottom: 6, color: '#434343' }}>{w}</li>
                                  ))}
                                </ul>
                              </Col>
                            </Row>
                            <Divider style={{ margin: '16px 0' }} />
                            <div>
                              <Title level={5} style={{ color: '#1890ff', display: 'flex', alignItems: 'center', gap: 6 }}>
                                <BulbOutlined /> Actionable Study Plan
                              </Title>
                              <ol style={{ paddingLeft: 20, margin: 0 }}>
                                {insights.recommendations.map((r, idx) => (
                                  <li key={idx} style={{ marginBottom: 6, fontWeight: '500', color: '#262626' }}>{r}</li>
                                ))}
                              </ol>
                            </div>
                          </div>
                        ) : (
                          <div style={{ textAlign: 'center', padding: 20 }}>
                            <Button type="primary" onClick={fetchAIInsights} loading={loadingInsights}>
                              Generate Student Insights
                            </Button>
                          </div>
                        )}
                      </Card>

                      {/* Charts Grid */}
                      <Row gutter={[20, 20]}>
                        {/* Score Trend Line Chart */}
                        <Col xs={24} lg={12}>
                          <Card title="Progress Trend (Score %)" style={{ borderRadius: 12 }}>
                            <div style={{ width: '100%', height: 300 }}>
                              <ResponsiveContainer>
                                <LineChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                  <CartesianGrid strokeDasharray="3 3" />
                                  <XAxis dataKey="name" />
                                  <YAxis unit="%" domain={[0, 100]} />
                                  <RechartsTooltip content={<CustomRechartsTooltip />} />
                                  <Legend />
                                  <Line type="monotone" dataKey="score" stroke="#1890ff" strokeWidth={3} activeDot={{ r: 8 }} name="Accuracy" />
                                </LineChart>
                              </ResponsiveContainer>
                            </div>
                          </Card>
                        </Col>

                        {/* Subject Breakdown Bar Chart */}
                        <Col xs={24} lg={12}>
                          <Card title="Subject Accuracy Breakdown" style={{ borderRadius: 12 }}>
                            <div style={{ width: '100%', height: 300 }}>
                              <ResponsiveContainer>
                                <BarChart data={subjectData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                  <CartesianGrid strokeDasharray="3 3" />
                                  <XAxis dataKey="subject" />
                                  <YAxis unit="%" domain={[0, 100]} />
                                  <RechartsTooltip content={<CustomRechartsTooltip />} />
                                  <Legend />
                                  <Bar dataKey="accuracy" name="Average Accuracy" radius={[4, 4, 0, 0]}>
                                    {subjectData.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={entry.accuracy >= 70 ? '#52c41a' : entry.accuracy >= 50 ? '#faad14' : '#ff4d4f'} />
                                    ))}
                                  </Bar>
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          </Card>
                        </Col>

                        {/* Chapter Accuracy Bar Chart */}
                        <Col xs={24} lg={12}>
                          <Card title="Chapter Performance Heatmap" style={{ borderRadius: 12 }}>
                            <div style={{ width: '100%', height: 300 }}>
                              <ResponsiveContainer>
                                <BarChart data={chapterData} layout="vertical" margin={{ top: 10, right: 10, left: 15, bottom: 5 }}>
                                  <CartesianGrid strokeDasharray="3 3" />
                                  <XAxis type="number" unit="%" domain={[0, 100]} />
                                  <YAxis
                                    type="category"
                                    dataKey="chapter"
                                    width={210}
                                    tick={(props: any) => {
                                      const { x, y, payload } = props;
                                      return (
                                        <text x={x - 6} y={y} dy={4} textAnchor="end" fill="#595959" style={{ fontSize: 9, fontFamily: 'sans-serif' }}>
                                          {payload.value}
                                        </text>
                                      );
                                    }}
                                  />
                                  <RechartsTooltip content={<CustomRechartsTooltip />} />
                                  <Legend />
                                  <Bar dataKey="accuracy" name="Chapter Accuracy" radius={[0, 4, 4, 0]}>
                                    {chapterData.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={entry.accuracy >= 70 ? '#722ed1' : entry.accuracy >= 50 ? '#faad14' : '#ff4d4f'} />
                                    ))}
                                  </Bar>
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          </Card>
                        </Col>

                        {/* Overall Correct vs Wrong Answers Pie */}
                        <Col xs={24} lg={12}>
                          <Card title="Overall Accuracy Ratio" style={{ borderRadius: 12 }}>
                            <div style={{ width: '100%', height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <ResponsiveContainer>
                                <PieChart>
                                  <Pie
                                    data={accuracyData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={90}
                                    paddingAngle={5}
                                    dataKey="value"
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                  >
                                    {accuracyData.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                  </Pie>
                                  <RechartsTooltip />
                                  <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                              </ResponsiveContainer>
                            </div>
                          </Card>
                        </Col>
                      </Row>
                    </>
                  )}
                </div>
              )
            },
            {
              key: '2',
              label: (
                <span>
                  <FilePdfOutlined />
                  Exam Results Log
                </span>
              ),
              children: (
                <div className="results-table-pane">
                  {/* Results Stats Banner */}
                  <div className="results-summary" style={{
                    marginBottom: 24,
                    padding: 16,
                    background: '#f8f9fa',
                    borderRadius: 8,
                    border: '1px solid #e9ecef'
                  }}>
                    <Row gutter={[16, 16]}>
                      <Col xs={24} sm={8}>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: 24, fontWeight: 'bold', color: '#1890ff' }}>
                            {overallStats.totalExams}
                          </div>
                          <div style={{ color: '#666' }}>Total Exams</div>
                        </div>
                      </Col>
                      <Col xs={24} sm={8}>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: 24, fontWeight: 'bold', color: '#52c41a' }}>
                            {overallStats.totalCorrect}
                          </div>
                          <div style={{ color: '#666' }}>Total Correct</div>
                        </div>
                      </Col>
                      <Col xs={24} sm={8}>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: 24, fontWeight: 'bold', color: '#faad14' }}>
                            {overallStats.avgScore}%
                          </div>
                          <div style={{ color: '#666' }}>Average Score</div>
                        </div>
                      </Col>
                    </Row>
                  </div>

                  {/* Results Log Table */}
                  <div className="results-table-wrapper" style={{ overflowX: 'auto' }}>
                    <Table
                      columns={columns}
                      dataSource={tableData}
                      pagination={{
                        current: page,
                        pageSize: PAGE_SIZE,
                        total: totalResults,
                        showSizeChanger: false,
                        showQuickJumper: true,
                        showTotal: (total, range) =>
                          `${range[0]}-${range[1]} of ${total} results`,
                        onChange: (newPage) => setPage(newPage),
                      }}
                      bordered
                      rowKey={(record) => record.id || record.examDate}
                      scroll={{ x: 800 }}
                      size="middle"
                      locale={{
                        emptyText: 'No exam results found for this user'
                      }}
                    />
                  </div>
                </div>
              )
            }
          ]}
        />
      </div>
    </Drawer>
  );
};

export default UserResultsModal;
