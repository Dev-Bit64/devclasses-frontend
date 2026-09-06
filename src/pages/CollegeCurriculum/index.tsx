/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Pencil, Plus, Trash2, BookOpen, ChevronRight, Film, ListChecks, Lock, NotebookText, Unlock } from 'lucide-react';

import { AppDispatch, RootState } from '../../redux/store';
import {
    addCollegeChapterAction,
    addCollegeCourseAction,
    addCollegeSemesterAction,
    addCollegeSubjectAction,
    deleteCollegeChapterAction,
    deleteCollegeSubjectAction,
    getCollegeChaptersAction,
    getCollegeCoursesAction,
    getCollegeSemestersAction,
    getCollegeSubjectsAction,
    updateCollegeChapterAction,
    updateCollegeSubjectAction,
} from '../../redux/action/collegeCatalogAction';

import { PageShell } from '../../components/common/PageShell';
import { PageHeader } from '../../components/common/PageHeader';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { DataTable, DataTableColumn } from '../../components/common/DataTable';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Checkbox } from '../../components/ui/checkbox';
import { Spinner } from '../../components/ui/spinner';
import { FormField } from '../../components/ui/form-field';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../components/ui/tooltip';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '../../components/ui/dialog';
import CustomDropdown, { DropdownOption } from '../../components/ImportModal/CustomDropdown';
import { toastText } from '../../utils/toast';

// Page-level view models stay local, matching how the school pages do it.
interface CollegeSubject {
    key: string;
    no: number;
    id: string;
    name: string;
    description: string | null;
    orderIndex: number;
    isPublished: boolean;
    chapterCount: number;
}

interface CollegeChapter {
    key: string;
    id: string;
    name: string;
    description: string | null;
    orderIndex: number;
    isFree: boolean;
    priceInPaise: number;
    accessDurationDays: number | null;
    maxViewCount: number | null;
    isPublished: boolean;
    videoCount: number;
    noteCount: number;
    questionCount: number;
}

// Money is stored as integer paise; admins think in rupees. Convert only at the edges.
const paiseToRupees = (paise: number) => (paise / 100).toFixed(2);
const rupeesToPaise = (rupees: number) => Math.round(rupees * 100);

const formatPrice = (chapter: CollegeChapter) =>
    chapter.isFree ? 'Free' : `₹${paiseToRupees(chapter.priceInPaise)}`;

const courseSchema = z.object({
    name: z.string().trim().min(1, 'Please enter course name'),
    description: z.string().optional(),
    isPublished: z.boolean(),
});
type CourseValues = z.infer<typeof courseSchema>;

const semesterSchema = z.object({
    // Mirrors AddCollegeSemesterDto's Min(1)/Max(6) so the admin sees the error before submitting.
    number: z.coerce
        .number()
        .int('Semester must be a whole number')
        .min(1, 'Semester must be between 1 and 6')
        .max(6, 'Semester must be between 1 and 6'),
    title: z.string().optional(),
    isPublished: z.boolean(),
});
type SemesterValues = z.infer<typeof semesterSchema>;

const subjectSchema = z.object({
    name: z.string().trim().min(1, 'Please enter subject name'),
    description: z.string().optional(),
    orderIndex: z.coerce.number().int('Order must be a whole number').min(0, 'Order must be zero or greater'),
    isPublished: z.boolean(),
});
type SubjectValues = z.infer<typeof subjectSchema>;

const chapterSchema = z
    .object({
        name: z.string().trim().min(1, 'Please enter chapter name'),
        description: z.string().optional(),
        orderIndex: z.coerce.number().int('Order must be a whole number').min(0, 'Order must be zero or greater'),
        isFree: z.boolean(),
        // Captured in rupees for the admin, converted to paise before it leaves the page.
        priceInRupees: z.coerce.number().min(0, 'Price cannot be negative'),
        accessDurationDays: z.string().optional(),
        maxViewCount: z.string().optional(),
        isPublished: z.boolean(),
    })
    // Mirrors the server-side pricing rule so the admin sees the error before submitting.
    .refine((v) => v.isFree || v.priceInRupees > 0, {
        message: 'A paid chapter needs a price greater than 0',
        path: ['priceInRupees'],
    })
    .refine((v) => !v.isFree || v.priceInRupees === 0, {
        message: 'A free chapter cannot have a price',
        path: ['priceInRupees'],
    });
type ChapterValues = z.infer<typeof chapterSchema>;

