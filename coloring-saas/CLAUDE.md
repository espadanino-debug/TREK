<!--
KIFACH TSTA3MEL HAD L FICHIER (Darija)
1. Dir dossier jdid, matalan "coloring-saas", w 7tt fih had l fichier b smiya CLAUDE.md
2. Fte7 terminal f dak l dossier w kteb: claude
3. Goul lih: "Read CLAUDE.md and build Phase 1 only. Ask me before moving to Phase 2."
4. Khddem phase b phase. Mn ba3d kol phase, jerreb l site b yeddik (npm run dev) 3ad douz l li morha.
5. L API keys (AI, Supabase, Lemon Squeezy) 7ttهم f .env.local. Ma t3tihomch f chat w ma tdirhomch f GitHub.
L spec mktouba b English 7it Claude Code kaykhdem mzyan biha f l code.
-->

# Project: AI Photo-to-Coloring-Page SaaS + SEO Printables Site

## 1. Product summary

A web app for a US audience (parents, teachers, adults) with two parts:

1. **Tool (money maker):** user uploads a photo, gets a clean black-and-white coloring page (line art) to download as PNG/PDF. Also "text to coloring page" (user types a prompt).
2. **SEO library (traffic engine):** hundreds of free printable coloring pages organized by theme (Halloween, unicorn, ocean animals, easy for adults...). Each page targets one long-tail keyword and pushes users to the tool ("Make your own from a photo").

Revenue: credits for the tool, premium PDF bundles, and display ads on library pages (added later).

The founder is based in Morocco. **Do not use Stripe** (not available for Moroccan businesses). Use **Lemon Squeezy** as merchant of record.

## 2. Tech stack (use these unless there is a strong reason not to)

- Next.js (latest stable, App Router) + TypeScript + Tailwind CSS
- Supabase: Postgres, Auth (email magic link + Google), Storage (uploads and generated images)
- Image generation: behind an adapter `lib/ai/provider.ts` with one interface `generateColoringPage({ imageUrl?, prompt?, style })`. Implement one provider first (ask me which: OpenAI image edit, fal.ai, or Replicate). Keys only from env vars.
- PDF: `pdf-lib`, output both **US Letter** (default) and A4
- Payments: Lemon Squeezy checkout + webhook
- Hosting: Vercel
- Analytics: Plausible or Umami (ask me), plus Google Search Console verification meta tag via env var

## 3. Environment variables (create `.env.example`, never commit real keys)

```
NEXT_PUBLIC_SITE_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
AI_PROVIDER=            # openai | fal | replicate
AI_API_KEY=
LEMONSQUEEZY_API_KEY=
LEMONSQUEEZY_STORE_ID=
LEMONSQUEEZY_WEBHOOK_SECRET=
LEMONSQUEEZY_VARIANT_STARTER=
LEMONSQUEEZY_VARIANT_PRO=
GOOGLE_SITE_VERIFICATION=
```

## 4. URL structure

```
/                                   Tool: photo to coloring page (main landing)
/text-to-coloring-page              Tool: prompt to coloring page
/coloring-pages                     Library hub (all themes)
/coloring-pages/[theme]             Theme page (e.g. /coloring-pages/unicorn)
/coloring-pages/[theme]/[slug]      Single printable page
/guides/[slug]                      How-to articles (MDX)
/pricing
/account                            Credits, history of generated pages
/privacy, /terms, /contact
```

## 5. Data model (Supabase)

- `profiles` (id = auth user id, email, credits int default 3, created_at)
- `generations` (id, user_id nullable, input_type 'photo'|'prompt', input_url, prompt, output_url, style, status, created_at)
- `themes` (id, slug, title, h1, meta_title, meta_description, intro_md, faq jsonb, target_keyword, volume int, kd int, season nullable, related_slugs text[], published bool)
- `printables` (id, theme_id, slug, title, alt_text, image_url, pdf_url, difficulty 'easy'|'medium'|'detailed', age_group 'toddler'|'kids'|'adults', downloads int, published bool)
- `orders` (id, user_id, ls_order_id, variant, credits_added, created_at)

