"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap, useGSAP, MOTION_OK } from "@/lib/gsap";
import { setupReveals } from "@/lib/reveal";
import { monogram, site } from "@/content/site";
import type { Dictionary } from "@/content/dictionaries";

type Props = { t: Dictionary["about"]; name: string; cert: string };

export default function About({ t, name, cert }: Props) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (!root.current) return;
      setupReveals(root.current);
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.fromTo(
          "[data-parallax]",
          { yPercent: -8, scale: 1.12 },
          { yPercent: 8, scale: 1.12, ease: "none", scrollTrigger: { trigger: "[data-portrait]", start: "top bottom", end: "bottom top", scrub: true } },
        );
      });
    },
    { scope: root },
  );

  return (
    <section id="about" ref={root} className="relative z-10 bg-ink py-24 md:py-40">
      <div className="wrap grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <div data-portrait data-clip className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-coal">
            {site.images.portrait ? (
              <Image data-parallax src={site.images.portrait} alt={`${name}, ${t.photoLabel}`} fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />
            ) : (
              <div data-parallax className="hatch absolute inset-0 grid place-items-center" role="img" aria-label={t.photoLabel}>
                <span className="display text-outline text-[clamp(10rem,38vw,22rem)] leading-none" dir="ltr">
                  {monogram()}
                </span>
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 bg-gradient-to-t from-ink/90 to-transparent p-5 pt-16 md:p-7 md:pt-20">
              <div>
                <p className="display text-2xl text-bone md:text-3xl">{name}</p>
                <p className="mt-1 text-sm text-bone/70">{cert}</p>
              </div>
              <span className="eyebrow shrink-0 rounded-full bg-volt px-3 py-2 text-ink">{t.certLabel}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-center lg:col-span-7">
          <p data-reveal className="eyebrow mb-6 text-volt">
            {t.eyebrow}
          </p>
          <h2 data-split className="display text-[clamp(2.5rem,7vw,6rem)] text-bone">
            {t.title}
          </h2>
          <div className="mt-8 max-w-xl space-y-5 text-base leading-relaxed text-bone/75 md:text-lg">
            {t.paragraphs.map((p) => (
              <p key={p} data-reveal>
                {p}
              </p>
            ))}
          </div>

          <dl data-reveal className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-ash bg-ash">
            {t.stats.map((s) => (
              <div key={s.label} className="flex flex-col-reverse justify-end gap-2 bg-ink p-5 md:p-7">
                <dt className="text-sm text-smoke">{s.label}</dt>
                <dd className="display text-5xl text-volt md:text-7xl" dir="ltr">
                  {s.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
