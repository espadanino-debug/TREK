import Link from "next/link";
import { siteConfig } from "@/config/site";
import { AuthLink } from "./AuthLink";
import { Logo } from "./Logo";

export function Header() {
  return (
    <header className="border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 text-lg font-extrabold tracking-tight">
          <Logo className="h-8 w-8" />
          <span>{siteConfig.name}</span>
        </Link>
        <nav className="flex items-center gap-1 text-sm font-semibold sm:gap-3">
          <Link href="/" className="hidden rounded-full px-3 py-2 hover:bg-primary-soft sm:block">
            Photo to page
          </Link>
          <Link
            href="/text-to-coloring-page"
            className="rounded-full px-3 py-2 hover:bg-primary-soft"
          >
            Text to page
          </Link>
          <AuthLink />
        </nav>
      </div>
    </header>
  );
}
