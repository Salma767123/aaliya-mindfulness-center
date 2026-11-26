import type { MetadataRoute } from "next";
import { getPortfolio, getPosts } from "@/lib/api";
import { navigation, site } from "@/content/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, portfolio] = await Promise.all([getPosts(), getPortfolio()]);

  return [
    ...navigation.map((item) => ({
      url: `${site.url}${item.href === "/" ? "" : item.href}`,
      changeFrequency: "monthly" as const,
      priority: item.href === "/" ? 1 : 0.8,
    })),
    ...posts.map((post) => ({
      url: `${site.url}/blogs/${post.slug}`,
      lastModified: post.date,
      changeFrequency: "yearly" as const,
      priority: 0.6,
    })),
    ...portfolio.map((entry) => ({
      url: `${site.url}/portfolio/${entry.slug}`,
      changeFrequency: "yearly" as const,
      priority: 0.5,
    })),
  ];
}
