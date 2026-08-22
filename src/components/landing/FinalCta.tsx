import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "../ui/button";
import { Container } from "./primitives/Section";
import { Reveal } from "./primitives/Reveal";
import { useAuthUser } from "../../hooks/use-auth-user";

export const FinalCta = () => {
  const { isAuthenticated } = useAuthUser();

  return (
    <section className="py-16 sm:py-20 lg:py-24">
      <Container>
        <Reveal className="relative overflow-hidden rounded-3xl bg-slate-950 px-6 py-14 text-center shadow-dc-xl sm:px-10 sm:py-16 lg:px-16 lg:py-20">
          {/* Decorative glow, kept subtle so the type stays readable. */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            <div className="absolute -top-32 left-1/2 h-80 w-[640px] -translate-x-1/2 rounded-full bg-primary/30 blur-3xl" />
            <div className="absolute -bottom-32 right-0 h-64 w-64 rounded-full bg-secondary/25 blur-3xl" />
          </div>

          <div className="relative mx-auto flex max-w-2xl flex-col items-center">
            <h2 className="text-[1.75rem] font-extrabold leading-tight tracking-[-0.025em] text-white sm:text-display-sm lg:text-[2.75rem] lg:leading-[1.1]">
              Ready to take control of your syllabus?
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-300 sm:text-lg">
              Create a free account, pick a chapter, and find out where you stand in the next fifteen
              minutes.
            </p>
            <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              {isAuthenticated ? (
                <Button asChild size="lg" className="w-full sm:w-auto">
                  <Link to="/dashboard">
                    Go to dashboard
                    <ArrowRight aria-hidden="true" />
                  </Link>
                </Button>
              ) : (
                <>
                  <Button asChild size="lg" className="w-full sm:w-auto">
                    <Link to="/register">
                      Start practising
                      <ArrowRight aria-hidden="true" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="inverse" className="w-full sm:w-auto">
                    <Link to="/login">I already have an account</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
};
