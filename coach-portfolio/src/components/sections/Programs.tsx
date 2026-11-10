"use client";

import { useRef } from "react";
import { useGSAP } from "@/lib/gsap";
import { setupReveals } from "@/lib/reveal";
import type { Dictionary } from "@/content/dictionaries";
import SpotlightCard from "../ui/SpotlightCard";
import { ArrowIcon, CheckIcon } from "../ui/Icons";

type Props = { t: Dictionary["programs"]; wa: string };

export default function Programs({ t, wa }: Props) {
  const root = useRef<HTMLElement>(null);
  useGSAP(() => void (root.current && setupReveals(root.current)), { scope: root });

  return (
    <section id="programs" ref={root} className="relative z-10 bg-ink py-24 md:py-40">
      <div className="wrap">
        <p data-reveal className="eyebrow mb-6 text-volt">
          {t.eyebrow}
        </p>
        <h2 data-split className="display max-w-5xl text-[clamp(2.5rem,7vw,6rem)] text-bone">
          {t.title}
        </h2>

        <div data-stagger className="mt-12 grid gap-5 md:mt-20 lg:grid-cols-3">
          {t.items.map((item, i) => (
            <SpotlightCard key={item.title} className="flex flex-col p-7 md:p-9">
              <div className="flex items-center justify-between">
                <span className="eyebrow rounded-full border border-ash px-3 py-2 text-bone/80">{item.tag}</span>
                <span className="display text-xl text-smoke" dir="ltr">
                  0{i + 1}
                </span>
              </div>
              <h3 className="display mt-14 text-4xl text-bone md:mt-24 md:text-5xl lg:min-h-[2lh]">{item.title}</h3>
              <p className="mt-4 text-base leading-relaxed text-bone/70 lg:min-h-[2lh]">{item.text}</p>
              <ul className="mt-8 space-y-3 border-t border-ash pt-8">
                {item.points.map((p) => (
                  <li key={p} className="flex items-start gap-3 text-sm text-bone/85">
                    <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-volt" />
                    {p}
                  </li>
                ))}
              </ul>
              <a
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                className="group/link mt-10 inline-flex min-h-11 items-center gap-2 self-start text-sm font-bold text-bone transition-colors hover:text-volt"
              >
                {t.cta}
                <ArrowIcon className="h-4 w-4 transition-transform duration-500 ease-expo group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5" />
              </a>
            </SpotlightCard>
          ))}
        </div>
      </div>
    </section>
  );
}
