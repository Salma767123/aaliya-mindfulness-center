import type { Metadata } from "next";
import Image from "next/image";
import { getReasons, getServices, getTherapist, getValues } from "@/lib/api";
import { images } from "@/content/images";
import { site } from "@/content/site";
import { AboutHero, type Audience } from "@/components/about/about-hero";
import { PracticeFacts, PracticeForms, type PracticeForm } from "@/components/about/practice-forms";
import { Principles, type Principle } from "@/components/about/principles";
import { Reasons } from "@/components/about/reasons";
import { ValuesLine, type ValueInPractice } from "@/components/about/values-line";
import { CallToAction } from "@/components/layout/call-to-action";
import { PageTransition } from "@/components/layout/page-transition";
import { ParallaxImage } from "@/components/motion/parallax";
import { Reveal, Stagger, StaggerItem, Wipe } from "@/components/motion/reveal";
import { ScrubText } from "@/components/motion/scrub-text";
import { SplitHeading } from "@/components/motion/split-heading";
import { Eyebrow } from "@/components/ui/eyebrow";
import { SampleTag } from "@/components/ui/sample-tag";

export const metadata: Metadata = {
  title: "About",
  description:
    "About Aaliya Mindfulness Center in Madurai: the practice, the therapist, the philosophy and the values behind the work.",
  alternates: { canonical: "/about" },
};

/**
 * Who the center is here for, from one person to a whole community. The hero steps through them.
 * What is offered to each is in the center's own words, taken from its lists of services
 * (see content/center.ts); which three sit under which audience is a choice made for this page.
 * Each photograph shows that work; `focus` keeps its subject in the wide frame.
 */
const audiences: Audience[] = [
  {
    name: "one person.",
    label: "One person",
    offers: ["Individual Counseling", "Stress & Anxiety Management", "Mindfulness-Based Stress Reduction"],
    image: images.counselingHands,
    focus: "38% 100%",
  },
  {
    name: "a family.",
    label: "A family",
    offers: ["Family Counseling", "Marriage & Relationship Counseling", "Adolescent Counseling"],
    image: images.parentChild,
    focus: "52% 42%",
  },
  {
    name: "a school.",
    label: "A school",
    offers: ["School Mental Health Awareness", "Student Counseling Services", "Career Guidance Programs"],
    image: images.auditorium,
    focus: "50% 62%",
  },
  {
    name: "a workplace.",
    label: "A workplace",
    offers: ["Corporate Wellness Programs", "Employee Mental Health Programs", "Leadership & Emotional Intelligence Training"],
    image: images.teamMeeting,
    focus: "58% 46%",
  },
  {
    name: "a community.",
    label: "A community",
    offers: ["Mental Health Awareness Campaigns", "Women Empowerment Initiatives", "Drug Awareness Programs"],
    image: images.communityCircle,
    focus: "46% 50%",
  },
];

const principles: Principle[] = [
  {
    title: "Evidence before opinion",
    body: "Evidence-based psychological approaches guide the work, adapted to the person rather than applied by formula.",
  },
  {
    title: "Confidence, kept",
    body: "Confidentiality and ethical practice are the conditions that make honest conversation possible.",
  },
  {
    title: "The whole person",
    body: "Mind, emotion and well-being are treated together, because that is how they are lived.",
  },
  {
    title: "Rooted in community",
    body: "Mental health is shaped by where we live, learn and work, so the center's programmes reach institutions and communities too.",
  },
];

/**
 * Photographs for "The practice", keyed by service. Each kind of work shows its own
 * service photograph unless one is named here; `focus` keeps the subject in the wide frame.
 */
const practicePhotos: Record<string, Partial<Pick<PracticeForm, "image" | "focus">>> = {
  "psychological-counseling": { image: images.counselingNotes },
  "mindfulness-wellness": { image: images.meditationStudio, focus: "50% 34%" },
  "educational-programs": { focus: "50% 46%" },
};

/**
 * Each value with a photograph of it at work and the places a visitor meets it.
 * The places are the center's own words, taken from its lists of services and commitments
 * (see content/center.ts); which ones sit under which value is a choice made for this page.
 */
