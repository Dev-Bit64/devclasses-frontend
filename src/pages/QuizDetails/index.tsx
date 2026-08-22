import React, { useState, useEffect } from 'react';
import { BookOpen, FileText, Hash, Rocket } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { getchaptersBySubjectIdAction } from '../../redux/action/subjectAction';
import { startExamAction, getSubjectsForExamAction } from '../../redux/action/examAction';
import CustomDropdown, { DropdownOption } from '../../components/ImportModal/CustomDropdown';
import { PageShell } from '../../components/common/PageShell';
import { Card } from '../../components/ui/card';
import { Label } from '../../components/ui/label';
import { Button } from '../../components/ui/button';
import { Spinner } from '../../components/ui/spinner';
import { toastText } from '../../utils/toast';

const QuizDetailsPage: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Get user info from localStorage
    const getUserInfo = () => {
        try {
            const userInfo = localStorage.getItem('user');
            return userInfo ? JSON.parse(userInfo) : null;
        } catch (error) {
            console.error('Error parsing userInfo from localStorage:', error);
            return null;
        }
    };

    const userInfo = getUserInfo();
    const userBoard = userInfo?.board || 'CBSE';
    const userStandard = userInfo?.standard || '10';

    // Redux state selectors
    const { chapterLists } = useSelector((state: RootState) => state.subject);
    const { isLoading: examLoading, examSubjectsList } = useSelector((state: RootState) => state.exam);

    // Local component state
    const [selectedSubject, setSelectedSubject] = useState<string>('');
    const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
    const [selectedChapter, setSelectedChapter] = useState<string>('');
    const [selectedChapterId, setSelectedChapterId] = useState<string>('');
    const [selectedQuestions, setSelectedQuestions] = useState<number | undefined>();
    const [loading, setLoading] = useState(false);

    // Question number options
    const questionNumbers = [
        { value: 5, label: '5 Questions' },
        { value: 10, label: '10 Questions' },
        { value: 15, label: '15 Questions' },
    ];

    /**
     * Fetch subjects on component mount
     * This populates the subject dropdown with data from the API
     * Uses getSubjectsForExamAction to fetch subjects based on board and standard from localStorage
     */
    useEffect(() => {
        // Fetch subjects for exam with board and standard from localStorage
        if (userBoard) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            dispatch(getSubjectsForExamAction({ board: userBoard}) as any);
        }
    }, [dispatch, userBoard]);

    /**
     * Handle subject selection
     * - Updates selected subject state
     * - Resets chapter selection
     * - Fetches chapters for the selected subject
     */
    const handleSubjectChange = (value: string) => {
        setSelectedSubject(value);
        setSelectedSubjectId(value);
        setSelectedChapter('');
        setSelectedChapterId('');

        // Fetch chapters for the selected subject
        if (value) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            dispatch(getchaptersBySubjectIdAction(value) as any);
        }
    };

    /**
     * Handle chapter selection
     */
    const handleChapterChange = (value: string) => {
        setSelectedChapter(value);
        setSelectedChapterId(value);
    };

    /**
     * Handle question count selection
     */
    const handleQuestionsChange = (value: number) => {
        setSelectedQuestions(value);
    };

    /**
     * Handle form submission - Start Exam
     * - Calls startExamAction API to create exam session
     * - Uses board and standard from localStorage userInfo
     * - Stores examId in Redux state
     * - Navigates to Test page to begin quiz
     * - Handles errors with user-friendly messages
     */
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);

        try {
            // Prepare payload for startExam API
            // Uses board and standard from localStorage userInfo
            const payload = {
                board: userBoard,
                standard: userStandard,
                subject: selectedSubjectId,
                chapter: selectedChapterId,
                numberOfQuestions: selectedQuestions || 5,
            };

            // Call the startExam API to create exam session
            // This returns examId, totalQuestions, and startedAt
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const result = await dispatch(startExamAction(payload) as any);

            if (result.payload?.statusCode === 200) {
                // Navigate to test page after a short delay
                // The examId is now stored in Redux state
                setTimeout(() => {
                    navigate('/quiz');
                }, 1000);
            } else {
                toastText('Failed to start exam. Please try again.', 'error');
            }

        } catch (error) {
            toastText('Failed to start exam. Please try again.', 'error');
            console.error('Error starting exam:', error);
        } finally {
            setLoading(false);
        }
    };

    // Convert subjects to dropdown options
    // Uses examSubjectsList from getSubjectsForExamAction
    // Ensure examSubjectsList is always an array to prevent .map errors
    // Normalize subject fields (some APIs return `id` / `_id` and `subname` / `subjectName`)
    const subjectOptions: DropdownOption[] = Array.isArray(examSubjectsList)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ? examSubjectsList.map((subject: any) => ({
            value: String(subject.id ?? subject._id ?? subject.value ?? ''),
            label: subject.subname ?? subject.subjectName ?? subject.name ?? subject.label ?? '',
        }))
        : [];

    // Convert chapters to dropdown options
    // Support multiple API shapes: { _id, chapterName } or { id, name }
    const chapterOptions: DropdownOption[] = Array.isArray(chapterLists)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ? chapterLists.map((chapter: any) => ({
            value: String(chapter._id ?? chapter.id ?? chapter.value ?? ''),
            label: chapter.chapterName ?? chapter.name ?? chapter.label ?? '',
        }))
        : [];

    // Convert question numbers to dropdown options
    const questionOptions: DropdownOption[] = questionNumbers.map((q) => ({
        value: String(q.value),
        label: `${q.label}`,
    }));

    const isSubmitDisabled = !selectedSubject || !selectedChapter || !selectedQuestions;
    const isBusy = loading || examLoading;

    return (
        <PageShell className="max-w-2xl">
            <div className="flex flex-col gap-2 text-center">
                <h1 className="dc-h1">Create your test</h1>
                <p className="dc-small">
                    Choose a subject, chapter and length — we will build the paper for you.
                </p>
            </div>

            <Card className="p-5 sm:p-7">
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    {/* Subject Dropdown */}
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="quiz-subject" required>
                            <span className="inline-flex items-center gap-2">
                                <BookOpen aria-hidden="true" className="size-4 text-primary" />
                                Choose your subject
                            </span>
                        </Label>
                        <CustomDropdown
                            id="quiz-subject"
                            options={subjectOptions}
                            value={selectedSubject}
                            onChange={handleSubjectChange}
                            placeholder="Select a subject to get started"
                            size="large"
                        />
                    </div>

                    {/* Chapter Dropdown */}
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="quiz-chapter" required>
                            <span className="inline-flex items-center gap-2">
                                <FileText aria-hidden="true" className="size-4 text-primary" />
                                Select chapter
                            </span>
                        </Label>
                        <CustomDropdown
                            id="quiz-chapter"
                            options={chapterOptions}
                            value={selectedChapter}
                            onChange={handleChapterChange}
                            placeholder={selectedSubject ? 'Choose your chapter' : 'Select a subject first'}
                            disabled={!selectedSubject}
                            size="large"
                        />
                    </div>

                    {/* Questions Count Dropdown */}
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="quiz-count" required>
                            <span className="inline-flex items-center gap-2">
                                <Hash aria-hidden="true" className="size-4 text-primary" />
                                Number of questions
                            </span>
                        </Label>
                        <CustomDropdown
                            id="quiz-count"
                            options={questionOptions}
                            value={selectedQuestions?.toString() || ''}
                            onChange={(value) => handleQuestionsChange(parseInt(value))}
                            placeholder="How many questions would you like?"
                            size="large"
                        />
                        {/* Each question is timed at one minute, matching how the exam clock is set. */}
                        <p className="dc-caption">You get one minute per question.</p>
                    </div>

                    {/* Generate Exam Button */}
                    <Button
                        type="submit"
                        size="lg"
                        block
                        className="mt-1"
                        disabled={isSubmitDisabled || isBusy}
                    >
                        {isBusy ? <Spinner /> : <Rocket aria-hidden="true" />}
                        {isBusy ? 'Generating your test...' : 'Generate exam'}
                    </Button>
                </form>
            </Card>
        </PageShell>
    );
};

export default QuizDetailsPage;
