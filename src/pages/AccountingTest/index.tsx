import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Calculator, Check, ChevronDown } from 'lucide-react';
import { AppDispatch, RootState } from '../../redux/store';
import { submitAccountingAttemptAction } from '../../redux/action/accountingAction';
import { BrandLogo } from '../../components/landing/primitives/BrandLogo';
import { ExamTimer } from '../../components/exam/ExamTimer';
import { BalanceSheetBoard } from '../../components/accounting/BalanceSheetBoard';
import { TypedWorkingNote } from '../../components/accounting/TypedWorkingNote';
import {
    countIncompleteTyping,
    createTypedSheet,
    isTypedAnswer,
    parseAmount,
    toTypedAnswer,
    type BoardLine,
    type TypedSheet,
} from '../../components/accounting/accountingUtils';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { EmptyState } from '../../components/common/EmptyState';
import { PageShell } from '../../components/common/PageShell';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Spinner } from '../../components/ui/spinner';
import { cn } from '../../libs/utils';

const AccountingTestPage: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const { attempt } = useSelector((state: RootState) => state.accounting);

    const [lines, setLines] = useState<BoardLine[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showProblem, setShowProblem] = useState(true);
    const [msLeft, setMsLeft] = useState(0);
    // Guards against the timer and the button submitting the same attempt twice.
    const submittedRef = useRef(false);
    const linesRef = useRef(lines);
    linesRef.current = lines;
    // Typed answers (the working note) keep their rows and totals here instead of placed lines.
    const isTyped = isTypedAnswer(attempt?.formatDefinition);
    const [sheet, setSheet] = useState<TypedSheet>(() => (attempt ? createTypedSheet(attempt.formatDefinition) : { rows: [], totals: {} }));
    const sheetRef = useRef(sheet);
    sheetRef.current = sheet;
    // A new attempt starts from a blank sheet, so typing from an earlier question never carries over.
    useEffect(() => {
        if (attempt) setSheet(createTypedSheet(attempt.formatDefinition));
    }, [attempt]);

    const timeLimitMs = (attempt?.question.timeLimitMinutes ?? 0) * 60 * 1000;
    // Partner columns of a columnar statement; empty for one amount per line.
    const columns = attempt?.question.columns ?? [];
    const isColumnar = columns.length > 0;

    const handleSubmit = useCallback(async () => {
        if (!attempt || submittedRef.current) return;
        submittedRef.current = true;
        setIsSubmitting(true);

        const questionColumns = attempt.question.columns ?? [];
        const placements =
            questionColumns.length > 0
                ? // Columnar: one placement per partner amount; a blank partner amount means "not for this partner".
                linesRef.current.flatMap((line) =>
                    questionColumns
                        .filter((column) => (line.amounts?.[column.key] ?? '').trim() !== '')
                        .map((column) => ({
                            entryId: line.entryId,
                            sectionKey: line.sectionKey,
                            amount: parseAmount(line.amounts![column.key]),
                            isDeduction: line.isDeduction,
                            columnKey: column.key,
                        }))
                )
                : // Blank amounts are sent as zero, so the line is graded as wrong rather than dropped.
                linesRef.current.map((line) => ({
                    entryId: line.entryId,
                    sectionKey: line.sectionKey,
                    amount: parseAmount(line.amount),
                    isDeduction: line.isDeduction,
                }));

        // A typed answer sends its rows and totals, with no placements.
        const payload = isTypedAnswer(attempt.formatDefinition)
            ? { attemptId: attempt.attemptId, placements: [], ...toTypedAnswer(attempt.formatDefinition, sheetRef.current) }
            : { attemptId: attempt.attemptId, placements };
        const result = await dispatch(submitAccountingAttemptAction(payload));
        setIsSubmitting(false);
        if (submitAccountingAttemptAction.fulfilled.match(result)) {
            navigate(`/accounting-result?attemptId=${attempt.attemptId}`);
        } else {
            // Allows a retry after a failed request; the slice has already shown the error.
            submittedRef.current = false;
        }
    }, [attempt, dispatch, navigate]);

    // Deadline taken from the local clock when the test opens, so device clock skew cannot shorten it.
    useEffect(() => {
        if (!attempt || !timeLimitMs) return;
        const deadline = Date.now() + timeLimitMs;
        const tick = () => {
            const remaining = Math.max(0, deadline - Date.now());
            setMsLeft(remaining);
            if (remaining === 0) handleSubmit();
        };
        tick();
        const timer = setInterval(tick, 1000);
        return () => clearInterval(timer);
    }, [attempt, timeLimitMs, handleSubmit]);

    // Warns before a reload or tab close throws away an unsubmitted sheet.
    useEffect(() => {
        if (!attempt) return;
        const warn = (event: BeforeUnloadEvent) => {
            if (submittedRef.current) return;
            event.preventDefault();
            event.returnValue = '';
        };
        window.addEventListener('beforeunload', warn);
        return () => window.removeEventListener('beforeunload', warn);
    }, [attempt]);

    if (!attempt) {
        return (
            <PageShell>
                <EmptyState
                    icon={Calculator}
                    title="No active accounting test"
                    description="Choose a balance sheet or account question to begin."
                    action={<Button onClick={() => navigate('/accounting-test-details')}>Choose a Question</Button>}
                />
            </PageShell>
        );
    }

    // Lines with no amount at all: single-column ones are graded wrong, columnar ones are left out.
    const missingAmounts = lines.filter((line) =>
        isColumnar ? columns.every((column) => (line.amounts?.[column.key] ?? '').trim() === '') : line.amount.trim() === ''
    ).length;
    const missingWarning = isColumnar
        ? `${missingAmounts} line${missingAmounts > 1 ? 's have' : ' has'} no amount for any partner and will not be counted. You cannot change your answer after submitting.`
        : `${missingAmounts} line${missingAmounts > 1 ? 's have' : ' has'} no amount and will be marked wrong. You cannot change your answer after submitting.`;
    // Typed answers warn about rows without an amount and totals left blank, both of which lose marks.
    const typedGaps = isTyped ? countIncompleteTyping(attempt.formatDefinition, sheet) : null;
    const typedWarning = typedGaps
        ? [
            typedGaps.rowsWithoutAmount > 0 && `${typedGaps.rowsWithoutAmount} row${typedGaps.rowsWithoutAmount > 1 ? 's have' : ' has'} no amount and will be marked wrong.`,
            typedGaps.blankTotals > 0 && `${typedGaps.blankTotals} total${typedGaps.blankTotals > 1 ? 's are' : ' is'} blank and will be marked missed.`,
        ]
            .filter(Boolean)
            .join(' ')
        : '';
    const submitDescription = isTyped
        ? `${typedWarning ? `${typedWarning} ` : ''}You cannot change your answer after submitting.`
        : missingAmounts > 0
            ? missingWarning
            : 'You cannot change your answer after submitting.';

    return (
        <div className="dc-app flex min-h-[100dvh] flex-col bg-surface">
            <header className="sticky top-0 z-[800] shrink-0 border-b border-border bg-background/90 backdrop-blur-md">
                <div className="mx-auto flex h-14 w-full max-w-[1400px] items-center justify-between gap-3 px-4 sm:h-16 sm:px-6">
                    <BrandLogo showTagline={false} className="hidden md:inline-flex" to="/dashboard" />
                    <p className="min-w-0 truncate text-sm font-semibold text-foreground sm:text-base">{attempt.question.title}</p>
                    <div className="flex shrink-0 items-center gap-2">
                        {timeLimitMs > 0 && <ExamTimer msLeft={msLeft} />}
                        <ConfirmDialog
                            title="Submit your answer?"
                            description={submitDescription}
                            confirmLabel="Submit"
                            cancelLabel="Keep working"
                            onConfirm={handleSubmit}
                            loading={isSubmitting}
                            trigger={
                                <Button size="sm" disabled={isSubmitting}>
                                    {isSubmitting ? <Spinner /> : <Check aria-hidden="true" />}
                                    {isSubmitting ? 'Submitting...' : 'Submit'}
                                </Button>
                            }
                        />
                    </div>
                </div>
            </header>

            <main className="mx-auto flex w-full max-w-[1400px] flex-1 flex-col gap-4 px-4 py-4 sm:px-6 sm:py-6">
                {/* The problem stays one tap away so the student can re-check figures while working. */}
                <Card className="p-0">
                    <button
                        type="button"
                        onClick={() => setShowProblem((open) => !open)}
                        aria-expanded={showProblem}
                        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:px-5"
                    >
                        <span className="flex flex-col">
                            <span className="dc-label">Question</span>
                            <span className="dc-caption">
                                {[attempt.question.subject?.subname, attempt.question.chapter?.name, attempt.formatDefinition.label]
                                    .filter(Boolean)
                                    .join(' · ')}
                            </span>
                        </span>
                        <ChevronDown aria-hidden="true" className={cn('size-5 shrink-0 transition-transform', showProblem && 'rotate-180')} />
                    </button>
                    {showProblem && (
                        <p className="whitespace-pre-line break-words border-t border-border px-4 py-4 text-sm leading-relaxed text-foreground sm:px-5">
                            {attempt.question.problem}
                        </p>
                    )}
                </Card>

                {/* The working note is typed out as in the exam; every other type keeps the drag-and-drop board. */}
                {isTyped ? (
                    <TypedWorkingNote format={attempt.formatDefinition} sheet={sheet} onSheetChange={setSheet} disabled={isSubmitting} />
                ) : (
                    <BalanceSheetBoard
                        format={attempt.formatDefinition}
                        pool={attempt.pool}
                        lines={lines}
                        onLinesChange={setLines}
                        disabled={isSubmitting}
                        columns={isColumnar ? columns : null}
                    />
                )}
            </main>
        </div>
    );
};

export default AccountingTestPage;
