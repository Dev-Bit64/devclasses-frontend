import React, { useState } from 'react';
import { Modal, Table, Button, message, Space, Typography, Row, Col } from 'antd';
import { FilePdfOutlined, DownloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import './index.scss';

const { Title } = Typography;

// Interface for user result data
interface UserResult {
  key: number;
  examDate: string;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  subject: string;
  standard: string;
  board: string;
}

// Props interface for the modal component
interface UserResultsModalProps {
  visible: boolean;
  onClose: () => void;
  userName: string;
  userId: number;
}

// Mock data for demonstration - replace with actual API call
const mockUserResults: UserResult[] = [
  {
    key: 1,
    examDate: '2024-01-15',
    totalQuestions: 50,
    correctAnswers: 42,
    wrongAnswers: 8,
    subject: 'Mathematics',
    standard: '10th',
    board: 'CBSE'
  },
  {
    key: 2,
    examDate: '2024-01-20',
    totalQuestions: 40,
    correctAnswers: 35,
    wrongAnswers: 5,
    subject: 'Physics',
    standard: '10th',
    board: 'CBSE'
  },
  {
    key: 3,
    examDate: '2024-01-25',
    totalQuestions: 45,
    correctAnswers: 38,
    wrongAnswers: 7,
    subject: 'Chemistry',
    standard: '10th',
    board: 'CBSE'
  },
  {
    key: 4,
    examDate: '2024-02-01',
    totalQuestions: 30,
    correctAnswers: 25,
    wrongAnswers: 5,
    subject: 'Biology',
    standard: '10th',
    board: 'CBSE'
  },
  {
    key: 5,
    examDate: '2024-02-05',
    totalQuestions: 35,
    correctAnswers: 30,
    wrongAnswers: 5,
    subject: 'English',
    standard: '10th',
    board: 'CBSE'
  }
];

const UserResultsModal: React.FC<UserResultsModalProps> = ({
  visible,
  onClose,
  userName,
  userId
}) => {
  const [loading, setLoading] = useState(false);

  /**
   * Handle PDF export functionality
   * This function generates and downloads a PDF of the user's results
   */
  const handleExportToPDF = async (record: UserResult) => {
    try {
      setLoading(true);
      
      // Create a simple HTML content for PDF generation
      const htmlContent = `
        <html>
          <head>
            <title>Exam Result - ${userName}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { text-align: center; margin-bottom: 30px; }
              .result-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              .result-table th, .result-table td { 
                border: 1px solid #ddd; 
                padding: 12px; 
                text-align: left; 
              }
              .result-table th { background-color: #f2f2f2; }
              .score { font-weight: bold; color: #1890ff; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Exam Result Report</h1>
              <h2>Student: ${userName}</h2>
              <p>Subject: ${record.subject} | Standard: ${record.standard} | Board: ${record.board}</p>
              <p>Exam Date: ${record.examDate}</p>
            </div>
            <table class="result-table">
              <tr>
                <th>Total Questions</th>
                <th>Correct Answers</th>
                <th>Wrong Answers</th>
                <th>Score</th>
              </tr>
              <tr>
                <td>${record.totalQuestions}</td>
                <td class="score">${record.correctAnswers}</td>
                <td>${record.wrongAnswers}</td>
                <td class="score">${((record.correctAnswers / record.totalQuestions) * 100).toFixed(1)}%</td>
              </tr>
            </table>
          </body>
        </html>
      `;

      // Create a blob and download the file
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${userName}_${record.subject}_${record.examDate}_result.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      message.success('Result exported successfully!');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      message.error('Failed to export result. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Table columns configuration for the results table
   */
  const columns: ColumnsType<UserResult> = [
    {
      title: 'No.',
      dataIndex: 'key',
      key: 'no',
      align: 'center',
      width: 60,
      render: (_: any, __: UserResult, index: number) => index + 1,
      responsive: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    {
      title: 'Exam Date',
      dataIndex: 'examDate',
      key: 'examDate',
      align: 'center',
      width: 120,
      render: (date: string) => new Date(date).toLocaleDateString('en-GB'),
      responsive: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    {
      title: 'Subject',
      dataIndex: 'subject',
      key: 'subject',
      align: 'center',
      width: 120,
      responsive: ['sm', 'md', 'lg', 'xl'],
    },
    {
      title: 'Total Questions',
      dataIndex: 'totalQuestions',
      key: 'totalQuestions',
      align: 'center',
      width: 120,
      responsive: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    {
      title: 'Correct Answers',
      dataIndex: 'correctAnswers',
      key: 'correctAnswers',
      align: 'center',
      width: 120,
      render: (correct: number) => (
        <span style={{ color: '#52c41a', fontWeight: 'bold' }}>
          {correct}
        </span>
      ),
      responsive: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    {
      title: 'Wrong Answers',
      dataIndex: 'wrongAnswers',
      key: 'wrongAnswers',
      align: 'center',
      width: 120,
      render: (wrong: number) => (
        <span style={{ color: '#ff4d4f', fontWeight: 'bold' }}>
          {wrong}
        </span>
      ),
      responsive: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    {
      title: 'Score %',
      key: 'score',
      align: 'center',
      width: 100,
      render: (_: any, record: UserResult) => {
        const percentage = ((record.correctAnswers / record.totalQuestions) * 100).toFixed(1);
        const color = parseFloat(percentage) >= 70 ? '#52c41a' : parseFloat(percentage) >= 50 ? '#faad14' : '#ff4d4f';
        return (
          <span style={{ color, fontWeight: 'bold' }}>
            {percentage}%
          </span>
        );
      },
      responsive: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    {
      title: 'Action',
      key: 'action',
      align: 'center',
      width: 120,
      render: (_: any, record: UserResult) => (
        <Button
          type="primary"
          icon={<FilePdfOutlined />}
          size="small"
          loading={loading}
          onClick={() => handleExportToPDF(record)}
          style={{ 
            borderRadius: 6,
            display: 'block',
            alignItems: 'center',
            margin: '0 auto',
            gap: 4
          }}
        >
         <span style={{  marginLeft: '5px' }}>Export</span>
        </Button>
      ),
      responsive: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
  ];

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <FilePdfOutlined style={{ color: '#1890ff', fontSize: 20 }} />
          <Title level={4} style={{ margin: 0 }}>
            {userName}'s Exam Results
          </Title>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width="90%"
      style={{ maxWidth: 1200 }}
      className="user-results-modal"
      destroyOnClose
      centered
    >
      <div className="user-results-content">
        {/* Summary Statistics */}
        <div className="results-summary" style={{ 
          marginBottom: 24, 
          padding: 16, 
          background: '#f8f9fa', 
          borderRadius: 8,
          border: '1px solid #e9ecef'
        }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={8}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#1890ff' }}>
                  {mockUserResults.length}
                </div>
                <div style={{ color: '#666' }}>Total Exams</div>
              </div>
            </Col>
            <Col xs={24} sm={8}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#52c41a' }}>
                  {mockUserResults.reduce((sum, result) => sum + result.correctAnswers, 0)}
                </div>
                <div style={{ color: '#666' }}>Total Correct</div>
              </div>
            </Col>
            <Col xs={24} sm={8}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#faad14' }}>
                  {(
                    mockUserResults.reduce((sum, result) => 
                      sum + (result.correctAnswers / result.totalQuestions) * 100, 0
                    ) / mockUserResults.length
                  ).toFixed(1)}%
                </div>
                <div style={{ color: '#666' }}>Average Score</div>
              </div>
            </Col>
          </Row>
        </div>

        {/* Results Table */}
        <div className="results-table-wrapper" style={{ overflowX: 'auto' }}>
          <Table
            columns={columns}
            dataSource={mockUserResults}
            pagination={{ 
              pageSize: 5,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => 
                `${range[0]}-${range[1]} of ${total} results`
            }}
            bordered
            rowKey="key"
            scroll={{ x: 800 }}
            size="middle"
          />
        </div>
      </div>
    </Modal>
  );
};

export default UserResultsModal;
