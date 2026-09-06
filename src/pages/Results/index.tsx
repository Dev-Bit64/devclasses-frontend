/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import type { Dayjs } from 'dayjs';
import { useDispatch, useSelector } from 'react-redux';
import { getUserResultByIdAction } from '../../redux/action/userAction';
import { getSubjectsByBoardAction } from '../../redux/action/subjectAction';
import { RootState, AppDispatch } from '../../redux/store';
import CustomDropdown, { DropdownOption } from '../../components/ImportModal/CustomDropdown';
import { PageShell } from '../../components/common/PageShell';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable, type DataTableColumn } from '../../components/common/DataTable';
import { DateRangePicker } from '../../components/common/DateRangePicker';
import { Card } from '../../components/ui/card';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { toastText } from '../../utils/toast';

dayjs.extend(isBetween);

interface DataType {
    key: React.Key;
    no: number;
    subject: string;
    correctAnswers: number;
    wrongAnswers: number;
    totalQuestions: number;
    date: string;
    subjectId?: string;
}

const ResultsPage: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { isLoading } = useSelector((state: RootState) => state.user);
    const { subjectDropdownList } = useSelector((state: RootState) => state.subject);

    const [selectedSubject, setSelectedSubject] = useState<string>('all');
    const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);
    const [selectedRowKey, setSelectedRowKey] = useState<React.Key | null>(null);
    const [resultsData, setResultsData] = useState<DataType[]>([]);
    const [totalResults, setTotalResults] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const pageSize = 10;

    // Get user info from localStorage
    const getUserInfo = () => {
        try {
            const userInfo = localStorage.getItem('user');
            return userInfo ? JSON.parse(userInfo) : null;
        } catch (error) {
            console.error('Error parsing userInfo from localStorage:', error);
            return null;
        }
    };

    const userInfo = getUserInfo();
    const userId = userInfo?.id;
    const userBoard = userInfo?.board;

    // Fetch subjects for dropdown based on user's board
    useEffect(() => {
        if (userBoard) {
            dispatch(getSubjectsByBoardAction(userBoard));
        }
    }, [dispatch, userBoard]);

    // Fetch user results from API
    const fetchUserResults = useCallback(async (page: number, subjectId?: string, startDate?: Date, endDate?: Date) => {
        if (!userId) {
            toastText('User not found. Please login again.', 'error');
            return;
        }

        try {
            const payload: any = {
                userId: String(userId),
                page,
                limit: pageSize,
                sortField: 'examDate',
                sortOrder: 'desc',
            };

            if (subjectId && subjectId !== 'all') {
                payload.subjectId = subjectId;
            }

            if (startDate) {
                payload.startDate = startDate;
            }

            if (endDate) {
                payload.endDate = endDate;
            }

            const response = await dispatch(getUserResultByIdAction(payload)).unwrap();

            // Extract results from API response
            if (response?.data?.results) {
                const transformedData: DataType[] = response.data.results.map((item: any, index: number) => ({
                    key: item.id || index,
                    no: (page - 1) * pageSize + index + 1,
                    subject: item.subject?.subname || 'N/A',
                    correctAnswers: item.correctAnswers || 0,
                    wrongAnswers: item.wrongAnswers || 0,
                    totalQuestions: item.totalQuestions || 0,
                    date: item.examDate ? dayjs(item.examDate).format('YYYY-MM-DD') : 'N/A',
                    subjectId: item.subjectId,
                }));
                setResultsData(transformedData);
                setTotalResults(response.data.total || 0);
            } else {
                setResultsData([]);
                setTotalResults(0);
            }
        } catch (error: any) {
            console.error('Error fetching user results:', error);
            toastText(error?.message || 'Failed to fetch results', 'error');
            setResultsData([]);
            setTotalResults(0);
        }
    }, [dispatch, userId, pageSize]);

    // Fetch results on component mount and when filters change
    useEffect(() => {
        if (userId) {
            const startDate = dateRange?.[0] ? dateRange[0].toDate() : undefined;
            const endDate = dateRange?.[1] ? dateRange[1].toDate() : undefined;
            const subjectId = selectedSubject !== 'all' ? selectedSubject : undefined;

            fetchUserResults(currentPage, subjectId, startDate, endDate);
        }
    }, [userId, currentPage, selectedSubject, dateRange, fetchUserResults]);

    const subjectOptions = useMemo<DropdownOption[]>(() => {
        const subjects = Array.isArray(subjectDropdownList) ? subjectDropdownList : [];
        return [
            { value: 'all', label: 'All Subjects' },
            ...subjects.map((subject: any) => ({
                value: subject.id,
                label: subject.subname
            }))
        ];
    }, [subjectDropdownList]);

    // Score badge tone communicates performance without relying on colour alone.
    const renderScore = (record: DataType) => {
        const percent = record.totalQuestions
            ? Math.round((record.correctAnswers / record.totalQuestions) * 100)
            : 0;
        return (
            <Badge variant={percent >= 60 ? 'success' : 'outline'} size="md" className="dc-numeric">
                {record.correctAnswers}/{record.totalQuestions} &middot; {percent}%
            </Badge>
        );
    };

    const columns: DataTableColumn<DataType>[] = [
        {
            title: 'No.',
            dataIndex: 'no',
            key: 'no',
            sorter: (a, b) => a.no - b.no,
            align: 'center',
            width: 72,
        },
        {
            title: 'Subject',
            dataIndex: 'subject',
            key: 'subject',
            sorter: (a, b) => a.subject.localeCompare(b.subject),
            render: (subject: string) => (
                <span title={subject} className="font-medium">{subject}</span>
            ),
        },
        {
            title: 'Correct',
            dataIndex: 'correctAnswers',
            key: 'correctAnswers',
            align: 'center',
            sorter: (a, b) => a.correctAnswers - b.correctAnswers,
            render: (text: number) => <span className="dc-numeric text-success">{text}</span>,
        },
        {
            title: 'Wrong',
            dataIndex: 'wrongAnswers',
            key: 'wrongAnswers',
            align: 'center',
            sorter: (a, b) => a.wrongAnswers - b.wrongAnswers,
            render: (text: number) => <span className="dc-numeric text-destructive">{text}</span>,
        },
        {
            title: 'Total',
            dataIndex: 'totalQuestions',
            key: 'totalQuestions',
            align: 'center',
            hideBelow: 'lg',
            sorter: (a, b) => a.totalQuestions - b.totalQuestions,
            render: (text: number) => <span className="dc-numeric">{text}</span>,
        },
        {
            title: 'Date',
            dataIndex: 'date',
            key: 'date',
            sorter: (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
            render: (text: string) => (
                <span title={dayjs(text).format('MMMM D, YYYY')} className="dc-numeric whitespace-nowrap">
                    {dayjs(text).format('MMM D, YYYY')}
                </span>
            ),
        },
    ];

    return (
        <PageShell>
            <PageHeader
                title="Your Results"
                description="Every test you have attempted, with your score and the date you took it."
            />

            <Card className="p-4 sm:p-5">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:max-w-3xl">
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="results-subject">Subject</Label>
                        <CustomDropdown
                            id="results-subject"
                            value={selectedSubject}
                            onChange={(value) => {
                                setSelectedSubject(value);
                                setCurrentPage(1); // Reset to first page when filter changes
                            }}
                            options={subjectOptions}
                            placeholder="Select Subject"
                            dropdownStyle={{ zIndex: 1200 }}
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="results-dates">Date range</Label>
                        <DateRangePicker
                            id="results-dates"
                            value={dateRange}
                            onChange={(range) => {
                                setDateRange(range);
                                setCurrentPage(1); // Reset to first page when filter changes
                            }}
                        />
                    </div>
                </div>
            </Card>

            <DataTable<DataType>
                columns={columns}
                dataSource={resultsData}
                rowKey="key"
                loading={isLoading}
                skeletonRows={5}
                emptyTitle="No results yet"
                emptyDescription="Attempt a test and your scores will show up here."
                onRow={(record) => ({
                    onClick: () => !isLoading && setSelectedRowKey(record.key),
                })}
                rowClassName={(record) =>
                    record.key === selectedRowKey ? 'bg-accent' : ''
                }
                pagination={{
                    current: currentPage,
                    pageSize,
                    total: totalResults,
                    onChange: (page) => setCurrentPage(page),
                    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
                }}
                // Below `md` each result becomes a card, which reads far better than a scrolling table.
                renderMobileCard={(record) => (
                    <Card
                        onClick={() => !isLoading && setSelectedRowKey(record.key)}
                        className={`flex flex-col gap-3 p-4 ${record.key === selectedRowKey ? 'border-primary bg-accent' : ''}`}
                    >
                        <div className="flex items-start justify-between gap-3">
                            <span className="font-semibold text-foreground">{record.subject}</span>
                            {renderScore(record)}
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                            <span className="dc-caption">
                                Correct: <span className="dc-numeric font-semibold text-success">{record.correctAnswers}</span>
                            </span>
                            <span className="dc-caption">
                                Wrong: <span className="dc-numeric font-semibold text-destructive">{record.wrongAnswers}</span>
                            </span>
                            <span className="dc-caption dc-numeric ml-auto">
                                {dayjs(record.date).format('MMM D, YYYY')}
                            </span>
                        </div>
                    </Card>
                )}
            />
        </PageShell>
    );
};

export default ResultsPage;
