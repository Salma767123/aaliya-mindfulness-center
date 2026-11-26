import { ViewTransition, type CSSProperties } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getNextPortfolioEntry, getPortfolio, getPortfolioEntry } from "@/lib/api";
import { CallToAction } from "@/components/layout/call-to-action";
import { PageTransition } from "@/components/layout/page-transition";
import { IntroHeading } from "@/components/motion/intro-heading";
import { ParallaxImage } from "@/components/motion/parallax";
import { Reveal, Stagger, StaggerItem, Wipe } from "@/components/motion/reveal";
import { ArrowLeft, ArrowRight } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import { SampleTag } from "@/components/ui/sample-tag";

/**
 * These pages read the slug from the URL, so they render per address rather
 * than from a shared shell. Links to them prefetch the whole page instead
 * (see `prefetch` on the cards), which keeps navigation immediate and lets
 * the cover image morph across the route change.
 */
export const instant = false;

export async function generateStaticParams() {
  const entries = await getPortfolio();
  return entries.map((entry) => ({ slug: entry.slug }));
}

export async function generateMetadata({ params }: PageProps<"/portfolio/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const entry = await getPortfolioEntry(slug);
  if (!entry) return { title: "Portfolio entry not found" };

  return {
    title: entry.title,
    description: entry.summary,
    alternates: { canonical: `/portfolio/${entry.slug}` },
    openGraph: {
      title: entry.title,
      description: entry.summary,
      images: [{ url: entry.cover.src, width: entry.cover.width, height: entry.cover.height, alt: entry.cover.alt }],
    },
  };
}

const delay = (seconds: number) => ({ "--d": `${seconds}s` }) as CSSProperties;

