import { cn } from "../../libs/utils";
import { formatSignedAmount } from "./accountingUtils";

export interface SignedAmountProps {
    value: number;
    // True prints a negative amount in red brackets, e.g. (₹4,00,000); false prints exactly formatAmount, as every older type does.
    inBrackets?: boolean;
    className?: string;
}

/** An amount in Indian digit grouping; Cash Flow types show negatives in red brackets. */
const SignedAmount = ({ value, inBrackets = false, className }: SignedAmountProps) => (
    <span className={cn(inBrackets && value < 0 && "text-destructive", className)}>{formatSignedAmount(value, inBrackets)}</span>
);

export { SignedAmount };
