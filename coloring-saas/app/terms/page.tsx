import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/LegalPage";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: `The rules for using ${siteConfig.name}.`,
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Use" updated="November 17, 2026">
      <p>By using {siteConfig.name}, you agree to these terms.</p>

      <h2>Using the tool</h2>
      <ul>
        <li>Only upload photos you took yourself or have permission to use.</li>
        <li>
          Do not upload explicit, violent or hateful images, or photos of other people without
          their permission. We block content that breaks these rules.
        </li>
        <li>
          Do not ask for famous characters, logos or brands. They belong to their owners, and we
          refuse those requests.
        </li>
      </ul>

      <h2>Your coloring pages</h2>
      <p>
        You may print and use the coloring pages you make for personal, family and classroom use.
        Free pages include a small watermark. AI-made images can contain mistakes; please check
        each page before sharing it with kids.
      </p>

      <h2>Credits</h2>
      <p>
        Visitors get 1 free coloring page. Free accounts get starting credits. If a coloring page
        fails, the credit is returned automatically. Credits have no cash value.
      </p>

      <h2>No guarantee</h2>
      <p>
        The service is provided &quot;as is&quot;. We do our best to keep it running but cannot
        promise it will always be available or error-free.
      </p>

      <h2>Privacy</h2>
      <p>
        See our <Link href="/privacy">Privacy Policy</Link> to learn how we handle your photos.
      </p>

      <h2>Contact</h2>
      <p>
        Questions? Email <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>.
      </p>
    </LegalPage>
  );
}
