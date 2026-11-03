/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { BookOpen, Calculator, Clock, FileText, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../redux/store';
import { getSubjectsForExamAction } from '../../redux/action/examAction';
import { getchaptersBySubjectIdAction } from '../../redux/action/subjectAction';
import {
    getAccountingFormatsAction,
    getChapterAccountingQuestionsAction,
    getMyAccountingAttemptsAction,
    startAccountingAttemptAction,
} from '../../redux/action/accountingAction';
import CustomDropdown, { DropdownOption } from '../../components/ImportModal/CustomDropdown';
import { formatDate, getFormatLabel } from '../../components/accounting/accountingUtils';
import { PageShell } from '../../components/common/PageShell';
import { DataTable, type DataTableColumn } from '../../components/common/DataTable';
import { EmptyState } from '../../components/common/EmptyState';
import { Card } from '../../components/ui/card';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Spinner } from '../../components/ui/spinner';
import { getStoredUser } from '../../utils/session';
import { AccountingAttemptSummary } from '../../interfaces/interfaces';

const HISTORY_PAGE_SIZE = 10;

const AccountingTestDetailsPage: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();

    // Same board/standard defaults the MCQ test page uses.
    const user = getStoredUser();
    const userBoard = user?.board || 'CBSE';
    const userStandard = user?.standard || '10';

    const { examSubjectsList } = useSelector((state: RootState) => state.exam);
    const { chapterLists } = useSelector((state: RootState) => state.subject);
    const { formats, chapterQuestions, myAttempts, myAttemptsTotalRecords, isLoading } = useSelector((state: RootState) => state.accounting);

    const [subjectId, setSubjectId] = useState('');
    const [chapterId, setChapterId] = useState('');
    const [startingId, setStartingId] = useState<string | null>(null);
    const [historyPage, setHistoryPage] = useState(1);

    useEffect(() => {
        dispatch(getSubjectsForExamAction({ board: userBoard }) as any);
    }, [dispatch, userBoard]);

    // Statement type names for the question badges.
    useEffect(() => {
        dispatch(getAccountingFormatsAction());
    }, [dispatch]);

    useEffect(() => {
        dispatch(getMyAccountingAttemptsAction({ page: historyPage, limit: HISTORY_PAGE_SIZE }));
    }, [dispatch, historyPage]);

    const handleSubjectChange = (value: string) => {
        setSubjectId(value);
        setChapterId('');
        if (value) dispatch(getchaptersBySubjectIdAction(value) as any);
    };

    const handleChapterChange = (value: string) => {
        setChapterId(value);
        if (value) {
            dispatch(getChapterAccountingQuestionsAction({ board: userBoard, standard: userStandard, subjectId, chapterId: value }));
        }
    };

    const handleStart = async (questionId: string) => {
        setStartingId(questionId);
        const result = await dispatch(startAccountingAttemptAction(questionId));
        setStartingId(null);
        if (startAccountingAttemptAction.fulfilled.match(result)) navigate('/accounting-test');
    };

    const subjectOptions: DropdownOption[] = Array.isArray(examSubjectsList)
        ? examSubjectsList.map((subject: any) => ({ value: String(subject.id), label: subject.subname }))
        : [];
    const chapterOptions: DropdownOption[] = Array.isArray(chapterLists)
        ? chapterLists.map((chapter: any) => ({ value: String(chapter.id), label: chapter.name }))
        : [];

    const historyColumns: DataTableColumn<AccountingAttemptSummary>[] = [
        { key: 'title', title: 'Question', dataIndex: 'title', render: (value) => <span className="break-words font-medium">{value}</span> },
        { key: 'chapter', title: 'Chapter', dataIndex: 'chapter', hideBelow: 'lg' },
        {
            key: 'score',
            title: 'Score',
            align: 'center',
            render: (_, record) => (
                <span className="dc-numeric font-semibold">
                    {record.scorePercent}% <span className="text-muted-foreground">({record.marks}/{record.totalEntries})</span>
                </span>
            ),
        },
        { key: 'submittedAt', title: 'Date', hideBelow: 'md', render: (_, record) => formatDate(record.submittedAt) },
        {
            key: 'actions',
            title: 'Result',
            align: 'center',
            render: (_, record) => (
                <Button size="sm" variant="secondary" onClick={() => navigate(`/accounting-result?attemptId=${record.id}`)}>
                    View
                </Button>
            ),
        },
    ];

    return (
        <PageShell className="max-w-4xl">
            <div className="flex flex-col gap-2 text-center">
                <h1 className="dc-h1">Accounting test</h1>
                <p className="dc-small">Prepare a balance sheet or account by dragging entries from the pool into the right heads.</p>
            </div>

            <Card className="flex flex-col gap-5 p-5 sm:p-7">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="acc-subject" required>
                            <span className="inline-flex items-center gap-2">
                                <BookOpen aria-hidden="true" className="size-4 text-primary" />
                                Choose your subject
                            </span>
                        </Label>
                        <CustomDropdown
                            id="acc-subject"
                            options={subjectOptions}
                            value={subjectId}
                            onChange={handleSubjectChange}
                            placeholder="Select a subject"
                            size="large"
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="acc-chapter" required>
                            <span className="inline-flex items-center gap-2">
                                <FileText aria-hidden="true" className="size-4 text-primary" />
                                Select chapter
                            </span>
                        </Label>
                        <CustomDropdown
                            id="acc-chapter"
                            options={chapterOptions}
                            value={chapterId}
                            onChange={handleChapterChange}
                            placeholder={subjectId ? 'Choose your chapter' : 'Select a subject first'}
                            disabled={!subjectId}
                            size="large"
                        />
                    </div>
                </div>

                {chapterId && (
                    <div className="flex flex-col gap-3">
                        <h2 className="dc-label">Available questions</h2>
                        {chapterQuestions.length === 0 && !isLoading && (
                            <EmptyState
                                icon={Calculator}
                                title="No accounting questions yet"
                                description="This chapter has no accounting questions. Try another chapter."
                            />
                        )}
                        <ul className="flex flex-col gap-2">
                            {chapterQuestions.map((question) => (
                                <li key={question.id}>
                                    <div className="flex flex-col gap-3 rounded-xl border border-border bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="flex min-w-0 flex-col gap-1.5">
                                            <span className="break-words font-medium text-foreground">{question.title}</span>
                                            <div className="flex flex-wrap items-center gap-1.5">
                                                <Badge size="sm">{getFormatLabel(formats, question.format)}</Badge>
                                                <Badge size="sm" variant="outline">
                                                    <Clock aria-hidden="true" />
                                                    {question.timeLimitMinutes ? `${question.timeLimitMinutes} min` : 'Untimed'}
                                                </Badge>
                                            </div>
                                        </div>
                                        <Button onClick={() => handleStart(question.id)} disabled={startingId !== null}>
                                            {startingId === question.id ? <Spinner /> : <Play aria-hidden="true" />}
                                            {startingId === question.id ? 'Starting...' : 'Start'}
                                        </Button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </Card>

            <section className="flex flex-col gap-3">
                <h2 className="dc-label">Your accounting results</h2>
                <DataTable<AccountingAttemptSummary>
                    columns={historyColumns}
                    dataSource={myAttempts}
                    rowKey="id"
                    skeletonRows={3}
                    emptyTitle="No accounting attempts yet"
                    emptyDescription="Your submitted balance sheets and accounts will appear here."
                    pagination={
                        myAttemptsTotalRecords > HISTORY_PAGE_SIZE
                            ? {
                                current: historyPage,
                                pageSize: HISTORY_PAGE_SIZE,
                                total: myAttemptsTotalRecords,
                                onChange: (page) => setHistoryPage(page),
                            }
                            : undefined
                    }
                />
            </section>
        </PageShell>
    );
};

export default AccountingTestDetailsPage;
