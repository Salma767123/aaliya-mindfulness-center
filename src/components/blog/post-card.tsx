import { ViewTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Post } from "@/types/content";
import { cn, formatDate } from "@/lib/utils";
import { SampleTag } from "@/components/ui/sample-tag";

type PostCardProps = {
  post: Post;
  className?: string;
  /** Corner treatment of the cover, so neighbouring cards do not look stamped out. */
  shape?: string;
  sizes?: string;
};

/** Article teaser: cover, meta line, title and excerpt. The cover morphs into the article's hero image. */
export function PostCard({
  post,
  className,
  shape = "rounded-[1.5rem]",
  sizes = "(min-width: 1024px) 44vw, 94vw",
}: PostCardProps) {
  return (
    <article className={className}>
      <Link href={`/blogs/${post.slug}`} prefetch data-cursor="Read" className="group block">
        <div className={cn("relative aspect-[4/3] overflow-hidden bg-emerald-100", shape)}>
          <ViewTransition name={`post-${post.slug}`} share="morph" default="none">
            <Image
              src={post.cover.src}
              alt={post.cover.alt}
              fill
              sizes={sizes}
              className="object-cover transition-transform duration-[1500ms] ease-out-expo group-hover:scale-[1.06]"
            />
          </ViewTransition>
        </div>
        <p className="eyebrow mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 text-emerald-700">
          {post.category}
          <span className="text-ink-mute">{formatDate(post.date)}</span>
          <span className="text-ink-mute">{post.readMinutes} min read</span>
          {post.sample ? <SampleTag /> : null}
        </p>
        <h3 className="display-sm mt-3.5 text-ink transition-colors duration-500 group-hover:text-emerald-700">
          {post.title}
        </h3>
        <p className="mt-3.5 max-w-xl text-[1rem] leading-relaxed text-ink-soft">{post.excerpt}</p>
      </Link>
    </article>
  );
}
