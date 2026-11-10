"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP, MOTION_OK } from "@/lib/gsap";

/** Volt band of keywords. It speeds up with the scroll, then settles. */
export default function Marquee({ items }: { items: string[] }) {
  const root = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const loop = gsap.to(track.current, { xPercent: -50, duration: 26, ease: "none", repeat: -1 });
        const settle = gsap.quickTo(loop, "timeScale", { duration: 0.8, ease: "power2.out" });
        ScrollTrigger.create({
          trigger: root.current,
          start: "top bottom",
          end: "bottom top",
          onUpdate: (self) => {
            const v = self.getVelocity() / 350;
            loop.timeScale(gsap.utils.clamp(-6, 6, (v < 0 ? -1 : 1) + v));
            settle(v < 0 ? -1 : 1);
          },
          onToggle: (self) => (self.isActive ? loop.play() : loop.pause()),
        });
      });
    },
    { scope: root },
  );

  const row = (hidden: boolean) => (
    <div className="flex shrink-0 items-center" aria-hidden={hidden || undefined}>
      {items.map((item) => (
        <span key={item} className="flex items-center">
          <span className="display px-6 text-4xl text-ink md:px-10 md:text-6xl">{item}</span>
          <svg viewBox="0 0 24 24" className="h-5 w-5 text-ink md:h-7 md:w-7" aria-hidden="true">
            <path d="M12 1 21.5 6.5v11L12 23 2.5 17.5v-11Z" fill="currentColor" />
          </svg>
        </span>
      ))}
    </div>
  );

  return (
    <div ref={root} className="relative z-10 overflow-hidden bg-ink py-6 md:py-10">
      <div className="-mx-4 -rotate-[1.5deg] bg-volt py-4 md:py-5" dir="ltr">
        <div ref={track} className="flex w-max">
          {row(false)}
          {row(true)}
        </div>
      </div>
    </div>
  );
}
