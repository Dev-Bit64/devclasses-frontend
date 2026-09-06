/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback } from 'react';
import { Eye, MessageCircle, Search, Trash2 } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import UserResultsModal from '../../components/UserResultsModal';
import SendWhatsAppMessage from '../../components/SendWhatsAppMessage';
import { getUsersAction, deleteUserAction } from '../../redux/action/userAction';
import { RootState, AppDispatch } from '../../redux/store';
import { PageShell } from '../../components/common/PageShell';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable, type DataTableColumn } from '../../components/common/DataTable';
import { ColumnFilter } from '../../components/common/ColumnFilter';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../components/ui/tooltip';
import { toastText } from '../../utils/toast';

interface User {
  key: string;
  id: string;
  name: string;
  email: string;
  testsGiven: number;
  avatar: string;
  standard: string;
  board: string;
  firstName?: string;
  lastName?: string;
}

/**
 * Static options for Standard and Board column filters
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
  const { userLists = [], isLoading, totalUsers = 0 } = useSelector((state: RootState) => state.user);

  // Transform API response data to match table structure
  const normalizedUserList: User[] = Array.isArray(userLists)
    ? userLists.map((user: any) => ({
      key: user.id,
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      testsGiven: user.totalTestsGiven || 0, // Default to 0 if not provided
      avatar: user.avatar || '', // Default to empty string if not provided
      standard: user.standard,
      board: user.board,
      firstName: user.firstName,
      lastName: user.lastName,
    }))
    : [];

  // Local state for search and column filters
  const [searchInput, setSearchInput] = useState('');
  const [appliedSearch, setAppliedSearch] = useState(''); // Track the currently applied search
  const [standardFilters, setStandardFilters] = useState<string[]>([]);
  const [boardFilters, setBoardFilters] = useState<string[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  // Pagination state
  const [page, setPage] = useState<number>(1);
  const DEFAULT_PAGE_SIZE = 10;

  // State for UserResultsModal
  const [resultsModalVisible, setResultsModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{ name: string; id: string } | null>(null);

  // State for SendWhatsAppMessage modal
  const [whatsappModalVisible, setWhatsappModalVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<{ name: string; phoneNumber: string } | null>(null);

  /**
   * Fetch users with current filters and search parameters
   * Called on component mount and when filters/search/pagination change
   */
  const fetchUsers = useCallback((searchTerm: string = '', standard: string = '', board: string = '', pageNum?: number) => {
    const payload = {
      page: pageNum || page,
      limit: DEFAULT_PAGE_SIZE,
      search: searchTerm,
      sortField: 'firstName',
      sortOrder: 'asc',
      board: board,
      standard: standard
    };
    dispatch(getUsersAction(payload));
  }, [dispatch, page, DEFAULT_PAGE_SIZE]);

  // Fetch users on component mount with empty search and filters
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  /**
   * Handle search button click
   * Validates that search input has at least 3 characters before fetching
   * Resets pagination to page 1 when searching
   */
  const handleSearch = () => {
    const trimmedSearch = searchInput.trim();

    // If search is empty, fetch all users
    if (trimmedSearch.length === 0) {
      setPage(1);
      setAppliedSearch('');
      fetchUsers('', standardFilters[0] || '', boardFilters[0] || '', 1);
      return;
    }

    // Validate minimum 3 characters
    if (trimmedSearch.length < 3) {
      toastText('Please enter at least 3 characters to search', 'error');
      return;
    }

    // Fetch users with search term and current filters, reset to page 1
    setPage(1);
    setAppliedSearch(trimmedSearch);
    fetchUsers(trimmedSearch, standardFilters[0] || '', boardFilters[0] || '', 1);
  };

  /**
   * Handle clearing the search
   */
  const handleClearSearch = () => {
    setSearchInput('');
    setAppliedSearch('');
    setPage(1);
    // Only fetch if there was a search applied
    if (appliedSearch) {
      fetchUsers('', standardFilters[0] || '', boardFilters[0] || '', 1);
    }
  };

  /**
   * Handle opening the results modal for a specific user
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
   * Handle opening the WhatsApp modal for a specific user
   */
  const handleOpenWhatsAppModal = (user: User) => {
    setSelectedStudent({ name: user.name, phoneNumber: '' });
    setWhatsappModalVisible(true);
  };

  /**
   * Handle closing the WhatsApp modal
   */
  const handleCloseWhatsAppModal = () => {
    setWhatsappModalVisible(false);
    setSelectedStudent(null);
  };

  /**
   * Handle delete single user
   * Dispatches deleteUserAction with user ID and refreshes the user list
   */
  const handleDeleteUser = async (userId: string) => {
    try {
      const resultAction = await dispatch(deleteUserAction(userId));

      // Check if deletion was successful
      if (deleteUserAction.fulfilled.match(resultAction)) {
        // Refresh the user list after successful deletion with current filters
        setPage(1);
        fetchUsers(searchInput.trim(), standardFilters[0] || '', boardFilters[0] || '', 1);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  /**
   * Handle delete multiple selected users
   */
  const handleDeleteMultipleUsers = async () => {
    if (selectedRowKeys.length === 0) {
      toastText('Please select at least one user to delete', 'error');
      return;
    }

    try {
      const userIds = selectedRowKeys.map(key => String(key));
      const resultAction = await dispatch(deleteUserAction(userIds));

      // Check if deletion was successful
      if (deleteUserAction.fulfilled.match(resultAction)) {
        // Clear selected rows and refresh the user list with current filters
        setSelectedRowKeys([]);
        setPage(1);
        fetchUsers(searchInput.trim(), standardFilters[0] || '', boardFilters[0] || '', 1);
      }
    } catch (error) {
      console.error('Error deleting users:', error);
    }
  };

  // Applying a column filter resets to page 1 and refetches, as it did before.
  const applyStandardFilter = (values: string[]) => {
    setStandardFilters(values);
    setPage(1);
    fetchUsers(searchInput.trim(), values[0] || '', boardFilters[0] || '', 1);
  };

  const applyBoardFilter = (values: string[]) => {
    setBoardFilters(values);
    setPage(1);
    fetchUsers(searchInput.trim(), standardFilters[0] || '', values[0] || '', 1);
  };

  // Row actions, shared by the desktop table and the mobile card list.
  const renderRowActions = (record: User) => (
    <TooltipProvider delayDuration={150}>
      <div className="flex items-center justify-center gap-1">
        {/* WhatsApp Alert Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Send WhatsApp alert to ${record.name}`}
              onClick={() => handleOpenWhatsAppModal(record)}
            >
              <MessageCircle aria-hidden="true" className="text-success" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Send Whatsapp alert</TooltipContent>
        </Tooltip>

        {/* Delete User Button */}
        <ConfirmDialog
          variant="destructive"
          title="Delete User"
          description="Are you sure you want to delete this user?"
          confirmLabel="Yes"
          cancelLabel="No"
          onConfirm={() => handleDeleteUser(record.key)}
          trigger={
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Delete ${record.name}`}
            >
              <Trash2 aria-hidden="true" className="text-destructive" />
            </Button>
          }
        />
      </div>
    </TooltipProvider>
  );

  const columns: DataTableColumn<User>[] = [
    {
      title: 'No.',
      key: 'no',
      align: 'center',
      width: 64,
      // Numbering continues across pages, matching the server-side pagination.
      render: (_: any, __: User, index: number) => (page - 1) * DEFAULT_PAGE_SIZE + index + 1,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      align: 'left',
      render: (text: string) => <span className="font-medium">{text}</span>,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      align: 'left',
      hideBelow: 'lg',
      render: (text: string) => <span className="text-muted-foreground">{text}</span>,
    },
    {
      title: 'Standard',
      dataIndex: 'standard',
      key: 'standard',
      align: 'center',
      width: 130,
      hideBelow: 'lg',
      filter: (
        <ColumnFilter
          label="Standard"
          options={standardFilterOptions}
          value={standardFilters}
          onApply={applyStandardFilter}
          onReset={() => applyStandardFilter([])}
        />
      ),
    },
    {
      title: 'Board',
      dataIndex: 'board',
      key: 'board',
      align: 'center',
      width: 120,
      hideBelow: 'lg',
      filter: (
        <ColumnFilter
          label="Board"
          options={boardFilterOptions}
          value={boardFilters}
          onApply={applyBoardFilter}
          onReset={() => applyBoardFilter([])}
        />
      ),
    },
    {
      title: 'Test Given',
      dataIndex: 'testsGiven',
      key: 'testsGiven',
      align: 'center',
      width: 120,
      render: (text: number) => <span className="dc-numeric">{text}</span>,
    },
    {
      title: 'Results',
      key: 'results',
      align: 'center',
      width: 130,
      // Students with no attempts have nothing to show, so the button is omitted entirely.
      render: (_: any, record: User) =>
        record.testsGiven > 0 ? (
          <Button size="sm" variant="secondary" onClick={() => handleViewResults(record)}>
            <Eye aria-hidden="true" />
            View
          </Button>
        ) : (
          <span className="dc-caption">No results</span>
        ),
    },
    {
      title: 'Action',
      key: 'action',
      align: 'center',
      width: 120,
      render: (_: any, record: User) => renderRowActions(record),
    },
  ];

  return (
    <PageShell>
      <PageHeader title="Users" description="Every student registered on Dev Classes." />

      {/* Search Card - Contains search input and buttons */}
      <Card className="p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <div className="relative">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                aria-label="Search users by name or email"
                placeholder="Search by name or email... (min 3 characters)"
                className="pl-10"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleSearch();
                }}
                invalid={searchInput.length > 0 && searchInput.length < 3}
              />
            </div>
            {/* Error message for search validation */}
            {searchInput.length > 0 && searchInput.length < 3 && (
              <p role="alert" className="text-xs font-medium text-destructive">
                Please enter at least 3 characters to search
              </p>
            )}
          </div>

          {/* Search and Clear buttons container */}
          <div className="flex shrink-0 items-center gap-2">
            <Button
              onClick={handleSearch}
              disabled={searchInput.length > 0 && searchInput.length < 3}
            >
              <Search aria-hidden="true" />
              Search
            </Button>

            {/* Clear button - only shown when search is applied */}
            {appliedSearch && (
              <Button variant="secondary" onClick={handleClearSearch}>
                Clear
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Bulk Delete Button - shown when users are selected */}
      {selectedRowKeys.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-accent px-4 py-3">
          <span className="text-sm font-medium text-foreground">
            {selectedRowKeys.length} user(s) selected
          </span>
          <ConfirmDialog
            variant="destructive"
            title="Delete Selected Users"
            description={`Are you sure you want to delete ${selectedRowKeys.length} user(s)? This action cannot be undone.`}
            confirmLabel="Yes"
            cancelLabel="No"
            onConfirm={handleDeleteMultipleUsers}
            trigger={
              <Button variant="destructive" size="sm" className="ml-auto">
                <Trash2 aria-hidden="true" />
                Delete Selected
              </Button>
            }
          />
        </div>
      )}

      {/* Users Table with Checkbox Selection and Column Filters */}
      <DataTable<User>
        columns={columns}
        dataSource={normalizedUserList}
        rowKey="key"
        loading={isLoading}
        skeletonRows={5}
        emptyTitle="No users found"
        emptyDescription="Try a different search term or clear the filters."
        rowSelection={{
          selectedRowKeys,
          onChange: (keys) => setSelectedRowKeys(keys),
        }}
        pagination={{
          current: page,
          pageSize: DEFAULT_PAGE_SIZE,
          total: totalUsers,
          onChange: (newPage) => {
            setPage(newPage);
            fetchUsers(searchInput.trim(), standardFilters[0] || '', boardFilters[0] || '', newPage);
          },
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} users`,
        }}
        // Below `md` each user becomes a card, keeping every action reachable on a phone.
        renderMobileCard={(record) => (
          <Card className="flex flex-col gap-3 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 flex-col">
                <span className="truncate font-semibold text-foreground">{record.name}</span>
                <span className="truncate text-xs text-muted-foreground">{record.email}</span>
              </div>
              {renderRowActions(record)}
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <span className="dc-caption">{record.standard}</span>
              <span className="dc-caption">{record.board}</span>
              <span className="dc-caption dc-numeric">{record.testsGiven} tests</span>
            </div>
            {record.testsGiven > 0 && (
              <Button size="sm" variant="secondary" onClick={() => handleViewResults(record)}>
                <Eye aria-hidden="true" />
                View results
              </Button>
            )}
          </Card>
        )}
      />

      {/* User Results Modal */}
      {selectedUser && (
        <UserResultsModal
          visible={resultsModalVisible}
          onClose={handleCloseResultsModal}
          userName={selectedUser.name}
          userId={selectedUser.id}
        />
      )}

      {/* Send WhatsApp Message Modal */}
      {selectedStudent && (
        <SendWhatsAppMessage
          visible={whatsappModalVisible}
          onClose={handleCloseWhatsAppModal}
          studentName={selectedStudent.name}
          phoneNumber={selectedStudent.phoneNumber}
        />
      )}
    </PageShell>
  );
};

export default UsersPage;
