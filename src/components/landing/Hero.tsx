import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, BookOpenCheck } from "lucide-react";
import { Button } from "../ui/button";
import { Container } from "./primitives/Section";
import { HeroProductPreview } from "./HeroProductPreview";
import { BOARDS, STANDARDS } from "./content";
import { fadeUp, reducedVariants, staggerContainer } from "../../lib/motion";
import { useAuthUser } from "../../hooks/use-auth-user";

export const Hero = () => {
  const shouldReduce = useReducedMotion();
  const { isAuthenticated } = useAuthUser();
  const item = shouldReduce ? reducedVariants : fadeUp;

  return (
    <section id="home" className="relative isolate overflow-hidden">
      {/* Background treatment: a soft radial wash plus a faint grid, both decorative. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/60 via-white to-white" />
        <div className="absolute -top-40 left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -right-24 top-24 h-[380px] w-[380px] rounded-full bg-secondary/10 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "linear-gradient(to right, hsl(var(--dc-border)) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--dc-border)) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            maskImage: "radial-gradient(ellipse 70% 55% at 50% 0%, #000 40%, transparent 100%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 70% 55% at 50% 0%, #000 40%, transparent 100%)",
          }}
        />
      </div>

      <Container className="grid items-center gap-14 py-14 sm:py-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,520px)] lg:gap-16 lg:py-24 xl:gap-20">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer(shouldReduce ? 0 : 0.09)}
          // `min-w-0`: grid items default to `min-width: auto`, which sizes the single mobile
          // track to the widest min-content in the column and pushes the copy off narrow screens.
          className="flex min-w-0 flex-col items-start"
        >
          <motion.span
            variants={item}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-white/80 px-3.5 py-1.5 text-xs font-semibold text-muted-foreground shadow-dc-xs backdrop-blur"
          >
            <BookOpenCheck aria-hidden="true" className="size-3.5 text-primary" />
            {BOARDS.join(" & ")} · {STANDARDS.join(" & ")} Commerce
          </motion.span>

          <motion.h1
            variants={item}
            // Scaled per breakpoint: at lg the hero is two columns, so the headline stays at
            // display-md and only grows to display-lg once there is real width to spend.
            className="mt-6 text-[1.9rem] font-extrabold leading-[1.1] tracking-[-0.03em] text-foreground min-[400px]:text-[2.1rem] sm:text-display-md lg:text-[2.6rem] lg:leading-[1.08] xl:text-display-lg"
          >
            Accounting is the
            <span className="block bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              language of business.
            </span>
          </motion.h1>

          <motion.p
            variants={item}
            className="mt-5 max-w-xl text-lg font-semibold text-foreground sm:text-xl"
          >
            Master the art of this language with us.
          </motion.p>

          <motion.p
            variants={item}
            className="mt-3 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg"
          >
            Chapter-wise MCQ practice built around the Commerce syllabus you are actually studying.
            Attempt a test, get your score the moment you submit, and review every question to see
            exactly what to work on next.
          </motion.p>

          <motion.div variants={item} className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:items-center">
            {isAuthenticated ? (
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link to="/dashboard">
                  Go to dashboard
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
            ) : (
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link to="/register">
                  Start practising
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
            )}
            <Button asChild variant="secondary" size="lg" className="w-full sm:w-auto">
              <a href="#how-it-works">See how it works</a>
            </Button>
          </motion.div>

          <motion.p variants={item} className="mt-5 text-sm text-muted-foreground">
            Free to create an account. No card required.
          </motion.p>
        </motion.div>

        <div className="relative min-w-0 lg:pl-4">
          <HeroProductPreview />
        </div>
      </Container>
    </section>
  );
};
