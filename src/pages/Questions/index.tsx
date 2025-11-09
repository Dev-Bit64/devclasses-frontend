/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button, Table, Modal, Form, Input, Select, Row, Col, Space, Popconfirm, Tooltip, message, Radio } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, ImportOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { getQuestionsAction, addQuestionAction, updateQuestionAction, deleteQuestionAction } from '../../redux/action/questionAction';
import {  getSubjectsForDDAction, getchaptersBySubjectIdAction } from '../../redux/action/subjectAction';
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

const DEFAULT_PAGE_SIZE = 20;

const QuestionsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  // Redux selectors for questions and subjects
  const { questionLists, isLoading } = useSelector((state: RootState) => state.questions);
  const { subjectDropdownList, chapterLists } = useSelector((state: RootState) => state.subject);

  
  const questions = Array.isArray(questionLists?.questions) ? questionLists.questions : [];

  

  const total = questionLists?.totalRecords || 0;

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
    dispatch(getSubjectsForDDAction());
  }, [dispatch]);

  /**
   * Fetch questions based on current filters and pagination
   * - Called when page, search, sort field, sort order or any filter changes
   */
  const fetchQuestions = useCallback(() => {
    dispatch(getQuestionsAction({
      page,
      limit: DEFAULT_PAGE_SIZE,
      search: searchText,
      sortField: sortField,
      sortOrder,
      board: filterBoard,
      standard: filterStandard,
      subject: filterSubject,
      chapter: filterChapter,
    }));
  }, [dispatch, page, searchText, sortField, sortOrder, filterBoard, filterStandard, filterSubject, filterChapter]);

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
   * Handle Subject filter change (for filter dropdown)
   * - Updates subject filter state
   * - Fetches chapters for the selected subject from the API
   * - Clears chapter filter when subject changes
   * - Resets pagination to page 1
   * - Triggers API call to fetch filtered questions (via fetchQuestions effect)
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

    // fetchQuestions effect will run because filterSubject / page changed
  };

  /**
   * Handle Chapter filter change
   * - Updates chapter filter state
   * - Resets pagination to page 1
   * - Triggers API call to fetch filtered questions (via fetchQuestions effect)
   */
  const handleChapterChange = (value: string) => {
    const newChapter = value || undefined;
    setFilterChapter(newChapter);
    setPage(1);
    // fetchQuestions effect will run
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
    if (Array.isArray(subjectDropdownList) && subjectDropdownList.length > 0) {
      const firstSubjectId = subjectDropdownList[0].id;
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
      // Dispatch delete action and wait for response
      // The Redux action now accepts either a single id (string) or array (string[])
      const resultAction = await dispatch(deleteQuestionAction(questionIds as any));

      // Check if deletion was successful
      if (deleteQuestionAction.fulfilled.match(resultAction)) {
        // Success message is handled by Redux slice toast notification
        // Clear selection after successful delete
        setSelectedRowKeys([]);
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

  const handleTableChange = (pagination: any, filters: any, sorter: any) => {
    // Pagination from table (keep current page)
    setPage(pagination.current);

    // Server-side sort handling
    if (sorter && sorter.field) {
      setSortField(sorter.field);
      setSortOrder(sorter.order === 'descend' ? 'desc' : 'asc');
    }

    // Read column filters (AntD supplies arrays)
    const boardFilter = Array.isArray(filters.board) && filters.board.length > 0 ? String(filters.board[0]) : undefined;
    const standardFilter = Array.isArray(filters.standard) && filters.standard.length > 0 ? String(filters.standard[0]) : undefined;

    // Update local filter state (only if changed)
    setFilterBoard(prev => (prev !== boardFilter ? boardFilter : prev));
    setFilterStandard(prev => (prev !== standardFilter ? standardFilter : prev));

    // If any column filter actually changed (including cleared -> undefined),
    // reset to first page. Do NOT dispatch here — fetchQuestions effect will run once
    // because state updates are batched.
    if (boardFilter !== filterBoard || standardFilter !== filterStandard) {
      setPage(1);
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
  /**
   * Memoized row selection configuration to prevent lag
   * - Only recreates when selectedRowKeys changes
   * - Improves performance when selecting multiple rows
   */
  const rowSelection = useMemo(() => ({
    selectedRowKeys,
    onChange: (keys: React.Key[]) => setSelectedRowKeys(keys),
    type: 'checkbox' as const,
    preserveSelectedRowKeys: true,
  }), [selectedRowKeys]);

  const columns = [
    {
      title: 'Board',
      dataIndex: 'board',
      key: 'board',
      width: 100,
      responsive: ['md'] as Breakpoint[],
      // custom filter dropdown: single-select radio (vertical) like Standard
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }: any) => {
        // selectedKeys may be an array; we only allow single selection here
        const current = Array.isArray(selectedKeys) && selectedKeys.length > 0 ? selectedKeys[0] : undefined;
        return (
          <div style={{ padding: 8 }}>
            <Radio.Group
              onChange={(e) => {
                setSelectedKeys(e.target ? [e.target.value] : []);
              }}
              value={current}
            >
              {BOARD_OPTIONS.map(o => (
                <Radio key={o.value} value={o.value} style={{ display: 'block', marginBottom: 6 }}>
                  {o.label}
                </Radio>
              ))}
            </Radio.Group>
            <div style={{ marginTop: 8, textAlign: 'right' }}>
              <Button
                size="small"
                onClick={() => {
                  // Clear filters and close dropdown — Table.onChange will be called by confirm
                  clearFilters && clearFilters();
                  confirm && confirm();
                }}
                style={{ marginRight: 8 }}
              >
                Reset
              </Button>
              <Button
                type="primary"
                size="small"
                onClick={() => {
                  // Close dropdown and let Table.onChange update state and trigger API once
                  confirm && confirm();
                }}
              >
                Apply
              </Button>
            </div>
          </div>
        );
      },
      // show the active filter in column header
      filteredValue: filterBoard ? [filterBoard] : undefined,
      // optional client-side filter fallback
      onFilter: (value: any, record: any) => {
        const rec = record.board ?? record;
        if (!rec) return false;
        return String(rec).toLowerCase() === String(value).toLowerCase();
      },
    },
    {
      title: 'Standard',
      dataIndex: 'standard',
      key: 'standard',
      width: 100,
      responsive: ['md'] as Breakpoint[],
      render: (val: any, record: any) => {
        const std = record.standard ?? val;
        if (!std) return '';
        if (typeof std === 'string') return std;
        return std.name || std.label || std.value || '';
      },
      // custom filter dropdown with radio (single-select). Do NOT dispatch here.
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }: any) => {
        const current = Array.isArray(selectedKeys) && selectedKeys.length > 0 ? selectedKeys[0] : undefined;
        return (
          <div style={{ padding: 8 }}>
            <Radio.Group
              onChange={(e) => {
                setSelectedKeys(e.target ? [e.target.value] : []);
              }}
              value={current}
            >
              {STANDARD_OPTIONS.map(o => (
                <Radio key={o.value} value={o.value} style={{ display: 'block', marginBottom: 6 }}>
                  {o.label}
                </Radio>
              ))}
            </Radio.Group>
            <div style={{ marginTop: 8, textAlign: 'right' }}>
              <Button
                size="small"
                onClick={() => {
                  // Clear filters and close dropdown — Table.onChange will be invoked by confirm
                  clearFilters && clearFilters();
                  confirm && confirm();
                }}
                style={{ marginRight: 8 }}
              >
                Reset
              </Button>
              <Button
                type="primary"
                size="small"
                onClick={() => {
                  // Close dropdown and let Table.onChange handle updating state + API
                  confirm && confirm();
                }}
              >
                Apply
              </Button>
            </div>
          </div>
        );
      },
      filteredValue: filterStandard ? [filterStandard] : undefined,
      filterMultiple: false,
      onFilter: (value: any, record: any) => {
        const std = record.standard ?? record;
        if (!std) return false;
        if (typeof std === 'string') return String(std).toLowerCase() === String(value).toLowerCase();
        const v = std.name || std.label || std.value;
        return String(v).toLowerCase() === String(value).toLowerCase();
      },
    },
    {
      title: 'Subject',
      dataIndex: 'subject',
      key: 'subject',
      width: 120,
      render: (val: any, record: any) => {
        const sub = record.subject ?? val;
        if (!sub) return '';
        if (typeof sub === 'string') return sub;
        // support multiple possible keys returned from API
        return sub.subjectName || sub.subname || sub.name || sub.label || '';
      },
    },
    {
      title: 'Chapter',
      dataIndex: 'chapter',
      key: 'chapter',
      width: 120,
      responsive: ['lg'] as Breakpoint[],
      render: (val: any, record: any) => {
        const ch = record.chapter ?? val;
        if (!ch) return '';
        if (typeof ch === 'string') return ch;
        return ch.chapterName || ch.name || ch.label || '';
      },
    },
    {
      title: 'Question',
      dataIndex: 'question',
      key: 'question',
      width: 400,
      ellipsis: {
        showTitle: false,
      },
      render: (text: string) => (
        <Tooltip title={text}>
          <div style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}>
            {text}
          </div>
          {/* {text} */}
        </Tooltip>
      ),
    },
    {
      title: 'Option A',
      dataIndex: 'optionA',
      key: 'optionA',
      width: 300,
      responsive: ['lg'] as Breakpoint[],
      ellipsis: {
        showTitle: false,
      },
      render: (text: string) => (
        <Tooltip title={text}>
          <div style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}>
            {text}
          </div>
          {/* {text} */}
        </Tooltip>
      ),
    },
    {
      title: 'Option B',
      dataIndex: 'optionB',
      key: 'optionB',
      width: 300,
      responsive: ['lg'] as Breakpoint[],
      ellipsis: {
        showTitle: false,
      },
      render: (text: string) => (
        <Tooltip title={text}>
          <div style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}>
            {text}
          </div>
          {/* {text} */}
        </Tooltip>
      ),
    },
    {
      title: 'Option C',
      dataIndex: 'optionC',
      key: 'optionC',
      width: 300,
      responsive: ['lg'] as Breakpoint[],
      ellipsis: {
        showTitle: false,
      },
      render: (text: string) => (
        <Tooltip title={text}>
          <div style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}>
            {text}
          </div>
          {/* {text} */}
        </Tooltip>
      ),
    },
    {
      title: 'Option D',
      dataIndex: 'optionD',
      key: 'optionD',
      width: 300,
      responsive: ['lg'] as Breakpoint[],
      ellipsis: {
        showTitle: false,
      },
      render: (text: string) => (
        <Tooltip title={text}>
          <div style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}>
            {text}
          </div>
          {/* {text} */}
        </Tooltip>
      ),
    },
    {
      title: 'Correct Answer',
      dataIndex: 'correctAnswer',
      key: 'correctAnswer',
      width: 300,
      render: (val: any, record: any) => {
        // val may be 'optionC' or just 'C' — handle both
        let key = '';
        if (!val) return '';
        if (typeof val === 'string' && val.toLowerCase().startsWith('option')) {
          key = val;
        } else {
          // single letter like 'A'|'B'|'C'|'D'
          key = `option${String(val)}`;
        }
        const answer = record[key] || record[key.toLowerCase()] || '';
        return (
          <div style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}>
            {answer}
          </div>
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right' as const,
      width: 100,
      render: (_: any, record: any) => (
        <Space>
          <Button style={{marginRight: '10px'}} icon={<EditOutlined />} onClick={() => handleEdit(record)} size="small" />
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
          {selectedRowKeys.length > 0 && (
            <Popconfirm
              title={`Delete ${selectedRowKeys.length} question${selectedRowKeys.length > 1 ? 's' : ''}?`}
              description="This action cannot be undone."
              onConfirm={() => {
                // Pass single id as string when only one selected, otherwise pass array of strings
                const payload = selectedRowKeys.length === 1
                  ? String(selectedRowKeys[0])
                  : selectedRowKeys.map(k => String(k));
                handleDelete(payload);
                setSelectedRowKeys([]);
              }}
              okText="Yes"
              cancelText="No"
            >
              <Button
                danger
                icon={<DeleteOutlined />}
                className="bulk-delete-button"
              >
                Delete ({selectedRowKeys.length})
              </Button>
            </Popconfirm>
          )}
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
        {/* Filters Section - Subject and Chapter only (Board & Standard filters moved into table columns) */}
        <div className="filters-section" style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          alignItems: 'center',
          flex: '1',
          minWidth: 'fit-content'
        }}>

          {/* Subject Filter Dropdown - Triggers API call on change, clears chapter filter */}
          <div className="filter-dropdown-wrapper">
            <CustomDropdown
              options={
                Array.isArray(subjectDropdownList)
                  ? subjectDropdownList.map((subject: any) => ({
                    label: subject.subname,
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
                    label: chapter.name,
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
          rowSelection={rowSelection}
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
            subject: Array.isArray(subjectDropdownList) && subjectDropdownList.length > 0 ? subjectDropdownList[0].id : undefined
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
                      Array.isArray(subjectDropdownList)
                        ? subjectDropdownList.map((subject: any) => ({
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
                    options={
                      [
                        { label: 'Option A', value: 'A' },
                        { label: 'Option B', value: 'B' },
                        { label: 'Option C', value: 'C' },
                        { label: 'Option D', value: 'D' },
                      ]
                    }
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
      />
    </div>
  );
};

export default QuestionsPage;