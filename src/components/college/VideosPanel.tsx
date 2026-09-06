/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Key } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Film, Pencil, Play, Plus, Trash2 } from 'lucide-react';

import { AppDispatch, RootState } from '../../redux/store';
import {
    addCollegeVideoAction,
    deleteCollegeVideoAction,
    getCollegeThumbnailUploadUrlAction,
    getCollegeVideoPreviewUrlAction,
    getCollegeVideoUploadUrlAction,
    getCollegeVideosAction,
    updateCollegeVideoAction,
} from '../../redux/action/collegeContentAction';
import { CollegeVideo, CollegeVideoPreview } from '../../interfaces/interfaces';

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
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '../ui/dialog';
import { formatDuration, readMediaDuration, uploadToSignedUrl } from '../../utils/signedUpload';
import { toastText } from '../../utils/toast';
import { ChapterContentPanelProps } from './panelTypes';

// Mirrors the server-side allow-lists, so a bad file is refused before anything is signed.
const VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];
const THUMBNAIL_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const videoSchema = z.object({
    title: z.string().trim().min(1, 'Please enter a video title'),
    description: z.string().optional(),
    // Kept as a string so a blank field stays blank rather than becoming 0.
    durationSeconds: z.string().optional(),
    orderIndex: z.coerce.number().int('Order must be a whole number').min(0, 'Order must be zero or greater'),
    isPublished: z.boolean(),
});
type VideoValues = z.infer<typeof videoSchema>;

// What the upload is currently doing, so one progress bar can narrate the whole flow.
type UploadStage = 'idle' | 'video' | 'thumbnail' | 'saving';

/**
 * Videos tab of the chapter content screen.
 * The chapter is chosen once by the page above; this panel only owns the videos hanging off it.
 */
