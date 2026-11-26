import type { Metadata } from "next";
import { getVideoCategories, getVideos } from "@/lib/api";
import { CallToAction } from "@/components/layout/call-to-action";
import { PageTransition } from "@/components/layout/page-transition";
import { IntroHeading } from "@/components/motion/intro-heading";
import { VideoGallery } from "@/components/videos/video-gallery";

export const metadata: Metadata = {
  title: "Videos",
  description:
    "Talks, guided practices and conversations on mental health and mindfulness from Aaliya Mindfulness Center.",
  alternates: { canonical: "/videos" },
};

export default async function VideosPage() {
  const [videos, categories] = await Promise.all([getVideos(), getVideoCategories()]);

  return (
    <PageTransition>
      <VideoGallery
        videos={videos}
        categories={categories}
        lede="Awareness talks, short guided practices and practical conversations about everyday mental health."
        header={
          <>
            <p className="eyebrow intro-fade flex items-center gap-3 text-emerald-700">
              <span aria-hidden className="size-2.5 shape-leaf bg-emerald-600" />
              Videos
            </p>
            {/* Two lines up to small laptops; from 1280px, where it fits, the heading runs as one line. */}
            <IntroHeading
              text={"Conversations\n*worth pausing for.*"}
              delay={0.1}
              className="display-xl mt-5 text-ink min-[90rem]:[&>span+span]:ml-[0.2em] min-[90rem]:[&>span]:inline"
            />
          </>
        }
      />

      <CallToAction heading={"Rather talk\n*in person?*"} />
    </PageTransition>
  );
}
