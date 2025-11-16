
import React from 'react';
import { Card, Progress as AntdProgress, Typography, Space } from 'antd';
import { TrophyOutlined, RocketOutlined, BookOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

interface SummaryCardProps {
  scorePercentage: number;
  correctAnswers: number;
  wrongAnswers: number;
}

/**
 * Get performance feedback based on score percentage
 */
const getPerformanceFeedback = (percentage: number) => {
  if (percentage >= 90) {
    return {
      title: '🎉 Outstanding Performance!',
      message: 'Excellent work! You have demonstrated exceptional understanding of the subject matter.',
      color: '#52c41a',
      icon: <TrophyOutlined style={{ fontSize: '24px', color: '#52c41a' }} />
    };
  } else if (percentage >= 75) {
    return {
      title: '⭐ Great Job!',
      message: 'Very good performance! You have a strong grasp of most concepts.',
      color: '#73d13d',
      icon: <RocketOutlined style={{ fontSize: '24px', color: '#73d13d' }} />
    };
  } else if (percentage >= 60) {
    return {
      title: '👍 Good Effort!',
      message: 'Good work! With a bit more practice, you can achieve even better results.',
      color: '#1890ff',
      icon: <BookOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
    };
  } else if (percentage >= 40) {
    return {
      title: '📚 Keep Practicing!',
      message: 'You\'re making progress! Focus on reviewing the topics you found challenging.',
      color: '#faad14',
      icon: <BookOutlined style={{ fontSize: '24px', color: '#faad14' }} />
    };
  } else {
    return {
      title: '📈 Room for Improvement',
      message: 'Don\'t be discouraged! Review the material and try again. Practice makes perfect!',
      color: '#ff4d4f',
      icon: <BookOutlined style={{ fontSize: '24px', color: '#ff4d4f' }} />
    };
  }
};

const getScoreColor = (percentage: number) => {
  if (percentage >= 80) return '#52c41a';
  if (percentage >= 60) return '#faad14';
  return '#ff4d4f';
};

const SummaryCard: React.FC<SummaryCardProps> = ({
  scorePercentage,
}) => {
  const feedback = getPerformanceFeedback(scorePercentage);

  return (
    <Card
      className="summary-card card-anim fade-in-up delay-3"
      style={{
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        border: '1px solid #f0f0f0'
      }}
    >
      <Space direction="vertical" size={20} style={{ width: '100%' }}>
        {/* Performance Feedback */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ marginBottom: '12px' }}>
            {feedback.icon}
          </div>
          <Title level={4} style={{ marginBottom: '8px', color: feedback.color }}>
            {feedback.title}
          </Title>
          <Paragraph style={{ marginBottom: 0, color: '#595959', fontSize: '14px' }}>
            {feedback.message}
          </Paragraph>
        </div>

        {/* Accuracy Progress */}
        <div style={{
          background: '#fafafa',
          padding: '20px',
          borderRadius: '10px',
          border: '1px solid #f0f0f0'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '12px' }}>
            <Text type="secondary" style={{ fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Accuracy Rate
            </Text>
          </div>
          <AntdProgress
            percent={scorePercentage}
            strokeColor={getScoreColor(scorePercentage)}
            strokeWidth={12}
            className="animated-progress"
            style={{ marginBottom: '8px' }}
          />
          <div style={{ textAlign: 'center' }}>
            <Text strong style={{ fontSize: '24px', color: getScoreColor(scorePercentage) }}>
              {scorePercentage}%
            </Text>
          </div>
        </div>
      </Space>
    </Card>
  );
};

export default SummaryCard;
