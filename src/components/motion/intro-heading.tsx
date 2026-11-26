import type { CSSProperties } from "react";
import { cn, parseHeading, plainHeading } from "@/lib/utils";

type IntroHeadingProps = {
  /** Heading copy. *Asterisks* mark emphasis, "\n" starts a new line. */
  text: string;
  as?: "h1" | "h2" | "p";
  className?: string;
  emClassName?: string;
  /** Seconds before the first word, on top of the page intro delay. */
  delay?: number;
  stagger?: number;
};

/**
 * Page-hero heading. Animated with plain CSS (see .intro-rise in globals.css)
 * so the words start rising on first paint, without waiting for JavaScript.
 */
export function IntroHeading({
  text,
  as: Tag = "h1",
  className,
  emClassName = "text-emerald-600",
  delay = 0,
  stagger = 0.07,
}: IntroHeadingProps) {
  const lines = parseHeading(text);
  let count = 0;

  return (
    <Tag className={className} aria-label={plainHeading(text)}>
      {lines.map((words, lineIndex) => (
        <span key={lineIndex} aria-hidden className="block">
          {words.map((word, wordIndex) => {
            const order = count++;
            return (
              <span key={wordIndex}>
                <span className="intro-mask">
                  <span
                    className={cn("intro-rise", word.em && emClassName)}
                    style={{ "--d": `${(delay + order * stagger).toFixed(2)}s` } as CSSProperties}
                  >
                    {word.text}
                  </span>
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
