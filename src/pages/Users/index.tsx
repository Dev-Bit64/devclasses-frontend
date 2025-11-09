/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { Table, Button, Tooltip, Avatar, Input, Card, message, Popconfirm, Space } from 'antd';
import { WhatsAppOutlined, EyeOutlined, UserOutlined, SearchOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useDispatch, useSelector } from 'react-redux';
import UserResultsModal from '../../components/UserResultsModal';
import { getUsersAction, deleteUserAction } from '../../redux/action/userAction';
import { RootState, AppDispatch } from '../../redux/store';
import './index.scss';

interface User {
  key: string;
  id?: string;
  name: string;
  email: string;
  testsGiven: number;
  avatar: string;
  standard: string;
  board: string;
}

/**
 * Static options for Standard and Board column filters
 * These are predefined values used in Ant Design table column filters
 */
const standardFilterOptions = [
  { text: '11th', value: '11th' },
  { text: '12th', value: '12th' },
];

const boardFilterOptions = [
  { text: 'CBSE', value: 'CBSE' },
  { text: 'GSEB', value: 'GSEB' },
];

const UsersPage: React.FC = () => {
  // Redux hooks for state management and dispatching actions
  const dispatch = useDispatch<AppDispatch>();
  const { userLists , isLoading } = useSelector((state: RootState) => state.user);

  console.log('User Lists from Redux:', userLists.users);

  // Normalize user list data coming from API/redux.
  // Some API responses return an object (e.g. { data: [...], total }) instead of a raw array.
  // Ant Design's Table expects an array for dataSource. Ensure we always pass an array.
  const normalizedUserList: any[] = Array.isArray(userLists?.users)
    ? userLists?.users : []
  

      console.log('Normalized User List:', normalizedUserList);

  // Local state for search and column filters
  const [searchInput, setSearchInput] = useState('');
  const [standardFilters, setStandardFilters] = useState<string[]>([]);
  const [boardFilters, setBoardFilters] = useState<string[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  // State for UserResultsModal
  const [resultsModalVisible, setResultsModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{ name: string; id: string } | null>(null);

  /**
   * Fetch users with current filters and search parameters
   * Called on component mount and when filters/search change
   * @param searchTerm - Optional search term to override current searchInput
   * @param standard - Optional standard filter value
   * @param board - Optional board filter value
   */
  const fetchUsers = (searchTerm: string = '', standard: string = '', board: string = '') => {
    const payload = {
      page: 1,
      limit: 10,
      search: searchTerm,
      sortField: 'firstName',
      sortOrder: 'asc',
      board: board,
      standard: standard
    };
    dispatch(getUsersAction(payload));
  };

  // Fetch users on component mount with empty search and filters
  useEffect(() => {
    fetchUsers();
  }, [dispatch]);

  /**
   * Handle search button click
   * Validates that search input has at least 3 characters before fetching
   * Shows warning message if validation fails
   */
  const handleSearch = () => {
    const trimmedSearch = searchInput.trim();

    // If search is empty, fetch all users
    if (trimmedSearch.length === 0) {
      fetchUsers('', standardFilters[0] || '', boardFilters[0] || '');
      return;
    }

    // Validate minimum 3 characters
    if (trimmedSearch.length < 3) {
      message.warning('Please enter at least 3 characters to search');
      return;
    }

    // Fetch users with search term and current filters
    fetchUsers(trimmedSearch, standardFilters[0] || '', boardFilters[0] || '');
  };



  /**
   * Handle opening the results modal for a specific user
   * @param user - The user object containing name and key (id)
   */
  const handleViewResults = (user: User) => {
    setSelectedUser({ name: user.name, id: user.key });
    setResultsModalVisible(true);
  };

  /**
   * Handle closing the results modal
   */
  const handleCloseResultsModal = () => {
    setResultsModalVisible(false);
    setSelectedUser(null);
  };

  /**
   * Handle delete single user
   * Dispatches deleteUserAction with user ID and refreshes the user list
   * @param userId - The ID of the user to delete
   */
  const handleDeleteUser = async (userId: string) => {
    try {
      const resultAction = await dispatch(deleteUserAction(userId));

      // Check if deletion was successful
      if (deleteUserAction.fulfilled.match(resultAction)) {
        // Refresh the user list after successful deletion
        const payload = {
          page: 1,
          limit: 10,
          search: '',
          sortField: 'name',
          sortOrder: 'asc',
          board: '',
          standard: ''
        };
        dispatch(getUsersAction(payload));
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  /**
   * Handle delete multiple selected users
   * Dispatches deleteUserAction with array of user IDs and refreshes the user list
   */
  const handleDeleteMultipleUsers = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('Please select at least one user to delete');
      return;
    }

    try {
      const userIds = selectedRowKeys.map(key => String(key));
      const resultAction = await dispatch(deleteUserAction(userIds));

      // Check if deletion was successful
      if (deleteUserAction.fulfilled.match(resultAction)) {
        // Clear selected rows and refresh the user list
        setSelectedRowKeys([]);
        const payload = {
          page: 1,
          limit: 10,
          search: '',
          sortField: 'name',
          sortOrder: 'asc',
          board: '',
          standard: ''
        };
        dispatch(getUsersAction(payload));
      }
    } catch (error) {
      console.error('Error deleting users:', error);
    }
  };

  const columns: ColumnsType<User> = [
    {
      title: 'No.',
      dataIndex: 'key',
      key: 'no',
      align: 'center',
      width: 60,
      render: (_: any, __: User, index: number) => index + 1,
      responsive: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      align: 'left',
      render: (text: string, record: User) => (
        <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Avatar icon={<UserOutlined />} src={record.avatar} />
          {text}
        </span>
      ),
      responsive: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      align: 'left',
      responsive: ['md', 'lg', 'xl'],
    },
    {
      // Standard column with Ant Design column filter
      title: 'Standard',
      dataIndex: 'standard',
      key: 'standard',
      align: 'center',
      width: 120,
      responsive: ['sm', 'md', 'lg', 'xl'],
      // Ant Design column filter configuration
      filters: standardFilterOptions,
      onFilter: (value: any, record: User) => record.standard === value,
      filteredValue: standardFilters,
      // Filter dropdown props with reset and close functionality
      filterDropdownProps: {
        onOpenChange: (open: boolean) => {
          // Close dropdown after filter is applied
          if (!open && standardFilters.length > 0) {
            // Dropdown is closing, filter has been applied
          }
        },
      },
      // Custom filter dropdown render with reset button
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }: any) => (
        <div style={{ padding: 8 }}>
          <div style={{ marginBottom: 8 }}>
            {standardFilterOptions.map((option) => (
              <div key={option.value} style={{ marginBottom: 4 }}>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={selectedKeys.includes(option.value)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedKeys([option.value]);
                      } else {
                        setSelectedKeys([]);
                      }
                    }}
                    style={{ marginRight: 8 }}
                  />
                  {option.text}
                </label>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button
              type="primary"
              size="small"
              onClick={() => {
                confirm();
                // Close the filter dropdown after applying filter
                close();
              }}
              style={{ flex: 1 }}
            >
              OK
            </Button>
            <Button
              size="small"
              onClick={() => {
                if (clearFilters) {
                  clearFilters();
                }
                setStandardFilters([]);
                // Fetch users with cleared filter
                fetchUsers(searchInput.trim(), '', boardFilters[0] || '');
                // Close the filter dropdown after reset
                close();
              }}
              style={{ flex: 1 }}
            >
              Reset
            </Button>
          </div>
        </div>
      ),
    },
    {
      // Board column with Ant Design column filter
      title: 'Board',
      dataIndex: 'board',
      key: 'board',
      align: 'center',
      width: 120,
      responsive: ['sm', 'md', 'lg', 'xl'],
      // Ant Design column filter configuration
      filters: boardFilterOptions,
      onFilter: (value: any, record: User) => record.board === value,
      filteredValue: boardFilters,
      // Filter dropdown props with reset and close functionality
      filterDropdownProps: {
        onOpenChange: (open: boolean) => {
          // Close dropdown after filter is applied
          if (!open && boardFilters.length > 0) {
            // Dropdown is closing, filter has been applied
          }
        },
      },
      // Custom filter dropdown render with reset button
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }: any) => (
        <div style={{ padding: 8 }}>
          <div style={{ marginBottom: 8 }}>
            {boardFilterOptions.map((option) => (
              <div key={option.value} style={{ marginBottom: 4 }}>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={selectedKeys.includes(option.value)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedKeys([option.value]);
                      } else {
                        setSelectedKeys([]);
                      }
                    }}
                    style={{ marginRight: 8 }}
                  />
                  {option.text}
                </label>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button
              type="primary"
              size="small"
              onClick={() => {
                confirm();
                // Close the filter dropdown after applying filter
                close();
              }}
              style={{ flex: 1 }}
            >
              OK
            </Button>
            <Button
              size="small"
              onClick={() => {
                if (clearFilters) {
                  clearFilters();
                }
                setBoardFilters([]);
                // Fetch users with cleared filter
                fetchUsers(searchInput.trim(), standardFilters[0] || '', '');
                // Close the filter dropdown after reset
                close();
              }}
              style={{ flex: 1 }}
            >
              Reset
            </Button>
          </div>
        </div>
      ),
    },
    {
      title: 'Test Given',
      dataIndex: 'testsGiven',
      key: 'testsGiven',
      align: 'center',
      width: 120,
      responsive: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    {
      title: 'Results',
      key: 'results',
      align: 'center',
      width: 140,
      render: (_: any, record: User) => (
        <Button
          type="primary"
          icon={<EyeOutlined />}
          size="small"
          style={{ borderRadius: 6 }}
          onClick={() => handleViewResults(record)}
        >
          View
        </Button>
      ),
      responsive: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    {
      title: 'Action',
      key: 'action',
      align: 'center',
      width: 120,
      render: (_: any, record: User) => (
        <Space size="small">
          {/* WhatsApp Alert Button */}
          <Tooltip title="Send Whatsapp alert">
            <Button
              type="text"
              icon={<WhatsAppOutlined style={{ color: '#25D366', fontSize: 18 }} />}
              onClick={() => alert(`Send Whatsapp alert to ${record.name}`)}
            />
          </Tooltip>
          {/* Delete User Button */}
          <Popconfirm
            title="Delete User"
            description="Are you sure you want to delete this user?"
            onConfirm={() => handleDeleteUser(record.key)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Delete user">
              <Button
                type="text"
                icon={<DeleteOutlined style={{ color: '#ff4d4f', fontSize: 18 }} />}
                danger
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
      responsive: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
  ];

  return (
    <div className="users-page-container animate-fade-in">
      <h1 className="welcome-title" style={{ marginBottom: 24 }}>Users</h1>

      {/* Search Card - Contains search input and button */}
      <Card className="users-filter-card" style={{ marginBottom: 24, borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        <div className="search-section" style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '8px',
          width: '100%',
          flexWrap: 'nowrap'
        }}>
          {/* Search input and error message container */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            flex: 1,
            minWidth: 0
          }}>
            <Input
              allowClear
              placeholder="Search by name or email... (min 3 characters)"
              prefix={<SearchOutlined />}
              className="search-input"
              style={{
                borderColor: searchInput.length > 0 && searchInput.length < 3 ? '#ff4d4f' : undefined
              }}
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              onPressEnter={handleSearch}
              status={searchInput.length > 0 && searchInput.length < 3 ? 'error' : undefined}
            />
            {/* Error message for search validation */}
            {searchInput.length > 0 && searchInput.length < 3 && (
              <div style={{
                color: '#ff4d4f',
                fontSize: '11px',
                marginLeft: '4px'
              }}>
                Please enter at least 3 characters to search
              </div>
            )}
          </div>
          {/* Search button - fixed width, no shrink */}
          <Button
            type="primary"
            icon={<SearchOutlined />}
            onClick={handleSearch}
            className="search-button"
            style={{
              flexShrink: 0,
              height: '32px',
              minWidth: '85px',
              marginTop: '0px'
            }}
            disabled={searchInput.length > 0 && searchInput.length < 3}
          >
            Search
          </Button>
        </div>
      </Card>
      {/* Bulk Delete Button - shown when users are selected */}
      {selectedRowKeys.length > 0 && (
        <div style={{ marginBottom: 16, display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
          <span style={{ fontWeight: 500 }}>
            {selectedRowKeys.length} user(s) selected
          </span>
          <Popconfirm
            title="Delete Selected Users"
            description={`Are you sure you want to delete ${selectedRowKeys.length} user(s)? This action cannot be undone.`}
            onConfirm={handleDeleteMultipleUsers}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="primary"
              danger
              icon={<DeleteOutlined />}
            >
              Delete Selected
            </Button>
          </Popconfirm>
        </div>
      )}

      {/* Users Table with Checkbox Selection and Column Filters - Responsive table with internal scroll */}
      <div className="users-table-wrapper">
        <Table
          columns={columns}
          dataSource={normalizedUserList}
          loading={isLoading}
          pagination={{ pageSize: 8 }}
          bordered
          rowKey="key"
          scroll={{ x: 600 }}
          // Handle column filter changes from Ant Design table
          onChange={(_, filters) => {
            // Extract standard and board filter values from Ant Design filters object
            const standardFilterValues = (filters.standard as string[]) || [];
            const boardFilterValues = (filters.board as string[]) || [];

            // Update filter states
            setStandardFilters(standardFilterValues);
            setBoardFilters(boardFilterValues);

            // Fetch users with updated filters and current search term
            fetchUsers(searchInput.trim(), standardFilterValues[0] || '', boardFilterValues[0] || '');
          }}
          // Checkbox selection configuration - maintains table responsiveness
          rowSelection={{
            selectedRowKeys,
            onChange: (keys) => setSelectedRowKeys(keys),
            type: 'checkbox',
          }}
        />
      </div>

      {/* User Results Modal */}
      {selectedUser && (
        <UserResultsModal
          visible={resultsModalVisible}
          onClose={handleCloseResultsModal}
          userName={selectedUser.name}
          userId={selectedUser.id}
        />
      )}
    </div>
  );
};

export default UsersPage;