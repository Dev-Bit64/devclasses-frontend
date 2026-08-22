import { Container } from "./primitives/Section";
import { RevealGroup, RevealItem } from "./primitives/Reveal";
import { CAPABILITIES } from "./content";
import { LANDING_ICONS } from "./icons";

/** Compact strip of real product capabilities. Deliberately no numbers or claims. */
export const CapabilityStrip = () => (
  <section aria-label="What Dev Classes gives you" className="border-y border-border bg-white py-8 sm:py-10">
    <Container>
      <RevealGroup
        as="ul"
        stagger={0.06}
        className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-6"
      >
        {CAPABILITIES.map((capability) => {
          const Icon = LANDING_ICONS[capability.icon];
          return (
            <RevealItem
              as="li"
              key={capability.label}
              className="group flex flex-col items-center gap-2.5 text-center"
            >
              <span className="grid size-11 place-items-center rounded-xl border border-border bg-slate-50 text-primary transition-colors duration-200 group-hover:border-primary/30 group-hover:bg-accent">
                <Icon aria-hidden="true" className="size-5" />
              </span>
              <span className="text-[0.8rem] font-semibold leading-tight text-foreground sm:text-sm">
                {capability.label}
              </span>
            </RevealItem>
          );
        })}
      </RevealGroup>
    </Container>
  </section>
);