const VideosPanel = ({ chapterId, onCountChange }: ChapterContentPanelProps) => {
    const dispatch = useDispatch<AppDispatch>();
    const { isLoading } = useSelector((state: RootState) => state.collegeContent);

    const [videos, setVideos] = useState<CollegeVideo[]>([]);
    const [selectedKeys, setSelectedKeys] = useState<Key[]>([]);

    const [modalOpen, setModalOpen] = useState(false);
    const [editingVideo, setEditingVideo] = useState<CollegeVideo | null>(null);
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const [uploadStage, setUploadStage] = useState<UploadStage>('idle');
    const [uploadPercent, setUploadPercent] = useState(0);
    const [submitLoading, setSubmitLoading] = useState(false);

    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [preview, setPreview] = useState<CollegeVideoPreview | null>(null);
    // Held so the "link expired" retry knows which video to re-sign.
    const [previewVideoId, setPreviewVideoId] = useState<string | null>(null);

    const form = useForm<VideoValues>({
        resolver: zodResolver(videoSchema),
        defaultValues: { title: '', description: '', durationSeconds: '', orderIndex: 0, isPublished: false },
    });

    // Kept in a ref so reporting the count never re-runs the loader below.
    const onCountChangeRef = useRef(onCountChange);
    useEffect(() => {
        onCountChangeRef.current = onCountChange;
    }, [onCountChange]);

    // ---- Loaders -----------------------------------------------------------

    const fetchVideos = useCallback(async (id: string) => {
        const result: any = await dispatch(getCollegeVideosAction(id));
        if (result.payload && result.payload.statusCode === 200) {
            const rows = result.payload.data ?? [];
            setVideos(rows);
            onCountChangeRef.current?.(rows.length);
        }
    }, [dispatch]);

    useEffect(() => {
        setSelectedKeys([]);
        if (chapterId) {
            fetchVideos(chapterId);
        } else {
            setVideos([]);
        }
    }, [chapterId, fetchVideos]);

    // ---- Add / edit --------------------------------------------------------

    const resetFileState = () => {
        setVideoFile(null);
        setThumbnailFile(null);
        setUploadStage('idle');
        setUploadPercent(0);
    };

    const openAdd = () => {
        if (!chapterId) {
            toastText('Please select a chapter first', 'error');
            return;
        }
        setEditingVideo(null);
        resetFileState();
        form.reset({
            title: '', description: '', durationSeconds: '',
            orderIndex: videos.length, isPublished: false,
        });
        setModalOpen(true);
    };

    const openEdit = (record: CollegeVideo) => {
        setEditingVideo(record);
        resetFileState();
        form.reset({
            title: record.title,
            description: record.description ?? '',
            durationSeconds: record.durationSeconds?.toString() ?? '',
            orderIndex: record.orderIndex,
            isPublished: record.isPublished,
        });
        setModalOpen(true);
    };

    // Picking a file fills the duration in, so the admin is not asked to count seconds.
    const handleVideoFileSelect = async (file: File) => {
        setVideoFile(file);
        const seconds = await readMediaDuration(file);
        if (seconds !== null) {
            form.setValue('durationSeconds', String(seconds));
        }
    };

    // Uploads the file and returns its storage key; the API only ever receives the key.
    const uploadVideoFile = async (file: File): Promise<string | null> => {
        const signed: any = await dispatch(getCollegeVideoUploadUrlAction({
            chapterId, fileName: file.name, contentType: file.type,
        }));
        if (!signed.payload || signed.payload.statusCode !== 200) return null;

        setUploadStage('video');
        setUploadPercent(0);
        await uploadToSignedUrl(signed.payload.data.uploadUrl, file, setUploadPercent);
        return signed.payload.data.storageKey;
    };

    const uploadThumbnailFile = async (file: File): Promise<string | null> => {
        const signed: any = await dispatch(getCollegeThumbnailUploadUrlAction({
            chapterId, fileName: file.name, contentType: file.type,
        }));
        if (!signed.payload || signed.payload.statusCode !== 200) return null;

        setUploadStage('thumbnail');
        setUploadPercent(0);
        await uploadToSignedUrl(signed.payload.data.uploadUrl, file, setUploadPercent);
        return signed.payload.data.storageKey;
    };

    const submitVideo = async (values: VideoValues) => {
        // A new row with no file would be an unplayable entry in the app.
        if (!editingVideo && !videoFile) {
            toastText('Please choose a video file to upload', 'error');
            return;
        }

        setSubmitLoading(true);
        try {
            let storageKey: string | undefined;
            let thumbnailKey: string | undefined;

            if (videoFile) {
                const key = await uploadVideoFile(videoFile);
                if (!key) return;
                storageKey = key;
            }

            if (thumbnailFile) {
                const key = await uploadThumbnailFile(thumbnailFile);
                if (!key) return;
                thumbnailKey = key;
            }

            setUploadStage('saving');

            const shared = {
                title: values.title,
                description: values.description,
                // Blank stays undefined so the column keeps its null rather than becoming 0.
                durationSeconds: values.durationSeconds ? Number(values.durationSeconds) : undefined,
                orderIndex: values.orderIndex,
                isPublished: values.isPublished,
                ...(thumbnailKey ? { thumbnailKey } : {}),
            };

            const result: any = editingVideo
                ? await dispatch(updateCollegeVideoAction({
                    videoId: editingVideo.id,
                    // Only sent when a replacement was actually uploaded — otherwise the
                    // existing key must be left exactly as it is.
                    ...(storageKey ? { storageKey } : {}),
                    ...shared,
                }))
                : await dispatch(addCollegeVideoAction({ chapterId, storageKey: storageKey as string, ...shared }));

            if (result.payload && result.payload.statusCode === 200) {
                toastText(editingVideo ? 'Video updated successfully' : 'Video added successfully', 'success');
                setModalOpen(false);
                resetFileState();
                fetchVideos(chapterId);
            }
        } catch (error: any) {
            // Storage errors never reach the redux slice — the PUT bypasses axios entirely.
            toastText(error?.message ?? 'Upload failed. Please try again.', 'error');
        } finally {
            setUploadStage('idle');
            setSubmitLoading(false);
        }
    };

    // ---- Delete ------------------------------------------------------------

    const handleDelete = async (ids: string[]) => {
        const result: any = await dispatch(deleteCollegeVideoAction({ ids }));
        if (result.payload && result.payload.statusCode === 200) {
            toastText(ids.length > 1 ? 'Videos deleted successfully' : 'Video deleted successfully', 'success');
            setSelectedKeys([]);
            fetchVideos(chapterId);
        }
    };

    // ---- Preview -----------------------------------------------------------

    const openPreview = async (record: CollegeVideo) => {
        setPreviewVideoId(record.id);
        setPreview(null);
        setPreviewOpen(true);
        setPreviewLoading(true);
        try {
            const result: any = await dispatch(getCollegeVideoPreviewUrlAction(record.id));
            if (result.payload && result.payload.statusCode === 200) {
                setPreview(result.payload.data);
            }
        } finally {
            setPreviewLoading(false);
        }
    };

    const refreshPreview = async () => {
        if (!previewVideoId) return;
        setPreviewLoading(true);
        try {
            const result: any = await dispatch(getCollegeVideoPreviewUrlAction(previewVideoId));
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

    const columns: DataTableColumn<CollegeVideo>[] = useMemo(
        () => [
            { key: 'orderIndex', title: 'Order', dataIndex: 'orderIndex', width: 80, align: 'center' },
            {
                key: 'title',
                title: 'Video',
                dataIndex: 'title',
                render: (_: any, record: CollegeVideo) => (
                    <div className="flex min-w-0 flex-col">
                        <span className="truncate font-medium">{record.title}</span>
                        {record.description && (
                            <span className="truncate text-xs text-muted-foreground">{record.description}</span>
                        )}
                    </div>
                ),
            },
            {
                key: 'durationSeconds',
                title: 'Length',
                dataIndex: 'durationSeconds',
                width: 110,
                align: 'center',
                hideBelow: 'lg',
                render: (value: number | null) => formatDuration(value),
            },
            {
                key: 'thumbnailKey',
                title: 'Thumbnail',
                dataIndex: 'thumbnailKey',
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
                render: (_: any, record: CollegeVideo) => (
                    <div className="flex items-center justify-center gap-1">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button size="icon" variant="ghost" onClick={() => openPreview(record)}>
                                    <Play className="size-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Preview video</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button size="icon" variant="ghost" onClick={() => openEdit(record)}>
                                    <Pencil className="size-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Edit video</TooltipContent>
                        </Tooltip>

                        <ConfirmDialog
                            title="Delete this video?"
                            description="The video file is removed from storage as well. Students who bought the chapter will no longer see it."
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
        [videos, chapterId]
    );

    const uploadLabel =
        uploadStage === 'video' ? 'Uploading video'
            : uploadStage === 'thumbnail' ? 'Uploading thumbnail'
                : 'Saving';

    return (
        <div className="flex flex-col gap-5">
            {/* The tab owns its own action, since the page header now covers all three tabs. */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="dc-small">
                    Lessons students watch in the mobile app. Upload, preview, then publish.
                </p>
                <Button onClick={openAdd} disabled={!chapterId}>
                    <Plus className="size-4" /> Add Video
                </Button>
            </div>

            {selectedKeys.length > 0 && (
                <div className="flex flex-wrap items-center gap-3">
                    <span className="text-sm text-muted-foreground">
                        {selectedKeys.length} selected
                    </span>
                    <ConfirmDialog
                        title={`Delete ${selectedKeys.length} video(s)?`}
                        description="Their files are removed from storage as well. This cannot be undone."
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

            <DataTable<CollegeVideo>
                columns={columns}
                dataSource={videos}
                rowKey="id"
                loading={isLoading}
                rowSelection={{
                    selectedRowKeys: selectedKeys,
                    onChange: (keys) => setSelectedKeys(keys),
                }}
                emptyTitle="No videos yet"
                emptyDescription="Upload the first video for this chapter."
                emptyAction={
                    <Button onClick={openAdd}>
                        <Plus className="size-4" /> Add Video
                    </Button>
                }
                // Below `md` the table becomes cards, so every action the row offers has
                // to be repeated here or it becomes desktop-only.
                renderMobileCard={(record) => (
                    <Card className="flex flex-col gap-3 p-4">
                        <div className="flex min-w-0 flex-col gap-1">
                            <div className="flex items-center gap-2">
                                <Film className="size-4 shrink-0 text-muted-foreground" />
                                <span className="truncate font-medium">{record.title}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">
                                Order {record.orderIndex} · {formatDuration(record.durationSeconds)} ·{' '}
                                {record.thumbnailKey ? 'Has thumbnail' : 'No thumbnail'}
                            </span>
                            {record.description && (
                                <span className="text-xs text-muted-foreground">{record.description}</span>
                            )}
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2">
                            {statusBadge(record.isPublished)}

                            <div className="flex items-center gap-1">
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={() => openPreview(record)}
                                >
                                    <Play className="size-4" /> Preview
                                </Button>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    aria-label="Edit video"
                                    onClick={() => openEdit(record)}
                                >
                                    <Pencil className="size-4" />
                                </Button>
                                <ConfirmDialog
                                    title="Delete this video?"
                                    description="The video file is removed from storage as well."
                                    variant="destructive"
                                    confirmLabel="Delete"
                                    onConfirm={() => handleDelete([record.id])}
                                    trigger={
                                        <Button size="icon" variant="ghost" aria-label="Delete video">
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
                        <DialogTitle>{editingVideo ? 'Edit Video' : 'Add Video'}</DialogTitle>
                    </DialogHeader>

                    <form
                        noValidate
                        onSubmit={form.handleSubmit(submitVideo)}
                        className="dc-scroll flex max-h-[70vh] flex-col gap-5 overflow-y-auto"
                    >
                        <FormField
                            id="college-video-title"
                            label="Title"
                            required
                            error={form.formState.errors.title?.message}
                        >
                            {(aria) => (
                                <Input
                                    {...aria}
                                    {...form.register('title')}
                                    placeholder="e.g. Recording journal entries"
                                    autoFocus
                                    invalid={Boolean(form.formState.errors.title)}
                                />
                            )}
                        </FormField>

                        <FormField id="college-video-description" label="Description">
                            {(aria) => (
                                <Textarea
                                    {...aria}
                                    {...form.register('description')}
                                    placeholder="Optional"
                                    rows={2}
                                />
                            )}
                        </FormField>

                        <FormField
                            id="college-video-file"
                            label={editingVideo ? 'Replace video file' : 'Video file'}
                            required={!editingVideo}
                            hint={
                                editingVideo
                                    ? 'Leave empty to keep the current file.'
                                    : 'MP4, WebM or MOV. The file goes straight to storage, not through the portal.'
                            }
                        >
                            {() => (
                                <FileDropzone
                                    id="college-video-file"
                                    file={videoFile}
                                    onFileSelect={handleVideoFileSelect}
                                    onRemove={() => setVideoFile(null)}
                                    accept="video/mp4,video/webm,video/quicktime"
                                    validate={(file) => {
                                        if (!VIDEO_TYPES.includes(file.type)) {
                                            toastText('Only MP4, WebM or MOV video files can be uploaded.', 'error');
                                            return 'Unsupported file type';
                                        }
                                        return null;
                                    }}
                                    title="Click or drag a video file"
                                />
                            )}
                        </FormField>

                        <FormField
                            id="college-video-thumbnail"
                            label="Thumbnail"
                            hint="Optional JPG, PNG or WebP shown before the video plays."
                        >
                            {() => (
                                <FileDropzone
                                    id="college-video-thumbnail"
                                    file={thumbnailFile}
                                    onFileSelect={setThumbnailFile}
                                    onRemove={() => setThumbnailFile(null)}
                                    accept="image/jpeg,image/png,image/webp"
                                    validate={(file) => {
                                        if (!THUMBNAIL_TYPES.includes(file.type)) {
                                            toastText('Only JPG, PNG or WebP images can be uploaded as thumbnails.', 'error');
                                            return 'Unsupported file type';
                                        }
                                        return null;
                                    }}
                                    title="Click or drag an image"
                                />
                            )}
                        </FormField>

                        <FormField
                            id="college-video-duration"
                            label="Length (seconds)"
                            hint="Filled in automatically when you choose a file."
                        >
                            {(aria) => (
                                <Input
                                    {...aria}
                                    type="number"
                                    min={0}
                                    placeholder="Unknown"
                                    {...form.register('durationSeconds')}
                                />
                            )}
                        </FormField>

                        <FormField
                            id="college-video-order"
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
                                    <span>{uploadLabel}</span>
                                    {uploadStage !== 'saving' && <span>{uploadPercent}%</span>}
                                </div>
                                <Progress
                                    value={uploadStage === 'saving' ? 100 : uploadPercent}
                                    label={`${uploadLabel}, ${uploadPercent} percent complete`}
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
                                {editingVideo ? 'Update' : 'Add'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Preview */}
            <Dialog open={previewOpen} onOpenChange={(open) => !open && setPreviewOpen(false)}>
                <DialogContent className="max-w-2xl gap-5 p-5 sm:p-6">
                    <DialogHeader>
                        <DialogTitle>{preview?.title ?? 'Video preview'}</DialogTitle>
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
                                        title="This video is still a draft"
                                        description="Students cannot see it yet. Publish it once the preview looks right."
                                    />
                                )}

                                {/* poster only when one was uploaded — an empty poster
                                    attribute makes some browsers show a broken image. */}
                                <video
                                    key={preview.previewUrl}
                                    controls
                                    preload="metadata"
                                    className="w-full rounded-xl bg-black"
                                    src={preview.previewUrl}
                                    {...(preview.thumbnailUrl ? { poster: preview.thumbnailUrl } : {})}
                                />

                                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                                    <span>Length {formatDuration(preview.durationSeconds)}</span>
                                    <span aria-hidden="true">·</span>
                                    <span>
                                        This link stops working after{' '}
                                        {Math.round(preview.expiresInSeconds / 60)} minute(s).
                                    </span>
                                    <Button size="sm" variant="secondary" onClick={refreshPreview}>
                                        Get a fresh link
                                    </Button>
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
        </div>
    );
};

export default VideosPanel;
