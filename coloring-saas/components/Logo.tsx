export function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect width="32" height="32" rx="9" fill="#6d28d9" />
      <path
        d="M9 23.5c2.5-1 4-3.2 4.6-6.2l5.6-8.1a2 2 0 0 1 3.3 2.3l-5.6 8.1c-1.9 2.4-4.4 3.7-7.9 3.9Z"
        fill="#fde68a"
        stroke="#fff"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="10" r="2.2" fill="#fb7185" />
    </svg>
  );
}
