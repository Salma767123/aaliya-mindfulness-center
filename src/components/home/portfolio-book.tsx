import type { CSSProperties } from "react";
import type { PortfolioEntry } from "@/types/content";
import { portfolioBookPages } from "@/lib/article-pages";
import { ArticleBook } from "@/components/blog/article-book";
import { Reveal } from "@/components/motion/reveal";
import { SplitHeading } from "@/components/motion/split-heading";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { SampleTag } from "@/components/ui/sample-tag";

/**
 * Professional work beyond the consulting room, as an open book: one entry to a
 * spread, its account on the left page and its photograph on the right, with
 * pages that turn (see ArticleBook).
 */
export function PortfolioBook({ entries }: { entries: PortfolioEntry[] }) {
  const pages = portfolioBookPages(entries);
  if (!pages.length) return null;

  return (
    // the book's arrow buttons are ringed in the colour of the ground they sit on
    <section className="section-y relative bg-mist" style={{ "--book-ground": "var(--color-mist)" } as CSSProperties}>
      <div className="shell">
        {/* the book keeps to a compact measure in the middle of the page */}
        <div className="mx-auto max-w-[72rem]">
        <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-6">
          <div>
            <Reveal>
              <Eyebrow index="07">Portfolio</Eyebrow>
            </Reveal>
            <SplitHeading text={"Work beyond the *consulting room.*"} className="display-lg mt-5 text-ink" />
          </div>
          <Reveal delay={0.15} className="flex max-w-full flex-wrap items-center gap-x-4 gap-y-3">
            {entries.some((entry) => entry.sample) ? <SampleTag label="Sample entries" /> : null}
            <Button href="/portfolio" variant="outline">
              View the portfolio
            </Button>
          </Reveal>
        </div>

        <Reveal delay={0.1} className="mt-8 lg:mt-10">
          <ArticleBook
            posts={pages}
            titleAs="h3"
            words={{
              all: "Portfolio",
              one: "entry",
              more: "See this work",
              cursor: "View",
              swipe: `Swipe through ${pages.length} pieces of work`,
            }}
          />
        </Reveal>
        </div>
      </div>
    </section>
  );
}
