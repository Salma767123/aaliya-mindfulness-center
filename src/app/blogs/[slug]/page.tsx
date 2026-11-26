import { ViewTransition, type CSSProperties } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPost, getPosts, getRelatedPosts } from "@/lib/api";
import { site } from "@/content/site";
import { formatDate } from "@/lib/utils";
import { CopyLink, ReadingProgress } from "@/components/blog/article-tools";
import { PostCard } from "@/components/blog/post-card";
import { CallToAction } from "@/components/layout/call-to-action";
import { PageTransition } from "@/components/layout/page-transition";
import { IntroHeading } from "@/components/motion/intro-heading";
import { Reveal } from "@/components/motion/reveal";
import { SplitHeading } from "@/components/motion/split-heading";
import { Eyebrow } from "@/components/ui/eyebrow";
import { ArrowLeft } from "@/components/ui/icons";
import { SampleTag } from "@/components/ui/sample-tag";

/**
 * These pages read the slug from the URL, so they render per address rather
 * than from a shared shell. Links to them prefetch the whole page instead
 * (see `prefetch` on the cards), which keeps navigation immediate and lets
 * the cover image morph across the route change.
 */
export const instant = false;

export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps<"/blogs/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Article not found" };

  const title = post.seo?.title ?? post.title;
  const description = post.seo?.description ?? post.excerpt;
  return {
    title,
    description,
    alternates: { canonical: `/blogs/${post.slug}` },
    openGraph: {
      type: "article",
      title,
      description,
      publishedTime: post.date,
      images: [{ url: post.cover.src, width: post.cover.width, height: post.cover.height, alt: post.cover.alt }],
    },
  };
}

const delay = (seconds: number) => ({ "--d": `${seconds}s` }) as CSSProperties;

export default async function BlogPostPage({ params }: PageProps<"/blogs/[slug]">) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const related = await getRelatedPosts(post.slug, 3);

  return (
    <PageTransition>
      <article>
        {/* ---------------------------------------------------------------- header */}
        <header className="relative bg-paper pt-32 lg:pt-40">
          <div className="shell">
            <Link
              href="/blogs"
              className="intro-fade tap group inline-flex items-center gap-3 text-[0.9rem] font-medium text-ink-soft transition-colors hover:text-emerald-700"
            >
              <ArrowLeft className="size-4 transition-transform duration-500 ease-out-expo group-hover:-translate-x-1.5" />
              All articles
            </Link>

            <div className="mt-10 grid gap-x-10 gap-y-8 lg:grid-cols-12">
              <div className="lg:col-span-9">
                <p className="eyebrow intro-fade flex flex-wrap items-center gap-x-3 gap-y-2 text-emerald-700" style={delay(0.05)}>
                  <span aria-hidden className="size-2.5 shape-leaf bg-emerald-600" />
                  {post.category}
                  <span className="text-ink-mute">{formatDate(post.date)}</span>
                  <span className="text-ink-mute">{post.readMinutes} min read</span>
                  {post.sample ? <SampleTag label="Sample article" /> : null}
                </p>
                <IntroHeading text={post.title} delay={0.12} stagger={0.045} className="display-lg mt-7 text-ink" />
              </div>
            </div>
            <p className="lede intro-fade mt-8 max-w-2xl text-ink-soft" style={delay(0.6)}>
              {post.excerpt}
            </p>
          </div>

          <div className="shell mt-12 lg:mt-16">
            <div className="relative aspect-[4/3] overflow-hidden rounded-t-[2.5rem] bg-emerald-100 sm:aspect-[16/9] lg:aspect-[21/9] lg:rounded-t-[8rem]">
              <ViewTransition name={`post-${post.slug}`} share="morph" default="none">
                <Image src={post.cover.src} alt={post.cover.alt} fill preload sizes="100vw" className="object-cover" />
              </ViewTransition>
            </div>
          </div>
        </header>

        {/* ---------------------------------------------------------------- body */}
        <div className="shell grid gap-x-12 gap-y-10 py-16 lg:grid-cols-12 lg:py-24">
          <aside className="lg:col-span-3">
            <div className="flex flex-wrap items-center justify-between gap-6 border-b border-ink/12 pb-8 lg:sticky lg:top-32 lg:block lg:border-b-0 lg:pb-0">
              <div>
                <p className="eyebrow text-ink-mute">Written by</p>
                <p className="mt-2.5 font-display text-[1.45rem] leading-tight text-ink">{site.name}</p>
              </div>
              <div className="lg:mt-8">
                <CopyLink />
              </div>
            </div>
          </aside>

          <ReadingProgress className="prose-amc lg:col-span-7 lg:col-start-5">
            {post.body.map((block, index) => {
              switch (block.type) {
                case "h2":
                  return <h2 key={index}>{block.text}</h2>;
                case "quote":
                  return <blockquote key={index}>{block.text}</blockquote>;
                case "list":
                  return (
                    <ul key={index}>
                      {block.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  );
                default:
                  return <p key={index}>{block.text}</p>;
              }
            })}

            <div className="!mt-14 rounded-2xl bg-mist p-6 sm:p-8">
              <p className="!text-[0.92rem] !leading-relaxed">
                This article offers general information about mental well-being. It is not a diagnosis or a
                substitute for professional care. If you are struggling, please speak with a qualified mental
                health professional.
              </p>
            </div>
          </ReadingProgress>
        </div>
      </article>

      {/* ---------------------------------------------------------------- related */}
      {related.length > 0 ? (
        <section className="section-y border-t border-ink/10 bg-paper">
          <div className="shell">
            <Reveal>
              <Eyebrow>Keep reading</Eyebrow>
            </Reveal>
            <SplitHeading text={"Related *articles*"} className="display-lg mt-5 text-ink" />
            <div className="mt-12 grid gap-x-10 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
              {related.map((item, index) => (
                <Reveal key={item.slug} delay={index * 0.08}>
                  <PostCard post={item} sizes="(min-width: 1024px) 30vw, (min-width: 768px) 46vw, 94vw" />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <CallToAction heading={"Reading helps.\n*Talking helps more.*"} />
    </PageTransition>
  );
}
