"use client";

import { gsap, ScrollTrigger, SplitText, MOTION_OK } from "./gsap";

/**
 * Declarative scroll reveals. Inside a section, mark elements with:
 *   data-split    headline / paragraph revealed line by line through a mask
 *   data-reveal   single element fading up
 *   data-stagger  container whose direct children fade up one after another
 *   data-clip     media block opened with a clip-path wipe
 *
 * Must be called inside a useGSAP() callback so everything is reverted on
 * unmount. Initial hidden states are set by JS only, so the page stays fully
 * readable without JS and under prefers-reduced-motion.
 */
export function setupReveals(scope: HTMLElement) {
  const mm = gsap.matchMedia();

  mm.add(MOTION_OK, () => {
    scope.querySelectorAll<HTMLElement>("[data-split]").forEach((el) => {
      SplitText.create(el, {
        type: "lines",
        mask: "lines",
        autoSplit: true,
        linesClass: "split-line",
        onSplit(self) {
          return gsap.from(self.lines, {
            yPercent: 115,
            duration: 1.1,
            ease: "expo.out",
            stagger: 0.09,
            scrollTrigger: { trigger: el, start: "top 88%", once: true },
          });
        },
      });
    });

    scope.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => {
      gsap.from(el, {
        y: 36,
        autoAlpha: 0,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 90%", once: true },
      });
    });

    scope.querySelectorAll<HTMLElement>("[data-stagger]").forEach((el) => {
      gsap.from(el.children, {
        y: 48,
        autoAlpha: 0,
        duration: 0.9,
        ease: "power3.out",
        stagger: 0.1,
        scrollTrigger: { trigger: el, start: "top 85%", once: true },
      });
    });

    scope.querySelectorAll<HTMLElement>("[data-clip]").forEach((el) => {
      gsap.fromTo(
        el,
        { clipPath: "inset(100% 0% 0% 0%)" },
        {
          clipPath: "inset(0% 0% 0% 0%)",
          duration: 1.3,
          ease: "expo.inOut",
          scrollTrigger: { trigger: el, start: "top 85%", once: true },
        },
      );
    });
  });

  return mm;
}

export function refreshSoon() {
  requestAnimationFrame(() => ScrollTrigger.refresh());
}
