/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Table, DatePicker, Row, Col, Tooltip as AntdTooltip, Spin, message } from 'antd';
import type { TableProps } from 'antd';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import type { Dayjs } from 'dayjs';
import { useDispatch, useSelector } from 'react-redux';
import { getUserResultByIdAction } from '../../redux/action/userAction';
import { getSubjectsByBoardAction } from '../../redux/action/subjectAction';
import { RootState, AppDispatch } from '../../redux/store';
import CustomDropdown, { DropdownOption } from '../../components/ImportModal/CustomDropdown';
import './index.scss';

dayjs.extend(isBetween);

const { RangePicker } = DatePicker;

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
            message.error('User not found. Please login again.');
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
            message.error(error?.message || 'Failed to fetch results');
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

    const columns: TableProps<DataType>['columns'] = [
        {
            title: 'No.',
            dataIndex: 'no',
            key: 'no',
            sorter: (a, b) => a.no - b.no,
            align: 'center' as const,
        },
        {
            title: 'Subject',
            dataIndex: 'subject',
            key: 'subject',
            sorter: (a, b) => a.subject.localeCompare(b.subject),
            render: subject => (
                <AntdTooltip title={subject}>
                    <span style={{ cursor: 'help' }}>{subject}</span>
                </AntdTooltip>
            ),
        },
        {
            title: 'Correct Answers',
            dataIndex: 'correctAnswers',
            key: 'correctAnswers',
            align: 'center' as const,
            sorter: (a, b) => a.correctAnswers - b.correctAnswers,
        },
        {
            title: 'Wrong Answers',
            dataIndex: 'wrongAnswers',
            key: 'wrongAnswers',
            align: 'center' as const,
            sorter: (a, b) => a.wrongAnswers - b.wrongAnswers,
        },
        {
            title: 'Total Questions',
            dataIndex: 'totalQuestions',
            key: 'totalQuestions',
            align: 'center' as const,
            sorter: (a, b) => a.totalQuestions - b.totalQuestions,
        },
        {
            title: 'Date',
            dataIndex: 'date',
            key: 'date',
            sorter: (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
            render: (text) => (
                <AntdTooltip title={dayjs(text).format('MMMM D, YYYY')}>
                    <span style={{ cursor: 'help' }}>{dayjs(text).format('MMM D, YYYY')}</span>
                </AntdTooltip>
            ),
        },
    ];

    return (
        <div className="results-page">
            <h1 className="welcome-title">Your Results</h1>
            <div className="filters-container">
                <Row gutter={[16, 16]} align="middle" style={{ width: "100%" }}>
                    <Col xs={24} sm={12} md={8} lg={6}>
                        <label>Subject:</label>
                        <CustomDropdown
                            value={selectedSubject}
                            style={{ width: '100%' }}
                            onChange={(value) => {
                                setSelectedSubject(value);
                                setCurrentPage(1); // Reset to first page when filter changes
                            }}
                            options={subjectOptions}
                            placeholder="Select Subject"
                            dropdownStyle={{ zIndex: 1200 }}
                        />
                    </Col>
                    <Col xs={24} sm={12} md={10} lg={8}>
                        <label>Date Range:</label>
                        <RangePicker
                            value={dateRange}
                            onChange={(dates) => {
                                setDateRange(dates as [Dayjs, Dayjs] | null);
                                setCurrentPage(1); // Reset to first page when filter changes
                            }}
                            style={{ width: '100%' }}
                            dropdownClassName="antd-popper"
                            allowClear
                        />
                    </Col>
                </Row>
            </div>
            <div className="results-table">
                <Spin spinning={isLoading}>
                    <Table
                        columns={columns}
                        dataSource={resultsData}
                        pagination={{
                            current: currentPage,
                            pageSize: pageSize,
                            total: totalResults,
                            responsive: true,
                            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
                            onChange: (page) => setCurrentPage(page),
                        }}
                        scroll={{ x: 'max-content' }}
                        size="middle"
                        rowClassName={record =>
                            record.key === selectedRowKey ? 'ant-table-row-selected' : ''
                        }
                        onRow={record => ({
                            onClick: () => setSelectedRowKey(record.key),
                            onMouseEnter: () => { },
                        })}
                    />
                </Spin>
            </div>
        </div>
    );
};

export default ResultsPage;
