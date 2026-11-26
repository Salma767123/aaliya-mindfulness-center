/**
 * Site-wide settings. In the next phase these come from the admin panel
 * (contact details, SEO defaults, SMTP-backed enquiry form).
 */
export const site = {
  name: "Aaliya Mindfulness Center",
  shortName: "Aaliya",
  descriptor: "Mindfulness Center",
  tagline: "Nurturing Minds, Empowering Lives",
  description:
    "Aaliya Mindfulness Center in Madurai offers psychological counseling, mindfulness and wellness programmes, training, educational programmes and community outreach, with confidential and compassionate care.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  locale: "en_IN",

  /**
   * Preview mode. While true, stand-in content (testimonials, articles, videos,
   * portfolio entries) carries a small "Sample" mark, and the enquiry form says
   * that it is not yet connected. Set to false once real content and the
   * backend are in place.
   */
  preview: true,

  phone: { display: "+91 96261 62662", href: "tel:+919626162662" },
  /**
   * The floating WhatsApp button. `number` is the full international number with
   * no "+", spaces or dashes; `message` is what a visitor's chat starts with.
   */
  whatsapp: {
    number: "919626162662",
    message: "Hello Aaliya Mindfulness Center, I would like to book a consultation.",
  },
  /** Not supplied yet. Add an address here and it appears in the footer and contact page. */
  email: null as string | null,
  address: {
    lines: ["Aaliya Mindfulness Center", "Theekathir, Milakaranai", "Madurai, Tamil Nadu"],
    city: "Madurai",
    region: "Tamil Nadu",
    country: "IN",
    mapQuery: "Aaliya Mindfulness Center, Theekathir, Milakaranai, Madurai, Tamil Nadu",
  },
  /** Not supplied yet. */
  hours: { text: "Consultations by appointment", placeholder: true },
  /** Not supplied yet. Entries appear in the footer when added: { label, href }. */
  socials: [] as { label: string; href: string }[],

  vision:
    "To become a leading center for mental wellness and mindfulness, fostering emotionally resilient individuals and healthier communities.",
} as const;

export const navigation = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Videos", href: "/videos" },
  { label: "Blogs", href: "/blogs" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "Contact", href: "/contact" },
] as const;

/** A link that opens a WhatsApp chat with the center, with the opening message filled in. */
export function whatsappUrl(message: string = site.whatsapp.message) {
  return `https://wa.me/${site.whatsapp.number}?text=${encodeURIComponent(message)}`;
}

export function mapEmbedUrl() {
  return `https://www.google.com/maps?q=${encodeURIComponent(site.address.mapQuery)}&output=embed`;
}

export function mapLinkUrl() {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(site.address.mapQuery)}`;
}
