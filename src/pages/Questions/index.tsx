/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback } from 'react';
import { Button, Table, Modal, Form, Input, Select, Row, Col, Space, Popconfirm, Tooltip, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, ImportOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { getQuestionsAction, addQuestionAction, updateQuestionAction, deleteQuestionAction } from '../../redux/action/questionAction';
import { getSubjectsAction, getchaptersBySubjectIdAction } from '../../redux/action/subjectAction';
import { RootState, AppDispatch } from '../../redux/store';
import { AddQuestionPayload, UpdateQuestionPayload } from '../../interfaces/interfaces';
import ImportModal from '../../components/ImportModal';
import CustomDropdown from '../../components/ImportModal/CustomDropdown';
import './index.scss';
import type { Breakpoint } from 'antd/es/_util/responsiveObserver';

// Board options for filtering
const BOARD_OPTIONS = [
  { label: 'GSEB', value: 'GSEB' },
  { label: 'CBSE', value: 'CBSE' },
];

// Standard options for filtering
const STANDARD_OPTIONS = [
  { label: '11th', value: '11th' },
  { label: '12th', value: '12th' },
];

// Correct answer options for question form
const CORRECT_ANSWER_OPTIONS = [
  { label: 'Option A', value: 'A' },
  { label: 'Option B', value: 'B' },
  { label: 'Option C', value: 'C' },
  { label: 'Option D', value: 'D' },
];

const DEFAULT_PAGE_SIZE = 20;

const QuestionsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  // Redux selectors for questions and subjects
  const { data, isLoading } = useSelector((state: RootState) => state.questions);
  const { subjectLists, chapterLists } = useSelector((state: RootState) => state.subject);

  const questions = Array.isArray(data?.data) ? data.data : [];
  const total = data?.total || 0;

  // Modal and form state
  const [modalVisible, setModalVisible] = useState(false);
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [form] = Form.useForm();

  // Question editing state
  const [editingKey, setEditingKey] = useState<number | null>(null);

  // Subject and chapter state for form
  const [selectedSubject, setSelectedSubject] = useState<string | undefined>(undefined);
  const [_selectedSubjectId, setSelectedSubjectId] = useState<string | undefined>(undefined);

  // Filter state for questions list
  const [filterBoard, setFilterBoard] = useState<string | undefined>(undefined);
  const [filterStandard, setFilterStandard] = useState<string | undefined>(undefined);
  const [filterSubject, setFilterSubject] = useState<string | undefined>(undefined);
  const [filterChapter, setFilterChapter] = useState<string | undefined>(undefined);

  // Search and pagination state
  const [searchText, setSearchText] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [sortField, setSortField] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Selection state for bulk operations - managed by Ant Design Table's rowSelection
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  /**
   * Fetch subjects on component mount
   * - Retrieves all available subjects from the API
   * - Used to populate the subject dropdown in the form
   */
  useEffect(() => {
    dispatch(getSubjectsAction({}));
  }, [dispatch]);

  /**
   * Fetch questions based on current filters and pagination
   * - Called when page, search, sort field, or sort order changes
   * - Includes filter parameters for board, standard, subject, and chapter
   */
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

  /**
   * Handle search button click
   * - Validates that search text is at least 3 characters
   * - Only triggers API call on button click (not on input change)
   * - Allows clearing search with empty string
   */
  const handleSearch = () => {
    const trimmedSearch = searchText.trim();

    // Allow clearing search with empty string
    if (trimmedSearch.length === 0) {
      setPage(1);
      dispatch(getQuestionsAction({
        page: 1,
        limit: DEFAULT_PAGE_SIZE,
        search: '',
        sortField: sortField,
        sortOrder,
      }));
      return;
    }

    // Validate minimum 3 characters for search
    if (trimmedSearch.length < 3) {
      message.warning('Search text must be at least 3 characters long');
      return;
    }

    // Perform search with valid text
    setPage(1);
    dispatch(getQuestionsAction({
      page: 1,
      limit: DEFAULT_PAGE_SIZE,
      search: trimmedSearch,
      sortField: sortField,
      sortOrder,
    }));
  };

  /**
   * Handle search input change
   * - Only updates the search text state
   * - Does NOT trigger API calls (only on button click)
   */
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchText(value);
  };

  /**
   * Handle search input key press
   * - Triggers search when Enter key is pressed
   * - Provides better UX for keyboard users
   */
  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  /**
   * Handle Board filter change
   * - Updates board filter state
   * - Resets pagination to page 1
   * - Triggers API call to fetch filtered questions
   */
  const handleBoardChange = (value: string) => {
    const newBoard = value || undefined;
    setFilterBoard(newBoard);
    setPage(1);
    dispatch(getQuestionsAction({
      page: 1,
      limit: DEFAULT_PAGE_SIZE,
      board: newBoard,
      standard: filterStandard,
      subject: filterSubject,
      chapter: filterChapter,
      search: searchText,
      sortField: sortField,
      sortOrder,
    }));
  };

  /**
   * Handle Standard filter change
   * - Updates standard filter state
   * - Resets pagination to page 1
   * - Triggers API call to fetch filtered questions
   */
  const handleStandardChange = (value: string) => {
    const newStandard = value || undefined;
    setFilterStandard(newStandard);
    setPage(1);
    dispatch(getQuestionsAction({
      page: 1,
      limit: DEFAULT_PAGE_SIZE,
      board: filterBoard,
      standard: newStandard,
      subject: filterSubject,
      chapter: filterChapter,
      search: searchText,
      sortField: sortField,
      sortOrder,
    }));
  };

  /**
   * Handle Subject filter change (for filter dropdown)
   * - Updates subject filter state
   * - Fetches chapters for the selected subject from the API
   * - Clears chapter filter when subject changes
   * - Resets pagination to page 1
   * - Triggers API call to fetch filtered questions
   */
  const handleFilterSubjectChange = (value: string) => {
    const newSubject = value || undefined;
    setFilterSubject(newSubject);
    setFilterChapter(undefined); // Clear chapter when subject changes
    setPage(1);

    // Fetch chapters for the selected subject
    if (newSubject) {
      dispatch(getchaptersBySubjectIdAction(newSubject));
    }

    dispatch(getQuestionsAction({
      page: 1,
      limit: DEFAULT_PAGE_SIZE,
      board: filterBoard,
      standard: filterStandard,
      subject: newSubject,
      chapter: undefined,
      search: searchText,
      sortField: sortField,
      sortOrder,
    }));
  };

  /**
   * Handle Chapter filter change
   * - Updates chapter filter state
   * - Resets pagination to page 1
   * - Triggers API call to fetch filtered questions
   */
  const handleChapterChange = (value: string) => {
    const newChapter = value || undefined;
    setFilterChapter(newChapter);
    setPage(1);
    dispatch(getQuestionsAction({
      page: 1,
      limit: DEFAULT_PAGE_SIZE,
      board: filterBoard,
      standard: filterStandard,
      subject: filterSubject,
      chapter: newChapter,
      search: searchText,
      sortField: sortField,
      sortOrder,
    }));
  };

  /**
   * Show Add Question modal
   * - Resets form fields
   * - Clears editing state
   * - Sets default subject to first available subject from the list
   * - Fetches chapters for the default subject
   */
  const showModal = () => {
    setEditingKey(null);
    form.resetFields();

    // Set default subject to the first subject in the list if available
    if (Array.isArray(subjectLists) && subjectLists.length > 0) {
      const firstSubjectId = subjectLists[0].id;
      setSelectedSubject(firstSubjectId);
      setSelectedSubjectId(firstSubjectId);

      // Fetch chapters for the default subject
      dispatch(getchaptersBySubjectIdAction(firstSubjectId));
    }

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

  /**
   * Handle edit button click
   * - Loads question data into the form
   * - Sets the subject and fetches corresponding chapters
   * - Opens the modal for editing
   *
   * @param record - The question record to edit
   */
  const handleEdit = (record: any) => {
    setEditingKey(record.id);

    // Set the subject ID from the record
    const subjectId = record.subjectId || record.subject;
    setSelectedSubject(subjectId);
    setSelectedSubjectId(subjectId);

    // Fetch chapters for the selected subject
    if (subjectId) {
      dispatch(getchaptersBySubjectIdAction(subjectId));
    }

    // Load form values from the record
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  /**
   * Handle delete one or multiple questions
   * - Accepts a single question ID or array of IDs
   * - Converts single ID to array format for consistent API handling
   * - Dispatches deleteQuestionAction with array of IDs
   * - Redux slice removes the question(s) from the list and updates total count
   * - Shows success/error message via Redux toast notifications
   * - Supports both single deletion (from Actions column) and bulk deletion
   *
   * @param questionIds - Single question ID or array of question IDs to delete
   */
  const handleDelete = async (questionIds: string | string[]) => {
    try {
      // Convert single ID to array format for consistent API handling
      const idsArray = Array.isArray(questionIds) ? questionIds : [questionIds];

      // Dispatch delete action and wait for response
      const resultAction = await dispatch(deleteQuestionAction(idsArray));

      // Check if deletion was successful
      if (deleteQuestionAction.fulfilled.match(resultAction)) {
        // Success message is handled by Redux slice toast notification
        // No additional action needed here
      } else {
        // Error message is handled by Redux slice toast notification
        console.error('Failed to delete question(s):', resultAction.payload);
      }
    } catch (error) {
      // Handle unexpected errors
      console.error('Error in handleDelete:', error);
      message.error('An unexpected error occurred while deleting question(s).');
    }
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    setEditingKey(null);
    form.resetFields();
  };

  /**
   * Handle subject change in the form
   * - Updates the selected subject state
   * - Fetches chapters for the selected subject from the API
   * - Clears the chapter field when subject changes
   *
   * @param value - The selected subject ID
   */
  const handleSubjectChange = (value: string) => {
    setSelectedSubject(value);
    setSelectedSubjectId(value);
    form.setFieldsValue({ chapter: undefined });

    // Fetch chapters for the selected subject
    if (value) {
      dispatch(getchaptersBySubjectIdAction(value));
    }
  };

  /**
   * Handle form submission for adding/editing questions
   *
   * This function integrates with the addQuestion and updateQuestion APIs.
   * It follows the AddQuestionPayload/UpdateQuestionPayload interface structure and includes:
   * - Form validation and data preparation
   * - Proper subjectId and chapterId mapping from selected values
   * - API call using Redux Toolkit's createAsyncThunk
   * - Loading state management
   * - Success/error handling with user feedback
   * - Automatic refresh of questions list after successful operation
   *
   * @param values - Form values containing question data
   * @param values.board - Educational board (GSEB/CBSE)
   * @param values.subject - Subject ID (from dropdown)
   * @param values.chapter - Chapter ID (from dropdown)
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
      // Handle Edit Question
      if (editingKey !== null) {
        // Prepare payload for updateQuestion API according to UpdateQuestionPayload interface
        const updateQuestionPayload: UpdateQuestionPayload = {
          id: String(editingKey),
          board: values.board,
          subject: values.subject,
          chapter: values.chapter,
          standard: values.standard,
          question: values.question,
          optionA: values.optionA,
          optionB: values.optionB,
          optionC: values.optionC,
          optionD: values.optionD,
          correctAnswer: values.correctAnswer,
        };

        // Dispatch updateQuestion action
        const resultAction = await dispatch(updateQuestionAction(updateQuestionPayload));

        // Check if the action was fulfilled successfully
        if (updateQuestionAction.fulfilled.match(resultAction)) {
          // Success: Close modal and reset form
          // Redux slice automatically updates the questions list in state
          setModalVisible(false);
          setEditingKey(null);
          form.resetFields();
        } else {
          // Handle API error - error message will be shown by the slice
          console.error('Failed to update question:', resultAction.payload);
        }
        return;
      }

      // Handle Add Question
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
        correctAnswer: values.correctAnswer,
        // Map the selected subject and chapter IDs
        subjectId: values.subject || '',
        chapterId: values.chapter || ''
      };

      // Dispatch addQuestion action
      const resultAction = await dispatch(addQuestionAction(addQuestionPayload));

      // Check if the action was fulfilled successfully
      if (addQuestionAction.fulfilled.match(resultAction)) {
        // Success: Close modal and reset form
        // Redux slice automatically adds the question to the questions list in state
        setModalVisible(false);
        setEditingKey(null);
        form.resetFields();
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

  /**
   * Table columns configuration with optimized widths for better readability
   * - Board, Standard, Subject, Chapter: Filter columns (responsive)
   * - Question: Main content column with increased width (200px)
   * - Option A, B, C, D: Answer options with increased width (150px each)
   * - Correct Answer: Correct option indicator
   * - Actions: Edit and Delete buttons (fixed right)
   * - Horizontal scroll enabled for proper display on smaller screens
   */
  const columns = [
    {
      title: 'Board',
      dataIndex: 'board',
      key: 'board',
      width: 100,
      responsive: ['md'] as Breakpoint[],
    },
    {
      title: 'Standard',
      dataIndex: 'standard',
      key: 'standard',
      width: 100,
      responsive: ['md'] as Breakpoint[],
    },
    {
      title: 'Subject',
      dataIndex: 'subject',
      key: 'subject',
      width: 120,
    },
    {
      title: 'Chapter',
      dataIndex: 'chapter',
      key: 'chapter',
      width: 120,
      responsive: ['lg'] as Breakpoint[],
    },
    {
      title: 'Question',
      dataIndex: 'question',
      key: 'question',
      width: 200,
      ellipsis: {
        showTitle: false,
      },
      render: (text: string) => (
        <Tooltip title={text}>
          {text}
        </Tooltip>
      ),
    },
    {
      title: 'Option A',
      dataIndex: 'optionA',
      key: 'optionA',
      width: 150,
      responsive: ['lg'] as Breakpoint[],
      ellipsis: {
        showTitle: false,
      },
      render: (text: string) => (
        <Tooltip title={text}>
          {text}
        </Tooltip>
      ),
    },
    {
      title: 'Option B',
      dataIndex: 'optionB',
      key: 'optionB',
      width: 150,
      responsive: ['lg'] as Breakpoint[],
      ellipsis: {
        showTitle: false,
      },
      render: (text: string) => (
        <Tooltip title={text}>
          {text}
        </Tooltip>
      ),
    },
    {
      title: 'Option C',
      dataIndex: 'optionC',
      key: 'optionC',
      width: 150,
      responsive: ['lg'] as Breakpoint[],
      ellipsis: {
        showTitle: false,
      },
      render: (text: string) => (
        <Tooltip title={text}>
          {text}
        </Tooltip>
      ),
    },
    {
      title: 'Option D',
      dataIndex: 'optionD',
      key: 'optionD',
      width: 150,
      responsive: ['lg'] as Breakpoint[],
      ellipsis: {
        showTitle: false,
      },
      render: (text: string) => (
        <Tooltip title={text}>
          {text}
        </Tooltip>
      ),
    },
    {
      title: 'Correct Answer',
      dataIndex: 'correctAnswer',
      key: 'correctAnswer',
      width: 120,
      render: (val: string) => `Option ${val}`,
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right' as const,
      width: 100,
      render: (_: any, record: any) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} size="small" />
          <Popconfirm
            title="Delete this question?"
            description="This action cannot be undone."
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
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
      {/* Filters and Search Bar - Responsive layout for all screen sizes */}
      <div className="filters-search-container" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: '20px',
        marginBottom: '18px',
        flexWrap: 'wrap'
      }}>
        {/* Filters Section - Responsive custom dropdowns for Board, Standard, Subject, and Chapter */}
        <div className="filters-section" style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          alignItems: 'center',
          flex: '1',
          minWidth: 'fit-content'
        }}>
          {/* Board Filter Dropdown - Triggers API call on change */}
          <div className="filter-dropdown-wrapper">
            <CustomDropdown
              options={BOARD_OPTIONS}
              value={filterBoard || ''}
              onChange={handleBoardChange}
              placeholder="Board"
              size="middle"
            />
          </div>

          {/* Standard Filter Dropdown - Triggers API call on change */}
          <div className="filter-dropdown-wrapper">
            <CustomDropdown
              options={STANDARD_OPTIONS}
              value={filterStandard || ''}
              onChange={handleStandardChange}
              placeholder="Standard"
              size="middle"
            />
          </div>

          {/* Subject Filter Dropdown - Triggers API call on change, clears chapter filter */}
          <div className="filter-dropdown-wrapper">
            <CustomDropdown
              options={
                Array.isArray(subjectLists)
                  ? subjectLists.map((subject: any) => ({
                    label: subject.subjectName,
                    value: subject.id,
                  }))
                  : []
              }
              value={filterSubject || ''}
              onChange={handleFilterSubjectChange}
              placeholder="Subject"
              size="middle"
            />
          </div>

          {/* Chapter Filter Dropdown - Disabled if no subject selected, triggers API call on change */}
          <div className="filter-dropdown-wrapper">
            <CustomDropdown
              options={
                filterSubject && Array.isArray(chapterLists)
                  ? chapterLists.map((chapter: any) => ({
                    label: chapter.chapterName,
                    value: chapter.id,
                  }))
                  : []
              }
              value={filterChapter || ''}
              onChange={handleChapterChange}
              placeholder="Chapter"
              disabled={!filterSubject}
              size="middle"
            />
          </div>
        </div>

        {/* Search Section - Responsive search input and button */}
        <div className="search-section" style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: '4px',
          flex: '0 1 auto',
          minWidth: '0',
          width: '100%'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', width: '100%', minWidth: '0' }}>
            <Input
              allowClear
              placeholder="Search question... (min 3 characters)"
              prefix={<SearchOutlined />}
              style={{
                flex: '1',
                minWidth: '0',
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
              style={{ flexShrink: 0, marginLeft: '4px', height: '36px', whiteSpace: 'nowrap' }}
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
          rowKey="id"
          scroll={{ x: 'max-content' }}
          onChange={handleTableChange}
          // Checkbox selection configuration - maintains table responsiveness
          rowSelection={{
            selectedRowKeys,
            onChange: (keys) => setSelectedRowKeys(keys),
            type: 'checkbox',
          }}
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
          initialValues={{
            board: 'GSEB',
            standard: '11th',
            // Set default subject to first available subject ID
            subject: Array.isArray(subjectLists) && subjectLists.length > 0 ? subjectLists[0].id : undefined
          }}
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
                    options={
                      Array.isArray(subjectLists)
                        ? subjectLists.map((subject: any) => ({
                          label: subject.subjectName,
                          value: subject.id,
                        }))
                        : []
                    }
                    placeholder="Select Subject"
                    onChange={handleSubjectChange}
                    size="large"
                    allowClear
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
                      selectedSubject && Array.isArray(chapterLists)
                        ? chapterLists.map((chapter: any) => ({
                          label: chapter.chapterName,
                          value: chapter.id,
                        }))
                        : []
                    }
                    size="large"
                    allowClear
                    disabled={!selectedSubject}
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