import type { Variants } from "framer-motion";

// Single easing curve for the whole public surface, so motion feels like one system.
export const dcEase: [number, number, number, number] = [0.22, 1, 0.36, 1];

/** Fade + short rise. Travel is intentionally small (16px) to stay calm. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: dcEase } },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.45, ease: dcEase } },
};

/** Parent variant that walks its children in one at a time. */
export const staggerContainer = (stagger = 0.08, delay = 0): Variants => ({
  hidden: {},
  visible: { transition: { staggerChildren: stagger, delayChildren: delay } },
});

/** Reduced-motion equivalents: state still changes, nothing moves. */
export const reducedVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.01 } },
};

/** Shared viewport config so every scroll reveal triggers at the same point, once. */
export const revealViewport = { once: true, amount: 0.2, margin: "0px 0px -80px 0px" } as const;
