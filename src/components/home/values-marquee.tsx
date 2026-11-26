import type { Value } from "@/types/content";
import { Marquee } from "@/components/motion/marquee";

/** The five values, drifting past as a single line between two chapters of the page. */
export function ValuesMarquee({ values }: { values: Value[] }) {
  return (
    <section aria-label="Our values" className="border-y border-ink/10 bg-paper py-8 sm:py-10">
      <ul className="sr-only">
        {values.map((value) => (
          <li key={value.title}>
            {value.title}: {value.description}
          </li>
        ))}
      </ul>
      <Marquee duration={48}>
        {values.map((value, index) => (
          <span key={value.title} aria-hidden className="flex items-center">
            <span
              className={
                index % 2 === 0
                  ? "font-display text-[clamp(3rem,8vw,7rem)] leading-none tracking-[-0.02em] text-emerald-800"
                  : "font-display text-[clamp(3rem,8vw,7rem)] leading-none tracking-[-0.02em] text-emerald-500"
              }
            >
              {value.title}
            </span>
            <span className="mx-[clamp(1.5rem,4vw,3.5rem)] size-[clamp(0.9rem,1.6vw,1.4rem)] shape-leaf bg-emerald-600" />
          </span>
        ))}
      </Marquee>
    </section>
  );
}
