"use client";

import { useRef } from "react";
import { useGSAP } from "@/lib/gsap";
import { setupReveals } from "@/lib/reveal";
import type { Dictionary } from "@/content/dictionaries";
import GlowButton from "../ui/GlowButton";

type Props = { t: Dictionary["cta"]; wa: string };

/** Transparent on purpose: the 3D dumbbell returns behind this headline. */
export default function FinalCta({ t, wa }: Props) {
  const root = useRef<HTMLElement>(null);
  useGSAP(() => void (root.current && setupReveals(root.current)), { scope: root });

  return (
    <section id="contact" ref={root} className="relative z-10 flex min-h-[100svh] flex-col items-center justify-center overflow-hidden py-28 text-center">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-ink to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-ink to-transparent" />

      <div className="wrap relative flex flex-col items-center">
        <p data-reveal className="eyebrow mb-6 text-volt">
          {t.eyebrow}
        </p>
        <h2 className="display text-[clamp(3.25rem,14vw,13rem)] text-bone">
          {t.title.map((line, i) => (
            <span key={line} data-split className={`block ${i === t.title.length - 1 ? "text-volt" : ""}`}>
              {line}
            </span>
          ))}
        </h2>
        <p data-reveal className="mt-8 max-w-md text-base leading-relaxed text-bone/80 md:text-lg">
          {t.sub}
        </p>
        <div data-reveal className="mt-10">
          <GlowButton href={wa} size="lg">
            {t.button}
          </GlowButton>
        </div>
      </div>
    </section>
  );
}
