import { Link } from "react-router-dom";
import logoDark from "../../../assets/website.svg";
import logoLight from "../../../assets/white2.svg";
import { cn } from "../../../libs/utils";

interface BrandLogoProps {
  // `light` is for dark backgrounds (footer, dark CTA); `dark` for white backgrounds.
  tone?: "dark" | "light";
  showTagline?: boolean;
  className?: string;
  to?: string;
}

/** Dev Classes wordmark. Reuses the existing SVG assets rather than introducing new artwork. */
export const BrandLogo = ({
  tone = "dark",
  showTagline = true,
  className,
  to = "/",
}: BrandLogoProps) => (
  <Link
    to={to}
    className={cn(
      "inline-flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}
    aria-label="Dev Classes — home"
  >
    <img
      src={tone === "light" ? logoLight : logoDark}
      alt=""
      aria-hidden="true"
      className="h-9 w-9 shrink-0 sm:h-10 sm:w-10"
      width={40}
      height={40}
    />
    <span className="flex flex-col leading-none">
      <span
        className={cn(
          "text-[1.05rem] font-extrabold tracking-tight sm:text-lg",
          tone === "light" ? "text-white" : "text-foreground"
        )}
      >
        Dev Classes
      </span>
      {showTagline && (
        <span
          className={cn(
            "mt-0.5 text-[0.68rem] font-medium",
            tone === "light" ? "text-white/60" : "text-muted-foreground"
          )}
        >
          Your companion in learning
        </span>
      )}
    </span>
  </Link>
);
