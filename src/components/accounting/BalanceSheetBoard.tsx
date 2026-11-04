import { Fragment, useCallback, useMemo, useState } from "react";
import {
    DndContext,
    DragOverlay,
    MouseSensor,
    TouchSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
    type DragStartEvent,
} from "@dnd-kit/core";
import { Calculator, CheckCircle2, GripVertical, Scale } from "lucide-react";
import { Card } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { cn } from "../../libs/utils";
import type { AccountingColumn, AccountingFormat, AccountingStatement } from "../../interfaces/interfaces";
import { EntryPool, type PoolEntry } from "./EntryPool";
import { SectionDropZone } from "./SectionDropZone";
import { SignedAmount } from "./SignedAmount";
import {
    formatAmount,
    getRunningTotals,
    getSectionStatements,
    getStatements,
    isBalancedTotals,
    isComputation,
    isStatementSideBySide,
    lineKey,
    parseAmount,
    resolveDeduction,
    sectionAllowsDeduction,
    sectionSign,
    sumBySide,
    sumColumnBySide,
    type BoardLine,
} from "./accountingUtils";

export interface BalanceSheetBoardProps {
    format: AccountingFormat;
    pool: PoolEntry[];
    lines: BoardLine[];
    onLinesChange: (lines: BoardLine[]) => void;
    disabled?: boolean;
    // Partner columns of a columnar statement; absent for one amount per line.
    columns?: AccountingColumn[] | null;
}

/**
 * The interactive statement: entry pool on one side, the format's heads on the other.
 * Entries move by drag and drop (mouse or touch) or by tap-to-place; the parent owns the
 * lines so it can submit them.
 */
