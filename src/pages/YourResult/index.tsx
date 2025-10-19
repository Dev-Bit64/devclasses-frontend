
import React, { useState, useEffect, Suspense } from 'react';
import { Row, Col } from 'antd';
import { useNavigate } from 'react-router-dom';
const ActionSection = React.lazy(() => import('../../components/YourResult/ActionSection'));
const ErrorState = React.lazy(() => import('../../components/YourResult/ErrorState'));
const LoadingState = React.lazy(() => import('../../components/YourResult/LoadingState'));
const ResultHeader = React.lazy(() => import('../../components/YourResult/ResultHeader'));
const ScoreCard = React.lazy(() => import('../../components/YourResult/ScoreCard'));
const StatsCards = React.lazy(() => import('../../components/YourResult/StatsCards'));
const SummaryCard = React.lazy(() => import('../../components/YourResult/SummaryCard'));
import './index.scss';

interface QuizResultData {
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
}

const YourResult: React.FC = () => {
  const navigate = useNavigate();
  const [resultData, setResultData] = useState<QuizResultData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        setShowContent(false);
        await new Promise(resolve => setTimeout(resolve, 1200));
        const mockResults: QuizResultData = {
          totalQuestions: 25,
          correctAnswers: 18,
          wrongAnswers: 7,
        };
        setResultData(mockResults);
      } catch (err) {
        setError(true);
        console.error('Error fetching results:', err);
      } finally {
        setLoading(false);
        setTimeout(() => setShowContent(true), 300);
      }
    };

    fetchResults();

    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 600);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
          <Col xs={24} lg={16}>
            <Suspense fallback={<div style={{padding: '2rem', textAlign: 'center'}}>Loading...</div>}>
              <ScoreCard
                scorePercentage={scorePercentage}
                correctAnswers={correctAnswers}
                totalQuestions={totalQuestions}
                isSmallScreen={isSmallScreen}
              />
            </Suspense>
          </Col>
          <Col xs={24} lg={16}>
            <Suspense fallback={<div style={{padding: '2rem', textAlign: 'center'}}>Loading...</div>}>
              <StatsCards
                totalQuestions={totalQuestions}
                correctAnswers={correctAnswers}
                wrongAnswers={wrongAnswers}
              />
            </Suspense>
          </Col>
          <Col xs={24} lg={16}>
            <Suspense fallback={<div style={{padding: '2rem', textAlign: 'center'}}>Loading...</div>}>
              <SummaryCard
                scorePercentage={scorePercentage}
                correctAnswers={correctAnswers}
                wrongAnswers={wrongAnswers}
              />
            </Suspense>
          </Col>
          <Col xs={24} lg={16}>
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
