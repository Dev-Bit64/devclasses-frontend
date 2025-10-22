/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Table,
  Button,
  Input,
  Select,
  Modal,
  Form,
  message,
  Popconfirm,
  Space,
  Typography
} from 'antd';
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import './index.scss';
import AddChapterModal from '../../components/AddChapterModal';
import '../../components/AddChapterModal/index.scss';
import { getSubjectsAction, addSubjectAction, updateSubjectAction, deleteSubjectAction } from '../../redux/action/subjectAction';
import { RootState, AppDispatch } from '../../redux/store';
import { AddSubjectPayload, UpdateSubject } from '../../interfaces/interfaces';

const { Title } = Typography;

/**
 * Board options for filtering
 * Supports GSEB and CBSE boards
 */
const BOARD_OPTIONS = [
  { label: 'GSEB', value: 'GSEB' },
  { label: 'CBSE', value: 'CBSE' },
];

/**
 * Standard options for filtering
 * Represents different educational standards/grades
 */
const STANDARD_OPTIONS = [
  { label: '11th', value: '11th' },
  { label: '12th', value: '12th' },
];

// Interface for Chapter data
interface Chapter {
  key: string;
  id: number;
  no: number;
  chapterName: string;
}

/**
 * Subject interface representing a subject with all its properties
 * Includes chapters array for nested chapter data
 */
interface Subject {
  key: string;
  id: number;
  no: number;
  subjectName: string;
  board: string;
  standard: string;
  chapters: Chapter[];
}

/**
 * Subjects Page Component
 * Displays a table of subjects with search, filter, and CRUD operations
 * Integrates with Redux for state management and API calls
 * Matches the design theme of Questions page
 */
