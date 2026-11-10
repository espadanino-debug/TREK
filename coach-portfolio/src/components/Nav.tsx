"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { getLenis } from "./providers/SmoothScroll";
import { useReady } from "@/lib/ready";
import type { Dictionary } from "@/content/dictionaries";
import Logo from "./ui/Logo";
import { WhatsAppIcon } from "./ui/Icons";

type Props = { t: Dictionary["nav"]; name: string; wa: string; otherLocale: string };

export default function Nav({ t, name, wa, otherLocale }: Props) {
  const bar = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(false);
  const ready = useReady();

  // Slide in after the preloader, then hide on scroll down / show on scroll up.
  useGSAP(
    () => {
      if (!ready || !bar.current) return;
      gsap.from(bar.current, { yPercent: -110, duration: 1.1, ease: "expo.out", delay: 0.5 });
      const show = gsap.quickTo(bar.current, "yPercent", { duration: 0.5, ease: "power3.out" });
      ScrollTrigger.create({
        start: 120,
        end: "max",
        onUpdate: (self) => show(self.direction === 1 ? -110 : 0),
        onLeaveBack: () => show(0),
      });
    },
    { dependencies: [ready] },
  );

  useEffect(() => {
    const lenis = getLenis();
    if (open) lenis?.stop();
    else lenis?.start();
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header ref={bar} className="fixed inset-x-0 top-0 z-50">
        <div className="wrap flex h-16 items-center justify-between md:h-20">
          <a href="#hero" aria-label={name}>
            <Logo name={name} />
          </a>

          <nav aria-label="Primary" className="hidden items-center gap-8 lg:flex">
            {t.links.map((l) => (
              <a key={l.href} href={l.href} className="group relative text-sm font-medium text-bone/80 transition-colors hover:text-bone">
                {l.label}
                <span className="absolute -bottom-1 start-0 h-px w-full origin-left scale-x-0 bg-volt transition-transform duration-500 ease-expo group-hover:scale-x-100 rtl:origin-right" />
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2 md:gap-3">
            <Link
              href={`/${otherLocale}`}
              hrefLang={otherLocale}
              lang={otherLocale}
              aria-label={t.switchLabel}
              className="inline-flex h-11 items-center rounded-full border border-ash bg-ink/60 px-4 text-sm font-semibold text-bone backdrop-blur transition-colors hover:border-volt hover:text-volt"
            >
              {t.switchTo}
            </Link>
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden h-11 items-center gap-2 rounded-full bg-bone px-5 text-sm font-bold text-ink transition-colors hover:bg-volt lg:inline-flex"
            >
              <WhatsAppIcon className="h-4 w-4" />
              {t.cta}
            </a>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? t.close : t.menu}
              className="relative grid h-11 w-11 place-items-center rounded-full border border-ash bg-ink/60 backdrop-blur lg:hidden"
            >
              <span className={`absolute h-0.5 w-5 bg-bone transition-transform duration-500 ease-expo ${open ? "rotate-45" : "-translate-y-1"}`} />
              <span className={`absolute h-0.5 w-5 bg-bone transition-transform duration-500 ease-expo ${open ? "-rotate-45" : "translate-y-1"}`} />
            </button>
          </div>
        </div>
      </header>

      <div
        id="mobile-menu"
        inert={!open}
        className={`fixed inset-0 z-40 flex flex-col justify-between bg-ink px-5 pb-8 pt-24 transition-[clip-path] duration-700 ease-expo lg:hidden ${
          open ? "[clip-path:inset(0_0_0_0)]" : "pointer-events-none [clip-path:inset(0_0_100%_0)]"
        }`}
      >
        <nav aria-label="Mobile" className="flex flex-col">
          {t.links.map((l, i) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="display flex items-baseline gap-4 border-b border-ash py-4 text-5xl text-bone"
            >
              <span className="font-sans text-xs font-semibold text-volt">0{i + 1}</span>
              {l.label}
            </a>
          ))}
        </nav>
        <a href={wa} target="_blank" rel="noopener noreferrer" className="glow-btn w-full">
          <WhatsAppIcon />
          {t.cta}
        </a>
      </div>
    </>
  );
}
