"use client";

import { useRef, type ReactNode } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "motion/react";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import type { ImageAsset } from "@/types/content";
import { cn } from "@/lib/utils";

type ParallaxProps = {
  children: ReactNode;
  className?: string;
  /** Pixels travelled across the element's pass through the viewport. Negative moves against the scroll. */
  distance?: number;
};

/** Moves its children at a different rate from the page while they are on screen. */
export function Parallax({ children, className, distance = 80 }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [distance, -distance]);

  return (
    <motion.div ref={ref} className={className} style={reduce ? undefined : { y }}>
      {children}
    </motion.div>
  );
}

type ParallaxImageProps = {
  image: ImageAsset;
  sizes: string;
  className?: string;
  imageClassName?: string;
  /** How far the picture drifts inside its frame, as a percentage of the frame. */
  amount?: number;
  preload?: boolean;
  /** Overrides the image's default alt text. Pass "" for decorative use. */
  alt?: string;
};

/** A framed image whose picture drifts slowly inside the frame as the page scrolls. */
export function ParallaxImage({ image, sizes, className, imageClassName, amount = 8, preload, alt }: ParallaxImageProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [`-${amount}%`, `${amount}%`]);

  return (
    <div ref={ref} className={cn("relative overflow-hidden", className)}>
      <motion.div className="absolute inset-x-0 -inset-y-[14%]" style={reduce ? undefined : { y }}>
        <Image
          src={image.src}
          alt={alt ?? image.alt}
          fill
          sizes={sizes}
          preload={preload}
          className={cn("object-cover", imageClassName)}
        />
      </motion.div>
    </div>
  );
}
