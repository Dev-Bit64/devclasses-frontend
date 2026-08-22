import * as React from "react";
import { cn } from "../../../libs/utils";
import { Badge } from "../../ui/badge";
import { Reveal } from "./Reveal";

/** Max-width wrapper. Named `dc-container` to avoid clashing with the dashboard's `.container`. */
export const Container = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("mx-auto w-full max-w-[1200px] px-5 sm:px-6 lg:px-8", className)} {...props} />
);

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  // Alternating surface keeps long pages from reading as one flat slab.
  tone?: "default" | "muted" | "dark";
  bleed?: boolean;
}

export const Section = ({
  tone = "default",
  bleed = false,
  className,
  children,
  ...props
}: SectionProps) => (
  <section
    className={cn(
      "relative py-16 sm:py-20 lg:py-28",
      tone === "muted" && "bg-slate-50",
      tone === "dark" && "bg-slate-950 text-white",
      className
    )}
    {...props}
  >
    {bleed ? children : <Container>{children}</Container>}
  </section>
);

interface SectionHeadingProps {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "left" | "center";
  tone?: "light" | "dark";
  className?: string;
  // Heading level, so section order stays semantically correct.
  as?: "h2" | "h3";
}

export const SectionHeading = ({
  eyebrow,
  title,
  description,
  align = "center",
  tone = "light",
  className,
  as: Heading = "h2",
}: SectionHeadingProps) => (
  <Reveal
    className={cn(
      "flex flex-col gap-4",
      align === "center" ? "items-center text-center" : "items-start text-left",
      className
    )}
  >
    {eyebrow && (
      <Badge variant={tone === "dark" ? "outline" : "default"} className={cn(tone === "dark" && "border-white/15 bg-white/10 text-white shadow-none")}>
        {eyebrow}
      </Badge>
    )}
    <Heading
      className={cn(
        "max-w-3xl text-display-sm font-bold sm:text-[2.5rem] sm:leading-[1.12] sm:tracking-[-0.025em]",
        tone === "dark" ? "text-white" : "text-foreground"
      )}
    >
      {title}
    </Heading>
    {description && (
      <p
        className={cn(
          "max-w-2xl text-base leading-relaxed sm:text-lg",
          tone === "dark" ? "text-slate-300" : "text-muted-foreground"
        )}
      >
        {description}
      </p>
    )}
  </Reveal>
);
