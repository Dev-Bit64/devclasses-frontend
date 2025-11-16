import React, { useState } from 'react';
import { Card, Tag, Typography, Space, Collapse, Row, Col } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { DetailedQuestionResult } from '../../interfaces/interfaces';

const { Text, Paragraph } = Typography;
const { Panel } = Collapse;

/**
 * Props interface for DetailedResults component
 */
interface DetailedResultsProps {
  detailedResults: DetailedQuestionResult[];
}

/**
 * DetailedResults Component
 * Displays question-by-question breakdown of exam results
 * Shows each question with selected answer, correct answer, and whether it was correct
 * Redesigned with better layout and responsiveness
 *
 * @param detailedResults - Array of detailed question results from exam
 */
const DetailedResults: React.FC<DetailedResultsProps> = ({ detailedResults }) => {
  const [activeKey, setActiveKey] = useState<string | string[]>([]);

  /**
   * Get color for option tag based on correctness
   */
  const getOptionColor = (isCorrect: boolean): string => {
    return isCorrect ? 'success' : 'error';
  };

  /**
   * Format option label (e.g., "OPTIONA" -> "A")
   * Handles null values for unanswered questions
   */
  const formatOption = (option: string | null): string => {
    if (!option) {
      return 'Not Answered';
    }
    if (option.startsWith('OPTION')) {
      return option.replace('OPTION', '');
    }
    return option;
  };

  const correctCount = detailedResults.filter(r => r.isCorrect).length;
  const wrongCount = detailedResults.filter(r => !r.isCorrect).length;

  return (
    <Card
      className="detailed-results-card"
      title={
        <Space>
          <span style={{ fontSize: '18px' }}>📝</span>
          <span style={{ fontSize: '18px', fontWeight: 600 }}>
            Question-by-Question Breakdown
          </span>
        </Space>
      }
      extra={
        <Space size={8}>
          <Tag color="success" style={{ margin: 0 }}>
            <CheckCircleOutlined /> {correctCount}
          </Tag>
          <Tag color="error" style={{ margin: 0 }}>
            <CloseCircleOutlined /> {wrongCount}
          </Tag>
        </Space>
      }
      style={{
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        border: '1px solid #f0f0f0'
      }}
    >

      {/* Questions Collapse */}
      <Collapse
        activeKey={activeKey}
        onChange={setActiveKey}
        bordered={false}
        style={{ background: 'transparent' }}
        expandIconPosition="end"
      >
        {detailedResults.map((result, index) => (
          <Panel
            key={result.questionId}
            header={
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '12px', flexWrap: 'wrap' }}>
                <Space size={12}>
                  <div style={{
                    background: result.isCorrect ? '#52c41a' : '#ff4d4f',
                    color: 'white',
                    minWidth: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    fontWeight: 700,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}>
                    {index + 1}
                  </div>
                  <Text strong style={{ fontSize: '15px' }}>Question {index + 1}</Text>
                </Space>
                {result.isCorrect ? (
                  <Tag icon={<CheckCircleOutlined />} color="success" style={{ margin: 0, fontSize: '13px', padding: '2px 10px' }}>
                    Correct
                  </Tag>
                ) : (
                  <Tag icon={<CloseCircleOutlined />} color="error" style={{ margin: 0, fontSize: '13px', padding: '2px 10px' }}>
                    Wrong
                  </Tag>
                )}
              </div>
            }
            style={{
              marginBottom: '10px',
              borderRadius: '10px',
              border: `1px solid ${result.isCorrect ? '#d9f7be' : '#ffccc7'}`,
              background: '#fff',
              overflow: 'hidden',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
            }}
            className="detailed-result-panel"
          >
            <div style={{ padding: '4px 0' }}>
              {/* Question Text */}
              <div style={{
                padding: '14px',
                background: '#fafafa',
                borderRadius: '8px',
                marginBottom: '14px',
                borderLeft: `3px solid ${result.isCorrect ? '#52c41a' : '#ff4d4f'}`
              }}>
                <Paragraph style={{ marginBottom: '0', fontSize: '14px', lineHeight: '1.7', color: '#262626' }}>
                  {result.question}
                </Paragraph>
              </div>

              {/* Answer Information */}
              <Row gutter={12}>
                <Col xs={24} sm={result.isCorrect ? 24 : 12}>
                  <div style={{
                    background: result.isCorrect ? '#f6ffed' : '#fff1f0',
                    padding: '14px',
                    borderRadius: '8px',
                    border: `1px solid ${result.isCorrect ? '#b7eb8f' : '#ffa39e'}`,
                    height: '100%'
                  }}>
                    <Text type="secondary" style={{ fontSize: '11px', fontWeight: 600, display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Your Answer
                    </Text>
                    <Tag
                      color={getOptionColor(result.isCorrect)}
                      style={{
                        fontSize: '18px',
                        padding: '8px 20px',
                        fontWeight: 700,
                        borderRadius: '8px',
                        border: 'none'
                      }}
                    >
                      {formatOption(result.selectedOption)}
                    </Tag>
                  </div>
                </Col>

                {!result.isCorrect && (
                  <Col xs={24} sm={12}>
                    <div style={{
                      background: '#f6ffed',
                      padding: '14px',
                      borderRadius: '8px',
                      border: '1px solid #b7eb8f',
                      height: '100%'
                    }}>
                      <Text type="secondary" style={{ fontSize: '11px', fontWeight: 600, display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Correct Answer
                      </Text>
                      <Tag
                        color="success"
                        style={{
                          fontSize: '18px',
                          padding: '8px 20px',
                          fontWeight: 700,
                          borderRadius: '8px',
                          border: 'none'
                        }}
                      >
                        {formatOption(result.correctOption)}
                      </Tag>
                    </div>
                  </Col>
                )}
              </Row>
            </div>
          </Panel>
        ))}
      </Collapse>

      <style>{`
        .detailed-result-panel .ant-collapse-header {
          padding: 14px 18px !important;
          background: #fafafa;
        }
        .detailed-result-panel .ant-collapse-content-box {
          padding: 18px !important;
          background: #fff;
        }
        .detailed-result-panel:hover {
          box-shadow: 0 3px 10px rgba(0,0,0,0.08) !important;
          transform: translateY(-1px);
          transition: all 0.2s ease;
        }
        .detailed-result-panel .ant-collapse-header:hover {
          background: #f5f5f5 !important;
        }
      `}</style>
    </Card>
  );
};

export default DetailedResults;

