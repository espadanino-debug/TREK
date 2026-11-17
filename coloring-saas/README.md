# Colorly: photo to coloring page

Next.js (App Router) + Supabase + OpenAI app that turns photos and text ideas into printable coloring pages.

**Status: Phase 1 (tool MVP).** Payments (Phase 2), the SEO library (Phase 3) and guides (Phase 4) come later.

## What's in Phase 1

- `/`: photo to coloring page (drag and drop, JPG/PNG/HEIC, max 10 MB, Simple or Detailed style)
- `/text-to-coloring-page`: prompt to coloring page
- Download as PNG, or PDF in US Letter (default) or A4
- Visitors who aren't signed in get 1 free page (limited by cookie + hashed IP). New accounts get 3 credits.
- Free outputs have a small watermark
- Sign in with an email magic link or Google. `/account` shows credits and past pages.
- Moderation: explicit photos are rejected (OpenAI moderation API), and prompts naming trademarked characters are rejected with a friendly message (`lib/moderation/blocklist.ts`)
- Uploaded photos are deleted right after the page is made, and a cleanup job removes leftovers within 24 hours
- `/privacy`, `/terms`, `/contact`, `robots.txt`, `sitemap.xml`, Open Graph image, JSON-LD

## Local setup

Requires Node 20.9 or newer.

```bash
cd coloring-saas
npm install
cp .env.example .env.local   # then fill in the values (see below)
npm run dev                  # http://localhost:3000
```

Checks: `npm run lint`, `npm run typecheck`, `npm run build`.

## 1. Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. **SQL Editor:** paste and run `supabase/migrations/0001_phase1.sql`. It creates the tables, Row Level Security policies, credit functions and the two private storage buckets (`uploads`, `outputs`).
3. **Project Settings > API:** copy the URL, the anon (or publishable) key and the service_role (or secret) key into `.env.local`.
4. **Authentication > URL Configuration:**
   - Site URL: `http://localhost:3000` for now (your real domain in production)
   - Redirect URLs: add `http://localhost:3000/**` and `https://YOUR-DOMAIN/**`
5. **Authentication > Sign In / Providers > Google:** enable it and paste a Google OAuth client ID and secret. Create those in Google Cloud Console (OAuth client, type "Web application") with the redirect URI that Supabase shows you.
6. **Optional, recommended (magic links that work across devices):** in Authentication > Emails > Magic Link, change the link in the template to:
   ```
   {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next=/
   ```
   Without this, magic links still work, but only when opened in the same browser that asked for them.

## 2. OpenAI

Create an API key at [platform.openai.com](https://platform.openai.com) and set `AI_PROVIDER=openai` and `AI_API_KEY`. Image models may require organization verification in the OpenAI dashboard.

- `AI_MODEL` (default `gpt-image-1`) and `AI_IMAGE_QUALITY` (`low` / `medium` / `high`, default `medium`) control cost and quality.
- The same key is used for the free moderation API.
- The adapter is `lib/ai/provider.ts`. To add fal.ai or Replicate later, add a file next to `openai.ts` and a case in `getProvider()`.

## 3. Other env vars

| Variable | What it is |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Your public URL, no trailing slash. Used for canonical URLs, sitemap and PDF footer |
| `CRON_SECRET` | Random long string. Protects `/api/cron/cleanup` |
| `IP_HASH_SALT` | Random long string for hashing visitor IPs |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | Your domain as added in Plausible. Leave empty to disable analytics |
| `NEXT_PUBLIC_PLAUSIBLE_SCRIPT_SRC` | Optional: a site-specific script URL if Plausible gives you one |
| `GOOGLE_SITE_VERIFICATION` | The `content` value of the Search Console meta tag |
| `LEMONSQUEEZY_*` | Phase 2, leave empty for now |

Generate random strings with `openssl rand -hex 32`.

## 4. Deploy on Vercel

1. Import the GitHub repo in Vercel.
2. **Root Directory: `coloring-saas`** (the app lives in this subfolder).
3. Add all env vars from `.env.example` for Production (and Preview if you use it).
4. Deploy, then set Supabase's Site URL and Redirect URLs to your real domain.
5. `vercel.json` registers a daily cron for `/api/cron/cleanup`. Vercel sends `CRON_SECRET` automatically.
6. Generation can take up to about 2 minutes. `maxDuration` is set to 180s, which needs Fluid Compute (on by default for new Vercel projects).

### Hourly photo cleanup (recommended)

Photos are deleted right after each page is made. The cleanup job catches leftovers, such as uploads that were never used. Vercel's free plan only runs crons daily, so to keep the "deleted within 24 hours" promise, also run the job hourly from Supabase. Enable the `pg_cron` and `pg_net` extensions (Database > Extensions), then run in the SQL editor:

```sql
select cron.schedule(
  'cleanup-uploads-hourly',
  '7 * * * *',
  $$ select net.http_get(
       url := 'https://YOUR-DOMAIN/api/cron/cleanup',
       headers := jsonb_build_object('Authorization', 'Bearer YOUR_CRON_SECRET')
     ) $$
);
```

## 5. Lemon Squeezy (Phase 2)

Not used yet. In Phase 2 the webhook URL will be `https://YOUR-DOMAIN/api/webhooks/lemonsqueezy`.

## Changing the brand name

Edit `config/site.ts` (name, contact email, limits), then regenerate the watermark image:

```bash
npm run make-watermark -- "Made with YourName"
```

The watermark is baked into `lib/image/watermark-data.ts` because Vercel servers have no fonts.

## Project layout

```
app/                    pages and API routes
  api/upload-url        signed upload URL (browser uploads straight to Supabase Storage)
  api/generate          runs the generation (credits, moderation, AI, watermark)
  api/generations/[id]/download   PNG or PDF (Letter/A4)
  api/quota             free pages / credits left
  api/cron/cleanup      deletes leftover photos and old anonymous outputs
components/             UI (ColoringTool is the main tool)
config/site.ts          brand, limits, styles
lib/ai/                 provider adapter + OpenAI implementation + prompts
lib/moderation/         trademark block list + OpenAI moderation
lib/image/process.ts    HEIC conversion, EXIF stripping, grayscale, watermark
lib/pdf.ts              pdf-lib Letter/A4 output
lib/quota.ts            credits and the anonymous free page
supabase/migrations/    SQL to run in Supabase
```
