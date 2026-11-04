import { Fragment } from "react";
import { Plus, X } from "lucide-react";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { cn } from "../../libs/utils";
import type { AccountingFormat } from "../../interfaces/interfaces";
import {
    AMOUNT_PATTERN,
    SIGNED_AMOUNT_PATTERN,
    getStatements,
    getTypedTotalSlots,
    isPrintedLine,
    newTypedRow,
    type TypedRow,
    type TypedSheet,
} from "./accountingUtils";

interface AmountInputProps {
    label: string;
    value: string;
    disabled?: boolean;
    // True accepts a leading minus sign (a net loss or a negative total).
    allowNegative?: boolean;
    onChange: (value: string) => void;
    className?: string;
}

// An amount box with the rupee sign; a negative figure turns red, as it prints in brackets on the result.
const AmountInput = ({ label, value, disabled, allowNegative = false, onChange, className }: AmountInputProps) => (
    <div className={cn("relative w-full md:w-40 md:shrink-0", className)}>
        <span aria-hidden="true" className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">₹</span>
        <Input
            aria-label={label}
            inputMode={allowNegative ? "text" : "decimal"}
            placeholder={allowNegative ? "Amount (− for loss)" : "Amount"}
            className={cn("dc-numeric h-9 pl-6 pr-2 text-right", value.trim().startsWith("-") && "text-destructive")}
            value={value}
            disabled={disabled}
            onChange={(event) => {
                const next = event.target.value.replace(/,/g, "");
                // Rejects keystrokes that would make the amount unparseable.
                if ((allowNegative ? SIGNED_AMOUNT_PATTERN : AMOUNT_PATTERN).test(next)) onChange(next);
            }}
        />
    </div>
);

export interface TypedWorkingNoteProps {
    format: AccountingFormat;
    sheet: TypedSheet;
    onSheetChange: (sheet: TypedSheet) => void;
    disabled?: boolean;
}

/**
 * The working note written out as in the exam: the printed Net Profit line, typed particulars and amounts under
 * Add and Less, and the totals the student works out. Nothing is dragged, so there is no entry pool.
 */
const TypedWorkingNote = ({ format, sheet, onSheetChange, disabled }: TypedWorkingNoteProps) => {
    const updateRow = (id: string, patch: Partial<TypedRow>) =>
        onSheetChange({ ...sheet, rows: sheet.rows.map((row) => (row.id === id ? { ...row, ...patch } : row)) });
    const addRow = (sectionKey: string) => onSheetChange({ ...sheet, rows: [...sheet.rows, newTypedRow(sectionKey)] });
    const removeRow = (id: string) => onSheetChange({ ...sheet, rows: sheet.rows.filter((row) => row.id !== id) });
    const updateTotal = (key: string, value: string) => onSheetChange({ ...sheet, totals: { ...sheet.totals, [key]: value } });

    // A total the student types, ruled off like a textbook total line.
    const renderTotal = (slot: { key: string; label: string }, isBottom: boolean) => (
        <div
            key={slot.key}
            className={cn(
                "flex flex-col gap-2 px-1 py-2 md:flex-row md:items-center md:justify-between",
                isBottom ? "border-t-2 border-double border-foreground/40" : "border-t border-border"
            )}
        >
            <span className="text-sm font-semibold text-foreground">{slot.label}</span>
            <AmountInput label={slot.label} value={sheet.totals[slot.key] ?? ""} disabled={disabled} allowNegative onChange={(value) => updateTotal(slot.key, value)} />
        </div>
    );

    return (
        <div className="flex flex-col gap-4">
            {getStatements(format).flatMap((statement) =>
                statement.sides.map((side) => {
                    const slots = getTypedTotalSlots(side);
                    return (
                        <Card key={side.key} className="flex flex-col gap-3 p-3 sm:p-4">
                            <div className="flex flex-col gap-1 border-b border-border pb-2">
                                <h3 className="dc-label">{side.label}</h3>
                                <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                                    <span>Particulars</span>
                                    <span>Amount (₹)</span>
                                </div>
                            </div>

                            {side.sections.map((section) => {
                                const rows = sheet.rows.filter((row) => row.sectionKey === section.key);
                                return (
                                    <Fragment key={section.key}>
                                        {isPrintedLine(section) ? (
                                            // The printed line: its wording is given, only the figure is typed.
                                            rows.slice(0, 1).map((row) => (
                                                <div key={row.id} className="flex flex-col gap-2 px-1 md:flex-row md:items-center md:justify-between">
                                                    <span className="text-sm font-medium text-foreground">{section.label}</span>
                                                    <AmountInput label={section.label} value={row.amount} disabled={disabled} allowNegative onChange={(amount) => updateRow(row.id, { amount })} />
                                                </div>
                                            ))
                                        ) : (
                                            <div className="flex flex-col gap-2 rounded-lg border border-dashed border-border bg-surface p-2.5">
                                                <h4 className="text-sm font-semibold text-foreground">{section.label}</h4>
                                                <ul className="flex flex-col gap-2">
                                                    {rows.map((row, index) => (
                                                        <li key={row.id} className="flex flex-col gap-2 rounded-lg border border-border bg-white p-2 shadow-dc-xs md:flex-row md:items-center">
                                                            <Input
                                                                aria-label={`${section.label}: particular ${index + 1}`}
                                                                placeholder="Particular, e.g. Transfer to Reserves"
                                                                className="h-9 min-w-0 flex-1"
                                                                maxLength={191}
                                                                value={row.name}
                                                                disabled={disabled}
                                                                onChange={(event) => updateRow(row.id, { name: event.target.value })}
                                                            />
                                                            <div className="flex items-center gap-1.5">
                                                                <AmountInput
                                                                    label={`${section.label}: amount ${index + 1}`}
                                                                    value={row.amount}
                                                                    disabled={disabled}
                                                                    onChange={(amount) => updateRow(row.id, { amount })}
                                                                    className="flex-1"
                                                                />
                                                                {/* The last row of a head stays, so there is always a row to type into. */}
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    aria-label={`Remove row ${index + 1} of ${section.label}`}
                                                                    disabled={disabled || rows.length === 1}
                                                                    onClick={() => removeRow(row.id)}
                                                                    className="size-9 shrink-0"
                                                                >
                                                                    <X aria-hidden="true" className="size-4" />
                                                                </Button>
                                                            </div>
                                                        </li>
                                                    ))}
                                                </ul>
                                                <Button type="button" variant="secondary" size="sm" className="self-start" disabled={disabled} onClick={() => addRow(section.key)}>
                                                    <Plus aria-hidden="true" />
                                                    Add row
                                                </Button>
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
        </div>
    );
};

export { TypedWorkingNote };