Enable Row Level Security: users only read their own generations and orders.

## 6. Features by phase

### Phase 1: Tool MVP
- Homepage with upload box (drag and drop, JPG/PNG/HEIC, max 10 MB), style picker (Simple for kids / Detailed for adults), "Generate" button.
- Anonymous users get **1 free generation** (rate limit by IP + cookie). Signed-in users get **3 free credits**.
- Output: preview, download PNG, download PDF (Letter/A4). Add small watermark on free outputs.
- Delete uploaded photos from storage after 24 hours (scheduled job or Supabase cron). State this in the privacy page.
- Basic moderation: reject explicit images; reject prompts naming trademarked characters (block list: Disney, Pokemon, Hello Kitty, Bluey, Stitch, Marvel, KPop Demon Hunters, etc.) and show a friendly message.

### Phase 2: Payments
- `/pricing`: Starter $4.99 = 20 credits, Pro $9.99/month = 150 credits (prices in config file, easy to change).
- Lemon Squeezy checkout; webhook route verifies signature and adds credits idempotently.
- Paid outputs: no watermark, high resolution.

### Phase 3: SEO library
- Theme pages generated from DB, statically rendered (ISR, revalidate daily).
- Theme page template:
  1. H1 = exact target keyword in title case (e.g. "Unicorn Coloring Pages Printable")
  2. Short intro (2-3 sentences)
  3. Grid of 20-40 printables with filters (difficulty, age), each with "Download PDF"
  4. "Download all as one PDF" button (free with email, or premium)
  5. CTA block: "Turn your own photo into a coloring page" linking to `/`
  6. 300-500 words: tips, best age, how to print
  7. FAQ (render with FAQPage JSON-LD)
  8. Related themes (internal links)
- Single printable page: large preview, download buttons, alt text, breadcrumbs, 6 related printables.
- Admin script `scripts/seed-themes.ts` that reads `data/themes.json` (section 8) and inserts themes.
- Admin script `scripts/generate-printables.ts` that uses the AI adapter to create N original images per theme from prompts, saves to storage, and marks them `published=false` for manual review. **Never auto-publish.**
- Simple protected `/admin` page (only my email) to approve/reject printables and edit theme text.

### Phase 4: Content + growth
- `/guides` with MDX articles for the how-to keywords (section 8, group A).
- Pinterest-ready: each printable has a vertical 1000x1500 pin image and "Save to Pinterest" button.
- Ads slot components (empty placeholders until approved by an ad network), never inside the tool area.

## 7. SEO requirements (all phases)

- Unique `<title>` and meta description per page from DB fields; canonical URLs; Open Graph images.
- `sitemap.xml` (split by type) and `robots.txt` generated automatically, only published pages.
- JSON-LD: `WebApplication` on tool pages, `CollectionPage` + `BreadcrumbList` on theme pages, `ImageObject` on printables, `FAQPage` where FAQ exists, `HowTo` on guides.
- Images: WebP previews, descriptive file names (`unicorn-rainbow-castle-coloring-page.webp`), alt text, lazy loading.
- Core Web Vitals: Lighthouse performance and SEO > 90 on mobile. No layout shift from ads.
- Clean slugs in lowercase with hyphens. No thin pages: a theme is published only with at least 15 approved printables.

## 8. Seed data: `data/themes.json`

US monthly search volume and keyword difficulty (KD) from KWS Trends, Nov 2026. Build Phase 3 with these first, ordered by lowest KD.

