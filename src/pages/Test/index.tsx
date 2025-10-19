import React, { useState, useEffect } from 'react';
import { Button, Radio, Space, Progress, message, Statistic } from 'antd';
import { LeftOutlined, RightOutlined, CheckOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import './index.scss';

const { Countdown } = Statistic;

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
}

const TestPage: React.FC = () => {
  const navigate = useNavigate();
  
  // Sample questions data - this would normally come from props or API
  const questions: Question[] = [
    {
      id: 1,
      question: "What is the capital of France?",
      options: ["London", "Berlin", "Paris", "Madrid"],
      correctAnswer: 2
    },
    {
      id: 2,
      question: "Which planet is known as the Red Planet?",
      options: ["Venus", "Mars", "Jupiter", "Saturn"],
      correctAnswer: 1
    },
    {
      id: 3,
      question: "What is 2 + 2?",
      options: ["3", "4", "5", "6"],
      correctAnswer: 1
    },
    {
      id: 4,
      question: "Who wrote 'Romeo and Juliet'?",
      options: ["Charles Dickens", "William Shakespeare", "Jane Austen", "Mark Twain"],
      correctAnswer: 1
    },
    {
      id: 5,
      question: "What is the largest ocean on Earth?",
      options: ["Atlantic Ocean", "Indian Ocean", "Arctic Ocean", "Pacific Ocean"],
      correctAnswer: 3
    }
  ];

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30 * 60 * 1000); // 30 minutes in milliseconds

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  // Timer effect
  useEffect(() => {
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
  }, []);

  const handleAnswerChange = (value: number) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: value
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
  const hasAnsweredCurrent = selectedAnswers[currentQuestion.id] !== undefined;

  return (
    <div className="quiz-taking">
      <div className="quiz-header">
        <div className="quiz-title-container">
          <h1 className="quiz-title">📝 Mathematics Test</h1>
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
                value={selectedAnswers[currentQuestion.id]} 
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

          <div className="question-indicator">
            {questions.map((_, index) => (
              <div
                key={index}
                className={`indicator-dot ${
                  index === currentQuestionIndex ? 'active' : ''
                } ${selectedAnswers[questions[index].id] !== undefined ? 'answered' : ''}`}
                onClick={() => setCurrentQuestionIndex(index)}
              />
            ))}
          </div>

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
