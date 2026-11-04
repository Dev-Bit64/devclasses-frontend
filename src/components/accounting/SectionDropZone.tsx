import { memo, type ReactNode } from "react";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { GripVertical, MinusCircle, PlusCircle, X } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { cn } from "../../libs/utils";
import type { AccountingColumn } from "../../interfaces/interfaces";
import { AMOUNT_PATTERN, lineKey, type BoardLine } from "./accountingUtils";

interface PlacedEntryRowProps {
    line: BoardLine;
    disabled?: boolean;
    // Partner columns of a columnar statement; absent for one amount per line.
    columns?: AccountingColumn[] | null;
    // Indian T-account wording before the name ("To" on Dr., "By" on Cr.); absent on a Balance Sheet.
    prefix?: "To" | "By";
    // False hides the Add/Less toggle (Final Accounts without adjustments).
    allowDeduction?: boolean;
    // True when the head fixes the sign (e.g. "Less: Items to be Deducted"), so neither the toggle nor "Less:" is shown.
    signFixed?: boolean;
    onChange: (key: string, patch: Partial<BoardLine>) => void;
    onRemove: (key: string) => void;
}

// A line on the sheet: drag handle, name, Add/Less toggle, amount (or one per partner) and remove.
const PlacedEntryRow = memo(({ line, disabled, columns, prefix, allowDeduction = true, signFixed = false, onChange, onRemove }: PlacedEntryRowProps) => {
    const key = lineKey(line);
    const isColumnar = Boolean(columns && columns.length > 0);
    // Only the handle starts a drag, so typing in the amount box never picks the line up.
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: `line:${key}`,
        data: { entryId: line.entryId, name: line.name, lineKey: key },
        disabled,
    });

    return (
        <li
            ref={setNodeRef}
            className={cn(
                "flex flex-wrap items-center gap-2 rounded-lg border border-border bg-white px-2 py-1.5 shadow-dc-xs",
                !isColumnar && "sm:flex-nowrap",
                isDragging && "opacity-40"
            )}
        >
            <button
                type="button"
                {...listeners}
                {...attributes}
                aria-label={`Move ${line.name}`}
                disabled={disabled}
                className="grid size-8 shrink-0 touch-none place-items-center rounded-md text-muted-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
                <GripVertical aria-hidden="true" className="size-4" />
            </button>

            <span className="min-w-0 flex-1 break-words text-sm font-medium text-foreground">
                {prefix && <span className="mr-1 font-normal text-muted-foreground">{prefix}</span>}
                {line.isDeduction && !signFixed && <span className="mr-1 text-destructive">Less:</span>}
                {line.name}
            </span>

            <div className="ml-auto flex items-center gap-1.5">
                {/* Toggles whether the amount is added to or deducted from the head; hidden where no deductions exist or the head fixes the sign. */}
                {allowDeduction && !signFixed && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        aria-pressed={line.isDeduction}
                        aria-label={line.isDeduction ? `${line.name}: deducted (Less)` : `${line.name}: added`}
                        disabled={disabled}
                        onClick={() => onChange(key, { isDeduction: !line.isDeduction })}
                        className={cn("h-8 px-2 text-xs", line.isDeduction ? "text-destructive" : "text-muted-foreground")}
                    >
                        {line.isDeduction ? <MinusCircle aria-hidden="true" /> : <PlusCircle aria-hidden="true" />}
                        {line.isDeduction ? "Less" : "Add"}
                    </Button>
                )}

                {!isColumnar && (
                    <div className="relative w-32">
                        <span aria-hidden="true" className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">₹</span>
                        <Input
                            aria-label={`Amount for ${line.name}`}
                            inputMode="decimal"
                            placeholder="Amount"
                            className="dc-numeric h-8 pl-6 pr-2 text-right"
                            value={line.amount}
                            disabled={disabled}
                            invalid={line.amount.trim() === ""}
                            onChange={(event) => {
                                const value = event.target.value.replace(/,/g, "");
                                // Rejects keystrokes that would make the amount unparseable.
                                if (AMOUNT_PATTERN.test(value)) onChange(key, { amount: value });
                            }}
                        />
                    </div>
                )}

                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`Return ${line.name} to the pool`}
                    disabled={disabled}
                    onClick={() => onRemove(key)}
                    className="size-8"
                >
                    <X aria-hidden="true" className="size-4" />
                </Button>
            </div>

            {/* One amount per partner; stacked two to a row on phones, inline from md upwards. Blank means "not for this partner". */}
            {isColumnar && (
                <div className="grid w-full grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
                    {columns!.map((column) => (
                        <label key={column.key} className="flex flex-col gap-0.5 text-xs font-medium text-muted-foreground">
                            {column.label}
                            <Input
                                aria-label={`Amount for ${line.name}, ${column.label}`}
                                inputMode="decimal"
                                placeholder="—"
                                className="dc-numeric h-8 px-2 text-right"
                                value={line.amounts?.[column.key] ?? ""}
                                disabled={disabled}
                                onChange={(event) => {
                                    const value = event.target.value.replace(/,/g, "");
                                    if (AMOUNT_PATTERN.test(value)) onChange(key, { amounts: { ...line.amounts, [column.key]: value } });
                                }}
                            />
                        </label>
                    ))}
                </div>
            )}
        </li>
    );
});
PlacedEntryRow.displayName = "PlacedEntryRow";

