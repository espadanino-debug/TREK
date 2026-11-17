import type { Metadata } from "next";
import Link from "next/link";
import { ColoringTool } from "@/components/ColoringTool";
import { Faq, type FaqItem } from "@/components/Faq";
import { HowItWorks } from "@/components/HowItWorks";
import { JsonLd } from "@/components/JsonLd";
import { limits, siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: { absolute: `Change Photo to Coloring Page Free: Photo to Coloring Page Converter | ${siteConfig.name}` },
  description:
    "Change any photo to a coloring page for free. Our photo to coloring page converter turns pictures of kids, pets and places into printable line art. Download PDF or PNG.",
  alternates: { canonical: "/" },
  openGraph: {
    url: "/",
    title: "Change Any Photo Into a Coloring Page (Free)",
    description: "Upload a photo and get a printable coloring page in seconds.",
  },
};

const FAQ: FaqItem[] = [
  {
    q: "Is the photo to coloring page converter really free?",
    a: `Yes. You can make 1 coloring page without signing up, and you get ${limits.signupCredits} more free credits when you create a free account. Free pages include a small watermark in the corner.`,
  },
  {
    q: "What kind of photos work best?",
    a: "Clear, well-lit photos with one to three main subjects work best: a portrait of your child, your pet, a family picture or a favorite place. Busy backgrounds are simplified automatically.",
  },
  {
    q: "What happens to my photo?",
    a: "Your photo is only used to make your coloring page. It is deleted right after your page is made, and always within 24 hours. We never use your photos to train AI or share them.",
  },
  {
    q: "Can I print it on US Letter or A4 paper?",
    a: "Yes. Download a PDF sized for US Letter (8.5 x 11 in) or A4, or a PNG image. Print at 100% scale for the best result.",
  },
  {
    q: "Which style should I pick?",
    a: "Choose Simple for toddlers and young kids: bold lines and big shapes. Choose Detailed for older kids and adults who enjoy fine lines and patterns.",
  },
  {
    q: "Can I make a coloring page of a cartoon character?",
    a: "No. Famous characters and brands belong to their creators, so we can't make pages of them. You can describe your own original character with our text to coloring page tool instead.",
  },
];

export default function HomePage() {
  return (
    <>
      <section className="mx-auto max-w-3xl px-4 pt-8 pb-6 text-center sm:pt-12">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl">
          Change Any Photo Into a <span className="text-primary">Coloring Page</span>
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-base text-muted sm:text-lg">
          Free photo to coloring page converter. Upload a picture of your kids, pets or favorite
          places and get a printable coloring page in seconds.
        </p>
      </section>

      <section className="mx-auto max-w-xl px-4" aria-label="Photo to coloring page tool">
        <ColoringTool mode="photo" />
        <p className="mt-3 text-center text-sm text-muted">
          No photo?{" "}
          <Link href="/text-to-coloring-page" className="font-bold text-primary underline">
            Type an idea instead
          </Link>
        </p>
      </section>

      <HowItWorks
        steps={[
          { title: "Upload a photo", text: "Pick any clear photo from your phone or computer. JPG, PNG and iPhone HEIC all work." },
          { title: "Pick a style", text: "Simple bold lines for little kids, or detailed line art for grown-ups." },
          { title: "Print and color", text: "Download a PDF for US Letter or A4, or a PNG. Grab your crayons!" },
        ]}
      />

      <section className="mx-auto max-w-3xl px-4 py-6">
        <h2 className="mb-3 text-2xl font-extrabold">Great for families, classrooms and gifts</h2>
        <div className="prose-simple text-muted">
          <p>
            Kids love coloring themselves, their pets and their favorite places. Turn a birthday
            photo into a party activity, make a coloring page of the family dog, or create a
            personalized page for grandparents. Teachers use photo coloring pages for class
            memories and field trips.
          </p>
          <p>
            Adults enjoy the detailed style for relaxing, mindful coloring of travel photos,
            homes and pets.
          </p>
        </div>
      </section>

      <Faq items={FAQ} />

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: `${siteConfig.name} Photo to Coloring Page Converter`,
          url: siteConfig.url,
          applicationCategory: "DesignApplication",
          operatingSystem: "Any",
          description: siteConfig.description,
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        }}
      />
    </>
  );
}
