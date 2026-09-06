/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';

import { AppDispatch } from '../../redux/store';
import {
    getCollegeChaptersAction,
    getCollegeCoursesAction,
    getCollegeSemestersAction,
    getCollegeSubjectsAction,
} from '../../redux/action/collegeCatalogAction';

import { Card } from '../ui/card';
import CustomDropdown, { DropdownOption } from '../ImportModal/CustomDropdown';

/** What the picker reports upward. `chapter` is the raw catalog row, or null when cleared. */
export interface ChapterSelection {
    courseId: string;
    semesterId: string;
    subjectId: string;
    chapterId: string;
    chapter: any | null;
}

/** Pre-selection, e.g. from the query string when arriving from the curriculum page. */
export interface ChapterPickerInitial {
    courseId?: string;
    semesterId?: string;
    subjectId?: string;
    chapterId?: string;
}

export interface ChapterPickerProps {
    onChange: (selection: ChapterSelection) => void;
    initial?: ChapterPickerInitial;
}

/**
 * Course → semester → subject → chapter cascade.
 * Shared by the video and practice-question screens: both manage content that hangs off a
 * single chapter, and neither should re-implement four dependent dropdowns.
 * It selects; it never owns the content below it.
 */
const ChapterPicker = ({ onChange, initial }: ChapterPickerProps) => {
    const dispatch = useDispatch<AppDispatch>();

    const [courseOptions, setCourseOptions] = useState<DropdownOption[]>([]);
    const [semesterOptions, setSemesterOptions] = useState<DropdownOption[]>([]);
    const [subjectOptions, setSubjectOptions] = useState<DropdownOption[]>([]);
    const [chapters, setChapters] = useState<any[]>([]);

    const [courseId, setCourseId] = useState('');
    const [semesterId, setSemesterId] = useState('');
    const [subjectId, setSubjectId] = useState('');
    const [chapterId, setChapterId] = useState('');

    // The deep-link ids are consumed once, level by level, as each list arrives. Holding them
    // in a ref keeps them out of the effect dependencies that would otherwise re-apply them
    // every time the admin changes a dropdown by hand.
    const pending = useRef<ChapterPickerInitial>({ ...initial });

    // Kept in a ref so the loaders below do not re-run whenever the parent re-renders with a
    // fresh callback identity.
    const onChangeRef = useRef(onChange);
    useEffect(() => {
        onChangeRef.current = onChange;
    }, [onChange]);

    const report = useCallback((next: Partial<ChapterSelection>, chapterList: any[]) => {
        const selection: ChapterSelection = {
            courseId: next.courseId ?? '',
            semesterId: next.semesterId ?? '',
            subjectId: next.subjectId ?? '',
            chapterId: next.chapterId ?? '',
            chapter: chapterList.find((row) => row.id === next.chapterId) ?? null,
        };
        onChangeRef.current(selection);
    }, []);

    // ---- Loaders -----------------------------------------------------------

    useEffect(() => {
        let cancelled = false;

        (async () => {
            const result: any = await dispatch(getCollegeCoursesAction());
            if (cancelled || !result.payload || result.payload.statusCode !== 200) return;

            const options = (result.payload.data ?? []).map((course: any) => ({
                value: course.id,
                label: course.name,
            }));
            setCourseOptions(options);

            const wanted = pending.current.courseId;
            pending.current.courseId = undefined;
            if (wanted && options.some((option: DropdownOption) => option.value === wanted)) {
                setCourseId(wanted);
            } else if (options.length === 1) {
                // The B.Com-only case: making the admin pick from a list of one is noise.
                setCourseId(options[0].value);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [dispatch]);

    useEffect(() => {
        if (!courseId) return;
        let cancelled = false;

        setSemesterId('');
        setSubjectId('');
        setChapterId('');
        setSubjectOptions([]);
        setChapters([]);

        (async () => {
            const result: any = await dispatch(getCollegeSemestersAction(courseId));
            if (cancelled || !result.payload || result.payload.statusCode !== 200) return;

            const options = (result.payload.data ?? []).map((semester: any) => ({
                value: semester.id,
                label: semester.title ? `Sem ${semester.number} — ${semester.title}` : `Semester ${semester.number}`,
            }));
            setSemesterOptions(options);

            const wanted = pending.current.semesterId;
            pending.current.semesterId = undefined;
            if (wanted && options.some((option: DropdownOption) => option.value === wanted)) {
                setSemesterId(wanted);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [courseId, dispatch]);

    useEffect(() => {
        if (!semesterId) return;
        let cancelled = false;

        setSubjectId('');
        setChapterId('');
        setChapters([]);

        (async () => {
            const result: any = await dispatch(getCollegeSubjectsAction(semesterId));
            if (cancelled || !result.payload || result.payload.statusCode !== 200) return;

            const options = (result.payload.data ?? []).map((subject: any) => ({
                value: subject.id,
                label: subject.name,
            }));
            setSubjectOptions(options);

            const wanted = pending.current.subjectId;
            pending.current.subjectId = undefined;
            if (wanted && options.some((option: DropdownOption) => option.value === wanted)) {
                setSubjectId(wanted);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [semesterId, dispatch]);

    useEffect(() => {
        if (!subjectId) return;
        let cancelled = false;

        setChapterId('');

        (async () => {
            const result: any = await dispatch(getCollegeChaptersAction(subjectId));
            if (cancelled || !result.payload || result.payload.statusCode !== 200) return;

            const rows = result.payload.data ?? [];
            setChapters(rows);

            const wanted = pending.current.chapterId;
            pending.current.chapterId = undefined;
            if (wanted && rows.some((row: any) => row.id === wanted)) {
                setChapterId(wanted);
                report({ courseId, semesterId, subjectId, chapterId: wanted }, rows);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [subjectId, courseId, semesterId, dispatch, report]);

    // Clearing a level upstream must clear the content below it, not leave it stranded.
    useEffect(() => {
        if (!chapterId) {
            report({ courseId, semesterId, subjectId, chapterId: '' }, chapters);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [chapterId]);

    const handleChapterChange = (value: string) => {
        setChapterId(value);
        report({ courseId, semesterId, subjectId, chapterId: value }, chapters);
    };

    return (
        <Card className="p-4 sm:p-5">
            {/* One column on a phone, two on a tablet, four on a desktop — the four levels
                stay readable rather than being squeezed onto one line. */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <CustomDropdown
                    options={courseOptions}
                    value={courseId}
                    onChange={setCourseId}
                    placeholder="Select Course"
                />
                <CustomDropdown
                    options={semesterOptions}
                    value={semesterId}
                    onChange={setSemesterId}
                    placeholder="Select Semester"
                    disabled={!courseId}
                />
                <CustomDropdown
                    options={subjectOptions}
                    value={subjectId}
                    onChange={setSubjectId}
                    placeholder="Select Subject"
                    disabled={!semesterId}
                />
                <CustomDropdown
                    options={chapters.map((chapter: any) => ({
                        value: chapter.id,
                        // Draft chapters are marked here, so an admin is never surprised that
                        // published content still is not reaching students.
                        label: chapter.isPublished ? chapter.name : `${chapter.name} (draft)`,
                    }))}
                    value={chapterId}
                    onChange={handleChapterChange}
                    placeholder="Select Chapter"
                    disabled={!subjectId}
                />
            </div>
        </Card>
    );
};

export default ChapterPicker;