const BalanceSheetBoard = ({ format, pool, lines, onLinesChange, disabled, columns }: BalanceSheetBoardProps) => {
    const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
    const [dragging, setDragging] = useState<{ name: string } | null>(null);
    // Columnar statements may place one entry under several heads (e.g. Balance b/d as Dr. for one partner, Cr. for another).
    const isColumnar = Boolean(columns && columns.length > 0);
    const statements = useMemo(() => getStatements(format), [format]);
    // Final Accounts: one tab per statement, and an entry may be used once in each (e.g. Closing Stock).
    const isMultiStatement = statements.length > 1;
    const [activeStatement, setActiveStatement] = useState(statements[0].key);
    const statementOf = useMemo(() => getSectionStatements(format), [format]);
    // Cash flow types print negatives in red brackets; every other type keeps plain amounts.
    const inBrackets = format.negativesInBrackets === true;
    // A working note ends in a result, so it shows that result where other types show "Balanced".
    const isWorkingNote = isComputation(format);
    // Amount text for totals: unchanged for older types, bracketed negatives for cash flow types.
    const showAmount = (value: number) => (inBrackets ? <SignedAmount value={value} inBrackets /> : formatAmount(value));

    // A short move threshold keeps clicks working; the touch delay keeps page scrolling working.
    const sensors = useSensors(
        useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 8 } })
    );

    const placedIds = useMemo(() => new Set(lines.map((line) => line.entryId)), [lines]);
    // Single-statement, single-column pools shrink as entries are placed; the others keep every entry available.
    const keepsPlaced = isColumnar || isMultiStatement;
    const available = useMemo(() => (keepsPlaced ? pool : pool.filter((entry) => !placedIds.has(entry.id))), [pool, placedIds, keepsPlaced]);
    const nameById = useMemo(() => new Map(pool.map((entry) => [entry.id, entry.name])), [pool]);

    // Places a pool entry under a head, or moves an existing line (identified by fromKey) to another head.
    const placeEntry = useCallback(
        (entryId: string, sectionKey: string, fromKey?: string) => {
            // An entry already under the target head is never duplicated.
            if (lines.some((line) => line.entryId === entryId && line.sectionKey === sectionKey)) return;
            const targetStatement = statementOf.get(sectionKey) ?? "";
            // Outside columnar statements an entry appears once per statement, so placing it again there moves it.
            const sameStatementLine = isColumnar
                ? undefined
                : lines.find((line) => line.entryId === entryId && (statementOf.get(line.sectionKey) ?? "") === targetStatement);
            const fromLine = fromKey ? lines.find((line) => lineKey(line) === fromKey) : undefined;
            // Moving a line into a statement that already holds the entry would duplicate it there.
            if (fromLine && sameStatementLine && sameStatementLine !== fromLine) return;
            const existing = fromLine ?? sameStatementLine;
            if (existing) {
                // A sign set by the old head's fixed sign is not the student's choice, so it is not carried to the new head.
                const chosen = sectionSign(format, existing.sectionKey) ? false : existing.isDeduction;
                // A "Less" line moved under a head without "Less" becomes an added line, so the server never rejects the submission.
                const isDeduction = resolveDeduction(format, sectionKey, chosen && sectionAllowsDeduction(format, sectionKey));
                onLinesChange(lines.map((line) => (line === existing ? { ...line, sectionKey, isDeduction } : line)));
                return;
            }
            const name = nameById.get(entryId);
            if (!name) return;
            // A head with a fixed sign (e.g. "Less: Items to be Deducted") gives a new line its sign straight away.
            const isDeduction = resolveDeduction(format, sectionKey, false);
            onLinesChange([...lines, { entryId, name, sectionKey, amount: "", isDeduction, ...(isColumnar && { amounts: {} }) }]);
        },
        [lines, nameById, onLinesChange, isColumnar, statementOf, format]
    );

    const removeLine = useCallback(
        (key: string) => onLinesChange(lines.filter((line) => lineKey(line) !== key)),
        [lines, onLinesChange]
    );

    const changeLine = useCallback(
        (key: string, patch: Partial<BoardLine>) =>
            onLinesChange(lines.map((line) => (lineKey(line) === key ? { ...line, ...patch } : line))),
        [lines, onLinesChange]
    );

    // Tapping the selected entry again clears the selection.
    const handleSelect = useCallback(
        (entryId: string) => setSelectedEntryId((current) => (current === entryId ? null : entryId)),
        []
    );

    const handlePlaceSelected = (sectionKey: string) => {
        if (!selectedEntryId) return;
        placeEntry(selectedEntryId, sectionKey);
        setSelectedEntryId(null);
    };

    const handleDragStart = (event: DragStartEvent) => {
        setDragging({ name: String(event.active.data.current?.name ?? "") });
        setSelectedEntryId(null);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        setDragging(null);
        const entryId = event.active.data.current?.entryId as string | undefined;
        // Set only when a placed line (not a pool card) is being dragged.
        const fromKey = event.active.data.current?.lineKey as string | undefined;
        const overId = event.over?.id ? String(event.over.id) : null;
        if (!entryId || !overId) return;
        if (overId === "pool") {
            if (fromKey) removeLine(fromKey);
        } else if (overId.startsWith("section:")) {
            placeEntry(entryId, overId.slice("section:".length), fromKey);
        }
    };

    const amountLines = useMemo(() => lines.map((line) => ({ ...line, amount: parseAmount(line.amount) })), [lines]);
    // Each statement balances on its own; lines of other statements are ignored by its side map.
    const statementTotals = useMemo(
        () => new Map(statements.map((statement) => [statement.key, sumBySide(statement, amountLines)])),
        [statements, amountLines]
    );
    // Each partner's account balances on its own, so columnar totals are kept per partner.
    const columnTotals = useMemo(
        () => (isColumnar ? columns!.map((column) => ({ column, totals: sumColumnBySide(statements[0], lines, column.key) })) : []),
        [isColumnar, columns, statements, lines]
    );
    // A statement counts as balanced once it has lines and every side (or every partner) agrees.
    const isStatementBalanced = (statementKey: string) => {
        const hasLines = lines.some((line) => (statementOf.get(line.sectionKey) ?? "") === statementKey);
        if (!hasLines) return false;
        return isColumnar ? columnTotals.every(({ totals: t }) => isBalancedTotals(t)) : isBalancedTotals(statementTotals.get(statementKey) ?? {});
    };
    // Net of one head for the outer amount column ("Less" lines reduce it).
    const sectionNet = (sectionKey: string) =>
        amountLines.filter((line) => line.sectionKey === sectionKey).reduce((sum, line) => sum + Math.round(line.amount * 100) * (line.isDeduction ? -1 : 1), 0) / 100;
    const selectedName = selectedEntryId ? nameById.get(selectedEntryId) ?? null : null;
    const shownStatement = statements.find((statement) => statement.key === activeStatement) ?? statements[0];
    const shownTotals = statementTotals.get(shownStatement.key) ?? {};
    // A working note has nothing to balance, so it is never shown as balanced.
    const isBalanced = !isWorkingNote && isStatementBalanced(shownStatement.key);

    // One statement in the Indian layout: side headings, a Particulars | Amount (₹) ruling, heads, and side totals.
    const renderStatement = (statement: AccountingStatement) => {
        const sideTotals = statementTotals.get(statement.key) ?? {};
        // Vertical statements (Schedule III) stack; T-form accounts and the horizontal Balance Sheet sit side by side on wide screens.
        const sidesLayout = isStatementSideBySide(format, statement) ? "xl:grid-cols-2" : "grid-cols-1";
        return (
            <div className={cn("grid gap-4", sidesLayout)}>
                {statement.sides.map((side) => {
                    // A side with one plain head is a textbook T-account column, so the head's name is not repeated.
                    const singleHead = side.sections.length === 1;
                    // Totals such as "(D) Operating Profit before Working Capital Changes", printed after their heads.
                    const runningTotals = getRunningTotals(side, amountLines);
                    return (
                        <Card key={side.key} className="flex flex-col gap-3 p-3 sm:p-4">
                            <div className="flex flex-col gap-1 border-b border-border pb-2">
                                <h3 className="dc-label">{side.label}</h3>
                                <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                                    <span>Particulars</span>
                                    <span>Amount (₹)</span>
                                </div>
                            </div>
                            {side.sections.map((section, index) => {
                                // Main head printed once above its first sub-head.
                                const showGroup = section.group && section.group !== side.sections[index - 1]?.group;
                                return (
                                    <Fragment key={section.key}>
                                        {showGroup && (
                                            <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                                {section.group}
                                            </p>
                                        )}
                                        <SectionDropZone
                                            sectionKey={section.key}
                                            label={section.label}
                                            lines={lines.filter((line) => line.sectionKey === section.key)}
                                            selectedName={selectedName}
                                            disabled={disabled}
                                            columns={isColumnar ? columns : undefined}
                                            prefix={side.prefix}
                                            // Per head, so Final Accounts allow "Less" only under Sales, Purchases and Capital.
                                            allowDeduction={sectionAllowsDeduction(format, section.key)}
                                            signFixed={Boolean(section.sign)}
                                            hideLabel={singleHead}
                                            // A "Less" head's amount is printed as the positive figure its label deducts, as in textbooks.
                                            subtotal={!isColumnar && !singleHead ? showAmount(section.sign === "LESS" ? -sectionNet(section.key) : sectionNet(section.key)) : null}
                                            onPlaceSelected={handlePlaceSelected}
                                            onLineChange={changeLine}
                                            onLineRemove={removeLine}
                                        />
                                        {runningTotals.get(section.key)?.map((total) => (
                                            <div key={total.label} className="flex items-start justify-between gap-3 border-y border-border bg-muted/40 px-2.5 py-2 text-sm font-semibold text-foreground">
                                                <span className="min-w-0 break-words">{total.label}</span>
                                                <span className="dc-numeric shrink-0">{showAmount(total.value)}</span>
                                            </div>
                                        ))}
                                    </Fragment>
                                );
                            })}
                            {isColumnar ? (
                                // One total per partner for this side.
                                <div className="mt-auto flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-border pt-3 text-sm font-semibold">
                                    <span>Total</span>
                                    <span className="dc-numeric flex flex-wrap justify-end gap-x-3">
                                        {columnTotals.map(({ column, totals: t }) => (
                                            <span key={column.key}>
                                                <span className="font-normal text-muted-foreground">{column.label} </span>
                                                {formatAmount(t[side.key] ?? 0)}
                                            </span>
                                        ))}
                                    </span>
                                </div>
                            ) : (
                                <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-3 text-sm font-semibold">
                                    {/* A working note or cash flow side names its bottom line (e.g. "Net Profit before Tax…"). */}
                                    <span className="min-w-0 break-words">{side.totalLabel ?? "Total"}</span>
                                    <span className="dc-numeric shrink-0">{showAmount(sideTotals[side.key] ?? 0)}</span>
                                </div>
                            )}
                        </Card>
                    );
                })}
            </div>
        );
    };

    return (
        <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={() => setDragging(null)}
        >
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[300px_minmax(0,1fr)]">
                <EntryPool
                    entries={available}
                    selectedEntryId={selectedEntryId}
                    onSelect={handleSelect}
                    disabled={disabled}
                    placedIds={keepsPlaced ? placedIds : undefined}
                    className="max-h-[50vh] lg:sticky lg:top-20 lg:max-h-[calc(100dvh-7rem)]"
                />

                <div className="flex min-w-0 flex-col gap-4">
                    {/* Live tally of both sides; it never reveals which lines are correct. */}
                    <div
                        role="status"
                        aria-live="polite"
                        className={cn(
                            "flex flex-wrap items-center gap-x-4 gap-y-1 rounded-xl border px-4 py-2.5 text-sm",
                            isBalanced ? "border-success/30 bg-success/5" : "border-border bg-white"
                        )}
                    >
                        {isBalanced ? (
                            <CheckCircle2 aria-hidden="true" className="size-4 text-success" />
                        ) : isWorkingNote ? (
                            <Calculator aria-hidden="true" className="size-4 text-muted-foreground" />
                        ) : (
                            <Scale aria-hidden="true" className="size-4 text-muted-foreground" />
                        )}
                        {isMultiStatement && <span className="font-semibold text-foreground">{shownStatement.label}:</span>}
                        {/* A working note shows its running result; every other type shows each side's total. */}
                        {isWorkingNote
                            ? shownStatement.sides.map((side) => (
                                <span key={side.key} className="dc-numeric">
                                    <span className="text-muted-foreground">{side.totalLabel ?? side.label}: </span>
                                    <span className="font-semibold text-foreground">{showAmount(shownTotals[side.key] ?? 0)}</span>
                                </span>
                            ))
                            : isColumnar
                            ? columnTotals.map(({ column, totals: t }) => (
                                <span key={column.key} className="dc-numeric">
                                    <span className="text-muted-foreground">{column.label}: </span>
                                    <span className={cn("font-semibold", isBalancedTotals(t) ? "text-success" : "text-foreground")}>
                                        {shownStatement.sides.map((side) => formatAmount(t[side.key] ?? 0)).join(" | ")}
                                    </span>
                                </span>
                            ))
                            : shownStatement.sides.map((side) => (
                                <span key={side.key} className="dc-numeric">
                                    <span className="text-muted-foreground">{side.label}: </span>
                                    <span className="font-semibold text-foreground">{showAmount(shownTotals[side.key] ?? 0)}</span>
                                </span>
                            ))}
                        {!isWorkingNote && (
                            <span className={cn("font-medium", isBalanced ? "text-success" : "text-muted-foreground")}>
                                {isBalanced ? "Balanced" : "Not balanced yet"}
                            </span>
                        )}
                    </div>

                    {isMultiStatement ? (
                        // Final Accounts: Trading A/c, P&L A/c and Balance Sheet as tabs sharing one entry pool.
                        <Tabs value={shownStatement.key} onValueChange={setActiveStatement}>
                            <TabsList className="flex-wrap">
                                {statements.map((statement) => (
                                    <TabsTrigger key={statement.key} value={statement.key} className="gap-1.5">
                                        {isStatementBalanced(statement.key) && <CheckCircle2 aria-hidden="true" className="size-4 text-success" />}
                                        {statement.label}
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                            {statements.map((statement) => (
                                <TabsContent key={statement.key} value={statement.key}>
                                    {renderStatement(statement)}
                                </TabsContent>
                            ))}
                        </Tabs>
                    ) : (
                        renderStatement(statements[0])
                    )}
                </div>
            </div>

            {/* Floating copy of the card under the pointer while dragging. */}
            <DragOverlay dropAnimation={null}>
                {dragging && (
                    <div className="flex items-center gap-2 rounded-lg border border-primary bg-white px-2.5 py-2 text-sm font-medium shadow-dc-lg">
                        <GripVertical aria-hidden="true" className="size-4 text-muted-foreground" />
                        {dragging.name}
                    </div>
                )}
            </DragOverlay>
        </DndContext>
    );
};

export { BalanceSheetBoard };
