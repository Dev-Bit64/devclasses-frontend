import * as React from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { fadeUp, reducedVariants, revealViewport, staggerContainer } from "../../../lib/motion";
import { cn } from "../../../libs/utils";

/**
 * React's drag/animation DOM handlers clash with framer-motion's own props of the same name,
 * so they are dropped from the public prop surface.
 */
type MotionSafeProps = Omit<
  React.HTMLAttributes<HTMLElement>,
  | "onDrag"
  | "onDragStart"
  | "onDragEnd"
  | "onDragEnter"
  | "onDragExit"
  | "onDragLeave"
  | "onDragOver"
  | "onDrop"
  | "onAnimationStart"
  | "onAnimationEnd"
  | "onAnimationIteration"
  | "onTransitionEnd"
>;

interface RevealProps extends MotionSafeProps {
  as?: "div" | "section" | "li" | "article";
  variants?: Variants;
  delay?: number;
}

/** Fades a block in the first time it scrolls into view; a no-op under prefers-reduced-motion. */
export const Reveal = ({
  as = "div",
  variants,
  delay = 0,
  className,
  children,
  ...props
}: RevealProps) => {
  const shouldReduce = useReducedMotion();
  const Comp = motion[as];

  return (
    <Comp
      initial="hidden"
      whileInView="visible"
      viewport={revealViewport}
      transition={{ delay: shouldReduce ? 0 : delay }}
      variants={shouldReduce ? reducedVariants : variants ?? fadeUp}
      className={cn(className)}
      {...props}
    >
      {children}
    </Comp>
  );
};

interface RevealGroupProps extends MotionSafeProps {
  as?: "div" | "ul" | "section";
  stagger?: number;
  delay?: number;
}

/** Wraps a set of `RevealItem` children so they animate in sequence rather than all at once. */
export const RevealGroup = ({
  as = "div",
  stagger = 0.08,
  delay = 0,
  className,
  children,
  ...props
}: RevealGroupProps) => {
  const shouldReduce = useReducedMotion();
  const Comp = motion[as];

  return (
    <Comp
      initial="hidden"
      whileInView="visible"
      viewport={revealViewport}
      variants={staggerContainer(shouldReduce ? 0 : stagger, shouldReduce ? 0 : delay)}
      className={cn(className)}
      {...props}
    >
      {children}
    </Comp>
  );
};

interface RevealItemProps extends MotionSafeProps {
  as?: "div" | "li" | "article";
}

/** Child of RevealGroup — inherits the parent's stagger timing. */
export const RevealItem = ({ as = "div", className, children, ...props }: RevealItemProps) => {
  const shouldReduce = useReducedMotion();
  const Comp = motion[as];

  return (
    <Comp variants={shouldReduce ? reducedVariants : fadeUp} className={cn(className)} {...props}>
      {children}
    </Comp>
  );
};
