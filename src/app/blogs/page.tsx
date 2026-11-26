import type { Metadata } from "next";
import { getPostCategories, getPosts } from "@/lib/api";
import { toBookPages } from "@/lib/article-pages";
import { BlogExplorer } from "@/components/blog/blog-explorer";
import { BlogHero } from "@/components/blog/blog-hero";
import { CallToAction } from "@/components/layout/call-to-action";
import { PageTransition } from "@/components/layout/page-transition";
import { IntroHeading } from "@/components/motion/intro-heading";

export const metadata: Metadata = {
  title: "Blogs",
  description:
    "Articles on mindfulness, emotional health, counseling, family life and well-being at work from Aaliya Mindfulness Center.",
  alternates: { canonical: "/blogs" },
};

/**
 * What a visitor might have on their mind, and the article that speaks to it. The hero
 * offers these as its way in. Connecting copy written for the website; an article
 * without a line here is offered by its topic.
 */
const prompts: Record<string, string> = {
  "five-quiet-minutes-mindful-breathing": "I want to feel calmer",
  "stress-or-anxiety-telling-them-apart": "Is this stress or anxiety?",
  "what-happens-in-a-first-counseling-session": "I am thinking about counseling",
  "helping-your-teenager-open-up": "My teenager will not talk to me",
  "work-life-balance-is-a-practice": "Work is taking over",
  "grief-has-no-timetable": "I am grieving",
};

export default async function BlogsPage() {
  const [posts, categories] = await Promise.all([getPosts(), getPostCategories()]);
  return (
    <PageTransition>
      <BlogHero
        posts={toBookPages(posts)}
        prompts={prompts}
        lede="Short, practical writing on mindfulness, emotional health, relationships and well-being at work."
        header={
          <>
            <p className="eyebrow intro-fade flex items-center gap-3 text-emerald-700">
              <span aria-hidden className="size-2.5 shape-leaf bg-emerald-600" />
              Blogs
            </p>
            <IntroHeading
              text={"Reading for\n*steadier days.*"}
              delay={0.1}
              className="display-xl mt-5 text-ink"
            />
          </>
        }
      />

      <BlogExplorer posts={posts} categories={categories} />

      <CallToAction heading={"Reading helps.\n*Talking helps more.*"} />
    </PageTransition>
  );
}
