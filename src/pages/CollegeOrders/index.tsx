/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback } from 'react';
import { Search } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { getCollegeOrdersAction } from '../../redux/action/collegePaymentAction';
import { RootState, AppDispatch } from '../../redux/store';
import { PageShell } from '../../components/common/PageShell';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable, type DataTableColumn } from '../../components/common/DataTable';
import { ColumnFilter } from '../../components/common/ColumnFilter';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { formatDate } from '../../utils/common';
import { toastText } from '../../utils/toast';

const DEFAULT_PAGE_SIZE = 20;

// The API's four enum values, shown to admins as plain words — no enum name reaches the screen.
const STATUS_LABELS: Record<string, string> = {
  CREATED: 'Awaiting payment',
  PAID: 'Paid',
  FAILED: 'Failed',
  REFUNDED: 'Refunded',
};

const STATUS_FILTER_OPTIONS = Object.entries(STATUS_LABELS).map(([value, text]) => ({
  text,
  value,
}));

// Badge styling per status. The label always carries the meaning, so colour is never the
// only signal — this stays readable for colour-blind admins and in monochrome print.
const STATUS_BADGE_VARIANT: Record<string, 'default' | 'outline' | 'solid' | 'success'> = {
  CREATED: 'outline',
  PAID: 'success',
  FAILED: 'default',
  REFUNDED: 'default',
};

/**
 * Money crosses the wire as integer paise. Split it with integer arithmetic only — a
 * `/ 100` into a float would round real rupee amounts wrong.
 */
const formatMoney = (amountInPaise: number, currency?: string): string => {
  if (typeof amountInPaise !== 'number' || Number.isNaN(amountInPaise)) return '—';
  const negative = amountInPaise < 0;
  const abs = Math.abs(Math.trunc(amountInPaise));
  const paise = abs % 100;
  const rupees = (abs - paise) / 100;
  const grouped = new Intl.NumberFormat('en-IN').format(rupees);
  const prefix = !currency || currency === 'INR' ? '₹' : `${currency} `;
  return `${negative ? '-' : ''}${prefix}${grouped}.${String(paise).padStart(2, '0')}`;
};

const readBuyerName = (record: any): string => {
  const name = `${record?.user?.firstName ?? ''} ${record?.user?.lastName ?? ''}`.trim();
  return name || '—';
};

const CollegeOrdersPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const { collegeOrderLists, collegeOrderTotalRecords, isLoading } = useSelector(
    (state: RootState) => state.collegePayment
  );

  const orders = Array.isArray(collegeOrderLists) ? collegeOrderLists : [];
  const total = collegeOrderTotalRecords || 0;

  // Search and pagination state
  const [searchText, setSearchText] = useState<string>(''); // Input field value
  const [appliedSearch, setAppliedSearch] = useState<string>(''); // Term actually sent to the API
  const [filterStatus, setFilterStatus] = useState<string | undefined>(undefined);
  const [page, setPage] = useState<number>(1);

  const fetchOrders = useCallback(() => {
    dispatch(
      getCollegeOrdersAction({
        page,
        limit: DEFAULT_PAGE_SIZE,
        status: filterStatus,
        search: appliedSearch || undefined,
      })
    );
  }, [dispatch, page, filterStatus, appliedSearch]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  /**
   * Handle search button click
   * - Validates that search text is at least 3 characters
   */
  const handleSearch = () => {
    const trimmedSearch = searchText.trim();

    if (trimmedSearch.length > 0 && trimmedSearch.length < 3) {
      toastText('Search text must be at least 3 characters long', 'error');
      return;
    }

    setAppliedSearch(trimmedSearch);
    setPage(1);
  };

  /**
   * Handle search input change
   * - If input is cleared and search was previously applied, reset the search
   */
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchText(value);

    if (value.trim() === '' && appliedSearch !== '') {
      setAppliedSearch('');
      setPage(1);
    }
  };

  const applyStatusFilter = (values: string[]) => {
    setFilterStatus(values[0] || undefined);
    setPage(1);
  };

  const renderStatus = (_: any, record: any) => {
    const status = record?.status ?? '';
    return (
      <Badge variant={STATUS_BADGE_VARIANT[status] ?? 'outline'} size="sm">
        {STATUS_LABELS[status] ?? status}
      </Badge>
    );
  };

  const columns: DataTableColumn<any>[] = [
    {
      title: 'Student',
      dataIndex: 'user',
      key: 'user',
      width: 200,
      render: (_: any, record: any) => (
        <div className="flex flex-col">
          <span className="break-words font-medium text-foreground">{readBuyerName(record)}</span>
          <span className="break-all text-xs text-muted-foreground">
            {record?.user?.email ?? ''}
          </span>
        </div>
      ),
    },
    {
      title: 'Chapter',
      dataIndex: 'chapter',
      key: 'chapter',
      width: 220,
      hideBelow: 'lg',
      render: (_: any, record: any) => (
        <div className="flex flex-col">
          <span className="break-words">{record?.chapter?.name ?? '—'}</span>
          <span className="break-words text-xs text-muted-foreground">
            {record?.chapter?.subject?.name ?? ''}
          </span>
        </div>
      ),
    },
    {
      title: 'Amount',
      dataIndex: 'amountInPaise',
      key: 'amountInPaise',
      width: 130,
      align: 'right',
      render: (_: any, record: any) => (
        <span className="tabular-nums">{formatMoney(record?.amountInPaise, record?.currency)}</span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 160,
      render: renderStatus,
      filter: (
        <ColumnFilter
          label="Status"
          options={STATUS_FILTER_OPTIONS}
          value={filterStatus ? [filterStatus] : []}
          onApply={applyStatusFilter}
          onReset={() => applyStatusFilter([])}
        />
      ),
    },
    {
      title: 'Order reference',
      dataIndex: 'providerOrderId',
      key: 'providerOrderId',
      width: 200,
      hideBelow: 'xl',
      render: (text: string) => (
        <span title={text} className="break-all text-xs text-muted-foreground">
          {text}
        </span>
      ),
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 130,
      hideBelow: 'md',
      render: (text: string) => (text ? formatDate(text) : '—'),
    },
    {
      title: 'Paid',
      dataIndex: 'paidAt',
      key: 'paidAt',
      width: 130,
      hideBelow: 'md',
      render: (text: string) => (text ? formatDate(text) : '—'),
    },
  ];

  return (
    <PageShell>
      <PageHeader
        title="College Orders"
        description="Every college chapter purchase, newest first. This ledger is read-only."
      />

      {/* Search Bar */}
      <Card className="p-4 sm:p-5">
        <div className="flex w-full flex-col gap-1.5 lg:max-w-md">
          <div className="flex items-start gap-2">
            <div className="relative min-w-0 flex-1">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                aria-label="Search orders"
                placeholder="Search student or chapter... (min 3 characters)"
                className="pl-10"
                value={searchText}
                onChange={handleSearchInputChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSearch();
                }}
                invalid={searchText.length > 0 && searchText.length < 3}
              />
            </div>
            <Button
              onClick={handleSearch}
              disabled={searchText.length > 0 && searchText.length < 3}
            >
              <Search aria-hidden="true" />
              <span className="hidden sm:inline">Search</span>
            </Button>
          </div>
          {searchText.length > 0 && searchText.length < 3 && (
            <p role="alert" className="text-xs font-medium text-destructive">
              Please enter at least 3 characters to search
            </p>
          )}
        </div>
      </Card>

      <DataTable<any>
        columns={columns}
        dataSource={orders}
        rowKey="id"
        loading={isLoading}
        skeletonRows={5}
        emptyTitle="No orders yet"
        emptyDescription="Purchases will appear here as soon as students start buying chapters."
        pagination={{
          current: page,
          pageSize: DEFAULT_PAGE_SIZE,
          total,
          onChange: (p) => setPage(p),
          showTotal: (t, range) => `${range[0]}-${range[1]} of ${t} orders`,
        }}
        // Below `md` each order becomes a card; seven columns will not fit a phone.
        renderMobileCard={(record: any) => (
          <Card className="flex flex-col gap-3 p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex min-w-0 flex-col">
                <span className="break-words text-sm font-medium text-foreground">
                  {readBuyerName(record)}
                </span>
                <span className="break-all text-xs text-muted-foreground">
                  {record?.user?.email ?? ''}
                </span>
              </div>
              {renderStatus(null, record)}
            </div>
            <div className="flex flex-col gap-1">
              <span className="dc-label">Chapter</span>
              <span className="break-words text-sm text-foreground">
                {record?.chapter?.name ?? '—'}
              </span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-semibold tabular-nums text-foreground">
                {formatMoney(record?.amountInPaise, record?.currency)}
              </span>
              <span className="text-xs text-muted-foreground">
                {record?.createdAt ? formatDate(record.createdAt) : ''}
              </span>
            </div>
          </Card>
        )}
      />
    </PageShell>
  );
};

export default CollegeOrdersPage;
