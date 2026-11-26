import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

type MarqueeProps = {
  children: ReactNode;
  className?: string;
  /** Seconds for one full loop. */
  duration?: number;
  reverse?: boolean;
};

/** Seamless horizontal loop. Pure CSS; pauses on hover and stops for reduced motion. */
export function Marquee({ children, className, duration = 44, reverse = false }: MarqueeProps) {
  return (
    <div className={cn("marquee overflow-hidden", className)}>
      <div
        className="marquee__track flex w-max animate-marquee"
        style={
          {
            "--marquee-duration": `${duration}s`,
            animationDirection: reverse ? "reverse" : undefined,
          } as CSSProperties
        }
      >
        <div className="flex shrink-0 items-center">{children}</div>
        <div className="flex shrink-0 items-center" aria-hidden>
          {children}
        </div>
      </div>
    </div>
  );
}