```json
[
  {"slug":"unicorn","keyword":"unicorn coloring pages printable","volume":13000,"kd":16},
  {"slug":"anime","keyword":"anime coloring pages","volume":12000,"kd":17},
  {"slug":"halloween","keyword":"halloween coloring pages printable","volume":9900,"kd":23,"season":"oct"},
  {"slug":"cute-animals","keyword":"cute animal coloring pages","volume":6600,"kd":21},
  {"slug":"spring","keyword":"spring printable color pages","volume":6600,"kd":24,"season":"mar"},
  {"slug":"ocean-animals","keyword":"coloring page of ocean animals","volume":4900,"kd":20},
  {"slug":"easter-eggs","keyword":"easter egg printable coloring pages","volume":4900,"kd":30,"season":"apr"},
  {"slug":"flowers","keyword":"flower printable coloring pages","volume":4400,"kd":25},
  {"slug":"cute-for-kids","keyword":"cute coloring pages for kids","volume":4400,"kd":24},
  {"slug":"princess","keyword":"princess coloring pages printable","volume":4000,"kd":17},
  {"slug":"easy-christmas","keyword":"easy christmas coloring pages","volume":3600,"kd":29,"season":"dec"},
  {"slug":"dinosaur","keyword":"dinosaur coloring pages printable","volume":3600,"kd":24},
  {"slug":"easy-cute","keyword":"easy cute coloring pages","volume":3600,"kd":24},
  {"slug":"preschool","keyword":"easy coloring pages for preschoolers","volume":3500,"kd":22},
  {"slug":"animals","keyword":"animal coloring pages printable","volume":3200,"kd":11},
  {"slug":"easy-for-adults","keyword":"coloring pages for adults easy","volume":2900,"kd":17},
  {"slug":"cats","keyword":"cat coloring pages printable","volume":2600,"kd":17},
  {"slug":"thanksgiving","keyword":"thanksgiving coloring pages for kids","volume":1900,"kd":16,"season":"nov"},
  {"slug":"fall","keyword":"fall coloring pages for kids","volume":1900,"kd":21,"season":"oct"},
  {"slug":"summer","keyword":"summer coloring pages for kids","volume":1300,"kd":23,"season":"jun"},
  {"slug":"valentines","keyword":"free printable valentines coloring pages pdf","volume":970,"kd":6,"season":"feb"},
  {"slug":"bible","keyword":"free printable bible coloring pages pdf","volume":720,"kd":18},
  {"slug":"butterfly","keyword":"butterfly coloring pages for kids","volume":590,"kd":24},
  {"slug":"winter","keyword":"winter coloring pages for kids","volume":480,"kd":4,"season":"jan"},
  {"slug":"mermaid","keyword":"mermaid coloring pages for kids","volume":320,"kd":21},
  {"slug":"4th-of-july","keyword":"4th of july coloring pages for kids","volume":320,"kd":12,"season":"jul"}
]
```

Guide articles (group A, tool keywords):

| Slug | Target keyword | Volume | KD |
|---|---|---|---|
| how-to-turn-a-photo-into-a-coloring-page | how to turn a photo into a coloring page | 790 | 30 |
| how-to-make-a-coloring-page-from-a-photo | how to make a coloring page from a photo | 880 | 45 |
| photos-to-coloring-book-pages | photos to coloring book pages | 430 | 45 |
| make-coloring-pages-from-photos | how to make coloring pages from photos | 420 | 33 |

Homepage targets: "change photo to coloring page" (2,200), "photo to coloring page converter" (1,100), "photo to coloring page free" (480).

Publishing rule: seasonal themes go live 6-8 weeks before their season.

## 9. Rules for Claude Code

- Build **one phase at a time**. At the end of each phase: run lint, type-check and build, list what was done, and tell me how to test it manually. Wait for my OK.
- Ask before adding any paid service or new dependency that is not in section 2.
- Never hardcode secrets. Never log user photos or API keys.
- All printables must be original. No copyrighted characters, logos or brand names in prompts, titles or slugs.
- Keep UI copy in simple US English, friendly for parents. Mobile first.
- Write a short `README.md` with setup steps (Supabase project, env vars, Lemon Squeezy webhook URL, Vercel deploy).
