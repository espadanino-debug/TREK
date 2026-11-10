"use client";

import { useRef, useState } from "react";
import { useGSAP } from "@/lib/gsap";
import { setupReveals } from "@/lib/reveal";
import type { Dictionary } from "@/content/dictionaries";

type Props = { t: Dictionary["faq"] };

export default function Faq({ t }: Props) {
  const root = useRef<HTMLElement>(null);
  const [open, setOpen] = useState<number | null>(0);
  useGSAP(() => void (root.current && setupReveals(root.current)), { scope: root });

  return (
    <section id="faq" ref={root} className="relative z-10 bg-ink py-24 md:py-40">
      <div className="wrap grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-32">
            <p data-reveal className="eyebrow mb-6 text-volt">
              {t.eyebrow}
            </p>
            <h2 data-split className="display text-[clamp(2.5rem,6vw,5rem)] text-bone">
              {t.title}
            </h2>
          </div>
        </div>

        <div data-stagger className="border-t border-ash lg:col-span-7">
          {t.items.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={item.q} className="border-b border-ash">
                <h3>
                  <button
                    type="button"
                    id={`faq-q-${i}`}
                    aria-expanded={isOpen}
                    aria-controls={`faq-a-${i}`}
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="group flex w-full items-center justify-between gap-6 py-6 text-start md:py-8"
                  >
                    <span className={`text-lg font-semibold transition-colors md:text-2xl ${isOpen ? "text-volt" : "text-bone group-hover:text-volt"}`}>
                      {item.q}
                    </span>
                    <span
                      className={`relative grid h-11 w-11 shrink-0 place-items-center rounded-full border transition-all duration-500 ease-expo ${
                        isOpen ? "rotate-45 border-volt bg-volt text-ink" : "border-ash text-bone"
                      }`}
                      aria-hidden="true"
                    >
                      <span className="absolute h-0.5 w-4 bg-current" />
                      <span className="absolute h-4 w-0.5 bg-current" />
                    </span>
                  </button>
                </h3>
                <div
                  id={`faq-a-${i}`}
                  role="region"
                  aria-labelledby={`faq-q-${i}`}
                  inert={!isOpen}
                  className={`grid transition-[grid-template-rows,opacity] duration-600 ease-expo ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
                >
                  <div className="overflow-hidden">
                    <p className="max-w-2xl pb-8 text-base leading-relaxed text-bone/75 md:text-lg">{item.a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
