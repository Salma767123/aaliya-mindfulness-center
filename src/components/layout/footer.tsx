import Link from "next/link";
import { cacheLife } from "next/cache";
import { getServices } from "@/lib/api";
import { mapLinkUrl, navigation, site } from "@/content/site";
import { Parallax } from "@/components/motion/parallax";
import { Reveal } from "@/components/motion/reveal";
import { LogoLockup } from "@/components/ui/logo";
import { BackToTop } from "./back-to-top";

async function currentYear() {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
}

export async function Footer() {
  const [services, year] = await Promise.all([getServices(), currentYear()]);

  return (
    <footer className="relative">
      {/* Light half: the logo as supplied, on white, with the site map. */}
      <div className="bg-mist">
        <div className="shell grid gap-x-10 gap-y-14 py-20 md:grid-cols-12 lg:py-28">
          <Reveal className="md:col-span-12 lg:col-span-4">
            <Link href="/" aria-label={`${site.name}, home`} className="inline-block">
              <LogoLockup width={176} />
            </Link>
            <p className="mt-6 max-w-xs font-display text-2xl leading-snug text-emerald-800">{site.tagline}</p>
          </Reveal>

          <Reveal className="md:col-span-3 lg:col-span-2" delay={0.05}>
            <h2 className="eyebrow text-ink-mute">Explore</h2>
            <ul className="mt-6 space-y-5 sm:space-y-3">
              {navigation.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="tap link-line pb-0.5 text-[0.98rem] text-ink-soft hover:text-ink">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal className="md:col-span-5 lg:col-span-3" delay={0.1}>
            <h2 className="eyebrow text-ink-mute">Services</h2>
            <ul className="mt-6 space-y-5 sm:space-y-3">
              {services.map((service) => (
                <li key={service.slug}>
                  <Link
                    href={`/#${service.slug}`}
                    className="tap link-line pb-0.5 text-[0.98rem] text-ink-soft hover:text-ink"
                  >
                    {service.title}
                  </Link>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal className="md:col-span-4 lg:col-span-3" delay={0.15}>
            <h2 className="eyebrow text-ink-mute">Visit</h2>
            <address className="mt-6 space-y-4 text-[0.98rem] not-italic leading-relaxed text-ink-soft">
              <p>
                {site.address.lines.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </p>
              <p>
                <a href={site.phone.href} className="tap link-line pb-0.5 text-ink">
                  {site.phone.display}
                </a>
              </p>
              {site.email ? (
                <p>
                  <a href={`mailto:${site.email}`} className="tap link-line pb-0.5 text-ink">
                    {site.email}
                  </a>
                </p>
              ) : null}
              <p>
                <a
                  href={mapLinkUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="tap link-line pb-0.5 text-emerald-700"
                >
                  Get directions
                </a>
              </p>
            </address>
            {site.socials.length > 0 ? (
              <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2">
                {site.socials.map((social) => (
                  <li key={social.href}>
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="tap link-line pb-0.5 text-[0.9rem] text-ink-soft"
                    >
                      {social.label}
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </Reveal>
        </div>
      </div>

      {/* Dark base: the name, tone on tone, rising out of the edge of the page. */}
      <div className="grain overflow-hidden bg-emerald-950 text-emerald-100">
        <div className="shell flex flex-col gap-4 pt-10 text-[0.82rem] text-emerald-200/70 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {site.name}. All rights reserved.
          </p>
          <BackToTop />
        </div>
        <Parallax distance={-46} className="pointer-events-none select-none">
          <p
            aria-hidden
            className="-mb-[0.16em] mt-6 text-center font-wordmark text-[25.5vw] font-medium leading-[0.8] tracking-[0.06em] text-emerald-900"
          >
            AALIYA
          </p>
        </Parallax>
      </div>
    </footer>
  );
}
