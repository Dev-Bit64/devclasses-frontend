import { RadioGroupItem } from "../ui/radio-group";
import { cn } from "../../libs/utils";

export interface AnswerOptionProps {
  // Standardised OPTION[A-D] value submitted with the exam.
  value: string;
  // Display letter, e.g. "A".
  letter: string;
  label: string;
  id: string;
  selected: boolean;
}

/**
 * A single MCQ choice. Sized for comfortable touch targets and selectable by clicking
 * anywhere in the row; arrow-key navigation comes from the surrounding RadioGroup.
 */
const AnswerOption = ({ value, letter, label, id, selected }: AnswerOptionProps) => (
  <label
    htmlFor={id}
    className={cn(
      "flex min-h-[56px] cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition-colors sm:gap-4 sm:p-4",
      "hover:bg-muted/60 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-offset-2",
      selected ? "border-primary bg-accent" : "border-border bg-card"
    )}
  >
    <RadioGroupItem id={id} value={value} className="mt-0.5 shrink-0" />
    <span
      aria-hidden="true"
      className={cn(
        "grid size-6 shrink-0 place-items-center rounded-md text-xs font-bold",
        selected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
      )}
    >
      {letter}
    </span>
    {/* Long options wrap and images inside them scale, so nothing is ever clipped. */}
    <span className="min-w-0 flex-1 break-words text-sm leading-relaxed text-foreground sm:text-base">
      {label}
    </span>
  </label>
);

export { AnswerOption };
