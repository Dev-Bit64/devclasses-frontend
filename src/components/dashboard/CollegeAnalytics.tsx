/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  BookOpen,
  IndianRupee,
  Smartphone,
  TrendingDown,
  TrendingUp,
  Unlock,
  Users as UsersIcon,
  type LucideIcon,
} from 'lucide-react';
import { Card } from '../ui/card';
import { Skeleton } from '../ui/skeleton';
import { EmptyState } from '../common/EmptyState';
import { CollegeDashboardDetails } from '../../interfaces/interfaces';

/**
 * Recharts needs literal colour values, so the design tokens are mirrored here.
 * Keep in sync with the --dc-* palette in styles/tailwind.css.
 */
const CHART_COLORS = {
  primary: '#1d4ed8',
  success: '#16a34a',
  warning: '#d97706',
  destructive: '#dc2626',
  secondary: '#7c3aed',
  grid: '#e2e8f0',
  axis: '#64748b',
};

// Order status in plain words. No enum name ever reaches the screen.
const STATUS_LABELS: Record<string, string> = {
  CREATED: 'Started, not paid',
  PAID: 'Paid',
  FAILED: 'Failed',
  REFUNDED: 'Refunded',
};

// Each slice also carries its label directly, so colour is never the only signal — this stays
// readable for colour-blind admins and in monochrome print.
const STATUS_COLORS: Record<string, string> = {
  CREATED: CHART_COLORS.axis,
  PAID: CHART_COLORS.success,
  FAILED: CHART_COLORS.destructive,
  REFUNDED: CHART_COLORS.warning,
};

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

/**
 * Money arrives as integer paise. Split it with integer arithmetic only — a `/ 100` into a
 * float would round real rupee amounts wrong.
 */
const formatRupees = (amountInPaise: number): string => {
  if (typeof amountInPaise !== 'number' || Number.isNaN(amountInPaise)) return '₹0';
  const negative = amountInPaise < 0;
  const abs = Math.abs(Math.trunc(amountInPaise));
  const paise = abs % 100;
  const rupees = (abs - paise) / 100;
  const grouped = new Intl.NumberFormat('en-IN').format(rupees);
  return `${negative ? '-' : ''}₹${grouped}.${String(paise).padStart(2, '0')}`;
};

/** Whole rupees, for axis ticks where the paise would only add noise. */
const formatRupeesShort = (amountInPaise: number): string => {
  const abs = Math.abs(Math.trunc(amountInPaise || 0));
  const rupees = (abs - (abs % 100)) / 100;
  return `₹${new Intl.NumberFormat('en-IN').format(rupees)}`;
};

/** "2026-08" → "Aug 26", which is what an axis tick has room for. */
const formatMonth = (month: string): string => {
  const [year, monthNumber] = month.split('-');
  const index = Number(monthNumber) - 1;
  if (index < 0 || index > 11) return month;
  return `${MONTH_NAMES[index]} ${year.slice(2)}`;
};

/**
 * Period-over-period change in plain words. Returns null when there is nothing to compare
 * against, because "up 100% from zero" tells an admin nothing useful.
 */
const describeChange = (
  current: number,
  previous: number,
  noun: string
): { text: string; isUp: boolean } | null => {
  if (previous <= 0) {
    if (current <= 0) return null;
    return { text: `First ${noun} this month`, isUp: true };
  }
  if (current === previous) return { text: 'Same as last month', isUp: true };

  const percent = Math.round((Math.abs(current - previous) * 100) / previous);
  const isUp = current > previous;
  return { text: `${isUp ? 'Up' : 'Down'} ${percent}% from last month`, isUp };
};

interface HeadlineCardProps {
  label: string;
  value: string;
  caption: string;
  icon: LucideIcon;
  change?: { text: string; isUp: boolean } | null;
}

// Leads with the number, then says what it means in a full sentence — the audience is not
// expected to know what an "entitlement" is.
const HeadlineCard = ({ label, value, caption, icon: Icon, change }: HeadlineCardProps) => (
  <Card className="flex flex-col gap-4 p-5">
    <div className="flex items-start justify-between gap-3">
      <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-accent text-accent-foreground">
        <Icon aria-hidden="true" className="size-5" />
      </div>
      <span className="dc-numeric break-all text-right text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        {value}
      </span>
    </div>
    <div className="flex flex-col gap-1">
      <h3 className="dc-h4">{label}</h3>
      <p className="dc-caption">{caption}</p>
      {change && (
        <p
          className={`mt-1 flex items-center gap-1 text-xs font-medium ${
            change.isUp ? 'text-success' : 'text-destructive'
          }`}
        >
          {change.isUp ? (
            <TrendingUp aria-hidden="true" className="size-3.5" />
          ) : (
            <TrendingDown aria-hidden="true" className="size-3.5" />
          )}
          {change.text}
        </p>
      )}
    </div>
  </Card>
);

