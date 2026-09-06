import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Film, ListChecks, NotebookText } from 'lucide-react';

import { PageShell } from '../../components/common/PageShell';
import { PageHeader } from '../../components/common/PageHeader';
import ChapterPicker, { ChapterSelection } from '../../components/college/ChapterPicker';
import VideosPanel from '../../components/college/VideosPanel';
import NotesPanel from '../../components/college/NotesPanel';
import PracticePanel from '../../components/college/PracticePanel';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { TooltipProvider } from '../../components/ui/tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';

/** The three kinds of content a chapter carries. Also the `tab` value in the query string. */
const TABS = ['videos', 'notes', 'practice'] as const;
type ContentTab = (typeof TABS)[number];

const isContentTab = (value: string | null): value is ContentTab =>
    TABS.includes(value as ContentTab);

const TAB_META: Record<ContentTab, { label: string; icon: typeof Film }> = {
    videos: { label: 'Videos', icon: Film },
    notes: { label: 'Notes', icon: NotebookText },
    practice: { label: 'Practice', icon: ListChecks },
};

/**
 * One screen for everything that hangs off a chapter.
 * Videos, notes and practice questions are three tables over the same chapter, so the
 * course → semester → subject → chapter cascade is picked once here rather than repeated on
 * three separate screens. Each tab owns its own data, dialogs and actions.
 */
const CollegeContent = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    // Deep link from the curriculum page: read once, then the picker owns the selection.
    const initialSelection = useRef({
        courseId: searchParams.get('courseId') ?? undefined,
        semesterId: searchParams.get('semesterId') ?? undefined,
        subjectId: searchParams.get('subjectId') ?? undefined,
        chapterId: searchParams.get('chapterId') ?? undefined,
    }).current;

    const initialTab = searchParams.get('tab');
    const [tab, setTab] = useState<ContentTab>(isContentTab(initialTab) ? initialTab : 'videos');

    const [selection, setSelection] = useState<ChapterSelection | null>(null);
    // Null until a tab has actually loaded; a tab label should not claim "0" before it knows.
    const [counts, setCounts] = useState<Record<ContentTab, number | null>>({
        videos: null, notes: null, practice: null,
    });

    const chapterId = selection?.chapterId ?? '';

    const handleSelectionChange = useCallback((next: ChapterSelection) => {
        setSelection(next);
    }, []);

    // Tied to the chapter id rather than to the picker's callback: re-picking the same chapter
    // reports a fresh selection object, and blanking the counts there would leave the tab
    // labels empty, since the panels have no reason to reload.
    useEffect(() => {
        setCounts({ videos: null, notes: null, practice: null });
    }, [chapterId]);

    // Keeping the tab in the query string means a reload, a bookmark or a back button all
    // come back to the tab the admin was on rather than to Videos.
    const handleTabChange = (value: string) => {
        if (!isContentTab(value)) return;
        setTab(value);
        const next = new URLSearchParams(searchParams);
        next.set('tab', value);
        setSearchParams(next, { replace: true });
    };

    // One stable callback per tab, so a panel reporting its count never re-runs its loader.
    const setVideoCount = useCallback((count: number) => {
        setCounts((prev) => ({ ...prev, videos: count }));
    }, []);
    const setNoteCount = useCallback((count: number) => {
        setCounts((prev) => ({ ...prev, notes: count }));
    }, []);
    const setPracticeCount = useCallback((count: number) => {
        setCounts((prev) => ({ ...prev, practice: count }));
    }, []);

    const hiddenUnless = (key: ContentTab) => (tab === key ? undefined : 'hidden');

    // The tab lives in the URL, so a back button that only changes the query string still has
    // to move the tab — nothing else re-renders this page in that case.
    useEffect(() => {
        const fromUrl = searchParams.get('tab');
        if (isContentTab(fromUrl) && fromUrl !== tab) {
            setTab(fromUrl);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]);

    return (
        <TooltipProvider delayDuration={150}>
            <PageShell>
                <PageHeader
                    title="Chapter Content"
                    description="Everything students see inside a chapter. Pick a chapter, then work through its videos, notes and practice questions."
                />

                <ChapterPicker onChange={handleSelectionChange} initial={initialSelection} />

                {selection?.chapter && (
                    <Card className="flex flex-wrap items-center gap-3 p-4">
                        <span className="font-medium">{selection.chapter.name}</span>
                        {selection.chapter.isPublished
                            ? <Badge variant="success">Published</Badge>
                            : <Badge variant="outline">Draft</Badge>}
                        <span className="text-xs text-muted-foreground">
                            {selection.chapter.isFree ? 'Free chapter' : 'Paid chapter'}
                        </span>
                    </Card>
                )}

                {!chapterId && (
                    <Card className="flex flex-col items-center gap-2 p-10 text-center">
                        <p className="font-medium">Select a chapter</p>
                        <p className="dc-small">
                            Choose a course, semester, subject and chapter above to manage its content.
                        </p>
                    </Card>
                )}

                {chapterId && (
                    <Tabs value={tab} onValueChange={handleTabChange}>
                        <TabsList>
                            {TABS.map((key) => {
                                const { label, icon: Icon } = TAB_META[key];
                                const count = counts[key];
                                return (
                                    <TabsTrigger key={key} value={key} className="flex items-center gap-2">
                                        <Icon aria-hidden="true" className="size-4" />
                                        {label}
                                        {count !== null && (
                                            <span className="text-xs text-muted-foreground">{count}</span>
                                        )}
                                    </TabsTrigger>
                                );
                            })}
                        </TabsList>

                        {/* All three mount together so every tab label carries a real count and
                            switching tabs does not re-fetch. `forceMount` keeps them mounted but
                            leaves them all visible, so the inactive ones are hidden here — and
                            `display: none` takes them out of the tab order too. `key` on the
                            chapter id drops any open dialog or row selection when it changes. */}
                        <TabsContent value="videos" forceMount className={hiddenUnless('videos')}>
                            <VideosPanel
                                key={chapterId}
                                chapterId={chapterId}
                                onCountChange={setVideoCount}
                            />
                        </TabsContent>

                        <TabsContent value="notes" forceMount className={hiddenUnless('notes')}>
                            <NotesPanel
                                key={chapterId}
                                chapterId={chapterId}
                                onCountChange={setNoteCount}
                            />
                        </TabsContent>

                        <TabsContent value="practice" forceMount className={hiddenUnless('practice')}>
                            <PracticePanel
                                key={chapterId}
                                chapterId={chapterId}
                                onCountChange={setPracticeCount}
                            />
                        </TabsContent>
                    </Tabs>
                )}
            </PageShell>
        </TooltipProvider>
    );
};

export default CollegeContent;
