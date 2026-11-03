import React, { Fragment, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { CheckCircle2, CircleSlash, LayoutDashboard, RotateCcw, XCircle } from 'lucide-react';
import { AppDispatch, RootState } from '../../redux/store';
import { getAccountingAttemptResultAction } from '../../redux/action/accountingAction';
import ResultHeader from '../../components/YourResult/ResultHeader';
import { PageShell } from '../../components/common/PageShell';
import { LoadingState } from '../../components/common/LoadingState';
import { EmptyState } from '../../components/common/EmptyState';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { cn } from '../../libs/utils';
import { AccountingGradedItem, AccountingSide, AccountingStatement } from '../../interfaces/interfaces';
import {
    REASON_LABELS,
    formatAmount,
    formatDateTime,
    getSectionLabels,
    getStatements,
    isStatementSideBySide,
} from '../../components/accounting/accountingUtils';

// Wrong lines first, then missed, then correct — the order a student should review them.
const STATUS_ORDER: Record<AccountingGradedItem['status'], number> = { WRONG: 0, MISSED: 1, CORRECT: 2 };

const STATUS_META = {
    CORRECT: { label: 'Correct', icon: CheckCircle2, className: 'bg-success/10 text-success' },
    WRONG: { label: 'Wrong', icon: XCircle, className: 'bg-destructive/10 text-destructive' },
    MISSED: { label: 'Missed', icon: CircleSlash, className: 'bg-warning/10 text-warning' },
} as const;

const AccountingResultPage: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const [searchParams] = useSearchParams();
    const attemptId = searchParams.get('attemptId') || '';
    const { result } = useSelector((state: RootState) => state.accounting);
    const [loadFailed, setLoadFailed] = useState(false);

    // The submit response is reused when present; a refresh re-reads the saved result.
    const hasResult = result?.attemptId === attemptId;
    useEffect(() => {
        if (!attemptId || hasResult) return;
        dispatch(getAccountingAttemptResultAction(attemptId)).then((action) => {
            if (getAccountingAttemptResultAction.rejected.match(action)) setLoadFailed(true);
        });
    }, [attemptId, hasResult, dispatch]);

    const sectionLabels = useMemo(() => getSectionLabels(result?.formatDefinition), [result]);
    const reviewItems = useMemo(
        () => [...(result?.items ?? [])].sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]),
        [result]
    );

    if (!attemptId || loadFailed) {
        return (
            <PageShell>
                <EmptyState
                    icon={CircleSlash}
                    title="Result not available"
                    description="This accounting result could not be found."
                    action={<Button onClick={() => navigate('/accounting-test-details')}>Back to Accounting Tests</Button>}
                />
            </PageShell>
        );
    }

    if (!hasResult || !result) {
        return <LoadingState className="py-24" />;
    }

    const format = result.formatDefinition;
    // Partner columns of a columnar result (snapshotted at submit); empty for single-column ones.
    const columns = result.columns ?? [];
    const columnLabel = new Map(columns.map((column) => [column.key, column.label]));
    // Formats a placement as "Head · Less ₹2,000".
    const describe = (line: AccountingGradedItem['placed']) =>
        line
            ? `${sectionLabels.get(line.sectionKey) ?? line.sectionKey} · ${line.isDeduction ? 'Less ' : ''}${formatAmount(line.amount)}`
            : '—';
    // Statements of the result; Final Accounts have three, every other type one.
    const statements: AccountingStatement[] = format ? getStatements(format) : [];
    const isMultiStatement = statements.length > 1;
    const statementLabel = new Map(statements.map((statement) => [statement.key, statement.label]));
    // Names a graded cell, adding the partner or the statement where needed, e.g. "Interest on Capital — A", "Closing Stock — Balance Sheet".
    const itemName = (item: AccountingGradedItem) => {
        if (item.columnKey && columnLabel.has(item.columnKey)) return `${item.name} — ${columnLabel.get(item.columnKey)}`;
        if (isMultiStatement && item.statementKey && statementLabel.has(item.statementKey)) return `${item.name} — ${statementLabel.get(item.statementKey)}`;
        return item.name;
    };
    const itemKey = (item: AccountingGradedItem) => `${item.entryId}|${item.statementKey ?? ''}|${item.columnKey ?? ''}`;
    // Expected side totals of one statement (Final Accounts keep them per statement).
    const expectedTotals = (statementKey: string) => (isMultiStatement ? result.statementTotals?.[statementKey]?.expected : result.totals.expected) ?? {};

    // One side of the correct answer in the Indian layout: Particulars with To/By, inner column for each line, outer column for each head.
    const renderAnswerSide = (statement: AccountingStatement, side: AccountingSide) => {
        const singleHead = side.sections.length === 1;
        const amountHeader = columns.length > 0 ? columns.map((column) => column.label) : ['Amount (₹)'];
        return (
            <Card key={side.key} className="flex flex-col gap-3 p-4">
                <div className="flex flex-col gap-1 border-b border-border pb-2">
                    <h3 className="dc-label">{side.label}</h3>
                    <div className="flex items-center justify-between gap-3 text-xs font-medium text-muted-foreground">
                        <span>Particulars</span>
                        <span className="flex gap-4">
                            {amountHeader.map((label) => (
                                <span key={label}>{label}</span>
                            ))}
                        </span>
                    </div>
                </div>
                {side.sections.map((section, index) => {
                    const rows = result.items.filter((item) => item.expected?.sectionKey === section.key && (item.statementKey ?? '') === statement.key);
                    const showGroup = section.group && section.group !== side.sections[index - 1]?.group;
                    if (rows.length === 0 && !showGroup) return null;
                    // Columnar: one row per entry with an amount under each partner.
                    const entryRows = [...new Map(rows.map((row) => [row.entryId, row])).values()];
                    const net = rows.reduce((sum, row) => sum + Math.round((row.expected?.amount ?? 0) * 100) * (row.expected?.isDeduction ? -1 : 1), 0) / 100;
                    // Inner and outer columns only matter where a head groups lines or deducts one.
                    const useInnerColumn = columns.length === 0 && !singleHead && (rows.length > 1 || rows.some((row) => row.expected?.isDeduction));
                    return (
                        <Fragment key={section.key}>
                            {showGroup && <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{section.group}</p>}
                            {rows.length > 0 && (
                                <div className="flex flex-col gap-1">
                                    {!singleHead && <p className="text-sm font-semibold text-foreground">{section.label}</p>}
                                    {(columns.length > 0 ? entryRows : rows).map((row, rowIndex) => (
                                        <div key={itemKey(row)} className="flex items-start justify-between gap-3 text-sm">
                                            <span className={cn('break-words', !singleHead && 'pl-3')}>
                                                {side.prefix && <span className="text-muted-foreground">{side.prefix} </span>}
                                                {row.expected?.isDeduction && <span className="text-destructive">Less: </span>}
                                                {row.name}
                                            </span>
                                            {columns.length > 0 ? (
                                                <span className="dc-numeric flex shrink-0 gap-4">
                                                    {columns.map((column) => {
                                                        const cell = rows.find((item) => item.entryId === row.entryId && item.columnKey === column.key);
                                                        return <span key={column.key}>{cell?.expected ? formatAmount(cell.expected.amount) : '—'}</span>;
                                                    })}
                                                </span>
                                            ) : useInnerColumn ? (
                                                <span className="dc-numeric grid shrink-0 grid-cols-[6.5rem_6.5rem] text-right">
                                                    <span className={cn(rowIndex === rows.length - 1 && 'border-b border-foreground/40')}>{formatAmount(row.expected?.amount ?? 0)}</span>
                                                    <span className="font-medium">{rowIndex === rows.length - 1 ? formatAmount(net) : ''}</span>
                                                </span>
                                            ) : (
                                                <span className="dc-numeric shrink-0">{formatAmount(row.expected?.amount ?? 0)}</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Fragment>
                    );
                })}
                <div className="mt-auto flex flex-wrap justify-between gap-x-4 gap-y-1 border-t border-border pt-3 text-sm font-semibold">
                    <span>Total</span>
                    {columns.length > 0 ? (
                        // One total per partner for this side.
                        <span className="dc-numeric flex flex-wrap justify-end gap-x-4">
                            {columns.map((column) => (
                                <span key={column.key}>{formatAmount(result.columnTotals?.[column.key]?.expected[side.key] ?? 0)}</span>
                            ))}
                        </span>
                    ) : (
                        <span className="dc-numeric">{formatAmount(expectedTotals(statement.key)[side.key] ?? 0)}</span>
                    )}
                </div>
            </Card>
        );
    };

    return (
        <PageShell className="max-w-5xl">
            <ResultHeader scorePercentage={result.scorePercent} />

            <Card className="flex flex-col gap-5 p-5 sm:p-6">
                <div className="flex flex-col gap-1">
                    <h2 className="text-lg font-semibold text-foreground">{result.title}</h2>
                    <p className="dc-caption">Submitted {formatDateTime(result.submittedAt)}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div className="rounded-xl bg-accent p-4">
                        <p className="dc-caption">Score</p>
                        <p className="dc-numeric text-2xl font-bold text-foreground">{result.scorePercent}%</p>
                        <p className="dc-caption dc-numeric">{result.marks} / {result.totalEntries} marks</p>
                    </div>
                    {(['CORRECT', 'WRONG', 'MISSED'] as const).map((status) => {
                        const meta = STATUS_META[status];
                        const count = status === 'CORRECT' ? result.correctCount : status === 'WRONG' ? result.wrongCount : result.missedCount;
                        return (
                            <div key={status} className={cn('rounded-xl p-4', meta.className)}>
                                <p className="flex items-center gap-1.5 text-xs font-medium">
                                    <meta.icon aria-hidden="true" className="size-4" />
                                    {meta.label}
                                </p>
                                <p className="dc-numeric text-2xl font-bold">{count}</p>
                            </div>
                        );
                    })}
                </div>
                <p className="dc-caption">Marks = correct entries − wrong entries (never below zero).</p>

                {/* Columnar results compare each partner's side totals separately. */}
                {format && columns.length > 0 && result.columnTotals && (
                    <div className="grid gap-2 sm:grid-cols-2">
                        {columns.flatMap((column) =>
                            statements[0].sides.map((side) => {
                                const yours = result.columnTotals?.[column.key]?.submitted[side.key] ?? 0;
                                const expected = result.columnTotals?.[column.key]?.expected[side.key] ?? 0;
                                return (
                                    <div key={`${column.key}-${side.key}`} className="flex items-center justify-between gap-3 rounded-lg border border-border px-4 py-3 text-sm">
                                        <span className="font-medium">
                                            {column.label} · {side.label}
                                        </span>
                                        <span className="dc-numeric text-right">
                                            <span className={yours === expected ? 'text-success' : 'text-destructive'}>{formatAmount(yours)}</span>
                                            <span className="text-muted-foreground"> / {formatAmount(expected)}</span>
                                        </span>
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}
                {format && columns.length === 0 && (
                    <div className="grid gap-2 sm:grid-cols-2">
                        {/* Final Accounts compare each statement's sides; other types their one statement. */}
                        {statements.flatMap((statement) =>
                            statement.sides.map((side) => {
                                const totals = isMultiStatement ? result.statementTotals?.[statement.key] : result.totals;
                                const yours = totals?.submitted[side.key] ?? 0;
                                const expected = totals?.expected[side.key] ?? 0;
                                return (
                                    <div key={`${statement.key}-${side.key}`} className="flex items-center justify-between gap-3 rounded-lg border border-border px-4 py-3 text-sm">
                                        <span className="font-medium">{isMultiStatement ? `${statement.label} · ${side.label}` : side.label}</span>
                                        <span className="dc-numeric text-right">
                                            <span className={yours === expected ? 'text-success' : 'text-destructive'}>{formatAmount(yours)}</span>
                                            <span className="text-muted-foreground"> / {formatAmount(expected)}</span>
                                        </span>
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}
            </Card>

            <Tabs defaultValue="review">
                <TabsList>
                    <TabsTrigger value="review">Review entries</TabsTrigger>
                    <TabsTrigger value="solution">Correct answer</TabsTrigger>
                </TabsList>

                <TabsContent value="review">
                    <ul className="flex flex-col gap-2">
                        {reviewItems.map((item) => {
                            const meta = STATUS_META[item.status];
                            return (
                                <li key={itemKey(item)}>
                                    <Card className="flex flex-col gap-2 p-4 sm:flex-row sm:items-start sm:justify-between">
                                        <div className="flex min-w-0 flex-col gap-1">
                                            <span className="break-words font-medium text-foreground">{itemName(item)}</span>
                                            <span className="text-sm text-muted-foreground">
                                                Your answer: <span className="text-foreground">{describe(item.placed)}</span>
                                            </span>
                                            {item.status !== 'CORRECT' && (
                                                <span className="text-sm text-muted-foreground">
                                                    Correct: <span className="text-foreground">{item.expected ? describe(item.expected) : 'Leave it in the pool'}</span>
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex shrink-0 flex-col items-start gap-1 sm:items-end">
                                            <Badge className={meta.className}>
                                                <meta.icon aria-hidden="true" />
                                                {meta.label}
                                            </Badge>
                                            {item.reason && <span className="text-xs text-muted-foreground">{REASON_LABELS[item.reason]}</span>}
                                        </div>
                                    </Card>
                                </li>
                            );
                        })}
                    </ul>
                </TabsContent>

                <TabsContent value="solution">
                    {format && (
                        <div className="flex flex-col gap-6">
                            {statements.map((statement) => (
                                <section key={statement.key} className="flex flex-col gap-3">
                                    {isMultiStatement && <h3 className="text-base font-semibold text-foreground">{statement.label}</h3>}
                                    {/* Dr. | Cr. (or Liabilities | Assets) side by side on wide screens, as printed in Indian textbooks. */}
                                    <div className={cn('grid gap-4', isStatementSideBySide(format, statement) ? 'lg:grid-cols-2' : 'grid-cols-1')}>
                                        {statement.sides.map((side) => renderAnswerSide(statement, side))}
                                    </div>
                                </section>
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Button onClick={() => navigate('/accounting-test-details')}>
                    <RotateCcw aria-hidden="true" />
                    Try another question
                </Button>
                <Button variant="secondary" onClick={() => navigate('/dashboard')}>
                    <LayoutDashboard aria-hidden="true" />
                    Return to Dashboard
                </Button>
            </div>
        </PageShell>
    );
};

export default AccountingResultPage;
