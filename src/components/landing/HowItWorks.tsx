import { Section, SectionHeading } from "./primitives/Section";
import { RevealGroup, RevealItem } from "./primitives/Reveal";
import { HOW_IT_WORKS } from "./content";

export const HowItWorks = () => (
  <Section id="how-it-works">
    <SectionHeading
      eyebrow="How it works"
      title="Four steps from syllabus to score"
      description="No setup, no configuration. Register once and every test you take follows your board and standard."
    />

    <RevealGroup as="ul" stagger={0.1} className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {HOW_IT_WORKS.map((step, index) => (
        <RevealItem as="li" key={step.step} className="relative">
          {/* Connector line between steps on wide screens only. */}
          {index < HOW_IT_WORKS.length - 1 && (
            <span
              aria-hidden="true"
              className="absolute left-[calc(50%+2.25rem)] right-[-1.5rem] top-7 hidden h-px bg-gradient-to-r from-border to-transparent lg:block"
            />
          )}
          <div className="flex h-full flex-col items-start rounded-2xl border border-border bg-white p-6 shadow-dc-xs transition-shadow duration-200 hover:shadow-dc-md">
            <span
              aria-hidden="true"
              className="grid size-14 place-items-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-lg font-extrabold text-white shadow-dc-sm"
            >
              {step.step}
            </span>
            <h3 className="mt-5 text-[1.05rem] font-bold tracking-tight text-foreground">
              {step.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
          </div>
        </RevealItem>
      ))}
    </RevealGroup>
  </Section>
);
