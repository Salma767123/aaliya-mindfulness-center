/**
 * Data access layer.
 *
 * Phase 1 (this build) reads from the local content modules in src/content.
 * Phase 2 replaces the body of each function with a database or API call
 * (Next.js + Neon Postgres, managed from the admin panel). Pages and
 * components only ever import from here, so they do not need to change.
 *
 * Every function is async on purpose: the signatures already match what a
 * real data source will return. When these become real queries, add
 * `'use cache'` and `cacheTag(...)` here so the admin panel can revalidate.
 */
import { approach, mindfulNotes, reasons, services, testimonials, therapist, values, visionStages } from "@/content/center";
import { portfolio, portfolioCategories } from "@/content/portfolio";
import { postCategories, posts } from "@/content/posts";
import { videoCategories, videos } from "@/content/videos";
import type {
  ApproachStep,
  MindfulNote,
  PortfolioEntry,
  Post,
  Reason,
  Service,
  Testimonial,
  Therapist,
  Value,
  Video,
  VisionStage,
} from "@/types/content";

export async function getServices(): Promise<Service[]> {
  return services;
}

export async function getReasons(): Promise<Reason[]> {
  return reasons;
}

export async function getValues(): Promise<Value[]> {
  return values;
}

export async function getVisionStages(): Promise<VisionStage[]> {
  return visionStages;
}

export async function getApproach(): Promise<ApproachStep[]> {
  return approach;
}

export async function getMindfulNotes(): Promise<MindfulNote[]> {
  return mindfulNotes;
}

export async function getTherapist(): Promise<Therapist> {
  return therapist;
}

export async function getTestimonials(): Promise<Testimonial[]> {
  return testimonials;
}

export async function getVideos(): Promise<Video[]> {
  return videos;
}

export async function getVideoCategories(): Promise<string[]> {
  return [...videoCategories];
}

export async function getPosts(): Promise<Post[]> {
  return [...posts].sort((a, b) => b.date.localeCompare(a.date));
}

export async function getPostCategories(): Promise<string[]> {
  return [...postCategories];
}

export async function getPost(slug: string): Promise<Post | null> {
  return posts.find((post) => post.slug === slug) ?? null;
}

export async function getRelatedPosts(slug: string, limit = 3): Promise<Post[]> {
  const all = await getPosts();
  const current = all.find((post) => post.slug === slug);
  const others = all.filter((post) => post.slug !== slug);
  if (!current) return others.slice(0, limit);
  // Same category first, then the most recent of the rest.
  const same = others.filter((post) => post.category === current.category);
  const rest = others.filter((post) => post.category !== current.category);
  return [...same, ...rest].slice(0, limit);
}

export async function getPortfolio(): Promise<PortfolioEntry[]> {
  return portfolio;
}

export async function getPortfolioCategories(): Promise<string[]> {
  return [...portfolioCategories];
}

export async function getPortfolioEntry(slug: string): Promise<PortfolioEntry | null> {
  return portfolio.find((entry) => entry.slug === slug) ?? null;
}

export async function getNextPortfolioEntry(slug: string): Promise<PortfolioEntry | null> {
  const index = portfolio.findIndex((entry) => entry.slug === slug);
  if (index === -1) return null;
  return portfolio[(index + 1) % portfolio.length];
}
