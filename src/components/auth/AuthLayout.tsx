import * as React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { BrandLogo } from "../landing/primitives/BrandLogo";
import { AuthVisual } from "./AuthVisual";
import { cn } from "../../libs/utils";

interface AuthLayoutProps {
  title: string;
  description?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  // Registration is taller, so it gets a roomier column.
  wide?: boolean;
}

/**
 * Split auth shell: form on the left, branded visual on the right.
 * Below `lg` the visual is dropped entirely and the form takes the full width —
 * a stacked hero would push the fields below the fold on small screens.
 */
export const AuthLayout = ({
  title,
  description,
  footer,
  children,
  wide = false,
}: AuthLayoutProps) => (
  <div className="dc-public min-h-[100dvh] bg-background lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)] xl:grid-cols-2">
    {/* Form column */}
    <div className="flex min-h-[100dvh] flex-col px-5 py-8 sm:px-8 sm:py-10 lg:min-h-0 lg:px-12 xl:px-16">
      <div className="flex items-center justify-between gap-4">
        <BrandLogo showTagline={false} />
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          <span className="hidden sm:inline">Back to home</span>
          <span className="sm:hidden">Home</span>
        </Link>
      </div>

      <div className="flex flex-1 items-center justify-center py-10 sm:py-12">
        <div className={cn("w-full", wide ? "max-w-xl" : "max-w-[400px]")}>
          <div className="flex flex-col gap-2">
            <h1 className="text-[1.6rem] font-extrabold tracking-[-0.025em] text-foreground sm:text-[1.85rem]">
              {title}
            </h1>
            {description && (
              <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
            )}
          </div>

          <div className="mt-8">{children}</div>

          {footer && <div className="mt-7 text-center text-sm text-muted-foreground">{footer}</div>}
        </div>
      </div>
    </div>

    {/* Brand column — desktop only */}
    <div className="hidden lg:block">
      <AuthVisual />
    </div>
  </div>
);
