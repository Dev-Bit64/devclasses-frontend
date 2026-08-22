import React, { useState, useEffect, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { PageShell } from '../../components/common/PageShell';
import { LoadingState as SharedLoadingState } from '../../components/common/LoadingState';
const ActionSection = React.lazy(() => import('../../components/YourResult/ActionSection'));
const ErrorState = React.lazy(() => import('../../components/YourResult/ErrorState'));
const LoadingState = React.lazy(() => import('../../components/YourResult/LoadingState'));
const ResultHeader = React.lazy(() => import('../../components/YourResult/ResultHeader'));
const ScoreCard = React.lazy(() => import('../../components/YourResult/ScoreCard'));
const StatsCards = React.lazy(() => import('../../components/YourResult/StatsCards'));
const DetailedResults = React.lazy(() => import('../../components/YourResult/DetailedResults'));
const ExamInfo = React.lazy(() => import('../../components/YourResult/ExamInfo'));

/**
 * Interface for quiz result data used in the component
 * Simplified version of ExamResult for component props
 */
interface QuizResultData {
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  score: number;
}

// Shared fallback while a lazily loaded section resolves.
const SectionFallback = () => <SharedLoadingState className="py-8" />;

const YourResult: React.FC = () => {
  const navigate = useNavigate();

  // Get exam result from Redux store
  const { examResult } = useSelector((state: RootState) => state.exam);

  const [resultData, setResultData] = useState<QuizResultData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  /**
   * Effect to process exam result from Redux
   * Converts ExamResult to QuizResultData format for component display
   */
  useEffect(() => {
    const processResults = async () => {
      try {
        setLoading(true);
        setShowContent(false);

        // Check if exam result exists in Redux
        if (!examResult) {
          console.warn('No exam result found in Redux state');
          setError(true);
          setLoading(false);
          return;
        }

        // Add a small delay for smooth transition
        await new Promise(resolve => setTimeout(resolve, 800));

        // Calculate correct answers from score and total questions
        const correctAnswers = examResult.score;

        // Transform exam result to component format
        const transformedResults: QuizResultData = {
          totalQuestions: examResult.totalQuestions,
          correctAnswers: correctAnswers,
          wrongAnswers: examResult.wrongAnswers,
          score: examResult.score,
        };

        setResultData(transformedResults);
      } catch (err) {
        setError(true);
        console.error('Error processing results:', err);
      } finally {
        setLoading(false);
        setTimeout(() => setShowContent(true), 300);
      }
    };

    processResults();

    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 600);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [examResult]);

  const handleReturnToDashboard = () => {
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <Suspense fallback={<SectionFallback />}>
        <LoadingState />
      </Suspense>
    );
  }

  if (error || !resultData) {
    return (
      <Suspense fallback={<SectionFallback />}>
        <ErrorState onReturnToDashboard={handleReturnToDashboard} />
      </Suspense>
    );
  }

  const { totalQuestions, correctAnswers, wrongAnswers } = resultData;
  const scorePercentage = Math.round((correctAnswers / totalQuestions) * 100);

  return (
    <PageShell
      className={`max-w-4xl transition-opacity duration-500 ${showContent ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
    >
      <Suspense fallback={<SectionFallback />}>
        <ResultHeader scorePercentage={scorePercentage} />
      </Suspense>

      {/* Exam Information Section - Shows board, standard, date, etc. */}
      {examResult && (
        <Suspense fallback={<SectionFallback />}>
          <ExamInfo examResult={examResult} />
        </Suspense>
      )}

      <Suspense fallback={<SectionFallback />}>
        <ScoreCard
          scorePercentage={scorePercentage}
          correctAnswers={correctAnswers}
          totalQuestions={totalQuestions}
          isSmallScreen={isSmallScreen}
        />
      </Suspense>

      <Suspense fallback={<SectionFallback />}>
        <StatsCards
          totalQuestions={totalQuestions}
          correctAnswers={correctAnswers}
          wrongAnswers={wrongAnswers}
        />
      </Suspense>

      {/* Detailed Results Section - Shows question-by-question breakdown */}
      {examResult && examResult.detailedResults && examResult.detailedResults.length > 0 && (
        <Suspense fallback={<SectionFallback />}>
          <DetailedResults detailedResults={examResult.detailedResults} />
        </Suspense>
      )}

      <Suspense fallback={<SectionFallback />}>
        <ActionSection onReturnToDashboard={handleReturnToDashboard} />
      </Suspense>
    </PageShell>
  );
};

export default YourResult;
