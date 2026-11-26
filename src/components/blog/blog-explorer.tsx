"use client";

import { useDeferredValue, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { Post } from "@/types/content";
import { EASE_OUT } from "@/lib/motion";
import { Reveal } from "@/components/motion/reveal";
import { FilterChips } from "@/components/ui/filter-chips";
import { CloseIcon, SearchIcon } from "@/components/ui/icons";
import { PostCard } from "./post-card";

const SHAPES = ["rounded-tl-[6rem] rounded-[1.25rem]", "rounded-tr-[6rem] rounded-[1.25rem]"];

type BlogExplorerProps = {
  posts: Post[];
  categories: string[];
};

/** Search and topic filters over the article list. Filtering happens in the browser for now. */
export function BlogExplorer({ posts, categories }: BlogExplorerProps) {
  const [category, setCategory] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);

  const needle = deferredQuery.trim().toLowerCase();
  const visible = posts.filter((post) => {
    if (category && post.category !== category) return false;
    if (!needle) return true;
    return `${post.title} ${post.excerpt} ${post.category}`.toLowerCase().includes(needle);
  });

  function reset() {
    setCategory(null);
    setQuery("");
  }

  return (
    <section className="bg-paper pb-[clamp(3.5rem,7vw,6rem)] pt-[clamp(3.5rem,6vw,6rem)] lg:pt-14">
      <div className="shell">
        <Reveal className="flex flex-wrap items-end justify-between gap-x-10 gap-y-6 border-b border-ink/12 pb-8">
          <h2 className="display-lg text-ink">
            All <em className="text-emerald-600">articles</em>
          </h2>

          <div className="relative w-full sm:w-[22rem]">
            <label htmlFor="blog-search" className="sr-only">
              Search articles
            </label>
            <SearchIcon className="pointer-events-none absolute left-0 top-1/2 size-5 -translate-y-1/2 text-ink-mute" />
            <input
              id="blog-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search articles"
              autoComplete="off"
              className="peer w-full border-b border-ink/25 bg-transparent py-3 pl-8 pr-9 text-[1rem] text-ink outline-none transition-colors duration-300 placeholder:text-ink-mute/70 focus:border-emerald-700 [&::-webkit-search-cancel-button]:hidden"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="absolute right-0 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full text-ink-mute transition-colors hover:bg-ink/5 hover:text-ink"
              >
                <CloseIcon className="size-4" />
              </button>
            ) : null}
          </div>
        </Reveal>

        <Reveal delay={0.1} className="mt-8 flex flex-wrap items-center justify-between gap-x-10 gap-y-4">
          <FilterChips options={categories} value={category} onChange={setCategory} label="Filter articles by topic" />
          <p aria-live="polite" className="text-[0.86rem] text-ink-mute">
            {visible.length} {visible.length === 1 ? "article" : "articles"}
          </p>
        </Reveal>

        <div className="mt-10 grid gap-x-12 gap-y-14 lg:mt-12 lg:grid-cols-2 lg:gap-x-16 lg:gap-y-16">
          <AnimatePresence mode="popLayout" initial={false}>
            {visible.map((post, index) => (
              <motion.div
                key={post.slug}
                layout
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.8, ease: EASE_OUT }}
                              >
                <PostCard post={post} shape={SHAPES[index % SHAPES.length]} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {visible.length === 0 ? (
          <div className="py-10 text-center">
            <p className="font-display text-[clamp(1.8rem,3vw,2.8rem)] text-ink">Nothing matches that search.</p>
            <p className="mt-3 text-ink-soft">Try a different word, or browse every article.</p>
            <button
              type="button"
              onClick={reset}
              className="link-line mt-6 pb-1 text-[0.95rem] font-medium text-emerald-700"
            >
              Clear search and filters
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
