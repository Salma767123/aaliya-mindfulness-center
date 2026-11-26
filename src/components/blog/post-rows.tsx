"use client";

import { useRef, useState, type PointerEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useMotionValue, useSpring } from "motion/react";
import type { Post } from "@/types/content";
import { cn, formatDate } from "@/lib/utils";
import { Reveal } from "@/components/motion/reveal";
import { ArrowUpRight } from "@/components/ui/icons";

/**
 * Article titles as a ledger. With a mouse, the cover of the hovered article
 * floats beside the pointer; on touch screens each row shows a small cover.
 * With `fill`, the rows share out the height of the column they sit in, so the
 * ledger ends level with whatever stands beside it.
 */
export function PostRows({ posts, className, fill }: { posts: Post[]; className?: string; fill?: boolean }) {
  const listRef = useRef<HTMLOListElement>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 190, damping: 24, mass: 0.6 });
  const springY = useSpring(y, { stiffness: 190, damping: 24, mass: 0.6 });

  function handleMove(event: PointerEvent<HTMLOListElement>) {
    if (event.pointerType !== "mouse" || !listRef.current) return;
    const rect = listRef.current.getBoundingClientRect();
    x.set(event.clientX - rect.left);
    y.set(event.clientY - rect.top);
  }

  return (
    <ol
      ref={listRef}
      className={cn("relative", fill && "flex h-full flex-col", className)}
      onPointerMove={handleMove}
      onPointerLeave={() => setHovered(null)}
    >
      {posts.map((post, index) => (
        <Reveal
          as="li"
          key={post.slug}
          delay={index * 0.07}
          className={cn("border-t border-ink/12 last:border-b", fill && "flex flex-1 flex-col")}
        >
          <Link
            href={`/blogs/${post.slug}`}
            prefetch
            data-cursor="Read"
            onPointerEnter={(event) => {
              if (event.pointerType === "mouse") setHovered(index);
            }}
            onFocus={() => setHovered(null)}
            className={cn("group flex items-center gap-5 py-6 sm:py-7", fill && "flex-1")}
          >
            <span className="relative block aspect-square w-20 flex-none overflow-hidden rounded-2xl sm:w-24 [@media(hover:hover)_and_(pointer:fine)]:hidden">
              <Image src={post.cover.src} alt="" fill sizes="96px" className="object-cover" />
            </span>
            <span className="flex-1">
              <span className="eyebrow block text-emerald-700">
                {post.category}
                <span className="mx-2 text-ink-mute/60">·</span>
                <span className="text-ink-mute">{formatDate(post.date)}</span>
              </span>
              <span className="mt-2.5 block font-display text-[clamp(1.4rem,2vw,1.95rem)] leading-[1.14] text-ink transition-colors duration-500 group-hover:text-emerald-700">
                {post.title}
              </span>
            </span>
            <span className="hidden size-10 flex-none place-items-center rounded-full border border-ink/15 text-ink transition-colors duration-500 group-hover:border-emerald-700 group-hover:bg-emerald-700 group-hover:text-white sm:grid">
              <ArrowUpRight className="size-4" />
            </span>
          </Link>
        </Reveal>
      ))}

      {/* floating cover, mouse only */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 z-10 hidden [@media(hover:hover)_and_(pointer:fine)]:block"
        style={{ x: springX, y: springY }}
      >
        <motion.div
          className="relative -ml-[7.5rem] -mt-[9.5rem] aspect-[4/5] w-60 overflow-hidden shape-leaf shadow-[0_30px_70px_-30px_rgb(5_58_37/0.55)]"
          initial={false}
          animate={{ scale: hovered === null ? 0.5 : 1, opacity: hovered === null ? 0 : 1, rotate: hovered === null ? -6 : 0 }}
          transition={{ type: "spring", stiffness: 220, damping: 24 }}
        >
          {posts.map((post, index) => (
            <Image
              key={post.slug}
              src={post.cover.src}
              alt=""
              fill
              sizes="240px"
              className={cn(
                "object-cover transition-opacity duration-500",
                hovered === index ? "opacity-100" : "opacity-0",
              )}
            />
          ))}
        </motion.div>
      </motion.div>
    </ol>
  );
}
