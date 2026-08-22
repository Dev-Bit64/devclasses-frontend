import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Check, FileQuestion } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../redux/store';
import { getQuestionAction, submitExamAction } from '../../redux/action/examAction';
import { ExamLayout } from '../../components/layout/ExamLayout';
import { AnswerOption } from '../../components/exam/AnswerOption';
import { RadioGroup } from '../../components/ui/radio-group';
import { Button } from '../../components/ui/button';
import { Spinner } from '../../components/ui/spinner';
import { Card } from '../../components/ui/card';
import { Skeleton } from '../../components/ui/skeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { PageShell } from '../../components/common/PageShell';
import { toastText } from '../../utils/toast';

/**
 * Question interface for MCQ questions
 * Represents the structure of exam questions from the API
 * Updated to match backend response format with options as object
 */
interface Question {
  id: string;
  question: string;
  options: {
    [key: string]: string; // Support both "A" and "OPTIONA" formats
  };
  page: number;
  totalPages: number;
}

const TestPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Get exam session data from Redux store
  const { examId, totalQuestions, currentQuestion, isLoading } = useSelector((state: RootState) => state.exam);

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
  const userId = userInfo?.id || '';

  // Local state management
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0); // Will be set based on totalQuestions
  const [questionData, setQuestionData] = useState<Question | null>(null);

  /**
   * Initialize timer based on number of questions
   * 1 minute per question (e.g., 5 questions = 5 minutes)
   */
  useEffect(() => {
    if (totalQuestions && totalQuestions > 0) {
      setTimeLeft(totalQuestions * 60 * 1000); // Convert minutes to milliseconds
    }
  }, [totalQuestions]);

  /**
   * Check if exam session exists, redirect if not
   */
  useEffect(() => {
    if (!examId) {
      toastText('No active exam session. Please start a new exam.', 'error');
      setTimeout(() => {
        navigate('/quiz-details');
      }, 2000);
    }
  }, [examId, navigate]);

  /**
   * Fetch question when page changes or component mounts
   */
  useEffect(() => {
    if (examId && currentPage) {
      fetchQuestion(currentPage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examId, currentPage]);

  /**
   * Update local question data when Redux state changes
   */
  useEffect(() => {
    if (currentQuestion) {
      setQuestionData(currentQuestion);
    }
  }, [currentQuestion]);

  /**
   * Fetch a single question by page number
   */
  const fetchQuestion = async (page: number) => {
    if (!examId) return;

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await dispatch(getQuestionAction({ examId, page }) as any);
    } catch (error) {
      toastText('Failed to fetch question. Please try again.', 'error');
      console.error('Error fetching question:', error);
    }
  };

  /**
   * Timer effect - Auto-submit when time runs out
   * Countdown timer for the exam duration
   * Timer starts only when we have a valid exam session
   */
  useEffect(() => {
    if (!examId || timeLeft === 0) return; // Don't start timer if no exam or time not set

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1000) {
          handleSubmit(); // Auto-submit when time runs out
          return 0;
        }
        return prevTime - 1000;
      });
    }, 1000);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examId, timeLeft]);

  /**
   * Handle answer selection for current question
   * Stores the selected option in OPTIONA/OPTIONB/OPTIONC/OPTIOND format
   * Backend accepts this format and normalizes it internally
   */
  const handleAnswerChange = (value: string) => {
    if (!questionData) return;

    // Always transform to OPTIONA/OPTIONB/OPTIONC/OPTIOND format for payload
    // Backend on line 78-91 of examService.ts accepts and normalizes this format
    let transformedValue = value;
    if (["A", "B", "C", "D"].includes(value.toUpperCase())) {
      // "A" -> "OPTIONA"
      transformedValue = `OPTION${value.toUpperCase()}`;
    } else if (value.toUpperCase().startsWith('OPTION')) {
      // "OPTIONA" -> "OPTIONA" (ensure uppercase)
      transformedValue = value.toUpperCase();
    }

    setSelectedAnswers(prev => ({
      ...prev,
      [questionData.id]: transformedValue
    }));
  };

  /**
   * Navigate to previous question
   */
  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  /**
   * Navigate to next question
   */
  const handleNext = () => {
    if (totalQuestions && currentPage < totalQuestions) {
      setCurrentPage(currentPage + 1);
    }
  };

  /**
   * Submit exam answers and generate result
   * Converts selected answers to API format and calls submitExamAction
   */
  const handleSubmit = async () => {
    if (!examId || !userId) {
      toastText('Missing exam session or user information.', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      // Convert answers to API format
      // selectedAnswers: { questionId: "OPTIONA" | "OPTIONB" | "OPTIONC" | "OPTIOND" }
      // API expects: { questionId: string, selectedOption: string }[]
      const answers = Object.entries(selectedAnswers).map(([questionId, selectedOption]) => ({
        questionId,
        selectedOption
      }));

      // Call submit exam API
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await dispatch(submitExamAction({ userId, examId, answers }) as any);

      if (result.payload?.statusCode === 200) {
        toastText('Test submitted successfully!', 'success');

        // Navigate to result page
        setTimeout(() => {
          navigate('/your-result');
        }, 1000);
      } else {
        toastText('Failed to submit test. Please try again.', 'error');
      }

    } catch (error) {
      toastText('Failed to submit test. Please try again.', 'error');
      console.error('Error submitting exam:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLastQuestion = totalQuestions ? currentPage === totalQuestions : false;
  const isFirstQuestion = currentPage === 1;
  const hasAnsweredCurrent = questionData ? selectedAnswers[questionData.id] !== undefined : false;

  // Show empty state if no exam session
  if (!examId) {
    return (
      <PageShell>
        <EmptyState
          icon={FileQuestion}
          title="No Active Exam Session"
          description="Start a new exam to begin practising."
          action={
            <Button onClick={() => navigate('/quiz-details')}>Start a New Exam</Button>
          }
        />
      </PageShell>
    );
  }

  // Show loading state while fetching question
  if (isLoading || !questionData) {
    return (
      <ExamLayout current={currentPage} total={totalQuestions} msLeft={timeLeft}>
        <Card className="flex flex-col gap-5 p-5 sm:p-6">
          <Skeleton className="h-5 w-32" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-4/5" />
          </div>
          <div className="flex flex-col gap-2.5">
            {Array.from({ length: 4 }, (_, index) => (
              <Skeleton key={index} className="h-14 w-full rounded-xl" />
            ))}
          </div>
        </Card>
      </ExamLayout>
    );
  }

  const selectedValue = selectedAnswers[questionData.id] || '';

  return (
    <ExamLayout
      current={currentPage}
      total={totalQuestions}
      msLeft={timeLeft}
      footer={
        <div className="flex items-center justify-between gap-3">
          <Button
            variant="secondary"
            onClick={handlePrevious}
            disabled={isFirstQuestion || isLoading}
          >
            <ChevronLeft aria-hidden="true" />
            <span className="hidden sm:inline">Previous</span>
            <span className="sm:hidden">Back</span>
          </Button>

          {/* Question progress indicator */}
          <span className="dc-caption dc-numeric hidden sm:block">
            Question {currentPage} of {totalQuestions}
          </span>

          {/* Submit or Next button based on question position */}
          {isLastQuestion ? (
            <Button
              onClick={handleSubmit}
              disabled={!hasAnsweredCurrent || isLoading || isSubmitting}
            >
              {isSubmitting ? <Spinner /> : <Check aria-hidden="true" />}
              {isSubmitting ? 'Submitting...' : 'Submit Test'}
            </Button>
          ) : (
            <Button onClick={handleNext} disabled={!hasAnsweredCurrent || isLoading}>
              Next
              <ChevronRight aria-hidden="true" />
            </Button>
          )}
        </div>
      }
    >
      <Card className="flex flex-col gap-5 p-5 sm:gap-6 sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="dc-label">Question {currentPage}</span>
          <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
            Multiple Choice
          </span>
        </div>

        {/* Long question text wraps naturally rather than being clipped to a fixed height. */}
        <p className="break-words text-base font-medium leading-relaxed text-foreground sm:text-lg">
          {questionData.question}
        </p>

        <RadioGroup
          value={selectedValue}
          onValueChange={handleAnswerChange}
          aria-label={`Answer options for question ${currentPage}`}
          className="gap-2.5"
        >
          {Object.entries(questionData.options).map(([key, value]) => {
            // Handle both formats: "A" or "OPTIONA"
            // Extract letter for display: "OPTIONA" -> "A", or "A" -> "A"
            const optionLetter = key.startsWith('OPTION') ? key.replace('OPTION', '') : key;
            // Normalize option value to standard OPTION[A-D] format for consistent selection matching
            const optionValue = key.toUpperCase().startsWith('OPTION') ? key.toUpperCase() : `OPTION${key.toUpperCase()}`;

            return (
              <AnswerOption
                key={key}
                id={`${questionData.id}-${key}`}
                value={optionValue}
                letter={optionLetter}
                label={value}
                selected={selectedValue === optionValue}
              />
            );
          })}
        </RadioGroup>
      </Card>
    </ExamLayout>
  );
};

export default TestPage;
