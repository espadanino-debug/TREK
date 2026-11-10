"use client";

import { useRef } from "react";
import { useGSAP } from "@/lib/gsap";
import { setupReveals } from "@/lib/reveal";
import { site } from "@/content/site";
import type { Dictionary } from "@/content/dictionaries";

type Props = { t: Dictionary["testimonials"]; rtl: boolean };
type Item = Dictionary["testimonials"]["items"][number];

function Card({ item, tag, rtl }: { item: Item; tag: string | null; rtl: boolean }) {
  return (
    <figure dir={rtl ? "rtl" : "ltr"} className="relative flex w-[19rem] shrink-0 flex-col justify-between rounded-3xl border border-ash bg-coal p-6 md:w-[26rem] md:p-8">
      <div className="flex items-start justify-between">
        <svg viewBox="0 0 32 24" className="h-7 w-9 text-volt" fill="currentColor" aria-hidden="true">
          <path d="M0 24V13.6C0 5.9 4.3 1.3 12 0l1.3 3.4C9.5 4.4 7.6 6.8 7.4 10H13v14Zm18 0V13.6C18 5.9 22.3 1.3 30 0l1.3 3.4c-3.8 1-5.7 3.4-5.9 6.6H31v14Z" />
        </svg>
        {tag && <span className="eyebrow rounded-full border border-dashed border-smoke px-3 py-1.5 text-smoke">{tag}</span>}
      </div>
      <blockquote className="mt-8 text-lg leading-snug text-bone md:text-xl">{item.quote}</blockquote>
      <figcaption className="mt-8 flex items-center gap-3 border-t border-ash pt-5">
        <span className="h-10 w-10 shrink-0 rounded-full bg-gradient-to-br from-volt/80 to-volt/10" aria-hidden="true" />
        <span>
          <span className="block text-sm font-bold text-bone">{item.name}</span>
          <span className="block text-xs text-smoke">{item.meta}</span>
        </span>
      </figcaption>
    </figure>
  );
}

export default function Testimonials({ t, rtl }: Props) {
  const root = useRef<HTMLElement>(null);
  useGSAP(() => void (root.current && setupReveals(root.current)), { scope: root });

  const tag = site.testimonialsAreExamples ? t.exampleTag : null;
  const half = Math.ceil(t.items.length / 2);
  const rows = [t.items.slice(0, half), t.items.slice(half)];

  return (
    <section id="testimonials" ref={root} className="relative z-10 overflow-hidden bg-ink py-24 md:py-40">
      <div className="wrap mb-12 md:mb-20">
        <p data-reveal className="eyebrow mb-6 text-volt">
          {t.eyebrow}
        </p>
        <h2 data-split className="display text-[clamp(2.5rem,7vw,6rem)] text-bone">
          {t.title}
        </h2>
      </div>

      <div data-reveal className="marquee-fade space-y-5" dir="ltr">
        {rows.map((row, r) => (
          <div key={r} className="marquee-row flex overflow-hidden">
            <div className={`marquee-track flex w-max ${r % 2 ? "animate-marquee-reverse" : "animate-marquee"}`}>
              {[0, 1].map((copy) => (
                <div key={copy} className="flex shrink-0 gap-5 pe-5" aria-hidden={copy === 1 || undefined}>
                  {/* repeat inside each copy so one copy is always wider than the screen */}
                  {[...row, ...row].map((item, i) => (
                    <Card key={`${copy}-${i}`} item={item} tag={tag} rtl={rtl} />
                  ))}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
