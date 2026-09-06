/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Key } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CheckCircle2, Eye, Pencil, Plus, Trash2, Upload } from 'lucide-react';

import { AppDispatch, RootState } from '../../redux/store';
import {
    addCollegePracticeQuestionAction,
    deleteCollegePracticeQuestionAction,
    getCollegePracticeQuestionsAction,
    importCollegePracticeQuestionsAction,
    updateCollegePracticeQuestionAction,
} from '../../redux/action/collegePracticeAction';
import { CollegePracticeQuestion } from '../../interfaces/interfaces';

import { ConfirmDialog } from '../common/ConfirmDialog';
import { DataTable, DataTableColumn } from '../common/DataTable';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Alert } from '../ui/alert';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import { Spinner } from '../ui/spinner';
import { FormField } from '../ui/form-field';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '../ui/dialog';
import CustomDropdown from '../ImportModal/CustomDropdown';
import { toastText } from '../../utils/toast';
import { ChapterContentPanelProps } from './panelTypes';

const ANSWER_KEYS = ['A', 'B', 'C', 'D'] as const;

const answerOptions = ANSWER_KEYS.map((key) => ({ value: key, label: `Option ${key}` }));

const questionSchema = z.object({
    question: z.string().trim().min(1, 'Please enter the question'),
    optionA: z.string().trim().min(1, 'Please enter option A'),
    optionB: z.string().trim().min(1, 'Please enter option B'),
    optionC: z.string().trim().min(1, 'Please enter option C'),
    optionD: z.string().trim().min(1, 'Please enter option D'),
    // Mirrors the server's IsIn check so the admin sees the error before submitting.
    correctAnswer: z.enum(ANSWER_KEYS, { message: 'Please choose the correct answer' }),
    explanation: z.string().optional(),
    orderIndex: z.coerce.number().int('Order must be a whole number').min(0, 'Order must be zero or greater'),
    isPublished: z.boolean(),
});
type QuestionValues = z.infer<typeof questionSchema>;

/** One parsed import row, or the reason the line could not be read. */
interface ParsedRow {
    line: number;
    error?: string;
    question?: string;
    optionA?: string;
    optionB?: string;
    optionC?: string;
    optionD?: string;
    correctAnswer?: string;
    explanation?: string;
}

/**
 * Reads pasted rows. Tabs are the primary separator — pasting a spreadsheet selection gives
 * tab-separated text, and question text is full of commas that would wreck a comma split.
 * Comma splitting is only attempted for a line with no tabs at all.
 */
const parsePastedRows = (raw: string): ParsedRow[] =>
    raw
        .split('\n')
        .map((line, index) => ({ line: index + 1, text: line.trim() }))
        .filter((entry) => entry.text.length > 0)
        .map(({ line, text }) => {
            const cells = (text.includes('\t') ? text.split('\t') : text.split(',')).map((cell) => cell.trim());

            if (cells.length < 6) {
                return { line, error: 'needs 6 columns: question, A, B, C, D, answer' };
            }

            const answer = cells[5].toUpperCase().replace(/^OPTION\s*/, '');
            if (!ANSWER_KEYS.includes(answer as any)) {
                return { line, error: `answer "${cells[5]}" must be A, B, C or D` };
            }

            if (cells.slice(0, 5).some((cell) => !cell)) {
                return { line, error: 'the question and all four options are required' };
            }

            return {
                line,
                question: cells[0],
                optionA: cells[1],
                optionB: cells[2],
                optionC: cells[3],
                optionD: cells[4],
                correctAnswer: answer,
                explanation: cells[6] || undefined,
            };
        });

/**
 * Practice tab of the chapter content screen.
 * The chapter is chosen once by the page above; this panel only owns the MCQs hanging off it.
 */
