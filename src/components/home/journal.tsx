import type { Post } from "@/types/content";
import { formatDate } from "@/lib/utils";
import { PhotoRail, type RailItem } from "./photo-rail";

/** Latest writing, as a row of pictures to travel along: the featured article first, then newest first. */
export function Journal({ posts }: { posts: Post[] }) {
  if (!posts.length) return null;
  const lead = posts.find((post) => post.featured) ?? posts[0];
  const items: RailItem[] = [lead, ...posts.filter((post) => post !== lead)].map((post) => ({
    slug: post.slug,
    href: `/blogs/${post.slug}`,
    category: post.category,
    title: post.title,
    note: `${formatDate(post.date)} · ${post.readMinutes} min read`,
    cover: post.cover,
    sample: post.sample,
    transition: `post-${post.slug}`,
  }));

  return (
    <PhotoRail
      index="08"
      eyebrow="From the blog"
      heading={"Notes on mind, emotion *and well-being.*"}
      action={{ href: "/blogs", label: "Read all articles" }}
      items={items}
      closing={{
        text: "Short reads on mind, emotion and well-being, gathered in one place.",
        label: "Read all articles",
        sampleLabel: "Sample articles",
      }}
      cursor="Read"
      tone="paper"
    />
  );
}
