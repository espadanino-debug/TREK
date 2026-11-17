import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { limits, siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${siteConfig.name} handles your photos and personal data. Uploaded photos are deleted within 24 hours.`,
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="November 17, 2026">
      <p>
        {siteConfig.name} (&quot;we&quot;) makes coloring pages from your photos and ideas. This
        page explains what we collect and what we do with it, in plain English.
      </p>

      <h2>Your photos</h2>
      <ul>
        <li>
          <strong>Uploaded photos are deleted within 24 hours.</strong> We delete your photo as
          soon as your coloring page is made. If something goes wrong, an automatic cleanup job
          deletes any leftover photo within 24 hours of upload.
        </li>
        <li>We remove location (GPS) and camera data from photos before processing them.</li>
        <li>
          Your photo is sent to our image provider (OpenAI) only to create your coloring page. We
          do not use your photos to train AI models, and we never sell or share them.
        </li>
        <li>Photos are checked automatically to block explicit or harmful images.</li>
      </ul>

      <h2>Your coloring pages</h2>
      <ul>
        <li>
          If you are signed in, your coloring pages are saved in your account so you can download
          them again. You can ask us to delete them at any time.
        </li>
        <li>
          If you are not signed in, your coloring page is deleted after{" "}
          {limits.anonOutputRetentionDays} days.
        </li>
      </ul>

      <h2>Account data</h2>
      <p>
        If you create an account, we store your email address, your credit balance and your list
        of coloring pages. Sign-in is handled by Supabase (email link or Google).
      </p>

      <h2>Free page limit</h2>
      <p>
        To keep the free page fair, we store a random ID in a cookie and a one-way, salted hash of
        your IP address (not the IP itself). These records are deleted after 90 days.
      </p>

      <h2>Cookies and analytics</h2>
      <p>
        We use only the cookies needed to sign you in and to count free pages. We use Plausible
        Analytics, which does not use cookies and does not collect personal data, to count visits.
      </p>

      <h2>Service providers</h2>
      <ul>
        <li>Supabase: database, sign-in and file storage</li>
        <li>OpenAI: creating coloring pages and checking content</li>
        <li>Vercel: website hosting</li>
        <li>Plausible: privacy-friendly visit statistics</li>
      </ul>

      <h2>Children</h2>
      <p>
        {siteConfig.name} is made for parents, teachers and adults. Accounts are for people 13 and
        older. Kids should use the site with a parent or teacher.
      </p>

      <h2>Your rights</h2>
      <p>
        You can ask us to see, correct or delete your data at any time by emailing{" "}
        <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>.
      </p>
    </LegalPage>
  );
}