const PracticePanel = ({ chapterId, onCountChange }: ChapterContentPanelProps) => {
    const dispatch = useDispatch<AppDispatch>();
    const { isLoading } = useSelector((state: RootState) => state.collegePractice);

    const [questions, setQuestions] = useState<CollegePracticeQuestion[]>([]);
    const [selectedKeys, setSelectedKeys] = useState<Key[]>([]);

    const [modalOpen, setModalOpen] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState<CollegePracticeQuestion | null>(null);
    const [submitLoading, setSubmitLoading] = useState(false);

    const [previewQuestion, setPreviewQuestion] = useState<CollegePracticeQuestion | null>(null);
    // The answer starts hidden, so the preview shows what a student actually sees first.
    const [answerRevealed, setAnswerRevealed] = useState(false);

    const [importOpen, setImportOpen] = useState(false);
    const [importText, setImportText] = useState('');
    const [importPublished, setImportPublished] = useState(false);

    const form = useForm<QuestionValues>({
        resolver: zodResolver(questionSchema),
        defaultValues: {
            question: '', optionA: '', optionB: '', optionC: '', optionD: '',
            correctAnswer: 'A', explanation: '', orderIndex: 0, isPublished: false,
        },
    });

    // Kept in a ref so reporting the count never re-runs the loader below.
    const onCountChangeRef = useRef(onCountChange);
    useEffect(() => {
        onCountChangeRef.current = onCountChange;
    }, [onCountChange]);

    // ---- Loaders -----------------------------------------------------------

    const fetchQuestions = useCallback(async (id: string) => {
        const result: any = await dispatch(getCollegePracticeQuestionsAction(id));
        if (result.payload && result.payload.statusCode === 200) {
            const rows = result.payload.data ?? [];
            setQuestions(rows);
            onCountChangeRef.current?.(rows.length);
        }
    }, [dispatch]);

    useEffect(() => {
        setSelectedKeys([]);
        if (chapterId) {
            fetchQuestions(chapterId);
        } else {
            setQuestions([]);
        }
    }, [chapterId, fetchQuestions]);

    // ---- Add / edit --------------------------------------------------------

    const openAdd = () => {
        if (!chapterId) {
            toastText('Please select a chapter first', 'error');
            return;
        }
        setEditingQuestion(null);
        form.reset({
            question: '', optionA: '', optionB: '', optionC: '', optionD: '',
            correctAnswer: 'A', explanation: '',
            orderIndex: questions.length, isPublished: false,
        });
        setModalOpen(true);
    };

    const openEdit = (record: CollegePracticeQuestion) => {
        setEditingQuestion(record);
        form.reset({
            question: record.question,
            optionA: record.optionA,
            optionB: record.optionB,
            optionC: record.optionC,
            optionD: record.optionD,
            correctAnswer: record.correctAnswer as QuestionValues['correctAnswer'],
            explanation: record.explanation ?? '',
            orderIndex: record.orderIndex,
            isPublished: record.isPublished,
        });
        setModalOpen(true);
    };

    const submitQuestion = async (values: QuestionValues) => {
        setSubmitLoading(true);
        try {
            const result: any = editingQuestion
                ? await dispatch(updateCollegePracticeQuestionAction({
                    questionId: editingQuestion.id, ...values,
                }))
                : await dispatch(addCollegePracticeQuestionAction({ chapterId, ...values }));

            if (result.payload && result.payload.statusCode === 200) {
                toastText(
                    editingQuestion ? 'Question updated successfully' : 'Question added successfully',
                    'success'
                );
                setModalOpen(false);
                fetchQuestions(chapterId);
            }
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleDelete = async (ids: string[]) => {
        const result: any = await dispatch(deleteCollegePracticeQuestionAction({ ids }));
        if (result.payload && result.payload.statusCode === 200) {
            toastText(ids.length > 1 ? 'Questions deleted successfully' : 'Question deleted successfully', 'success');
            setSelectedKeys([]);
            fetchQuestions(chapterId);
        }
    };

    // ---- Import ------------------------------------------------------------

    const parsedRows = useMemo(() => parsePastedRows(importText), [importText]);
    const badRows = parsedRows.filter((row) => row.error);
    const goodRows = parsedRows.filter((row) => !row.error);

    const openImport = () => {
        if (!chapterId) {
            toastText('Please select a chapter first', 'error');
            return;
        }
        setImportText('');
        setImportPublished(false);
        setImportOpen(true);
    };

    const submitImport = async () => {
        if (badRows.length > 0) {
            toastText('Please fix the highlighted rows before importing', 'error');
            return;
        }
        if (goodRows.length === 0) {
            toastText('Paste at least one row to import', 'error');
            return;
        }

        setSubmitLoading(true);
        try {
            const result: any = await dispatch(importCollegePracticeQuestionsAction({
                chapterId,
                isPublished: importPublished,
                questions: goodRows.map((row) => ({
                    question: row.question as string,
                    optionA: row.optionA as string,
                    optionB: row.optionB as string,
                    optionC: row.optionC as string,
                    optionD: row.optionD as string,
                    correctAnswer: row.correctAnswer as string,
                    explanation: row.explanation,
                })),
            }));

            if (result.payload && result.payload.statusCode === 200) {
                toastText(result.payload.message ?? 'Questions imported successfully', 'success');
                setImportOpen(false);
                fetchQuestions(chapterId);
            }
        } finally {
            setSubmitLoading(false);
        }
    };

    // ---- Rendering ---------------------------------------------------------

    const openPreview = (record: CollegePracticeQuestion) => {
        setAnswerRevealed(false);
        setPreviewQuestion(record);
    };

    const statusBadge = (published: boolean) =>
        published
            ? <Badge variant="success">Published</Badge>
            : <Badge variant="outline">Draft</Badge>;

    const optionsOf = (record: CollegePracticeQuestion) => [
        { key: 'A', text: record.optionA },
        { key: 'B', text: record.optionB },
        { key: 'C', text: record.optionC },
        { key: 'D', text: record.optionD },
    ];

    const columns: DataTableColumn<CollegePracticeQuestion>[] = useMemo(
        () => [
            { key: 'orderIndex', title: 'No.', dataIndex: 'orderIndex', width: 72, align: 'center' },
            {
                key: 'question',
                title: 'Question',
                dataIndex: 'question',
                render: (_: any, record: CollegePracticeQuestion) => (
                    <div className="flex min-w-0 flex-col">
                        <span className="line-clamp-2 font-medium">{record.question}</span>
                        <span className="truncate text-xs text-muted-foreground">
                            A. {record.optionA} · B. {record.optionB} · C. {record.optionC} · D. {record.optionD}
                        </span>
                    </div>
                ),
            },
            {
                key: 'correctAnswer',
                title: 'Answer',
                dataIndex: 'correctAnswer',
                width: 100,
                align: 'center',
                render: (value: string) => <Badge variant="solid">{value}</Badge>,
            },
            {
                key: 'explanation',
                title: 'Explanation',
                dataIndex: 'explanation',
                width: 120,
                align: 'center',
                hideBelow: 'xl',
                render: (value: string | null) => (value ? 'Yes' : 'None'),
            },
            {
                key: 'isPublished',
                title: 'Status',
                dataIndex: 'isPublished',
                width: 130,
                render: (value: boolean) => statusBadge(value),
            },
            {
                key: 'action',
                title: 'Action',
                width: 150,
                align: 'center',
                render: (_: any, record: CollegePracticeQuestion) => (
                    <div className="flex items-center justify-center gap-1">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button size="icon" variant="ghost" onClick={() => openPreview(record)}>
                                    <Eye className="size-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>See it as a student does</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button size="icon" variant="ghost" onClick={() => openEdit(record)}>
                                    <Pencil className="size-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Edit question</TooltipContent>
                        </Tooltip>

                        <ConfirmDialog
                            title="Delete this question?"
                            description="Answers students have already given to it are kept, but the question disappears from practice."
                            variant="destructive"
                            confirmLabel="Delete"
                            onConfirm={() => handleDelete([record.id])}
                            trigger={
                                <Button size="icon" variant="ghost">
                                    <Trash2 className="size-4" />
                                </Button>
                            }
                        />
                    </div>
                ),
            },
        ],
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [questions, chapterId]
    );

    const publishedCount = questions.filter((row) => row.isPublished).length;

    return (
        <div className="flex flex-col gap-5">
            {/* The tab owns its own actions, since the page header now covers all three tabs. */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="dc-small">
                    Multiple-choice practice for the mobile app. {publishedCount} of {questions.length} published.
                </p>
                <div className="flex flex-wrap gap-2">
                    <Button variant="secondary" onClick={openImport} disabled={!chapterId}>
                        <Upload className="size-4" /> Import
                    </Button>
                    <Button onClick={openAdd} disabled={!chapterId}>
                        <Plus className="size-4" /> Add Question
                    </Button>
                </div>
            </div>

            {selectedKeys.length > 0 && (
                <div className="flex flex-wrap items-center gap-3">
                    <span className="text-sm text-muted-foreground">{selectedKeys.length} selected</span>
                    <ConfirmDialog
                        title={`Delete ${selectedKeys.length} question(s)?`}
                        description="This cannot be undone."
                        variant="destructive"
                        confirmLabel="Delete"
                        onConfirm={() => handleDelete(selectedKeys.map(String))}
                        trigger={
                            <Button size="sm" variant="destructive">
                                <Trash2 className="size-4" /> Delete selected
                            </Button>
                        }
                    />
                </div>
            )}

            <DataTable<CollegePracticeQuestion>
                columns={columns}
                dataSource={questions}
                rowKey="id"
                loading={isLoading}
                rowSelection={{
                    selectedRowKeys: selectedKeys,
                    onChange: (keys) => setSelectedKeys(keys),
                }}
                emptyTitle="No questions yet"
                emptyDescription="Add the first practice question for this chapter, or import a set."
                emptyAction={
                    <Button onClick={openAdd}>
                        <Plus className="size-4" /> Add Question
                    </Button>
                }
                // Below `md` the table becomes cards, so each card has to carry the same
                // actions the desktop row offers.
                renderMobileCard={(record) => (
                    <Card className="flex flex-col gap-3 p-4">
                        <span className="font-medium">{record.question}</span>

                        <ul className="flex flex-col gap-1">
                            {optionsOf(record).map((option) => (
                                <li
                                    key={option.key}
                                    className="flex items-start gap-2 text-xs text-muted-foreground"
                                >
                                    <span className="font-semibold">{option.key}.</span>
                                    <span className="min-w-0">{option.text}</span>
                                    {option.key === record.correctAnswer && (
                                        <CheckCircle2
                                            aria-label="Correct answer"
                                            className="size-3.5 shrink-0 text-success"
                                        />
                                    )}
                                </li>
                            ))}
                        </ul>

                        <div className="flex flex-wrap items-center justify-between gap-2">
                            {statusBadge(record.isPublished)}

                            <div className="flex items-center gap-1">
                                <Button size="sm" variant="secondary" onClick={() => openPreview(record)}>
                                    <Eye className="size-4" /> Preview
                                </Button>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    aria-label="Edit question"
                                    onClick={() => openEdit(record)}
                                >
                                    <Pencil className="size-4" />
                                </Button>
                                <ConfirmDialog
                                    title="Delete this question?"
                                    description="This cannot be undone."
                                    variant="destructive"
                                    confirmLabel="Delete"
                                    onConfirm={() => handleDelete([record.id])}
                                    trigger={
                                        <Button size="icon" variant="ghost" aria-label="Delete question">
                                            <Trash2 className="size-4" />
                                        </Button>
                                    }
                                />
                            </div>
                        </div>
                    </Card>
                )}
            />

            {/* Add / edit */}
            <Dialog open={modalOpen} onOpenChange={(open) => !open && setModalOpen(false)}>
                <DialogContent className="max-w-lg gap-5 p-5 sm:p-6">
                    <DialogHeader>
                        <DialogTitle>{editingQuestion ? 'Edit Question' : 'Add Question'}</DialogTitle>
                    </DialogHeader>

                    <form
                        noValidate
                        onSubmit={form.handleSubmit(submitQuestion)}
                        className="dc-scroll flex max-h-[70vh] flex-col gap-5 overflow-y-auto"
                    >
                        <FormField
                            id="college-question-text"
                            label="Question"
                            required
                            error={form.formState.errors.question?.message}
                        >
                            {(aria) => (
                                <Textarea
                                    {...aria}
                                    {...form.register('question')}
                                    placeholder="e.g. Which account is debited when goods are purchased for cash?"
                                    rows={3}
                                    autoFocus
                                />
                            )}
                        </FormField>

                        {ANSWER_KEYS.map((key) => {
                            const field = `option${key}` as const;
                            return (
                                <FormField
                                    key={key}
                                    id={`college-question-option-${key}`}
                                    label={`Option ${key}`}
                                    required
                                    error={form.formState.errors[field]?.message}
                                >
                                    {(aria) => (
                                        <Input
                                            {...aria}
                                            {...form.register(field)}
                                            invalid={Boolean(form.formState.errors[field])}
                                        />
                                    )}
                                </FormField>
                            );
                        })}

                        <FormField
                            id="college-question-answer"
                            label="Correct Answer"
                            required
                            error={form.formState.errors.correctAnswer?.message}
                        >
                            {(aria) => (
                                <Controller
                                    name="correctAnswer"
                                    control={form.control}
                                    render={({ field }) => (
                                        <CustomDropdown
                                            id={aria.id}
                                            options={answerOptions}
                                            value={field.value}
                                            onChange={field.onChange}
                                            placeholder="Choose the correct option"
                                        />
                                    )}
                                />
                            )}
                        </FormField>

                        <FormField
                            id="college-question-explanation"
                            label="Explanation"
                            hint="Shown after the student submits the set. Optional."
                        >
                            {(aria) => (
                                <Textarea
                                    {...aria}
                                    {...form.register('explanation')}
                                    placeholder="Optional"
                                    rows={2}
                                />
                            )}
                        </FormField>

                        <FormField
                            id="college-question-order"
                            label="Display Order"
                            error={form.formState.errors.orderIndex?.message}
                        >
                            {(aria) => (
                                <Input
                                    {...aria}
                                    type="number"
                                    min={0}
                                    {...form.register('orderIndex')}
                                    invalid={Boolean(form.formState.errors.orderIndex)}
                                />
                            )}
                        </FormField>

                        <Controller
                            name="isPublished"
                            control={form.control}
                            render={({ field }) => (
                                <label className="flex items-center gap-2 text-sm">
                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                    Published (used in student practice)
                                </label>
                            )}
                        />

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => setModalOpen(false)}
                                disabled={submitLoading}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={submitLoading}>
                                {submitLoading && <Spinner />}
                                {editingQuestion ? 'Update' : 'Add'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Student preview */}
            <Dialog
                open={Boolean(previewQuestion)}
                onOpenChange={(open) => !open && setPreviewQuestion(null)}
            >
                <DialogContent className="max-w-lg gap-5 p-5 sm:p-6">
                    <DialogHeader>
                        <DialogTitle>How the student sees it</DialogTitle>
                    </DialogHeader>

                    {previewQuestion && (
                        <div className="flex flex-col gap-4">
                            {!previewQuestion.isPublished && (
                                <Alert
                                    variant="warning"
                                    title="This question is still a draft"
                                    description="It will not appear in practice until it is published."
                                />
                            )}

                            <p className="font-medium">{previewQuestion.question}</p>

                            <ul className="flex flex-col gap-2">
                                {optionsOf(previewQuestion).map((option) => {
                                    const isCorrect = option.key === previewQuestion.correctAnswer;
                                    return (
                                        <li
                                            key={option.key}
                                            className={
                                                answerRevealed && isCorrect
                                                    ? 'flex items-center gap-3 rounded-lg border border-success/40 bg-success/5 p-3 text-sm'
                                                    : 'flex items-center gap-3 rounded-lg border border-border p-3 text-sm'
                                            }
                                        >
                                            <span className="grid size-7 shrink-0 place-items-center rounded-full bg-muted text-xs font-semibold">
                                                {option.key}
                                            </span>
                                            <span className="min-w-0">{option.text}</span>
                                            {/* The tick is a second, non-colour cue. */}
                                            {answerRevealed && isCorrect && (
                                                <CheckCircle2
                                                    aria-label="Correct answer"
                                                    className="ml-auto size-4 shrink-0 text-success"
                                                />
                                            )}
                                        </li>
                                    );
                                })}
                            </ul>

                            {answerRevealed ? (
                                <div className="flex flex-col gap-2 rounded-lg bg-muted/50 p-3 text-sm">
                                    <span className="font-medium">
                                        Correct answer: {previewQuestion.correctAnswer}
                                    </span>
                                    <span className="text-muted-foreground">
                                        {previewQuestion.explanation || 'No explanation was written for this question.'}
                                    </span>
                                </div>
                            ) : (
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => setAnswerRevealed(true)}
                                >
                                    Show the answer
                                </Button>
                            )}
                        </div>
                    )}

                    <DialogFooter>
                        <Button type="button" variant="secondary" onClick={() => setPreviewQuestion(null)}>
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Bulk import */}
            <Dialog open={importOpen} onOpenChange={(open) => !open && !submitLoading && setImportOpen(false)}>
                <DialogContent className="max-w-2xl gap-5 p-5 sm:p-6">
                    <DialogHeader>
                        <DialogTitle>Import Questions</DialogTitle>
                    </DialogHeader>

                    <div className="dc-scroll flex max-h-[70vh] flex-col gap-4 overflow-y-auto">
                        <Alert
                            variant="info"
                            title="One question per line"
                            description={
                                <span>
                                    Copy the rows straight out of your spreadsheet. Each line needs, in order:
                                    question, option A, option B, option C, option D, the correct answer
                                    (A, B, C or D), and optionally an explanation.
                                </span>
                            }
                        />

                        <FormField id="college-import-rows" label="Pasted rows">
                            {(aria) => (
                                <Textarea
                                    {...aria}
                                    value={importText}
                                    onChange={(event) => setImportText(event.target.value)}
                                    rows={10}
                                    placeholder={'What is a ledger?\tA book of accounts\tA cash box\tA receipt\tA bank\tA\tIt records every account.'}
                                />
                            )}
                        </FormField>

                        {importText.trim().length > 0 && (
                            <div className="flex flex-col gap-2 text-sm">
                                <span>
                                    {goodRows.length} row(s) ready
                                    {badRows.length > 0 && `, ${badRows.length} to fix`}
                                </span>

                                {badRows.length > 0 && (
                                    <ul className="flex flex-col gap-1 rounded-lg border border-destructive/25 bg-destructive/5 p-3">
                                        {badRows.slice(0, 8).map((row) => (
                                            <li key={row.line} className="text-xs text-destructive">
                                                Line {row.line}: {row.error}
                                            </li>
                                        ))}
                                        {badRows.length > 8 && (
                                            <li className="text-xs text-destructive">
                                                …and {badRows.length - 8} more.
                                            </li>
                                        )}
                                    </ul>
                                )}
                            </div>
                        )}

                        <label className="flex items-center gap-2 text-sm">
                            <Checkbox
                                checked={importPublished}
                                onCheckedChange={(checked) => setImportPublished(checked === true)}
                            />
                            Publish these questions straight away
                        </label>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setImportOpen(false)}
                            disabled={submitLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={submitImport}
                            disabled={submitLoading || goodRows.length === 0 || badRows.length > 0}
                        >
                            {submitLoading && <Spinner />}
                            Import {goodRows.length > 0 ? `${goodRows.length} question(s)` : ''}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default PracticePanel;
