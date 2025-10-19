
import React, { useState, useEffect } from 'react';
import { Card, Progress as AntdProgress, Typography } from 'antd';
import { TrophyOutlined, FireOutlined, RocketOutlined } from '@ant-design/icons';

const { Title } = Typography;

interface ScoreCardProps {
  scorePercentage: number;
  correctAnswers: number;
  totalQuestions: number;
  isSmallScreen: boolean;
}

const getScoreColor = (percentage: number) => {
  if (percentage >= 80) return '#52c41a';
  if (percentage >= 60) return '#faad14';
  return '#ff4d4f';
};

const getScoreIcon = (percentage: number) => {
  if (percentage >= 90) return <TrophyOutlined className="score-icon trophy" />;
  if (percentage >= 70) return <FireOutlined className="score-icon fire" />;
  return <RocketOutlined className="score-icon rocket" />;
};

const ScoreCard: React.FC<ScoreCardProps> = ({ 
  scorePercentage, 
  correctAnswers, 
  totalQuestions, 
  isSmallScreen 
}) => {
  const [animatedPercentage, setAnimatedPercentage] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedPercentage(scorePercentage);
    }, 500);
    return () => clearTimeout(timer);
  }, [scorePercentage]);

  return (
    <Card className="score-card card-anim hover-scale fade-in-up" hoverable>
      <div className="score-section">
        <div className="score-display">
          <div className="score-icon-container">
            {getScoreIcon(scorePercentage)}
          </div>
          <AntdProgress
            type="circle"
            size={isSmallScreen ? 140 : 200}
            percent={animatedPercentage}
            strokeColor={{
              '0%': getScoreColor(scorePercentage),
              '100%': getScoreColor(scorePercentage + 10),
            }}
            strokeWidth={10}
            trailColor="rgba(0,0,0,0.06)"
            format={() => (
              <div className="score-text">
                <div className="percentage">{animatedPercentage}%</div>
                <div className="score-ratio">{correctAnswers}/{totalQuestions}</div>
              </div>
            )}
          />
        </div>
        <Title level={3} className="score-title">Overall Score</Title>
        <div className="score-badges">
          {scorePercentage >= 90 && <div className="badge excellence">Excellence</div>}
          {scorePercentage >= 80 && <div className="badge great">Great</div>}
          {scorePercentage >= 70 && <div className="badge good">Good</div>}
        </div>
      </div>
    </Card>
  );
};

export default ScoreCard;
