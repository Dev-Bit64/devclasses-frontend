import React, { useState, useEffect, useCallback } from 'react';
import { Button, Table, Modal, Form, Input, Select, Row, Col, Space, Popconfirm, Tooltip, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, ImportOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { getQuestionsAction, addQuestionAction } from '../../redux/action/questionAction';
import { RootState, AppDispatch } from '../../redux/store';
import { AddQuestionPayload } from '../../interfaces/interfaces';
import ImportModal from '../../components/ImportModal';
import './index.scss';
import type { Breakpoint } from 'antd/es/_util/responsiveObserver';

const { Option } = Select;

const BOARD_OPTIONS = [
  { label: 'GSEB', value: 'GSEB' },
  { label: 'CBSE', value: 'CBSE' },
];
const STANDARD_OPTIONS = [
  { label: '11th', value: '11th' },
  { label: '12th', value: '12th' },
];
const SUBJECT_OPTIONS = [
  { label: 'Mathematics', value: 'Mathematics' },
  { label: 'Physics', value: 'Physics' },
  { label: 'Chemistry', value: 'Chemistry' },
  { label: 'Biology', value: 'Biology' },
  { label: 'English', value: 'English' },
];
const CHAPTER_OPTIONS: { [key: string]: string[] } = {
  Mathematics: ['Algebra', 'Geometry', 'Calculus', 'Statistics'],
  Physics: ['Mechanics', 'Thermodynamics', 'Optics', 'Electricity'],
  Chemistry: ['Organic Chemistry', 'Inorganic Chemistry', 'Physical Chemistry'],
  Biology: ['Cell Biology', 'Genetics', 'Ecology', 'Human Anatomy'],
  English: ['Grammar', 'Literature', 'Composition', 'Vocabulary'],
};
const CORRECT_ANSWER_OPTIONS = [
  { label: 'Option A', value: 'A' },
  { label: 'Option B', value: 'B' },
  { label: 'Option C', value: 'C' },
  { label: 'Option D', value: 'D' },
];

const DEFAULT_PAGE_SIZE = 20;

const QuestionsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { data, isLoading } = useSelector((state: RootState) => state.questions);
  const questions = Array.isArray(data?.data) ? data.data : [];
  const total = data?.total || 0;

  const [modalVisible, setModalVisible] = useState(false);
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingKey, setEditingKey] = useState<number | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string>('Mathematics');
  const [filterBoard, setFilterBoard] = useState<string | undefined>(undefined);
  const [filterStandard, setFilterStandard] = useState<string | undefined>(undefined);
  const [filterSubject, setFilterSubject] = useState<string | undefined>(undefined);
  const [filterChapter, setFilterChapter] = useState<string | undefined>(undefined);
  const [searchText, setSearchText] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [sortField, setSortField] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Fetch questions
  const fetchQuestions = useCallback(() => {
    dispatch(getQuestionsAction({
      page,
      limit: DEFAULT_PAGE_SIZE,
      search: searchText,
      sortField: sortField,
      sortOrder,
    }));
  }, [dispatch, page, searchText, sortField, sortOrder]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const handleSearch = () => {
    if (searchText.trim().length >= 3) {
      setPage(1);
      dispatch(getQuestionsAction({
        page: 1,
        limit: DEFAULT_PAGE_SIZE,
        search: searchText.trim(),
        sortField: sortField,
        sortOrder,
      }));
    } else if (searchText.trim().length === 0) {
      // If search is cleared, fetch without search
      setPage(1);
      dispatch(getQuestionsAction({
        page: 1,
        limit: DEFAULT_PAGE_SIZE,
        search: '',
        sortField: sortField,
        sortOrder,
      }));
    } else {
      message.warning('Search text must be at least 3 characters long');
    }
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchText(value);

    // Only trigger API call when search is completely cleared
    if (value.trim() === '') {
      setPage(1);
      dispatch(getQuestionsAction({
        page: 1,
        limit: DEFAULT_PAGE_SIZE,
        search: '',
        sortField: sortField,
        sortOrder,
      }));
    }
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const showModal = () => {
    setEditingKey(null);
    form.resetFields();
    setSelectedSubject('Mathematics');
    setModalVisible(true);
  };

  const showImportModal = () => {
    setImportModalVisible(true);
  };

  const handleImportModalClose = () => {
    setImportModalVisible(false);
  };

  const handleImport = async (file: File) => {
    try {
      // TODO: Implement actual import logic with API call
      console.log('Importing file:', file.name);
      message.success(`Successfully imported questions from ${file.name}`);

      // Refresh the questions list after import
      fetchQuestions();
    } catch (error) {
      message.error('Failed to import questions. Please try again.');
      console.error('Import error:', error);
    }
  };

  const handleEdit = (record: any) => {
    setEditingKey(record.key);
    setSelectedSubject(record.subject);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  // TODO: Implement delete with redux
  const handleDelete = (key: number) => {
    // dispatch(deleteQuestionAction(key));
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    setEditingKey(null);
    form.resetFields();
  };

  const handleSubjectChange = (value: string) => {
    setSelectedSubject(value);
    form.setFieldsValue({ chapter: undefined });
  };

  /**
   * Handle form submission for adding/editing questions
   *
   * This function integrates with the addQuestion API to create new questions.
   * It follows the AddQuestionPayload interface structure and includes:
   * - Form validation and data preparation
   * - API call using Redux Toolkit's createAsyncThunk
   * - Loading state management
   * - Success/error handling with user feedback
   * - Automatic refresh of questions list after successful addition
   *
   * @param values - Form values containing question data
   * @param values.board - Educational board (GSEB/CBSE)
   * @param values.subject - Subject name
   * @param values.chapter - Chapter name
   * @param values.standard - Educational standard/grade
   * @param values.question - The question text
   * @param values.optionA - Option A text
   * @param values.optionB - Option B text
   * @param values.optionC - Option C text
   * @param values.optionD - Option D text
   * @param values.correctAnswer - Correct answer (A/B/C/D)
   */
  const handleFinish = async (values: any) => {
    try {
      if (editingKey !== null) {
        // TODO: Implement edit functionality with updateQuestion API
        message.info('Edit functionality will be implemented soon');
        setModalVisible(false);
        setEditingKey(null);
        form.resetFields();
        return;
      }

      // Prepare payload for addQuestion API according to AddQuestionPayload interface
      const addQuestionPayload: AddQuestionPayload = {
        board: values.board,
        subject: values.subject,
        chapter: values.chapter,
        standard: values.standard,
        question: values.question,
        optionA: values.optionA,
        optionB: values.optionB,
        optionC: values.optionC,
        optionD: values.optionD,
        correctAnswer: values.correctAnswer
      };

      // Dispatch addQuestion action
      const resultAction = await dispatch(addQuestionAction(addQuestionPayload));

      // Check if the action was fulfilled successfully
      if (addQuestionAction.fulfilled.match(resultAction)) {
        // Success: Show success message and close modal
        message.success('Question added successfully!');

        // Close modal and reset form
        setModalVisible(false);
        setEditingKey(null);
        form.resetFields();

        // Refresh the questions list to show the newly added question
        fetchQuestions();
      } else {
        // Handle API error - error message will be shown by the slice
        console.error('Failed to add question:', resultAction.payload);
      }
    } catch (error) {
      // Handle unexpected errors
      console.error('Error in handleFinish:', error);
      message.error('An unexpected error occurred. Please try again.');
    }
  };

  const handleTableChange = (pagination: any, _filters: any, sorter: any) => {
    setPage(pagination.current);
    if (sorter && sorter.field) {
      setSortField(sorter.field);
      setSortOrder(sorter.order === 'descend' ? 'desc' : 'asc');
    }
  };

  const columns = [
    { title: 'Board', dataIndex: 'board', key: 'board', responsive: ['md'] as Breakpoint[] },
    { title: 'Standard', dataIndex: 'standard', key: 'standard', responsive: ['md'] as Breakpoint[] },
    { title: 'Subject', dataIndex: 'subject', key: 'subject' },
    { title: 'Chapter', dataIndex: 'chapter', key: 'chapter', responsive: ['lg'] as Breakpoint[] },
    { title: 'Question', dataIndex: 'question', key: 'question', ellipsis: true },
    { title: 'A', dataIndex: 'optionA', key: 'optionA', responsive: ['lg'] as Breakpoint[] },
    { title: 'B', dataIndex: 'optionB', key: 'optionB', responsive: ['lg'] as Breakpoint[] },
    { title: 'C', dataIndex: 'optionC', key: 'optionC', responsive: ['lg'] as Breakpoint[] },
    { title: 'D', dataIndex: 'optionD', key: 'optionD', responsive: ['lg'] as Breakpoint[] },
    { title: 'Correct', dataIndex: 'correctAnswer', key: 'correctAnswer', render: (val: string) => `Option ${val}` },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right' as const,
      render: (_: any, record: any) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} size="small" />
          <Popconfirm title="Delete this question?" onConfirm={() => handleDelete(record.key)} okText="Yes" cancelText="No">
            <Button icon={<DeleteOutlined />} danger size="small" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="questions-page-container animate-fade-in">
      <div className="questions-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 className="welcome-title" style={{ margin: 0 }}>Questions</h1>
        <Space size="middle">
          <Tooltip title="Import questions from Excel">
            <Button
              icon={<ImportOutlined />}
              onClick={showImportModal}
              className="import-button"
            >
              Import
            </Button>
          </Tooltip>
          <Button type="primary" icon={<PlusOutlined />} onClick={showModal} className="primary-button">
            Add Question
          </Button>
        </Space>
      </div>
      {/* Filters and Search Bar */}
      <div className="filters-search-container" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '20px',
        marginBottom: '18px',
        flexWrap: 'wrap'
      }}>
        {/* Filters Section */}
        <div className="filters-section" style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          alignItems: 'center',
          flex: '1',
          minWidth: 'fit-content'
        }}>
          <Select
            allowClear
            placeholder="Subject"
            style={{ minWidth: 140 }}
            value={filterSubject}
            onChange={val => { setFilterSubject(val); setFilterChapter(undefined); setPage(1); }}
            options={SUBJECT_OPTIONS}
          />
          <Select
            allowClear
            placeholder="Chapter"
            style={{ minWidth: 140 }}
            value={filterChapter}
            onChange={val => { setFilterChapter(val); setPage(1); }}
            options={filterSubject ? CHAPTER_OPTIONS[filterSubject].map(ch => ({ label: ch, value: ch })) : []}
            disabled={!filterSubject}
          />
        </div>

        {/* Search Section */}
        <div className="search-section" style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: '4px',
          flexShrink: 0,
          minWidth: 'fit-content'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Input
              allowClear
              placeholder="Search question... (min 3 characters)"
              prefix={<SearchOutlined />}
              style={{
                minWidth: 300,
                maxWidth: 400,
                borderColor: searchText.length > 0 && searchText.length < 3 ? '#ff4d4f' : undefined
              }}
              value={searchText}
              onChange={handleSearchInputChange}
              onPressEnter={handleSearchKeyPress}
              status={searchText.length > 0 && searchText.length < 3 ? 'error' : undefined}
            />
            <Button
              type="primary"
              icon={<SearchOutlined />}
              onClick={handleSearch}
              className="search-button"
              style={{ flexShrink: 0, marginLeft: '4px', height: '36px' }}
              disabled={searchText.length > 0 && searchText.length < 3}
            >
              Search
            </Button>
          </div>
          {searchText.length > 0 && searchText.length < 3 && (
            <div style={{
              color: '#ff4d4f',
              fontSize: '12px',
              marginTop: '2px',
              marginLeft: '4px'
            }}>
              Please enter at least 3 characters to search
            </div>
          )}
        </div>
      </div>
      <div className="questions-table-wrapper">
        <Table
          columns={columns}
          dataSource={questions}
          loading={isLoading}
          pagination={{
            current: page,
            pageSize: DEFAULT_PAGE_SIZE,
            total,
            showSizeChanger: false,
            onChange: (p) => setPage(p),
          }}
          bordered
          rowKey="key"
          scroll={{ x: 'max-content' }}
          onChange={handleTableChange}
        />
      </div>

      {/* Add/Edit Question Modal with responsive design */}
      <Modal
        open={modalVisible}
        onCancel={handleModalCancel}
        footer={null}
        width={window.innerWidth < 768 ? '95%' : window.innerWidth < 1024 ? '85%' : 1000}
        style={{
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
        centered
        className="question-modal"
        destroyOnClose
        maskClosable={false}
        title={
          <div
            style={{
              fontSize: 20,
              fontWeight: 600,
              textAlign: 'left',
              color: '#222',
              letterSpacing: 0.5,
              padding: '8px 0',
              background: 'transparent',
            }}
          >
            {editingKey !== null ? 'Update Question' : 'Add Question'}
          </div>
        }
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          initialValues={{ board: 'GSEB', standard: '11th', subject: 'Mathematics' }}
          
          className="question-form"
        >
          {/* ---------------- Basic Information Section ---------------- */}
          <div className="form-section">
            <h4 className="section-title">Basic Information</h4>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={6}>
                <Form.Item
                  name="board"
                  label="Board"
                  rules={[{ required: true, message: 'Please select board' }]}
                >
                  <Select
                    options={BOARD_OPTIONS}
                    placeholder="Select Board"
                    size="large"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Form.Item
                  name="standard"
                  label="Standard"
                  rules={[{ required: true, message: 'Please select standard' }]}
                >
                  <Select
                    options={STANDARD_OPTIONS}
                    placeholder="Select Standard"
                    size="large"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Form.Item
                  name="subject"
                  label="Subject"
                  rules={[{ required: true, message: 'Please select subject' }]}
                >
                  <Select
                    options={SUBJECT_OPTIONS}
                    placeholder="Select Subject"
                    onChange={handleSubjectChange}
                    size="large"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Form.Item
                  name="chapter"
                  label="Chapter"
                  rules={[{ required: true, message: 'Please select chapter' }]}
                >
                  <Select
                    placeholder="Select Chapter"
                    options={
                      selectedSubject
                        ? CHAPTER_OPTIONS[selectedSubject].map((ch: string) => ({
                          label: ch,
                          value: ch,
                        }))
                        : []
                    }
                    size="large"
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* ---------------- Question Section ---------------- */}
          <div className="form-section">
            <h4 className="section-title">Question</h4>
            <Row>
              <Col span={24}>
                <Form.Item
                  name="question"
                  rules={[
                    { required: true, message: 'Please enter question' },
                    { min: 10, message: 'Question must be at least 10 characters long' },
                    { max: 500, message: 'Question cannot exceed 500 characters' },
                  ]}
                >
                  <Input.TextArea
                    placeholder="Enter your question here (minimum 10 characters)"
                    showCount
                    maxLength={500}
                    autoSize={{ minRows: 4, maxRows: 6 }} // flexible but controlled height
                    style={{
                      fontSize: 15,
                      resize: 'none', // fix broken design
                      borderRadius: 6,
                      paddingRight: 40, // space for character counter
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* ---------------- Answer Options Section ---------------- */}
          <div className="form-section">
            <h4 className="section-title">Answer Options</h4>
            <Row gutter={[16, 16]}>
              {['A', 'B', 'C', 'D'].map((opt) => (
                <Col span={24} key={opt}>
                  <Form.Item
                    name={`option${opt}`}
                    label={`Option ${opt}`}
                    rules={[
                      { required: true, message: `Please enter option ${opt}` },
                      { max: 300, message: `Option ${opt} cannot exceed 300 characters` },
                    ]}
                  >
                    <Input.TextArea
                      placeholder={`Enter option ${opt}`}
                      showCount
                      maxLength={300}
                      autoSize={{ minRows: 2, maxRows: 4 }}
                      style={{
                        fontSize: 15,
                        resize: 'none',
                        borderRadius: 6,
                        paddingRight: 40, // ensures counter doesn’t overlap
                      }}
                    />
                  </Form.Item>
                </Col>
              ))}
            </Row>
          </div>


          {/* ---------------- Correct Answer Section ---------------- */}
          <div className="form-section">
            <h4 className="section-title">Correct Answer</h4>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={6}>
                <Form.Item
                  name="correctAnswer"
                  label="Select Correct Answer"
                  rules={[{ required: true, message: 'Please select correct answer' }]}
                >
                  <Select
                    options={CORRECT_ANSWER_OPTIONS}
                    placeholder="Choose correct option"
                    size="large"
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* ---------------- Action Buttons ---------------- */}
          <div className="form-actions" style={{ marginTop: 24 }}>
            <Row justify="end" gutter={12}>
              <Col>
                <Button
                  onClick={handleModalCancel}
                  className="cancel-button"
                  disabled={isLoading}
                  size="large"
                  style={{ minWidth: 100 }}
                >
                  Cancel
                </Button>
              </Col>
              <Col>
                <Button
                  type="primary"
                  htmlType="submit"
                  className="primary-button"
                  loading={isLoading}
                  disabled={isLoading}
                  size="large"
                  style={{ minWidth: 140 }}
                >
                  {isLoading
                    ? editingKey !== null
                      ? 'Updating...'
                      : 'Adding...'
                    : editingKey !== null
                      ? 'Update Question'
                      : 'Add Question'}
                </Button>
              </Col>
            </Row>
          </div>
        </Form>
      </Modal>

      <ImportModal
        visible={importModalVisible}
        onClose={handleImportModalClose}
        onImport={handleImport}
      />
    </div>
  );
};

export default QuestionsPage;