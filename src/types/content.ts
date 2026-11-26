/**
 * Content models shared by the pages and the data layer (src/lib/api.ts).
 * These mirror the modules the admin panel will manage in the next phase:
 * services, about, videos, blogs, portfolio, testimonials, SEO and leads.
 */

export type ImageAsset = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

export type Service = {
  slug: string;
  index: string;
  title: string;
  summary: string;
  items: string[];
  image: ImageAsset;
};

export type VisionStage = {
  /** One part of the vision statement. Read in order, the phrases form the whole sentence. */
  phrase: string;
  /** Words in the phrase to pick out in colour. */
  emphasis?: string[];
  /** Short name for this stage of the vision. */
  label: string;
  /** Words carried around this stage's ring. */
  ring: string;
  caption: string;
};

export type Value = {
  title: string;
  description: string;
};

export type ApproachStep = {
  index: string;
  title: string;
  description: string;
};

export type MindfulNote = {
  title: string;
  body: string;
};

export type Testimonial = {
  id: string;
  quote: string;
  attribution: string;
  context: string;
  /** True while this is stand-in copy awaiting real client feedback. */
  sample: boolean;
};

export type Video = {
  id: string;
  title: string;
  description: string;
  category: string;
  duration: string;
  /** YouTube video id. Null until a video is linked from the admin panel. */
  youtubeId: string | null;
  poster: ImageAsset;
  featured?: boolean;
  sample: boolean;
};

export type ArticleBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "quote"; text: string }
  | { type: "list"; items: string[] };

export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  /** ISO date (YYYY-MM-DD). */
  date: string;
  readMinutes: number;
  cover: ImageAsset;
  body: ArticleBlock[];
  featured?: boolean;
  sample: boolean;
  seo?: { title?: string; description?: string };
};

export type PortfolioEntry = {
  slug: string;
  title: string;
  category: string;
  /** Short qualifier shown beside the title, e.g. where or for whom. */
  scope: string;
  summary: string;
  body: string[];
  highlights: string[];
  cover: ImageAsset;
  gallery: ImageAsset[];
  sample: boolean;
};

export type Qualification = {
  title: string;
  detail: string;
  placeholder: boolean;
};

/** One strand of the founder's public work, as the home page introduces it. */
export type Recognition = {
  /** The achievement, as the brochure words it. */
  title: string;
  /** Where that work is seen, in a few words. Connecting copy written for the website. */
  label: string;
  /** Which small drawing stands for it. */
  icon: "microphone" | "trophy" | "television" | "book" | "board";
  /** A photograph of that kind of work. */
  image: ImageAsset;
  /** CSS object-position, for photographs whose subject sits off-centre. */
  focus?: string;
};

export type Therapist = {
  /** Null until supplied; the UI shows the role instead. */
  name: string | null;
  role: string;
  intro: string;
  /** The introduction as one short line, without a full stop, for the home page. */
  summary?: string;
  bio: string[];
  /** Null until a portrait is supplied; the UI shows a neutral frame. */
  portrait: ImageAsset | null;
  qualifications: Qualification[];
  achievements: string[];
  /** The same achievements with a label, a drawing and a photograph each, for the home page. */
  recognition: Recognition[];
};

export type Enquiry = {
  name: string;
  phone: string;
  email: string;
  service: string;
  preferredDate: string;
  message: string;
  consent: boolean;
};

/** One of the "Why choose Aaliya" commitments on the home page. */
export type Reason = {
  /** The commitment, as the brochure words it. */
  title: string;
  /** One line that says what it means in practice. Connecting copy written for the website. */
  description: string;
  /** Which small drawing stands for it. */
  icon: "shield" | "lock" | "flask" | "medal" | "sliders" | "lotus" | "people";
};
