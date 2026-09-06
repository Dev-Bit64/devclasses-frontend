/**
 * What the chapter content tabs receive from the page above them.
 * The page owns the course → semester → subject → chapter cascade; a panel only ever sees
 * the chapter that came out of it, and reports its row count back so the tab can be labelled.
 */
export interface ChapterContentPanelProps {
    chapterId: string;
    onCountChange?: (count: number) => void;
}
