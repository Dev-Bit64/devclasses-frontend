import { Check, CircleDot, MoveRight, X } from "lucide-react";
import { Section, SectionHeading } from "./primitives/Section";
import { Reveal } from "./primitives/Reveal";
import { cn } from "../../libs/utils";

/** Illustrative review screen — shows how a submitted paper is walked back through. */
const REVIEW_ROWS = [
  { question: "Goodwill is classified as which type of asset?", yours: "Intangible asset", correct: true },
  { question: "Which account is debited on purchase of machinery?", yours: "Purchases A/c", correct: false, answer: "Machinery A/c" },
  { question: "Under which head does 'Bills Payable' appear?", yours: "Current liabilities", correct: true },
];

const POINTS = [
  "One question on screen at a time, so nothing competes for your attention",
  "Move forward and back through the paper before you submit",
  "Every answer marked against the correct one the moment you finish",
];

export const PracticeSection = () => (
  <Section id="practice">
    <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
      <div>
        <SectionHeading
          align="left"
          eyebrow="Practice"
          title={
            <>
              Learn it. Practise it.
              <span className="block text-primary">Master it.</span>
            </>
          }
          description="Attempt MCQs drawn from the chapter you have just studied, then review the whole paper question by question to see precisely where marks were lost."
        />

        <Reveal delay={0.1} className="mt-8">
          <ul className="flex flex-col gap-3.5">
            {POINTS.map((point) => (
              <li key={point} className="flex items-start gap-3">
                <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-700">
                  <Check aria-hidden="true" className="size-3" />
                </span>
                <span className="text-sm leading-relaxed text-muted-foreground sm:text-[0.95rem]">
                  {point}
                </span>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>

      {/* Review-screen preview */}
      <Reveal delay={0.12} className="relative">
        <p className="sr-only">
          Preview of the answer review screen, listing each question with the answer given and the
          correct answer.
        </p>
        <div
          aria-hidden="true"
          className="rounded-2xl border border-border bg-white p-5 shadow-dc-lg sm:p-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
            <div>
              <p className="text-sm font-bold text-foreground">Answer review</p>
              <p className="mt-0.5 text-xs text-muted-foreground">Accountancy · 20 questions</p>
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
              18 / 20 correct
            </span>
          </div>

          <ul className="mt-4 flex flex-col gap-3">
            {REVIEW_ROWS.map((row, index) => (
              <li
                key={row.question}
                className={cn(
                  "rounded-xl border p-3.5",
                  row.correct ? "border-border bg-white" : "border-rose-200 bg-rose-50/60"
                )}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={cn(
                      "mt-0.5 grid size-6 shrink-0 place-items-center rounded-lg text-[0.7rem] font-bold",
                      row.correct ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"
                    )}
                  >
                    {row.correct ? <Check className="size-3.5" /> : <X className="size-3.5" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[0.8rem] font-semibold leading-snug text-foreground">
                      Q{index + 1}. {row.question}
                    </p>
                    <p className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[0.75rem] text-muted-foreground">
                      <CircleDot aria-hidden="true" className="size-3" />
                      You answered
                      <span className={cn("font-semibold", row.correct ? "text-emerald-700" : "text-rose-700")}>
                        {row.yours}
                      </span>
                      {!row.correct && (
                        <>
                          <MoveRight aria-hidden="true" className="size-3" />
                          <span className="font-semibold text-emerald-700">{row.answer}</span>
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </Reveal>
    </div>
  </Section>
);