export default async function PortfolioEntryPage({ params }: PageProps<"/portfolio/[slug]">) {
  const { slug } = await params;
  const entry = await getPortfolioEntry(slug);
  if (!entry) notFound();

  const next = await getNextPortfolioEntry(entry.slug);
  const [first, second, third] = entry.gallery;

  return (
    <PageTransition>
      {/* ---------------------------------------------------------------- header */}
      <section className="relative bg-paper pt-32 lg:pt-36">
        <div className="shell">
          <Link
            href="/portfolio"
            className="intro-fade tap group inline-flex items-center gap-3 text-[0.9rem] font-medium text-ink-soft transition-colors hover:text-emerald-700"
          >
            <ArrowLeft className="size-4 transition-transform duration-500 ease-out-expo group-hover:-translate-x-1.5" />
            All work
          </Link>

          <div className="mt-10 grid items-end gap-x-10 gap-y-10 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <p className="eyebrow intro-fade flex flex-wrap items-center gap-3 text-emerald-700" style={delay(0.05)}>
                <span aria-hidden className="size-2.5 shape-leaf bg-emerald-600" />
                {entry.category}
                {entry.sample ? <SampleTag label="Sample entry" /> : null}
              </p>
              <IntroHeading text={entry.title} delay={0.12} stagger={0.05} className="display-lg mt-7 text-ink" />
            </div>

            <dl className="intro-fade grid grid-cols-2 gap-x-8 border-t border-ink/12 pt-6 text-[0.95rem] lg:col-span-4" style={delay(0.55)}>
              <div>
                <dt className="eyebrow text-ink-mute">Kind of work</dt>
                <dd className="mt-2 text-ink">{entry.category}</dd>
              </div>
              <div>
                <dt className="eyebrow text-ink-mute">Scope</dt>
                <dd className="mt-2 text-ink">{entry.scope}</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="shell mt-12 lg:mt-16">
          <div className="relative aspect-[4/3] overflow-hidden rounded-t-[2.5rem] bg-emerald-100 sm:aspect-[16/9] lg:aspect-[21/9] lg:rounded-t-[8rem]">
            <ViewTransition name={`portfolio-${entry.slug}`} share="morph" default="none">
              <Image src={entry.cover.src} alt={entry.cover.alt} fill preload sizes="100vw" className="object-cover" />
            </ViewTransition>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- story */}
      <section className="section-y bg-paper">
        <div className="shell grid gap-x-12 gap-y-14 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-32">
              <Reveal>
                <h2 className="eyebrow text-ink-mute">Programme areas</h2>
              </Reveal>
              <Stagger as="ul" className="mt-5 border-t border-ink/12">
                {entry.highlights.map((highlight) => (
                  <StaggerItem as="li" key={highlight} className="flex gap-3.5 border-b border-ink/12 py-4 text-[0.98rem] leading-snug text-ink">
                    <span aria-hidden className="mt-1.5 size-2 flex-none shape-leaf bg-emerald-600" />
                    {highlight}
                  </StaggerItem>
                ))}
              </Stagger>
            </div>
          </div>

          <div className="lg:col-span-7 lg:col-start-6">
            <Reveal>
              <p className="font-display text-[clamp(1.7rem,2.7vw,2.5rem)] leading-[1.2] text-ink">{entry.summary}</p>
            </Reveal>
            <div className="mt-9 space-y-6 text-[1.06rem] leading-[1.8] text-ink-soft">
              {entry.body.map((paragraph) => (
                <Reveal key={paragraph}>
                  <p>{paragraph}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </div>

        {/* gallery: one band, every photograph the same height, so nothing is left open around them */}
        {first ? (
          <div className="shell mt-12 grid grid-cols-12 gap-3 sm:gap-5 lg:mt-20">
            <Wipe
              from="left"
              className={cn(
                "relative col-span-12 aspect-[4/3] overflow-hidden rounded-[1.25rem] rounded-tl-[5rem] sm:aspect-auto sm:h-[clamp(15rem,31vw,28rem)] sm:rounded-tl-[8rem]",
                third ? "sm:col-span-5" : second ? "sm:col-span-7" : "sm:col-span-12",
              )}
            >
              <ParallaxImage image={first} sizes="(min-width: 640px) 62vw, 130vw" className="size-full" />
            </Wipe>
            {second ? (
              <Wipe
                from="bottom"
                delay={0.1}
                className={cn(
                  "relative aspect-[3/4] overflow-hidden shape-arch sm:aspect-auto sm:h-[clamp(15rem,31vw,28rem)]",
                  third ? "col-span-6 sm:col-span-3" : "col-span-12 sm:col-span-5",
                )}
              >
                <ParallaxImage image={second} sizes="(min-width: 640px) 56vw, 92vw" className="size-full" amount={5} />
              </Wipe>
            ) : null}
            {third ? (
              <Wipe
                from="right"
                delay={0.2}
                className="relative col-span-6 aspect-[3/4] overflow-hidden rounded-[1.25rem] rounded-br-[4rem] sm:col-span-4 sm:aspect-auto sm:h-[clamp(15rem,31vw,28rem)] sm:rounded-br-[8rem]"
              >
                <ParallaxImage image={third} sizes="(min-width: 640px) 58vw, 92vw" className="size-full" />
              </Wipe>
            ) : null}
          </div>
        ) : null}

        {entry.sample ? (
          <div className="shell mt-8">
            <p className="max-w-xl text-[0.86rem] leading-relaxed text-ink-mute">
              Photographs on this page are illustrative. Images, dates and details from the actual programmes can
              be added from the admin panel.
            </p>
          </div>
        ) : null}
      </section>

      {/* ---------------------------------------------------------------- next */}
      {next && next.slug !== entry.slug ? (
        <section className="border-t border-ink/10 bg-mist">
          <Link href={`/portfolio/${next.slug}`} prefetch data-cursor="View" className="group shell flex flex-wrap items-center justify-between gap-x-12 gap-y-8 py-16 lg:py-24">
            <div>
              <p className="eyebrow text-emerald-700">Next in the portfolio</p>
              <p className="display-md mt-5 max-w-3xl text-ink transition-colors duration-500 group-hover:text-emerald-700">
                {next.title}
              </p>
            </div>
            <div className="flex items-center gap-6">
              <div className="relative hidden aspect-[4/5] w-40 overflow-hidden shape-leaf sm:block lg:w-52">
                <Image
                  src={next.cover.src}
                  alt=""
                  fill
                  sizes="208px"
                  className="object-cover transition-transform duration-[1500ms] ease-out-expo group-hover:scale-110"
                />
              </div>
              <span className="grid size-16 flex-none place-items-center rounded-full border border-ink/20 text-ink transition-colors duration-500 group-hover:border-emerald-700 group-hover:bg-emerald-700 group-hover:text-white">
                <ArrowRight className="size-5 transition-transform duration-500 ease-out-expo group-hover:translate-x-1" />
              </span>
            </div>
          </Link>
        </section>
      ) : null}

      <CallToAction
        heading={"Plan a programme\n*with us.*"}
        body="Looking for a talk, a workshop or a longer programme for your school, workplace or organization? Tell us who it is for and we will shape it together."
      />
    </PageTransition>
  );
}
