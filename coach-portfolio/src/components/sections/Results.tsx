"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { gsap, useGSAP, MOTION_OK } from "@/lib/gsap";
import { setupReveals } from "@/lib/reveal";
import { site } from "@/content/site";
import type { Dictionary } from "@/content/dictionaries";
import { CheckIcon } from "../ui/Icons";

type Props = { t: Dictionary["results"] };

/** Before / after comparison. A native range input drives it, so it works
 *  with touch, mouse and keyboard without custom pointer code. */
export default function Results({ t }: Props) {
  const root = useRef<HTMLElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState(50);

  useGSAP(
    () => {
      if (!root.current) return;
      setupReveals(root.current);
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        // Sweep once on entry so people see that it moves.
        const s = { v: 88 };
        gsap.to(s, {
          v: 50,
          duration: 1.6,
          ease: "expo.inOut",
          onUpdate: () => setPos(Math.round(s.v)),
          scrollTrigger: { trigger: frame.current, start: "top 70%", once: true },
        });
      });
    },
    { scope: root },
  );

  const panel = (kind: "before" | "after") => {
    const src = site.images[kind];
    const label = kind === "before" ? t.before : t.after;
    if (src) return <Image src={src} alt={label} fill sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover" />;
    return (
      <div
        className={`absolute inset-0 grid items-center px-[7%] ${
          kind === "before"
            ? "hatch justify-items-start bg-coal"
            : "justify-items-end bg-[radial-gradient(80%_70%_at_50%_60%,color-mix(in_srgb,var(--color-volt)_26%,var(--color-ink)),var(--color-ink))]"
        }`}
      >
        <div className="text-center">
          <p className={`display text-[clamp(3rem,11vw,8rem)] ${kind === "before" ? "text-outline" : "text-volt"}`}>{label}</p>
          <p className="eyebrow mt-3 text-smoke">{t.photoHint}</p>
        </div>
      </div>
    );
  };

  return (
    <section id="results" ref={root} className="relative z-10 bg-ink py-24 md:py-40">
      <div className="wrap grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="flex flex-col justify-center lg:col-span-5">
          <p data-reveal className="eyebrow mb-6 text-volt">
            {t.eyebrow}
          </p>
          <h2 data-split className="display text-[clamp(2.5rem,6vw,5rem)] text-bone">
            {t.title}
          </h2>
          <p data-reveal className="mt-8 max-w-md text-base leading-relaxed text-bone/75 md:text-lg">
            {t.text}
          </p>
          <ul data-stagger className="mt-8 space-y-3">
            {t.points.map((p) => (
              <li key={p} className="flex items-center gap-3 text-sm font-medium text-bone/90">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-volt text-ink">
                  <CheckIcon className="h-3.5 w-3.5" />
                </span>
                {p}
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-7">
          <div
            ref={frame}
            data-clip
            dir="ltr"
            className="relative aspect-[4/5] select-none overflow-hidden rounded-3xl border border-ash sm:aspect-[4/3]"
            style={{ ["--pos" as string]: `${pos}%` }}
          >
            {panel("after")}
            <div className="absolute inset-0 [clip-path:inset(0_calc(100%-var(--pos))_0_0)]">{panel("before")}</div>

            <span className="eyebrow absolute start-4 top-4 rounded-full bg-ink/80 px-3 py-2 text-bone backdrop-blur">{t.before}</span>
            <span className="eyebrow absolute end-4 top-4 rounded-full bg-volt px-3 py-2 text-ink">{t.after}</span>

            <div className="pointer-events-none absolute inset-y-0 w-0.5 -translate-x-1/2 bg-volt" style={{ left: "var(--pos)" }}>
              <span className="absolute left-1/2 top-1/2 grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-volt text-ink shadow-[0_0_40px_color-mix(in_srgb,var(--color-volt)_60%,transparent)]">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="m9 6-5 6 5 6M15 6l5 6-5 6" />
                </svg>
              </span>
            </div>

            <input
              type="range"
              min={0}
              max={100}
              value={pos}
              onChange={(e) => setPos(Number(e.target.value))}
              aria-label={t.drag}
              className="absolute inset-0 h-full w-full cursor-ew-resize touch-pan-y opacity-0"
            />
          </div>
          <p className="eyebrow mt-4 text-center text-smoke">{t.drag}</p>
        </div>
      </div>
    </section>
  );
}
