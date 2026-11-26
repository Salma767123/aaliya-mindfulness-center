import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { getServices } from "@/lib/api";
import { mapEmbedUrl, mapLinkUrl, site } from "@/content/site";
import { AppointmentForm } from "@/components/contact/appointment-form";
import { PageTransition } from "@/components/layout/page-transition";
import { IntroHeading } from "@/components/motion/intro-heading";
import { Reveal, Stagger, StaggerItem, Wipe } from "@/components/motion/reveal";
import { SplitHeading } from "@/components/motion/split-heading";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { ClockIcon, MailIcon, PhoneIcon, PinIcon } from "@/components/ui/icons";
import { SampleTag } from "@/components/ui/sample-tag";

export const metadata: Metadata = {
  title: "Contact & Appointments",
  description:
    "Request an appointment with Aaliya Mindfulness Center in Madurai. Call +91 96261 62662 or send a confidential enquiry.",
  alternates: { canonical: "/contact" },
};

const delay = (seconds: number) => ({ "--d": `${seconds}s` }) as CSSProperties;

const nextSteps = [
  {
    title: "Send a request",
    body: "Tell us a little about what you are looking for. A few lines are enough.",
  },
  {
    title: "We arrange a time",
    body: "We get in touch on the number you share to find a time that suits you.",
  },
  {
    title: "A first conversation",
    body: "You talk, we listen. Together we decide what, if anything, comes next.",
  },
];

