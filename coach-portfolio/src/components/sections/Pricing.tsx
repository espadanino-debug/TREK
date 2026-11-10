"use client";

import { useRef } from "react";
import { useGSAP } from "@/lib/gsap";
import { setupReveals } from "@/lib/reveal";
import { site, whatsappLink } from "@/content/site";
import type { Dictionary } from "@/content/dictionaries";
import SpotlightCard from "../ui/SpotlightCard";
import { CheckIcon, WhatsAppIcon } from "../ui/Icons";

type Props = { t: Dictionary["pricing"]; planMessage: string };

const FEATURED = 1;

export default function Pricing({ t, planMessage }: Props) {
  const root = useRef<HTMLElement>(null);
  useGSAP(() => void (root.current && setupReveals(root.current)), { scope: root });

  return (
    <section id="pricing" ref={root} className="relative z-10 bg-ink py-24 md:py-40">
      <div className="wrap">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p data-reveal className="eyebrow mb-6 text-volt">
              {t.eyebrow}
            </p>
            <h2 data-split className="display max-w-4xl text-[clamp(2.5rem,7vw,6rem)] text-bone">
              {t.title}
            </h2>
          </div>
          <p data-reveal className="max-w-xs text-base text-bone/70">
            {t.sub}
          </p>
        </div>

        <div data-stagger className="mt-12 grid items-stretch gap-5 md:mt-20 lg:grid-cols-3">
          {t.plans.map((plan, i) => {
            const featured = i === FEATURED;
            const href = whatsappLink(`${planMessage} ${plan.name}.`);
            return (
              <SpotlightCard key={plan.name} featured={featured} tilt={false} className={`flex flex-col p-7 md:p-9 ${featured ? "lg:-my-4 lg:py-13" : ""}`}>
                <div className="flex min-h-9 items-center justify-between gap-3">
                  <h3 className="display text-3xl text-bone">{plan.name}</h3>
                  {featured && <span className="eyebrow rounded-full bg-volt px-3 py-2 text-ink">{t.popular}</span>}
                </div>
                <p className="mt-2 text-sm text-smoke">{plan.tagline}</p>

                <p className="mt-10 flex items-baseline gap-2">
                  <span className={`display text-7xl md:text-8xl ${featured ? "text-volt" : "text-bone"}`} dir="ltr">
                    {site.prices[i]}
                  </span>
                  <span className="text-sm font-semibold text-bone/80">
                    {t.currency}
                    <span className="block font-normal text-smoke">{t.per}</span>
                  </span>
                </p>

                <ul className="mt-10 flex-1 space-y-4 border-t border-ash pt-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm text-bone/85">
                      <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-volt" />
                      {f}
                    </li>
                  ))}
                </ul>

                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={
                    featured
                      ? "glow-btn mt-10 w-full"
                      : "mt-10 inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-full border border-ash px-6 text-sm font-bold text-bone transition-colors hover:border-volt hover:text-volt"
                  }
                >
                  <WhatsAppIcon className="h-5 w-5" />
                  {t.cta}
                </a>
              </SpotlightCard>
            );
          })}
        </div>

        <p data-reveal className="mt-10 text-center text-sm text-smoke">
          {t.note}
        </p>
      </div>
    </section>
  );
}
