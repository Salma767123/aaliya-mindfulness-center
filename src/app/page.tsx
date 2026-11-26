import type { Metadata } from "next";
import {
  getApproach,
  getMindfulNotes,
  getPortfolio,
  getPosts,
  getServices,
  getTestimonials,
  getTherapist,
  getVideos,
  getVisionStages,
} from "@/lib/api";
import { AboutIntro } from "@/components/home/about-intro";
import { Approach } from "@/components/home/approach";
import { Breathing } from "@/components/home/breathing";
import { FeaturedVideos } from "@/components/home/featured-videos";
import { Hero } from "@/components/home/hero";
import { Journal } from "@/components/home/journal";
import { PortfolioBook } from "@/components/home/portfolio-book";
import { Services } from "@/components/home/services";
import { Testimonials } from "@/components/home/testimonials";
import { Vision } from "@/components/home/vision";
import { CallToAction } from "@/components/layout/call-to-action";
import { PageTransition } from "@/components/layout/page-transition";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const [services, approach, notes, therapist, testimonials, videos, posts, portfolio, visionStages] =
    await Promise.all([
      getServices(),
      getApproach(),
      getMindfulNotes(),
      getTherapist(),
      getTestimonials(),
      getVideos(),
      getPosts(),
      getPortfolio(),
      getVisionStages(),
    ]);

  return (
    <PageTransition>
      <Hero />
      <Vision stages={visionStages} />
      <AboutIntro therapist={therapist} />
      <Services services={services} />
      <Approach steps={approach} />
      <Breathing notes={notes} />
      <FeaturedVideos videos={videos} />
      <PortfolioBook entries={portfolio} />
      <Journal posts={posts} />
      <Testimonials testimonials={testimonials} />
      <CallToAction journey />
    </PageTransition>
  );
}