export interface SectionDropZoneProps {
    sectionKey: string;
    label: string;
    lines: BoardLine[];
    // Name of the entry chosen for tap-to-place, if any.
    selectedName?: string | null;
    disabled?: boolean;
    // Partner columns of a columnar statement; absent for one amount per line.
    columns?: AccountingColumn[] | null;
    // Indian T-account wording for this side's lines ("To" on Dr., "By" on Cr.).
    prefix?: "To" | "By";
    // False hides the Add/Less toggle on every line (Final Accounts without adjustments).
    allowDeduction?: boolean;
    // True when the head fixes every line's sign (e.g. "(C) Less: Items to be Deducted").
    signFixed?: boolean;
    // Hides the head's name when the side is one plain "Particulars" column, as in a textbook T-account.
    hideLabel?: boolean;
    // Head's net total for the outer amount column (Indian inner/outer columns); absent hides it.
    subtotal?: ReactNode;
    onPlaceSelected: (sectionKey: string) => void;
    onLineChange: (key: string, patch: Partial<BoardLine>) => void;
    onLineRemove: (key: string) => void;
}

/** One head of the statement (e.g. Current Assets) that entries are dropped into. */
const SectionDropZone = ({
    sectionKey,
    label,
    lines,
    selectedName,
    disabled,
    columns,
    prefix,
    allowDeduction = true,
    signFixed = false,
    hideLabel = false,
    subtotal,
    onPlaceSelected,
    onLineChange,
    onLineRemove,
}: SectionDropZoneProps) => {
    const { setNodeRef, isOver } = useDroppable({ id: `section:${sectionKey}`, disabled });

    return (
        <div
            ref={setNodeRef}
            className={cn(
                "flex flex-col gap-2 rounded-lg border border-dashed p-2.5 transition-colors",
                isOver ? "border-primary bg-accent/60" : "border-border bg-surface"
            )}
        >
            <div className="flex items-center justify-between gap-2">
                {hideLabel ? <span className="sr-only">{label}</span> : <h4 className="text-sm font-semibold text-foreground">{label}</h4>}
                {/* Tap-to-place target, shown only while an entry is selected. */}
                {selectedName && !disabled && (
                    <Button type="button" size="sm" variant="secondary" className="h-8 px-2.5 text-xs" onClick={() => onPlaceSelected(sectionKey)}>
                        Place here
                        <span className="sr-only">: {selectedName}</span>
                    </Button>
                )}
            </div>

            {lines.length > 0 ? (
                <ul className="flex flex-col gap-1.5">
                    {lines.map((line) => (
                        <PlacedEntryRow
                            key={lineKey(line)}
                            line={line}
                            disabled={disabled}
                            columns={columns}
                            prefix={prefix}
                            allowDeduction={allowDeduction}
                            signFixed={signFixed}
                            onChange={onLineChange}
                            onRemove={onLineRemove}
                        />
                    ))}
                </ul>
            ) : (
                <p className="py-2 text-center text-xs text-muted-foreground">Drop entries here</p>
            )}

            {/* Outer column: the head's net amount, carried to the side total as in Indian textbooks. */}
            {subtotal && lines.length > 0 && (
                <div className="flex items-center justify-end gap-2 border-t border-dashed border-border pt-1.5 text-sm">
                    <span className="text-xs text-muted-foreground">{label}</span>
                    <span className="dc-numeric font-semibold text-foreground">{subtotal}</span>
                </div>
            )}
        </div>
    );
};

export { SectionDropZone };
