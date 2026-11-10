/**
 * ─────────────────────────────────────────────────────────────────────────
 *  EDIT ME FIRST
 *  Everything specific to the coach lives in this file. The rest of the
 *  copy (FR + AR/Darija) is in ./dictionaries.ts.
 * ─────────────────────────────────────────────────────────────────────────
 */
export const site = {
  /** TODO: coach's real name. Used in the logo, titles, footer and SEO. */
  name: "Votre Nom",
  /** TODO: same name in Arabic script for the AR/Darija version. */
  nameAr: "الاسم ديالك",
  /** TODO: real certification, e.g. "Coach certifié BPJEPS" */
  certification: "Votre certification",
  certificationAr: "الشهادة ديالك",

  /** TODO: WhatsApp number, international format without "+" or spaces. */
  whatsapp: "212XXXXXXXXX",

  /** TODO: production URL (used for canonical, sitemap, Open Graph). */
  url: "https://example.com",

  /** TODO: Instagram handle without "@", or leave empty to hide the link. */
  instagram: "",

  /** City shown in the footer. Leave empty to show only "Maroc". */
  city: "",

  /**
   * Photos. Drop files in /public/images and put the path here,
   * e.g. "/images/coach.jpg". While null, a designed placeholder is shown.
   */
  images: {
    portrait: null as string | null,
    before: null as string | null,
    after: null as string | null,
  },

  /**
   * TODO: real prices in dirhams, in the same order as the plans in the
   * dictionary (Départ, Transformation, Présentiel).
   */
  prices: ["XXX", "XXX", "XXX"],

  /**
   * The testimonials shipped with the site are SAMPLE COPY, not real
   * reviews. While this is true, every card carries a visible "Exemple"
   * tag. Replace the quotes in dictionaries.ts with real client feedback
   * (with their permission), then set this to false.
   */
  testimonialsAreExamples: true,
} as const;

export const locales = ["fr", "ar"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "fr";

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export function dirOf(locale: Locale): "ltr" | "rtl" {
  return locale === "ar" ? "rtl" : "ltr";
}

export function coachName(locale: Locale) {
  return locale === "ar" ? site.nameAr : site.name;
}

export function certification(locale: Locale) {
  return locale === "ar" ? site.certificationAr : site.certification;
}

/** Two-letter monogram for the logo mark, built from the Latin name. */
export function monogram() {
  const parts = site.name.trim().split(/\s+/).filter(Boolean);
  const letters = parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : site.name.slice(0, 2);
  return letters.toUpperCase();
}

export function whatsappLink(message: string) {
  return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(message)}`;
}
