
import React from 'react';
import { Typography } from 'antd';
import { TrophyOutlined, StarFilled } from '@ant-design/icons';

const { Title, Text } = Typography;

interface ResultHeaderProps {
  scorePercentage: number;
}

const getPerformanceMessage = (percentage: number) => {
  if (percentage >= 90) return 'Excellent Performance! 🎉';
  if (percentage >= 80) return 'Great Job! 👏';
  if (percentage >= 70) return 'Good Work! 👍';
  if (percentage >= 60) return 'Not Bad! 📈';
  return 'Keep Practicing! 💪';
};

const getStarRating = (percentage: number) => {
  if (percentage >= 90) return 5;
  if (percentage >= 80) return 4;
  if (percentage >= 70) return 3;
  if (percentage >= 60) return 2;
  return 1;
};

const ResultHeader: React.FC<ResultHeaderProps> = ({ scorePercentage }) => {
  const stars = getStarRating(scorePercentage);
  
  return (
    <div className="result-header">
      <div className="trophy-container">
        <TrophyOutlined className="trophy-icon pulse-effect" />
        <div className="trophy-glow"></div>
      </div>
      <Title level={1} className="result-title animate-fade-in">Your Results</Title>
      <div className="stars-container fade-in-up delay-1">
        {[...Array(5)].map((_, i) => (
          <StarFilled
            key={i}
            className={`star ${i < stars ? 'star-filled' : 'star-empty'}`}
            style={{ animationDelay: `${i * 0.1}s` }}
          />
        ))}
      </div>
      <Text className="performance-message fade-in-up delay-2">{getPerformanceMessage(scorePercentage)}</Text>
    </div>
  );
};

export default ResultHeader;
