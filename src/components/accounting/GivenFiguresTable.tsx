import type { AccountingGivenTable } from "../../interfaces/interfaces";
import { SignedAmount } from "./SignedAmount";

export interface GivenFiguresTableProps {
    table: AccountingGivenTable;
}

// One figure of the table: blank or zero prints as '-', a negative prints in red brackets.
const Figure = ({ value }: { value: number | null }) =>
    value === null || value === 0 ? <span>-</span> : <SignedAmount value={value} inBrackets />;

/**
 * The given figures of a question, laid out as the textbook prints them: particulars and two amount columns
 * (e.g. closing and opening balances), with any additional information below. On a phone the table scrolls
 * sideways inside its own box, so the page never does.
 */
const GivenFiguresTable = ({ table }: GivenFiguresTableProps) => (
    <div className="flex flex-col gap-3">
        <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full min-w-[420px] border-collapse text-sm">
                <thead className="bg-surface">
                    <tr className="border-b border-border">
                        <th scope="col" className="px-3 py-2 text-left font-semibold text-foreground">Particulars</th>
                        <th scope="col" className="w-36 border-l border-border px-3 py-2 text-right font-semibold text-foreground">{table.firstHeading}</th>
                        <th scope="col" className="w-36 border-l border-border px-3 py-2 text-right font-semibold text-foreground">{table.secondHeading}</th>
                    </tr>
                </thead>
                <tbody>
                    {table.rows.map((row, index) => (
                        <tr key={index} className="border-b border-border last:border-b-0">
                            <th scope="row" className="break-words px-3 py-2 text-left font-normal text-foreground">{row.particular}</th>
                            <td className="dc-numeric border-l border-border px-3 py-2 text-right text-foreground"><Figure value={row.first} /></td>
                            <td className="dc-numeric border-l border-border px-3 py-2 text-right text-foreground"><Figure value={row.second} /></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        {table.note && <p className="whitespace-pre-line break-words text-sm leading-relaxed text-foreground">{table.note}</p>}
    </div>
);

export { GivenFiguresTable };
