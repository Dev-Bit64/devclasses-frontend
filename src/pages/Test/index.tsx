import React, { useState, useEffect } from 'react';
import { Button, Radio, Space, Progress, message, Statistic, Empty } from 'antd';
import { LeftOutlined, RightOutlined, CheckOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import './index.scss';

const { Countdown } = Statistic;

/**
 * Question interface for MCQ questions
 * Represents the structure of exam questions from the API
 */
interface Question {
  _id?: string;
  id?: number;
  question: string;
  options: string[];
  correctAnswer?: number;
}

const TestPage: React.FC = () => {
  const navigate = useNavigate();

  // Get exam questions from Redux store
  const { examQuestions } = useSelector((state: RootState) => state.exam);

  /**
   * Transform exam questions from API response to Question interface
   * Handles both API format and fallback to sample data
   */
  const transformedQuestions: Question[] = examQuestions && examQuestions.length > 0
    ? examQuestions.map((q: any, index: number) => ({
        _id: q._id,
        id: index + 1,
        question: q.question,
        options: q.options || [],
        correctAnswer: q.correctAnswer,
      }))
    : []; // Empty array if no questions from API

  // Use transformed questions or show empty state
  const questions = transformedQuestions.length > 0 ? transformedQuestions : [];

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: string | number]: number }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30 * 60 * 1000); // 30 minutes in milliseconds

  // Handle empty questions state
  useEffect(() => {
    if (questions.length === 0) {
      message.warning('No questions available. Please generate a test first.');
      setTimeout(() => {
        navigate('/quiz-details');
      }, 2000);
    }
  }, [questions.length, navigate]);

  const currentQuestion = questions[currentQuestionIndex];
  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;

  /**
   * Timer effect - Auto-submit when time runs out
   * Countdown timer for the exam duration
   */
  useEffect(() => {
    if (questions.length === 0) return; // Don't start timer if no questions

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
  }, [questions.length]);

  /**
   * Handle answer selection for current question
   * Stores the selected option index for the current question
   */
  const handleAnswerChange = (value: number) => {
    const questionKey = currentQuestion._id || currentQuestion.id;
    setSelectedAnswers(prev => ({
      ...prev,
      [questionKey]: value
    }));
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      message.success({
        content: '🎉 Test submitted successfully!',
        duration: 3,
      });
      
      // Navigate to your result page
      navigate('/your-result');
      
    } catch (error) {
      message.error('Failed to submit test. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const isFirstQuestion = currentQuestionIndex === 0;
  const currentQuestionKey = currentQuestion ? (currentQuestion._id || currentQuestion.id) : null;
  const hasAnsweredCurrent = currentQuestionKey ? selectedAnswers[currentQuestionKey] !== undefined : false;

  // Show empty state if no questions are available
  if (questions.length === 0) {
    return (
      <div className="quiz-taking">
        <Empty
          description="No Questions Available"
          style={{ marginTop: '100px' }}
        >
          <Button type="primary" onClick={() => navigate('/quiz-details')}>
            Generate a Test
          </Button>
        </Empty>
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
            format={() => `${currentQuestionIndex + 1}/${questions.length}`}
          />
        </div>
      </div>

      <div className="quiz-content">
        <div className="quiz-content-scroll">
          <div className="question-container">
            <div className="question-header">
              <span className="question-number">Question {currentQuestionIndex + 1}</span>
              <span className="question-type">Multiple Choice</span>
            </div>

            <div className="question-text">
              {currentQuestion.question}
            </div>

            <div className="options-container">
              <Radio.Group
                value={selectedAnswers[currentQuestionKey]}
                onChange={(e) => handleAnswerChange(e.target.value)}
                className="quiz-radio-group"
              >
                <Space direction="vertical" size="large" className="options-list">
                  {currentQuestion.options.map((option, index) => (
                    <Radio
                      key={index}
                      value={index}
                      className="quiz-radio-option"
                    >
                      <span className="option-label">
                        {String.fromCharCode(65 + index)}. {option}
                      </span>
                    </Radio>
                  ))}
                </Space>
              </Radio.Group>
            </div>
          </div>
        </div>

        <div className="quiz-navigation">
          <Button
            onClick={handlePrevious}
            disabled={isFirstQuestion}
            className="nav-button prev-button"
            size="large"
            icon={<LeftOutlined />}
          >
            Previous
          </Button>

          {/* Question indicator dots - shows progress and answered status */}
          <div className="question-indicator">
            {questions.map((question, index) => {
              const questionKey = question._id || question.id;
              return (
                <div
                  key={index}
                  className={`indicator-dot ${
                    index === currentQuestionIndex ? 'active' : ''
                  } ${selectedAnswers[questionKey] !== undefined ? 'answered' : ''}`}
                  onClick={() => setCurrentQuestionIndex(index)}
                />
              );
            })}
          </div>

          {/* Submit or Next button based on question position */}
          {isLastQuestion ? (
            <Button
              onClick={handleSubmit}
              loading={isSubmitting}
              className="nav-button submit-button"
              size="large"
              icon={<CheckOutlined />}
              disabled={!hasAnsweredCurrent}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Test'}
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={!hasAnsweredCurrent}
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
