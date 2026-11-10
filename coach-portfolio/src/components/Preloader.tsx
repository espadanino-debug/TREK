"use client";

import { useRef, useState } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { isReady, setReady } from "@/lib/ready";
import Logo from "./ui/Logo";

/**
 * 0 → 100 counter with the logo, then a two-layer wipe: the black panel
 * lifts, a volt panel chases it, and the hero is already animating in
 * underneath.
 */
export default function Preloader({ label }: { label: string }) {
  const root = useRef<HTMLDivElement>(null);
  const count = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  // After a language switch the layout remounts: do not replay the intro.
  const [done, setDone] = useState(() => isReady());

  useGSAP(
    () => {
      if (done) return;
      const reduce = prefersReducedMotion();
      const state = { v: 0 };

      const fonts: Promise<unknown> = document.fonts?.ready ?? Promise.resolve();
      const fontsOrTimeout = Promise.race([fonts, new Promise((r) => setTimeout(r, 3500))]);

      const tl = gsap.timeline({ onComplete: () => setDone(true) });

      tl.to(state, {
        v: 100,
        duration: reduce ? 0.3 : 2.1,
        ease: "power2.inOut",
        onUpdate: () => {
          const v = Math.round(state.v);
          if (count.current) count.current.textContent = String(v).padStart(3, "0");
          if (bar.current) bar.current.style.transform = `scaleX(${state.v / 100})`;
        },
      });
      // Never reveal the page before the display font is ready.
      tl.addPause("+=0.15", () => {
        fontsOrTimeout.then(() => tl.play());
      });

      if (reduce) {
        tl.add(() => setReady()).to(root.current, { autoAlpha: 0, duration: 0.2 });
        return;
      }

      tl.to(".pl-content > *", { yPercent: -120, duration: 0.7, ease: "expo.in", stagger: 0.05 })
        .add(() => setReady(), "-=0.15")
        .to(".pl-ink", { yPercent: -100, duration: 1, ease: "expo.inOut" }, "-=0.2")
        .to(".pl-volt", { yPercent: -100, duration: 1, ease: "expo.inOut" }, "-=0.82");
    },
    { scope: root, dependencies: [done] },
  );

  if (done) return null;

  return (
    <div ref={root} className="preloader fixed inset-0 z-[100]" role="status" aria-label={label} dir="ltr">
      <div className="pl-volt absolute inset-0 bg-volt" />
      <div className="pl-ink absolute inset-0 bg-ink">
        <div className="pl-content wrap flex h-full flex-col justify-between py-8 md:py-12">
          <div className="overflow-hidden">
            <Logo />
          </div>
          <div>
            <div className="flex flex-col gap-4 overflow-hidden sm:flex-row sm:items-end sm:justify-between">
              <span className="eyebrow text-smoke sm:pb-3">{label}</span>
              <span className="display self-end text-[clamp(5.5rem,26vw,20rem)] leading-[0.8] tabular-nums text-bone">
                <span ref={count}>000</span>
                <span className="text-volt">%</span>
              </span>
            </div>
            <div className="mt-6 h-px w-full bg-ash">
              <div ref={bar} className="h-full origin-left bg-volt" style={{ transform: "scaleX(0)" }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
