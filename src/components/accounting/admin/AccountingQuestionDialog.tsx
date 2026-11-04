/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch, useSelector } from 'react-redux';
import { List, MinusCircle, Plus, PlusCircle, Search, Settings2, Trash2, UserPlus, X } from 'lucide-react';
import { AppDispatch, RootState } from '../../../redux/store';
import { getchaptersBySubjectIdAction } from '../../../redux/action/subjectAction';
import { getSubjectsForExamAction } from '../../../redux/action/examAction';
import {
    addLedgerEntryAction,
    createAccountingQuestionAction,
    getAccountingQuestionByIdAction,
    getAllLedgerEntriesAction,
    updateAccountingQuestionAction,
} from '../../../redux/action/accountingAction';
import { AccountingBoard, AccountingColumn, AccountingFormat, AccountingFormatKey, LedgerEntry } from '../../../interfaces/interfaces';
import CustomDropdown from '../../ImportModal/CustomDropdown';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../../ui/dialog';
import { FormField } from '../../ui/form-field';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { Button } from '../../ui/button';
import { Checkbox } from '../../ui/checkbox';
import { Alert } from '../../ui/alert';
import { Spinner } from '../../ui/spinner';
import { LoadingState } from '../../common/LoadingState';
import { ConfirmDialog } from '../../common/ConfirmDialog';
import { LedgerEntriesDialog } from './LedgerEntriesDialog';
import { cn } from '../../../libs/utils';
import {
    AMOUNT_PATTERN,
    BOARD_OPTIONS,
    STANDARD_OPTIONS,
    formatAmount,
    formatSignedAmount,
    getSectionStatements,
    getStatements,
    isBalancedTotals,
    isComputation,
    isEntryExcluded,
    normalizeStandard,
    parseAmount,
    resolveDeduction,
    sectionAllowsDeduction,
    sectionSign,
    sumBySide,
} from '../accountingUtils';

const questionSchema = z.object({
    board: z.string().min(1, 'Please select board'),
    standard: z.string().min(1, 'Please select standard'),
    subject: z.string().min(1, 'Please select subject'),
    chapter: z.string().min(1, 'Please select chapter'),
    title: z.string().trim().min(3, 'Title must be at least 3 characters').max(255, 'Title cannot exceed 255 characters'),
    problem: z.string().trim().min(10, 'Problem must be at least 10 characters').max(20000, 'Problem cannot exceed 20000 characters'),
    // Statement types come from the server and depend on the board, so any non-empty key is accepted here.
    format: z.string().min(1, 'Please choose a statement type'),
    // Blank means untimed.
    timeLimitMinutes: z
        .string()
        .refine((value) => value === '' || (/^\d+$/.test(value) && Number(value) >= 1 && Number(value) <= 300), 'Enter 1–300 minutes, or leave blank'),
    isPublished: z.boolean(),
});
type QuestionValues = z.infer<typeof questionSchema>;

const EMPTY_VALUES: QuestionValues = {
    board: '',
    standard: '',
    subject: '',
    chapter: '',
    title: '',
    problem: '',
    format: '',
    timeLimitMinutes: '',
    isPublished: false,
};

// One answer key row while it is being edited.
interface KeyRow {
    // Local identity, since a columnar key may hold the same entry under two heads.
    rowId: string;
    entryId: string;
    entryName: string;
    sectionKey: string;
    amount: string;
    isDeduction: boolean;
    // Per-partner amounts of a columnar statement, keyed by column; blank means no amount for that partner.
    amounts: Record<string, string>;
}

// Subject choice from the board's subject list; standard may be absent on an older server.
interface SubjectOption {
    id: string;
    subname: string;
    standard?: string;
}

// A board or statement-type change that would clear the answer key, waiting for confirmation.
type PendingChange = { field: 'board' | 'format'; value: string } | null;

// Unique local row id.
let rowCounter = 0;
const nextRowId = () => `row-${++rowCounter}`;

// Next unused partner key (P1, P2, …), so removing a partner never reuses a key mid-edit.
const nextColumnKey = (columns: AccountingColumn[]) => {
    let index = columns.length + 1;
    while (columns.some((column) => column.key === `P${index}`)) index++;
    return `P${index}`;
};

// Default partners for a new columnar question, named as textbooks usually do.
const defaultColumns = (count: number): AccountingColumn[] =>
    Array.from({ length: count }, (_, index) => ({ key: `P${index + 1}`, label: String.fromCharCode(65 + index) }));

export interface AccountingQuestionDialogProps {
    open: boolean;
    // Null opens the dialog in create mode.
    questionId: string | null;
    formats: AccountingFormat[];
    onClose: () => void;
    onSaved: () => void;
}

