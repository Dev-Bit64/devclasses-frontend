import React, { useState } from 'react';
import { Table, Button, Tooltip, Avatar, Input, Select, Row, Col, Card } from 'antd';
import { WhatsAppOutlined, EyeOutlined, UserOutlined, SearchOutlined, FilterOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import UserResultsModal from '../../components/UserResultsModal';
import './index.scss';

interface User {
  key: number;
  name: string;
  email: string;
  testsGiven: number;
  avatar: string;
  standard: string;
  board: string;
}

const mockUsers: User[] = [
  { key: 1, name: 'John Doe', email: 'john.doe@example.com', testsGiven: 5, avatar: '', standard: '10th', board: 'CBSE' },
  { key: 2, name: 'Jane Smith', email: 'jane.smith@example.com', testsGiven: 8, avatar: '', standard: '12th', board: 'ICSE' },
  { key: 3, name: 'Alice Johnson', email: 'alice.johnson@example.com', testsGiven: 3, avatar: '', standard: '9th', board: 'State' },
  { key: 4, name: 'Bob Brown', email: 'bob.brown@example.com', testsGiven: 10, avatar: '', standard: '11th', board: 'CBSE' },
  { key: 5, name: 'Charlie Lee', email: 'charlie.lee@example.com', testsGiven: 2, avatar: '', standard: '10th', board: 'ICSE' },
  { key: 6, name: 'Emily White', email: 'emily.white@example.com', testsGiven: 7, avatar: '', standard: '12th', board: 'State' },
];

const standardOptions = [
  { label: 'All', value: '' },
  ...Array.from(new Set(mockUsers.map(u => u.standard))).map(s => ({ label: s, value: s }))
];
const boardOptions = [
  { label: 'All', value: '' },
  ...Array.from(new Set(mockUsers.map(u => u.board))).map(b => ({ label: b, value: b }))
];

const UsersPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [standardFilter, setStandardFilter] = useState('');
  const [boardFilter, setBoardFilter] = useState('');
  
  // State for UserResultsModal
  const [resultsModalVisible, setResultsModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{ name: string; id: number } | null>(null);

  const filteredUsers = mockUsers.filter(user => {
    const matchesSearch =
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase());
    const matchesStandard = standardFilter ? user.standard === standardFilter : true;
    const matchesBoard = boardFilter ? user.board === boardFilter : true;
    return matchesSearch && matchesStandard && matchesBoard;
  });

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
      title: 'Standard',
      dataIndex: 'standard',
      key: 'standard',
      align: 'center',
      width: 100,
      responsive: ['sm', 'md', 'lg', 'xl'],
    },
    {
      title: 'Board',
      dataIndex: 'board',
      key: 'board',
      align: 'center',
      width: 100,
      responsive: ['sm', 'md', 'lg', 'xl'],
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
      width: 80,
      render: (_: any, record: User) => (
        <Tooltip title="Send Whatsapp alert">
          <Button
            type="text"
            icon={<WhatsAppOutlined style={{ color: '#25D366', fontSize: 22 }} />}
            onClick={() => alert(`Send Whatsapp alert to ${record.name}`)}
          />
        </Tooltip>
      ),
      responsive: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
  ];

  return (
    <div className="users-page-container animate-fade-in">
      <h1 className="welcome-title" style={{ marginBottom: 24 }}>Users</h1>
      <Card className="users-filter-card" style={{ marginBottom: 24, borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        <Row gutter={[16, 16]} align="middle" justify="start">
          {/* Search Section - Updated to match Subjects page design */}
          <Col xs={24} md={12} style={{ marginBottom: 8 }}>
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
                  placeholder="Search by name or email... (min 3 characters)"
                  prefix={<SearchOutlined />}
                  style={{ 
                    minWidth: 300, 
                    maxWidth: 400,
                    borderColor: search.length > 0 && search.length < 3 ? '#ff4d4f' : undefined
                  }}
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  onPressEnter={() => {
                    if (search.trim().length >= 3) {
                      // Trigger search functionality
                    } else if (search.trim().length === 0) {
                      // Clear search
                    } else {
                      // Show warning for minimum characters
                    }
                  }}
                  status={search.length > 0 && search.length < 3 ? 'error' : undefined}
                />
                <Button
                  type="primary"
                  icon={<SearchOutlined />}
                  onClick={() => {
                    if (search.trim().length >= 3) {
                      // Trigger search functionality
                    } else if (search.trim().length === 0) {
                      // Clear search
                    } else {
                      // Show warning for minimum characters
                    }
                  }}
                  className="search-button"
                  style={{ flexShrink: 0, marginLeft: '4px', height: '36px' }}
                  disabled={search.length > 0 && search.length < 3}
                >
                  Search
                </Button>
              </div>
              {search.length > 0 && search.length < 3 && (
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
          </Col>
          <Col xs={24} sm={12} md={6} style={{ marginBottom: 8 }}>
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 8, width: '100%' }}>
              <label style={{ fontWeight: 500, marginBottom: 0, whiteSpace: 'nowrap' }}>Standard</label>
              <Select
                allowClear
                placeholder="Select Standard"
                value={standardFilter}
                onChange={setStandardFilter}
                size="large"
                style={{ width: '100%', borderRadius: 8, flex: 1 }}
                options={standardOptions}
              />
            </div>
          </Col>
          <Col xs={24} sm={12} md={6} style={{ marginBottom: 8 }}>
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 8, width: '100%' }}>
              <label style={{ fontWeight: 500, marginBottom: 0, whiteSpace: 'nowrap' }}>Board</label>
              <Select
                allowClear
                placeholder="Select Board"
                value={boardFilter}
                onChange={setBoardFilter}
                size="large"
                style={{ width: '100%', borderRadius: 8, flex: 1 }}
                options={boardOptions}
              />
            </div>
          </Col>
        </Row>
      </Card>
      <div className="users-table-wrapper" style={{ overflowX: 'auto', maxWidth: '100%', minWidth: 0 }}>
        <Table
          columns={columns}
          dataSource={filteredUsers}
          pagination={{ pageSize: 8 }}
          bordered
          rowKey="key"
          scroll={{ x: 600 }}
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