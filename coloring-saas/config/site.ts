// Central place for brand, copy and limits. Change values here, not in components.

export const siteConfig = {
  // Placeholder brand name. If you change it, also run:
  //   npm run make-watermark -- "Made with YourName"
  name: "Colorly",
  tagline: "Turn any photo into a coloring page",
  description:
    "Free photo to coloring page converter. Upload a picture of your kids, pets or favorite places and get a printable black-and-white coloring page in seconds.",
  url: (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, ""),
  contactEmail: "hello@example.com",
} as const;

export const limits = {
  maxUploadBytes: 10 * 1024 * 1024,
  acceptedExtensions: [".jpg", ".jpeg", ".png", ".heic", ".heif"],
  acceptedMimeTypes: ["image/jpeg", "image/png", "image/heic", "image/heif"],
  // Visitors who are not signed in: 1 free page per browser, and at most 1 per IP in this window.
  anonIpWindowHours: 24,
  // New accounts start with this many credits (also set as the DB default in profiles.credits).
  signupCredits: 3,
  // Max signed upload URLs per visitor or user per hour (stops storage abuse).
  maxUploadsPerHour: 10,
  // Leftover uploads (failed or abandoned) older than this are deleted by the cleanup job.
  // Successful uploads are deleted right after the coloring page is made.
  uploadMaxAgeMinutes: 60,
  // Coloring pages made by visitors who are not signed in are kept this long.
  anonOutputRetentionDays: 7,
  minPromptLength: 3,
  maxPromptLength: 300,
} as const;

export type ColoringStyle = "simple" | "detailed";

export const styles: Record<ColoringStyle, { label: string; description: string }> = {
  simple: { label: "Simple", description: "Bold, easy lines for kids" },
  detailed: { label: "Detailed", description: "Fine lines and patterns for adults" },
};

export function isColoringStyle(value: unknown): value is ColoringStyle {
  return value === "simple" || value === "detailed";
}
