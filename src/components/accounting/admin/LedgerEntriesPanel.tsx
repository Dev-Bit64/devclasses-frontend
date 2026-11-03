/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Copy, Pencil, Plus, Search, Trash2, Upload } from 'lucide-react';
import { AppDispatch, RootState } from '../../../redux/store';
import {
    addLedgerEntryAction,
    copyLedgerEntriesAction,
    deleteLedgerEntriesAction,
    getLedgerEntriesAction,
    importLedgerEntriesAction,
    updateLedgerEntryAction,
} from '../../../redux/action/accountingAction';
import { AccountingBoard, LedgerEntry } from '../../../interfaces/interfaces';
import { BOARD_OPTIONS } from '../accountingUtils';
import CustomDropdown from '../../ImportModal/CustomDropdown';
import { DataTable, type DataTableColumn } from '../../common/DataTable';
import { ConfirmDialog } from '../../common/ConfirmDialog';
import { FileDropzone } from '../../common/FileDropzone';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Card } from '../../ui/card';
import { Input } from '../../ui/input';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Spinner } from '../../ui/spinner';
import { FormField } from '../../ui/form-field';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../ui/tooltip';
import { toastText } from '../../../utils/toast';

const PAGE_SIZE = 20;

// Same accept list and limits as the MCQ question import.
const EXCEL_ACCEPT = '.xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel';

const validateExcel = (file: File): string | null => {
    const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');
    if (!isExcel) {
        toastText('Please upload only Excel files (.xlsx or .xls)', 'error');
        return 'Invalid File Type';
    }
    if (file.size / 1024 / 1024 >= 5) {
        toastText('File size must be smaller than 5MB', 'error');
        return 'File Too Large';
    }
    return null;
};

// Import target: one board, or the same sheet into both boards' pools.
type ImportTarget = AccountingBoard | 'BOTH';

export interface LedgerEntriesPanelProps {
    // Entries in an answer key that is still being edited (not yet saved), so the server cannot protect them.
    protectedEntryIds?: string[];
    // Locks the panel to one board's pool (the question being built); omitted shows a board switch.
    board?: AccountingBoard;
}

