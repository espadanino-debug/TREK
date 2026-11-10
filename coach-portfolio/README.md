# Coach portfolio

Cinematic one-page site for a fitness coach in Morocco (beginner weight loss
and body transformation). French first, with an Arabic/Darija version in RTL.

Self-contained Next.js app. It does not depend on the rest of this repository.

## Stack

- Next.js 16 (App Router) + TypeScript + Tailwind CSS v4
- GSAP + ScrollTrigger + SplitText for every scroll and text animation
- React Three Fiber + drei for the 3D dumbbell (built from primitives, no model file)
- Lenis smooth scroll, driven by the GSAP ticker so it stays in sync with ScrollTrigger
- Self-hosted fonts via Fontsource: Anton + Inter (Latin), Lalezar + Cairo (Arabic)

## Run

```bash
cd coach-portfolio
npm install
npm run dev      # http://localhost:3000  (redirects to /fr)
npm run build && npm start
```

## Before going live: fill in the placeholders

Everything coach-specific is in **`src/content/site.ts`**:

| Field | What to put |
|---|---|
| `name`, `nameAr` | The coach's name (Latin and Arabic script) |
| `certification`, `certificationAr` | The real certification |
| `whatsapp` | Number in international format, e.g. `2126XXXXXXXX` |
| `url` | Production domain (canonical, sitemap, Open Graph) |
| `instagram`, `city` | Optional |
| `images.portrait`, `images.before`, `images.after` | Paths to files dropped in `public/images/` |
| `prices` | The three monthly prices in DH |
| `testimonialsAreExamples` | Set to `false` once real testimonials are in |

All copy (FR and AR/Darija) is in **`src/content/dictionaries.ts`**.

Two things in there are **sample content and must be replaced**:

- **Testimonials** are example quotes, not real reviews. While
  `testimonialsAreExamples` is `true`, every card shows a visible "Exemple" tag.
- **Plan names and features** in the pricing section are a suggested structure.

The Darija copy should be proofread by a native speaker before launch.

## Change the accent color

One token in `src/app/globals.css`:

```css
--color-volt: #c6ff00;   /* e.g. #ff5a1f for orange */
```

Also update `VOLT` at the top of `src/components/three/Scene.tsx` so the 3D
inlays match.

## How it is put together

```
src/
  app/[lang]/         layout (html lang/dir, fonts, metadata) + the page
  content/            site.ts (coach facts) and dictionaries.ts (FR + AR copy)
  components/
    Preloader.tsx     0 → 100 counter, then a two-layer wipe
    three/            Scene (dumbbell, rings, dust) + SceneLayer (scroll choreography)
    sections/         Hero, Marquee, About, Method, Programs, Results,
                      Testimonials, Pricing, Faq, FinalCta
    ui/               GlowButton, SpotlightCard, Logo, Icons
  lib/                gsap setup, scroll-reveal helper, shared 3D pose
```

Performance and accessibility choices:

- three.js is in its own lazy chunk, loaded client-side while the preloader counts.
- The canvas renders on demand and stops completely when the dumbbell is off
  screen (everything between the hero and the final call to action).
- Phones keep native touch scrolling; the pinned horizontal "method" section is
  desktop only.
- `prefers-reduced-motion` turns off smooth scroll, reveals, the pin and the
  3D spin. Without JavaScript the page is still fully readable.
- A WhatsApp booking button is in the first phone screen and stays docked at
  the bottom while scrolling.
