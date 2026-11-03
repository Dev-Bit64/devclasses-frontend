import type { AccountingBoard, AccountingFormat, AccountingGradedItem, AccountingSide, AccountingStatement } from "../../interfaces/interfaces";

// Anything with sides to total: a single-statement format or one statement of Final Accounts.
type SideHolder = { sides: AccountingSide[] };

// One statement line while the student is still editing it; the amount stays a string
// so a half-typed value such as "1500." is not lost on re-render.
export interface BoardLine {
    entryId: string;
    name: string;
    sectionKey: string;
    amount: string;
    isDeduction: boolean;
    // Per-partner amounts of a columnar statement, keyed by column; unused for single-column ones.
    amounts?: Record<string, string>;
}

// A line is one entry under one head; columnar statements and Final Accounts may hold the same entry under two heads.
export const lineKey = (line: { entryId: string; sectionKey: string }) => `${line.entryId}|${line.sectionKey}`;

// The two boards that set accounting questions.
export const BOARD_OPTIONS: { label: string; value: AccountingBoard }[] = [
    { label: "GSEB", value: "GSEB" },
    { label: "CBSE", value: "CBSE" },
];

// Same standard choices as the MCQ question form.
export const STANDARD_OPTIONS = [
    { label: "11th", value: "11th" },
    { label: "12th", value: "12th" },
];

// Standards compared by their number, so "12th", "12" and "12th Grade" all match.
export const normalizeStandard = (standard: string | null | undefined) => (standard ?? "").match(/\d+/)?.[0] ?? (standard ?? "").trim();

// Badge label of a statement type from the server catalog, falling back to its key.
export const getFormatLabel = (formats: AccountingFormat[], key: string) => {
    const format = formats.find((f) => f.key === key);
    return format?.shortLabel ?? format?.label ?? key;
};

// Whether the two sides sit next to each other; older servers without layout imply it from the key.
export const isSideBySide = (format: AccountingFormat) => (format.layout ? format.layout === "SIDE_BY_SIDE" : format.key === "HORIZONTAL");

// The statements of a format; a single-statement type is one statement with key ''.
export const getStatements = (format: AccountingFormat): AccountingStatement[] =>
    format.statements ?? [{ key: "", label: format.label, layout: format.layout, sides: format.sides }];

// Whether one statement's sides sit next to each other (Indian T-form) or stack (Schedule III).
export const isStatementSideBySide = (format: AccountingFormat, statement: AccountingStatement) =>
    statement.layout ? statement.layout === "SIDE_BY_SIDE" : isSideBySide(format);

// Section key → statement key ('' for single-statement types).
export const getSectionStatements = (format: AccountingFormat | null | undefined) => {
    const statements = new Map<string, string>();
    if (format) getStatements(format).forEach((statement) => statement.sides.forEach((side) => side.sections.forEach((section) => statements.set(section.key, statement.key))));
    return statements;
};

// Whether lines of this format may be marked "Less"; Final Accounts without adjustments may not.
export const allowsDeduction = (format: AccountingFormat | null | undefined) => format?.allowsDeduction !== false;

// Whether lines under one head may be marked "Less"; the head's own setting wins, else the format's (mirrors the server).
export const sectionAllowsDeduction = (format: AccountingFormat | null | undefined, sectionKey: string) => {
    const section = format
        ? getStatements(format).flatMap((statement) => statement.sides.flatMap((side) => side.sections)).find((candidate) => candidate.key === sectionKey)
        : undefined;
    return section?.allowsDeduction ?? allowsDeduction(format);
};

// Indian date (dd/mm/yyyy) and date-time, whatever the browser's locale.
export const formatDate = (value: string | Date) => new Date(value).toLocaleDateString("en-IN");
export const formatDateTime = (value: string | Date) => new Date(value).toLocaleString("en-IN");

// Up to 12 whole digits and 2 decimals — mirrors the server's DECIMAL(14,2) column.
export const AMOUNT_PATTERN = /^\d{0,12}(\.\d{0,2})?$/;

// Parses a typed amount; blank or malformed input counts as zero.
export const parseAmount = (value: string) => {
    const parsed = Number(value);
    return value.trim() === "" || Number.isNaN(parsed) ? 0 : parsed;
};

// Indian digit grouping (₹1,25,000.50), matching how textbooks print figures.
export const formatAmount = (value: number) =>
    `₹${value.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

// Section key → readable label, prefixed with its main head when the format has one, and with the
// statement and side for Final Accounts (e.g. "Trading Account — Dr.").
export const getSectionLabels = (format: AccountingFormat | null | undefined) => {
    const labels = new Map<string, string>();
    if (!format) return labels;
    const statements = getStatements(format);
    statements.forEach((statement) =>
        statement.sides.forEach((side) =>
            side.sections.forEach((section) => {
                const head = section.group ? `${section.group} › ${section.label}` : section.label;
                if (statements.length === 1) return labels.set(section.key, head);
                // A side with one plain "Particulars" column is named by its side alone.
                labels.set(section.key, side.sections.length === 1 ? `${statement.label} — ${side.label}` : `${statement.label} — ${head}`);
            })
        )
    );
    return labels;
};

// Section key → side key, used to total each side of the sheet.
export const getSectionSides = (holder: SideHolder | null | undefined) => {
    const sides = new Map<string, string>();
    holder?.sides.forEach((side) => side.sections.forEach((section) => sides.set(section.key, side.key)));
    return sides;
};

// Signed side totals in whole paise, so floating point never breaks the "balanced" check.
export const sumBySide = (
    format: SideHolder | null | undefined,
    lines: { sectionKey: string; amount: number; isDeduction: boolean }[]
) => {
    const sideOf = getSectionSides(format);
    const paise: Record<string, number> = {};
    format?.sides.forEach((side) => (paise[side.key] = 0));
    lines.forEach((line) => {
        const side = sideOf.get(line.sectionKey);
        if (!side) return;
        const value = Math.round(line.amount * 100);
        paise[side] += line.isDeduction ? -value : value;
    });
    return Object.fromEntries(Object.entries(paise).map(([key, value]) => [key, value / 100]));
};

// Side totals of one partner column, read from each line's per-partner amount.
export const sumColumnBySide = (format: SideHolder | null | undefined, lines: BoardLine[], columnKey: string) =>
    sumBySide(
        format,
        lines.map((line) => ({ sectionKey: line.sectionKey, amount: parseAmount(line.amounts?.[columnKey] ?? ""), isDeduction: line.isDeduction }))
    );

// Whether every side of a totals map carries the same amount.
export const isBalancedTotals = (totals: Record<string, number>) => {
    const values = Object.values(totals);
    return values.length > 0 && values.every((value) => value === values[0]);
};

// Human wording for why a graded line was marked wrong.
export const REASON_LABELS: Record<NonNullable<AccountingGradedItem["reason"]>, string> = {
    NOT_IN_ANSWER: "Not part of this statement",
    WRONG_SECTION: "Placed under the wrong head",
    WRONG_AMOUNT: "Wrong amount",
    WRONG_SIGN: "Add / Less is wrong",
};
