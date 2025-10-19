import React, { useState, useCallback, useEffect } from 'react';
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

const { Title } = Typography;

// Board options for filtering
const BOARD_OPTIONS = [
  { label: 'GSEB', value: 'GSEB' },
  { label: 'CBSE', value: 'CBSE' },
];

// Interface for Chapter data
interface Chapter {
  key: string;
  id: number;
  no: number;
  chapterName: string;
}

// Update Subject interface to include chapters
interface Subject {
  key: string;
  id: number;
  no: number;
  subjectName: string;
  board: string;
  chapters: Chapter[];
}

/**
 * Subjects Page Component
 * Displays a table of subjects with search, filter, and CRUD operations
 * Matches the design theme of Questions page
 */
const SubjectsPage: React.FC = () => {
  // State management for subjects data and UI
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>('');
  const [filterBoard, setFilterBoard] = useState<string | undefined>(undefined);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [form] = Form.useForm();

  // Pagination state
  const [page, setPage] = useState<number>(1);
  const DEFAULT_PAGE_SIZE = 10;

  // Add state for Add Chapter modal
  const [addChapterModalVisible, setAddChapterModalVisible] = useState(false);
  const [selectedSubjectKey, setSelectedSubjectKey] = useState<string | null>(null);
  const [addChapterLoading, setAddChapterLoading] = useState(false);

  // Mock data for demonstration
  const mockSubjects: Subject[] = [
    {
      key: '1', id: 1, no: 1, subjectName: 'Mathematics', board: 'GSEB',
      chapters: [
        { key: '1-1', id: 1, no: 1, chapterName: 'Algebra' },
        { key: '1-2', id: 2, no: 2, chapterName: 'Geometry' },
      ]
    },
    {
      key: '2', id: 2, no: 2, subjectName: 'Science', board: 'GSEB',
      chapters: [
        { key: '2-1', id: 1, no: 1, chapterName: 'Physics' },
        { key: '2-2', id: 2, no: 2, chapterName: 'Chemistry' },
      ]
    },
    {
      key: '3', id: 3, no: 3, subjectName: 'English', board: 'CBSE',
      chapters: [
        { key: '3-1', id: 1, no: 1, chapterName: 'Grammar' },
        { key: '3-2', id: 2, no: 2, chapterName: 'Literature' },
      ]
    },
    {
      key: '4', id: 4, no: 4, subjectName: 'Hindi', board: 'CBSE',
      chapters: [
        { key: '4-1', id: 1, no: 1, chapterName: 'Kavita' },
        { key: '4-2', id: 2, no: 2, chapterName: 'Gadya' },
      ]
    },
    {
      key: '5', id: 5, no: 5, subjectName: 'Social Science', board: 'GSEB',
      chapters: [
        { key: '5-1', id: 1, no: 1, chapterName: 'History' },
        { key: '5-2', id: 2, no: 2, chapterName: 'Geography' },
      ]
    },
    {
      key: '6', id: 6, no: 6, subjectName: 'Computer Science', board: 'CBSE',
      chapters: [
        { key: '6-1', id: 1, no: 1, chapterName: 'Programming' },
        { key: '6-2', id: 2, no: 2, chapterName: 'Networking' },
      ]
    },
  ];

  /**
   * Fetch subjects data with filters and search
   * In real implementation, this would call an API
   */
  const fetchSubjects = useCallback(() => {
    setLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      let filteredData = [...mockSubjects];
      
      // Apply search filter
      if (searchText.trim()) {
        filteredData = filteredData.filter(subject =>
          subject.subjectName.toLowerCase().includes(searchText.toLowerCase())
        );
      }
      
      // Apply board filter
      if (filterBoard) {
        filteredData = filteredData.filter(subject => subject.board === filterBoard);
      }
      
      setSubjects(filteredData);
      setLoading(false);
    }, 500);
  }, [searchText, filterBoard]);

  // Fetch data on component mount and when dependencies change
  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  /**
   * Handle search functionality with minimum 3 characters validation
   */
  const handleSearch = () => {
    if (searchText.trim().length >= 3) {
      setPage(1);
      fetchSubjects();
    } else if (searchText.trim().length === 0) {
      setPage(1);
      fetchSubjects();
    } else {
      message.warning('Search text must be at least 3 characters long');
    }
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
   */
  const showModal = () => {
    setEditingKey(null);
    form.resetFields();
    setModalVisible(true);
  };

  /**
   * Handle edit subject
   */
  const handleEdit = (record: Subject) => {
    setEditingKey(record.key);
    form.setFieldsValue({
      subjectName: record.subjectName,
      board: record.board,
    });
    setModalVisible(true);
  };

  /**
   * Handle delete subject
   */
  const handleDelete = (key: string) => {
    const updatedSubjects = subjects.filter(subject => subject.key !== key);
    setSubjects(updatedSubjects);
    message.success('Subject deleted successfully');
  };

  /**
   * Handle modal cancel
   */
  const handleModalCancel = () => {
    setModalVisible(false);
    setEditingKey(null);
    form.resetFields();
  };

  /**
   * Handle form submission for add/edit subject
   */
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingKey) {
        // Update existing subject
        const updatedSubjects = subjects.map(subject => 
          subject.key === editingKey 
            ? { ...subject, ...values }
            : subject
        );
        setSubjects(updatedSubjects);
        message.success('Subject updated successfully');
      } else {
        // Add new subject
        const newSubject: Subject = {
          key: Date.now().toString(),
          id: subjects.length + 1,
          no: subjects.length + 1,
          subjectName: values.subjectName,
          board: values.board,
          chapters: [],
        };
        setSubjects([...subjects, newSubject]);
        message.success('Subject added successfully');
      }
      
      handleModalCancel();
    } catch (error) {
      console.error('Form validation failed:', error);
    }
  };

  /**
   * Add Chapter button handler
   */
  const handleAddChapterClick = (subjectKey: string) => {
    setSelectedSubjectKey(subjectKey);
    setAddChapterModalVisible(true);
  };

  const handleAddChapter = (chapterName: string) => {
    if (!selectedSubjectKey) return;
    setAddChapterLoading(true);
    setTimeout(() => {
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
      setAddChapterLoading(false);
      setAddChapterModalVisible(false);
      setSelectedSubjectKey(null);
      message.success('Chapter added successfully');
    }, 400);
  };

  const handleAddChapterCancel = () => {
    setAddChapterModalVisible(false);
    setSelectedSubjectKey(null);
  };

  // Table columns configuration
  const columns = [
    {
      title: 'No.',
      dataIndex: 'no',
      key: 'no',
      width: 80,
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
      width: 120,
      filters: BOARD_OPTIONS.map(option => ({ text: option.label, value: option.value })),
      onFilter: (value: any, record: Subject) => record.board === value,
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

  // Chapter table columns
  const chapterColumns = [
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
          <Button
            type="text"
            icon={<EditOutlined />}
            className="action-button edit-button"
            title="Edit Chapter"
            // onClick={() => handleEditChapter(record)}
            disabled
          />
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
          loading={loading}
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
                  columns={chapterColumns}
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
        <AddChapterModal
          visible={addChapterModalVisible}
          onCancel={handleAddChapterCancel}
          onAdd={handleAddChapter}
          loading={addChapterLoading}
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

          {/* Modal Action Buttons */}
          <Form.Item className="modal-action-buttons" style={{ textAlign: 'right', marginBottom: 0 }}>
            <div className="subjects-modal-footer">
              <Button
                onClick={handleModalCancel}
                className="cancel-button"
              >
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                className="submit-button"
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
