import type { Metadata } from "next";
import { getPortfolio, getPortfolioCategories } from "@/lib/api";
import { CallToAction } from "@/components/layout/call-to-action";
import { PageTransition } from "@/components/layout/page-transition";
import { IntroHeading } from "@/components/motion/intro-heading";
import { PortfolioGallery } from "@/components/portfolio/portfolio-gallery";
import { PortfolioHero } from "@/components/portfolio/portfolio-hero";

export const metadata: Metadata = {
  title: "Portfolio",
  description:
    "Professional work from Aaliya Mindfulness Center: awareness talks, television programmes, published articles, training and community outreach.",
  alternates: { canonical: "/portfolio" },
};

export default async function PortfolioPage() {
  const [entries, categories] = await Promise.all([getPortfolio(), getPortfolioCategories()]);

  return (
    <PageTransition>
      <PortfolioHero
        entries={entries}
        kinds={categories.filter((category) => entries.some((entry) => entry.category === category)).length}
        lede="A record of professional work beyond the consulting room: on stage, on air, in print, and with institutions and communities across Tamil Nadu."
        header={
          <>
            <p className="eyebrow intro-fade flex items-center gap-3 text-emerald-700">
              <span aria-hidden className="size-2.5 shape-leaf bg-emerald-600" />
              Portfolio
            </p>
            {/* Two lines up to small laptops; from 1280px, where it fits, the heading runs as one line. */}
            <IntroHeading
              text={"Talks, training,\n*writing & outreach.*"}
              delay={0.1}
              className="display-xl mt-5 text-ink"
            />
          </>
        }
      />

      <PortfolioGallery entries={entries} categories={categories} />

      <CallToAction
        heading={"Plan a programme\n*with us.*"}
        body="Looking for a talk, a workshop or a longer programme for your school, workplace or organization? Tell us who it is for and we will shape it together."
      />
    </PageTransition>
  );
}
