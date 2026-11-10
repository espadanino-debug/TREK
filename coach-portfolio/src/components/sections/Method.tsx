"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { setupReveals } from "@/lib/reveal";
import type { Dictionary } from "@/content/dictionaries";

type Props = { t: Dictionary["method"]; rtl: boolean };

/**
 * The four steps. On large screens the section pins and the cards travel
 * sideways with the scroll; on phones it is a plain vertical list.
 */
export default function Method({ t, rtl }: Props) {
  const root = useRef<HTMLElement>(null);
  const pin = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLOListElement>(null);
  const bar = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!root.current) return;
      setupReveals(root.current);

      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px) and (min-height: 680px) and (prefers-reduced-motion: no-preference)", () => {
        const el = track.current!;
        const distance = () => Math.max(0, el.scrollWidth - window.innerWidth);
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: pin.current,
            start: "top top",
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 0.8,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });
        tl.to(el, { x: () => (rtl ? distance() : -distance()) }, 0).fromTo(bar.current, { scaleX: 0 }, { scaleX: 1 }, 0);
      });
    },
    { scope: root, dependencies: [rtl] },
  );

  return (
    <section id="method" ref={root} className="relative z-10 overflow-hidden bg-ink">
      <div ref={pin} className="flex flex-col justify-center py-24 lg:h-screen lg:py-0">
        <div className="wrap mb-10 flex flex-col gap-6 lg:mb-14 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p data-reveal className="eyebrow mb-5 text-volt">
              {t.eyebrow}
            </p>
            <h2 data-split className="display max-w-4xl text-[clamp(2.5rem,6.2vw,5.5rem)] text-bone">
              {t.title}
            </h2>
          </div>
          <p data-reveal className="max-w-xs text-base text-bone/70">
            {t.intro}
          </p>
        </div>

        <ol
          ref={track}
          className="flex flex-col gap-5 px-[clamp(1.25rem,4vw,4rem)] lg:w-max lg:flex-row lg:gap-8 lg:pe-[14vw]"
        >
          {t.steps.map((s, i) => (
            <li
              key={s.title}
              data-reveal
              className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-ash bg-coal p-6 lg:h-[23rem] lg:w-[30rem] lg:shrink-0 lg:p-9"
            >
              <div className="flex items-start justify-between">
                <span className="eyebrow text-smoke">
                  {t.step} <span dir="ltr">0{i + 1}</span>
                </span>
                <span className="h-3 w-3 rounded-full bg-volt" />
              </div>
              <span
                dir="ltr"
                aria-hidden="true"
                className="display text-outline pointer-events-none absolute -bottom-8 end-4 text-[11rem] leading-none transition-colors duration-700 group-hover:text-volt/15 lg:text-[15rem]"
              >
                0{i + 1}
              </span>
              <div className="relative mt-16 lg:mt-0">
                <h3 className="display text-3xl text-bone lg:text-5xl">{s.title}</h3>
                <p className="mt-4 max-w-sm text-base leading-relaxed text-bone/70">{s.text}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="wrap mt-12 hidden lg:block">
          <div className="h-px w-full bg-ash">
            <div ref={bar} className="h-full origin-left bg-volt rtl:origin-right" />
          </div>
        </div>
      </div>
    </section>
  );
}