export default async function ContactPage() {
  const services = await getServices();

  return (
    <PageTransition>
      {/* ---------------------------------------------------------------- hero + form */}
      <section className="relative overflow-clip bg-paper pb-14 pt-32 lg:pb-24 lg:pt-36">
        <div aria-hidden className="pointer-events-none absolute -left-[22%] top-[8%] size-[58vmax] rounded-full opacity-80" style={{ background: "radial-gradient(closest-side, var(--color-emerald-100), transparent)" }} />

        <div className="shell relative grid gap-x-14 gap-y-16 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="eyebrow intro-fade flex items-center gap-3 text-emerald-700">
              <span aria-hidden className="size-2.5 shape-leaf bg-emerald-600" />
              Contact &amp; appointments
            </p>
            <IntroHeading text={"We are here\n*to listen.*"} delay={0.1} className="display-xl mt-7 text-ink" />
            <p className="lede intro-fade mt-8 max-w-md text-ink-soft" style={delay(0.5)}>
              Whether you are ready to book or only have a question, start wherever you are comfortable: a call
              or a short note.
            </p>

            <dl className="intro-fade mt-12 border-t border-ink/12" style={delay(0.65)}>
              <div className="flex gap-5 border-b border-ink/12 py-6">
                <PhoneIcon className="mt-1 size-5 flex-none text-emerald-700" />
                <div>
                  <dt className="eyebrow text-ink-mute">Call</dt>
                  <dd className="mt-2">
                    <a href={site.phone.href} className="tap link-line pb-0.5 font-display text-[1.75rem] leading-none text-ink sm:text-[1.9rem]">
                      {site.phone.display}
                    </a>
                  </dd>
                </div>
              </div>
              <div className="flex gap-5 border-b border-ink/12 py-6">
                <PinIcon className="mt-1 size-5 flex-none text-emerald-700" />
                <div>
                  <dt className="eyebrow text-ink-mute">Visit</dt>
                  <dd className="mt-2 text-[1.04rem] leading-relaxed text-ink">
                    {site.address.lines.map((line) => (
                      <span key={line} className="block">
                        {line}
                      </span>
                    ))}
                    <a
                      href={mapLinkUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="tap link-line mt-2 inline-block pb-0.5 text-[0.95rem] text-emerald-700"
                    >
                      Get directions
                    </a>
                  </dd>
                </div>
              </div>
              {site.email ? (
                <div className="flex gap-5 border-b border-ink/12 py-6">
                  <MailIcon className="mt-1 size-5 flex-none text-emerald-700" />
                  <div>
                    <dt className="eyebrow text-ink-mute">Write</dt>
                    <dd className="mt-2">
                      <a href={`mailto:${site.email}`} className="tap link-line pb-0.5 text-[1.04rem] text-ink">
                        {site.email}
                      </a>
                    </dd>
                  </div>
                </div>
              ) : null}
              <div className="flex gap-5 border-b border-ink/12 py-6">
                <ClockIcon className="mt-1 size-5 flex-none text-emerald-700" />
                <div>
                  <dt className="eyebrow text-ink-mute">Hours</dt>
                  <dd className="mt-2 flex flex-wrap items-center gap-3 text-[1.04rem] text-ink">
                    {site.hours.text}
                    {site.hours.placeholder ? <SampleTag label="To be confirmed" /> : null}
                  </dd>
                </div>
              </div>
            </dl>
          </div>

          <div className="intro-fade lg:col-span-7" style={delay(0.4)}>
            <AppointmentForm services={services.map((service) => service.title)} />
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- what happens next */}
      <section className="grain section-y-tight relative overflow-clip bg-emerald-900 text-white">
        <div className="shell grid gap-x-12 gap-y-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Reveal>
              <Eyebrow tone="light">What happens next</Eyebrow>
            </Reveal>
            <SplitHeading text={"Three small\n*steps.*"} emClassName="text-emerald-300" className="display-lg mt-6" />
          </div>
          <Stagger as="ol" stagger={0.12} className="grid gap-x-10 gap-y-10 sm:grid-cols-3 lg:col-span-8">
            {nextSteps.map((step, index) => (
              <StaggerItem as="li" key={step.title} className="border-t border-white/18 pt-6">
                <p className="font-display text-4xl leading-none text-emerald-300/80 sm:text-5xl">0{index + 1}</p>
                <h3 className="display-sm mt-5">{step.title}</h3>
                <p className="mt-3 text-[0.98rem] leading-relaxed text-emerald-50/75">{step.body}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* ---------------------------------------------------------------- map */}
      <section className="section-y-tight bg-paper">
        <div className="shell">
          <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-6">
            <div>
              <Reveal>
                <Eyebrow>Find us</Eyebrow>
              </Reveal>
              <SplitHeading text={"In Madurai, *Tamil Nadu.*"} className="display-lg mt-5 text-ink" />
            </div>
            <Reveal delay={0.15}>
              <Button href={mapLinkUrl()} variant="outline">
                Open in Google Maps
              </Button>
            </Reveal>
          </div>

          <Wipe from="bottom" className="relative mt-8 overflow-hidden rounded-[2rem] bg-emerald-100 lg:mt-10 lg:rounded-t-[10rem]">
            <div className="relative h-[26rem] lg:h-[34rem]">
              <iframe
                title={`Map showing ${site.name}`}
                src={mapEmbedUrl()}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="map-tone absolute inset-0 size-full border-0"
              />
            </div>
            <div className="pointer-events-none absolute inset-x-4 bottom-4 sm:inset-x-auto sm:bottom-8 sm:left-8">
              <div className="pointer-events-auto max-w-xs rounded-2xl bg-paper/95 p-6 shadow-[0_24px_60px_-28px_rgb(5_58_37/0.5)] backdrop-blur">
                <span aria-hidden className="block size-3 shape-leaf bg-emerald-600" />
                <p className="mt-3 font-display text-2xl leading-tight text-emerald-900">{site.address.lines[0]}</p>
                <p className="mt-2 text-[0.92rem] leading-relaxed text-ink-soft">{site.address.lines.slice(1).join(", ")}</p>
              </div>
            </div>
          </Wipe>
        </div>
      </section>

      {/* ---------------------------------------------------------------- urgent help */}
      <section className="border-t border-ink/10 bg-mist py-14">
        <div className="shell grid gap-x-10 gap-y-4 lg:grid-cols-12">
          <Reveal className="lg:col-span-3">
            <p className="eyebrow text-emerald-700">If it cannot wait</p>
          </Reveal>
          <Reveal delay={0.1} className="lg:col-span-8">
            <p className="max-w-3xl text-[1.04rem] leading-relaxed text-ink-soft">
              This form is not monitored around the clock. If you or someone near you is in immediate danger,
              call <a href="tel:112" className="link-line pb-0.5 font-medium text-ink">112</a>. For free mental
              health support at any hour in India, call Tele-MANAS on{" "}
              <a href="tel:14416" className="link-line pb-0.5 font-medium text-ink">14416</a>.
            </p>
          </Reveal>
        </div>
      </section>
    </PageTransition>
  );
}
