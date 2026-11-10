"use client";

import { useRef, type PointerEvent, type ReactNode } from "react";
import { gsap } from "@/lib/gsap";

type Props = {
  children: ReactNode;
  className?: string;
  featured?: boolean;
  tilt?: boolean;
};

/**
 * Card whose border and surface catch a light that follows the pointer,
 * with a light 3D tilt on devices that have a real hover.
 */
export default function SpotlightCard({ children, className = "", featured = false, tilt = true }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  function onMove(e: PointerEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el || e.pointerType !== "mouse") return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    el.style.setProperty("--mx", `${px * 100}%`);
    el.style.setProperty("--my", `${py * 100}%`);
    if (tilt) {
      gsap.to(el, {
        rotateY: (px - 0.5) * 7,
        rotateX: (0.5 - py) * 7,
        transformPerspective: 900,
        duration: 0.5,
        ease: "power3.out",
        overwrite: "auto",
      });
    }
  }

  function onLeave() {
    if (!ref.current || !tilt) return;
    gsap.to(ref.current, { rotateX: 0, rotateY: 0, duration: 0.9, ease: "elastic.out(1, 0.6)", overwrite: "auto" });
  }

  return (
    <div ref={ref} onPointerMove={onMove} onPointerLeave={onLeave} data-featured={featured} className={`spot ${className}`}>
      {featured && <span className="rim" aria-hidden="true" />}
      {children}
    </div>
  );
}
