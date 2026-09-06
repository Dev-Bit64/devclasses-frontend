import { motion, useReducedMotion } from "framer-motion";
import { Check, FileDown, ListChecks, TrendingUp } from "lucide-react";
import { dcEase } from "../../lib/motion";
import { CONTACT } from "../landing/content";

const HIGHLIGHTS = [
  { icon: ListChecks, text: "Chapter-wise MCQ practice for CBSE & GSEB" },
  { icon: TrendingUp, text: "Instant scoring and question-by-question review" },
  { icon: FileDown, text: "Download any result as a PDF" },
];

/**
 * Branded panel for the right-hand side of the auth pages.
 * Built from CSS and SVG rather than stock photography so it matches the landing page exactly.
 */
export const AuthVisual = () => {
  const shouldReduce = useReducedMotion();

  return (
    <div className="relative isolate flex h-full flex-col justify-between overflow-hidden bg-slate-950 p-10 xl:p-14">
      {/* Decorative background */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-24 top-0 h-[420px] w-[420px] rounded-full bg-primary/30 blur-3xl" />
        <div className="absolute -bottom-32 -right-20 h-[380px] w-[380px] rounded-full bg-secondary/25 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
            backgroundSize: "48px 48px",
            maskImage: "radial-gradient(ellipse 80% 60% at 50% 40%, #000 30%, transparent 100%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 80% 60% at 50% 40%, #000 30%, transparent 100%)",
          }}
        />
      </div>

      <div>
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-white/50">
          Dev Classes
        </p>
        <h2 className="mt-5 max-w-md text-[1.9rem] font-extrabold leading-[1.15] tracking-[-0.025em] text-white xl:text-[2.25rem]">
          Master every chapter, one question at a time.
        </h2>
        <ul className="mt-8 flex flex-col gap-4">
          {HIGHLIGHTS.map((item) => (
            <li key={item.text} className="flex items-start gap-3">
              <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg bg-white/10 text-white ring-1 ring-inset ring-white/15">
                <item.icon aria-hidden="true" className="size-4" />
              </span>
              <span className="text-sm leading-relaxed text-slate-300">{item.text}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Mini product preview */}
      <motion.div
        initial={shouldReduce ? { opacity: 0 } : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2, ease: dcEase }}
        aria-hidden="true"
        className="mt-12 rounded-2xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur-sm"
      >
        <div className="flex items-center justify-between">
          <p className="text-[0.7rem] font-semibold uppercase tracking-wider text-white/50">
            Accountancy · Chapter 3
          </p>
          <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[0.7rem] font-bold text-emerald-300">
            18 / 20
          </span>
        </div>
        <p className="mt-3 text-sm font-semibold text-white">
          Which of the following is a Real Account?
        </p>
        <div className="mt-3 flex items-center gap-2.5 rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-3 py-2.5">
          <span className="grid size-6 shrink-0 place-items-center rounded-md bg-emerald-500 text-white">
            <Check className="size-3.5" />
          </span>
          <span className="text-sm font-medium text-emerald-100">Building A/c</span>
        </div>
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
          <motion.div
            initial={{ width: shouldReduce ? "90%" : "0%" }}
            animate={{ width: "90%" }}
            transition={{ duration: shouldReduce ? 0 : 1, delay: 0.6, ease: dcEase }}
            className="h-full rounded-full bg-emerald-400"
          />
        </div>
      </motion.div>

      <p className="mt-10 text-xs text-white/40">
        Need help? Email{" "}
        <a
          href={CONTACT.emailHref}
          className="font-medium text-white/70 underline-offset-4 transition-colors hover:text-white hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
        >
          {CONTACT.email}
        </a>
      </p>
    </div>
  );
};
