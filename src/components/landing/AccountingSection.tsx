import { Link } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "../ui/button";
import { Section, SectionHeading } from "./primitives/Section";
import { Reveal } from "./primitives/Reveal";
import { useAuthUser } from "../../hooks/use-auth-user";
import { cn } from "../../libs/utils";

/** Illustrative Investing Activities answer — amounts in brackets are outflows, as students write them. */
const PREVIEW_ROWS = [
  { particular: "Purchase of Machinery", amount: "(1,50,000)", outflow: true },
  { particular: "Sale of Investments", amount: "40,000", outflow: false },
  { particular: "Interest Received", amount: "12,000", outflow: false },
  { particular: "Purchase of Patents", amount: "(20,000)", outflow: true },
];

// Each point maps to a feature students can use today.
const POINTS = [
  "Prepare the whole Cash Flow Statement as per AS-3",
  "Practise one activity at a time — Operating, Investing or Financing",
  "Type your working notes, line by line, as you would in the exam",
  "Instant score with a line-by-line review against the correct answer",
];

// Result strip of the preview: count and colour per outcome.
const RESULT = [
  { label: "Correct", count: 13, className: "bg-emerald-50 text-emerald-700" },
  { label: "Wrong", count: 1, className: "bg-rose-50 text-rose-700" },
  { label: "Missed", count: 1, className: "bg-amber-50 text-amber-700" },
];

export const AccountingSection = () => {
  const { isAuthenticated } = useAuthUser();

  return (
    <Section id="accounting-tests" tone="dark">
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <SectionHeading
            align="left"
            tone="dark"
            eyebrow="New · Accounting Tests"
            title={
              <>
                Don&apos;t just read Accounts.
                <span className="block">
                  <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">Prepare</span> them.
                </span>
              </>
            }
            description="Solve real Cash Flow questions the way you would in the exam — with the given figures, additional information and working notes — and see exactly which entries you got right."
          />

          <Reveal delay={0.1} className="mt-8">
            <ul className="flex flex-col gap-3.5">
              {POINTS.map((point) => (
                <li key={point} className="flex items-start gap-3">
                  <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-emerald-400/15 text-emerald-300">
                    <Check aria-hidden="true" className="size-3" />
                  </span>
                  <span className="text-sm leading-relaxed text-slate-300 sm:text-[0.95rem]">{point}</span>
                </li>
              ))}
            </ul>
          </Reveal>

          {/* Signed-in students go straight to the tests; visitors register first, as in the Hero. */}
          <Reveal delay={0.14} className="mt-8">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link to={isAuthenticated ? "/accounting-test-details" : "/register"}>
                {isAuthenticated ? "Start an Accounting Test" : "Create a free account"}
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </Reveal>
        </div>

        {/* Answer preview */}
        <Reveal delay={0.12} className="relative">
          <p className="sr-only">
            Preview of an Investing Activities answer with outflows shown in brackets, totalling (1,18,000),
            followed by a result of 13 correct, 1 wrong and 1 missed entry.
          </p>
          <div aria-hidden="true" className="rounded-2xl border border-white/10 bg-white p-5 text-foreground shadow-dc-lg sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
              <div>
                <p className="text-sm font-bold">Investing Activities</p>
                <p className="mt-0.5 text-xs text-muted-foreground">Cash Flow Statement · Arya Ltd.</p>
              </div>
              <span className="rounded-full bg-accent px-3 py-1 text-xs font-bold text-primary">AS-3</span>
            </div>

            <table className="mt-4 w-full text-[0.8rem]">
              <tbody>
                {PREVIEW_ROWS.map((row) => (
                  <tr key={row.particular} className="border-b border-border/70">
                    <td className="py-2 pr-3">{row.particular}</td>
                    <td className={cn("py-2 text-right font-semibold tabular-nums", row.outflow && "text-rose-600")}>
                      {row.amount}
                    </td>
                  </tr>
                ))}
                <tr className="border-t-2 border-foreground">
                  <td className="py-2 pr-3 font-bold">Net Cash used in Investing Activities</td>
                  <td className="py-2 text-right font-bold tabular-nums text-rose-600">(1,18,000)</td>
                </tr>
              </tbody>
            </table>

            <div className="mt-4 grid grid-cols-3 gap-2">
              {RESULT.map((item) => (
                <div key={item.label} className={cn("rounded-xl p-3 text-center", item.className)}>
                  <p className="text-lg font-bold tabular-nums">{item.count}</p>
                  <p className="text-[0.7rem] font-semibold">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  );
};