/** Admin view of the per-board ledger-entry pools that accounting questions draw from. */
const LedgerEntriesPanel = ({ protectedEntryIds = [], board }: LedgerEntriesPanelProps) => {
    const dispatch = useDispatch<AppDispatch>();
    const { ledgerEntries, ledgerTotalRecords, isLoading } = useSelector((state: RootState) => state.accounting);

    const [selectedBoard, setSelectedBoard] = useState<AccountingBoard>(board ?? 'GSEB');
    // A locked board always wins over the switch.
    const activeBoard = board ?? selectedBoard;
    const otherBoard: AccountingBoard = activeBoard === 'GSEB' ? 'CBSE' : 'GSEB';

    const [page, setPage] = useState(1);
    const [searchText, setSearchText] = useState('');
    const [appliedSearch, setAppliedSearch] = useState('');
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [editing, setEditing] = useState<LedgerEntry | null>(null);
    const [formOpen, setFormOpen] = useState(false);
    const [name, setName] = useState('');
    const [category, setCategory] = useState('');
    const [nameError, setNameError] = useState<string | null>(null);
    const [importOpen, setImportOpen] = useState(false);
    const [importTarget, setImportTarget] = useState<ImportTarget>(activeBoard);
    const [file, setFile] = useState<File | null>(null);
    const [busy, setBusy] = useState(false);

    const reload = useCallback(
        () => dispatch(getLedgerEntriesAction({ board: activeBoard, page, limit: PAGE_SIZE, search: appliedSearch || undefined })),
        [dispatch, activeBoard, page, appliedSearch]
    );

    // Switching boards starts from the first page with nothing selected.
    const changeBoard = (value: AccountingBoard) => {
        setSelectedBoard(value);
        setPage(1);
        setSelectedRowKeys([]);
    };

    useEffect(() => {
        reload();
    }, [reload]);

    const openForm = (entry: LedgerEntry | null) => {
        setEditing(entry);
        setName(entry?.name ?? '');
        setCategory(entry?.category ?? '');
        setNameError(null);
        setFormOpen(true);
    };

    const handleSave = async () => {
        const trimmed = name.trim();
        if (!trimmed) return setNameError('Please enter the entry name');
        setBusy(true);
        const action: any = editing
            ? await dispatch(updateLedgerEntryAction({ id: editing.id, name: trimmed, category: category.trim() }))
            : await dispatch(addLedgerEntryAction({ board: activeBoard, name: trimmed, category: category.trim() || undefined }));
        setBusy(false);
        if (action?.meta?.requestStatus === 'fulfilled') {
            setFormOpen(false);
            reload();
        }
    };

    const handleDelete = async (ids: string[]) => {
        const action: any = await dispatch(deleteLedgerEntriesAction(ids));
        if (action?.meta?.requestStatus === 'fulfilled') reload();
    };

    // Copies the selected entries into the other board's pool; names already there are skipped.
    const handleCopy = async () => {
        setBusy(true);
        const action: any = await dispatch(copyLedgerEntriesAction({ ids: selectedRowKeys as string[], toBoard: otherBoard }));
        setBusy(false);
        if (action?.meta?.requestStatus === 'fulfilled') setSelectedRowKeys([]);
    };

    const openImport = () => {
        setImportTarget(activeBoard);
        setImportOpen(true);
    };

    const handleImport = async () => {
        if (!file) return;
        const formData = new FormData();
        formData.append('file', file);
        formData.append('board', importTarget);
        setBusy(true);
        const action: any = await dispatch(importLedgerEntriesAction(formData));
        setBusy(false);
        if (action?.meta?.requestStatus === 'fulfilled') {
            setImportOpen(false);
            setFile(null);
            reload();
        }
    };

    const applySearch = () => {
        setPage(1);
        setAppliedSearch(searchText.trim());
    };

    const columns: DataTableColumn<LedgerEntry>[] = [
        { key: 'name', title: 'Entry', dataIndex: 'name', render: (value) => <span className="break-words font-medium">{value}</span> },
        { key: 'category', title: 'Category', dataIndex: 'category', hideBelow: 'sm', render: (value) => (value ? <Badge variant="outline">{value}</Badge> : '—') },
        { key: 'used', title: 'Used in', align: 'center', hideBelow: 'md', render: (_, record) => `${record.usedInQuestions ?? 0} question(s)` },
        {
            key: 'actions',
            title: 'Actions',
            align: 'center',
            width: 110,
            render: (_, record) => (
                <TooltipProvider delayDuration={150}>
                    <div className="flex items-center justify-center gap-1">
                        <Button variant="ghost" size="icon" aria-label={`Edit ${record.name}`} onClick={() => openForm(record)}>
                            <Pencil aria-hidden="true" />
                        </Button>
                        {record.usedInQuestions || protectedEntryIds.includes(record.id) ? (
                            // Entries in an answer key are protected; the server enforces the same rule for saved keys.
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <span tabIndex={0} className="inline-flex">
                                        <Button variant="ghost" size="icon" aria-label={`${record.name} is used in a question`} disabled>
                                            <Trash2 aria-hidden="true" />
                                        </Button>
                                    </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                    {protectedEntryIds.includes(record.id)
                                        ? "In this question's answer key — remove it there first"
                                        : 'Used in a question — remove it there first'}
                                </TooltipContent>
                            </Tooltip>
                        ) : (
                            <ConfirmDialog
                                variant="destructive"
                                title={`Delete "${record.name}"?`}
                                description="This action cannot be undone."
                                confirmLabel="Yes"
                                cancelLabel="No"
                                onConfirm={() => handleDelete([record.id])}
                                trigger={
                                    <Button variant="ghost" size="icon" aria-label={`Delete ${record.name}`}>
                                        <Trash2 aria-hidden="true" className="text-destructive" />
                                    </Button>
                                }
                            />
                        )}
                    </div>
                </TooltipProvider>
            ),
        },
    ];

    return (
        <div className="flex flex-col gap-4">
            {/* Each board keeps its own pool; the switch is hidden when the board is fixed by the question. */}
            <div className="flex flex-wrap items-center justify-between gap-2">
                {board ? (
                    <p className="dc-small">
                        Showing the <strong>{board}</strong> entry pool used by this question.
                    </p>
                ) : (
                    <div role="group" aria-label="Board" className="inline-flex rounded-lg border border-border bg-white p-1">
                        {BOARD_OPTIONS.map((option) => (
                            <Button
                                key={option.value}
                                type="button"
                                size="sm"
                                variant={activeBoard === option.value ? 'primary' : 'ghost'}
                                aria-pressed={activeBoard === option.value}
                                onClick={() => changeBoard(option.value)}
                            >
                                {option.label} pool
                            </Button>
                        ))}
                    </div>
                )}
                {selectedRowKeys.length > 0 && (
                    <Button type="button" variant="secondary" onClick={handleCopy} disabled={busy}>
                        {busy ? <Spinner /> : <Copy aria-hidden="true" />}
                        Copy {selectedRowKeys.length} to {otherBoard}
                    </Button>
                )}
            </div>

            <Card className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                <div className="flex w-full items-center gap-2 sm:max-w-md">
                    <div className="relative min-w-0 flex-1">
                        <Search aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            aria-label="Search entries"
                            placeholder="Search entries..."
                            className="pl-10"
                            value={searchText}
                            onChange={(event) => setSearchText(event.target.value)}
                            onKeyDown={(event) => event.key === 'Enter' && applySearch()}
                        />
                    </div>
                    <Button onClick={applySearch}>
                        <Search aria-hidden="true" />
                        <span className="hidden sm:inline">Search</span>
                    </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button variant="secondary" onClick={openImport}>
                        <Upload aria-hidden="true" />
                        Import
                    </Button>
                    <Button onClick={() => openForm(null)}>
                        <Plus aria-hidden="true" />
                        Add Entry
                    </Button>
                </div>
            </Card>

            <DataTable<LedgerEntry>
                columns={columns}
                dataSource={ledgerEntries}
                rowKey="id"
                loading={isLoading && ledgerEntries.length === 0}
                skeletonRows={5}
                emptyTitle={`The ${activeBoard} entry pool is empty`}
                emptyDescription="Add entries one by one, import them from Excel, or copy them from the other board."
                rowSelection={{ selectedRowKeys, onChange: (keys) => setSelectedRowKeys(keys) }}
                pagination={{
                    current: page,
                    pageSize: PAGE_SIZE,
                    total: ledgerTotalRecords,
                    onChange: (p) => setPage(p),
                    showTotal: (t, range) => `${range[0]}-${range[1]} of ${t} entries`,
                }}
            />

            {/* Add / edit one entry */}
            <Dialog open={formOpen} onOpenChange={setFormOpen}>
                <DialogContent className="gap-0 p-0">
                    <DialogHeader className="border-b border-border p-5 pr-14">
                        <DialogTitle>{editing ? 'Update Entry' : `Add Entry to ${activeBoard}`}</DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col gap-4 p-5">
                        <FormField id="le-name" label="Entry name" required error={nameError ?? undefined}>
                            {(aria) => (
                                <Input {...aria} value={name} maxLength={191} placeholder="e.g. Sundry Creditors" onChange={(event) => setName(event.target.value)} invalid={Boolean(nameError)} />
                            )}
                        </FormField>
                        <FormField id="le-category" label="Category" hint="Admin-only label, never shown to students (e.g. ASSET, LIABILITY).">
                            {(aria) => <Input {...aria} value={category} maxLength={50} onChange={(event) => setCategory(event.target.value)} />}
                        </FormField>
                    </div>
                    <DialogFooter className="border-t border-border p-5">
                        <Button variant="secondary" onClick={() => setFormOpen(false)} disabled={busy}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={busy}>
                            {busy && <Spinner />}
                            {editing ? 'Update Entry' : 'Add Entry'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Excel import */}
            <Dialog open={importOpen} onOpenChange={(open) => { setImportOpen(open); if (!open) setFile(null); }}>
                <DialogContent className="gap-0 p-0">
                    <DialogHeader className="border-b border-border p-5 pr-14">
                        <DialogTitle>Import Entries</DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col gap-3 p-5">
                        <p className="dc-small">
                            The first sheet needs a <strong>name</strong> column and may have a <strong>category</strong> column.
                            Entries already in the pool are skipped.
                        </p>
                        <FormField id="le-import-board" label="Import into" required>
                            {(aria) => (
                                <CustomDropdown
                                    id={aria.id}
                                    options={[
                                        { label: `${activeBoard} pool`, value: activeBoard },
                                        { label: `${otherBoard} pool`, value: otherBoard },
                                        { label: 'Both GSEB and CBSE pools', value: 'BOTH' },
                                    ]}
                                    value={importTarget}
                                    onChange={(value) => setImportTarget(value as ImportTarget)}
                                />
                            )}
                        </FormField>
                        <FileDropzone
                            file={file}
                            onFileSelect={setFile}
                            onRemove={() => setFile(null)}
                            accept={EXCEL_ACCEPT}
                            validate={validateExcel}
                            hint="Excel only (.xlsx or .xls), up to 5MB"
                        />
                    </div>
                    <DialogFooter className="border-t border-border p-5">
                        <Button variant="secondary" onClick={() => setImportOpen(false)} disabled={busy}>
                            Cancel
                        </Button>
                        <Button onClick={handleImport} disabled={!file || busy}>
                            {busy ? <Spinner /> : <Upload aria-hidden="true" />}
                            Import
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export { LedgerEntriesPanel };
