
import React, { useState, useEffect, Suspense } from 'react';
import { Row, Col } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
const ActionSection = React.lazy(() => import('../../components/YourResult/ActionSection'));
const ErrorState = React.lazy(() => import('../../components/YourResult/ErrorState'));
const LoadingState = React.lazy(() => import('../../components/YourResult/LoadingState'));
const ResultHeader = React.lazy(() => import('../../components/YourResult/ResultHeader'));
const ScoreCard = React.lazy(() => import('../../components/YourResult/ScoreCard'));
const StatsCards = React.lazy(() => import('../../components/YourResult/StatsCards'));
const DetailedResults = React.lazy(() => import('../../components/YourResult/DetailedResults'));
const ExamInfo = React.lazy(() => import('../../components/YourResult/ExamInfo'));
import './index.scss';

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
      <Suspense fallback={<div style={{padding: '2rem', textAlign: 'center'}}>Loading...</div>}>
        <LoadingState />
      </Suspense>
    );
  }

  if (error || !resultData) {
    return (
      <Suspense fallback={<div style={{padding: '2rem', textAlign: 'center'}}>Loading...</div>}>
        <ErrorState onReturnToDashboard={handleReturnToDashboard} />
      </Suspense>
    );
  }

  const { totalQuestions, correctAnswers, wrongAnswers } = resultData;
  const scorePercentage = Math.round((correctAnswers / totalQuestions) * 100);

  return (
    <div className={`your-result ${showContent ? "animate-fade-in" : "opacity-0 pointer-events-none"}`}>
      <Suspense fallback={<div style={{padding: '2rem', textAlign: 'center'}}>Loading...</div>}>
        <ResultHeader scorePercentage={scorePercentage} />
      </Suspense>
      <div className="result-content">
        <Row gutter={[24, 24]} justify="center" className="fade-cards-row">
          {/* Exam Information Section - Shows board, standard, date, etc. */}
          {examResult && (
            <Col xs={24} sm={24} md={22} lg={20} xl={18}>
              <Suspense fallback={<div style={{padding: '2rem', textAlign: 'center'}}>Loading...</div>}>
                <ExamInfo examResult={examResult} />
              </Suspense>
            </Col>
          )}

          <Col xs={24} sm={24} md={22} lg={20} xl={18}>
            <Suspense fallback={<div style={{padding: '2rem', textAlign: 'center'}}>Loading...</div>}>
              <ScoreCard
                scorePercentage={scorePercentage}
                correctAnswers={correctAnswers}
                totalQuestions={totalQuestions}
                isSmallScreen={isSmallScreen}
              />
            </Suspense>
          </Col>
          <Col xs={24} sm={24} md={22} lg={20} xl={18}>
            <Suspense fallback={<div style={{padding: '2rem', textAlign: 'center'}}>Loading...</div>}>
              <StatsCards
                totalQuestions={totalQuestions}
                correctAnswers={correctAnswers}
                wrongAnswers={wrongAnswers}
              />
            </Suspense>
          </Col>

          {/* Detailed Results Section - Shows question-by-question breakdown */}
          {examResult && examResult.detailedResults && examResult.detailedResults.length > 0 && (
            <Col xs={24} sm={24} md={22} lg={20} xl={18}>
              <Suspense fallback={<div style={{padding: '2rem', textAlign: 'center'}}>Loading...</div>}>
                <DetailedResults detailedResults={examResult.detailedResults} />
              </Suspense>
            </Col>
          )}

          <Col xs={24} sm={24} md={22} lg={20} xl={18}>
            <Suspense fallback={<div style={{padding: '2rem', textAlign: 'center'}}>Loading...</div>}>
              <ActionSection
                onReturnToDashboard={handleReturnToDashboard}
              />
            </Suspense>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default YourResult;