const CollegeCurriculum = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { isLoading } = useSelector((state: RootState) => state.collegeCatalog);

    const [courseOptions, setCourseOptions] = useState<DropdownOption[]>([]);
    const [semesterOptions, setSemesterOptions] = useState<DropdownOption[]>([]);
    const [selectedCourseId, setSelectedCourseId] = useState<string>('');
    const [selectedSemesterId, setSelectedSemesterId] = useState<string>('');

    const [subjects, setSubjects] = useState<CollegeSubject[]>([]);
    // Chapters are loaded per expanded subject, so the table only fetches what is opened.
    const [chaptersBySubject, setChaptersBySubject] = useState<Record<string, CollegeChapter[]>>({});

    // DataTable's row expander only exists in the desktop table, so the mobile card list
    // tracks its own open subjects — otherwise chapters are unreachable on a phone.
    const [expandedMobileSubjects, setExpandedMobileSubjects] = useState<string[]>([]);

    const [courseModalOpen, setCourseModalOpen] = useState(false);
    const [semesterModalOpen, setSemesterModalOpen] = useState(false);
    const [subjectModalOpen, setSubjectModalOpen] = useState(false);
    const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);
    const [chapterModalOpen, setChapterModalOpen] = useState(false);
    const [editingChapterId, setEditingChapterId] = useState<string | null>(null);
    const [chapterParentSubjectId, setChapterParentSubjectId] = useState<string>('');
    const [submitLoading, setSubmitLoading] = useState(false);

    const courseForm = useForm<CourseValues>({
        resolver: zodResolver(courseSchema),
        defaultValues: { name: 'B.Com', description: '', isPublished: true },
    });

    const semesterForm = useForm<SemesterValues>({
        resolver: zodResolver(semesterSchema),
        defaultValues: { number: 1, title: '', isPublished: true },
    });

    const subjectForm = useForm<SubjectValues>({
        resolver: zodResolver(subjectSchema),
        defaultValues: { name: '', description: '', orderIndex: 0, isPublished: false },
    });

    const chapterForm = useForm<ChapterValues>({
        resolver: zodResolver(chapterSchema),
        defaultValues: {
            name: '', description: '', orderIndex: 0, isFree: false,
            priceInRupees: 0, accessDurationDays: '', maxViewCount: '', isPublished: false,
        },
    });

    const isFreeChapter = chapterForm.watch('isFree');

    // ---- Loaders -----------------------------------------------------------

    const fetchCourses = useCallback(async () => {
        const result: any = await dispatch(getCollegeCoursesAction());
        if (result.payload && result.payload.statusCode === 200) {
            const options = (result.payload.data ?? []).map((course: any) => ({
                value: course.id,
                label: course.name,
            }));
            setCourseOptions(options);
            // Auto-select when there is exactly one course, which is the B.Com-only case.
            if (options.length === 1) {
                setSelectedCourseId(options[0].value);
            }
        }
    }, [dispatch]);

    const fetchSemesters = useCallback(async (courseId: string) => {
        const result: any = await dispatch(getCollegeSemestersAction(courseId));
        if (result.payload && result.payload.statusCode === 200) {
            setSemesterOptions(
                (result.payload.data ?? []).map((semester: any) => ({
                    value: semester.id,
                    label: semester.title ? `Sem ${semester.number} — ${semester.title}` : `Semester ${semester.number}`,
                }))
            );
        }
    }, [dispatch]);

    const fetchSubjects = useCallback(async (semesterId: string) => {
        const result: any = await dispatch(getCollegeSubjectsAction(semesterId));
        if (result.payload && result.payload.statusCode === 200) {
            setSubjects(
                (result.payload.data ?? []).map((subject: any, index: number) => ({
                    key: subject.id,
                    no: index + 1,
                    id: subject.id,
                    name: subject.name,
                    description: subject.description,
                    orderIndex: subject.orderIndex,
                    isPublished: subject.isPublished,
                    chapterCount: subject._count?.chapters ?? 0,
                }))
            );
        }
    }, [dispatch]);

    const fetchChapters = useCallback(async (subjectId: string) => {
        const result: any = await dispatch(getCollegeChaptersAction(subjectId));
        if (result.payload && result.payload.statusCode === 200) {
            setChaptersBySubject((current) => ({
                ...current,
                [subjectId]: (result.payload.data ?? []).map((chapter: any) => ({
                    key: chapter.id,
                    id: chapter.id,
                    name: chapter.name,
                    description: chapter.description,
                    orderIndex: chapter.orderIndex,
                    isFree: chapter.isFree,
                    priceInPaise: chapter.priceInPaise,
                    accessDurationDays: chapter.accessDurationDays,
                    maxViewCount: chapter.maxViewCount,
                    isPublished: chapter.isPublished,
                    videoCount: chapter._count?.videos ?? 0,
                    noteCount: chapter._count?.notes ?? 0,
                    questionCount: chapter._count?.practiceQuestions ?? 0,
                })),
            }));
        }
    }, [dispatch]);

    useEffect(() => {
        fetchCourses();
    }, [fetchCourses]);

    useEffect(() => {
        if (!selectedCourseId) return;
        setSelectedSemesterId('');
        setSubjects([]);
        fetchSemesters(selectedCourseId);
    }, [selectedCourseId, fetchSemesters]);

    useEffect(() => {
        if (!selectedSemesterId) return;
        setChaptersBySubject({});
        fetchSubjects(selectedSemesterId);
    }, [selectedSemesterId, fetchSubjects]);

    // ---- Course / semester bootstrap ---------------------------------------

    // The catalog is unusable until a course and its semesters exist, so both are seeded
    // from this page rather than requiring a separate screen.
    const openAddCourse = () => {
        courseForm.reset({ name: 'B.Com', description: '', isPublished: true });
        setCourseModalOpen(true);
    };

    const submitCourse = async (values: CourseValues) => {
        setSubmitLoading(true);
        try {
            const result: any = await dispatch(addCollegeCourseAction(values));
            if (result.payload && result.payload.statusCode === 200) {
                toastText('Course added successfully', 'success');
                setCourseModalOpen(false);
                fetchCourses();
            }
        } finally {
            setSubmitLoading(false);
        }
    };

    const openAddSemester = () => {
        if (!selectedCourseId) {
            toastText('Please select a course first', 'error');
            return;
        }
        semesterForm.reset({ number: 1, title: '', isPublished: true });
        setSemesterModalOpen(true);
    };

    const submitSemester = async (values: SemesterValues) => {
        setSubmitLoading(true);
        try {
            const result: any = await dispatch(
                addCollegeSemesterAction({ courseId: selectedCourseId, ...values })
            );
            if (result.payload && result.payload.statusCode === 200) {
                toastText('Semester added successfully', 'success');
                setSemesterModalOpen(false);
                fetchSemesters(selectedCourseId);
            }
        } finally {
            setSubmitLoading(false);
        }
    };

    // ---- Subject handlers --------------------------------------------------

    const openAddSubject = () => {
        if (!selectedSemesterId) {
            toastText('Please select a semester first', 'error');
            return;
        }
        setEditingSubjectId(null);
        subjectForm.reset({ name: '', description: '', orderIndex: subjects.length, isPublished: false });
        setSubjectModalOpen(true);
    };

    const openEditSubject = (record: CollegeSubject) => {
        setEditingSubjectId(record.id);
        subjectForm.reset({
            name: record.name,
            description: record.description ?? '',
            orderIndex: record.orderIndex,
            isPublished: record.isPublished,
        });
        setSubjectModalOpen(true);
    };

    const submitSubject = async (values: SubjectValues) => {
        setSubmitLoading(true);
        try {
            const result: any = editingSubjectId
                ? await dispatch(updateCollegeSubjectAction({ subjectId: editingSubjectId, ...values }))
                : await dispatch(addCollegeSubjectAction({ semesterId: selectedSemesterId, ...values }));

            if (result.payload && result.payload.statusCode === 200) {
                toastText(editingSubjectId ? 'Subject updated successfully' : 'Subject added successfully', 'success');
                setSubjectModalOpen(false);
                fetchSubjects(selectedSemesterId);
            }
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleDeleteSubject = async (record: CollegeSubject) => {
        const result: any = await dispatch(deleteCollegeSubjectAction({ ids: [record.id] }));
        if (result.payload && result.payload.statusCode === 200) {
            toastText('Subject deleted successfully', 'success');
            fetchSubjects(selectedSemesterId);
        }
    };

    // ---- Chapter handlers --------------------------------------------------

    const openAddChapter = (subjectId: string) => {
        setChapterParentSubjectId(subjectId);
        setEditingChapterId(null);
        chapterForm.reset({
            name: '', description: '',
            orderIndex: (chaptersBySubject[subjectId] ?? []).length,
            isFree: false, priceInRupees: 0,
            accessDurationDays: '', maxViewCount: '', isPublished: false,
        });
        setChapterModalOpen(true);
    };

    const openEditChapter = (subjectId: string, record: CollegeChapter) => {
        setChapterParentSubjectId(subjectId);
        setEditingChapterId(record.id);
        chapterForm.reset({
            name: record.name,
            description: record.description ?? '',
            orderIndex: record.orderIndex,
            isFree: record.isFree,
            priceInRupees: Number(paiseToRupees(record.priceInPaise)),
            // Empty string is how "no limit of that kind" is represented in the form.
            accessDurationDays: record.accessDurationDays?.toString() ?? '',
            maxViewCount: record.maxViewCount?.toString() ?? '',
            isPublished: record.isPublished,
        });
        setChapterModalOpen(true);
    };

    const submitChapter = async (values: ChapterValues) => {
        setSubmitLoading(true);
        try {
            const payload = {
                name: values.name,
                description: values.description,
                orderIndex: values.orderIndex,
                isFree: values.isFree,
                priceInPaise: rupeesToPaise(values.priceInRupees),
                // Blank stays undefined so the API keeps the column null rather than 0.
                accessDurationDays: values.accessDurationDays ? Number(values.accessDurationDays) : undefined,
                maxViewCount: values.maxViewCount ? Number(values.maxViewCount) : undefined,
                isPublished: values.isPublished,
            };

            const result: any = editingChapterId
                ? await dispatch(updateCollegeChapterAction({ chapterId: editingChapterId, ...payload }))
                : await dispatch(addCollegeChapterAction({ subjectId: chapterParentSubjectId, ...payload }));

            if (result.payload && result.payload.statusCode === 200) {
                toastText(editingChapterId ? 'Chapter updated successfully' : 'Chapter added successfully', 'success');
                setChapterModalOpen(false);
                fetchChapters(chapterParentSubjectId);
                fetchSubjects(selectedSemesterId);
            }
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleDeleteChapter = async (subjectId: string, record: CollegeChapter) => {
        const result: any = await dispatch(deleteCollegeChapterAction({ ids: [record.id] }));
        if (result.payload && result.payload.statusCode === 200) {
            toastText('Chapter deleted successfully', 'success');
            fetchChapters(subjectId);
            fetchSubjects(selectedSemesterId);
        }
    };

    // ---- Rendering ---------------------------------------------------------

    // Content lives on its own screen; carrying the whole selection across in the query string
    // spares the admin re-picking course, semester, subject and chapter there, and `tab` opens
    // the kind of content they clicked rather than always the first one.
    const openChapterContent = (tab: string, subjectId: string, chapterId: string) => {
        const params = new URLSearchParams({
            courseId: selectedCourseId,
            semesterId: selectedSemesterId,
            subjectId,
            chapterId,
            tab,
        });
        navigate(`/college-content?${params.toString()}`);
    };

    // Mirrors the desktop expander: opening a subject lazily loads its chapters once.
    const toggleMobileSubject = (subjectId: string) => {
        setExpandedMobileSubjects((prev) =>
            prev.includes(subjectId) ? prev.filter((id) => id !== subjectId) : [...prev, subjectId]
        );
        if (!chaptersBySubject[subjectId]) {
            fetchChapters(subjectId);
        }
    };

    // `inset` is false inside the mobile card, which already supplies its own padding.
    const renderChapters = (subject: CollegeSubject, inset = true) => {
        const chapters = chaptersBySubject[subject.id];

        return (
            // The expanded table cell is p-0, so the panel supplies its own padding — otherwise
            // the heading and button end up flush against opposite edges of the whole table.
            <div className={inset ? 'flex flex-col gap-3 px-4 py-4 sm:px-6' : 'flex flex-col gap-3'}>
                {/* Heading and its action stay grouped; splitting them across a full-width
                    row strands the button metres away from the label it belongs to. */}
                <div className="flex flex-wrap items-center gap-3">
                    <span className="text-sm font-semibold">Chapters</span>
                    {chapters && chapters.length > 0 && (
                        <span className="text-xs text-muted-foreground">{chapters.length}</span>
                    )}
                    <Button size="sm" variant="secondary" onClick={() => openAddChapter(subject.id)}>
                        <Plus className="size-4" /> Add Chapter
                    </Button>
                </div>

                {!chapters && <p className="text-sm text-muted-foreground">Loading chapters…</p>}
                {chapters && chapters.length === 0 && (
                    <p className="text-sm text-muted-foreground">No chapters yet.</p>
                )}

                {chapters && chapters.length > 0 && (
                    <div className="flex flex-col gap-2">
                        {chapters.map((chapter) => (
                            <div
                                key={chapter.key}
                                className="flex flex-wrap items-center justify-between gap-3 rounded-md border p-3"
                            >
                                <div className="flex min-w-0 flex-col gap-1">
                                    <div className="flex items-center gap-2">
                                        {chapter.isFree ? (
                                            <Unlock className="size-4 text-muted-foreground" />
                                        ) : (
                                            <Lock className="size-4 text-muted-foreground" />
                                        )}
                                        <span className="truncate font-medium">{chapter.name}</span>
                                        {!chapter.isPublished && (
                                            <span className="rounded bg-muted px-1.5 py-0.5 text-xs">Draft</span>
                                        )}
                                    </div>
                                    <span className="text-xs text-muted-foreground">
                                        {formatPrice(chapter)}
                                        {' · '}
                                        {chapter.accessDurationDays ? `${chapter.accessDurationDays} days` : 'No time limit'}
                                        {' · '}
                                        {chapter.maxViewCount ? `${chapter.maxViewCount} views` : 'Unlimited views'}
                                        {' · '}
                                        {chapter.videoCount} videos, {chapter.noteCount} notes, {chapter.questionCount} MCQs
                                    </span>
                                </div>

                                <div className="flex items-center gap-1">
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                aria-label="Manage videos"
                                                onClick={() => openChapterContent('videos', subject.id, chapter.id)}
                                            >
                                                <Film className="size-4" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Manage videos</TooltipContent>
                                    </Tooltip>

                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                aria-label="Manage notes"
                                                onClick={() => openChapterContent('notes', subject.id, chapter.id)}
                                            >
                                                <NotebookText className="size-4" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Manage notes</TooltipContent>
                                    </Tooltip>

                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                aria-label="Manage practice questions"
                                                onClick={() => openChapterContent('practice', subject.id, chapter.id)}
                                            >
                                                <ListChecks className="size-4" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Manage practice questions</TooltipContent>
                                    </Tooltip>

                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                onClick={() => openEditChapter(subject.id, chapter)}
                                            >
                                                <Pencil className="size-4" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Edit chapter</TooltipContent>
                                    </Tooltip>

                                    <ConfirmDialog
                                        title="Delete this chapter?"
                                        description="Chapters that students have already purchased cannot be deleted."
                                        variant="destructive"
                                        confirmLabel="Delete"
                                        onConfirm={() => handleDeleteChapter(subject.id, chapter)}
                                        trigger={
                                            <Button size="icon" variant="ghost">
                                                <Trash2 className="size-4" />
                                            </Button>
                                        }
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    const columns: DataTableColumn<CollegeSubject>[] = useMemo(
        () => [
            { key: 'no', title: 'No.', dataIndex: 'no', width: 72, align: 'center' },
            { key: 'name', title: 'Subject', dataIndex: 'name' },
            {
                key: 'chapterCount',
                title: 'Chapters',
                dataIndex: 'chapterCount',
                width: 110,
                align: 'center',
            },
            { key: 'orderIndex', title: 'Order', dataIndex: 'orderIndex', width: 90, align: 'center' },
            {
                key: 'isPublished',
                title: 'Status',
                dataIndex: 'isPublished',
                width: 120,
                render: (value: boolean) => (value ? 'Published' : 'Draft'),
            },
            {
                key: 'action',
                title: 'Action',
                width: 110,
                align: 'center',
                render: (_: any, record: CollegeSubject) => (
                    <div className="flex items-center justify-center gap-1">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button size="icon" variant="ghost" onClick={() => openEditSubject(record)}>
                                    <Pencil className="size-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Edit subject</TooltipContent>
                        </Tooltip>

                        <ConfirmDialog
                            title="Delete this subject?"
                            description="This also deletes its chapters. Subjects with purchased chapters cannot be deleted."
                            variant="destructive"
                            confirmLabel="Delete"
                            onConfirm={() => handleDeleteSubject(record)}
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
        [subjects, chaptersBySubject]
    );

    return (
        // Radix requires a provider above every Tooltip; the chapter and subject rows below
        // each render one, so it wraps the whole page rather than each row.
        <TooltipProvider delayDuration={150}>
        <PageShell>
            <PageHeader
                title="College Curriculum"
                description="B.Com course content for the mobile app. Stored in the separate college database."
                actions={
                    <div className="flex flex-wrap gap-2">
                        <Button variant="secondary" onClick={openAddCourse}>
                            <Plus className="size-4" /> Course
                        </Button>
                        <Button variant="secondary" onClick={openAddSemester}>
                            <Plus className="size-4" /> Semester
                        </Button>
                        <Button onClick={openAddSubject}>
                            <Plus className="size-4" /> Add Subject
                        </Button>
                    </div>
                }
            />

            <Card className="p-4 sm:p-5">
                <div className="flex flex-col gap-3 sm:flex-row">
                    <div className="flex-1">
                        <CustomDropdown
                            options={courseOptions}
                            value={selectedCourseId}
                            onChange={setSelectedCourseId}
                            placeholder="Select Course"
                        />
                    </div>
                    <div className="flex-1">
                        <CustomDropdown
                            options={semesterOptions}
                            value={selectedSemesterId}
                            onChange={setSelectedSemesterId}
                            placeholder="Select Semester"
                            disabled={!selectedCourseId}
                        />
                    </div>
                </div>
            </Card>

            <DataTable<CollegeSubject>
                columns={columns}
                dataSource={subjects}
                rowKey="key"
                loading={isLoading}
                emptyTitle={selectedSemesterId ? 'No subjects yet' : 'Select a course and semester'}
                emptyDescription={
                    selectedSemesterId
                        ? 'Add the first subject for this semester.'
                        : 'Choose a course and semester above to manage its subjects.'
                }
                emptyAction={
                    selectedSemesterId ? (
                        <Button onClick={openAddSubject}>
                            <Plus className="size-4" /> Add Subject
                        </Button>
                    ) : undefined
                }
                expandedRowRender={renderChapters}
                rowExpandable={() => true}
                onRow={(record) => ({
                    // Chapters load lazily on first expand, then stay cached for the session.
                    onClick: () => {
                        if (!chaptersBySubject[record.id]) {
                            fetchChapters(record.id);
                        }
                    },
                })}
                // Below `md` the table becomes cards, and DataTable does not expand those —
                // so the card carries the subject actions and its own chapters disclosure.
                renderMobileCard={(record) => {
                    const isOpen = expandedMobileSubjects.includes(record.id);

                    return (
                        <Card className="flex flex-col gap-3 p-4">
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex min-w-0 flex-col gap-1">
                                    <div className="flex items-center gap-2">
                                        <BookOpen className="size-4 shrink-0 text-muted-foreground" />
                                        <span className="truncate font-medium">{record.name}</span>
                                    </div>
                                    <span className="text-xs text-muted-foreground">
                                        {record.chapterCount} chapters · {record.isPublished ? 'Published' : 'Draft'}
                                    </span>
                                </div>

                                <div className="flex shrink-0 items-center gap-1">
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        aria-label="Edit subject"
                                        onClick={() => openEditSubject(record)}
                                    >
                                        <Pencil className="size-4" />
                                    </Button>
                                    <ConfirmDialog
                                        title="Delete this subject?"
                                        description="This also deletes its chapters. Subjects with purchased chapters cannot be deleted."
                                        variant="destructive"
                                        confirmLabel="Delete"
                                        onConfirm={() => handleDeleteSubject(record)}
                                        trigger={
                                            <Button size="icon" variant="ghost" aria-label="Delete subject">
                                                <Trash2 className="size-4" />
                                            </Button>
                                        }
                                    />
                                </div>
                            </div>

                            <Button
                                variant="secondary"
                                size="sm"
                                className="justify-between"
                                aria-expanded={isOpen}
                                onClick={() => toggleMobileSubject(record.id)}
                            >
                                {isOpen ? 'Hide chapters' : 'Manage chapters'}
                                <ChevronRight
                                    aria-hidden="true"
                                    className={isOpen ? 'size-4 rotate-90 transition-transform' : 'size-4 transition-transform'}
                                />
                            </Button>

                            {isOpen && (
                                <div className="border-t border-border pt-3">
                                    {renderChapters(record, false)}
                                </div>
                            )}
                        </Card>
                    );
                }}
            />

            {/* Course add */}
            <Dialog open={courseModalOpen} onOpenChange={(open) => !open && setCourseModalOpen(false)}>
                <DialogContent className="max-w-md gap-5 p-5 sm:p-6">
                    <DialogHeader>
                        <DialogTitle>Add Course</DialogTitle>
                    </DialogHeader>

                    <form
                        noValidate
                        onSubmit={courseForm.handleSubmit(submitCourse)}
                        className="flex flex-col gap-5"
                    >
                        <FormField
                            id="college-course-name"
                            label="Course Name"
                            required
                            error={courseForm.formState.errors.name?.message}
                        >
                            {(aria) => (
                                <Input
                                    {...aria}
                                    {...courseForm.register('name')}
                                    placeholder="e.g. B.Com"
                                    autoFocus
                                    invalid={Boolean(courseForm.formState.errors.name)}
                                />
                            )}
                        </FormField>

                        <FormField id="college-course-description" label="Description">
                            {(aria) => (
                                <Textarea
                                    {...aria}
                                    {...courseForm.register('description')}
                                    placeholder="Optional"
                                    rows={3}
                                />
                            )}
                        </FormField>

                        <Controller
                            name="isPublished"
                            control={courseForm.control}
                            render={({ field }) => (
                                <label className="flex items-center gap-2 text-sm">
                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                    Published (visible to students)
                                </label>
                            )}
                        />

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => setCourseModalOpen(false)}
                                disabled={submitLoading}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={submitLoading}>
                                {submitLoading && <Spinner />}
                                Add
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Semester add */}
            <Dialog open={semesterModalOpen} onOpenChange={(open) => !open && setSemesterModalOpen(false)}>
                <DialogContent className="max-w-md gap-5 p-5 sm:p-6">
                    <DialogHeader>
                        <DialogTitle>Add Semester</DialogTitle>
                    </DialogHeader>

                    <form
                        noValidate
                        onSubmit={semesterForm.handleSubmit(submitSemester)}
                        className="flex flex-col gap-5"
                    >
                        <FormField
                            id="college-semester-number"
                            label="Semester Number"
                            required
                            hint="B.Com runs from semester 1 to 6."
                            error={semesterForm.formState.errors.number?.message}
                        >
                            {(aria) => (
                                <Input
                                    {...aria}
                                    type="number"
                                    min={1}
                                    max={6}
                                    {...semesterForm.register('number')}
                                    autoFocus
                                    invalid={Boolean(semesterForm.formState.errors.number)}
                                />
                            )}
                        </FormField>

                        <FormField id="college-semester-title" label="Title">
                            {(aria) => (
                                <Input
                                    {...aria}
                                    {...semesterForm.register('title')}
                                    placeholder="Optional"
                                />
                            )}
                        </FormField>

                        <Controller
                            name="isPublished"
                            control={semesterForm.control}
                            render={({ field }) => (
                                <label className="flex items-center gap-2 text-sm">
                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                    Published (visible to students)
                                </label>
                            )}
                        />

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => setSemesterModalOpen(false)}
                                disabled={submitLoading}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={submitLoading}>
                                {submitLoading && <Spinner />}
                                Add
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Subject add/edit */}
            <Dialog open={subjectModalOpen} onOpenChange={(open) => !open && setSubjectModalOpen(false)}>
                <DialogContent className="max-w-md gap-5 p-5 sm:p-6">
                    <DialogHeader>
                        <DialogTitle>{editingSubjectId ? 'Edit Subject' : 'Add Subject'}</DialogTitle>
                    </DialogHeader>

                    <form
                        noValidate
                        onSubmit={subjectForm.handleSubmit(submitSubject)}
                        className="flex flex-col gap-5"
                    >
                        <FormField
                            id="college-subject-name"
                            label="Subject Name"
                            required
                            error={subjectForm.formState.errors.name?.message}
                        >
                            {(aria) => (
                                <Input
                                    {...aria}
                                    {...subjectForm.register('name')}
                                    placeholder="e.g. Financial Accounting"
                                    autoFocus
                                    invalid={Boolean(subjectForm.formState.errors.name)}
                                />
                            )}
                        </FormField>

                        <FormField id="college-subject-description" label="Description">
                            {(aria) => (
                                <Textarea
                                    {...aria}
                                    {...subjectForm.register('description')}
                                    placeholder="Optional"
                                    rows={3}
                                />
                            )}
                        </FormField>

                        <FormField
                            id="college-subject-order"
                            label="Display Order"
                            error={subjectForm.formState.errors.orderIndex?.message}
                        >
                            {(aria) => (
                                <Input
                                    {...aria}
                                    type="number"
                                    min={0}
                                    {...subjectForm.register('orderIndex')}
                                    invalid={Boolean(subjectForm.formState.errors.orderIndex)}
                                />
                            )}
                        </FormField>

                        <Controller
                            name="isPublished"
                            control={subjectForm.control}
                            render={({ field }) => (
                                <label className="flex items-center gap-2 text-sm">
                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                    Published (visible to students)
                                </label>
                            )}
                        />

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => setSubjectModalOpen(false)}
                                disabled={submitLoading}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={submitLoading}>
                                {submitLoading && <Spinner />}
                                {editingSubjectId ? 'Update' : 'Add'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Chapter add/edit */}
            <Dialog open={chapterModalOpen} onOpenChange={(open) => !open && setChapterModalOpen(false)}>
                <DialogContent className="max-w-md gap-5 p-5 sm:p-6">
                    <DialogHeader>
                        <DialogTitle>{editingChapterId ? 'Edit Chapter' : 'Add Chapter'}</DialogTitle>
                    </DialogHeader>

                    <form
                        noValidate
                        onSubmit={chapterForm.handleSubmit(submitChapter)}
                        className="flex max-h-[70vh] flex-col gap-5 overflow-y-auto"
                    >
                        <FormField
                            id="college-chapter-name"
                            label="Chapter Name"
                            required
                            error={chapterForm.formState.errors.name?.message}
                        >
                            {(aria) => (
                                <Input
                                    {...aria}
                                    {...chapterForm.register('name')}
                                    placeholder="e.g. Introduction to Ledgers"
                                    autoFocus
                                    invalid={Boolean(chapterForm.formState.errors.name)}
                                />
                            )}
                        </FormField>

                        <FormField id="college-chapter-description" label="Description">
                            {(aria) => (
                                <Textarea
                                    {...aria}
                                    {...chapterForm.register('description')}
                                    placeholder="Optional"
                                    rows={2}
                                />
                            )}
                        </FormField>

                        <Controller
                            name="isFree"
                            control={chapterForm.control}
                            render={({ field }) => (
                                <label className="flex items-center gap-2 text-sm">
                                    <Checkbox
                                        checked={field.value}
                                        onCheckedChange={(checked) => {
                                            field.onChange(checked);
                                            // Keep the two fields consistent so the schema refine passes.
                                            if (checked) chapterForm.setValue('priceInRupees', 0);
                                        }}
                                    />
                                    Free chapter (no payment required)
                                </label>
                            )}
                        />

                        <FormField
                            id="college-chapter-price"
                            label="Price (₹)"
                            hint="Stored as paise. Ignored for free chapters."
                            error={chapterForm.formState.errors.priceInRupees?.message}
                        >
                            {(aria) => (
                                <Input
                                    {...aria}
                                    type="number"
                                    min={0}
                                    step="0.01"
                                    disabled={isFreeChapter}
                                    {...chapterForm.register('priceInRupees')}
                                    invalid={Boolean(chapterForm.formState.errors.priceInRupees)}
                                />
                            )}
                        </FormField>

                        <FormField
                            id="college-chapter-duration"
                            label="Access Duration (days)"
                            hint="Leave blank for no time limit."
                        >
                            {(aria) => (
                                <Input
                                    {...aria}
                                    type="number"
                                    min={1}
                                    placeholder="No limit"
                                    {...chapterForm.register('accessDurationDays')}
                                />
                            )}
                        </FormField>

                        <FormField
                            id="college-chapter-views"
                            label="View Limit"
                            hint="One view = one full pass through every video in the chapter. Blank for unlimited."
                        >
                            {(aria) => (
                                <Input
                                    {...aria}
                                    type="number"
                                    min={1}
                                    placeholder="Unlimited"
                                    {...chapterForm.register('maxViewCount')}
                                />
                            )}
                        </FormField>

                        <FormField
                            id="college-chapter-order"
                            label="Display Order"
                            error={chapterForm.formState.errors.orderIndex?.message}
                        >
                            {(aria) => (
                                <Input
                                    {...aria}
                                    type="number"
                                    min={0}
                                    {...chapterForm.register('orderIndex')}
                                    invalid={Boolean(chapterForm.formState.errors.orderIndex)}
                                />
                            )}
                        </FormField>

                        <Controller
                            name="isPublished"
                            control={chapterForm.control}
                            render={({ field }) => (
                                <label className="flex items-center gap-2 text-sm">
                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                    Published (visible to students)
                                </label>
                            )}
                        />

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => setChapterModalOpen(false)}
                                disabled={submitLoading}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={submitLoading}>
                                {submitLoading && <Spinner />}
                                {editingChapterId ? 'Update' : 'Add'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </PageShell>
        </TooltipProvider>
    );
};

export default CollegeCurriculum;