const valuesInPractice: Record<string, Pick<ValueInPractice, "image" | "focus" | "meets">> = {
  Compassion: {
    image: images.supportHands,
    meets: ["Confidential & Compassionate Care", "Grief & Emotional Support", "Family Counseling"],
  },
  Integrity: {
    image: images.conversation,
    focus: "44% 50%",
    meets: [
      "Professional and Ethical Practice",
      "Evidence-Based Psychological Approaches",
      "Experienced Mental Health Expertise",
    ],
  },
  Empowerment: {
    image: images.groupSession,
    focus: "32% 50%",
    meets: ["Women Empowerment Initiatives", "Leadership & Emotional Intelligence Training", "Life Skills Development"],
  },
  Growth: {
    image: images.journal,
    meets: ["Self-Awareness & Personal Growth Workshops", "Resilience Building Sessions", "Career Guidance Programs"],
  },
  Mindfulness: {
    image: images.meditationForest,
    focus: "50% 26%",
    meets: [
      "Mindfulness-Based Stress Reduction",
      "Work-Life Balance Workshops",
      "Holistic Focus on Mind, Emotion & Well-being",
    ],
  },
};

export default async function AboutPage() {
  const [therapist, values, services, reasons] = await Promise.all([
    getTherapist(),
    getValues(),
    getServices(),
    getReasons(),
  ]);

  const forms: PracticeForm[] = services.map((service) => ({
    slug: service.slug,
    index: service.index,
    title: service.title,
    summary: service.summary,
    items: service.items,
    image: service.image,
    ...practicePhotos[service.slug],
  }));

  // A value appears in the line only once it has a photograph and its places.
  const valuesLine: ValueInPractice[] = values.flatMap((value) => {
    const practice = valuesInPractice[value.title];
    return practice ? [{ ...value, ...practice }] : [];
  });

  return (
    <PageTransition>
      {/* ---------------------------------------------------------------- hero */}
      <AboutHero
        eyebrow="About the center"
        lead="Here for"
        audiences={audiences}
        lede={`${site.name} is a center for psychological counseling, mindfulness and mental health education in Madurai, working with individuals, families, institutions and organizations.`}
        more={{ href: "#practice", label: "See the practice" }}
      />

      {/* ---------------------------------------------------------------- practice */}
      <section id="practice" className="relative scroll-mt-10 bg-paper pb-[clamp(3.5rem,7vw,6rem)] pt-[clamp(3rem,5.5vw,5.5rem)]">
        <div className="shell">
          <Reveal>
            <Eyebrow index="01">The practice</Eyebrow>
          </Reveal>
          <div className="mt-6 grid gap-x-12 gap-y-7 lg:grid-cols-12">
            <SplitHeading
              text={"Five kinds of work,\n*one way of working.*"}
              className="display-lg text-ink lg:col-span-5"
            />
            <Reveal delay={0.1} className="lg:col-span-7 lg:pt-2">
              <p className="lede max-w-[40rem] text-ink-soft">
                People come here at very different moments: in the middle of a difficult season, at a point of
                decision, or simply wanting to understand themselves better.
              </p>
            </Reveal>
          </div>

          <PracticeFacts
            kinds={services.length}
            offerings={services.reduce((count, service) => count + service.items.length, 0)}
            className="mt-8 lg:mt-9"
          />

          <PracticeForms forms={forms} className="mt-8 lg:mt-9" />

          <div className="mt-9 grid gap-x-12 gap-y-4 lg:mt-11 lg:grid-cols-12">
            <Reveal className="lg:col-span-5">
              <p className="eyebrow flex items-center gap-3 text-emerald-700 lg:pt-[0.6rem]">
                <span aria-hidden className="size-2.5 shape-leaf bg-emerald-600" />
                One way of working
              </p>
            </Reveal>
            <Reveal delay={0.1} className="lg:col-span-7">
              <p className="lede text-ink-soft">
                What connects them is a way of working: professional and ethical, confidential and compassionate,
                grounded in evidence-based psychological approaches, and attentive to the whole person.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- therapist */}
      <section id="therapist" className="section-y relative scroll-mt-10 overflow-clip bg-mist">
        <div className="shell grid gap-x-14 gap-y-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-28">
              <Wipe from="bottom" className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden shape-arch bg-emerald-100 lg:max-w-none">
                {therapist.portrait ? (
                  <Image
                    src={therapist.portrait.src}
                    alt={therapist.portrait.alt}
                    fill
                    sizes="(min-width: 1024px) 38vw, 90vw"
                    className="object-cover"
                  />
                ) : (
                  <>
                    <Image src={images.leaves.src} alt="" fill sizes="(min-width: 1024px) 38vw, 90vw" className="object-cover opacity-25" />
                    <div className="absolute inset-0 grid place-items-center p-8 text-center">
                      <div>
                        <Image
                          src="/brand/aaliya-mark.png"
                          alt=""
                          width={311}
                          height={291}
                          sizes="120px"
                          className="mx-auto h-auto w-28"
                        />
                        <p className="mt-6 font-display text-2xl text-emerald-800">Portrait to be added</p>
                        <p className="mt-2 text-[0.86rem] text-emerald-800/70">
                          A photograph of the therapist will appear here.
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </Wipe>
            </div>
          </div>

          <div className="lg:col-span-6 lg:col-start-7">
            <Reveal>
              <Eyebrow index="02">The therapist</Eyebrow>
            </Reveal>
            {therapist.name ? (
              <>
                <SplitHeading text={therapist.name} className="display-lg mt-6 text-ink" />
                <Reveal>
                  <p className="mt-3 font-display text-2xl text-emerald-700">{therapist.role}</p>
                </Reveal>
              </>
            ) : (
              <>
                <SplitHeading text={therapist.role} className="display-lg mt-6 text-ink" />
                <Reveal className="mt-4">
                  <SampleTag label="Name to be added" />
                </Reveal>
              </>
            )}

            <Reveal delay={0.1}>
              <p className="lede mt-8 text-ink-soft">{therapist.intro}</p>
            </Reveal>
            <div className="mt-6 space-y-5 text-[1.04rem] leading-[1.8] text-ink-soft">
              {therapist.bio.map((paragraph) => (
                <Reveal key={paragraph}>
                  <p>{paragraph}</p>
                </Reveal>
              ))}
            </div>

            <div className="mt-14 grid gap-x-12 gap-y-12 sm:grid-cols-2">
              <div>
                <Reveal>
                  <h3 className="eyebrow text-ink-mute">Achievements &amp; recognition</h3>
                </Reveal>
                <Stagger as="ul" className="mt-5 border-t border-ink/12">
                  {therapist.achievements.map((achievement) => (
                    <StaggerItem as="li" key={achievement} className="flex gap-3.5 border-b border-ink/12 py-4 text-[0.98rem] leading-snug text-ink">
                      <span aria-hidden className="mt-1.5 size-2 flex-none shape-leaf bg-emerald-600" />
                      {achievement}
                    </StaggerItem>
                  ))}
                </Stagger>
              </div>

              <div>
                <Reveal className="flex flex-wrap items-center gap-3">
                  <h3 className="eyebrow text-ink-mute">Qualifications &amp; experience</h3>
                  {therapist.qualifications.some((item) => item.placeholder) ? <SampleTag label="To be added" /> : null}
                </Reveal>
                <Stagger as="ul" className="mt-5 border-t border-ink/12">
                  {therapist.qualifications.map((qualification) => (
                    <StaggerItem as="li" key={qualification.title} className="border-b border-ink/12 py-4">
                      <p className={qualification.placeholder ? "text-[0.98rem] leading-snug text-ink-mute" : "text-[0.98rem] leading-snug text-ink"}>
                        {qualification.title}
                      </p>
                      <p className="mt-1 text-[0.84rem] text-ink-mute/80">{qualification.detail}</p>
                    </StaggerItem>
                  ))}
                </Stagger>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- why choose Aaliya */}
      <Reasons reasons={reasons} index="03" />

      {/* ---------------------------------------------------------------- philosophy */}
      <section id="philosophy" className="relative bg-paper pb-[clamp(3.5rem,7vw,6rem)] pt-[clamp(3.25rem,6vw,6rem)]">
        <div className="shell">
          <Reveal>
            <Eyebrow index="04">Philosophy &amp; approach</Eyebrow>
          </Reveal>
          {/* Two lines on a phone; from tablet up the two sentences run as one line across the page. */}
          <SplitHeading
            text={"We listen first.\n*Everything else follows.*"}
            className="display-lg mt-5 text-ink md:[&>span+span]:ml-[0.2em] md:[&>span]:inline"
          />
          <Principles principles={principles} className="mt-8 lg:mt-11" />
        </div>
      </section>

      {/* ---------------------------------------------------------------- values */}
      <section
        id="values"
        className="grain section-y relative overflow-clip bg-emerald-900 text-white"
      >
        <ValuesLine
          index="05"
          eyebrow="Our values"
          heading={"What we\n*hold to.*"}
          lede="Five values sit behind every session, workshop and programme. Take hold of the line and draw it across."
          values={valuesLine}
        />
      </section>

      {/* ---------------------------------------------------------------- vision */}
      <section id="vision" className="relative overflow-clip bg-emerald-950 text-white">
        <ParallaxImage image={images.mistyLake} sizes="100vw" amount={9} className="!absolute inset-0" alt="" />
        <div aria-hidden className="absolute inset-0 bg-emerald-950/70" />
        <div className="shell relative py-24 lg:py-32">
          <Reveal>
            <Eyebrow index="06" tone="light">
              Our vision
            </Eyebrow>
          </Reveal>
          <ScrubText
            text={site.vision}
            className="display-lg mt-8 max-w-5xl"
          />
        </div>
      </section>

      <CallToAction heading={"Come as\n*you are.*"} />
    </PageTransition>
  );
}
