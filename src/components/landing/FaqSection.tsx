import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import { Section, SectionHeading } from "./primitives/Section";
import { Reveal } from "./primitives/Reveal";
import { FAQS } from "./content";

export const FaqSection = () => (
  <Section id="faq">
    <div className="grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
      <SectionHeading
        align="left"
        eyebrow="FAQ"
        title="Questions, answered"
        description="Everything below describes how Dev Classes works today."
        className="lg:sticky lg:top-28"
      />

      <Reveal delay={0.08}>
        <Accordion type="single" collapsible className="flex flex-col gap-3">
          {FAQS.map((faq, index) => (
            <AccordionItem key={faq.question} value={`faq-${index}`}>
              <AccordionTrigger>{faq.question}</AccordionTrigger>
              <AccordionContent>{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Reveal>
    </div>
  </Section>
);
