import { motion, useReducedMotion } from "framer-motion";
import { Award, BarChart3, FileDown, Sparkles } from "lucide-react";
import { Section, SectionHeading } from "./primitives/Section";
import { Reveal } from "./primitives/Reveal";
import { dcEase } from "../../lib/motion";

/** Mirrors the three metrics the student dashboard genuinely reports. */
const METRICS = [
  { icon: BarChart3, label: "Tests attempted", hint: "Every paper you submit is recorded" },
  { icon: Award, label: "Highest score", hint: "Your best performance so far" },
  { icon: Sparkles, label: "Average score", hint: "How you are trending overall" },
];

const SCORE_HISTORY = [52, 64, 61, 73, 80, 88];

export const ProgressSection = () => {
  const shouldReduce = useReducedMotion();

  return (
    <Section id="progress" tone="muted">
      <SectionHeading
        eyebrow="Your progress"
        title="See improvement, instead of guessing at it"
        description="Your dashboard keeps count of the tests you have attempted along with your highest and average score, so the effect of a week's revision is something you can actually look at."
      />

      <div className="mt-12 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-10">
        <Reveal className="flex flex-col gap-4">
          {METRICS.map((metric) => (
            <div
              key={metric.label}
              className="flex items-start gap-4 rounded-xl border border-border bg-white p-5 shadow-dc-xs transition-shadow duration-200 hover:shadow-dc-md"
            >
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-accent text-accent-foreground">
                <metric.icon aria-hidden="true" className="size-5" />
              </span>
              <div>
                <p className="text-[0.95rem] font-bold text-foreground">{metric.label}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{metric.hint}</p>
              </div>
            </div>
          ))}

          <div className="flex items-start gap-4 rounded-xl border border-border bg-white p-5 shadow-dc-xs transition-shadow duration-200 hover:shadow-dc-md">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-accent text-accent-foreground">
              <FileDown aria-hidden="true" className="size-5" />
            </span>
            <div>
              <p className="text-[0.95rem] font-bold text-foreground">Exportable results</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                Download any result as a PDF to keep a record or share it.
              </p>
            </div>
          </div>
        </Reveal>

        {/* Dashboard preview */}
        <Reveal delay={0.1}>
          <p className="sr-only">
            Preview of the results dashboard, showing tests attempted, highest score, average score
            and a chart of scores across recent tests.
          </p>
          <div
            aria-hidden="true"
            className="rounded-2xl border border-border bg-white p-5 shadow-dc-lg sm:p-7"
          >
            <p className="text-sm font-bold text-foreground">Your results</p>

            <dl className="mt-4 grid grid-cols-3 gap-2.5 sm:gap-4">
              {[
                { label: "Tests", value: "24" },
                { label: "Highest", value: "94%" },
                { label: "Average", value: "78%" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-border bg-slate-50 p-3 text-center sm:p-4"
                >
                  <dt className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted-foreground sm:text-[0.7rem]">
                    {stat.label}
                  </dt>
                  <dd className="mt-1 text-xl font-extrabold tabular-nums text-foreground sm:text-2xl">
                    {stat.value}
                  </dd>
                </div>
              ))}
            </dl>

            {/* Simple bar chart, drawn with divs to avoid pulling in a charting library. */}
            <div className="mt-6">
              <p className="text-[0.7rem] font-semibold uppercase tracking-wider text-muted-foreground">
                Recent scores
              </p>
              <div className="mt-3 flex h-32 items-end gap-2 sm:gap-3">
                {SCORE_HISTORY.map((score, index) => (
                  <motion.div
                    key={index}
                    initial={{ height: shouldReduce ? `${score}%` : "6%" }}
                    whileInView={{ height: `${score}%` }}
                    viewport={{ once: true, amount: 0.6 }}
                    transition={{
                      duration: shouldReduce ? 0 : 0.7,
                      delay: shouldReduce ? 0 : index * 0.07,
                      ease: dcEase,
                    }}
                    className="flex-1 rounded-t-md bg-gradient-to-t from-primary/70 to-primary"
                  />
                ))}
              </div>
              <div className="mt-2 flex justify-between text-[0.65rem] text-muted-foreground">
                <span>Earlier</span>
                <span>Latest</span>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  );
};
