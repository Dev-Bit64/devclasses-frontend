import * as React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BookMarked, FolderTree, Layers, ListChecks } from "lucide-react";
import { Button } from "../ui/button";
import { Section, SectionHeading } from "./primitives/Section";
import { Reveal } from "./primitives/Reveal";
import { BOARDS, STANDARDS } from "./content";
import { cn } from "../../libs/utils";

/** The four levels the question bank is actually organised by. */
const HIERARCHY = [
  { icon: FolderTree, label: "Board", value: "CBSE or GSEB" },
  { icon: Layers, label: "Standard", value: "11th or 12th" },
  { icon: BookMarked, label: "Subject", value: "Your Commerce subject" },
  { icon: ListChecks, label: "Chapter", value: "The exact chapter" },
];

export const SyllabusSection = () => {
  const [board, setBoard] = React.useState<string>(BOARDS[0]);
  const [standard, setStandard] = React.useState<string>(STANDARDS[1]);

  // The selection is carried into the register form as defaults — it is not a fake catalogue.
  const registerHref = `/register?board=${encodeURIComponent(board)}&standard=${encodeURIComponent(standard)}`;

  return (
    <Section id="syllabus" tone="muted">
      <SectionHeading
        eyebrow="Built around your syllabus"
        title="Practice that follows the way you actually study"
        description="Questions are filed by board, standard, subject and chapter — so you can revise one chapter at a time instead of working through a whole textbook."
      />

      <div className="mt-12 grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-10">
        {/* Hierarchy visualisation */}
        <Reveal className="rounded-2xl border border-border bg-white p-6 shadow-dc-sm sm:p-8">
          <ol className="relative flex flex-col gap-6">
            {HIERARCHY.map((level, index) => (
              <li key={level.label} className="relative flex gap-4 pl-0">
                <div className="flex flex-col items-center">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent text-accent-foreground">
                    <level.icon aria-hidden="true" className="size-5" />
                  </span>
                  {/* Connector between levels, decorative. */}
                  {index < HIERARCHY.length - 1 && (
                    <span aria-hidden="true" className="mt-1 w-px flex-1 bg-border" />
                  )}
                </div>
                <div className="pb-1">
                  <p className="text-[0.7rem] font-semibold uppercase tracking-wider text-muted-foreground">
                    {level.label}
                  </p>
                  <p className="mt-0.5 text-[0.95rem] font-semibold text-foreground">{level.value}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-6 rounded-xl bg-slate-50 px-4 py-3 text-sm leading-relaxed text-muted-foreground">
            Pick a chapter and you get a test drawn from that chapter's question bank — nothing from
            outside what you have covered.
          </p>
        </Reveal>

        {/* Board / standard picker that seeds the registration form */}
        <Reveal delay={0.08} className="flex flex-col rounded-2xl border border-border bg-white p-6 shadow-dc-sm sm:p-8">
          <h3 className="text-lg font-bold tracking-tight text-foreground">
            Tell us where you are studying
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Choose your board and standard — we will carry it straight into your registration.
          </p>

          <fieldset className="mt-6">
            <legend className="text-[0.7rem] font-semibold uppercase tracking-wider text-muted-foreground">
              Board
            </legend>
            <div className="mt-2.5 flex flex-wrap gap-2.5">
              {BOARDS.map((option) => (
                <ChoiceChip
                  key={option}
                  label={option}
                  selected={board === option}
                  onSelect={() => setBoard(option)}
                  name="landing-board"
                />
              ))}
            </div>
          </fieldset>

          <fieldset className="mt-6">
            <legend className="text-[0.7rem] font-semibold uppercase tracking-wider text-muted-foreground">
              Standard
            </legend>
            <div className="mt-2.5 flex flex-wrap gap-2.5">
              {STANDARDS.map((option) => (
                <ChoiceChip
                  key={option}
                  label={option}
                  selected={standard === option}
                  onSelect={() => setStandard(option)}
                  name="landing-standard"
                />
              ))}
            </div>
          </fieldset>

          {/* whitespace-normal lets the label wrap rather than overflow on 320px screens. */}
          <Button asChild size="lg" className="mt-8 h-auto min-h-12 whitespace-normal py-2.5 text-center" block>
            <Link to={registerHref}>
              Continue with {board} · {standard}
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </Reveal>
      </div>
    </Section>
  );
};

interface ChoiceChipProps {
  label: string;
  selected: boolean;
  onSelect: () => void;
  name: string;
}

/** Radio-backed chip so the group is keyboard- and screen-reader-navigable. */
const ChoiceChip = ({ label, selected, onSelect, name }: ChoiceChipProps) => (
  <label
    className={cn(
      "cursor-pointer rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors duration-200",
      "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
      selected
        ? "border-primary bg-accent text-accent-foreground"
        : "border-border bg-white text-muted-foreground hover:border-slate-300 hover:text-foreground"
    )}
  >
    <input
      type="radio"
      name={name}
      value={label}
      checked={selected}
      onChange={onSelect}
      className="sr-only"
    />
    {label}
  </label>
);
