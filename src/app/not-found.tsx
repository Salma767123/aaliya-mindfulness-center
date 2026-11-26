import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { PageTransition } from "@/components/layout/page-transition";
import { IntroHeading } from "@/components/motion/intro-heading";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <PageTransition>
      <section className="relative grid min-h-svh place-items-center overflow-clip bg-paper py-40">
        {/* still-water rings */}
        <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 size-[min(110vw,58rem)] -translate-x-1/2 -translate-y-1/2">
          <span className="absolute inset-0 rounded-full border border-emerald-600/12" />
          <span className="absolute inset-[14%] rounded-full border border-emerald-600/12" />
          <span className="absolute inset-[28%] rounded-full border border-emerald-600/12" />
        </div>

        <div className="shell relative text-center">
          <p className="eyebrow intro-fade text-emerald-700">Error 404</p>
          <IntroHeading
            text={"This page has\n*drifted away.*"}
            delay={0.1}
            className="display-xl mx-auto mt-7 text-ink"
          />
          <p className="lede intro-fade mx-auto mt-8 max-w-md text-ink-soft" style={{ "--d": "0.6s" } as CSSProperties}>
            The address may have changed, or the page may no longer exist. Let us take you somewhere calmer.
          </p>
          <div className="intro-fade mt-10 flex flex-wrap justify-center gap-3" style={{ "--d": "0.75s" } as CSSProperties}>
            <Button href="/">Back to home</Button>
            <Button href="/contact" variant="outline" icon={false}>
              Contact us
            </Button>
          </div>
        </div>
      </section>
    </PageTransition>
  );
}
