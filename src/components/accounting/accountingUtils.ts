import type {
    AccountingBoard,
    AccountingFormat,
    AccountingGradedItem,
    AccountingSection,
    AccountingSide,
    AccountingStatement,
    AccountingTypedLine,
    AccountingTypedTotal,
} from "../../interfaces/interfaces";

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

// A head's definition by key, across every statement of the format.
const findSection = (format: AccountingFormat | null | undefined, sectionKey: string) =>
    format ? getStatements(format).flatMap((statement) => statement.sides.flatMap((side) => side.sections)).find((section) => section.key === sectionKey) : undefined;

// Fixed sign of a head ("ADD" or "LESS"); undefined lets each line under it choose.
export const sectionSign = (format: AccountingFormat | null | undefined, sectionKey: string) => findSection(format, sectionKey)?.sign;

// The "Less" flag a line really carries: a head with a fixed sign decides it, otherwise the line's own choice stands (mirrors the server).
export const resolveDeduction = (format: AccountingFormat | null | undefined, sectionKey: string, isDeduction: boolean) => {
    const sign = sectionSign(format, sectionKey);
    return sign ? sign === "LESS" : isDeduction;
};

// Whether students type their answer (names, amounts and totals) instead of dragging pool entries.
export const isTypedAnswer = (format: AccountingFormat | null | undefined) => format?.answerMode === "TYPED";

// A typed amount that may start with a minus sign (a net loss or a negative total); otherwise as AMOUNT_PATTERN.
export const SIGNED_AMOUNT_PATTERN = /^-?\d{0,12}(\.\d{0,2})?$/;

// Totals a student types on one side, keyed as the server marks them: running totals after their head, then the bottom line.
export const getTypedTotalSlots = (side: AccountingSide) => ({
    afterSection: new Map(
        side.sections.map((section) => [section.key, (section.runningTotals ?? []).map((total, index) => ({ key: `${section.key}#${index}`, label: total.label }))])
    ),
    bottom: { key: `side:${side.key}`, label: side.totalLabel ?? "Total" },
});

// One row the student is typing; the amount stays a string so a half-typed value such as "-" or "1500." is kept.
export interface TypedRow {
    id: string;
    sectionKey: string;
    name: string;
    amount: string;
}

// Everything typed on the sheet: the rows, and each total keyed as the server marks it ("<section>#<index>" or "side:<side>").
export interface TypedSheet {
    rows: TypedRow[];
    totals: Record<string, string>;
}

// Unique row ids for React keys; they never leave the browser.
let typedRowCounter = 0;
export const newTypedRow = (sectionKey: string): TypedRow => ({ id: `row-${++typedRowCounter}`, sectionKey, name: "", amount: "" });

// A blank sheet: one empty row under every head, ready to type into.
export const createTypedSheet = (format: AccountingFormat): TypedSheet => ({
    rows: getStatements(format).flatMap((statement) => statement.sides.flatMap((side) => side.sections.map((section) => newTypedRow(section.key)))),
    totals: {},
});

// A head without a fixed sign (e.g. "Net Profit as per Statement of P&L") is one printed line whose figure may be a net loss.
export const isPrintedLine = (section: AccountingSection) => !section.sign;

// The rows and totals to submit: untouched rows are left out, and a row with a name but no amount is sent as zero, so it is marked wrong.
export const toTypedAnswer = (format: AccountingFormat, sheet: TypedSheet): { typedLines: AccountingTypedLine[]; typedTotals: AccountingTypedTotal[] } => {
    const sections = new Map(getStatements(format).flatMap((statement) => statement.sides.flatMap((side) => side.sections.map((section) => [section.key, section]))));
    return {
        typedLines: sheet.rows
            .filter((row) => row.name.trim() !== "" || row.amount.trim() !== "")
            .map((row) => {
                const section = sections.get(row.sectionKey);
                // A printed line carries its head's wording, since the student only types its figure.
                const name = section && isPrintedLine(section) ? section.label : row.name.trim();
                return { sectionKey: row.sectionKey, name, amount: parseAmount(row.amount) };
            }),
        typedTotals: Object.entries(sheet.totals)
            .filter(([, amount]) => amount.trim() !== "")
            .map(([key, amount]) => ({ key, amount: parseAmount(amount) })),
    };
};

// Counts what will lose marks on submit: rows with a name but no amount, and totals left blank.
export const countIncompleteTyping = (format: AccountingFormat, sheet: TypedSheet) => {
    const slotKeys = getStatements(format).flatMap((statement) =>
        statement.sides.flatMap((side) => {
            const slots = getTypedTotalSlots(side);
            return [...[...slots.afterSection.values()].flat().map((slot) => slot.key), slots.bottom.key];
        })
    );
    return {
        rowsWithoutAmount: sheet.rows.filter((row) => row.name.trim() !== "" && row.amount.trim() === "").length,
        blankTotals: slotKeys.filter((key) => (sheet.totals[key] ?? "").trim() === "").length,
    };
};

// Whether a format is a one-column working note that ends in a result instead of balancing.
export const isComputation = (format: AccountingFormat | null | undefined) => format?.kind === "COMPUTATION";

// Whether a pool entry is left out of this format (e.g. non-profit items in cash flow questions); compared case-insensitively.
export const isEntryExcluded = (format: AccountingFormat | null | undefined, name: string) =>
    Boolean(format?.excludedEntries?.some((excluded) => excluded.toLowerCase() === name.trim().toLowerCase()));

// Running totals printed after each head, keyed by head: GROUP adds up its main head so far, SIDE the whole side so far.
export const getRunningTotals = (side: AccountingSide, lines: { sectionKey: string; amount: number; isDeduction: boolean }[]) => {
    const totals = new Map<string, { label: string; value: number }[]>();
    let sidePaise = 0;
    let groupPaise = 0;
    let group: string | undefined;
    side.sections.forEach((section) => {
        // A new main head (e.g. "II. Cash Flow from Investing Activities") starts its own running total.
        if (section.group !== group) {
            group = section.group;
            groupPaise = 0;
        }
        const net = lines
            .filter((line) => line.sectionKey === section.key)
            .reduce((sum, line) => sum + Math.round(line.amount * 100) * (line.isDeduction ? -1 : 1), 0);
        sidePaise += net;
        groupPaise += net;
        if (section.runningTotals?.length) {
            totals.set(section.key, section.runningTotals.map((total) => ({ label: total.label, value: (total.scope === "GROUP" ? groupPaise : sidePaise) / 100 })));
        }
    });
    return totals;
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

// A negative amount in brackets, e.g. (₹4,00,000), as Cash Flow Statements print outflows; otherwise exactly formatAmount.
export const formatSignedAmount = (value: number, inBrackets: boolean) => (inBrackets && value < 0 ? `(${formatAmount(-value)})` : formatAmount(value));

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
