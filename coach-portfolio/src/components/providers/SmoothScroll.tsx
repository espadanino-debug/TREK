"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";
import { useReady } from "@/lib/ready";

let lenis: Lenis | null = null;

export function getLenis() {
  return lenis;
}

/**
 * Lenis smooth scroll driven by the GSAP ticker so ScrollTrigger and the
 * scroll position always update in the same frame. Touch devices keep
 * native scrolling (Lenis default), which is what feels right on phones.
 */
export default function SmoothScroll() {
  const ready = useReady();

  useEffect(() => {
    if (prefersReducedMotion()) return;

    const instance = new Lenis({ lerp: 0.1, anchors: { offset: 0 } });
    lenis = instance;

    instance.on("scroll", ScrollTrigger.update);
    const raf = (time: number) => instance.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(raf);
      instance.destroy();
      lenis = null;
    };
  }, []);

  // Hold the page still while the preloader is on screen.
  useEffect(() => {
    document.documentElement.classList.toggle("is-loading", !ready);
    if (!lenis) return;
    if (ready) lenis.start();
    else lenis.stop();
  }, [ready]);

  // Layout shifts once web fonts land: re-measure every trigger.
  useEffect(() => {
    let alive = true;
    document.fonts?.ready.then(() => alive && ScrollTrigger.refresh());
    return () => {
      alive = false;
    };
  }, []);

  return null;
}
