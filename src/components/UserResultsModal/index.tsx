/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  BarChart3,
  CheckCircle2,
  FileText,
  Info,
  Lightbulb,
  RefreshCw,
  Sparkles,
  XCircle,
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { getUserResultByIdAction } from '../../redux/action/userAction';
import { RootState, AppDispatch } from '../../redux/store';
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
import { Sheet, SheetContent } from '../ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Spinner } from '../ui/spinner';
import { Skeleton } from '../ui/skeleton';
import { Separator } from '../ui/separator';
import { DataTable, type DataTableColumn } from '../common/DataTable';
import { EmptyState } from '../common/EmptyState';
import { LoadingState } from '../common/LoadingState';
import { toastText } from '../../utils/toast';

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

/**
 * Recharts needs literal colour values, so the design tokens are mirrored here.
 * Keep in sync with the --dc-* palette in styles/tailwind.css.
 */
const CHART_COLORS = {
  primary: '#1d4ed8',
  success: '#16a34a',
  warning: '#d97706',
  destructive: '#dc2626',
  secondary: '#7c3aed',
  grid: '#e2e8f0',
  axis: '#64748b',
};

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
      toastText(error?.message || 'Failed to fetch user results', 'error');
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
      toastText('Failed to load academic insights', 'error');
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

      toastText('Result PDF exported successfully!', 'success');
    } catch (error: any) {
      console.error('Error exporting PDF:', error);
      // Prefer the message returned by the API, else fall back to a generic one
      const apiMessage = error?.statusCode ? error?.message : '';
      toastText(apiMessage || 'Failed to export PDF result report.', 'error');
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
      { name: 'Correct', value: totalCorrect, color: CHART_COLORS.success },
      { name: 'Wrong', value: totalWrong, color: CHART_COLORS.destructive }
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

  // Table columns config
  const columns: DataTableColumn<UserResult>[] = [
    {
      title: 'No.',
      key: 'no',
      align: 'center',
      width: 64,
      render: (_: any, __: UserResult, index: number) => index + 1 + (page - 1) * PAGE_SIZE,
    },
    {
      title: 'Exam Date',
      dataIndex: 'examDate',
      key: 'examDate',
      align: 'center',
      width: 130,
      render: (date: string) => {
        const d = new Date(date);
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const year = d.getFullYear();
        return <span className="dc-numeric whitespace-nowrap">{`${day}-${month}-${year}`}</span>;
      },
    },
    {
      title: 'Subject',
      dataIndex: 'subject',
      key: 'subject',
      align: 'center',
      width: 140,
      hideBelow: 'lg',
      render: (subject: any) => (
        <span className="font-medium text-primary">{subject?.subname || 'N/A'}</span>
      ),
    },
    {
      title: 'Chapter',
      dataIndex: 'chapter',
      key: 'chapter',
      align: 'center',
      width: 180,
      hideBelow: 'xl',
      render: (chapter: any) => (
        <span className="font-medium text-secondary">{chapter?.name || 'N/A'}</span>
      ),
    },
    {
      title: 'Questions',
      dataIndex: 'totalQuestions',
      key: 'totalQuestions',
      align: 'center',
      width: 110,
      hideBelow: 'lg',
      render: (totalQuestions: number) => (
        <span className="dc-numeric text-muted-foreground">{totalQuestions}</span>
      ),
    },
    {
      title: 'Correct',
      dataIndex: 'correctAnswers',
      key: 'correctAnswers',
      align: 'center',
      width: 96,
      render: (correct: number) => <span className="dc-numeric font-bold text-success">{correct}</span>,
    },
    {
      title: 'Wrong',
      dataIndex: 'wrongAnswers',
      key: 'wrongAnswers',
      align: 'center',
      width: 96,
      render: (wrong: number) => (
        <span className="dc-numeric font-bold text-destructive">{wrong}</span>
      ),
    },
    {
      title: 'Score %',
      key: 'score',
      align: 'center',
      width: 100,
      render: (_: any, record: UserResult) => {
        const percentage = record.totalQuestions > 0 ? ((record.correctAnswers / record.totalQuestions) * 100).toFixed(1) : '0.0';
        // Thresholds are unchanged; only the colours now come from design tokens.
        const tone = parseFloat(percentage) >= 70
          ? 'text-success'
          : parseFloat(percentage) >= 50
            ? 'text-warning'
            : 'text-destructive';
        return <span className={`dc-numeric font-bold ${tone}`}>{percentage}%</span>;
      },
    },
    {
      title: 'Action',
      key: 'action',
      align: 'center',
      width: 120,
      render: (_: any, record: UserResult) => (
        <Button
          size="sm"
          variant="secondary"
          disabled={loadingExamId === record.examSessionId}
          onClick={() => handleExportToPDF(record)}
        >
          {loadingExamId === record.examSessionId ? <Spinner /> : <FileText aria-hidden="true" />}
          Export
        </Button>
      ),
    },
  ];

  // Custom tooltips for Recharts
  const CustomRechartsTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-dc-lg">
          <p className="text-sm font-semibold text-foreground">
            {data.fullChapter || data.subject || data.name}
          </p>
          {data.date && <p className="dc-caption mt-1">Date: {data.date}</p>}
          <p className="mt-1 text-sm font-semibold text-primary">Score: {payload[0].value}%</p>
        </div>
      );
    }
    return null;
  };

  // Shared stat strip used at the top of both tabs.
  const StatStrip = () => (
    <div className="grid grid-cols-1 gap-3 rounded-xl border border-border bg-muted/50 p-4 sm:grid-cols-3">
      <div className="text-center">
        <p className="dc-numeric text-3xl font-bold text-primary">{overallStats.totalExams}</p>
        <p className="dc-label mt-1">Total Quizzes Taken</p>
      </div>
      <div className="text-center">
        <p className="dc-numeric text-3xl font-bold text-success">{overallStats.totalCorrect}</p>
        <p className="dc-label mt-1">Correct Answers</p>
      </div>
      <div className="text-center">
        <p className="dc-numeric text-3xl font-bold text-warning">{overallStats.avgScore}%</p>
        <p className="dc-label mt-1">Average Test Score</p>
      </div>
    </div>
  );

  return (
    <Sheet open={visible} onOpenChange={(open) => !open && handleClose()}>
      <SheetContent
        side="right"
        title={`${userName} academic profile`}
        className="flex w-full max-w-none flex-col gap-0 p-0 sm:w-[92%] lg:w-[85%]"
      >
        {/* Header */}
        {/* Right padding is kept at both breakpoints so the sheet close button never overlaps the header */}
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-4 pr-14 sm:px-6 sm:pr-14">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-secondary/10 text-secondary">
              <Lightbulb aria-hidden="true" className="size-5" />
            </div>
            <div className="min-w-0">
              <h2 className="dc-h3 truncate">{userName}&apos;s Academic Profile</h2>
              <p className="dc-caption">Detailed diagnostics &amp; exam results analytics</p>
            </div>
          </div>
          <Badge variant="outline" size="md" className="hidden sm:inline-flex">
            Student Profile View
          </Badge>
        </div>

        {/* Body */}
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6">
          <Tabs defaultValue="analytics">
            <TabsList>
              <TabsTrigger value="analytics">
                <BarChart3 aria-hidden="true" className="mr-1.5 inline size-4" />
                Performance Analytics
              </TabsTrigger>
              <TabsTrigger value="log">
                <FileText aria-hidden="true" className="mr-1.5 inline size-4" />
                Exam Results Log
              </TabsTrigger>
            </TabsList>

            <TabsContent value="analytics">
              {loadingAllResults ? (
                <LoadingState label="Loading analytics and compiling academic metrics..." />
              ) : allResults.length === 0 ? (
                <EmptyState
                  icon={Info}
                  title="No Test Data Available"
                  description="This student hasn't completed any quizzes or exam sessions yet."
                />
              ) : (
                <div className="flex flex-col gap-5">
                  {/* Top Row: Key stats summaries */}
                  <StatStrip />

                  {/* AI Diagnostics Card */}
                  <Card className="flex flex-col">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4 sm:p-5">
                      <h3 className="dc-h4 flex items-center gap-2">
                        <Sparkles aria-hidden="true" className="size-[18px] text-secondary" />
                        AI Diagnostic Insights &amp; Recommendations
                      </h3>
                      <div className="flex items-center gap-2">
                        {insights && (
                          <Badge variant={insights.isAI ? 'default' : 'outline'} size="md">
                            {insights.isAI ? 'Gemini AI active' : 'Academic Analyzer'}
                          </Badge>
                        )}
                        <Button
                          variant="secondary"
                          size="sm"
                          disabled={loadingInsights}
                          onClick={fetchAIInsights}
                        >
                          {loadingInsights ? (
                            <Spinner />
                          ) : (
                            <RefreshCw aria-hidden="true" />
                          )}
                          Refresh
                        </Button>
                      </div>
                    </div>

                    <div className="p-4 sm:p-5">
                      {loadingInsights ? (
                        <div className="flex flex-col gap-2.5">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-11/12" />
                          <Skeleton className="h-4 w-4/5" />
                          <Skeleton className="h-4 w-2/3" />
                        </div>
                      ) : insights ? (
                        <div className="flex flex-col gap-4">
                          <blockquote className="rounded-lg bg-secondary/5 p-3.5 text-sm italic leading-relaxed text-foreground">
                            &ldquo;{insights.summary}&rdquo;
                          </blockquote>

                          <div className="grid gap-5 md:grid-cols-2">
                            <div className="flex flex-col gap-2">
                              <h4 className="flex items-center gap-1.5 text-sm font-semibold text-success">
                                <CheckCircle2 aria-hidden="true" className="size-4" /> Key Strengths
                              </h4>
                              <ul className="flex list-disc flex-col gap-1.5 pl-5">
                                {insights.strengths.map((s, idx) => (
                                  <li key={idx} className="text-sm text-foreground">{s}</li>
                                ))}
                              </ul>
                            </div>
                            <div className="flex flex-col gap-2">
                              <h4 className="flex items-center gap-1.5 text-sm font-semibold text-destructive">
                                <XCircle aria-hidden="true" className="size-4" /> Areas for Improvement
                              </h4>
                              <ul className="flex list-disc flex-col gap-1.5 pl-5">
                                {insights.weaknesses.map((w, idx) => (
                                  <li key={idx} className="text-sm text-foreground">{w}</li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          <Separator />

                          <div className="flex flex-col gap-2">
                            <h4 className="flex items-center gap-1.5 text-sm font-semibold text-primary">
                              <Lightbulb aria-hidden="true" className="size-4" /> Actionable Study Plan
                            </h4>
                            <ol className="flex list-decimal flex-col gap-1.5 pl-5">
                              {insights.recommendations.map((r, idx) => (
                                <li key={idx} className="text-sm font-medium text-foreground">{r}</li>
                              ))}
                            </ol>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-center py-4">
                          <Button onClick={fetchAIInsights} disabled={loadingInsights}>
                            {loadingInsights && <Spinner />}
                            Generate Student Insights
                          </Button>
                        </div>
                      )}
                    </div>
                  </Card>

                  {/* Charts Grid */}
                  <div className="grid gap-5 xl:grid-cols-2">
                    {/* Score Trend Line Chart */}
                    <Card className="flex flex-col">
                      <h3 className="dc-h4 border-b border-border p-4">Progress Trend (Score %)</h3>
                      <div className="h-[300px] w-full p-4">
                        <ResponsiveContainer>
                          <LineChart data={trendData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
                            <XAxis dataKey="name" stroke={CHART_COLORS.axis} fontSize={12} />
                            <YAxis unit="%" domain={[0, 100]} stroke={CHART_COLORS.axis} fontSize={12} />
                            <RechartsTooltip content={<CustomRechartsTooltip />} />
                            <Legend />
                            <Line type="monotone" dataKey="score" stroke={CHART_COLORS.primary} strokeWidth={3} activeDot={{ r: 8 }} name="Accuracy" />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </Card>

                    {/* Subject Breakdown Bar Chart */}
                    <Card className="flex flex-col">
                      <h3 className="dc-h4 border-b border-border p-4">Subject Accuracy Breakdown</h3>
                      <div className="h-[300px] w-full p-4">
                        <ResponsiveContainer>
                          <BarChart data={subjectData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
                            <XAxis dataKey="subject" stroke={CHART_COLORS.axis} fontSize={12} />
                            <YAxis unit="%" domain={[0, 100]} stroke={CHART_COLORS.axis} fontSize={12} />
                            <RechartsTooltip content={<CustomRechartsTooltip />} />
                            <Legend />
                            <Bar dataKey="accuracy" name="Average Accuracy" radius={[4, 4, 0, 0]}>
                              {subjectData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.accuracy >= 70 ? CHART_COLORS.success : entry.accuracy >= 50 ? CHART_COLORS.warning : CHART_COLORS.destructive} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </Card>

                    {/* Chapter Accuracy Bar Chart */}
                    <Card className="flex flex-col">
                      <h3 className="dc-h4 border-b border-border p-4">Chapter Performance Heatmap</h3>
                      <div className="h-[300px] w-full p-4">
                        <ResponsiveContainer>
                          <BarChart data={chapterData} layout="vertical" margin={{ top: 10, right: 10, left: 15, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
                            <XAxis type="number" unit="%" domain={[0, 100]} stroke={CHART_COLORS.axis} fontSize={12} />
                            <YAxis
                              type="category"
                              dataKey="chapter"
                              width={180}
                              tick={(props: any) => {
                                const { x, y, payload } = props;
                                return (
                                  <text x={x - 6} y={y} dy={4} textAnchor="end" fill={CHART_COLORS.axis} style={{ fontSize: 10 }}>
                                    {payload.value}
                                  </text>
                                );
                              }}
                            />
                            <RechartsTooltip content={<CustomRechartsTooltip />} />
                            <Legend />
                            <Bar dataKey="accuracy" name="Chapter Accuracy" radius={[0, 4, 4, 0]}>
                              {chapterData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.accuracy >= 70 ? CHART_COLORS.secondary : entry.accuracy >= 50 ? CHART_COLORS.warning : CHART_COLORS.destructive} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </Card>

                    {/* Overall Correct vs Wrong Answers Pie */}
                    <Card className="flex flex-col">
                      <h3 className="dc-h4 border-b border-border p-4">Overall Accuracy Ratio</h3>
                      <div className="h-[300px] w-full p-4">
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
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="log">
              <div className="flex flex-col gap-5">
                {/* Results Stats Banner */}
                <StatStrip />

                {/* Results Log Table */}
                <DataTable<UserResult>
                  columns={columns}
                  dataSource={userResults}
                  rowKey={(record) => record.id || record.examDate}
                  loading={isLoadingResults}
                  skeletonRows={5}
                  emptyTitle="No exam results found for this user"
                  pagination={{
                    current: page,
                    pageSize: PAGE_SIZE,
                    total: totalResults,
                    onChange: (newPage) => setPage(newPage),
                    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} results`,
                  }}
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default UserResultsModal;
