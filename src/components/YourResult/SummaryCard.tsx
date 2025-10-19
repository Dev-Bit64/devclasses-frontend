
import React from 'react';
import { Card, Progress as AntdProgress, Row, Col, Typography } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface SummaryCardProps {
  scorePercentage: number;
  correctAnswers: number;
  wrongAnswers: number;
}

const getScoreColor = (percentage: number) => {
  if (percentage >= 80) return '#52c41a';
  if (percentage >= 60) return '#faad14';
  return '#ff4d4f';
};

const SummaryCard: React.FC<SummaryCardProps> = ({ 
  scorePercentage, 
  correctAnswers, 
  wrongAnswers 
}) => {
  return (
    <Card className="summary-card card-anim fade-in-up delay-3" hoverable>
      <Title level={4}>Performance Summary</Title>
      <div className="summary-content">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12}>
            <div className="summary-item">
              <Text strong>Accuracy Rate:</Text>
              <AntdProgress
                percent={scorePercentage}
                strokeColor={getScoreColor(scorePercentage)}
                showInfo={false}
                className="animated-progress"
              />
              <Text className="accuracy-text">{scorePercentage}%</Text>
            </div>
          </Col>
          <Col xs={24} sm={12}>
            <div className="summary-stats">
              <div className="stat-row">
                <CheckCircleOutlined style={{ color: '#52c41a' }} />
                <Text>Correct: {correctAnswers} questions</Text>
              </div>
              <div className="stat-row">
                <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
                <Text>Incorrect: {wrongAnswers} questions</Text>
              </div>
            </div>
          </Col>
        </Row>
      </div>
    </Card>
  );
};

export default SummaryCard;
