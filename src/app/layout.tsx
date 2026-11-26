import { Suspense } from "react";
import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Hanken_Grotesk, Manrope } from "next/font/google";
import { site } from "@/content/site";
import { Cursor } from "@/components/layout/cursor";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { Preloader } from "@/components/layout/preloader";
import { Providers } from "@/components/layout/providers";
import { SkipLink } from "@/components/layout/skip-link";
import { WhatsAppButton } from "@/components/layout/whatsapp-button";
import "./globals.css";

/**
 * Headings. Manrope is a plain, even sans-serif: it reads as a heading at every
 * size and sits with the body face. Nothing on the site is set in italics.
 */
const display = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

/** The "AALIYA" wordmark only, so it keeps the lettering of the center's logo. */
const wordmark = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: "500",
  display: "swap",
});

const sans = Hanken_Grotesk({
  variable: "--font-hanken",
  subsets: ["latin"],
  display: "swap",
});

const defaultTitle = `${site.name} | Psychological Counseling & Mindfulness in Madurai`;

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: defaultTitle, template: `%s | ${site.name}` },
  description: site.description,
  applicationName: site.name,
  openGraph: {
    type: "website",
    siteName: site.name,
    title: defaultTitle,
    description: site.description,
    locale: site.locale,
    images: [{ url: "/images/swan-lake.jpg", width: 2400, height: 1600, alt: "A white swan on a calm green lake" }],
  },
  twitter: { card: "summary_large_image", title: defaultTitle, description: site.description },
};

export const viewport: Viewport = {
  themeColor: "#053a25",
};

/**
 * Runs before first paint. Plays the preloader on the first full load of a
 * session (never for reduced-motion visitors) and marks it done afterwards so
 * later in-app navigations start their hero animations straight away.
 */
const introScript = `(function(){try{var d=document.documentElement;var r=window.matchMedia('(prefers-reduced-motion: reduce)').matches;if(!r&&!sessionStorage.getItem('amc-intro')){d.setAttribute('data-intro','play');sessionStorage.setItem('amc-intro','1');setTimeout(function(){d.setAttribute('data-intro','done')},2900)}else{d.setAttribute('data-intro','done')}}catch(e){}})();`;

const structuredData = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: site.name,
  description: site.description,
  slogan: site.tagline,
  url: site.url,
  telephone: site.phone.display,
  address: {
    "@type": "PostalAddress",
    streetAddress: site.address.lines[1],
    addressLocality: site.address.city,
    addressRegion: site.address.region,
    addressCountry: site.address.country,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${display.variable} ${wordmark.variable} ${sans.variable} antialiased`} suppressHydrationWarning>
      <body className="min-h-svh font-sans">
        <script dangerouslySetInnerHTML={{ __html: introScript }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
        <Preloader />
        <SkipLink />
        <Providers>
          {/* Header reads the current path; the boundary keeps unknown dynamic paths from blocking the shell. */}
          <Suspense fallback={null}>
            <Header />
          </Suspense>
          {children}
          <Footer />
          <WhatsAppButton />
          <Cursor />
        </Providers>
      </body>
    </html>
  );
}
