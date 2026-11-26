import type { ArticleBlock, ImageAsset, PortfolioEntry, Post } from "@/types/content";
import { formatDate } from "@/lib/utils";

/**
 * A paragraph of an opening, as it is set on the printed page of the book.
 * A sub-heading is carried by the paragraph it introduces and printed as its first words,
 * so it can never be left alone at the foot of a column.
 */
export type Passage = { kind: "text" | "quote"; text: string; head?: string };

/**
 * What the open book prints on one spread: a title, a standfirst, the opening lines
 * and a photograph. Blog articles and portfolio entries are both set this way.
 * The full text stays on the server.
 */
export type BookPost = {
  slug: string;
  /** Where the spread leads. */
  href: string;
  title: string;
  excerpt: string;
  category: string;
  /** The small line at the head of the page: reading time for an article, who the work was for in the portfolio. */
  note: string;
  /** Put before the note where the page is wide enough for both, e.g. the date. */
  noteLead?: string;
  cover: ImageAsset;
  featured?: boolean;
  sample: boolean;
  /** The first passages, enough to fill the columns of the page. */
  opening: Passage[];
};

/** The start of an article, flattened for the printed page: enough text to fill its columns. */
function opening(body: ArticleBlock[], length = 1400): Passage[] {
  const passages: Passage[] = [];
  let used = 0;
  let head: string | undefined;
  for (const block of body) {
    if (used >= length) break;
    if (block.type === "h2") {
      head = block.text;
      continue;
    }
    const texts = block.type === "list" ? block.items : [block.text];
    for (const text of texts) {
      passages.push({ kind: block.type === "quote" ? "quote" : "text", text, head });
      head = undefined;
      used += text.length;
    }
  }
  return passages;
}

/**
 * Articles in the order the pages of the book run: the featured one first, then
 * the rest as given (newest first from the API).
 */
export function toBookPages(posts: Post[]): BookPost[] {
  const lead = posts.find((post) => post.featured) ?? posts[0];
  if (!lead) return [];
  return [lead, ...posts.filter((post) => post !== lead)].map(
    ({ slug, title, excerpt, category, date, readMinutes, cover, featured, sample, body }) => ({
      slug,
      href: `/blogs/${slug}`,
      title,
      excerpt,
      category,
      note: `${readMinutes} min read`,
      noteLead: formatDate(date),
      cover,
      featured,
      sample,
      opening: opening(body),
    }),
  );
}

/**
 * Portfolio entries as spreads of the book, in the order given. An entry's own
 * paragraphs are the text of its page, and what it drew on closes it.
 */
export function portfolioBookPages(entries: PortfolioEntry[]): BookPost[] {
  return entries.map(({ slug, title, summary, category, scope, cover, sample, body, highlights }) => ({
    slug,
    href: `/portfolio/${slug}`,
    title,
    excerpt: summary,
    category,
    note: scope,
    cover,
    sample,
    opening: [
      ...body.map((text): Passage => ({ kind: "text", text })),
      ...(highlights.length ? [{ kind: "text", text: `${highlights.join(", ")}.`, head: "Drawing on" } as Passage] : []),
    ],
  }));
}
