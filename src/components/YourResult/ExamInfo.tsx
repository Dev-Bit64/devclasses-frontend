import React from 'react';
import { Card, Typography } from 'antd';
import { CalendarOutlined, BookOutlined, ReadOutlined, TrophyOutlined } from '@ant-design/icons';
import { ExamResult } from '../../interfaces/interfaces';

const { Text } = Typography;

/**
 * Props interface for ExamInfo component
 */
interface ExamInfoProps {
  examResult: ExamResult;
}

/**
 * ExamInfo Component
 * Displays metadata about the exam in a clean, horizontal layout
 *
 * @param examResult - Complete exam result data
 */
const ExamInfo: React.FC<ExamInfoProps> = ({ examResult }) => {

  /**
   * Format date to readable string
   */
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  /**
   * Get performance tag based on score percentage
   */
  const getPerformanceTag = () => {
    const percentage = (examResult.score / examResult.totalQuestions) * 100;

    if (percentage >= 90) {
      return { color: '#faad14', text: 'Excellent', bgColor: '#fffbe6', borderColor: '#ffe58f' };
    } else if (percentage >= 75) {
      return { color: '#52c41a', text: 'Very Good', bgColor: '#f6ffed', borderColor: '#b7eb8f' };
    } else if (percentage >= 60) {
      return { color: '#1890ff', text: 'Good', bgColor: '#e6f7ff', borderColor: '#91d5ff' };
    } else if (percentage >= 40) {
      return { color: '#fa8c16', text: 'Average', bgColor: '#fff7e6', borderColor: '#ffd591' };
    } else {
      return { color: '#f5222d', text: 'Needs Improvement', bgColor: '#fff1f0', borderColor: '#ffa39e' };
    }
  };

  const performance = getPerformanceTag();

  /**
   * InfoItem component for inline display
   */
  const InfoItem: React.FC<{
    icon: React.ReactNode;
    label: string;
    value: string;
    iconColor: string;
    valueColor?: string;
    valueBg?: string;
    valueBorder?: string;
  }> = ({ icon, label, value, iconColor, valueColor, valueBg, valueBorder }) => (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px'
    }}>
      <div style={{
        fontSize: '20px',
        color: iconColor,
        display: 'flex',
        alignItems: 'center'
      }}>
        {icon}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <Text type="secondary" style={{
          fontSize: '10px',
          textTransform: 'uppercase',
          fontWeight: 600,
          letterSpacing: '0.3px',
          lineHeight: 1.2,
          color: '#8c8c8c'
        }}>
          {label}
        </Text>
        <Text strong style={{
          fontSize: '15px',
          color: valueColor || '#262626',
          lineHeight: 1.3,
          padding: valueBg ? '3px 10px' : '0',
          background: valueBg || 'transparent',
          borderRadius: '4px',
          border: valueBorder ? `1px solid ${valueBorder}` : 'none',
          fontWeight: 600
        }}>
          {value}
        </Text>
      </div>
    </div>
  );

  return (
    <Card
      className="exam-info-card"
      style={{
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        border: '1px solid #e8e8e8',
        background: '#ffffff'
      }}
      bodyStyle={{ padding: '20px 24px' }}
    >
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '24px',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Board */}
        <InfoItem
          icon={<BookOutlined />}
          label="Board"
          value={examResult.board}
          iconColor="#1890ff"
        />

        {/* Standard */}
        <InfoItem
          icon={<ReadOutlined />}
          label="Standard"
          value={examResult.standard}
          iconColor="#13c2c2"
        />

        {/* Exam Date */}
        <InfoItem
          icon={<CalendarOutlined />}
          label="Exam Date"
          value={formatDate(examResult.examDate)}
          iconColor="#722ed1"
        />

        {/* Performance */}
        <InfoItem
          icon={<TrophyOutlined />}
          label="Performance"
          value={performance.text}
          iconColor={performance.color}
          valueColor={performance.color}
          valueBg={performance.bgColor}
          valueBorder={performance.borderColor}
        />
      </div>

      <style>{`
        @media (max-width: 768px) {
          .exam-info-card .ant-card-body > div {
            gap: 16px !important;
            justify-content: flex-start !important;
          }
        }
      `}</style>
    </Card>
  );
};

export default ExamInfo;

