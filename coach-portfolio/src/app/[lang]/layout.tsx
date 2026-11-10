import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import "@fontsource/anton/400.css";
import "@fontsource-variable/inter/index.css";
import "@fontsource/lalezar/400.css";
import "@fontsource-variable/cairo/index.css";
import "../globals.css";
import { getDictionary } from "@/content/dictionaries";
import { coachName, dirOf, isLocale, locales, site } from "@/content/site";
import SmoothScroll from "@/components/providers/SmoothScroll";
import Preloader from "@/components/Preloader";

type Props = { children: ReactNode; params: Promise<{ lang: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  colorScheme: "dark",
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = getDictionary(lang);
  const name = coachName(lang);
  const title = `${name} | ${t.meta.title}`;
  return {
    metadataBase: new URL(site.url),
    title,
    description: t.meta.description,
    alternates: {
      canonical: `/${lang}`,
      languages: { fr: "/fr", ar: "/ar", "x-default": "/fr" },
    },
    openGraph: {
      title,
      description: t.meta.description,
      url: `/${lang}`,
      siteName: name,
      locale: lang === "ar" ? "ar_MA" : "fr_MA",
      type: "website",
    },
    twitter: { card: "summary_large_image", title, description: t.meta.description },
  };
}

export default async function RootLayout({ children, params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDictionary(lang);

  return (
    <html lang={lang === "ar" ? "ar-MA" : "fr"} dir={dirOf(lang)}>
      <body>
        {/* Without JS nothing would ever lift the preloader: hide it. */}
        <noscript>
          <style>{".preloader{display:none!important}"}</style>
        </noscript>
        <Preloader label={t.preloader.loading} />
        <SmoothScroll />
        {children}
        <div className="grain" aria-hidden="true" />
      </body>
    </html>
  );
}
