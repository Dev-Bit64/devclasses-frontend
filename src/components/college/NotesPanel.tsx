/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Key } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ExternalLink, Eye, FileText, Pencil, Plus, Trash2, Type } from 'lucide-react';

import { AppDispatch, RootState } from '../../redux/store';
import {
    addCollegeNoteAction,
    deleteCollegeNoteAction,
    getCollegeNotePreviewUrlAction,
    getCollegeNoteUploadUrlAction,
    getCollegeNotesAction,
    updateCollegeNoteAction,
} from '../../redux/action/collegeContentAction';
import { CollegeNote, CollegeNotePreview } from '../../interfaces/interfaces';

import { ConfirmDialog } from '../common/ConfirmDialog';
import { DataTable, DataTableColumn } from '../common/DataTable';
import { FileDropzone } from '../common/FileDropzone';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Alert } from '../ui/alert';
import { Progress } from '../ui/progress';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import { Spinner } from '../ui/spinner';
import { FormField } from '../ui/form-field';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '../ui/dialog';
import { uploadToSignedUrl } from '../../utils/signedUpload';
import { toastText } from '../../utils/toast';
import { ChapterContentPanelProps } from './panelTypes';

// Mirrors the server-side allow-list, so a bad file is refused before anything is signed.
const NOTE_TYPES = ['application/pdf'];

const noteSchema = z
    .object({
        title: z.string().trim().min(1, 'Please enter a note title'),
        // A note is one thing or the other, never both — the same rule the API enforces.
        kind: z.enum(['FILE', 'TEXT']),
        contentHtml: z.string().optional(),
        orderIndex: z.coerce.number().int('Order must be a whole number').min(0, 'Order must be zero or greater'),
        isPublished: z.boolean(),
    })
    .refine((v) => v.kind !== 'TEXT' || Boolean(v.contentHtml?.trim()), {
        message: 'Please write the note, or switch to uploading a PDF',
        path: ['contentHtml'],
    });
type NoteValues = z.infer<typeof noteSchema>;

/** True when the row is a stored PDF rather than text written in the portal. */
const isFileNote = (note: CollegeNote) => Boolean(note.storageKey);

/**
 * Notes tab of the chapter content screen.
 * The chapter is chosen once by the page above; this panel only owns the notes hanging off it.
 */
