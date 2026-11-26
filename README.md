# Aaliya Mindfulness Center — website (Phase 1, frontend)

Marketing website for Aaliya Mindfulness Center, Madurai. This phase is the complete public frontend. The admin panel, database and enquiry delivery come in Phase 2.

## Stack

- Next.js 16 (App Router, Cache Components, Partial Prefetching), React 19, TypeScript
- Tailwind CSS 4, with design tokens in `src/app/globals.css`
- Motion (`motion/react`) for scroll and interaction animation, Lenis for smooth scrolling
- React `<ViewTransition>` for page transitions and shared-image morphs

> This Next.js version differs from older releases. Read `AGENTS.md` and the bundled docs in `node_modules/next/dist/docs/` before changing framework-level code.

## Commands

```bash
npm run dev     # development server
npm run build   # production build
npm run start   # serve the production build
npm run lint    # ESLint
```

## Pages

| Route | What it is |
| --- | --- |
| `/` | Home: hero, vision, therapist intro, services, reasons, approach, mindful moment, videos, portfolio, blog, testimonials, call to action |
| `/about` | The practice, therapist profile, philosophy, values, vision |
| `/videos` | Featured video, topic filters, library, player |
| `/blogs`, `/blogs/[slug]` | Article list with search and filters; article page with related articles |
| `/portfolio`, `/portfolio/[slug]` | Professional work, filterable; detail page with gallery |
| `/contact` | Contact details, appointment request form, map |

## Where things live

```
src/
  app/                 routes, layout, global styles, sitemap, robots
  components/
    layout/            header, footer, preloader, page transition, providers, call to action
    motion/            reusable animation primitives (Reveal, SplitHeading, Parallax, Wipe, Marquee ...)
    ui/                button, icons, eyebrow, logo, filter chips, sample tag
    home/ about/ videos/ blog/ portfolio/ contact/   page sections
  content/             all site content as typed data (services, posts, videos, portfolio, site settings)
  lib/api.ts           data access layer: the only place pages read content from
  lib/enquiries.ts     appointment form submission
  types/content.ts     content models
public/brand/          the supplied logo (full lockup and emblem)
public/images/         photography (see IMAGE-CREDITS.md)
```

## Content and placeholders

Real content from the brochure: services, reasons to choose the center, values, achievements, vision, tagline, address and phone.

Not supplied, and left as clearly marked placeholders rather than invented: therapist name, portrait and qualifications, opening hours, email, social links, testimonials, videos, blog articles and portfolio details.

`site.preview` in `src/content/site.ts` controls preview mode. While it is `true`:

- stand-in content carries a small "Sample" mark;
- the appointment form tells the visitor that it is not connected and asks them to call.

Set it to `false` once real content and the backend are in place.

To play a real video, set `youtubeId` on an entry in `src/content/videos.ts`.

## Phase 2 integration points

- **Data**: replace the function bodies in `src/lib/api.ts` with database or API calls. Signatures are already async and typed, so pages and components do not change. Add `'use cache'` and `cacheTag()` there so the admin panel can revalidate.
- **Enquiries (Lead Management, SMTP)**: set `NEXT_PUBLIC_ENQUIRY_ENDPOINT`, or replace `submitEnquiry` in `src/lib/enquiries.ts` with a Server Action.
- **SEO Management**: each page exports `metadata` or `generateMetadata`; posts already accept a per-post `seo` override.
- **Site URL**: set `NEXT_PUBLIC_SITE_URL` for canonical URLs, the sitemap and social previews.

## Motion

Animation tokens are in `src/lib/motion.ts`; CSS-driven hero intros, the preloader, buttons and page transitions are in `globals.css`. Everything respects `prefers-reduced-motion`: the preloader, smooth scrolling and movement are switched off and content is shown immediately.

## Logo

The logo files were cropped from the supplied brochure image, so they are low resolution. Replace `public/brand/aaliya-logo.png` and `aaliya-mark.png` (and `src/app/icon.png`, `apple-icon.png`) with the original artwork when it is available.