interface ChartCardProps {
  title: string;
  description: string;
  isEmpty: boolean;
  emptyTitle: string;
  emptyDescription: string;
  children: React.ReactNode;
  className?: string;
}

// Every chart routes its zero-data case through here. The college database starts empty, so
// this is literally the first thing anyone sees — it must read as "nothing yet", not as broken.
const ChartCard = ({
  title,
  description,
  isEmpty,
  emptyTitle,
  emptyDescription,
  children,
  className,
}: ChartCardProps) => (
  <Card className={`flex flex-col gap-4 p-5 ${className ?? ''}`}>
    <div className="flex flex-col gap-1">
      <h3 className="dc-h4">{title}</h3>
      <p className="dc-caption">{description}</p>
    </div>
    {isEmpty ? (
      <EmptyState title={emptyTitle} description={emptyDescription} />
    ) : (
      // Charts scroll inside their own card rather than pushing the page sideways.
      <div className="min-h-[260px] w-full overflow-x-auto">{children}</div>
    )}
  </Card>
);

export const CollegeAnalyticsSkeleton = () => (
  <div className="flex flex-col gap-4 lg:gap-5">
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-5 xl:grid-cols-4">
      {Array.from({ length: 4 }, (_, index) => (
        <Card key={index} className="flex flex-col gap-4 p-5">
          <div className="flex items-start justify-between gap-3">
            <Skeleton className="size-11 rounded-xl" />
            <Skeleton className="h-8 w-24" />
          </div>
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-2/5" />
            <Skeleton className="h-3 w-4/5" />
          </div>
        </Card>
      ))}
    </div>
    <div className="grid grid-cols-1 gap-4 lg:gap-5 xl:grid-cols-2">
      {Array.from({ length: 4 }, (_, index) => (
        <Card key={index} className="flex flex-col gap-4 p-5">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-2/3" />
          <Skeleton className="h-[220px] w-full" />
        </Card>
      ))}
    </div>
  </div>
);

interface CollegeAnalyticsProps {
  details: CollegeDashboardDetails;
}

