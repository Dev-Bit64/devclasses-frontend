import { Fragment } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { Card } from "../ui/card";
import { cn } from "../../libs/utils";
import type { AccountingFormat, AccountingGradedItem } from "../../interfaces/interfaces";
import { REASON_LABELS, getStatements, getTypedTotalSlots, isPrintedLine } from "./accountingUtils";
import { SignedAmount } from "./SignedAmount";

export interface WorkingNoteReviewProps {
    format: AccountingFormat;
    items: AccountingGradedItem[];
}

// Signed figure of a graded line: a "Less" line or a net loss counts as negative.
const signed = (line: AccountingGradedItem["placed"]) => (line ? (line.isDeduction ? -line.amount : line.amount) : 0);

// Order of a typed row ("typed-<n>"), so rows are shown back exactly as the student typed them.
const typedOrder = (item: AccountingGradedItem) => Number(item.lineId?.replace("typed-", "") ?? 0);

/**
 * The student's working note as they typed it, each row and total green when correct and red when wrong,
 * followed by any answer lines they left out.
 */
const WorkingNoteReview = ({ format, items }: WorkingNoteReviewProps) => {
    const inBrackets = format.negativesInBrackets === true;
    // Rows the student typed (not totals), in typing order.
    const typedRows = items.filter((item) => item.placed && !item.isTotal).sort((a, b) => typedOrder(a) - typedOrder(b));
    const totalByKey = new Map(items.filter((item) => item.isTotal && item.lineId).map((item) => [item.lineId!, item]));
    const missedLines = items.filter((item) => item.status === "MISSED" && !item.isTotal);
    const headLabel = new Map(getStatements(format).flatMap((statement) => statement.sides.flatMap((side) => side.sections.map((section) => [section.key, section.label]))));

    // One row in the student's own words, green when correct and red when wrong, with the reason for a wrong one.
    const renderRow = (item: AccountingGradedItem, label: string) => {
        const isCorrect = item.status === "CORRECT";
        return (
            <li
                key={item.lineId}
                className={cn(
                    "flex flex-col gap-1 rounded-lg border px-3 py-2 text-sm md:flex-row md:items-center md:justify-between md:gap-3",
                    isCorrect ? "border-success/30 bg-success/5" : "border-destructive/30 bg-destructive/5"
                )}
            >
                <span className="flex min-w-0 items-start gap-2">
                    {isCorrect ? (
                        <CheckCircle2 aria-label="Correct" className="mt-0.5 size-4 shrink-0 text-success" />
                    ) : (
                        <XCircle aria-label="Wrong" className="mt-0.5 size-4 shrink-0 text-destructive" />
                    )}
                    <span className="flex min-w-0 flex-col">
                        <span className="break-words font-medium text-foreground">{label}</span>
                        {item.reason && <span className="text-xs text-destructive">{REASON_LABELS[item.reason]}</span>}
                    </span>
                </span>
                <span className="dc-numeric shrink-0 pl-6 font-medium md:pl-0">
                    <SignedAmount value={signed(item.placed)} inBrackets={inBrackets} />
                </span>
            </li>
        );
    };

    // A total the student typed: green when it equals the correct total, red otherwise, with the correct figure beside a wrong or blank one.
    const renderTotal = (slot: { key: string; label: string }, isBottom: boolean) => {
        const item = totalByKey.get(slot.key);
        if (!item) return null;
        const isCorrect = item.status === "CORRECT";
        return (
            <div
                key={slot.key}
                className={cn(
                    "flex flex-col gap-1 rounded-lg border px-3 py-2 text-sm font-semibold md:flex-row md:items-center md:justify-between md:gap-3",
                    isCorrect ? "border-success/30 bg-success/5" : "border-destructive/30 bg-destructive/5",
                    isBottom && "border-2"
                )}
            >
                <span className="flex min-w-0 items-start gap-2">
                    {isCorrect ? (
                        <CheckCircle2 aria-label="Correct" className="mt-0.5 size-4 shrink-0 text-success" />
                    ) : (
                        <XCircle aria-label="Wrong" className="mt-0.5 size-4 shrink-0 text-destructive" />
                    )}
                    <span className="break-words text-foreground">{slot.label}</span>
                </span>
                <span className="dc-numeric flex shrink-0 flex-col items-start pl-6 md:items-end md:pl-0">
                    {item.placed ? <SignedAmount value={signed(item.placed)} inBrackets={inBrackets} /> : <span className="text-destructive">Not answered</span>}
                    {!isCorrect && (
                        <span className="text-xs font-normal text-muted-foreground">
                            Correct: <SignedAmount value={signed(item.expected)} inBrackets={inBrackets} />
                        </span>
                    )}
                </span>
            </div>
        );
    };

    return (
        <div className="flex flex-col gap-4">
            {getStatements(format).flatMap((statement) =>
                statement.sides.map((side) => {
                    const slots = getTypedTotalSlots(side);
                    return (
                        <Card key={side.key} className="flex flex-col gap-3 p-4">
                            <div className="flex flex-col gap-1 border-b border-border pb-2">
                                <h3 className="dc-label">{side.label}</h3>
                                <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                                    <span>Particulars</span>
                                    <span>Amount (₹)</span>
                                </div>
                            </div>
                            {side.sections.map((section) => {
                                const rows = typedRows.filter((item) => item.placed!.sectionKey === section.key);
                                return (
                                    <Fragment key={section.key}>
                                        {isPrintedLine(section) ? (
                                            // The printed line is shown with its own wording, since only its figure was typed.
                                            rows.length > 0 && <ul className="flex flex-col gap-1.5">{rows.map((item) => renderRow(item, section.label))}</ul>
                                        ) : (
                                            <div className="flex flex-col gap-1.5">
                                                <h4 className="text-sm font-semibold text-foreground">{section.label}</h4>
                                                {rows.length > 0 ? (
                                                    <ul className="flex flex-col gap-1.5">{rows.map((item) => renderRow(item, item.typedName || "Untitled row"))}</ul>
                                                ) : (
                                                    <p className="text-xs text-muted-foreground">Nothing typed here.</p>
                                                )}
                                            </div>
                                        )}
                                        {slots.afterSection.get(section.key)?.map((slot) => renderTotal(slot, false))}
                                    </Fragment>
                                );
                            })}
                            {renderTotal(slots.bottom, true)}
                        </Card>
                    );
                })
            )}

            {/* Answer lines the student never typed, so nothing that cost a mark is hidden. */}
            {missedLines.length > 0 && (
                <Card className="flex flex-col gap-2 p-4">
                    <h3 className="dc-label">Missed lines</h3>
                    <ul className="flex flex-col gap-1.5">
                        {missedLines.map((item) => (
                            <li
                                key={`missed-${item.entryId}`}
                                className="flex flex-col gap-1 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm md:flex-row md:items-center md:justify-between md:gap-3"
                            >
                                <span className="flex min-w-0 flex-col">
                                    <span className="break-words font-medium text-foreground">{item.name}</span>
                                    <span className="text-xs text-muted-foreground">{headLabel.get(item.expected?.sectionKey ?? "") ?? ""}</span>
                                </span>
                                <span className="dc-numeric shrink-0 font-medium">
                                    <SignedAmount value={signed(item.expected)} inBrackets={inBrackets} />
                                </span>
                            </li>
                        ))}
                    </ul>
                </Card>
            )}
        </div>
    );
};

export { WorkingNoteReview };
