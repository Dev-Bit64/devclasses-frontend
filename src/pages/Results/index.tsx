import React, { useState, useMemo } from 'react';
import { Table, Select, DatePicker, Row, Col, Tooltip as AntdTooltip } from 'antd';
import type { TableProps } from 'antd';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import type { Dayjs } from 'dayjs';
import './index.scss';

dayjs.extend(isBetween);

const { Option } = Select;
const { RangePicker } = DatePicker;

interface DataType {
    key: React.Key;
    no: number;
    subject: string;
    correctAnswers: number;
    wrongAnswers: number;
    totalQuestions: number;
    date: string;
}

const subjectsList = ['Mathematics', 'Science', 'History', 'English', 'Geography'];
const mockData: DataType[] = [];
for (let i = 1; i <= 50; i++) {
    const subject = subjectsList[i % subjectsList.length];
    const total = 25;
    const correct = Math.floor(Math.random() * (total - 5)) + 5;
    const randomDate = dayjs().subtract(Math.floor(Math.random() * 60), 'day');
    mockData.push({
        key: i,
        no: i,
        subject,
        correctAnswers: correct,
        wrongAnswers: total - correct,
        totalQuestions: total,
        date: randomDate.format('YYYY-MM-DD'),
    });
}

const ResultsPage: React.FC = () => {
    const [selectedSubject, setSelectedSubject] = useState<string>('all');
    const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);
    const [selectedRowKey, setSelectedRowKey] = useState<React.Key | null>(null);

    const uniqueSubjects = useMemo(
        () => [...new Set(mockData.map(item => item.subject))],
        []
    );

    const filteredData = useMemo(() => mockData.filter(item => {
        const subjectMatch = selectedSubject === 'all' || item.subject === selectedSubject;
        if (!dateRange || !dateRange[0] || !dateRange[1]) {
            return subjectMatch;
        }
        const itemDate = dayjs(item.date);
        return subjectMatch && itemDate.isBetween(dateRange[0], dateRange[1], 'day', '[]');
    }), [selectedSubject, dateRange]);

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
                        <Select
                            value={selectedSubject}
                            style={{ width: '100%' }}
                            onChange={setSelectedSubject}
                            aria-label="Filter by subject"
                            showSearch
                            optionFilterProp="children"
                            dropdownStyle={{ zIndex: 1200 }}
                        >
                            <Option value="all">All Subjects</Option>
                            {uniqueSubjects.map(subject =>
                                <Option key={subject} value={subject}>{subject}</Option>
                            )}
                        </Select>
                    </Col>
                    <Col xs={24} sm={12} md={10} lg={8}>
                        <label>Date Range:</label>
                        <RangePicker
                            value={dateRange}
                            onChange={(dates) => setDateRange(dates as [Dayjs, Dayjs] | null)}
                            style={{ width: '100%' }}
                            dropdownClassName="antd-popper"
                            allowClear
                        />
                    </Col>
                </Row>
            </div>
            <div className="results-table">
                <Table
                    columns={columns}
                    dataSource={filteredData}
                    pagination={{
                        pageSize: 10,
                        responsive: true,
                        showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`
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
            </div>
        </div>
    );
};

export default ResultsPage;
