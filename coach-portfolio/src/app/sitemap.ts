import type { MetadataRoute } from "next";
import { locales, site } from "@/content/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return locales.map((lang) => ({
    url: `${site.url}/${lang}`,
    changeFrequency: "monthly",
    priority: lang === "fr" ? 1 : 0.8,
    alternates: { languages: { fr: `${site.url}/fr`, ar: `${site.url}/ar` } },
  }));
}
