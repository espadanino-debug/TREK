import type { Metadata } from "next";
import Link from "next/link";
import { ColoringTool } from "@/components/ColoringTool";
import { Faq, type FaqItem } from "@/components/Faq";
import { HowItWorks } from "@/components/HowItWorks";
import { JsonLd } from "@/components/JsonLd";
import { limits, siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Text to Coloring Page Generator (Free AI)",
  description:
    "Type any idea and get a printable coloring page in seconds. Free AI text to coloring page generator for kids and adults. Download PDF (Letter or A4) or PNG.",
  alternates: { canonical: "/text-to-coloring-page" },
  openGraph: {
    url: "/text-to-coloring-page",
    title: "Text to Coloring Page Generator",
    description: "Describe it, and we'll draw it as a printable coloring page.",
  },
};

const FAQ: FaqItem[] = [
  {
    q: "How do I write a good idea?",
    a: "Say who or what, what they're doing, and where. For example: \"a baby elephant splashing in a puddle in the jungle\". Short and specific works best.",
  },
  {
    q: "Is it free?",
    a: `You can make 1 page without signing up, and get ${limits.signupCredits} free credits with a free account. Free pages include a small watermark.`,
  },
  {
    q: "Why can't I use my child's favorite cartoon character?",
    a: "Famous characters and brands belong to the companies that made them. Describe your own character instead, like \"a brave little fox knight\", and we'll draw something original.",
  },
];

export default function TextToColoringPage() {
  return (
    <>
      <section className="mx-auto max-w-3xl px-4 pt-8 pb-6 text-center sm:pt-12">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl">
          Text to <span className="text-primary">Coloring Page</span> Generator
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-base text-muted sm:text-lg">
          Type any idea and we&apos;ll draw it as a printable coloring page. Perfect for rainy
          days, classrooms and party activities.
        </p>
      </section>

      <section className="mx-auto max-w-xl px-4" aria-label="Text to coloring page tool">
        <ColoringTool mode="prompt" />
        <p className="mt-3 text-center text-sm text-muted">
          Have a photo?{" "}
          <Link href="/" className="font-bold text-primary underline">
            Turn your photo into a coloring page
          </Link>
        </p>
      </section>

      <HowItWorks
        steps={[
          { title: "Describe it", text: "Type what you'd like to color, or tap one of our ideas." },
          { title: "Pick a style", text: "Simple for little hands, Detailed for older kids and adults." },
          { title: "Print and color", text: "Download a PDF for US Letter or A4, or a PNG image." },
        ]}
      />

      <Faq items={FAQ} title="Questions" />

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: `${siteConfig.name} Text to Coloring Page Generator`,
          url: `${siteConfig.url}/text-to-coloring-page`,
          applicationCategory: "DesignApplication",
          operatingSystem: "Any",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        }}
      />
    </>
  );
}
