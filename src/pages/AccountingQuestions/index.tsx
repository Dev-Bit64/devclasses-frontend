/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Eye, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { AppDispatch, RootState } from '../../redux/store';
import { getSubjectsForDDAction, getchaptersBySubjectIdAction } from '../../redux/action/subjectAction';
import { getSubjectsForExamAction } from '../../redux/action/examAction';
import {
    deleteAccountingQuestionsAction,
    getAccountingFormatsAction,
    getAccountingQuestionsAction,
    startAccountingAttemptAction,
} from '../../redux/action/accountingAction';
import { AccountingQuestion } from '../../interfaces/interfaces';
import { AccountingQuestionDialog } from '../../components/accounting/admin/AccountingQuestionDialog';
import { LedgerEntriesPanel } from '../../components/accounting/admin/LedgerEntriesPanel';
import { BOARD_OPTIONS, STANDARD_OPTIONS, getFormatLabel, normalizeStandard } from '../../components/accounting/accountingUtils';
import CustomDropdown from '../../components/ImportModal/CustomDropdown';
import { PageShell } from '../../components/common/PageShell';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable, type DataTableColumn } from '../../components/common/DataTable';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../components/ui/tooltip';

const PAGE_SIZE = 20;

const AccountingQuestionsPage: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { formats, questionLists, questionTotalRecords, isLoading } = useSelector((state: RootState) => state.accounting);
    const { subjectDropdownList, chapterLists } = useSelector((state: RootState) => state.subject);

    const [tab, setTab] = useState('questions');
    const [page, setPage] = useState(1);
    const [filterBoard, setFilterBoard] = useState('');
    const [filterStandard, setFilterStandard] = useState('');
    // Subjects of the filtered board; local so the shared dropdown list stays as loaded.
    const [boardSubjects, setBoardSubjects] = useState<{ id: string; subname: string; standard?: string }[]>([]);
    const [filterSubject, setFilterSubject] = useState('');
    const [filterChapter, setFilterChapter] = useState('');
    const [searchText, setSearchText] = useState('');
    const [appliedSearch, setAppliedSearch] = useState('');
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const reload = useCallback(
        () =>
            dispatch(
                getAccountingQuestionsAction({
                    page,
                    limit: PAGE_SIZE,
                    search: appliedSearch || undefined,
                    board: filterBoard || undefined,
                    standard: filterStandard || undefined,
                    subject: filterSubject || undefined,
                    chapter: filterChapter || undefined,
                })
            ),
        [dispatch, page, appliedSearch, filterBoard, filterStandard, filterSubject, filterChapter]
    );

    useEffect(() => {
        dispatch(getAccountingFormatsAction());
        dispatch(getSubjectsForDDAction());
    }, [dispatch]);

    useEffect(() => {
        reload();
    }, [reload]);

    // With a board chosen, its own subjects (narrowed by standard); otherwise the existing all-board list.
    const subjectOptions = useMemo(() => {
        if (filterBoard) {
            return boardSubjects
                .filter((s) => !filterStandard || s.standard === undefined || normalizeStandard(s.standard) === normalizeStandard(filterStandard))
                .map((s) => ({ label: s.subname, value: s.id }));
        }
        return Array.isArray(subjectDropdownList) ? subjectDropdownList.map((s: any) => ({ label: s.subname, value: s.id })) : [];
    }, [filterBoard, filterStandard, boardSubjects, subjectDropdownList]);
    const chapterOptions = useMemo(
        () => (Array.isArray(chapterLists) ? chapterLists.map((c: any) => ({ label: c.name, value: c.id })) : []),
        [chapterLists]
    );

    const handleFilterSubject = (value: string) => {
        setFilterSubject(value);
        setFilterChapter('');
        setPage(1);
        if (value) dispatch(getchaptersBySubjectIdAction(value));
    };

    // A board or standard change resets the subject, since subjects belong to one board and standard.
    const handleFilterBoard = async (value: string) => {
        setFilterBoard(value);
        handleFilterSubject('');
        setBoardSubjects([]);
        if (!value) return;
        const action: any = await dispatch(getSubjectsForExamAction({ board: value }) as any);
        setBoardSubjects(action?.payload?.data?.subjects || []);
    };

    const handleFilterStandard = (value: string) => {
        setFilterStandard(value);
        handleFilterSubject('');
    };

    const clearFilters = () => {
        setFilterBoard('');
        setFilterStandard('');
        setBoardSubjects([]);
        handleFilterSubject('');
    };

    const openDialog = (questionId: string | null) => {
        setEditingId(questionId);
        setDialogOpen(true);
    };

    const handleSaved = () => {
        setDialogOpen(false);
        reload();
    };

    const handleDelete = async (ids: string[]) => {
        const action: any = await dispatch(deleteAccountingQuestionsAction(ids));
        if (action?.meta?.requestStatus === 'fulfilled') {
            setSelectedRowKeys([]);
            reload();
        }
    };

    // Admins can take any question, published or not, exactly as a student would see it.
    const handlePreview = async (questionId: string) => {
        const action = await dispatch(startAccountingAttemptAction(questionId));
        if (startAccountingAttemptAction.fulfilled.match(action)) navigate('/accounting-test');
    };

    const renderRowActions = (record: AccountingQuestion) => (
        <TooltipProvider delayDuration={150}>
            <div className="flex items-center justify-center gap-1">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label="Preview as student" onClick={() => handlePreview(record.id)}>
                            <Eye aria-hidden="true" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Preview</TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label="Edit question" onClick={() => openDialog(record.id)}>
                            <Pencil aria-hidden="true" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Edit</TooltipContent>
                </Tooltip>
                <ConfirmDialog
                    variant="destructive"
                    title="Delete this question?"
                    description="Student attempts of this question are deleted too. This action cannot be undone."
                    confirmLabel="Yes"
                    cancelLabel="No"
                    onConfirm={() => handleDelete([record.id])}
                    trigger={
                        <Button variant="ghost" size="icon" aria-label="Delete question">
                            <Trash2 aria-hidden="true" className="text-destructive" />
                        </Button>
                    }
                />
            </div>
        </TooltipProvider>
    );

    const columns: DataTableColumn<AccountingQuestion>[] = [
        { key: 'title', title: 'Title', dataIndex: 'title', width: 300, render: (value) => <div className="line-clamp-2 break-words font-medium">{value}</div> },
        { key: 'format', title: 'Type', width: 150, render: (_, record) => <Badge>{getFormatLabel(formats, record.format)}</Badge> },
        { key: 'board', title: 'Board', dataIndex: 'board', width: 90, hideBelow: 'md' },
        { key: 'standard', title: 'Standard', dataIndex: 'standard', width: 100, hideBelow: 'md' },
        { key: 'subject', title: 'Subject', dataIndex: 'subject.subname', width: 140, hideBelow: 'lg' },
        { key: 'chapter', title: 'Chapter', dataIndex: 'chapter.name', width: 150, hideBelow: 'xl' },
        { key: 'entries', title: 'Entries', dataIndex: 'entryCount', align: 'center', width: 90, hideBelow: 'lg' },
        {
            key: 'status',
            title: 'Status',
            width: 110,
            render: (_, record) => (record.isPublished ? <Badge variant="success">Published</Badge> : <Badge variant="outline">Draft</Badge>),
        },
        { key: 'actions', title: 'Actions', align: 'center', width: 140, render: (_, record) => renderRowActions(record) },
    ];

    return (
        <PageShell>
            <PageHeader
                title="Accounting"
                description="Balance sheet and account questions that students solve by dragging entries from their board's pool."
                actions={
                    tab === 'questions' && (
                        <>
                            {selectedRowKeys.length > 0 && (
                                <ConfirmDialog
                                    variant="destructive"
                                    title={`Delete ${selectedRowKeys.length} question${selectedRowKeys.length > 1 ? 's' : ''}?`}
                                    description="Student attempts of these questions are deleted too. This action cannot be undone."
                                    confirmLabel="Yes"
                                    cancelLabel="No"
                                    onConfirm={() => handleDelete(selectedRowKeys as string[])}
                                    trigger={
                                        <Button variant="destructive">
                                            <Trash2 aria-hidden="true" />
                                            Delete ({selectedRowKeys.length})
                                        </Button>
                                    }
                                />
                            )}
                            <Button onClick={() => openDialog(null)}>
                                <Plus aria-hidden="true" />
                                Add Question
                            </Button>
                        </>
                    )
                }
            />

            <Tabs value={tab} onValueChange={setTab}>
                <TabsList>
                    <TabsTrigger value="questions">Questions</TabsTrigger>
                    <TabsTrigger value="entries">Entry Pool</TabsTrigger>
                </TabsList>

                <TabsContent value="questions" className="flex flex-col gap-4">
                    <Card className="p-4 sm:p-5">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                            <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:max-w-lg">
                                <CustomDropdown options={BOARD_OPTIONS} value={filterBoard} onChange={handleFilterBoard} placeholder="Board" />
                                <CustomDropdown options={STANDARD_OPTIONS} value={filterStandard} onChange={handleFilterStandard} placeholder="Standard" />
                                <CustomDropdown options={subjectOptions} value={filterSubject} onChange={handleFilterSubject} placeholder="Subject" />
                                <CustomDropdown
                                    options={filterSubject ? chapterOptions : []}
                                    value={filterChapter}
                                    onChange={(value) => {
                                        setFilterChapter(value);
                                        setPage(1);
                                    }}
                                    placeholder="Chapter"
                                    disabled={!filterSubject}
                                />
                                {(filterBoard || filterStandard || filterSubject) && (
                                    <Button variant="secondary" className="sm:col-span-2 sm:justify-self-start" onClick={clearFilters}>
                                        Clear Filters
                                    </Button>
                                )}
                            </div>
                            <div className="flex w-full items-start gap-2 lg:max-w-md">
                                <div className="relative min-w-0 flex-1">
                                    <Search aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        aria-label="Search accounting questions"
                                        placeholder="Search title or problem..."
                                        className="pl-10"
                                        value={searchText}
                                        onChange={(event) => setSearchText(event.target.value)}
                                        onKeyDown={(event) => {
                                            if (event.key === 'Enter') {
                                                setPage(1);
                                                setAppliedSearch(searchText.trim());
                                            }
                                        }}
                                    />
                                </div>
                                <Button
                                    onClick={() => {
                                        setPage(1);
                                        setAppliedSearch(searchText.trim());
                                    }}
                                >
                                    <Search aria-hidden="true" />
                                    <span className="hidden sm:inline">Search</span>
                                </Button>
                            </div>
                        </div>
                    </Card>

                    <DataTable<AccountingQuestion>
                        columns={columns}
                        dataSource={questionLists}
                        rowKey="id"
                        loading={isLoading && questionLists.length === 0}
                        skeletonRows={5}
                        emptyTitle="No accounting questions yet"
                        emptyDescription="Add a balance sheet or account question to get started."
                        emptyAction={
                            <Button onClick={() => openDialog(null)}>
                                <Plus aria-hidden="true" />
                                Add Question
                            </Button>
                        }
                        rowSelection={{ selectedRowKeys, onChange: (keys) => setSelectedRowKeys(keys) }}
                        pagination={{
                            current: page,
                            pageSize: PAGE_SIZE,
                            total: questionTotalRecords,
                            onChange: (p) => setPage(p),
                            showTotal: (t, range) => `${range[0]}-${range[1]} of ${t} questions`,
                        }}
                        renderMobileCard={(record) => (
                            <Card className="flex flex-col gap-3 p-4">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex flex-wrap items-center gap-1.5">
                                        <Badge size="sm">{getFormatLabel(formats, record.format)}</Badge>
                                        <Badge size="sm" variant="outline">{record.board} · {record.standard}</Badge>
                                        {record.isPublished ? <Badge size="sm" variant="success">Published</Badge> : <Badge size="sm" variant="outline">Draft</Badge>}
                                    </div>
                                    {renderRowActions(record)}
                                </div>
                                <p className="break-words text-sm font-medium text-foreground">{record.title}</p>
                                <p className="dc-caption">{record.entryCount} entries in the answer key</p>
                            </Card>
                        )}
                    />
                </TabsContent>

                <TabsContent value="entries">
                    <LedgerEntriesPanel />
                </TabsContent>
            </Tabs>

            <AccountingQuestionDialog
                open={dialogOpen}
                questionId={editingId}
                formats={formats}
                onClose={() => setDialogOpen(false)}
                onSaved={handleSaved}
            />
        </PageShell>
    );
};

export default AccountingQuestionsPage;
