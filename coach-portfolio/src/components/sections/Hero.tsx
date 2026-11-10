"use client";

import { useRef } from "react";
import { gsap, SplitText, useGSAP, MOTION_OK } from "@/lib/gsap";
import { useReady } from "@/lib/ready";
import type { Dictionary } from "@/content/dictionaries";
import GlowButton from "../ui/GlowButton";

type Props = { t: Dictionary["hero"]; wa: string; rtl: boolean };

export default function Hero({ t, wa, rtl }: Props) {
  const root = useRef<HTMLElement>(null);
  const ready = useReady();

  useGSAP(
    () => {
      if (!ready) return; // the preloader is still covering the page
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const lines = gsap.utils.toArray<HTMLElement>("[data-hero-line]");
        const tl = gsap.timeline({ defaults: { ease: "expo.out" }, delay: 0.25 });

        if (rtl) {
          // Arabic letters are joined: never split below the line.
          tl.from(lines, { yPercent: 120, duration: 1.3, stagger: 0.12 });
        } else {
          const split = SplitText.create(lines, { type: "chars", charsClass: "will-change-transform" });
          tl.from(split.chars, { yPercent: 120, rotate: 6, duration: 1.2, stagger: 0.022 });
        }
        tl.from("[data-hero-fade]", { y: 28, autoAlpha: 0, duration: 1, stagger: 0.09 }, 0.55);

        // Scroll: the copy drifts up and fades while the dumbbell flies past.
        gsap.to("[data-hero-content]", {
          yPercent: -14,
          autoAlpha: 0,
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top top", end: "bottom 35%", scrub: true },
        });
      });
    },
    { scope: root, dependencies: [ready, rtl] },
  );

  return (
    <section id="hero" ref={root} className="relative z-10 flex min-h-[100svh] flex-col justify-end overflow-hidden pb-8 pt-24 md:pb-12">
      {/* legibility scrim: only under the copy, never over the whole scene */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-ink via-ink/70 to-transparent" />

      <div data-hero-content className="wrap relative">
        <ul data-hero-fade className="eyebrow mb-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-bone/80 md:mb-8">
          {t.eyebrow.map((item, i) => (
            <li key={item} className={`items-center gap-4 ${i === 2 ? "hidden sm:flex" : "flex"}`}>
              {i === 0 ? (
                <span className="h-2 w-2 animate-pulse-dot rounded-full bg-volt" />
              ) : (
                <span className="h-px w-4 bg-smoke" />
              )}
              {item}
            </li>
          ))}
        </ul>

        <h1 className="display text-[clamp(3rem,13.4vw,7.5rem)] lg:text-[clamp(7.5rem,11vw,11.5rem)] text-bone">
          {t.title.map((line, i) => (
            <span key={line} className="block overflow-hidden py-[0.06em] rtl:py-[0.12em]">
              <span data-hero-line className={`block ${i === t.title.length - 1 ? "text-volt" : ""}`}>
                {line}
              </span>
            </span>
          ))}
        </h1>

        <div className="mt-6 flex flex-col gap-6 md:mt-10 md:flex-row md:items-end md:justify-between">
          <p data-hero-fade className="max-w-md text-base leading-relaxed text-bone/75 md:text-lg">
            {t.sub}
          </p>
          <div data-hero-fade className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-center">
            <GlowButton href={wa} size="lg">
              {t.cta}
            </GlowButton>
            <a
              href="#method"
              className="hidden h-[4.25rem] items-center justify-center rounded-full border border-ash px-7 text-sm font-semibold text-bone transition-colors hover:border-bone md:inline-flex"
            >
              {t.secondary}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