const AccountingQuestionDialog = ({ open, questionId, formats, onClose, onSaved }: AccountingQuestionDialogProps) => {
    const dispatch = useDispatch<AppDispatch>();
    const { chapterLists } = useSelector((state: RootState) => state.subject);

    // Kept locally so the page's own subject filter list in the store is never overwritten.
    const [subjects, setSubjects] = useState<SubjectOption[]>([]);
    const [pool, setPool] = useState<LedgerEntry[]>([]);
    const [rows, setRows] = useState<KeyRow[]>([]);
    const [columns, setColumns] = useState<AccountingColumn[]>([]);
    const [pendingChange, setPendingChange] = useState<PendingChange>(null);
    const [keyError, setKeyError] = useState<string | null>(null);
    const [entrySearch, setEntrySearch] = useState('');
    // Whether the browsable pool list under the search box is shown.
    const [poolListOpen, setPoolListOpen] = useState(false);
    // Inline "New entry" form for adding a custom entry to the shared pool.
    const [newEntryOpen, setNewEntryOpen] = useState(false);
    const [newEntryName, setNewEntryName] = useState('');
    const [newEntryCategory, setNewEntryCategory] = useState('');
    const [newEntryError, setNewEntryError] = useState<string | null>(null);
    const [creatingEntry, setCreatingEntry] = useState(false);
    const [managePoolOpen, setManagePoolOpen] = useState(false);
    const [loadingQuestion, setLoadingQuestion] = useState(false);
    const [saving, setSaving] = useState(false);

    const {
        control,
        register,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors },
    } = useForm<QuestionValues>({ resolver: zodResolver(questionSchema), defaultValues: EMPTY_VALUES });

    const formatKey = watch('format');
    const selectedSubject = watch('subject');
    const selectedBoard = watch('board') as AccountingBoard | '';
    const selectedStandard = watch('standard');
    const format = formats.find((f) => f.key === formatKey) ?? null;
    // Columnar statements (e.g. Partners' Capital Accounts) carry one amount per partner.
    const columnRule = format?.columns ?? null;
    const isColumnar = Boolean(columnRule);
    // Final Accounts hold several statements; an entry may be used once in each of them.
    const statements = useMemo(() => (format ? getStatements(format) : []), [format]);
    const isMultiStatement = statements.length > 1;
    const statementOf = useMemo(() => getSectionStatements(format), [format]);

    // Fetches one board's whole pool; resolves to the entries, or null if the request failed.
    const loadPool = useCallback(
        async (board: AccountingBoard): Promise<LedgerEntry[] | null> => {
            const action: any = await dispatch(getAllLedgerEntriesAction(board));
            if (!getAllLedgerEntriesAction.fulfilled.match(action)) return null;
            const entries: LedgerEntry[] = action.payload?.data?.entries || [];
            setPool(entries);
            return entries;
        },
        [dispatch]
    );

    // Fetches the board's subjects into local state.
    const loadSubjects = useCallback(
        async (board: AccountingBoard) => {
            const action: any = await dispatch(getSubjectsForExamAction({ board }) as any);
            setSubjects(action?.payload?.data?.subjects || []);
        },
        [dispatch]
    );

    // Loads the board-specific data each time the dialog opens, then the question if editing.
    useEffect(() => {
        if (!open) return;
        setKeyError(null);
        setEntrySearch('');
        setPoolListOpen(false);
        setNewEntryOpen(false);
        setManagePoolOpen(false);
        setPendingChange(null);

        if (!questionId) {
            reset(EMPTY_VALUES);
            setRows([]);
            setColumns([]);
            setPool([]);
            setSubjects([]);
            return;
        }

        setLoadingQuestion(true);
        dispatch(getAccountingQuestionByIdAction(questionId)).then((action: any) => {
            setLoadingQuestion(false);
            if (!getAccountingQuestionByIdAction.fulfilled.match(action)) return;
            const question = action.payload?.data;
            if (question?.subject?.id) dispatch(getchaptersBySubjectIdAction(question.subject.id));
            if (question?.board) {
                loadPool(question.board);
                loadSubjects(question.board);
            }
            reset({
                board: question.board,
                standard: question.standard,
                subject: question.subject?.id ?? '',
                chapter: question.chapter?.id ?? '',
                title: question.title,
                problem: question.problem ?? '',
                format: question.format,
                timeLimitMinutes: question.timeLimitMinutes ? String(question.timeLimitMinutes) : '',
                isPublished: question.isPublished,
            });

            const savedColumns: AccountingColumn[] = Array.isArray(question.columns) ? question.columns : [];
            setColumns(savedColumns);
            if (savedColumns.length === 0) {
                setRows(
                    (question.answerKey || []).map((row: any) => ({
                        rowId: nextRowId(),
                        entryId: row.entryId,
                        entryName: row.entryName,
                        sectionKey: row.sectionKey,
                        amount: String(row.amount),
                        isDeduction: row.isDeduction,
                        amounts: {},
                    }))
                );
                return;
            }
            // Columnar keys are stored per partner cell; cells of one entry, head and sign form one row.
            const grouped = new Map<string, KeyRow>();
            (question.answerKey || []).forEach((cell: any) => {
                const groupKey = `${cell.entryId}|${cell.sectionKey}|${cell.isDeduction}`;
                const row: KeyRow = grouped.get(groupKey) ?? {
                    rowId: nextRowId(),
                    entryId: cell.entryId,
                    entryName: cell.entryName,
                    sectionKey: cell.sectionKey,
                    amount: '',
                    isDeduction: cell.isDeduction,
                    amounts: {},
                };
                row.amounts[cell.columnKey] = String(cell.amount);
                grouped.set(groupKey, row);
            });
            setRows([...grouped.values()]);
        });
    }, [open, questionId, dispatch, reset, loadPool, loadSubjects]);

    // Applies a board: its subjects and pool load, and anything tied to the old board is cleared.
    const applyBoard = (board: AccountingBoard) => {
        setValue('board', board, { shouldValidate: true });
        setValue('subject', '');
        setValue('chapter', '');
        const current = formats.find((f) => f.key === formatKey);
        if (current && !(current.boards ?? []).includes(board)) {
            setValue('format', '');
            setColumns([]);
        }
        setRows([]);
        setKeyError(null);
        setPool([]);
        setSubjects([]);
        loadPool(board);
        loadSubjects(board);
    };

    // Applies a statement type; partners appear for columnar types and go for the rest.
    const applyFormat = (key: string, clearKey: boolean) => {
        setValue('format', key, { shouldValidate: true });
        const next = formats.find((f) => f.key === key);
        if (next?.columns) {
            setColumns((current) => (current.length >= next.columns!.min ? current.slice(0, next.columns!.max) : defaultColumns(next.columns!.min)));
        } else {
            setColumns([]);
        }
        if (clearKey) setRows([]);
        // Rows whose head has no "Less" lines in the new type drop their deduction; a head with a fixed sign sets it.
        else setRows((current) => current.map((row) => ({ ...row, isDeduction: resolveDeduction(next, row.sectionKey, row.isDeduction && sectionAllowsDeduction(next, row.sectionKey)) })));
        setKeyError(null);
    };

    // A board change always invalidates the key, since entries belong to one board.
    const handleBoardChange = (value: string) => {
        if (value === selectedBoard) return;
        if (rows.length > 0) return setPendingChange({ field: 'board', value });
        applyBoard(value as AccountingBoard);
    };

    // Switching between single-column and columnar types invalidates the key's amounts.
    const handleFormatChange = (value: string) => {
        if (value === formatKey) return;
        const next = formats.find((f) => f.key === value);
        const modeChanges = Boolean(next?.columns) !== isColumnar;
        if (modeChanges && rows.length > 0) return setPendingChange({ field: 'format', value });
        applyFormat(value, false);
    };

    const confirmPendingChange = () => {
        if (!pendingChange) return;
        if (pendingChange.field === 'board') applyBoard(pendingChange.value as AccountingBoard);
        else applyFormat(pendingChange.value, true);
        setPendingChange(null);
    };

    // After the pool modal closes: pick up new or renamed entries, and keep the key in step with them.
    const handleManagePoolClose = async () => {
        setManagePoolOpen(false);
        if (!selectedBoard) return;
        const entries = await loadPool(selectedBoard);
        if (!entries) return;
        const nameById = new Map(entries.map((entry) => [entry.id, entry.name]));
        // Rows in the key are protected from deletion in the modal; this only guards a concurrent delete.
        const kept = rows.filter((row) => nameById.has(row.entryId));
        if (kept.length !== rows.length) setKeyError('An entry was removed from the pool, so it was taken out of this answer key.');
        setRows(kept.map((row) => ({ ...row, entryName: nameById.get(row.entryId) ?? row.entryName })));
    };

    // Subjects of the chosen board, narrowed to the chosen standard when the server reports it.
    const subjectOptions = useMemo(
        () =>
            subjects
                .filter((s) => !selectedStandard || s.standard === undefined || normalizeStandard(s.standard) === normalizeStandard(selectedStandard))
                .map((s) => ({ label: s.subname, value: s.id })),
        [subjects, selectedStandard]
    );
    const chapterOptions = useMemo(
        () => (Array.isArray(chapterLists) ? chapterLists.map((c: any) => ({ label: c.name, value: c.id })) : []),
        [chapterLists]
    );
    // Only the statement types in the chosen board's syllabus; an older server without boards offers all.
    const formatOptions = formats
        .filter((f) => !selectedBoard || !f.boards || f.boards.includes(selectedBoard))
        .map((f) => ({ label: f.label, value: f.key }));
    // Section choices labelled with their main head, e.g. "Current Liabilities › Trade Payables".
    // Final Accounts heads carry their statement, e.g. "Trading Account › Dr." or "Balance Sheet › Assets: Current Assets".
    const sectionOptions = useMemo(
        () =>
            statements.flatMap((statement) =>
                statement.sides.flatMap((side) =>
                    side.sections.map((section) => {
                        const head = `${side.label}: ${section.group ? `${section.group} › ` : ''}${section.label}`;
                        if (!isMultiStatement) return { value: section.key, label: head };
                        return { value: section.key, label: side.sections.length === 1 ? `${statement.label} › ${side.label}` : `${statement.label} › ${head}` };
                    })
                )
            ),
        [statements, isMultiStatement]
    );
    const validSections = useMemo(() => new Set(sectionOptions.map((option) => option.value)), [sectionOptions]);

    // Pool matches for the entry picker. Single-column keys hold each entry once; a columnar key may
    // repeat an entry under another head (e.g. Balance b/d as Cr. for one partner and Dr. for another).
    const usedIds = useMemo(() => new Set(rows.map((row) => row.entryId)), [rows]);
    const query = entrySearch.trim().toLowerCase();
    // With no search text the whole remaining pool is listed (A–Z), so admins can browse it.
    const matches = useMemo(
        () =>
            pool
                // Entries the type leaves out (e.g. non-profit items in cash flow questions) are never offered for its key.
                .filter((entry) => !isEntryExcluded(format, entry.name))
                .filter((entry) => (isColumnar || isMultiStatement || !usedIds.has(entry.id)) && (!query || entry.name.toLowerCase().includes(query)))
                .sort((a, b) => a.name.localeCompare(b.name)),
        [pool, usedIds, query, isColumnar, isMultiStatement, format]
    );
    const exactMatch = pool.some((entry) => entry.name.toLowerCase() === query);
    // The answer key needs a board (for the pool) and a statement type (for the heads) first.
    const keyReady = Boolean(selectedBoard && format);

    const addRow = (entry: { id: string; name: string }) => {
        setRows((current) => [
            ...current,
            { rowId: nextRowId(), entryId: entry.id, entryName: entry.name, sectionKey: '', amount: '', isDeduction: false, amounts: {} },
        ]);
        setEntrySearch('');
        setKeyError(null);
    };

    // Creates a missing entry in the board's pool and adds it to this key in one step.
    const createAndAddEntry = async (name: string, category?: string) => {
        if (!name || !selectedBoard) return false;
        setCreatingEntry(true);
        const action: any = await dispatch(addLedgerEntryAction({ board: selectedBoard, name, category: category || undefined }));
        setCreatingEntry(false);
        if (!addLedgerEntryAction.fulfilled.match(action)) return false;
        const created = action.payload?.data;
        setPool((current) => [...current, created]);
        addRow(created);
        return true;
    };

    // Opens the inline form, carrying over whatever was already typed in the search box.
    const openNewEntryForm = () => {
        setPoolListOpen(false);
        setNewEntryName(entrySearch.trim());
        setNewEntryCategory('');
        setNewEntryError(null);
        setNewEntryOpen(true);
    };

    const submitNewEntry = async () => {
        const name = newEntryName.trim();
        if (!name) return setNewEntryError('Please enter the entry name');
        // Same case-insensitive rule the server's unique index applies.
        const existing = pool.find((entry) => entry.name.toLowerCase() === name.toLowerCase());
        if (existing) {
            return setNewEntryError(
                usedIds.has(existing.id) && !isColumnar
                    ? `"${existing.name}" is already in this answer key.`
                    : `"${existing.name}" is already in the pool — search for it above.`
            );
        }
        if (await createAndAddEntry(name, newEntryCategory.trim())) setNewEntryOpen(false);
    };

    const updateRow = (rowId: string, patch: Partial<KeyRow>) =>
        setRows((current) => current.map((row) => (row.rowId === rowId ? { ...row, ...patch } : row)));

    // Moving a row under a head without "Less" lines also clears its deduction, so the server accepts the key.
    // A head with a fixed sign sets it, and a sign that came only from the old head's fixed sign is not carried over.
    const updateRowSection = (rowId: string, sectionKey: string) =>
        setRows((current) =>
            current.map((row) => {
                if (row.rowId !== rowId) return row;
                const chosen = sectionSign(format, row.sectionKey) ? false : row.isDeduction;
                return { ...row, sectionKey, isDeduction: resolveDeduction(format, sectionKey, chosen && sectionAllowsDeduction(format, sectionKey)) };
            })
        );

    const updateRowAmount = (rowId: string, columnKey: string, value: string) =>
        setRows((current) => current.map((row) => (row.rowId === rowId ? { ...row, amounts: { ...row.amounts, [columnKey]: value } } : row)));

    // Partner editing: names change freely; removing a partner drops their amounts from every row.
    const renameColumn = (key: string, label: string) =>
        setColumns((current) => current.map((column) => (column.key === key ? { ...column, label } : column)));
    const addColumn = () => setColumns((current) => [...current, { key: nextColumnKey(current), label: '' }]);
    const removeColumn = (key: string) => {
        setColumns((current) => current.filter((column) => column.key !== key));
        setRows((current) =>
            current.map((row) => ({ ...row, amounts: Object.fromEntries(Object.entries(row.amounts).filter(([columnKey]) => columnKey !== key)) }))
        );
    };

    // Single-column statements total each side; columnar ones total each partner's sides separately.
    const totals = sumBySide(
        format,
        rows.map((row) => ({ sectionKey: row.sectionKey, amount: parseAmount(row.amount), isDeduction: row.isDeduction }))
    );
    const sideTotals = format?.sides.map((side) => totals[side.key] ?? 0) ?? [];
    const isBalanced = sideTotals.length > 0 && sideTotals.every((total) => total === sideTotals[0]);
    // Final Accounts: each statement must balance on its own.
    const statementTotals = statements.map((statement) => ({
        statement,
        totals: sumBySide(
            statement,
            rows.map((row) => ({ sectionKey: row.sectionKey, amount: parseAmount(row.amount), isDeduction: row.isDeduction }))
        ),
    }));
    const allStatementsBalanced = statementTotals.every(({ totals: t }) => isBalancedTotals(t));
    const columnTotals = columns.map((column) => ({
        column,
        totals: sumBySide(
            format,
            rows.map((row) => ({ sectionKey: row.sectionKey, amount: parseAmount(row.amounts[column.key] ?? ''), isDeduction: row.isDeduction }))
        ),
    }));
    const allColumnsBalanced = columnTotals.length > 0 && columnTotals.every(({ totals: t }) => isBalancedTotals(t));

    // Checks the columnar key and returns its partner cells, or an error message.
    const buildColumnarKey = (): { cells: { entryId: string; sectionKey: string; amount: number; isDeduction: boolean; columnKey: string }[] } | { error: string } => {
        const noun = columnRule?.noun.toLowerCase() ?? 'partner';
        const labels = columns.map((column) => column.label.trim());
        if (columnRule && (columns.length < columnRule.min || columns.length > columnRule.max)) {
            return { error: `Add ${columnRule.min}–${columnRule.max} ${noun}s.` };
        }
        if (labels.some((label) => !label)) return { error: `Every ${noun} needs a name.` };
        if (new Set(labels.map((label) => label.toLowerCase())).size !== labels.length) return { error: `${noun[0].toUpperCase()}${noun.slice(1)} names must be unique.` };

        const filled = new Set<string>();
        const cells: { entryId: string; sectionKey: string; amount: number; isDeduction: boolean; columnKey: string }[] = [];
        for (const row of rows) {
            if (!validSections.has(row.sectionKey)) return { error: `"${row.entryName}" needs a head from this statement.` };
            const rowCells = columns.filter((column) => (row.amounts[column.key] ?? '').trim() !== '');
            if (rowCells.length === 0) return { error: `"${row.entryName}" needs an amount for at least one ${noun}.` };
            for (const column of rowCells) {
                const amount = parseAmount(row.amounts[column.key]);
                if (amount <= 0) return { error: `"${row.entryName}" needs an amount above zero for ${column.label}.` };
                // One amount per entry per partner, even when the entry appears under two heads.
                const cell = `${row.entryId}|${column.key}`;
                if (filled.has(cell)) return { error: `"${row.entryName}" has two amounts for ${column.label}; keep only one.` };
                filled.add(cell);
                cells.push({ entryId: row.entryId, sectionKey: row.sectionKey, amount, isDeduction: row.isDeduction, columnKey: column.key });
            }
        }
        return { cells };
    };

    const onSubmit = async (values: QuestionValues) => {
        // The key is checked here because it lives outside react-hook-form.
        if (rows.length === 0) return setKeyError('Add at least one entry to the answer key.');

        let answerKey: { entryId: string; sectionKey: string; amount: number; isDeduction: boolean; columnKey?: string }[];
        if (isColumnar) {
            const built = buildColumnarKey();
            if ('error' in built) return setKeyError(built.error);
            answerKey = built.cells;
        } else {
            const incomplete = rows.find((row) => !validSections.has(row.sectionKey) || parseAmount(row.amount) <= 0);
            if (incomplete) return setKeyError(`"${incomplete.entryName}" needs a head from this format and an amount above zero.`);
            // Final Accounts: an entry may appear once in each statement, never twice in the same one.
            const seen = new Set<string>();
            for (const row of rows) {
                const cell = `${row.entryId}|${statementOf.get(row.sectionKey) ?? ''}`;
                if (seen.has(cell)) return setKeyError(`"${row.entryName}" is used twice in one statement; keep only one.`);
                seen.add(cell);
            }
            answerKey = rows.map((row) => ({
                entryId: row.entryId,
                sectionKey: row.sectionKey,
                amount: parseAmount(row.amount),
                isDeduction: row.isDeduction,
            }));
        }
        setKeyError(null);

        const cleanColumns = columns.map((column) => ({ key: column.key, label: column.label.trim() }));
        const payload = {
            board: values.board,
            standard: values.standard,
            subjectId: values.subject,
            chapterId: values.chapter,
            title: values.title.trim(),
            problem: values.problem.trim(),
            format: values.format as AccountingFormatKey,
            timeLimitMinutes: values.timeLimitMinutes ? Number(values.timeLimitMinutes) : null,
            isPublished: values.isPublished,
            answerKey,
        };

        setSaving(true);
        // Create omits a null time limit and unused columns; update sends null to clear either.
        const action: any = questionId
            ? await dispatch(updateAccountingQuestionAction({ id: questionId, ...payload, columns: isColumnar ? cleanColumns : null }))
            : await dispatch(
                createAccountingQuestionAction({
                    ...payload,
                    timeLimitMinutes: payload.timeLimitMinutes ?? undefined,
                    ...(isColumnar && { columns: cleanColumns }),
                })
            );
        setSaving(false);
        if (action?.meta?.requestStatus === 'fulfilled') onSaved();
    };

    return (
        <>
            <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
                {/* Dimmed while the pool modal is open: the shared Dialog's backdrop sits below any open dialog, so it cannot do it. */}
                <DialogContent className={`max-w-5xl gap-0 p-0 transition-[filter] duration-200 ${managePoolOpen ? 'brightness-50' : ''}`}>
                    <DialogHeader className="shrink-0 border-b border-border p-5 pr-14">
                        <DialogTitle>{questionId ? 'Update Accounting Question' : 'Add Accounting Question'}</DialogTitle>
                    </DialogHeader>

                    {loadingQuestion ? (
                        <LoadingState className="py-16" />
                    ) : (
                        <form noValidate onSubmit={handleSubmit(onSubmit)} className="flex min-h-0 flex-1 flex-col">
                            <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto p-5">
                                {/* ---------------- Basic Information ---------------- */}
                                <section className="flex flex-col gap-3">
                                    <h4 className="dc-label">Basic Information</h4>
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                        <FormField id="aq-board" label="Board" required error={errors.board?.message}>
                                            {(aria) => (
                                                <Controller
                                                    name="board"
                                                    control={control}
                                                    render={({ field }) => (
                                                        // The board drives subjects, statement types and the entry pool.
                                                        <CustomDropdown id={aria.id} options={BOARD_OPTIONS} value={field.value} onChange={handleBoardChange} placeholder="Select Board" size="large" />
                                                    )}
                                                />
                                            )}
                                        </FormField>
                                        <FormField id="aq-standard" label="Standard" required error={errors.standard?.message}>
                                            {(aria) => (
                                                <Controller
                                                    name="standard"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <CustomDropdown
                                                            id={aria.id}
                                                            options={STANDARD_OPTIONS}
                                                            value={field.value}
                                                            onChange={(value) => {
                                                                field.onChange(value);
                                                                // Subjects are per standard, so the old choice no longer applies.
                                                                if (value !== field.value) {
                                                                    setValue('subject', '');
                                                                    setValue('chapter', '');
                                                                }
                                                            }}
                                                            placeholder="Select Standard"
                                                            size="large"
                                                        />
                                                    )}
                                                />
                                            )}
                                        </FormField>
                                        <FormField id="aq-subject" label="Subject" required error={errors.subject?.message}>
                                            {(aria) => (
                                                <Controller
                                                    name="subject"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <CustomDropdown
                                                            id={aria.id}
                                                            options={subjectOptions}
                                                            value={field.value}
                                                            onChange={(value) => {
                                                                field.onChange(value);
                                                                setValue('chapter', '');
                                                                if (value) dispatch(getchaptersBySubjectIdAction(value));
                                                            }}
                                                            placeholder={selectedBoard ? 'Select Subject' : 'Select a board first'}
                                                            size="large"
                                                            disabled={!selectedBoard}
                                                        />
                                                    )}
                                                />
                                            )}
                                        </FormField>
                                        <FormField id="aq-chapter" label="Chapter" required error={errors.chapter?.message}>
                                            {(aria) => (
                                                <Controller
                                                    name="chapter"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <CustomDropdown
                                                            id={aria.id}
                                                            options={selectedSubject ? chapterOptions : []}
                                                            value={field.value}
                                                            onChange={field.onChange}
                                                            placeholder="Select Chapter"
                                                            size="large"
                                                            disabled={!selectedSubject}
                                                        />
                                                    )}
                                                />
                                            )}
                                        </FormField>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-[2fr_1.4fr_1fr]">
                                        <FormField id="aq-title" label="Title" required error={errors.title?.message}>
                                            {(aria) => <Input {...aria} {...register('title')} maxLength={255} placeholder="e.g. Balance Sheet of Mr. Mehta" invalid={Boolean(errors.title)} />}
                                        </FormField>
                                        <FormField id="aq-format" label="Statement type" required error={errors.format?.message}>
                                            {(aria) => (
                                                <Controller
                                                    name="format"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <CustomDropdown
                                                            id={aria.id}
                                                            options={formatOptions}
                                                            value={field.value}
                                                            onChange={handleFormatChange}
                                                            placeholder={selectedBoard ? 'Select statement type' : 'Select a board first'}
                                                            size="large"
                                                            disabled={!selectedBoard}
                                                        />
                                                    )}
                                                />
                                            )}
                                        </FormField>
                                        <FormField id="aq-time" label="Time limit (minutes)" error={errors.timeLimitMinutes?.message} hint="Leave blank for untimed">
                                            {(aria) => <Input {...aria} {...register('timeLimitMinutes')} inputMode="numeric" placeholder="e.g. 20" invalid={Boolean(errors.timeLimitMinutes)} />}
                                        </FormField>
                                    </div>

                                    <FormField id="aq-problem" label="Problem (shown to students)" required error={errors.problem?.message} hint="Give the trial balance and adjustments with all figures.">
                                        {(aria) => <Textarea {...aria} {...register('problem')} rows={6} placeholder="Prepare the Balance Sheet of … from the following information:" invalid={Boolean(errors.problem)} />}
                                    </FormField>

                                    <Controller
                                        name="isPublished"
                                        control={control}
                                        render={({ field }) => (
                                            <label className="flex w-fit cursor-pointer items-center gap-2.5 text-sm font-medium text-foreground">
                                                <Checkbox checked={field.value} onCheckedChange={(checked) => field.onChange(checked === true)} />
                                                Published (visible to students)
                                            </label>
                                        )}
                                    />
                                </section>

                                {/* ---------------- Answer Key ---------------- */}
                                <section className="flex flex-col gap-3">
                                    <div className="flex flex-wrap items-end justify-between gap-2">
                                        <h4 className="dc-label">Answer Key ({rows.length} entries)</h4>
                                        <span className="dc-caption">
                                            Every other {selectedBoard ? `${selectedBoard} ` : ''}pool entry is a distractor for students.
                                        </span>
                                    </div>

                                    {keyReady ? (
                                        <>
                                            {/* Partner columns of a columnar statement, e.g. the partners in Capital Accounts. */}
                                            {columnRule && (
                                                <div className="flex flex-col gap-2 rounded-lg border border-border bg-surface p-3">
                                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                                        <span className="text-sm font-semibold text-foreground">
                                                            {columnRule.noun}s ({columns.length} of {columnRule.min}–{columnRule.max})
                                                        </span>
                                                        <Button type="button" size="sm" variant="secondary" onClick={addColumn} disabled={columns.length >= columnRule.max}>
                                                            <UserPlus aria-hidden="true" />
                                                            Add {columnRule.noun.toLowerCase()}
                                                        </Button>
                                                    </div>
                                                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                                                        {columns.map((column, index) => (
                                                            <div key={column.key} className="flex items-center gap-1.5">
                                                                <Input
                                                                    aria-label={`${columnRule.noun} ${index + 1} name`}
                                                                    maxLength={50}
                                                                    placeholder={`${columnRule.noun} ${index + 1} name`}
                                                                    value={column.label}
                                                                    onChange={(event) => renameColumn(column.key, event.target.value)}
                                                                />
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    aria-label={`Remove ${column.label || `${columnRule.noun.toLowerCase()} ${index + 1}`}`}
                                                                    onClick={() => removeColumn(column.key)}
                                                                    disabled={columns.length <= columnRule.min}
                                                                >
                                                                    <X aria-hidden="true" />
                                                                </Button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <p className="dc-caption">
                                                        Leave a {columnRule.noun.toLowerCase()}'s amount blank when the line does not apply to them. An entry may be added twice to
                                                        place it under different heads for different {columnRule.noun.toLowerCase()}s (e.g. an opening debit and credit balance).
                                                    </p>
                                                </div>
                                            )}

                                            {/* Entry picker over the board's pool, with a visible way to add a custom entry. */}
                                            <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
                                                <div className="relative min-w-0 flex-1">
                                                    <Search aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                                    <Input
                                                        aria-label="Search the entry pool to add an entry"
                                                        aria-controls="aq-pool-list"
                                                        aria-expanded={poolListOpen}
                                                        placeholder={`Search ${pool.length} pool entries to add…`}
                                                        className="pl-10"
                                                        value={entrySearch}
                                                        onFocus={() => setPoolListOpen(true)}
                                                        onChange={(event) => {
                                                            setEntrySearch(event.target.value);
                                                            setPoolListOpen(true);
                                                        }}
                                                        onKeyDown={(event) => {
                                                            // Enter adds the first match instead of submitting the form.
                                                            if (event.key === 'Enter') {
                                                                event.preventDefault();
                                                                if (matches[0]) addRow(matches[0]);
                                                            }
                                                        }}
                                                    />
                                                </div>
                                                <Button type="button" variant="secondary" onClick={() => setPoolListOpen((isOpen) => !isOpen)} aria-expanded={poolListOpen} aria-controls="aq-pool-list" className="shrink-0">
                                                    <List aria-hidden="true" />
                                                    {poolListOpen ? 'Hide pool' : 'Browse pool'}
                                                </Button>
                                                <Button type="button" variant="secondary" onClick={openNewEntryForm} aria-expanded={newEntryOpen} className="shrink-0">
                                                    <Plus aria-hidden="true" />
                                                    New entry
                                                </Button>
                                                <Button type="button" variant="secondary" onClick={() => setManagePoolOpen(true)} className="shrink-0">
                                                    <Settings2 aria-hidden="true" />
                                                    Manage pool
                                                </Button>
                                            </div>

                                            {/* Inline rather than a floating popup, so it is never clipped by the dialog's scroll area. */}
                                            {poolListOpen && (
                                                <div id="aq-pool-list" className="rounded-lg border border-border bg-white">
                                                    <p className="border-b border-border px-3 py-2 text-xs text-muted-foreground">
                                                        {query ? `${matches.length} matching "${entrySearch.trim()}"` : `${matches.length} entries available`} · click an entry to add it to the answer key
                                                    </p>
                                                    <div className="dc-scroll max-h-64 overflow-y-auto p-1">
                                                        {matches.map((entry) => (
                                                            <button
                                                                key={entry.id}
                                                                type="button"
                                                                onClick={() => addRow(entry)}
                                                                className="flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-left text-sm hover:bg-muted focus-visible:bg-muted focus-visible:outline-none"
                                                            >
                                                                <span>{entry.name}</span>
                                                                {entry.category && <span className="text-xs text-muted-foreground">{entry.category}</span>}
                                                            </button>
                                                        ))}
                                                        {query && !exactMatch && (
                                                            <button
                                                                type="button"
                                                                disabled={creatingEntry}
                                                                onClick={() => createAndAddEntry(entrySearch.trim())}
                                                                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-medium text-primary hover:bg-muted focus-visible:bg-muted focus-visible:outline-none"
                                                            >
                                                                <Plus aria-hidden="true" className="size-4" />
                                                                Add "{entrySearch.trim()}" to the pool
                                                            </button>
                                                        )}
                                                        {!query && matches.length === 0 && (
                                                            <p className="px-3 py-4 text-center text-sm text-muted-foreground">Every pool entry is already in this answer key.</p>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                            <p className="dc-caption">Browse the pool or type to search. Can't find an entry? Use “New entry” to add a custom entry to the shared pool.</p>

                                            {/* A plain div, not a form — it sits inside the question form, and forms cannot nest. */}
                                            {newEntryOpen && (
                                                <div className="flex flex-col gap-3 rounded-lg border border-primary/30 bg-accent/40 p-3 sm:flex-row sm:items-start">
                                                    <FormField id="aq-new-entry-name" label="Entry name" required error={newEntryError ?? undefined} className="flex-1">
                                                        {(aria) => (
                                                            <Input
                                                                {...aria}
                                                                autoFocus
                                                                maxLength={191}
                                                                placeholder="e.g. Loan from Mrs. Mehta"
                                                                value={newEntryName}
                                                                invalid={Boolean(newEntryError)}
                                                                onChange={(event) => {
                                                                    setNewEntryName(event.target.value);
                                                                    setNewEntryError(null);
                                                                }}
                                                                onKeyDown={(event) => {
                                                                    // Enter saves the entry instead of submitting the whole question.
                                                                    if (event.key === 'Enter') {
                                                                        event.preventDefault();
                                                                        submitNewEntry();
                                                                    }
                                                                }}
                                                            />
                                                        )}
                                                    </FormField>
                                                    <FormField id="aq-new-entry-category" label="Category" hint="Optional, admin-only" className="sm:w-48">
                                                        {(aria) => (
                                                            <Input {...aria} maxLength={50} placeholder="e.g. LIABILITY" value={newEntryCategory} onChange={(event) => setNewEntryCategory(event.target.value)} />
                                                        )}
                                                    </FormField>
                                                    <div className="flex gap-2 sm:pt-[26px]">
                                                        <Button type="button" variant="secondary" onClick={() => setNewEntryOpen(false)} disabled={creatingEntry}>
                                                            Cancel
                                                        </Button>
                                                        <Button type="button" onClick={submitNewEntry} disabled={creatingEntry}>
                                                            {creatingEntry ? <Spinner /> : <Plus aria-hidden="true" />}
                                                            Add to pool & key
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}

                                            {rows.length > 0 && (
                                                <ul className="flex flex-col gap-2">
                                                    {rows.map((row) =>
                                                        isColumnar ? (
                                                            // Columnar row: head and sign apply to the whole line, with one amount per partner.
                                                            <li key={row.rowId} className="flex flex-col gap-2 rounded-lg border border-border p-2.5">
                                                                <div className="grid grid-cols-1 items-center gap-2 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1.6fr)_auto_auto]">
                                                                    <span className="break-words text-sm font-medium">{row.entryName}</span>
                                                                    <CustomDropdown
                                                                        options={sectionOptions}
                                                                        value={validSections.has(row.sectionKey) ? row.sectionKey : ''}
                                                                        onChange={(value) => updateRowSection(row.rowId, value)}
                                                                        placeholder="Select head"
                                                                    />
                                                                    <Button
                                                                        type="button"
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        aria-pressed={row.isDeduction}
                                                                        onClick={() => updateRow(row.rowId, { isDeduction: !row.isDeduction })}
                                                                        className={row.isDeduction ? 'text-destructive' : 'text-muted-foreground'}
                                                                    >
                                                                        {row.isDeduction ? <MinusCircle aria-hidden="true" /> : <PlusCircle aria-hidden="true" />}
                                                                        {row.isDeduction ? 'Less' : 'Add'}
                                                                    </Button>
                                                                    <Button
                                                                        type="button"
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        aria-label={`Remove ${row.entryName}`}
                                                                        onClick={() => setRows((current) => current.filter((r) => r.rowId !== row.rowId))}
                                                                    >
                                                                        <Trash2 aria-hidden="true" className="text-destructive" />
                                                                    </Button>
                                                                </div>
                                                                <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-6">
                                                                    {columns.map((column) => (
                                                                        <label key={column.key} className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
                                                                            {column.label || column.key}
                                                                            <Input
                                                                                aria-label={`Amount for ${row.entryName}, ${column.label || column.key}`}
                                                                                inputMode="decimal"
                                                                                placeholder="—"
                                                                                className="dc-numeric text-right"
                                                                                value={row.amounts[column.key] ?? ''}
                                                                                onChange={(event) => {
                                                                                    const value = event.target.value.replace(/,/g, '');
                                                                                    if (AMOUNT_PATTERN.test(value)) updateRowAmount(row.rowId, column.key, value);
                                                                                }}
                                                                            />
                                                                        </label>
                                                                    ))}
                                                                </div>
                                                            </li>
                                                        ) : (
                                                            <li key={row.rowId} className="grid grid-cols-1 items-center gap-2 rounded-lg border border-border p-2.5 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1.6fr)_auto_9rem_auto]">
                                                                <span className="break-words text-sm font-medium">{row.entryName}</span>
                                                                <CustomDropdown
                                                                    options={sectionOptions}
                                                                    value={validSections.has(row.sectionKey) ? row.sectionKey : ''}
                                                                    onChange={(value) => updateRowSection(row.rowId, value)}
                                                                    placeholder="Select head"
                                                                />
                                                                {/* Hidden under heads without "Less" lines (most Final Accounts heads); the empty cell keeps the grid aligned.
                                                                    A head with a fixed sign shows that sign as plain text, since it cannot be changed. */}
                                                                {sectionSign(format, row.sectionKey) ? (
                                                                    <span className={cn('px-2 text-xs font-medium', row.isDeduction ? 'text-destructive' : 'text-muted-foreground')}>
                                                                        {row.isDeduction ? 'Less' : 'Add'}
                                                                    </span>
                                                                ) : sectionAllowsDeduction(format, row.sectionKey) ? (
                                                                    <Button
                                                                        type="button"
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        aria-pressed={row.isDeduction}
                                                                        onClick={() => updateRow(row.rowId, { isDeduction: !row.isDeduction })}
                                                                        className={row.isDeduction ? 'text-destructive' : 'text-muted-foreground'}
                                                                    >
                                                                        {row.isDeduction ? <MinusCircle aria-hidden="true" /> : <PlusCircle aria-hidden="true" />}
                                                                        {row.isDeduction ? 'Less' : 'Add'}
                                                                    </Button>
                                                                ) : (
                                                                    <span aria-hidden="true" />
                                                                )}
                                                                <Input
                                                                    aria-label={`Amount for ${row.entryName}`}
                                                                    inputMode="decimal"
                                                                    placeholder="Amount"
                                                                    className="dc-numeric text-right"
                                                                    value={row.amount}
                                                                    onChange={(event) => {
                                                                        const value = event.target.value.replace(/,/g, '');
                                                                        if (AMOUNT_PATTERN.test(value)) updateRow(row.rowId, { amount: value });
                                                                    }}
                                                                />
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    aria-label={`Remove ${row.entryName}`}
                                                                    onClick={() => setRows((current) => current.filter((r) => r.rowId !== row.rowId))}
                                                                >
                                                                    <Trash2 aria-hidden="true" className="text-destructive" />
                                                                </Button>
                                                            </li>
                                                        )
                                                    )}
                                                </ul>
                                            )}

                                            {/* Final Accounts: every statement must balance on its own. */}
                                            {format && rows.length > 0 && isMultiStatement && (
                                                <Alert
                                                    variant={allStatementsBalanced ? 'success' : 'warning'}
                                                    title={allStatementsBalanced ? 'Every statement balances' : 'Some statements do not balance yet'}
                                                    description={statementTotals
                                                        .map(({ statement, totals: t }) => `${statement.label}: ${statement.sides.map((side) => `${side.label} ${formatAmount(t[side.key] ?? 0)}`).join(' / ')}`)
                                                        .join('  ·  ')}
                                                />
                                            )}
                                            {/* A working note has nothing to balance, so its alert shows the result the key works out to. */}
                                            {format && rows.length > 0 && isComputation(format) && (
                                                <Alert
                                                    variant="info"
                                                    title="The answer key works out to"
                                                    description={format.sides
                                                        .map((side, index) => `${side.totalLabel ?? side.label}: ${formatSignedAmount(sideTotals[index], format.negativesInBrackets === true)}`)
                                                        .join('  ·  ')}
                                                />
                                            )}
                                            {format && rows.length > 0 && !isColumnar && !isMultiStatement && !isComputation(format) && (
                                                <Alert
                                                    variant={isBalanced ? 'success' : 'warning'}
                                                    title={isBalanced ? 'The answer key balances' : 'The answer key does not balance yet'}
                                                    description={format.sides.map((side, index) => `${side.label}: ${formatAmount(sideTotals[index])}`).join('  ·  ')}
                                                />
                                            )}
                                            {/* Each partner's account must balance on its own. */}
                                            {format && rows.length > 0 && isColumnar && (
                                                <Alert
                                                    variant={allColumnsBalanced ? 'success' : 'warning'}
                                                    title={allColumnsBalanced ? "Every partner's account balances" : "Some partners' accounts do not balance yet"}
                                                    description={columnTotals
                                                        .map(({ column, totals: t }) => `${column.label || column.key}: ${format.sides.map((side) => `${side.label} ${formatAmount(t[side.key] ?? 0)}`).join(' / ')}`)
                                                        .join('  ·  ')}
                                                />
                                            )}
                                        </>
                                    ) : (
                                        <p className="rounded-lg border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
                                            Choose a board and a statement type to build the answer key from that board's entry pool.
                                        </p>
                                    )}
                                    {keyError && (
                                        <p role="alert" className="text-sm font-medium text-destructive">
                                            {keyError}
                                        </p>
                                    )}
                                </section>
                            </div>

                            <DialogFooter className="shrink-0 border-t border-border p-5">
                                <Button variant="secondary" onClick={onClose} disabled={saving}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={saving}>
                                    {saving && <Spinner />}
                                    {saving ? 'Saving...' : questionId ? 'Update Question' : 'Add Question'}
                                </Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>

            {/* Rendered beside the builder, not inside its form, so no click there can submit the question. */}
            {selectedBoard && (
                <LedgerEntriesDialog
                    open={managePoolOpen}
                    onClose={handleManagePoolClose}
                    protectedEntryIds={rows.map((row) => row.entryId)}
                    board={selectedBoard}
                />
            )}

            {/* Asked before a board or statement-type change throws away the answer key. */}
            <ConfirmDialog
                open={pendingChange !== null}
                onOpenChange={(isOpen) => !isOpen && setPendingChange(null)}
                variant="warning"
                title={pendingChange?.field === 'board' ? 'Change the board?' : 'Change the statement type?'}
                description={
                    pendingChange?.field === 'board'
                        ? "Entries belong to one board's pool, so the answer key, subject and chapter will be cleared."
                        : 'This statement type uses a different number of amount columns, so the answer key will be cleared.'
                }
                confirmLabel="Change and clear"
                cancelLabel="Keep current"
                onConfirm={confirmPendingChange}
            />
        </>
    );
};

export { AccountingQuestionDialog };
