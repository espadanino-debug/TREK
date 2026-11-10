"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { WhatsAppIcon } from "./ui/Icons";

/** Phone-only booking bar: appears once the hero button has scrolled away
 *  and steps aside when the final call to action is on screen. */
export default function StickyCta({ label, wa }: { label: string; wa: string }) {
  const ref = useRef<HTMLAnchorElement>(null);

  useGSAP(() => {
    const el = ref.current;
    if (!el) return;
    gsap.set(el, { yPercent: 180 });
    const set = (shown: boolean) => {
      gsap.to(el, { yPercent: shown ? 0 : 180, duration: 0.6, ease: "expo.out", overwrite: true });
      el.inert = !shown;
    };
    set(false);
    ScrollTrigger.create({
      trigger: "#hero",
      start: "bottom 60%",
      endTrigger: "#contact",
      end: "top 60%",
      onToggle: (self) => set(self.isActive),
    });
  });

  return (
    <a
      ref={ref}
      href={wa}
      target="_blank"
      rel="noopener noreferrer"
      className="glow-btn fixed inset-x-4 bottom-4 z-40 lg:hidden"
    >
      <WhatsAppIcon />
      {label}
    </a>
  );
}