const SubjectsPage: React.FC = () => {
  // Redux hooks for dispatch and state management
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading } = useSelector(
    (state: RootState) => state.subject
  );

  // Local state management for UI
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [searchText, setSearchText] = useState<string>('');
  const [appliedSearchText, setAppliedSearchText] = useState<string>('');
  const [filterBoard, setFilterBoard] = useState<string | undefined>(undefined);
  const [filterStandard, setFilterStandard] = useState<string | undefined>(undefined);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);
  const [form] = Form.useForm();
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);

  // Pagination state
  const [page, setPage] = useState<number>(1);
  const DEFAULT_PAGE_SIZE = 10;

  // Add state for Add/Edit Chapter modal
  const [addChapterModalVisible, setAddChapterModalVisible] = useState(false);
  const [selectedSubjectKey, setSelectedSubjectKey] = useState<string | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [editingChapter, setEditingChapter] = useState<{ id: string; chapterName: string } | null>(null);

  /**
   * Fetch subjects data from API using Redux action
   * Supports search and filter parameters
   * @param searchQuery - Optional search query for subject name
   * @param boardFilter - Optional board filter value
   * @param standardFilter - Optional standard filter value
   */
  const fetchSubjects = useCallback(async (
    searchQuery: string = '',
    boardFilter: string | undefined = undefined,
    standardFilter: string | undefined = undefined
  ) => {
    try {
      // Dispatch Redux action to fetch subjects from API
      const result = await dispatch(getSubjectsAction({}));

      // Check if the action was fulfilled
      if (result.payload && result.payload.data) {
        let filteredData = result.payload.data;

        // Apply search filter - only if search query is provided
        if (searchQuery.trim()) {
          filteredData = filteredData.filter((subject: any) =>
            subject.subjectName.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }

        // Apply board filter
        if (boardFilter) {
          filteredData = filteredData.filter((subject: any) => subject.board === boardFilter);
        }

        // Apply standard filter
        if (standardFilter) {
          filteredData = filteredData.filter((subject: any) => subject.standard === standardFilter);
        }

        // Transform API data to match Subject interface
        const transformedData: Subject[] = filteredData.map((item: any, index: number) => ({
          key: item.id?.toString() || index.toString(),
          id: item.id || index,
          no: index + 1,
          subjectName: item.subjectName,
          board: item.board,
          standard: item.standard || '',
          chapters: item.chapters || [],
        }));

        setSubjects(transformedData);
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
      message.error('Failed to fetch subjects');
    }
  }, [dispatch]);

  /**
   * Fetch all subjects on component mount
   */
  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  /**
   * Handle search functionality with minimum 3 characters validation
   * Calls API with search parameters only when search button is clicked
   * Supports search with 3+ characters or empty search to show all
   */
  const handleSearch = () => {
    const trimmedSearch = searchText.trim();

    // Validate search text: must be 3+ characters or empty
    if (trimmedSearch.length >= 3 || trimmedSearch.length === 0) {
      setPage(1);
      setAppliedSearchText(trimmedSearch);
      // Fetch subjects with current search and filter values
      fetchSubjects(trimmedSearch, filterBoard, filterStandard);
    } else {
      message.warning('Search text must be at least 3 characters long');
    }
  };

  /**
   * Handle table filter changes for Board and Standard columns
   * Updates filter state and refreshes data with new filters
   * @param filters - Object containing filter values from table columns
   */
  const handleTableFilterChange = (filters: any) => {
    // Extract board and standard filter values from table filters
    const boardFilter = filters.board ? filters.board[0] : undefined;
    const standardFilter = filters.standard ? filters.standard[0] : undefined;

    // Update filter states
    setFilterBoard(boardFilter);
    setFilterStandard(standardFilter);

    // Reset pagination to first page
    setPage(1);

    // Fetch subjects with updated filters and current search text
    fetchSubjects(appliedSearchText, boardFilter, standardFilter);
  };

  /**
   * Handle search input changes
   * Only triggers API call when search is cleared
   */
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchText(value);
    
    // Auto-fetch when search is cleared
    if (value.trim() === '') {
      setPage(1);
      fetchSubjects();
    }
  };

  /**
   * Handle Enter key press in search input
   */
  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  /**
   * Show modal for adding new subject
   * Resets all editing state
   */
  const showModal = () => {
    setEditingKey(null);
    setEditingSubjectId(null);
    form.resetFields();
    setModalVisible(true);
  };

  /**
   * Handle edit subject
   * Stores both the key and ID for API update call
   * Populates form with existing subject data
   */
  const handleEdit = (record: Subject) => {
    setEditingKey(record.key);
    setEditingSubjectId(record.id.toString());
    form.setFieldsValue({
      subjectName: record.subjectName,
      board: record.board,
      standard: record.standard,
    });
    setModalVisible(true);
  };

  /**
   * Handle delete subject
   * Calls deleteSubjectAction API and updates local state
   */
  const handleDelete = async (key: string) => {
    try {
      const subjectToDelete = subjects.find(subject => subject.key === key);
      if (!subjectToDelete) {
        message.error('Subject not found');
        return;
      }

      // Call delete API action
      const result = await dispatch(deleteSubjectAction([subjectToDelete.id.toString()]));

      if (result.payload && result.payload.statusCode === 200) {
        // Update local state after successful deletion
        const updatedSubjects = subjects.filter(subject => subject.key !== key);
        setSubjects(updatedSubjects);
        message.success('Subject deleted successfully');
      } else {
        message.error('Failed to delete subject');
      }
    } catch (error) {
      console.error('Error deleting subject:', error);
      message.error('Error deleting subject');
    }
  };

  /**
   * Handle modal cancel
   * Resets form and editing state
   */
  const handleModalCancel = () => {
    setModalVisible(false);
    setEditingKey(null);
    setEditingSubjectId(null);
    form.resetFields();
  };

  /**
   * Handle form submission for add/edit subject
   * Dispatches Redux actions and updates local state from Redux store
   * Does not require full list refresh - Redux state is updated automatically
   * @param values - Form field values from Ant Design Form
   */
  const handleSubmit = async (values: any) => {
    try {
      setSubmitLoading(true);

      if (editingKey && editingSubjectId) {
        // Update existing subject via API
        const updatePayload: UpdateSubject = {
          id: editingSubjectId,
          subjectName: values.subjectName,
          subjectDescription: '',
          board: values.board,
          standard: values.standard,
        };

        const result = await dispatch(updateSubjectAction(updatePayload));

        if (result.payload && result.payload.statusCode === 200) {
          /**
           * Update local state from Redux store
           * The Redux slice automatically updates subjectLists with the updated subject
           */
          const updatedSubjects = subjects.map(subject =>
            subject.key === editingKey
              ? {
                  ...subject,
                  subjectName: values.subjectName,
                  board: values.board,
                  standard: values.standard,
                }
              : subject
          );
          setSubjects(updatedSubjects);
          message.success('Subject updated successfully');
          handleModalCancel();
        } else {
          message.error('Failed to update subject');
        }
      } else {
        // Add new subject via API
        const addPayload: AddSubjectPayload = {
          subjectName: values.subjectName,
          subjectDescription: '',
          board: values.board,
          standard: values.standard,
        };

        const result = await dispatch(addSubjectAction(addPayload));

        if (result.payload && result.payload.statusCode === 200) {
          /**
           * Update local state from Redux store
           * The Redux slice automatically appends the new subject to subjectLists
           * No need to refresh the entire list from API
           */
          if (result.payload.data) {
            const newSubject: Subject = {
              key: result.payload.data.id?.toString() || Date.now().toString(),
              id: result.payload.data.id,
              no: subjects.length + 1,
              subjectName: result.payload.data.subjectName,
              board: result.payload.data.board,
              standard: result.payload.data.standard || '',
              chapters: result.payload.data.chapters || [],
            };
            setSubjects([...subjects, newSubject]);
          }
          message.success('Subject added successfully');
          handleModalCancel();
        } else {
          message.error('Failed to add subject');
        }
      }
    } catch (error) {
      console.error('Form submission error:', error);
      message.error('Error processing subject');
    } finally {
      setSubmitLoading(false);
    }
  };

  /**
   * Add Chapter button handler
   * Stores the subject key and ID for the modal
   * Resets editing state to add mode
   */
  const handleAddChapterClick = (subjectKey: string) => {
    const subject = subjects.find(s => s.key === subjectKey);
    if (subject) {
      setSelectedSubjectKey(subjectKey);
      setSelectedSubjectId(subject.id.toString());
      setEditingChapter(null);
      setAddChapterModalVisible(true);
    }
  };

  /**
   * Handle successful chapter addition
   * Called by AddChapterModal after API call succeeds
   * Redux state is automatically updated by the slice
   * This function updates local state to reflect the new chapter
   */
  const handleAddChapter = (chapterName: string) => {
    if (!selectedSubjectKey) return;

    // Update local state with the new chapter
    setSubjects(prevSubjects => prevSubjects.map(subject => {
      if (subject.key === selectedSubjectKey) {
        const newChapter = {
          key: `${subject.key}-${Date.now()}`,
          id: subject.chapters.length + 1,
          no: subject.chapters.length + 1,
          chapterName,
        };
        return {
          ...subject,
          chapters: [...subject.chapters, newChapter],
        };
      }
      return subject;
    }));

    // Reset modal state
    setAddChapterModalVisible(false);
    setSelectedSubjectKey(null);
    setSelectedSubjectId(null);
    setEditingChapter(null);
  };

  /**
   * Handle modal cancel
   * Resets all chapter modal related state
   */
  const handleAddChapterCancel = () => {
    setAddChapterModalVisible(false);
    setSelectedSubjectKey(null);
    setSelectedSubjectId(null);
    setEditingChapter(null);
  };

  /**
   * Handle edit chapter button click
   * Opens modal in edit mode with chapter data pre-filled
   * Stores the subject key and ID for the API call
   */
  const handleEditChapterClick = (chapter: Chapter, subjectKey: string) => {
    const subject = subjects.find(s => s.key === subjectKey);
    if (subject) {
      setSelectedSubjectKey(subjectKey);
      setSelectedSubjectId(subject.id.toString());
      setEditingChapter({
        id: chapter.id.toString(),
        chapterName: chapter.chapterName,
      });
      setAddChapterModalVisible(true);
    }
  };

  /**
   * Table columns configuration
   * Includes: No., Subject Name, Board, Standard, and Action columns
   * Board and Standard columns have filter functionality
   */
  const columns = [
    {
      title: 'No.',
      dataIndex: 'no',
      key: 'no',
      width: 40,
      align: 'center' as const,
    },
    {
      title: 'Subject Name',
      dataIndex: 'subjectName',
      key: 'subjectName',
      sorter: (a: Subject, b: Subject) => a.subjectName.localeCompare(b.subjectName),
    },
    {
      title: 'Board',
      dataIndex: 'board',
      key: 'board',
      width: 180,
      filters: BOARD_OPTIONS.map(option => ({ text: option.label, value: option.value })),
      onFilter: (value: any, record: Subject) => record.board === value,
    },
    {
      title: 'Standard',
      dataIndex: 'standard',
      key: 'standard',
      width: 180,
      filters: STANDARD_OPTIONS.map(option => ({ text: option.label, value: option.value })),
      onFilter: (value: any, record: Subject) => record.standard === value,
    },
    {
      title: 'Action',
      key: 'action',
      width: 120,
      align: 'center' as const,
      render: (_: any, record: Subject) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            className="action-button edit-button"
            title="Edit Subject"
          />
          <Popconfirm
            title="Delete Subject"
            description="Are you sure you want to delete this subject?"
            onConfirm={() => handleDelete(record.key)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="text"
              icon={<DeleteOutlined />}
              className="action-button delete-button"
              title="Delete Subject"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  /**
   * Generate chapter table columns with subject key
   * This function creates columns dynamically to pass the subject key to edit handler
   * @param subjectKey - The key of the parent subject
   */
  const getChapterColumns = (subjectKey: string) => [
    {
      title: 'No.',
      dataIndex: 'no',
      key: 'no',
      width: 80,
      align: 'center' as const,
    },
    {
      title: 'Chapter Name',
      dataIndex: 'chapterName',
      key: 'chapterName',
    },
    {
      title: 'Action',
      key: 'action',
      width: 120,
      align: 'center' as const,
      render: (_: any, record: Chapter) => (
        <Space size="small">
          {/* Edit Chapter Button */}
          <Button
            type="text"
            icon={<EditOutlined />}
            className="action-button edit-button"
            title="Edit Chapter"
            onClick={() => handleEditChapterClick(record, subjectKey)}
          />
          {/* Delete Chapter Button */}
          <Button
            type="text"
            icon={<DeleteOutlined />}
            className="action-button delete-button"
            title="Delete Chapter"
            // onClick={() => handleDeleteChapter(record.key)}
            disabled
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="subjects-page">
      {/* Page Header */}
      <div className="subjects-header">
        <Title level={2} className="page-title">
          Subjects Management
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={showModal}
          className="add-button"
        >
          Add Subject
        </Button>
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
        {/* <div className="filters-section" style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: '12px', 
          alignItems: 'center',
          flex: '1',
          minWidth: 'fit-content'
        }}>
          <Select
            allowClear
            placeholder="Board"
            style={{ minWidth: 120 }}
            value={filterBoard}
            onChange={val => { setFilterBoard(val); setPage(1); }}
            options={BOARD_OPTIONS}
          />
        </div> */}
        
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
              placeholder="Search subjects... (min 3 characters)"
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

      {/* Subjects Table */}
      <div className="subjects-table-wrapper">
        <Table
          columns={columns}
          dataSource={subjects}
          loading={isLoading}
          onChange={handleTableFilterChange}
          pagination={{
            current: page,
            pageSize: DEFAULT_PAGE_SIZE,
            total: subjects.length,
            onChange: (newPage) => setPage(newPage),
            showSizeChanger: false,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} subjects`,
          }}
          scroll={{ x: 800 }}
          className="subjects-table"
          expandable={{
            expandedRowRender: (record: Subject) => (
              <div style={{ background: '#f6f8fa', padding: '16px', borderRadius: '6px', margin: '8px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => handleAddChapterClick(record.key)}
                    style={{ borderRadius: '6px', fontWeight: 500 }}
                  >
                    Add Chapter
                  </Button>
                </div>
                <Table
                  columns={getChapterColumns(record.key)}
                  dataSource={record.chapters}
                  pagination={false}
                  size="small"
                  rowKey="key"
                  className="chapters-inner-table"
                />
              </div>
            ),
            rowExpandable: (record: Subject) => record.chapters && record.chapters.length > 0,
          }}
        />
        {/* Add/Edit Chapter Modal */}
        <AddChapterModal
          visible={addChapterModalVisible}
          onCancel={handleAddChapterCancel}
          onAdd={handleAddChapter}
          subjectId={selectedSubjectId || ''}
          editingChapter={editingChapter}
        />
      </div>

      {/* Add/Edit Subject Modal */}
      <Modal
        title={editingKey ? 'Edit Subject' : 'Add New Subject'}
        open={modalVisible}
        onCancel={handleModalCancel}
        footer={null}
        width={600}
        className="subjects-modal"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="subjects-form"
        >
          {/* Subject Name Field - Required */}
          <Form.Item
            name="subjectName"
            label="Subject Name"
            rules={[
              { required: true, message: 'Please enter subject name' },
              { min: 2, message: 'Subject name must be at least 2 characters' },
              { max: 50, message: 'Subject name cannot exceed 50 characters' }
            ]}
          >
            <Input
              placeholder="Enter subject name"
              maxLength={50}
            />
          </Form.Item>

          {/* Board Selection Field - Required */}
          <Form.Item
            name="board"
            label="Board"
            rules={[{ required: true, message: 'Please select board' }]}
          >
            <Select
              placeholder="Select Board"
              options={BOARD_OPTIONS}
            />
          </Form.Item>

          {/* Standard Selection Field - Required */}
          <Form.Item
            name="standard"
            label="Standard"
            rules={[{ required: true, message: 'Please select standard' }]}
          >
            <Select
              placeholder="Select Standard"
              options={STANDARD_OPTIONS}
              allowClear={false}
            />
          </Form.Item>

          {/* Modal Action Buttons */}
          <Form.Item className="modal-action-buttons" style={{ textAlign: 'right', marginBottom: 0 }}>
            <div className="subjects-modal-footer">
              <Button
                onClick={handleModalCancel}
                className="cancel-button"
                disabled={submitLoading}
              >
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                className="submit-button"
                loading={submitLoading}
              >
                {editingKey ? 'Update Subject' : 'Add Subject'}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SubjectsPage;
