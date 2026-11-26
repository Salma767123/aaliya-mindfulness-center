"use client";

import type { ReactNode } from "react";
import { motion, type Variants } from "motion/react";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { EASE_OUT, VIEWPORT } from "@/lib/motion";
import { cn } from "@/lib/utils";

const TAGS = {
  div: motion.div,
  li: motion.li,
  p: motion.p,
  span: motion.span,
  figure: motion.figure,
  article: motion.article,
} as const;

type RevealVariant = "rise" | "fade" | "scale" | "blur";

const HIDDEN: Record<RevealVariant, Record<string, string | number>> = {
  rise: { opacity: 0, y: 40 },
  fade: { opacity: 0 },
  scale: { opacity: 0, scale: 0.93 },
  blur: { opacity: 0, y: 14, filter: "blur(14px)" },
};

const SHOWN: Record<RevealVariant, Record<string, string | number>> = {
  rise: { opacity: 1, y: 0 },
  fade: { opacity: 1 },
  scale: { opacity: 1, scale: 1 },
  blur: { opacity: 1, y: 0, filter: "blur(0px)" },
};

type RevealProps = {
  children: ReactNode;
  className?: string;
  as?: keyof typeof TAGS;
  variant?: RevealVariant;
  delay?: number;
  duration?: number;
};

/** Reveals its children once, as they scroll into view. */
export function Reveal({ children, className, as = "div", variant = "rise", delay = 0, duration = 1.1 }: RevealProps) {
  const Tag = TAGS[as] as typeof motion.div;
  return (
    <Tag
      className={className}
      initial={HIDDEN[variant]}
      whileInView={SHOWN[variant]}
      viewport={VIEWPORT}
      transition={{ duration, ease: EASE_OUT, delay }}
    >
      {children}
    </Tag>
  );
}

const groupVariants: Variants = {
  hidden: {},
  show: (stagger: number) => ({ transition: { staggerChildren: stagger, delayChildren: 0.05 } }),
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 34 },
  show: { opacity: 1, y: 0, transition: { duration: 1, ease: EASE_OUT } },
};

type StaggerProps = {
  children: ReactNode;
  className?: string;
  as?: "div" | "ul" | "ol";
  stagger?: number;
};

/** Parent for a run of <StaggerItem>s that arrive one after another. */
export function Stagger({ children, className, as = "div", stagger = 0.09 }: StaggerProps) {
  const Tag = (as === "ul" ? motion.ul : as === "ol" ? motion.ol : motion.div) as typeof motion.div;
  return (
    <Tag className={className} variants={groupVariants} custom={stagger} initial="hidden" whileInView="show" viewport={VIEWPORT}>
      {children}
    </Tag>
  );
}

export function StaggerItem({
  children,
  className,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "li";
}) {
  const Tag = (as === "li" ? motion.li : motion.div) as typeof motion.div;
  return (
    <Tag className={className} variants={itemVariants}>
      {children}
    </Tag>
  );
}

type WipeProps = {
  children: ReactNode;
  className?: string;
  /** Edge the image is unveiled from. */
  from?: "bottom" | "top" | "left" | "right" | "center";
  delay?: number;
};

const WIPE_FROM: Record<NonNullable<WipeProps["from"]>, string> = {
  bottom: "inset(100% 0% 0% 0%)",
  top: "inset(0% 0% 100% 0%)",
  left: "inset(0% 100% 0% 0%)",
  right: "inset(0% 0% 0% 100%)",
  center: "inset(18% 18% 18% 18%)",
};

/** Unveils an image with a clip-path wipe while the picture inside settles from a slight zoom. */
export function Wipe({ children, className, from = "bottom", delay = 0 }: WipeProps) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={cn("will-change-[clip-path]", className)}
      initial={{ clipPath: WIPE_FROM[from], opacity: from === "center" ? 0 : 1 }}
      whileInView={{ clipPath: "inset(0% 0% 0% 0%)", opacity: 1 }}
      viewport={VIEWPORT}
      transition={{ duration: 1.5, ease: EASE_OUT, delay }}
    >
      <motion.div
        className="relative size-full"
        initial={{ scale: 1.25 }}
        whileInView={{ scale: 1 }}
        viewport={VIEWPORT}
        transition={{ duration: 2, ease: EASE_OUT, delay }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
