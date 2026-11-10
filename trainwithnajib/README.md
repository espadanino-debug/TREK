# trainwithnajib

Website for Najib's online fitness coaching (Fes, Morocco). Plain HTML, CSS and
JavaScript: no build step and no dependencies. It lives in its own folder and
does not touch the TREK app.

## Pages

| File | Page |
| --- | --- |
| `index.html` | Home |
| `services.html` | Services |
| `pricing.html` | Pricing (1 month $80, 3 months $219, 6 months $399) |
| `about.html` | About / story |
| `blog.html`, `blog-*.html` | Blog and three articles |
| `contact.html` | Contact form, WhatsApp, email, Instagram, call booking |

Every page is in English and French. Both languages are in the HTML as
`<span data-l="en">…</span><span data-l="fr">…</span>`; the EN/FR switch in the
top bar shows one of them and remembers the choice. There is also a dark/light
theme switch.

## Settings

Everything you are likely to change is in `assets/js/config.js`:

- `whatsapp`, `email`, `instagram`: contact details used on every page.
- `calendly`: your Calendly link. While it is empty, "Book a call" opens WhatsApp.
- `payLinks`: one payment link per plan (Stripe Payment Link, PayPal, …). While a
  link is empty, "Card or PayPal" opens WhatsApp so you can send the link yourself.
- `photo`: path to your photo, e.g. `assets/img/najib.jpg`. Shown in the sidebar
  and on the About page.
- `transformations`: real client before/after photos. The "Client
  transformations" section on the home page appears once this list is not empty.

## Preview locally

```bash
cd trainwithnajib
python3 -m http.server 8000
# open http://localhost:8000
```

## Deploy

Any static host works. On Vercel: import the repository, set **Root Directory**
to `trainwithnajib`, framework preset **Other**, no build command.

## Notes

- The photos in `assets/img/*.webp` are AI-generated decorative images, not
  photos of Najib or of clients.
- The font (Outfit) is self-hosted in `assets/fonts/` under the SIL Open Font
  License (`OFL.txt`).
