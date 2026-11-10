import type { ReactNode } from "react";
import { WhatsAppIcon } from "./Icons";

type Props = {
  href: string;
  children: ReactNode;
  className?: string;
  size?: "md" | "lg";
};

/** Primary call to action. Always opens WhatsApp in a new tab. */
export default function GlowButton({ href, children, className = "", size = "md" }: Props) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`glow-btn ${size === "lg" ? "min-h-[4.25rem] px-8 text-base md:text-lg" : ""} ${className}`}
    >
      <WhatsAppIcon className="h-5 w-5 shrink-0" />
      <span className="roll">
        <span>{children}</span>
        <span aria-hidden="true">{children}</span>
      </span>
    </a>
  );
}