const CollegeAnalytics: React.FC<CollegeAnalyticsProps> = ({ details }) => {
  const counters = details?.counters;

  const revenueSeries = (details?.revenueByMonth ?? []).map((row) => ({
    ...row,
    label: formatMonth(row.month),
  }));

  const enrolmentSeries = (details?.enrolmentsBySemester ?? []).map((row) => ({
    ...row,
    label: `Sem ${row.semester}`,
  }));

  const topChapterSeries = (details?.topChapters ?? []).map((row) => ({
    ...row,
    label: row.chapterName,
  }));

  const statusSeries = (details?.orderStatusBreakdown ?? [])
    .filter((row) => row.count > 0)
    .map((row) => ({
      ...row,
      label: STATUS_LABELS[row.status] ?? row.status,
      fill: STATUS_COLORS[row.status] ?? CHART_COLORS.axis,
    }));

  // A twelve-month series is dense by construction, so "no revenue yet" means every month is
  // zero — not an empty array.
  const hasRevenue = revenueSeries.some((row) => row.revenueInPaise > 0);

  const revenueChange = describeChange(
    counters?.revenueThisMonthInPaise ?? 0,
    counters?.revenueLastMonthInPaise ?? 0,
    'earnings'
  );

  const studentChange = describeChange(
    counters?.newStudentsThisMonth ?? 0,
    counters?.newStudentsLastMonth ?? 0,
    'sign-ups'
  );

  return (
    <div className="flex flex-col gap-4 lg:gap-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-5 xl:grid-cols-4">
        <HeadlineCard
          label="Earned this month"
          value={formatRupees(counters?.revenueThisMonthInPaise ?? 0)}
          caption={`${formatRupees(counters?.totalRevenueInPaise ?? 0)} earned since the college course launched`}
          icon={IndianRupee}
          change={revenueChange}
        />
        <HeadlineCard
          label="Students signed up"
          value={String(counters?.totalStudents ?? 0)}
          caption={`${counters?.newStudentsThisMonth ?? 0} joined this month`}
          icon={UsersIcon}
          change={studentChange}
        />
        <HeadlineCard
          label="Chapters being studied"
          value={String(counters?.activeEntitlements ?? 0)}
          caption={`Bought and still open, across ${counters?.publishedChapters ?? 0} published chapters`}
          icon={Unlock}
        />
        <HeadlineCard
          label="Phone changes waiting"
          value={String(counters?.pendingTransferRequests ?? 0)}
          caption="Students asking to move to a new phone. They stay locked out until you approve."
          icon={Smartphone}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:gap-5 xl:grid-cols-2">
        <ChartCard
          title="Money earned each month"
          description="The last twelve months, including months with no sales."
          isEmpty={!hasRevenue}
          emptyTitle="No purchases yet"
          emptyDescription="Once students start buying chapters, monthly earnings will appear here."
          className="xl:col-span-2"
        >
          <ResponsiveContainer width="100%" height={260} minWidth={320}>
            <AreaChart data={revenueSeries} margin={{ top: 8, right: 16, bottom: 8, left: 8 }}>
              <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="label"
                stroke={CHART_COLORS.axis}
                tick={{ fontSize: 12 }}
                label={{ value: 'Month', position: 'insideBottom', offset: -4, fontSize: 12 }}
              />
              <YAxis
                stroke={CHART_COLORS.axis}
                tick={{ fontSize: 12 }}
                tickFormatter={(value: number) => formatRupeesShort(value)}
                width={90}
              />
              <RechartsTooltip
                formatter={(value: any) => [formatRupees(Number(value)), 'Money earned']}
                labelFormatter={(label: any) => `Month: ${label}`}
              />
              <Area
                type="monotone"
                dataKey="revenueInPaise"
                name="Money earned"
                stroke={CHART_COLORS.primary}
                fill={CHART_COLORS.primary}
                fillOpacity={0.15}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Students in each semester"
          description="How the students who have signed up are spread across semesters."
          isEmpty={enrolmentSeries.length === 0}
          emptyTitle="No students yet"
          emptyDescription="Semesters will appear here as students register in the app."
        >
          <ResponsiveContainer width="100%" height={260} minWidth={320}>
            <BarChart data={enrolmentSeries} margin={{ top: 8, right: 16, bottom: 8, left: 8 }}>
              <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="label"
                stroke={CHART_COLORS.axis}
                tick={{ fontSize: 12 }}
                label={{ value: 'Semester', position: 'insideBottom', offset: -4, fontSize: 12 }}
              />
              <YAxis
                stroke={CHART_COLORS.axis}
                tick={{ fontSize: 12 }}
                allowDecimals={false}
                label={{ value: 'Students', angle: -90, position: 'insideLeft', fontSize: 12 }}
              />
              <RechartsTooltip formatter={(value: any) => [`${value} students`, 'Signed up']} />
              <Bar dataKey="studentCount" name="Students" fill={CHART_COLORS.primary} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="What happened to each payment"
          description="Every payment attempt, grouped by how it ended."
          isEmpty={statusSeries.length === 0}
          emptyTitle="No payments yet"
          emptyDescription="This will fill in as soon as the first student tries to buy a chapter."
        >
          <ResponsiveContainer width="100%" height={260} minWidth={320}>
            <PieChart>
              <Pie
                data={statusSeries}
                dataKey="count"
                nameKey="label"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={2}
                // Labelled directly on the slice as well as in the legend, so the chart is
                // still readable without matching colours to a key.
                label={(entry: any) => `${entry.label}: ${entry.count}`}
              >
                {statusSeries.map((row) => (
                  <Cell key={row.status} fill={row.fill} />
                ))}
              </Pie>
              <RechartsTooltip formatter={(value: any, name: any) => [`${value} payments`, name]} />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Best-selling chapters"
          description="The chapters students have spent the most on."
          isEmpty={topChapterSeries.length === 0}
          emptyTitle="No sales yet"
          emptyDescription="Your best-selling chapters will be listed here after the first purchase."
          className="xl:col-span-2"
        >
          <ResponsiveContainer width="100%" height={260} minWidth={320}>
            <BarChart
              data={topChapterSeries}
              layout="vertical"
              margin={{ top: 8, right: 24, bottom: 8, left: 8 }}
            >
              <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="3 3" horizontal={false} />
              <XAxis
                type="number"
                stroke={CHART_COLORS.axis}
                tick={{ fontSize: 12 }}
                tickFormatter={(value: number) => formatRupeesShort(value)}
                label={{ value: 'Money earned', position: 'insideBottom', offset: -4, fontSize: 12 }}
              />
              <YAxis
                type="category"
                dataKey="label"
                stroke={CHART_COLORS.axis}
                tick={{ fontSize: 12 }}
                width={160}
              />
              <RechartsTooltip
                formatter={(value: any, _name: any, item: any) => [
                  `${formatRupees(Number(value))} from ${item?.payload?.purchases ?? 0} purchases`,
                  item?.payload?.subjectName || 'Chapter',
                ]}
              />
              <Bar
                dataKey="revenueInPaise"
                name="Money earned"
                fill={CHART_COLORS.secondary}
                radius={[0, 6, 6, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <Card className="flex flex-col gap-2 p-5">
        <h3 className="dc-h4">What these numbers cover</h3>
        <p className="dc-caption">
          Everything on this page comes from the college course in the app only. School figures are
          kept separate — switch back to School above to see those.
        </p>
        <p className="dc-caption flex items-center gap-1.5">
          <BookOpen aria-hidden="true" className="size-3.5" />
          {counters?.publishedChapters ?? 0} chapters are published and visible to students right now.
        </p>
      </Card>
    </div>
  );
};

export default CollegeAnalytics;
