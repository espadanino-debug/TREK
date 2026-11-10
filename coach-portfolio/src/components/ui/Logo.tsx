import { monogram, site } from "@/content/site";

/** Monogram in a volt hex plate (the end of a dumbbell, seen head-on). */
export default function Logo({ name = site.name, className = "" }: { name?: string; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <svg viewBox="0 0 44 44" className="h-10 w-10 shrink-0" aria-hidden="true">
        <path d="M22 2 39.3 12v20L22 42 4.7 32V12Z" fill="var(--color-volt)" />
        <text
          x="22"
          y="29"
          textAnchor="middle"
          fontFamily="Anton, Impact, sans-serif"
          fontSize="17"
          fill="var(--color-ink)"
        >
          {monogram()}
        </text>
      </svg>
      <span className="display text-xl leading-none tracking-wide text-bone">{name}</span>
    </span>
  );
}