const NotesPanel = ({ chapterId, onCountChange }: ChapterContentPanelProps) => {
    const dispatch = useDispatch<AppDispatch>();
    const { isLoading } = useSelector((state: RootState) => state.collegeContent);

    const [notes, setNotes] = useState<CollegeNote[]>([]);
    const [selectedKeys, setSelectedKeys] = useState<Key[]>([]);

    const [modalOpen, setModalOpen] = useState(false);
    const [editingNote, setEditingNote] = useState<CollegeNote | null>(null);
    const [noteFile, setNoteFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadPercent, setUploadPercent] = useState(0);
    const [submitLoading, setSubmitLoading] = useState(false);

    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [preview, setPreview] = useState<CollegeNotePreview | null>(null);
    // A text note has nothing to sign, so its preview is rendered from the row itself.
    const [textPreview, setTextPreview] = useState<CollegeNote | null>(null);

    const form = useForm<NoteValues>({
        resolver: zodResolver(noteSchema),
        defaultValues: { title: '', kind: 'FILE', contentHtml: '', orderIndex: 0, isPublished: false },
    });

    const kind = form.watch('kind');

    // Kept in a ref so reporting the count never re-runs the loader below.
    const onCountChangeRef = useRef(onCountChange);
    useEffect(() => {
        onCountChangeRef.current = onCountChange;
    }, [onCountChange]);

    // ---- Loaders -----------------------------------------------------------

    const fetchNotes = useCallback(async (id: string) => {
        const result: any = await dispatch(getCollegeNotesAction(id));
        if (result.payload && result.payload.statusCode === 200) {
            const rows = result.payload.data ?? [];
            setNotes(rows);
            onCountChangeRef.current?.(rows.length);
        }
    }, [dispatch]);

    useEffect(() => {
        setSelectedKeys([]);
        if (chapterId) {
            fetchNotes(chapterId);
        } else {
            setNotes([]);
        }
    }, [chapterId, fetchNotes]);

    // ---- Add / edit --------------------------------------------------------

    const openAdd = () => {
        if (!chapterId) {
            toastText('Please select a chapter first', 'error');
            return;
        }
        setEditingNote(null);
        setNoteFile(null);
        setUploadPercent(0);
        form.reset({
            title: '', kind: 'FILE', contentHtml: '',
            orderIndex: notes.length, isPublished: false,
        });
        setModalOpen(true);
    };

    const openEdit = (record: CollegeNote) => {
        setEditingNote(record);
        setNoteFile(null);
        setUploadPercent(0);
        form.reset({
            title: record.title,
            kind: isFileNote(record) ? 'FILE' : 'TEXT',
            contentHtml: record.contentHtml ?? '',
            orderIndex: record.orderIndex,
            isPublished: record.isPublished,
        });
        setModalOpen(true);
    };

    const uploadNoteFile = async (file: File): Promise<string | null> => {
        const signed: any = await dispatch(getCollegeNoteUploadUrlAction({
            chapterId, fileName: file.name, contentType: file.type,
        }));
        if (!signed.payload || signed.payload.statusCode !== 200) return null;

        setUploading(true);
        setUploadPercent(0);
        await uploadToSignedUrl(signed.payload.data.uploadUrl, file, setUploadPercent);
        return signed.payload.data.storageKey;
    };

    const submitNote = async (values: NoteValues) => {
        const keepsExistingFile = values.kind === 'FILE' && editingNote && isFileNote(editingNote);

        // A PDF note with no file anywhere would be a dead row in the app.
        if (values.kind === 'FILE' && !noteFile && !keepsExistingFile) {
            toastText('Please choose a PDF file to upload', 'error');
            return;
        }

        setSubmitLoading(true);
        try {
            let storageKey: string | undefined;

            if (values.kind === 'FILE' && noteFile) {
                const key = await uploadNoteFile(noteFile);
                if (!key) return;
                storageKey = key;
            }
            setUploading(false);

            // Whichever kind was chosen, the other side is cleared explicitly — otherwise a
            // note that used to be a PDF would keep serving one alongside its new text.
            // (The replaced object itself stays in storage, exactly as a replaced video does;
            // only deleting the row removes files.)
            const shared = {
                title: values.title,
                orderIndex: values.orderIndex,
                isPublished: values.isPublished,
                ...(values.kind === 'TEXT'
                    ? { contentHtml: values.contentHtml, storageKey: '' }
                    : { contentHtml: '', ...(storageKey ? { storageKey } : {}) }),
            };

            const result: any = editingNote
                ? await dispatch(updateCollegeNoteAction({ noteId: editingNote.id, ...shared }))
                : await dispatch(addCollegeNoteAction({ chapterId, ...shared }));

            if (result.payload && result.payload.statusCode === 200) {
                toastText(editingNote ? 'Note updated successfully' : 'Note added successfully', 'success');
                setModalOpen(false);
                setNoteFile(null);
                fetchNotes(chapterId);
            }
        } catch (error: any) {
            // Storage errors never reach the redux slice — the PUT bypasses axios entirely.
            toastText(error?.message ?? 'Upload failed. Please try again.', 'error');
        } finally {
            setUploading(false);
            setSubmitLoading(false);
        }
    };

    const handleDelete = async (ids: string[]) => {
        const result: any = await dispatch(deleteCollegeNoteAction({ ids }));
        if (result.payload && result.payload.statusCode === 200) {
            toastText(ids.length > 1 ? 'Notes deleted successfully' : 'Note deleted successfully', 'success');
            setSelectedKeys([]);
            fetchNotes(chapterId);
        }
    };

    // ---- Preview -----------------------------------------------------------

    const openPreview = async (record: CollegeNote) => {
        if (!isFileNote(record)) {
            setTextPreview(record);
            return;
        }

        setPreview(null);
        setPreviewOpen(true);
        setPreviewLoading(true);
        try {
            const result: any = await dispatch(getCollegeNotePreviewUrlAction(record.id));
            if (result.payload && result.payload.statusCode === 200) {
                setPreview(result.payload.data);
            }
        } finally {
            setPreviewLoading(false);
        }
    };

    // ---- Rendering ---------------------------------------------------------

    const statusBadge = (published: boolean) =>
        published
            ? <Badge variant="success">Published</Badge>
            : <Badge variant="outline">Draft</Badge>;

    const kindBadge = (record: CollegeNote) =>
        isFileNote(record)
            ? <Badge variant="outline"><FileText aria-hidden="true" /> PDF</Badge>
            : <Badge variant="outline"><Type aria-hidden="true" /> Written</Badge>;

    const columns: DataTableColumn<CollegeNote>[] = useMemo(
        () => [
            { key: 'orderIndex', title: 'Order', dataIndex: 'orderIndex', width: 80, align: 'center' },
            {
                key: 'title',
                title: 'Note',
                dataIndex: 'title',
                render: (_: any, record: CollegeNote) => (
                    <div className="flex min-w-0 flex-col">
                        <span className="truncate font-medium">{record.title}</span>
                        {record.contentHtml && (
                            <span className="truncate text-xs text-muted-foreground">{record.contentHtml}</span>
                        )}
                    </div>
                ),
            },
            {
                key: 'kind',
                title: 'Kind',
                width: 130,
                align: 'center',
                render: (_: any, record: CollegeNote) => kindBadge(record),
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
                render: (_: any, record: CollegeNote) => (
                    <div className="flex items-center justify-center gap-1">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button size="icon" variant="ghost" onClick={() => openPreview(record)}>
                                    <Eye className="size-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                {isFileNote(record) ? 'Open the PDF' : 'Read the note'}
                            </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button size="icon" variant="ghost" onClick={() => openEdit(record)}>
                                    <Pencil className="size-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Edit note</TooltipContent>
                        </Tooltip>

                        <ConfirmDialog
                            title="Delete this note?"
                            description="An uploaded PDF is removed from storage as well. Students who bought the chapter will no longer see it."
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
        [notes, chapterId]
    );

    return (
        <div className="flex flex-col gap-5">
            {/* The tab owns its own action, since the page header now covers all three tabs. */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="dc-small">
                    Reading material for the mobile app. Upload a PDF, or write the note here.
                </p>
                <Button onClick={openAdd} disabled={!chapterId}>
                    <Plus className="size-4" /> Add Note
                </Button>
            </div>

            {selectedKeys.length > 0 && (
                <div className="flex flex-wrap items-center gap-3">
                    <span className="text-sm text-muted-foreground">{selectedKeys.length} selected</span>
                    <ConfirmDialog
                        title={`Delete ${selectedKeys.length} note(s)?`}
                        description="Any uploaded PDFs are removed from storage as well. This cannot be undone."
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

            <DataTable<CollegeNote>
                columns={columns}
                dataSource={notes}
                rowKey="id"
                loading={isLoading}
                rowSelection={{
                    selectedRowKeys: selectedKeys,
                    onChange: (keys) => setSelectedKeys(keys),
                }}
                emptyTitle="No notes yet"
                emptyDescription="Add the first note for this chapter."
                emptyAction={
                    <Button onClick={openAdd}>
                        <Plus className="size-4" /> Add Note
                    </Button>
                }
                // Below `md` the table becomes cards, so every action the row offers has
                // to be repeated here or it becomes desktop-only.
                renderMobileCard={(record) => (
                    <Card className="flex flex-col gap-3 p-4">
                        <div className="flex min-w-0 flex-col gap-1">
                            <div className="flex items-center gap-2">
                                <FileText className="size-4 shrink-0 text-muted-foreground" />
                                <span className="truncate font-medium">{record.title}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">Order {record.orderIndex}</span>
                            {record.contentHtml && (
                                <span className="line-clamp-2 text-xs text-muted-foreground">
                                    {record.contentHtml}
                                </span>
                            )}
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex flex-wrap items-center gap-2">
                                {kindBadge(record)}
                                {statusBadge(record.isPublished)}
                            </div>

                            <div className="flex items-center gap-1">
                                <Button size="sm" variant="secondary" onClick={() => openPreview(record)}>
                                    <Eye className="size-4" /> {isFileNote(record) ? 'Open' : 'Read'}
                                </Button>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    aria-label="Edit note"
                                    onClick={() => openEdit(record)}
                                >
                                    <Pencil className="size-4" />
                                </Button>
                                <ConfirmDialog
                                    title="Delete this note?"
                                    description="An uploaded PDF is removed from storage as well."
                                    variant="destructive"
                                    confirmLabel="Delete"
                                    onConfirm={() => handleDelete([record.id])}
                                    trigger={
                                        <Button size="icon" variant="ghost" aria-label="Delete note">
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
            <Dialog open={modalOpen} onOpenChange={(open) => !open && !submitLoading && setModalOpen(false)}>
                <DialogContent className="max-w-lg gap-5 p-5 sm:p-6">
                    <DialogHeader>
                        <DialogTitle>{editingNote ? 'Edit Note' : 'Add Note'}</DialogTitle>
                    </DialogHeader>

                    <form
                        noValidate
                        onSubmit={form.handleSubmit(submitNote)}
                        className="dc-scroll flex max-h-[70vh] flex-col gap-5 overflow-y-auto"
                    >
                        <FormField
                            id="college-note-title"
                            label="Title"
                            required
                            error={form.formState.errors.title?.message}
                        >
                            {(aria) => (
                                <Input
                                    {...aria}
                                    {...form.register('title')}
                                    placeholder="e.g. Chapter summary"
                                    autoFocus
                                    invalid={Boolean(form.formState.errors.title)}
                                />
                            )}
                        </FormField>

                        <Controller
                            name="kind"
                            control={form.control}
                            render={({ field }) => (
                                <fieldset className="flex flex-col gap-2.5">
                                    <legend className="mb-2 text-sm font-medium">What kind of note is this?</legend>
                                    <RadioGroup value={field.value} onValueChange={field.onChange}>
                                        <label className="flex items-center gap-2 text-sm">
                                            <RadioGroupItem value="FILE" id="college-note-kind-file" />
                                            Upload a PDF
                                        </label>
                                        <label className="flex items-center gap-2 text-sm">
                                            <RadioGroupItem value="TEXT" id="college-note-kind-text" />
                                            Write it here
                                        </label>
                                    </RadioGroup>
                                </fieldset>
                            )}
                        />

                        {kind === 'FILE' ? (
                            <FormField
                                id="college-note-file"
                                label={editingNote && isFileNote(editingNote) ? 'Replace PDF' : 'PDF file'}
                                required={!(editingNote && isFileNote(editingNote))}
                                hint={
                                    editingNote && isFileNote(editingNote)
                                        ? 'Leave empty to keep the current file.'
                                        : 'PDF only. The file goes straight to storage, not through the portal.'
                                }
                            >
                                {() => (
                                    <FileDropzone
                                        id="college-note-file"
                                        file={noteFile}
                                        onFileSelect={setNoteFile}
                                        onRemove={() => setNoteFile(null)}
                                        accept="application/pdf"
                                        validate={(file) => {
                                            if (!NOTE_TYPES.includes(file.type)) {
                                                toastText('Only PDF files can be uploaded as notes.', 'error');
                                                return 'Unsupported file type';
                                            }
                                            return null;
                                        }}
                                        title="Click or drag a PDF"
                                    />
                                )}
                            </FormField>
                        ) : (
                            <FormField
                                id="college-note-content"
                                label="Note"
                                required
                                hint="Plain text. Students read this inside the app."
                                error={form.formState.errors.contentHtml?.message}
                            >
                                {(aria) => (
                                    <Textarea
                                        {...aria}
                                        {...form.register('contentHtml')}
                                        rows={8}
                                        placeholder="Write the note here…"
                                    />
                                )}
                            </FormField>
                        )}

                        {editingNote && kind !== (isFileNote(editingNote) ? 'FILE' : 'TEXT') && (
                            <Alert
                                variant="warning"
                                title="This changes the kind of note"
                                description={
                                    kind === 'TEXT'
                                        ? 'Saving replaces the uploaded PDF with the text you write here.'
                                        : 'Saving replaces the written note with the PDF you upload.'
                                }
                            />
                        )}

                        <FormField
                            id="college-note-order"
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
                                    Published (visible to students who own the chapter)
                                </label>
                            )}
                        />

                        {submitLoading && (
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <span>{uploading ? 'Uploading PDF' : 'Saving'}</span>
                                    {uploading && <span>{uploadPercent}%</span>}
                                </div>
                                <Progress
                                    value={uploading ? uploadPercent : 100}
                                    label={`${uploading ? 'Uploading PDF' : 'Saving'}, ${uploadPercent} percent complete`}
                                />
                            </div>
                        )}

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
                                {editingNote ? 'Update' : 'Add'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* PDF preview */}
            <Dialog open={previewOpen} onOpenChange={(open) => !open && setPreviewOpen(false)}>
                <DialogContent className="max-w-3xl gap-5 p-5 sm:p-6">
                    <DialogHeader>
                        <DialogTitle>{preview?.title ?? 'Note preview'}</DialogTitle>
                    </DialogHeader>

                    <div className="flex flex-col gap-4">
                        {previewLoading && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Spinner /> Preparing the preview link…
                            </div>
                        )}

                        {!previewLoading && preview && (
                            <>
                                {!preview.isPublished && (
                                    <Alert
                                        variant="warning"
                                        title="This note is still a draft"
                                        description="Students cannot see it yet. Publish it once the PDF looks right."
                                    />
                                )}

                                {/* Some browsers refuse to render a PDF inline, so the
                                    new-tab link below is the guaranteed way in. */}
                                <iframe
                                    key={preview.previewUrl}
                                    title={`Preview of ${preview.title}`}
                                    src={preview.previewUrl}
                                    className="h-[60vh] w-full rounded-xl border border-border bg-muted"
                                />

                                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                                    <span>
                                        This link stops working after{' '}
                                        {Math.round(preview.expiresInSeconds / 60)} minute(s).
                                    </span>
                                    <a
                                        href={preview.previewUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-1.5 font-medium text-primary underline-offset-4 hover:underline"
                                    >
                                        <ExternalLink aria-hidden="true" className="size-4" />
                                        Open in a new tab
                                    </a>
                                </div>
                            </>
                        )}

                        {!previewLoading && !preview && (
                            <p className="text-sm text-muted-foreground">
                                The preview link could not be created. Please try again.
                            </p>
                        )}
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="secondary" onClick={() => setPreviewOpen(false)}>
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Written-note preview */}
            <Dialog open={Boolean(textPreview)} onOpenChange={(open) => !open && setTextPreview(null)}>
                <DialogContent className="max-w-lg gap-5 p-5 sm:p-6">
                    <DialogHeader>
                        <DialogTitle>{textPreview?.title ?? 'Note'}</DialogTitle>
                    </DialogHeader>

                    {textPreview && (
                        <div className="dc-scroll flex max-h-[60vh] flex-col gap-4 overflow-y-auto">
                            {!textPreview.isPublished && (
                                <Alert
                                    variant="warning"
                                    title="This note is still a draft"
                                    description="Students cannot see it yet."
                                />
                            )}

                            {/* Rendered as text, never as markup: nothing an admin types
                                should be able to run as HTML in the portal. */}
                            <p className="whitespace-pre-wrap text-sm">{textPreview.contentHtml}</p>
                        </div>
                    )}

                    <DialogFooter>
                        <Button type="button" variant="secondary" onClick={() => setTextPreview(null)}>
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default NotesPanel;
