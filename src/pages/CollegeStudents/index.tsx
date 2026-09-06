/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  BookOpen,
  ChevronRight,
  IndianRupee,
  Search,
  Smartphone,
  Target,
  Video,
} from 'lucide-react';
import {
  getCollegeStudentDetailAction,
  getCollegeStudentsAction,
} from '../../redux/action/collegeStudentAction';
import { clearCollegeStudentDetail } from '../../redux/slice/collegeStudentSlice';
import { RootState, AppDispatch } from '../../redux/store';
import { PageShell } from '../../components/common/PageShell';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable, type DataTableColumn } from '../../components/common/DataTable';
import { ColumnFilter } from '../../components/common/ColumnFilter';
import { EmptyState } from '../../components/common/EmptyState';
import { Sheet, SheetContent } from '../../components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Skeleton } from '../../components/ui/skeleton';
import { formatDate } from '../../utils/common';
import { toastText } from '../../utils/toast';

const DEFAULT_PAGE_SIZE = 20;

// B.Com runs six semesters; the filter offers exactly those.
const SEMESTER_FILTER_OPTIONS = Array.from({ length: 6 }, (_, index) => ({
  text: `Semester ${index + 1}`,
  value: String(index + 1),
}));

// Enum values shown as plain words — no enum name reaches the screen.
const ENTITLEMENT_LABELS: Record<string, string> = {
  ACTIVE: 'Open',
  EXPIRED: 'Ended',
  REVOKED: 'Withdrawn',
};

const ORDER_LABELS: Record<string, string> = {
  CREATED: 'Awaiting payment',
  PAID: 'Paid',
  FAILED: 'Failed',
  REFUNDED: 'Refunded',
};

const TRANSFER_LABELS: Record<string, string> = {
  PENDING: 'Waiting for approval',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
};

