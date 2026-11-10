import { site } from "@/content/site";
import type { Dictionary } from "@/content/dictionaries";
import Logo from "./ui/Logo";

type Props = { t: Dictionary["footer"]; links: Dictionary["nav"]["links"]; name: string; wa: string };

export default function Footer({ t, links, name, wa }: Props) {
  const place = [site.city, t.country].filter(Boolean).join(", ");
  return (
    <footer className="relative z-10 overflow-hidden border-t border-ash bg-ink pt-16 md:pt-24">
      <div className="wrap grid gap-12 md:grid-cols-12">
        <div className="md:col-span-6">
          <Logo name={name} />
          <p className="mt-6 max-w-sm text-base text-bone/70">{t.tagline}</p>
        </div>
        <nav aria-label={t.navTitle} className="md:col-span-3">
          <p className="eyebrow mb-5 text-smoke">{t.navTitle}</p>
          <ul className="space-y-1">
            {links.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="inline-flex min-h-9 items-center text-bone/85 transition-colors hover:text-volt">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="md:col-span-3">
          <p className="eyebrow mb-5 text-smoke">{t.contactTitle}</p>
          <ul className="space-y-1 text-bone/85">
            <li>
              <a href={wa} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-9 items-center transition-colors hover:text-volt">
                WhatsApp
              </a>
            </li>
            {site.instagram && (
              <li>
                <a href={`https://instagram.com/${site.instagram}`} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-9 items-center transition-colors hover:text-volt">
                  Instagram
                </a>
              </li>
            )}
            <li className="flex min-h-9 items-center">{place}</li>
            <li className="flex min-h-9 items-center">{t.formats}</li>
            <li className="flex min-h-9 items-center text-smoke">{t.langs}</li>
          </ul>
        </div>
      </div>

      <p aria-hidden="true" className="display text-outline mt-16 select-none whitespace-nowrap text-center text-[clamp(4rem,17vw,17rem)] leading-[0.8] rtl:leading-none">
        {name}
      </p>

      <div className="wrap flex flex-col gap-3 border-t border-ash py-6 pb-24 text-sm text-smoke md:flex-row md:items-center md:justify-between md:pb-6">
        <p>
          © <span dir="ltr">{new Date().getFullYear()}</span> {name}. {t.rights}
        </p>
        <a href="#hero" className="inline-flex min-h-9 items-center transition-colors hover:text-volt">
          {t.top} ↑
        </a>
      </div>
    </footer>
  );
}
