import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Contact Us",
  description: `Get in touch with the ${siteConfig.name} team.`,
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <LegalPage title="Contact Us">
      <p>
        We&apos;d love to hear from you! Questions, ideas for new coloring pages, problems with a
        download, or a request to delete your data: just send us an email.
      </p>
      <p>
        <a
          href={`mailto:${siteConfig.contactEmail}`}
          className="inline-block rounded-2xl bg-primary px-5 py-3 font-bold text-white no-underline hover:bg-primary-hover"
          style={{ color: "white", textDecoration: "none" }}
        >
          {siteConfig.contactEmail}
        </a>
      </p>
      <p>We usually reply within 2 business days.</p>
    </LegalPage>
  );
}
