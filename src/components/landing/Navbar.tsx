import * as React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, LayoutDashboard, Menu } from "lucide-react";
import { Button } from "../ui/button";
import { Sheet, SheetClose, SheetContent, SheetTrigger } from "../ui/sheet";
import { BrandLogo } from "./primitives/BrandLogo";
import { Container } from "./primitives/Section";
import { NAV_LINKS } from "./content";
import { useAuthUser } from "../../hooks/use-auth-user";
import { cn } from "../../libs/utils";

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = React.useState(false);
  const sentinelRef = React.useRef<HTMLDivElement | null>(null);
  const { isAuthenticated } = useAuthUser();

  // An IntersectionObserver sentinel replaces the old scroll listener, which re-rendered
  // the whole landing page on every scroll frame.
  React.useEffect(() => {
    const el = sentinelRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsScrolled(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div ref={sentinelRef} aria-hidden="true" className="absolute top-0 h-px w-full" />
      <header
        className={cn(
          "sticky top-0 z-[900] w-full transition-[background-color,box-shadow,border-color] duration-300",
          isScrolled
            ? "border-b border-border bg-white/85 shadow-dc-sm backdrop-blur-md supports-[backdrop-filter]:bg-white/70"
            : "border-b border-transparent bg-transparent"
        )}
      >
        <Container className="flex h-16 items-center justify-between gap-4 sm:h-[72px]">
          <BrandLogo />

          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="rounded-lg px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            {isAuthenticated ? (
              <Button asChild size="md">
                <Link to="/dashboard">
                  <LayoutDashboard aria-hidden="true" />
                  Go to dashboard
                </Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost" size="md">
                  <Link to="/login">Log in</Link>
                </Button>
                <Button asChild size="md">
                  <Link to="/register">
                    Get started
                    <ArrowRight aria-hidden="true" />
                  </Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile navigation */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
                <Menu aria-hidden="true" />
              </Button>
            </SheetTrigger>
            <SheetContent title="Navigation menu">
              <BrandLogo className="mb-6" />
              <nav aria-label="Mobile">
                <ul className="flex flex-col gap-1">
                  {NAV_LINKS.map((link) => (
                    <li key={link.href}>
                      <SheetClose asChild>
                        <a
                          href={link.href}
                          className="block rounded-lg px-3 py-3 text-base font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          {link.label}
                        </a>
                      </SheetClose>
                    </li>
                  ))}
                </ul>
              </nav>
              <div className="mt-auto flex flex-col gap-2.5 border-t border-border pt-6">
                {isAuthenticated ? (
                  <SheetClose asChild>
                    <Button asChild size="lg" block>
                      <Link to="/dashboard">
                        <LayoutDashboard aria-hidden="true" />
                        Go to dashboard
                      </Link>
                    </Button>
                  </SheetClose>
                ) : (
                  <>
                    <SheetClose asChild>
                      <Button asChild size="lg" block>
                        <Link to="/register">Get started free</Link>
                      </Button>
                    </SheetClose>
                    <SheetClose asChild>
                      <Button asChild variant="secondary" size="lg" block>
                        <Link to="/login">Log in</Link>
                      </Button>
                    </SheetClose>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </Container>
      </header>
    </>
  );
};
