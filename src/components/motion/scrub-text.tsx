"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { cn } from "@/lib/utils";

type ScrubTextProps = {
  text: string;
  className?: string;
  /** Words to set in emerald, matched case-insensitively without punctuation. */
  emphasize?: string[];
};

/** A statement that comes into focus word by word as it is scrolled through. */
export function ScrubText({ text, className, emphasize = [] }: ScrubTextProps) {
  const ref = useRef<HTMLParagraphElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.88", "end 0.5"] });
  const words = text.split(" ");
  const marked = emphasize.map((word) => word.toLowerCase());

  return (
    <p ref={ref} className={className}>
      {words.map((word, index) => {
        const em = marked.includes(word.toLowerCase().replace(/[^a-z]/g, ""));
        return (
          <Word
            key={index}
            progress={scrollYProgress}
            start={index / words.length}
            end={(index + 1.6) / words.length}
            still={Boolean(reduce)}
            className={cn(em && "text-emerald-600")}
          >
            {word}
          </Word>
        );
      })}
    </p>
  );
}

function Word({
  children,
  progress,
  start,
  end,
  still,
  className,
}: {
  children: string;
  progress: MotionValue<number>;
  start: number;
  end: number;
  still: boolean;
  className?: string;
}) {
  const opacity = useTransform(progress, [start, Math.min(end, 1)], [0.13, 1]);
  return (
    <>
      <motion.span className={className} style={still ? undefined : { opacity }}>
        {children}
      </motion.span>{" "}
    </>
  );
}
