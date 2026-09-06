/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback } from 'react';
import { Check, Search, Smartphone, X } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  getCollegeTransferRequestsAction,
  reviewCollegeTransferRequestAction,
} from '../../redux/action/collegeDeviceAction';
import { RootState, AppDispatch } from '../../redux/store';
import { PageShell } from '../../components/common/PageShell';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable, type DataTableColumn } from '../../components/common/DataTable';
import { ColumnFilter } from '../../components/common/ColumnFilter';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Spinner } from '../../components/ui/spinner';
import { FormField } from '../../components/ui/form-field';
import { formatDate } from '../../utils/common';
import { toastText } from '../../utils/toast';

const DEFAULT_PAGE_SIZE = 20;

// The API's three enum values, shown as plain words — no enum name reaches the screen.
const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Waiting for approval',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
};

const STATUS_FILTER_OPTIONS = Object.entries(STATUS_LABELS).map(([value, text]) => ({
  text,
  value,
}));

// The label always carries the meaning, so colour is never the only signal.
const STATUS_BADGE_VARIANT: Record<string, 'default' | 'outline' | 'solid' | 'success'> = {
  PENDING: 'outline',
  APPROVED: 'success',
  REJECTED: 'default',
};

// A note is optional on approval but required on rejection — a student who is refused deserves
// to be told why, and the note is the only place that reason is ever recorded.
const reviewSchema = z.object({
  adminNote: z.string().trim().max(1000, 'Note must be 1000 characters or fewer').optional(),
});

type ReviewValues = z.infer<typeof reviewSchema>;

type ReviewAction = 'APPROVE' | 'REJECT';

const readStudentName = (record: any): string => {
  const name = `${record?.user?.firstName ?? ''} ${record?.user?.lastName ?? ''}`.trim();
  return name || '—';
};

const CollegeDeviceRequestsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const { collegeTransferRequestLists, collegeTransferRequestTotalRecords, isLoading } = useSelector(
    (state: RootState) => state.collegeDevice
  );

  const requests = Array.isArray(collegeTransferRequestLists) ? collegeTransferRequestLists : [];
  const total = collegeTransferRequestTotalRecords || 0;

  // Search and pagination state
  const [searchText, setSearchText] = useState<string>(''); // Input field value
  const [appliedSearch, setAppliedSearch] = useState<string>(''); // Term actually sent to the API
  // The queue exists to be worked through, so it opens on what still needs a decision.
  const [filterStatus, setFilterStatus] = useState<string | undefined>('PENDING');
  const [page, setPage] = useState<number>(1);

  // Review dialog state
  const [reviewRecord, setReviewRecord] = useState<any | null>(null);
  const [reviewAction, setReviewAction] = useState<ReviewAction>('APPROVE');
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);

  const {
    register,
    handleSubmit: handleFormSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<ReviewValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { adminNote: '' },
  });

  const fetchRequests = useCallback(() => {
    dispatch(
      getCollegeTransferRequestsAction({
        page,
        limit: DEFAULT_PAGE_SIZE,
        status: filterStatus,
        search: appliedSearch || undefined,
      })
    );
  }, [dispatch, page, filterStatus, appliedSearch]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

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

  const openReview = (record: any, action: ReviewAction) => {
    setReviewRecord(record);
    setReviewAction(action);
    reset({ adminNote: '' });
  };

  const closeReview = () => {
    if (submitLoading) return;
    setReviewRecord(null);
    reset({ adminNote: '' });
  };

  const handleReviewSubmit = async (values: ReviewValues) => {
    if (!reviewRecord) return;

    const note = values.adminNote?.trim() || '';

    if (reviewAction === 'REJECT' && !note) {
      setError('adminNote', { message: 'Please tell the student why the request was refused' });
      return;
    }

    setSubmitLoading(true);
    try {
      const result: any = await dispatch(
        reviewCollegeTransferRequestAction({
          requestId: reviewRecord.id,
          action: reviewAction,
          adminNote: note || undefined,
        })
      );

      if (result?.payload?.statusCode === 200) {
        toastText(result.payload.message, 'success');
        setReviewRecord(null);
        reset({ adminNote: '' });
        // The row has left the pending filter, so the page must be re-read rather than patched.
        fetchRequests();
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  const renderStatus = (_: any, record: any) => {
    const status = record?.status ?? '';
    return (
      <Badge variant={STATUS_BADGE_VARIANT[status] ?? 'outline'} size="sm">
        {STATUS_LABELS[status] ?? status}
      </Badge>
    );
  };

  const renderActions = (record: any) => {
    // Reviewed requests are history: re-deciding one would move the slot to a device key that
    // may no longer be the student's, and the API refuses it anyway.
    if (record?.status !== 'PENDING') {
      return (
        <span className="text-xs text-muted-foreground">
          {record?.reviewedAt ? `Reviewed ${formatDate(record.reviewedAt)}` : 'Reviewed'}
        </span>
      );
    }

    return (
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" onClick={() => openReview(record, 'APPROVE')}>
          <Check aria-hidden="true" />
          Approve
        </Button>
        <Button size="sm" variant="secondary" onClick={() => openReview(record, 'REJECT')}>
          <X aria-hidden="true" />
          Reject
        </Button>
      </div>
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
          <span className="break-words font-medium text-foreground">{readStudentName(record)}</span>
          <span className="break-all text-xs text-muted-foreground">
            {record?.user?.email ?? ''}
          </span>
        </div>
      ),
    },
    {
      title: 'Course',
      dataIndex: 'course',
      key: 'course',
      width: 150,
      hideBelow: 'xl',
      render: (_: any, record: any) =>
        record?.user
          ? `${record.user.course ?? ''} · Semester ${record.user.semester ?? '—'}`.trim()
          : '—',
    },
    {
      title: 'New device',
      dataIndex: 'toDeviceLabel',
      key: 'toDeviceLabel',
      width: 170,
      hideBelow: 'lg',
      // The device key itself is a secret the handset holds; the label is what a human reads.
      render: (text: string) => (
        <span className="flex items-center gap-1.5 break-words">
          <Smartphone aria-hidden="true" className="size-3.5 shrink-0 text-muted-foreground" />
          {text || 'Not named'}
        </span>
      ),
    },
    {
      title: 'Reason given',
      dataIndex: 'reason',
      key: 'reason',
      width: 220,
      hideBelow: 'lg',
      render: (text: string) => (
        <span className="break-words text-sm text-muted-foreground">{text || '—'}</span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 170,
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
      title: 'Requested',
      dataIndex: 'requestedAt',
      key: 'requestedAt',
      width: 130,
      hideBelow: 'md',
      render: (text: string) => (text ? formatDate(text) : '—'),
    },
    {
      title: 'Decision',
      dataIndex: 'actions',
      key: 'actions',
      width: 200,
      render: (_: any, record: any) => renderActions(record),
    },
  ];

  const dialogTitle =
    reviewAction === 'APPROVE' ? 'Approve device transfer' : 'Reject device transfer';

  const dialogDescription =
    reviewAction === 'APPROVE'
      ? `${readStudentName(reviewRecord)} will be moved to their new device immediately. Their old device will lose access to paid chapters.`
      : `${readStudentName(reviewRecord)} will stay on their current device and will see the reason you give below.`;

  return (
    <PageShell>
      <PageHeader
        title="Device Transfer Requests"
        description="Students are locked to one device. Approving a request moves them to the new handset and locks the old one out of paid chapters."
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
                aria-label="Search device transfer requests"
                placeholder="Search student name, email or phone... (min 3 characters)"
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
        dataSource={requests}
        rowKey="id"
        loading={isLoading}
        skeletonRows={5}
        emptyTitle="Nothing waiting for approval"
        emptyDescription="When a student asks to move to a new phone, the request will appear here."
        pagination={{
          current: page,
          pageSize: DEFAULT_PAGE_SIZE,
          total,
          onChange: (p) => setPage(p),
          showTotal: (t, range) => `${range[0]}-${range[1]} of ${t} requests`,
        }}
        // Below `md` each request becomes a card; seven columns will not fit a phone.
        renderMobileCard={(record: any) => (
          <Card className="flex flex-col gap-3 p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex min-w-0 flex-col">
                <span className="break-words text-sm font-medium text-foreground">
                  {readStudentName(record)}
                </span>
                <span className="break-all text-xs text-muted-foreground">
                  {record?.user?.email ?? ''}
                </span>
              </div>
              {renderStatus(null, record)}
            </div>
            <div className="flex flex-col gap-1">
              <span className="dc-label">New device</span>
              <span className="break-words text-sm text-foreground">
                {record?.toDeviceLabel || 'Not named'}
              </span>
            </div>
            {record?.reason && (
              <div className="flex flex-col gap-1">
                <span className="dc-label">Reason given</span>
                <span className="break-words text-sm text-muted-foreground">{record.reason}</span>
              </div>
            )}
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-muted-foreground">
                {record?.requestedAt ? formatDate(record.requestedAt) : ''}
              </span>
            </div>
            {renderActions(record)}
          </Card>
        )}
      />

      <Dialog open={Boolean(reviewRecord)} onOpenChange={(open) => !open && closeReview()}>
        <DialogContent className="max-w-md gap-5 p-5 sm:p-6">
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
          </DialogHeader>

          <p className="text-sm text-muted-foreground">{dialogDescription}</p>

          <form
            noValidate
            onSubmit={handleFormSubmit(handleReviewSubmit)}
            className="flex flex-col gap-5"
          >
            <FormField
              id="transfer-admin-note"
              label="Note for the student"
              required={reviewAction === 'REJECT'}
              error={errors.adminNote?.message}
              hint={
                reviewAction === 'APPROVE'
                  ? 'Optional. Anything you write is kept with the request.'
                  : undefined
              }
            >
              {(aria) => (
                <Textarea
                  {...aria}
                  {...register('adminNote')}
                  placeholder={
                    reviewAction === 'APPROVE'
                      ? 'e.g. Verified over the phone'
                      : 'e.g. We could not confirm this request — please call us'
                  }
                  autoFocus
                  invalid={Boolean(errors.adminNote)}
                />
              )}
            </FormField>

            <DialogFooter>
              <Button variant="secondary" onClick={closeReview} disabled={submitLoading}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant={reviewAction === 'APPROVE' ? 'primary' : 'destructive'}
                disabled={submitLoading}
              >
                {submitLoading && <Spinner />}
                {reviewAction === 'APPROVE' ? 'Approve transfer' : 'Reject request'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
};

export default CollegeDeviceRequestsPage;
