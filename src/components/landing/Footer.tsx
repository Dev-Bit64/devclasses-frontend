import { Link } from "react-router-dom";
import { Mail, MapPin, Phone } from "lucide-react";
import { BrandLogo } from "./primitives/BrandLogo";
import { Container } from "./primitives/Section";
import { CONTACT, NAV_LINKS } from "./content";

export const Footer = () => (
  <footer className="border-t border-slate-800 bg-slate-950 text-slate-300">
    <Container className="py-14 sm:py-16">
      <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_minmax(0,1.2fr)] lg:gap-12">
        <div>
          <BrandLogo tone="light" />
          <p className="mt-5 max-w-md text-sm leading-relaxed text-slate-400">
            Dev Classes is a Commerce coaching practice in Porbandar. This site gives our students
            chapter-wise MCQ practice, timed tests and scored results for CBSE and GSEB, 11th and
            12th standard.
          </p>
        </div>

        <nav aria-label="Footer">
          <h2 className="text-sm font-bold text-white">Explore</h2>
          <ul className="mt-4 flex flex-col gap-3">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="text-sm text-slate-400 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li>
              <Link
                to="/login"
                className="text-sm text-slate-400 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
              >
                Log in
              </Link>
            </li>
            <li>
              <Link
                to="/register"
                className="text-sm text-slate-400 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
              >
                Create account
              </Link>
            </li>
          </ul>
        </nav>

        <div>
          <h2 className="text-sm font-bold text-white">Reach us</h2>
          <ul className="mt-4 flex flex-col gap-3.5 text-sm">
            <li className="flex items-start gap-3">
              <Phone aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-slate-500" />
              <a
                href={CONTACT.phoneHref}
                className="text-slate-400 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
              >
                {CONTACT.phone}
              </a>
            </li>
            <li className="flex items-start gap-3">
              <Mail aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-slate-500" />
              <a
                href={CONTACT.emailHref}
                className="break-all text-slate-400 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
              >
                {CONTACT.email}
              </a>
            </li>
            <li className="flex items-start gap-3">
              <MapPin aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-slate-500" />
              <address className="not-italic leading-relaxed text-slate-400">
                {CONTACT.addressLines.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </address>
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-12 border-t border-slate-800 pt-6">
        <p className="text-center text-xs text-slate-500 sm:text-left">
          Dev Classes © {new Date().getFullYear()} · All rights reserved
        </p>
      </div>
    </Container>
  </footer>
);
