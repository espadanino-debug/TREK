import { notFound } from "next/navigation";
import { getDictionary } from "@/content/dictionaries";
import { certification, coachName, dirOf, isLocale, site, whatsappLink } from "@/content/site";
import Nav from "@/components/Nav";
import SceneLayer from "@/components/three/SceneLayer";
import Hero from "@/components/sections/Hero";
import Marquee from "@/components/sections/Marquee";
import About from "@/components/sections/About";
import Method from "@/components/sections/Method";
import Programs from "@/components/sections/Programs";
import Results from "@/components/sections/Results";
import Testimonials from "@/components/sections/Testimonials";
import Pricing from "@/components/sections/Pricing";
import Faq from "@/components/sections/Faq";
import FinalCta from "@/components/sections/FinalCta";
import Footer from "@/components/Footer";
import StickyCta from "@/components/StickyCta";

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const t = getDictionary(lang);
  const rtl = dirOf(lang) === "rtl";
  const name = coachName(lang);
  const wa = whatsappLink(t.whatsapp.message);

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "ProfessionalService",
      name,
      description: t.meta.description,
      url: `${site.url}/${lang}`,
      areaServed: { "@type": "Country", name: "Morocco" },
      address: { "@type": "PostalAddress", addressCountry: "MA", ...(site.city ? { addressLocality: site.city } : {}) },
      availableLanguage: ["fr", "ar"],
      knowsAbout: ["Weight loss", "Body transformation", "Personal training"],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: t.faq.items.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ];

  return (
    // key: a language switch rebuilds every animation for the new direction
    <div key={lang}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <SceneLayer rtl={rtl} />
      <Nav t={t.nav} name={name} wa={wa} otherLocale={lang === "fr" ? "ar" : "fr"} />
      <main>
        <Hero t={t.hero} wa={wa} rtl={rtl} />
        <Marquee items={t.marquee} />
        <About t={t.about} name={name} cert={certification(lang)} />
        <Method t={t.method} rtl={rtl} />
        <Programs t={t.programs} wa={wa} />
        <Results t={t.results} />
        <Testimonials t={t.testimonials} rtl={rtl} />
        <Pricing t={t.pricing} planMessage={t.whatsapp.plan} />
        <Faq t={t.faq} />
        <FinalCta t={t.cta} wa={wa} />
      </main>
      <Footer t={t.footer} links={t.nav.links} name={name} wa={wa} />
      <StickyCta label={t.nav.cta} wa={wa} />
    </div>
  );
}
