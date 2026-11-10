"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { pose } from "@/lib/sceneState";
import { useReady } from "@/lib/ready";

// three.js is the heaviest thing on the page: load it in its own chunk,
// client-side only, while the preloader is counting.
const Scene = dynamic(() => import("./Scene"), { ssr: false });

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

/**
 * One fixed WebGL layer behind the whole page. GSAP writes the dumbbell's
 * pose from scroll; the canvas only renders while it is visible (hero and
 * final call to action), so the middle of the page costs no GPU time.
 */
export default function SceneLayer({ rtl }: { rtl: boolean }) {
  const layer = useRef<HTMLDivElement>(null);
  const ready = useReady();
  const [env, setEnv] = useState<{ reduce: boolean; lowPower: boolean } | null>(null);

  useEffect(() => {
    if (!hasWebGL()) return;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const cores = navigator.hardwareConcurrency ?? 8;
    setEnv({ reduce: prefersReducedMotion(), lowPower: coarse || cores <= 4 });
  }, []);

  useGSAP(
    () => {
      const el = layer.current;
      if (!el) return;
      const dir = rtl ? -1 : 1;
      const wide = () => window.innerWidth >= 1024;
      // Hero: object sits beside the headline on desktop, above it on phones.
      // Keep the whole dumbbell inside the frame at any aspect ratio: the
      // camera sees 2.835 world units per unit of aspect on each side.
      const heroX = () => (wide() ? dir * gsap.utils.clamp(1.6, 3.1, (window.innerWidth / window.innerHeight) * 2.835 - 2.05) : 0);
      const heroY = () => (wide() ? 0.6 : 1.35);
      const heroScale = () => (wide() ? 1.08 : 0.92);

      const apply = () => {
        const o = pose.opacity * pose.intro;
        el.style.opacity = String(o);
        el.style.visibility = o <= 0.01 ? "hidden" : "visible";
      };

      Object.assign(pose, { x: heroX(), y: heroY(), z: 0, rx: 0.25, rz: 0.45, scale: heroScale(), opacity: 1, boost: 0 });
      apply();

      if (prefersReducedMotion()) {
        pose.intro = 1;
        apply();
        ScrollTrigger.create({
          trigger: "#hero",
          start: "top top",
          end: "bottom top",
          onLeave: () => ((pose.opacity = 0), apply()),
          onEnterBack: () => ((pose.opacity = 1), apply()),
        });
        return;
      }
      if (!ready) return;

      // Entrance, once the preloader lifts. Kept on its own factor so it
      // never fights the scroll-driven tweens below.
      gsap.to(pose, { intro: 1, duration: 2.2, ease: "expo.out", delay: 0.1, onUpdate: apply });

      // Leaving the hero: the dumbbell swings toward the camera and fades.
      gsap.fromTo(
        pose,
        { x: heroX, y: heroY, z: 0, rx: 0.25, rz: 0.45, scale: heroScale, opacity: 1 },
        {
          x: 0,
          y: 0.4,
          z: 4.5,
          rx: 1.5,
          rz: -0.3,
          scale: () => heroScale() * 1.5,
          opacity: 0,
          ease: "power1.in",
          immediateRender: false,
          onUpdate: apply,
          scrollTrigger: { trigger: "#hero", start: "top top", end: "bottom top", scrub: 0.6, invalidateOnRefresh: true },
        },
      );

      // Final call to action: it rises back behind the headline.
      gsap.fromTo(
        pose,
        { x: 0, y: -2.6, z: -1, rx: -0.6, rz: 0.9, scale: 0.7, opacity: 0 },
        {
          x: 0,
          // Behind the white line on desktop, above the headline on phones:
          // never on top of the volt line or the button.
          y: () => (wide() ? 1.25 : 2.05),
          z: 0,
          rx: 0.3,
          rz: 0.45,
          scale: () => (wide() ? 1.15 : 0.9),
          opacity: () => (wide() ? 0.7 : 1),
          ease: "power2.out",
          immediateRender: false,
          onUpdate: apply,
          scrollTrigger: { trigger: "#contact", start: "top 90%", end: "center center", scrub: 0.6, invalidateOnRefresh: true },
        },
      );

      // Scroll speed feeds the spin.
      ScrollTrigger.create({
        start: 0,
        end: "max",
        onUpdate: (self) => {
          pose.boost = Math.max(pose.boost, Math.min(Math.abs(self.getVelocity()) / 2500, 1.4));
        },
      });
    },
    { dependencies: [ready, rtl], revertOnUpdate: true },
  );

  return (
    <div ref={layer} aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 h-[100lvh] opacity-0">
      {/* CSS glow that stands in until (or instead of) WebGL */}
      <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_45%,color-mix(in_srgb,var(--color-volt)_9%,transparent),transparent_70%)]" />
      {env && <Scene reduce={env.reduce} lowPower={env.lowPower} />}
    </div>
  );
}
