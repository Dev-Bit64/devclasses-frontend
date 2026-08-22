import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Check, FileDown, Timer, TrendingUp } from "lucide-react";
import { dcEase } from "../../lib/motion";
import { cn } from "../../libs/utils";

/** Illustrative question used purely to show what the test screen looks like. */
const PREVIEW_QUESTION = {
  chapter: "Accountancy · Chapter 3 · Classification of Accounts",
  prompt: "Which of the following is a Real Account?",
  options: [
    { key: "A", label: "Salary A/c" },
    { key: "B", label: "Building A/c" },
    { key: "C", label: "Rent A/c" },
    { key: "D", label: "Capital A/c" },
  ],
  correctKey: "B",
};

const PROGRESS_TARGET = 60;

/**
 * A styled mock of the real Dev Classes test screen. Nothing here is user data — it is a
 * product preview, marked aria-hidden with a text alternative for assistive tech.
 */
export const HeroProductPreview = () => {
  const shouldReduce = useReducedMotion();
  const [answered, setAnswered] = React.useState(shouldReduce);

  // Plays the "answer selected" beat once, shortly after the hero lands.
  React.useEffect(() => {
    if (shouldReduce) {
      setAnswered(true);
      return;
    }
    const timer = window.setTimeout(() => setAnswered(true), 1100);
    return () => window.clearTimeout(timer);
  }, [shouldReduce]);

  const float = shouldReduce
    ? {}
    : { animate: { y: [0, -8, 0] }, transition: { duration: 6, repeat: Infinity, ease: "easeInOut" } };

  return (
    <div className="relative">
      <p className="sr-only">
        Preview of the Dev Classes test screen: a chapter-wise multiple choice question with four
        options, a question progress bar, a score summary and a downloadable result.
      </p>

      <div aria-hidden="true" className="relative">
        {/* Main test card */}
        <motion.div
          initial={shouldReduce ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.15, ease: dcEase }}
          className="relative z-10 rounded-2xl border border-border bg-white p-5 shadow-dc-xl sm:p-6"
        >
          <div className="flex items-center justify-between gap-3 border-b border-border pb-4">
            <div className="min-w-0">
              <p className="truncate text-[0.7rem] font-medium uppercase tracking-wider text-muted-foreground">
                {PREVIEW_QUESTION.chapter}
              </p>
              <p className="mt-1 text-sm font-semibold text-foreground">Question 12 of 20</p>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold tabular-nums text-slate-600">
              <Timer className="size-3.5" />
              14:32
            </span>
          </div>

          {/* Question progress */}
          <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <motion.div
              initial={{ width: shouldReduce ? `${PROGRESS_TARGET}%` : "0%" }}
              animate={{ width: `${PROGRESS_TARGET}%` }}
              transition={{ duration: shouldReduce ? 0 : 1.1, delay: 0.5, ease: dcEase }}
              className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
            />
          </div>

          <p className="mt-5 text-[0.95rem] font-semibold leading-snug text-foreground sm:text-base">
            {PREVIEW_QUESTION.prompt}
          </p>

          <ul className="mt-4 flex flex-col gap-2.5">
            {PREVIEW_QUESTION.options.map((option, index) => {
              const isCorrect = answered && option.key === PREVIEW_QUESTION.correctKey;
              return (
                <motion.li
                  key={option.key}
                  initial={shouldReduce ? { opacity: 0 } : { opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.35, delay: 0.4 + index * 0.07, ease: dcEase }}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border px-3.5 py-3 text-sm transition-colors duration-300",
                    isCorrect
                      ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                      : "border-border bg-white text-foreground"
                  )}
                >
                  <span
                    className={cn(
                      "grid size-7 shrink-0 place-items-center rounded-lg text-xs font-bold transition-colors duration-300",
                      isCorrect
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-100 text-muted-foreground"
                    )}
                  >
                    {isCorrect ? <Check className="size-4" /> : option.key}
                  </span>
                  <span className="font-medium">{option.label}</span>
                </motion.li>
              );
            })}
          </ul>
        </motion.div>

        {/* Floating score card */}
        <motion.div
          initial={shouldReduce ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.55, delay: 0.75, ease: dcEase }}
          className="absolute -right-3 -top-7 z-20 hidden sm:block lg:-right-10"
        >
          <motion.div
            {...float}
            className="w-[190px] rounded-xl border border-border bg-white p-4 shadow-dc-lg"
          >
            <div className="flex items-center gap-2 text-[0.7rem] font-semibold uppercase tracking-wider text-muted-foreground">
              <TrendingUp className="size-3.5 text-primary" />
              Your result
            </div>
            <p className="mt-2 text-2xl font-extrabold tabular-nums text-foreground">
              18<span className="text-base font-bold text-muted-foreground">/20</span>
            </p>
            <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
              <motion.div
                initial={{ width: shouldReduce ? "90%" : "0%" }}
                animate={{ width: "90%" }}
                transition={{ duration: shouldReduce ? 0 : 1, delay: 1, ease: dcEase }}
                className="h-full rounded-full bg-emerald-500"
              />
            </div>
            <p className="mt-2 text-[0.7rem] text-muted-foreground">Scored instantly on submit</p>
          </motion.div>
        </motion.div>

        {/* Floating PDF export chip */}
        <motion.div
          initial={shouldReduce ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.55, delay: 0.95, ease: dcEase }}
          className="absolute -bottom-6 -left-3 z-20 hidden sm:block lg:-left-8"
        >
          <motion.div
            {...float}
            transition={
              shouldReduce
                ? undefined
                : { duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1.2 }
            }
            className="flex items-center gap-2.5 rounded-xl border border-border bg-white px-4 py-3 shadow-dc-lg"
          >
            <span className="grid size-9 place-items-center rounded-lg bg-accent text-accent-foreground">
              <FileDown className="size-4" />
            </span>
            <span className="text-xs font-semibold text-foreground">
              Result.pdf
              <span className="block text-[0.7rem] font-normal text-muted-foreground">
                Ready to download
              </span>
            </span>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};
