import { Section, SectionHeading } from "./primitives/Section";
import { RevealGroup, RevealItem } from "./primitives/Reveal";
import { WHY_US } from "./content";
import { LANDING_ICONS } from "./icons";

/** "Why Choose Dev Classes?" — the four original value propositions, restyled. */
export const WhyUsSection = () => (
  <Section id="why-us">
    <SectionHeading
      eyebrow="Why Dev Classes"
      title="Why Choose Dev Classes?"
      description="Twenty years of teaching Accounting, brought online as chapter-wise MCQ practice."
    />

    <RevealGroup
      as="ul"
      stagger={0.08}
      className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6"
    >
      {WHY_US.map((item) => {
        const Icon = LANDING_ICONS[item.icon];
        return (
          <RevealItem as="li" key={item.title} className="h-full">
            <article className="flex h-full flex-col items-center rounded-2xl border border-border bg-white p-6 text-center shadow-dc-xs transition-[box-shadow,transform,border-color] duration-200 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-dc-lg">
              <span className="grid size-14 place-items-center rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 text-primary">
                <Icon aria-hidden="true" className="size-6" />
              </span>
              <h3 className="mt-5 text-[1.05rem] font-bold tracking-tight text-foreground">
                {item.title}
              </h3>
              <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
                {item.description}
              </p>
            </article>
          </RevealItem>
        );
      })}
    </RevealGroup>
  </Section>
);
