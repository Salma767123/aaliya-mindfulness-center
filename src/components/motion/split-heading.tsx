"use client";

import { motion } from "motion/react";
import { EASE_OUT, VIEWPORT } from "@/lib/motion";
import { cn, parseHeading, plainHeading } from "@/lib/utils";

const TAGS = { h1: motion.h1, h2: motion.h2, h3: motion.h3, p: motion.p } as const;

type SplitHeadingProps = {
  /** Heading copy. *Asterisks* mark emphasis, "\n" starts a new line. */
  text: string;
  as?: keyof typeof TAGS;
  className?: string;
  emClassName?: string;
  delay?: number;
  stagger?: number;
};

/**
 * Heading whose words rise out of a mask, one after another, when scrolled into view.
 * Screen readers get the plain sentence; the split words are presentation only.
 */
export function SplitHeading({
  text,
  as = "h2",
  className,
  emClassName = "text-emerald-600",
  delay = 0,
  stagger = 0.06,
}: SplitHeadingProps) {
  const Tag = TAGS[as] as typeof motion.h2;
  const lines = parseHeading(text);
  let count = 0;

  return (
    <Tag className={className} aria-label={plainHeading(text)} initial="hidden" whileInView="show" viewport={VIEWPORT}>
      {lines.map((words, lineIndex) => (
        <span key={lineIndex} aria-hidden className="block">
          {words.map((word, wordIndex) => {
            const order = count++;
            return (
              <span key={wordIndex}>
                <span className="intro-mask">
                  <motion.span
                    className={cn("inline-block", word.em && emClassName)}
                    variants={{
                      hidden: { y: "115%", rotate: 3 },
                      show: {
                        y: "0%",
                        rotate: 0,
                        transition: { duration: 1.15, ease: EASE_OUT, delay: delay + order * stagger },
                      },
                    }}
                  >
                    {word.text}
                  </motion.span>
                </span>
                {wordIndex < words.length - 1 ? " " : null}
              </span>
            );
          })}
        </span>
      ))}
    </Tag>
  );
}
