"use client";

import { useRef, type ReactNode } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { cn } from "@/lib/utils";
import { Stagger, StaggerItem } from "@/components/motion/reveal";

export type Principle = { title: string; body: string };

/** Numeral colours before and after the scroll reaches a principle: emerald-200, emerald-600. */
const WAITING = "#c2dfd0";
const REACHED = "#0e6647";

/**
 * The principles in reading order, one following the other.
 *
 * As the list is scrolled into view its numerals turn from pale to full emerald
 * in sequence. On large screens they sit in four columns and the rule above them
 * fills in step; below that they are rows, and each lights as it arrives.
 * In columns, the numerals, titles and texts share rows across the list, so a
 * title that wraps does not push its text out of line with its neighbours.
 */
export function Principles({ principles, className }: { principles: Principle[]; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  // 0 when the top of the list crosses the lower part of the screen, 1 when its end does.
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.82", "end 0.82"] });

  return (
    <div ref={ref} className={cn("relative", className)}>
      <div aria-hidden className="h-px bg-ink/12" />
      <motion.div
        aria-hidden
        className="absolute inset-x-0 top-0 hidden h-px origin-left bg-emerald-600 lg:block"
        style={{ scaleX: reduce ? 1 : scrollYProgress }}
      />

      <Stagger as="ol" stagger={0.1} className="lg:grid lg:grid-cols-4 lg:gap-x-16">
        {principles.map((principle, index) => (
          <StaggerItem
            as="li"
            key={principle.title}
            className="relative grid grid-cols-[3.25rem_1fr] items-baseline gap-x-3 border-b border-ink/12 py-7 md:grid-cols-[4.5rem_1fr_1.3fr] md:gap-x-8 md:py-8 lg:row-span-3 lg:grid-cols-1 lg:grid-rows-subgrid lg:items-start lg:gap-x-0 lg:border-b-0 lg:pb-0 lg:pt-9 lg:before:absolute lg:before:inset-y-0 lg:before:-left-8 lg:before:w-px lg:before:bg-ink/12 lg:first:before:hidden"
          >
            <Numeral progress={scrollYProgress} from={index / principles.length} to={(index + 0.55) / principles.length} still={reduce}>
              0{index + 1}
            </Numeral>
            <h3 className="display-sm text-ink lg:mt-4">{principle.title}</h3>
            <p className="col-start-2 mt-3 text-[1rem] leading-relaxed text-ink-soft md:col-start-3 md:mt-0 lg:col-start-1 lg:mt-4">
              {principle.body}
            </p>
          </StaggerItem>
        ))}
      </Stagger>
    </div>
  );
}

function Numeral({
  children,
  progress,
  from,
  to,
  still,
}: {
  children: ReactNode;
  progress: MotionValue<number>;
  from: number;
  to: number;
  still: boolean;
}) {
  const color = useTransform(progress, [from, to], [WAITING, REACHED]);
  return (
    <motion.p
      aria-hidden
      className="font-display text-[2.5rem] leading-none md:text-[3rem] lg:text-[3.25rem]"
      style={{ color: still ? REACHED : color }}
    >
      {children}
    </motion.p>
  );
}
