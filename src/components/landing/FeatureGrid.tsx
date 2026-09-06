import { Section, SectionHeading } from "./primitives/Section";
import { RevealGroup, RevealItem } from "./primitives/Reveal";
import { FEATURES } from "./content";
import { LANDING_ICONS } from "./icons";

export const FeatureGrid = () => (
  <Section id="features" tone="muted">
    <SectionHeading
      eyebrow="What you get"
      title="Everything you need to revise a chapter properly"
      description="No extras you will never open — just the tools that turn a study session into a measurable result."
    />

    <RevealGroup
      as="ul"
      stagger={0.07}
      className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6"
    >
      {FEATURES.map((feature) => {
        const Icon = LANDING_ICONS[feature.icon];
        return (
          <RevealItem as="li" key={feature.title} className="h-full">
            <article className="group flex h-full flex-col rounded-2xl border border-border bg-white p-6 shadow-dc-xs transition-[box-shadow,border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-dc-lg">
              <span className="grid size-12 place-items-center rounded-xl bg-accent text-accent-foreground transition-colors duration-200 group-hover:bg-primary group-hover:text-primary-foreground">
                <Icon aria-hidden="true" className="size-5" />
              </span>
              <h3 className="mt-5 text-[1.05rem] font-bold tracking-tight text-foreground">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </article>
          </RevealItem>
        );
      })}
    </RevealGroup>
  </Section>
);