// The label always carries the meaning, so colour is never the only signal.
const STATUS_VARIANT: Record<string, 'default' | 'outline' | 'solid' | 'success'> = {
  ACTIVE: 'success',
  PAID: 'success',
  APPROVED: 'success',
  PENDING: 'outline',
  CREATED: 'outline',
  EXPIRED: 'default',
  REVOKED: 'default',
  FAILED: 'default',
  REFUNDED: 'default',
  REJECTED: 'default',
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

const readStudentName = (record: any): string => {
  const name = `${record?.firstName ?? ''} ${record?.lastName ?? ''}`.trim();
  return name || '—';
};

/** "3 of 5 videos" style captions, kept out of the JSX so the markup stays readable. */
const readDeviceName = (device: any): string =>
  device?.model || device?.platform || 'Unnamed device';

interface StatTileProps {
  label: string;
  value: string;
  icon: typeof BookOpen;
}

// Compact stat used inside the detail drawer, where a full StatCard would not fit.
const StatTile = ({ label, value, icon: Icon }: StatTileProps) => (
  <Card className="flex items-center gap-3 p-4">
    <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent text-accent-foreground">
      <Icon aria-hidden="true" className="size-4" />
    </div>
    <div className="flex min-w-0 flex-col">
      <span className="dc-numeric text-lg font-bold leading-tight text-foreground">{value}</span>
      <span className="break-words text-xs text-muted-foreground">{label}</span>
    </div>
  </Card>
);

const StatusBadge = ({ status, labels }: { status: string; labels: Record<string, string> }) => (
  <Badge variant={STATUS_VARIANT[status] ?? 'outline'} size="sm">
    {labels[status] ?? status}
  </Badge>
);

const CollegeStudentsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const {
    collegeStudentLists,
    collegeStudentTotalRecords,
    collegeStudentDetail,
    isLoading,
  } = useSelector((state: RootState) => state.collegeStudent);

  const students = Array.isArray(collegeStudentLists) ? collegeStudentLists : [];
  const total = collegeStudentTotalRecords || 0;

  // Search and pagination state
  const [searchText, setSearchText] = useState<string>(''); // Input field value
  const [appliedSearch, setAppliedSearch] = useState<string>(''); // Term actually sent to the API
  const [filterSemester, setFilterSemester] = useState<string | undefined>(undefined);
  const [page, setPage] = useState<number>(1);

  // Detail drawer state. The open row is held locally so the header can render immediately,
  // before the detail request resolves.
  const [openStudent, setOpenStudent] = useState<any | null>(null);
  const [detailLoading, setDetailLoading] = useState<boolean>(false);

  const fetchStudents = useCallback(() => {
    dispatch(
      getCollegeStudentsAction({
        page,
        limit: DEFAULT_PAGE_SIZE,
        semester: filterSemester ? Number(filterSemester) : undefined,
        search: appliedSearch || undefined,
      })
    );
  }, [dispatch, page, filterSemester, appliedSearch]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

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

  const applySemesterFilter = (values: string[]) => {
    setFilterSemester(values[0] || undefined);
    setPage(1);
  };

  const openDetail = async (record: any) => {
    setOpenStudent(record);
    setDetailLoading(true);
    try {
      await dispatch(getCollegeStudentDetailAction({ userId: record.id }));
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = () => {
    setOpenStudent(null);
    dispatch(clearCollegeStudentDetail());
  };

  const renderDeviceState = (record: any) =>
    record?.hasActiveDevice ? (
      <Badge variant="success" size="sm">
        Phone linked
      </Badge>
    ) : (
      <Badge variant="outline" size="sm">
        No phone yet
      </Badge>
    );

  const columns: DataTableColumn<any>[] = [
    {
      title: 'Student',
      dataIndex: 'firstName',
      key: 'student',
      width: 220,
      render: (_: any, record: any) => (
        <div className="flex flex-col">
          <span className="break-words font-medium text-foreground">{readStudentName(record)}</span>
          <span className="break-all text-xs text-muted-foreground">{record?.email ?? ''}</span>
        </div>
      ),
    },
    {
      title: 'Course',
      dataIndex: 'semester',
      key: 'semester',
      width: 150,
      render: (_: any, record: any) =>
        `${record?.course ?? ''} · Semester ${record?.semester ?? '—'}`.trim(),
      filter: (
        <ColumnFilter
          label="Semester"
          options={SEMESTER_FILTER_OPTIONS}
          value={filterSemester ? [filterSemester] : []}
          onApply={applySemesterFilter}
          onReset={() => applySemesterFilter([])}
        />
      ),
    },
    {
      title: 'Chapters bought',
      dataIndex: 'entitlementCount',
      key: 'entitlementCount',
      width: 140,
      align: 'right',
      hideBelow: 'lg',
      render: (value: number) => <span className="tabular-nums">{value ?? 0}</span>,
    },
    {
      title: 'Phone',
      dataIndex: 'hasActiveDevice',
      key: 'hasActiveDevice',
      width: 140,
      hideBelow: 'lg',
      render: (_: any, record: any) => renderDeviceState(record),
    },
    {
      title: 'Joined',
      dataIndex: 'joinedAt',
      key: 'joinedAt',
      width: 130,
      hideBelow: 'xl',
      render: (text: string) => (text ? formatDate(text) : '—'),
    },
    {
      title: '',
      dataIndex: 'actions',
      key: 'actions',
      width: 120,
      align: 'right',
      render: (_: any, record: any) => (
        <Button variant="secondary" size="sm" onClick={() => openDetail(record)}>
          View
          <ChevronRight aria-hidden="true" />
        </Button>
      ),
    },
  ];

  const detail = collegeStudentDetail;
  const summary = detail?.summary;

  return (
    <PageShell>
      <PageHeader
        title="Mobile Users"
        description="Students using the college course in the app. This view is read-only — accounts are managed from the app, and phones move only through the transfer queue."
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
                aria-label="Search mobile users"
                placeholder="Search name, email or phone... (min 3 characters)"
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
        dataSource={students}
        rowKey="id"
        loading={isLoading && !openStudent}
        skeletonRows={5}
        emptyTitle="No students yet"
        emptyDescription="Students will appear here as soon as they register in the app."
        pagination={{
          current: page,
          pageSize: DEFAULT_PAGE_SIZE,
          total,
          onChange: (p) => setPage(p),
          showTotal: (t, range) => `${range[0]}-${range[1]} of ${t} students`,
        }}
        // Below `md` each student becomes a card; six columns will not fit a phone, and the
        // View button has to come with it or the detail view is desktop-only.
        renderMobileCard={(record: any) => (
          <Card className="flex flex-col gap-3 p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex min-w-0 flex-col">
                <span className="break-words text-sm font-medium text-foreground">
                  {readStudentName(record)}
                </span>
                <span className="break-all text-xs text-muted-foreground">
                  {record?.email ?? ''}
                </span>
              </div>
              {renderDeviceState(record)}
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span>
                {record?.course} · Semester {record?.semester}
              </span>
              <span>{record?.entitlementCount ?? 0} chapters bought</span>
            </div>
            <Button variant="secondary" size="sm" onClick={() => openDetail(record)}>
              View details
              <ChevronRight aria-hidden="true" />
            </Button>
          </Card>
        )}
      />

      <Sheet open={Boolean(openStudent)} onOpenChange={(open) => !open && closeDetail()}>
        <SheetContent
          side="right"
          title={`${readStudentName(openStudent)} — college profile`}
          className="flex w-full max-w-none flex-col gap-0 p-0 sm:w-[92%] lg:w-[70%]"
        >
          {/* Right padding is kept at both breakpoints so the close button never overlaps */}
          <div className="flex shrink-0 flex-col gap-1 border-b border-border px-4 py-4 pr-14 sm:px-6 sm:pr-14">
            <h2 className="dc-h3 break-words">{readStudentName(openStudent)}</h2>
            <p className="dc-caption break-all">
              {openStudent?.email} · {openStudent?.course} · Semester {openStudent?.semester}
            </p>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
            {detailLoading && (
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {Array.from({ length: 4 }, (_, index) => (
                    <Skeleton key={index} className="h-[72px] w-full rounded-2xl" />
                  ))}
                </div>
                <Skeleton className="h-64 w-full rounded-2xl" />
              </div>
            )}

            {!detailLoading && detail && (
              <div className="flex flex-col gap-5">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <StatTile
                    label="Spent in total"
                    value={formatMoney(summary?.totalPaidInPaise ?? 0)}
                    icon={IndianRupee}
                  />
                  <StatTile
                    label="Chapters open right now"
                    value={String(summary?.activeEntitlements ?? 0)}
                    icon={BookOpen}
                  />
                  <StatTile
                    label={`Videos finished of ${summary?.videosStarted ?? 0} started`}
                    value={String(summary?.videosCompleted ?? 0)}
                    icon={Video}
                  />
                  <StatTile
                    label={`Practice correct, ${summary?.questionsAnswered ?? 0} answered`}
                    value={`${summary?.practiceAccuracy ?? 0}%`}
                    icon={Target}
                  />
                </div>

                <Tabs defaultValue="chapters">
                  {/* Scrolls rather than squashing the four labels on a narrow phone */}
                  <div className="overflow-x-auto">
                    <TabsList>
                      <TabsTrigger value="chapters">Chapters</TabsTrigger>
                      <TabsTrigger value="phones">Phones</TabsTrigger>
                      <TabsTrigger value="payments">Payments</TabsTrigger>
                      <TabsTrigger value="progress">Watching</TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="chapters">
                    {detail.entitlements.length === 0 ? (
                      <EmptyState
                        title="No chapters bought yet"
                        description="Chapters this student has paid for will be listed here."
                      />
                    ) : (
                      <div className="flex flex-col gap-3">
                        {detail.entitlements.map((row) => (
                          <Card key={row.id} className="flex flex-col gap-2 p-4">
                            <div className="flex flex-wrap items-start justify-between gap-2">
                              <div className="flex min-w-0 flex-col">
                                <span className="break-words text-sm font-medium text-foreground">
                                  {row.chapterName}
                                </span>
                                <span className="break-words text-xs text-muted-foreground">
                                  {row.subjectName}
                                </span>
                              </div>
                              <StatusBadge status={row.status} labels={ENTITLEMENT_LABELS} />
                            </div>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                              <span>Paid {formatMoney(row.pricePaidInPaise)}</span>
                              <span>Bought {formatDate(row.grantedAt)}</span>
                              {/* Null means no limit of that kind, which is not the same as none left */}
                              <span>
                                {row.daysRemaining === null
                                  ? 'No time limit'
                                  : `${row.daysRemaining} days left`}
                              </span>
                              <span>
                                {row.viewsRemaining === null
                                  ? 'No view limit'
                                  : `${row.viewsRemaining} views left`}
                              </span>
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="phones">
                    <div className="flex flex-col gap-3">
                      {detail.devices.length === 0 ? (
                        <EmptyState
                          title="No phone registered"
                          description="This student has not opened the app on a phone yet."
                        />
                      ) : (
                        detail.devices.map((device) => (
                          <Card key={device.id} className="flex flex-col gap-2 p-4">
                            <div className="flex flex-wrap items-start justify-between gap-2">
                              <span className="flex items-center gap-2 break-words text-sm font-medium text-foreground">
                                <Smartphone
                                  aria-hidden="true"
                                  className="size-4 shrink-0 text-muted-foreground"
                                />
                                {readDeviceName(device)}
                              </span>
                              {device.isActiveDevice ? (
                                <Badge variant="success" size="sm">
                                  Paid chapters open here
                                </Badge>
                              ) : (
                                <Badge variant="outline" size="sm">
                                  Free content only
                                </Badge>
                              )}
                            </div>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                              <span>
                                {device.platform ?? 'Unknown'} {device.osVersion ?? ''}
                              </span>
                              <span>App {device.appVersion ?? '—'}</span>
                              <span>Last used {formatDate(device.lastSeenAt)}</span>
                            </div>
                          </Card>
                        ))
                      )}

                      {detail.transferRequests.length > 0 && (
                        <div className="flex flex-col gap-3">
                          <h3 className="dc-h4">Phone change requests</h3>
                          {detail.transferRequests.map((row) => (
                            <Card key={row.id} className="flex flex-col gap-2 p-4">
                              <div className="flex flex-wrap items-start justify-between gap-2">
                                <span className="break-words text-sm text-foreground">
                                  {row.toDeviceLabel || 'Unnamed device'}
                                </span>
                                <StatusBadge status={row.status} labels={TRANSFER_LABELS} />
                              </div>
                              {row.reason && (
                                <p className="break-words text-xs text-muted-foreground">
                                  “{row.reason}”
                                </p>
                              )}
                              <span className="text-xs text-muted-foreground">
                                Asked {formatDate(row.requestedAt)}
                                {row.reviewedAt ? ` · Reviewed ${formatDate(row.reviewedAt)}` : ''}
                              </span>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="payments">
                    {detail.orders.length === 0 ? (
                      <EmptyState
                        title="No payments yet"
                        description="Payment attempts will be listed here, successful or not."
                      />
                    ) : (
                      <div className="flex flex-col gap-3">
                        {detail.orders.map((row) => (
                          <Card key={row.id} className="flex flex-col gap-2 p-4">
                            <div className="flex flex-wrap items-start justify-between gap-2">
                              <span className="break-words text-sm font-medium text-foreground">
                                {row.chapter?.name ?? 'Removed chapter'}
                              </span>
                              <StatusBadge status={row.status} labels={ORDER_LABELS} />
                            </div>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                              <span className="font-semibold tabular-nums text-foreground">
                                {formatMoney(row.amountInPaise, row.currency)}
                              </span>
                              <span>Started {formatDate(row.createdAt)}</span>
                              {row.paidAt && <span>Paid {formatDate(row.paidAt)}</span>}
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="progress">
                    {detail.progress.length === 0 ? (
                      <EmptyState
                        title="Nothing watched yet"
                        description="Videos this student has started will show up here."
                      />
                    ) : (
                      <div className="flex flex-col gap-3">
                        {detail.progress.map((row) => (
                          <Card key={row.videoId} className="flex flex-col gap-2 p-4">
                            <div className="flex flex-wrap items-start justify-between gap-2">
                              <div className="flex min-w-0 flex-col">
                                <span className="break-words text-sm font-medium text-foreground">
                                  {row.title}
                                </span>
                                <span className="break-words text-xs text-muted-foreground">
                                  {row.chapterName}
                                </span>
                              </div>
                              <div className="flex shrink-0 items-center gap-2">
                                {/* Flags free-chapter progress so paid vs. free watching isn't conflated */}
                                {row.isFree && (
                                  <Badge variant="outline" size="sm">
                                    Free
                                  </Badge>
                                )}
                                {row.completionCount > 0 ? (
                                  <Badge variant="success" size="sm">
                                    Watched {row.completionCount}×
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" size="sm">
                                    Started
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {row.lastWatchedAt ? `Last opened ${formatDate(row.lastWatchedAt)}` : ''}
                            </span>
                          </Card>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </PageShell>
  );
};

export default CollegeStudentsPage;
