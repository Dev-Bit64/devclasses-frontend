/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Table, Button, message, Typography, Row, Col, Spin } from 'antd';
import { FilePdfOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useDispatch, useSelector } from 'react-redux';
import { getUserResultByIdAction } from '../../redux/action/userAction';
import { RootState, AppDispatch } from '../../redux/store';
import './index.scss';
import { exportExamResultToPDFAction } from '../../redux/action/examAction';

const { Title } = Typography;

// Interface for user result data from API
interface UserResult {
  id: string;
  examDate: string;
  examSessionId: string;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  totalTestsGiven: number;
  subject: {
    subname: string;
  };
  chapter: {
    name: string;
  };
  standard: string;
  board: string;
}

// Props interface for the modal component
interface UserResultsModalProps {
  visible: boolean;
  onClose: () => void;
  userName: string;
  userId: string | number;
}

const UserResultsModal: React.FC<UserResultsModalProps> = ({
  visible,
  onClose,
  userName,
  userId,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [loadingExamId, setLoadingExamId] = useState<string | null>(null);
  const [userResults, setUserResults] = useState<UserResult[]>([]);
  const [page, setPage] = useState<number>(1);
  const [totalResults, setTotalResults] = useState<number>(0);
  const PAGE_SIZE = 10;

  // Get loading state from Redux
  const isLoadingResults = useSelector((state: RootState) => state.user.isLoading);

  /**
   * Fetch user results from API
   */
  const fetchUserResults = useCallback(async (pageNum: number) => {
    try {
      const payload = {
        userId: String(userId),
        page: pageNum,
        limit: PAGE_SIZE,
        sortField: 'examDate',
        sortOrder: 'desc',
      };

      const response = await dispatch(getUserResultByIdAction(payload)).unwrap();

      // Extract results from API response
      if (response?.data?.results) {
        setUserResults(response.data.results);
        setTotalResults(response.data.totalResults || 0);
      } else {
        setUserResults([]);
        setTotalResults(0);
      }
    } catch (error: any) {
      console.error('Error fetching user results:', error);
      message.error(error?.message || 'Failed to fetch user results');
      setUserResults([]);
      setTotalResults(0);
    }
  }, [dispatch, userId, PAGE_SIZE]);

  /**
   * Fetch user results when modal opens or page changes
   */
  useEffect(() => {
    if (visible && userId) {
      fetchUserResults(page);
    }
  }, [visible, userId, page, fetchUserResults]);

  /**
   * Reset state when modal closes
   */
  const handleClose = () => {
    setPage(1);
    setUserResults([]);
    setTotalResults(0);
    onClose();
  };

  /**
   * Handle PDF export functionality
   * This function generates and downloads a PDF of the user's results
   */
  const handleExportToPDF = async (record: UserResult) => {
    try {
      console.log("record", record);
      setLoadingExamId(record.examSessionId);

      // Create a simple HTML content for PDF generation
      const payload = {
        examId: record.examSessionId,
        userId: String(userId),
      };

      const response = await dispatch(exportExamResultToPDFAction(payload)).unwrap();

      // Response is already a blob from postApiBlob
      const blob = response;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${userName}_${record.subject?.subname}_${record.chapter?.name}_${record.examDate}_result.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      message.success('Result exported successfully!');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      message.error('Failed to export result. Please try again.');
    } finally {
      setLoadingExamId(null);
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
      render: (date: string) => {
        const d = new Date(date);
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}-${month}--${year}`;
      },
      responsive: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    {
      title: 'Subject',
      dataIndex: 'subject',
      key: 'subject',
      align: 'center',
      width: 120,
      responsive: ['sm', 'md', 'lg', 'xl'],
      render: (subject: any) => (
        <span style={{ color: '#1890ff', fontWeight: '500' }}>
          {subject?.subname || 'N/A'}
        </span>
      ),
    },
    {
      title: 'Chapter',
      dataIndex: 'chapter',
      key: 'chapter',
      align: 'center',
      width: 150,
      responsive: ['md', 'lg', 'xl'],
      render: (chapter: any) => (
        <span style={{ color: '#722ed1', fontWeight: '500' }}>
          {chapter?.name || 'N/A'}
        </span>
      ),
    },
    {
      title: 'Total Questions',
      dataIndex: 'totalQuestions',
      key: 'totalQuestions',
      align: 'center',
      width: 120,
      responsive: ['xs', 'sm', 'md', 'lg', 'xl'],
      render: (totalQuestions: number) => (
        <span style={{ color: '#1890ff', fontWeight: '500' }}>
          {totalQuestions}
        </span>
      ),
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
          loading={loadingExamId === record.examSessionId}
          onClick={() => handleExportToPDF(record)}
          style={{
            borderRadius: 6,
            display: 'block',
            alignItems: 'center',
            margin: '0 auto',
            gap: 4
          }}
        >
          <span style={{ marginLeft: '5px' }}>Export</span>
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
      onCancel={handleClose}
      footer={null}
      width="90%"
      style={{ maxWidth: 1200 }}
      className="user-results-modal"
      destroyOnClose
      centered
    >
      <Spin spinning={isLoadingResults} tip="Loading results...">
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
                    {totalResults}
                  </div>
                  <div style={{ color: '#666' }}>Total Exams</div>
                </div>
              </Col>
              <Col xs={24} sm={8}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 24, fontWeight: 'bold', color: '#52c41a' }}>
                    {userResults.reduce((sum, result) => sum + result.correctAnswers, 0)}
                  </div>
                  <div style={{ color: '#666' }}>Total Correct</div>
                </div>
              </Col>
              <Col xs={24} sm={8}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 24, fontWeight: 'bold', color: '#faad14' }}>
                    {userResults.length > 0
                      ? (
                        userResults.reduce((sum, result) =>
                          sum + (result.correctAnswers / result.totalQuestions) * 100, 0
                        ) / userResults.length
                      ).toFixed(1)
                      : '0.0'}%
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
              dataSource={userResults}
              pagination={{
                current: page,
                pageSize: PAGE_SIZE,
                total: totalResults,
                showSizeChanger: false,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} of ${total} results`,
                onChange: (newPage) => setPage(newPage),
              }}
              bordered
              rowKey={(record) => record.id || record.examDate}
              scroll={{ x: 800 }}
              size="middle"
              locale={{
                emptyText: 'No exam results found for this user'
              }}
            />
          </div>
        </div>
      </Spin>
    </Modal>
  );
};

export default UserResultsModal;
