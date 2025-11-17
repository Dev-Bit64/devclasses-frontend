import React, { useState, useEffect } from 'react';
import { Button, Radio, Space, Progress, message, Statistic, Empty, Spin } from 'antd';
import { LeftOutlined, RightOutlined, CheckOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../redux/store';
import { getQuestionAction, submitExamAction } from '../../redux/action/examAction';
import './index.scss';

const { Countdown } = Statistic;

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
      message.warning('No active exam session. Please start a new exam.');
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
      message.error('Failed to fetch question. Please try again.');
      console.error('Error fetching question:', error);
    }
  };

  const progress = totalQuestions && totalQuestions > 0 ? (currentPage / totalQuestions) * 100 : 0;

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
      message.error('Missing exam session or user information.');
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

      // Verify payload format before submission
      console.log('=== SUBMITTING EXAM ===');
      console.log('Sample answer format:', answers[0]);
      console.log('Expected: { questionId: "...", selectedOption: "OPTIONA" }');

      // Call submit exam API
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await dispatch(submitExamAction({ userId, examId, answers }) as any);

      if (result.payload?.statusCode === 200) {
        message.success({
          content: '🎉 Test submitted successfully!',
          duration: 3,
        });

        // Navigate to result page
        setTimeout(() => {
          navigate('/your-result');
        }, 1000);
      } else {
        message.error('Failed to submit test. Please try again.');
      }

    } catch (error) {
      message.error('Failed to submit test. Please try again.');
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
      <div className="quiz-taking">
        <Empty
          description="No Active Exam Session"
          style={{ marginTop: '100px' }}
        >
          <Button type="primary" onClick={() => navigate('/quiz-details')}>
            Start a New Exam
          </Button>
        </Empty>
      </div>
    );
  }

  // Show loading state while fetching question
  if (isLoading || !questionData) {
    return (
      <div className="quiz-taking" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Spin size="large" tip="Loading question..." />
      </div>
    );
  }

  return (
    <div className="quiz-taking">
      <div className="quiz-header">
        <div className="quiz-title-container">
          <h1 className="quiz-title">📝 Exam Test</h1>
          <div className="timer-container">
            <ClockCircleOutlined className="timer-icon" />
            <Countdown
              value={Date.now() + timeLeft}
              format="mm:ss"
              valueStyle={{
                color: timeLeft < 5 * 60 * 1000 ? '#ff4d4f' : '#3E69E7',
                fontSize: '20px',
                fontWeight: 'bold'
              }}
              onFinish={() => handleSubmit()}
            />
          </div>
        </div>
        <div className="quiz-progress">
          <Progress
            percent={progress}
            strokeColor="#3E69E7"
            trailColor="rgba(62, 105, 231, 0.1)"
            strokeWidth={8}
            format={() => `${currentPage}/${totalQuestions}`}
          />
        </div>
      </div>

      <div className="quiz-content">
        <div className="quiz-content-scroll">
          <div className="question-container">
            <div className="question-header">
              <span className="question-number">Question {currentPage}</span>
              <span className="question-type">Multiple Choice</span>
            </div>

            <div className="question-text">
              {questionData.question}
            </div>

            <div className="options-container">
              <Radio.Group
                value={(() => {
                  // Reverse transform for display: "OPTIONA" -> "A"
                  const storedValue = selectedAnswers[questionData.id];
                  if (storedValue && storedValue.startsWith('OPTION')) {
                    return storedValue.replace('OPTION', '');
                  }
                  return storedValue;
                })()}
                onChange={(e) => handleAnswerChange(e.target.value)}
                className="quiz-radio-group"
              >
                <Space direction="vertical" size="large" className="options-list">
                  {Object.entries(questionData.options).map(([key, value]) => {
                    // Handle both formats: "A" or "OPTIONA"
                    // Extract letter for display: "OPTIONA" -> "A", or "A" -> "A"
                    const optionLetter = key.startsWith('OPTION') ? key.replace('OPTION', '') : key;

                    return (
                      <Radio
                        key={key}
                        value={key}
                        className="quiz-radio-option"
                      >
                        <span className="option-label">
                          {optionLetter}. {value}
                        </span>
                      </Radio>
                    );
                  })}
                </Space>
              </Radio.Group>
            </div>
          </div>
        </div>

        <div className="quiz-navigation">
          <Button
            onClick={handlePrevious}
            disabled={isFirstQuestion || isLoading}
            className="nav-button prev-button"
            size="large"
            icon={<LeftOutlined />}
          >
            Previous
          </Button>

          {/* Question progress indicator */}
          <div className="question-indicator">
            <span className="progress-text">
              Question {currentPage} of {totalQuestions}
            </span>
          </div>

          {/* Submit or Next button based on question position */}
          {isLastQuestion ? (
            <Button
              onClick={handleSubmit}
              loading={isSubmitting}
              className="nav-button submit-button"
              size="large"
              icon={<CheckOutlined />}
              disabled={!hasAnsweredCurrent || isLoading}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Test'}
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={!hasAnsweredCurrent || isLoading}
              className="nav-button next-button"
              size="large"
              icon={<RightOutlined />}
            >
              Next
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestPage;
