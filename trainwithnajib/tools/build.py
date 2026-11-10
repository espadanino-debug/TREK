#!/usr/bin/env python3
"""Generates the trainwithnajib pages (English at /, French at /fr/).

Run from the site folder:  python3 tools/build.py

Text is written once with both languages side by side: {{English||French}}.
Other markers:  [[u:services/]] page URL, [[i:arrow]] icon, [[img:name|sizes|attrs]]
responsive image, [[a:css/site.css]] versioned asset URL.
"""
import hashlib, json, pathlib, re, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
SITE = "https://trainwithnajib.vercel.app"      # change when a custom domain is added
WHATSAPP = "212695427191"
EMAIL = "Najibfitnajib@gmail.com"
INSTAGRAM = "najibfit"
PUBLISHED = "2026-11-10"
IMAGES = json.loads((ROOT / "tools/images.json").read_text())

# ---------------------------------------------------------------- helpers
def esc(s):
    return s.replace("&", "&amp;").replace('"', "&quot;").replace("<", "&lt;").replace(">", "&gt;")

def wa(text):
    from urllib.parse import quote
    return f"https://wa.me/{WHATSAPP}?text={quote(text)}"

_hash = {}
def asset(path):
    if path not in _hash:
        _hash[path] = hashlib.md5((ROOT / "assets" / path).read_bytes()).hexdigest()[:8]
    return f"/assets/{path}?v={_hash[path]}"

S = 'class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"'
ICONS = {
    "logo": '<svg viewBox="0 0 64 64" aria-hidden="true"><rect width="64" height="64" rx="32" fill="#e6e9e6"/><path fill="#0b0d0c" d="M17 46V18h6.4L36 35V18h6v28h-6.3L23.2 28.8V46z"/><circle cx="48" cy="42.5" r="4" fill="#1fb866"/></svg>',
    "services": f'<svg {S}><path d="M6.5 8v8M3.5 10v4M17.5 8v8M20.5 10v4M6.5 12h11"/></svg>',
    "book": f'<svg {S}><path d="M5 4.5h10.5a3 3 0 0 1 3 3v12H8a3 3 0 0 1-3-3z"/><path d="M9 9h5.5M9 12.5h5.5"/></svg>',
    "chat": f'<svg {S}><path d="M4 6.5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-6.5L7 20v-3.5H6a2 2 0 0 1-2-2z"/></svg>',
    "sun": f'<svg {S.replace("ico", "ico i-sun")}><circle cx="12" cy="12" r="3.8"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6 7 7M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4"/></svg>',
    "moon": f'<svg {S.replace("ico", "ico i-moon")}><path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z"/></svg>',
    "menu": f'<svg {S}><path d="M5 8h14M5 16h14"/></svg>',
    "arrow": f'<svg {S}><path d="M7 17 17 7M8.5 7H17v8.5"/></svg>',
    "check": f'<svg {S}><circle cx="12" cy="12" r="9"/><path d="m8 12.3 2.7 2.7L16 9.5"/></svg>',
    "card": f'<svg {S}><rect x="3" y="5.5" width="18" height="13" rx="2.5"/><path d="M3 10h18M7 15h3"/></svg>',
    "cash": f'<svg {S}><rect x="3" y="6.5" width="18" height="11" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6.5 9.5v5M17.5 9.5v5"/></svg>',
    "mail": f'<svg {S}><rect x="3" y="5.5" width="18" height="13" rx="2.5"/><path d="m4 7.5 8 6 8-6"/></svg>',
    "calendar": f'<svg {S}><rect x="3.5" y="5" width="17" height="15" rx="2.5"/><path d="M8 3v4M16 3v4M3.5 10h17"/></svg>',
    "insta": f'<svg {S}><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="3.8"/><circle cx="17" cy="7" r=".6" fill="currentColor"/></svg>',
    "home": f'<svg {S}><path d="M4 11.5 12 5l8 6.5V19a1 1 0 0 1-1 1h-4.5v-5h-5v5H5a1 1 0 0 1-1-1z"/></svg>',
    "user": f'<svg {S}><circle cx="12" cy="8.5" r="3.7"/><path d="M4.5 20c.8-3.6 3.8-5.5 7.5-5.5s6.7 1.9 7.5 5.5"/></svg>',
    "scale": f'<svg {S}><rect x="4" y="4" width="16" height="16" rx="4"/><path d="M8.5 9.5a5 5 0 0 1 7 0M12 9.5l1.5 3"/></svg>',
    "clock": f'<svg {S}><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg>',
    "wa": '<svg class="ico" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.2a9.7 9.7 0 0 0-8.3 14.8L2.3 21.8l4.9-1.3A9.7 9.7 0 1 0 12 2.2zm0 1.8a7.9 7.9 0 1 1-4 14.7l-.3-.2-2.8.7.8-2.7-.2-.3A7.9 7.9 0 0 1 12 4zM8.8 7.9c-.2 0-.5 0-.7.3-.3.3-1 .9-1 2.3s1 2.7 1.1 2.9c.2.2 2 3.2 5 4.4 2.5 1 3 .8 3.5.7.6 0 1.8-.7 2-1.4.3-.7.3-1.3.2-1.4l-.5-.3-1.8-.9c-.3-.1-.4-.1-.6.1l-.8 1c-.2.2-.3.2-.6.1a6.6 6.6 0 0 1-3.2-2.8c-.2-.4.2-.4.6-1.2.1-.2 0-.3 0-.5l-.8-1.9c-.2-.5-.4-.4-.6-.4z"/></svg>',
}

ALT = {
    "business": "{{Man in a shirt doing a dumbbell row at home at sunrise||Homme en chemise faisant un rowing haltère chez lui au lever du soleil}}",
    "beginner": "{{Woman training with light dumbbells at home||Femme s'entraînant avec des haltères légers à la maison}}",
    "phone": "{{Workout plan on a phone next to a dumbbell||Programme d'entraînement sur un téléphone à côté d'un haltère}}",
    "gym": "{{Rows of kettlebells and dumbbells in a dark gym||Rangées de kettlebells et d'haltères dans une salle sombre}}",
    "meal": "{{Meal prep boxes with chicken, rice and vegetables||Boîtes de repas préparés avec poulet, riz et légumes}}",
    "barbell": "{{Chalked hands gripping a barbell||Mains pleines de magnésie tenant une barre}}",
}
SIZES = {
    "half": "(max-width: 900px) 100vw, 640px",
    "third": "(max-width: 900px) 100vw, 420px",
    "small": "(max-width: 900px) 100vw, 330px",
    "wide": "(max-width: 900px) 100vw, 1150px",
}
def img(name, sizes, attrs=""):
    m = IMAGES[name]
    srcset = ", ".join(f"{asset(f'img/{name}-{w}.webp')} {w}w" for w in m["widths"])
    eager = "eager" in attrs
    attrs = attrs.replace("eager", "").strip()
    load = 'fetchpriority="high"' if eager else 'loading="lazy"'
    return (f'<img src="{asset(f"img/{name}-800.webp")}" srcset="{srcset}" sizes="{SIZES[sizes]}" '
            f'width="{m["w"]}" height="{m["h"]}" alt="{ALT[name]}" decoding="async" {load} {attrs}>').replace("  ", " ")

def url(lang, path):
    return "/" + ("fr/" if lang == "fr" else "") + path

def render(tpl, lang, comps):
    for k, v in comps.items():
        tpl = tpl.replace(f"[[{k}]]", v)
    tpl = re.sub(r"\[\[img:(\w+)\|(\w+)\|?([^\]]*)\]\]", lambda m: img(m.group(1), m.group(2), m.group(3)), tpl)
    tpl = re.sub(r"\{\{(.*?)\|\|(.*?)\}\}", lambda m: m.group(1 if lang == "en" else 2), tpl, flags=re.S)
    tpl = re.sub(r"\[\[u:([^\]]*)\]\]", lambda m: url(lang, m.group(1)), tpl)
    tpl = re.sub(r"\[\[i:(\w+)\]\]", lambda m: ICONS[m.group(1)], tpl)
    tpl = re.sub(r"\[\[a:([^\]]+)\]\]", lambda m: asset(m.group(1)), tpl)
    left = re.findall(r"\[\[[^\]]*\]\]|\{\{", tpl)   # unresolved markers
    assert not left, left[:5]
    return tpl

# ---------------------------------------------------------------- shared parts
NAV = [("", "{{Home||Accueil}}"), ("services/", "Services"), ("pricing/", "{{Pricing||Tarifs}}"),
       ("about/", "{{About||À propos}}"), ("blog/", "Blog"), ("contact/", "Contact")]

WA_START = "{{" + wa("Hi Najib, I found your website and I'd like to start coaching.") + "||" + \
           wa("Salut Najib, j'ai vu ton site et j'aimerais commencer le coaching.") + "}}"
WA_BOOK = "{{" + wa("Hi Najib, I'd like to book a call to talk about my goals.") + "||" + \
          wa("Salut Najib, j'aimerais réserver un appel pour parler de mes objectifs.") + "}}"

CTA = """
<section class="card card--accent cta reveal">
  <span class="orb"></span>
  <div style="position:relative">
    <p class="eyebrow">{{Let's start||On commence}}</p>
    <h2 class="h-lg mt-12">{{Your plan can be ready this week.||Votre programme peut être prêt cette semaine.}}</h2>
    <p class="lead muted mt-16" style="max-width:48ch">{{Send me a message, tell me your goal and your schedule, and we build from there.||Envoyez-moi un message, dites-moi votre objectif et votre emploi du temps, et on construit à partir de là.}}</p>
  </div>
  <div class="row gap-12 wrap" style="position:relative">
    <a class="btn btn--ink" href="[[WA]]" target="_blank" rel="noopener">[[i:wa]]WhatsApp</a>
    <a class="btn btn--ghost" href="[[BOOK]]" target="_blank" rel="noopener" data-book>{{Book a call||Réserver un appel}}</a>
  </div>
</section>
"""

INCLUDED = [
    "{{Training program built for you (gym or home)||Programme d'entraînement sur mesure (salle ou maison)}}",
    "{{Nutrition plan adapted to your day||Plan alimentaire adapté à vos journées}}",
    "{{WhatsApp follow-up||Suivi sur WhatsApp}}",
    "{{Call every weekend||Appel chaque week-end}}",
]
def ticks(items):
    return '<ul class="ticks">' + "".join(f"<li>[[i:check]]<span>{i}</span></li>" for i in items) + "</ul>"

def plan(pid, cls, tag, name, price, per, note, btn):
    tag_html = f'<span class="plan__tag">{tag}</span>' if tag else '<span class="plan__tag" style="visibility:hidden" aria-hidden="true">.</span>'
    return f"""
  <article class="card {cls} plan tilt reveal">
    {tag_html}
    <h2 class="h-md">{name}</h2>
    <p class="plan__price"><strong>{{{{${price}||{price} $}}}}</strong><span class="muted">{per}</span></p>
    <p class="muted">{note}</p>
    <hr>
    {ticks(INCLUDED)}
    <a class="btn {btn} btn--block mt-auto" href="[[u:contact/]]?plan={pid}" data-plan="{pid}">{{{{Choose this plan||Choisir cette formule}}}}</a>
  </article>"""

PLANS = (
    plan("m1", "card--dark", "", "{{1 month||1 mois}}", 80, "{{one payment||paiement unique}}",
         "{{A first month to build the habit and see how we work together.||Un premier mois pour installer l'habitude et voir comment on travaille ensemble.}}", "btn--light")
    + plan("m3", "card--accent", "{{Recommended||Recommandé}}", "{{3 months||3 mois}}", 219, "{{$73 / month||73 $ / mois}}",
           "{{Enough time to see a real change. You save $21.||Assez de temps pour voir un vrai changement. Vous économisez 21 $.}}", "btn--ink")
    + plan("m6", "card--light", "{{Best value||Meilleur prix}}", "{{6 months||6 mois}}", 399, "{{$66.50 / month||66,50 $ / mois}}",
           "{{For a lasting transformation. You save $81.||Pour une transformation durable. Vous économisez 81 $.}}", "btn--ink")
)

MODAL = """
<dialog class="modal" id="planModal" aria-labelledby="planTitle">
  <button class="modal__close" type="button" data-close aria-label="{{Close||Fermer}}">×</button>
  <div class="modal__body">
    <p class="eyebrow">{{Selected plan||Formule choisie}}</p>
    <h2 class="h-md" id="planTitle"></h2>
    <p class="muted">{{How would you like to pay?||Comment souhaitez-vous payer ?}}</p>
    <button class="option" type="button" data-pay="online">[[i:card]]<span><b>{{Card or PayPal||Carte ou PayPal}}</b><small data-pay-note></small></span></button>
    <button class="option" type="button" data-pay="cash">[[i:cash]]<span><b>{{Cash or bank transfer||Espèces ou virement}}</b><small>{{We arrange it together on WhatsApp.||On s'organise ensemble sur WhatsApp.}}</small></span></button>
  </div>
</dialog>"""

def scene(kind, pos="0.5,0.5", size=1, priority=True):
    # a still frame first, then the canvas that replaces it once the visitor interacts
    load = 'fetchpriority="high"' if priority else ""
    poster = f'<img class="scene-poster" src="[[a:img/{kind}-poster.webp]]" width="1000" height="760" alt="" decoding="async" {load}>'
    return poster.replace(" >", ">") + f'<canvas data-scene="{kind}" data-pos="{pos}" data-size="{size}" data-src="[[a:js/scene.js]]" aria-hidden="true"></canvas>'

# ---------------------------------------------------------------- structured data
PERSON = {
    "@type": "Person", "@id": SITE + "/#najib", "name": "Najib",
    "jobTitle": "NASM Certified Personal Trainer and Online Fitness Coach",
    "url": SITE + "/about/", "sameAs": [f"https://www.instagram.com/{INSTAGRAM}/"],
    "hasCredential": {"@type": "EducationalOccupationalCredential", "name": "NASM Certified Personal Trainer",
                      "recognizedBy": {"@type": "Organization", "name": "National Academy of Sports Medicine"}},
    "address": {"@type": "PostalAddress", "addressLocality": "Fes", "addressCountry": "MA"},
}
OFFERS = [{"@type": "Offer", "name": n, "price": p, "priceCurrency": "USD", "url": SITE + "/pricing/",
           "availability": "https://schema.org/InStock"}
          for n, p in (("1 month of online coaching", "80"), ("3 months of online coaching", "219"), ("6 months of online coaching", "399"))]
BUSINESS = {
    "@type": "ProfessionalService", "@id": SITE + "/#business", "name": "trainwithnajib",
    "description": "Online fitness coaching and personal training: custom training programs, nutrition plans, WhatsApp follow-up and a weekly call.",
    "url": SITE + "/", "image": SITE + "/assets/img/og.jpg", "logo": SITE + "/assets/img/logo.svg",
    "telephone": "+" + WHATSAPP, "email": EMAIL, "priceRange": "$80 - $399",
    "address": {"@type": "PostalAddress", "addressLocality": "Fes", "addressCountry": "MA"},
    "areaServed": "Worldwide", "availableLanguage": ["English", "French"],
    "founder": {"@id": SITE + "/#najib"}, "sameAs": [f"https://www.instagram.com/{INSTAGRAM}/"],
    "makesOffer": OFFERS,
}
def ld(*nodes):
    return '<script type="application/ld+json">' + json.dumps({"@context": "https://schema.org", "@graph": list(nodes)}, ensure_ascii=False, separators=(",", ":")) + "</script>"

def crumbs(lang, trail):
    items = [{"@type": "ListItem", "position": i + 1, "name": n, "item": SITE + url(lang, p)} for i, (p, n) in enumerate(trail)]
    return {"@type": "BreadcrumbList", "itemListElement": items}

def faq_ld(faqs, lang):
    strip = lambda s: re.sub(r"<[^>]+>", "", s)
    pick = lambda s: re.sub(r"\{\{(.*?)\|\|(.*?)\}\}", lambda m: m.group(1 if lang == "en" else 2), s, flags=re.S)
    return {"@type": "FAQPage", "mainEntity": [
        {"@type": "Question", "name": strip(pick(q)), "acceptedAnswer": {"@type": "Answer", "text": strip(pick(re.sub(r"\[\[u:([^\]]*)\]\]", lambda m: url(lang, m.group(1)), a)))}}
        for q, a in faqs]}

def faq_html(faqs):
    return '<section class="card card--light faq reveal">' + "".join(
        f"<details><summary><h3>{q}</h3></summary><p>{a}</p></details>" for q, a in faqs) + "</section>"

# ---------------------------------------------------------------- pages
pages = {}

pages[""] = dict(
    id="",
    title="{{Online Fitness Coach & Personal Trainer | trainwithnajib||Coach Fitness en Ligne & Personal Trainer | trainwithnajib}}",
    desc="{{NASM certified online fitness coach. Personalized training and nutrition plans, WhatsApp follow-up and a weekly call. Coaching plans from $80 a month.||Coach fitness en ligne certifié NASM. Programmes d'entraînement et plans alimentaires personnalisés, suivi WhatsApp et appel hebdomadaire. Dès 80 $ par mois.}}",
    ld=lambda lang: ld(BUSINESS, PERSON, {"@type": "WebSite", "@id": SITE + "/#website", "url": SITE + "/", "name": "trainwithnajib", "inLanguage": ["en", "fr"]}),
    modal=True,
    body="""
<section class="hero">
  <div class="card card--scene hero__main">
    """ + scene("dumbbell", "0.72,0.3", 0.82, True) + """
    <div class="card__body">
      <span class="badge"><i></i>{{NASM certified · 100% online||Certifié NASM · 100 % en ligne}}</span>
      <div class="hero__text">
        <h1 class="hero__title"><span class="kicker">{{Online fitness coach and personal trainer||Coach fitness en ligne et personal trainer}}</span><span class="h-xl">{{New way of <em>training</em>||Une nouvelle façon de <em>s'entraîner</em>}}</span></h1>
        <p class="lead hero__lead mt-16">{{Personalized training and nutrition built around your job, your schedule and your level. Followed on WhatsApp, reviewed together every weekend.||Un entraînement et une nutrition personnalisés, construits autour de votre travail, de votre emploi du temps et de votre niveau. Suivi sur WhatsApp, bilan ensemble chaque week-end.}}</p>
        <div class="row gap-12 wrap mt-24">
          <a class="prompt" href="[[u:contact/]]"><span class="round">[[i:arrow]]</span>{{Tell me your goal||Dites-moi votre objectif}}</a>
          <a class="btn btn--ghost" href="[[u:pricing/]]">{{See pricing||Voir les tarifs}}</a>
        </div>
      </div>
    </div>
  </div>

  <div class="hero__steps">
    <div class="step"><span class="num">01</span><div><h2>{{Tell me about you||Parlez-moi de vous}}</h2><p>{{Goal, job, schedule, level.||Objectif, travail, emploi du temps, niveau.}}</p></div></div>
    <div class="step"><span class="num">02</span><div><h2>{{Get your plan||Recevez votre programme}}</h2><p>{{Training and nutrition, made for you.||Entraînement et nutrition, faits pour vous.}}</p></div></div>
    <div class="step"><span class="num">03</span><div><h2>{{Check in every week||Bilan chaque semaine}}</h2><p>{{WhatsApp follow-up, weekend call.||Suivi WhatsApp, appel le week-end.}}</p></div></div>
  </div>

  <div class="card card--light hero__goal">
    <h2 class="eyebrow">{{Choose your goal||Choisissez votre objectif}}</h2>
    <div class="chips">
      <button class="chip" type="button" data-goal="fat" aria-pressed="false">{{Fat loss||Perte de gras}}</button>
      <button class="chip" type="button" data-goal="muscle" aria-pressed="false">{{Muscle gain||Prise de muscle}}</button>
      <button class="chip" type="button" data-goal="busy" aria-pressed="true">{{Busy schedule||Agenda chargé}}</button>
      <button class="chip" type="button" data-goal="start" aria-pressed="false">{{Beginner||Débutant·e}}</button>
      <button class="chip" type="button" data-goal="home" aria-pressed="false">{{At home||À la maison}}</button>
      <button class="chip" type="button" data-goal="strong" aria-pressed="false">{{Strength||Force}}</button>
    </div>
    <p class="goal-out muted" id="goalOut" aria-live="polite">{{<b>Busy schedule.</b> Three focused 45-minute sessions that fit around meetings and travel, at the gym, at home or in a hotel.||<b>Agenda chargé.</b> Trois séances ciblées de 45 minutes, calées autour des réunions et des déplacements : salle, maison ou hôtel.}}</p>
  </div>

  <a class="card card--img hero__stat" href="[[u:about/]]">
    [[img:gym|small|]]
    <div class="card__body">
      <div class="row between"><span class="eyebrow">{{Since 2020||Depuis 2020}}</span><span class="round round--light">[[i:arrow]]</span></div>
      <p class="mt-auto"><span class="big-stat" data-count="200" data-suffix="+">200+</span><br>{{people coached||personnes coachées}}</p>
    </div>
  </a>
</section>

<div class="section-head reveal">
  <div><p class="eyebrow">{{Who I coach||Pour qui}}</p><h2 class="h-lg mt-12">{{A personal trainer for real lives||Un coach pour la vraie vie}}</h2></div>
  <p class="muted">{{No two people get the same plan. Yours depends on your work, your time and where you start from.||Personne ne reçoit le même programme. Le vôtre dépend de votre travail, de votre temps et de votre point de départ.}}</p>
</div>
<section class="grid grid-2">
  <article class="card card--img aud tilt reveal">
    [[img:business|half|data-parallax]]
    <div class="card__body">
      <span class="eyebrow">01</span>
      <h3 class="h-lg">{{Busy professionals||Professionnels débordés}}</h3>
      <ul>
        <li>{{Short, efficient sessions that fit a full agenda||Des séances courtes et efficaces pour un agenda plein}}</li>
        <li>{{A plan that survives travel and long days||Un programme qui résiste aux déplacements et aux longues journées}}</li>
        <li>{{More energy and focus at work||Plus d'énergie et de concentration au travail}}</li>
      </ul>
    </div>
  </article>
  <article class="card card--img aud tilt reveal">
    [[img:beginner|half|data-parallax]]
    <div class="card__body">
      <span class="eyebrow">02</span>
      <h3 class="h-lg">{{Women starting out||Femmes débutantes}}</h3>
      <ul>
        <li>{{Start from zero, with no judgment||Partir de zéro, sans jugement}}</li>
        <li>{{Learn the movements step by step||Apprendre les mouvements pas à pas}}</li>
        <li>{{At home or at the gym, your choice||À la maison ou en salle, à vous de choisir}}</li>
      </ul>
    </div>
  </article>
</section>

<div class="section-head reveal">
  <div><p class="eyebrow">{{What you get||Ce que vous recevez}}</p><h2 class="h-lg mt-12">{{Fitness and nutrition coaching in one plan||Coaching sport et nutrition dans une seule formule}}</h2></div>
  <a class="btn btn--ghost" href="[[u:services/]]">{{All services||Tous les services}}</a>
</div>
<section class="grid grid-4">
  <article class="card card--light svc reveal"><span class="svc__icon">[[i:services]]</span><h3 class="h-sm">{{Training program||Programme d'entraînement}}</h3><p class="muted">{{Written for your goal, your level and the equipment you have.||Écrit pour votre objectif, votre niveau et le matériel dont vous disposez.}}</p></article>
  <article class="card card--dark svc reveal"><span class="svc__icon">[[i:book]]</span><h3 class="h-sm">{{Nutrition plan||Plan alimentaire}}</h3><p class="muted">{{Simple meals that match your days and the food you already like.||Des repas simples, adaptés à vos journées et à ce que vous aimez déjà.}}</p></article>
  <article class="card card--light svc reveal"><span class="svc__icon">[[i:chat]]</span><h3 class="h-sm">{{WhatsApp follow-up||Suivi WhatsApp}}</h3><p class="muted">{{Questions, doubts, a tough week: you write, I answer.||Questions, doutes, semaine difficile : vous écrivez, je réponds.}}</p></article>
  <article class="card card--accent svc reveal"><span class="svc__icon">[[i:calendar]]</span><h3 class="h-sm">{{Weekend call||Appel du week-end}}</h3><p class="muted">{{Every weekend we review the week and set the next one.||Chaque week-end, on fait le bilan de la semaine et on prépare la suivante.}}</p></article>
</section>

<section id="transformations" hidden>
  <div class="section-head">
    <div><p class="eyebrow">{{Results||Résultats}}</p><h2 class="h-lg mt-12">{{Client transformations||Transformations de clients}}</h2></div>
  </div>
  <div class="grid grid-3" id="transformationsGrid"></div>
</section>

<div class="section-head reveal">
  <div><p class="eyebrow">{{Pricing||Tarifs}}</p><h2 class="h-lg mt-12">{{Online personal training from $80 a month||Coaching en ligne dès 80 $ par mois}}</h2></div>
  <p class="muted">{{Every plan includes the same coaching. The longer you commit, the less you pay per month.||Chaque formule inclut le même coaching. Plus l'engagement est long, moins vous payez par mois.}}</p>
</div>
<section class="grid grid-3">[[PLANS]]
</section>

<section class="grid grid-2">
  <article class="card card--dark reveal" style="padding:44px;display:flex;flex-direction:column;gap:18px">
    <p class="eyebrow">{{The coach||Le coach}}</p>
    <h2 class="h-lg">{{Hi, I'm Najib.||Salut, moi c'est Najib.}}</h2>
    <p class="lead muted">{{I started training at 14 in Fes. Since 2020 I've coached more than 200 people online as a NASM certified personal trainer, most of them with busy jobs or starting from zero.||J'ai commencé à m'entraîner à 14 ans, à Fès. Depuis 2020, j'ai coaché plus de 200 personnes en ligne en tant que coach certifié NASM, la plupart avec un travail prenant ou partant de zéro.}}</p>
    <a class="btn btn--light mt-auto start" href="[[u:about/]]">{{Read my story||Lire mon histoire}}</a>
  </article>
  <article class="card card--img reveal" style="min-height:380px">
    [[img:phone|half|data-parallax]]
    <div class="card__body"><div class="mt-auto"><p class="eyebrow">{{100% online||100 % en ligne}}</p><h3 class="h-md mt-8">{{Your remote personal trainer, wherever you are.||Votre coach à distance, où que vous soyez.}}</h3></div></div>
  </article>
</section>
[[CTA]]
""")

# ---- services
SERVICES_FAQ = [
    ("{{Do I need a gym membership?||Faut-il être inscrit·e dans une salle ?}}",
     "{{No. Your program is built for what you have: a gym, some equipment at home, or just your bodyweight.||Non. Votre programme est construit pour ce que vous avez : une salle, un peu de matériel à la maison ou simplement le poids du corps.}}"),
    ("{{I have never trained before. Is this for me?||Je n'ai jamais fait de sport. Est-ce pour moi ?}}",
     "{{Yes. Many of the people I coach start from zero. We begin with the basics and move forward at your pace.||Oui. Beaucoup de personnes que j'accompagne partent de zéro. On commence par les bases et on avance à votre rythme.}}"),
    ("{{How does the follow-up work?||Comment se passe le suivi ?}}",
     "{{During the week we stay in touch on WhatsApp. Every weekend we have a call to review the week and plan the next one.||En semaine, on reste en contact sur WhatsApp. Chaque week-end, on fait un appel pour le bilan de la semaine et la préparation de la suivante.}}"),
    ("{{What is the difference between a fitness coach and a personal trainer?||Quelle est la différence entre un coach fitness et un personal trainer ?}}",
     "{{A personal trainer mainly teaches and supervises workouts. A fitness coach also looks after nutrition, habits and follow-up over time. I am a certified personal trainer and I work as a coach, so you get both. <a href=\"[[u:blog/fitness-coach-vs-personal-trainer/]]\">Read the full comparison</a>.||Un personal trainer enseigne et encadre surtout les séances. Un coach fitness s'occupe aussi de la nutrition, des habitudes et du suivi dans la durée. Je suis personal trainer certifié et je travaille comme coach : vous avez les deux. <a href=\"[[u:blog/fitness-coach-vs-personal-trainer/]]\">Lire la comparaison complète</a>.}}"),
    ("{{How much does online personal training cost?||Combien coûte un coaching en ligne ?}}",
     "{{Plans start at $80 for one month, $219 for three months and $399 for six months. Everything is included. <a href=\"[[u:pricing/]]\">See the pricing page</a>.||Les formules commencent à 80 $ pour un mois, 219 $ pour trois mois et 399 $ pour six mois. Tout est inclus. <a href=\"[[u:pricing/]]\">Voir la page tarifs</a>.}}"),
    ("{{Where are you based? Can we work together from abroad?||Où êtes-vous basé ? Peut-on travailler ensemble depuis l'étranger ?}}",
     "{{I'm based in Fes, Morocco, and the coaching is 100% online, so you can join from anywhere. Coaching is available in English and French.||Je suis basé à Fès, au Maroc, et le coaching est 100 % en ligne : vous pouvez me rejoindre de partout. Le coaching est disponible en français et en anglais.}}"),
]
pages["services/"] = dict(
    id="services/",
    title="{{Personalized Fitness Coaching Online | trainwithnajib||Coaching Fitness Personnalisé en Ligne | trainwithnajib}}",
    desc="{{Personalized fitness coaching online: custom training program, nutrition plan, WhatsApp follow-up and a weekly call. For beginners, women and busy people.||Coaching fitness personnalisé en ligne : programme sur mesure, plan alimentaire, suivi WhatsApp et appel hebdomadaire. Pour débutants, femmes et actifs pressés.}}",
    ld=lambda lang: ld(crumbs(lang, [("", "trainwithnajib"), ("services/", "Services")]), faq_ld(SERVICES_FAQ, lang),
                       {"@type": "Service", "name": "Online fitness and nutrition coaching", "serviceType": "Personal training",
                        "provider": {"@id": SITE + "/#business"}, "areaServed": "Worldwide", "offers": OFFERS}),
    body="""
<section class="phero">
  <div class="card card--light phero__text">
    <p class="eyebrow">Services</p>
    <div>
      <h1 class="h-page">{{Personalized fitness coaching that fits your life||Un coaching fitness personnalisé qui s'adapte à votre vie}}</h1>
      <p class="lead muted mt-16" style="max-width:52ch">{{Fat loss, muscle gain, getting stronger or simply starting: I take care of the plan, the food and the follow-up. You show up.||Perdre du gras, prendre du muscle, gagner en force ou simplement commencer : je m'occupe du programme, de l'alimentation et du suivi. Vous, vous venez.}}</p>
    </div>
    <div class="row gap-12 wrap">
      <a class="btn btn--accent" href="[[u:pricing/]]">{{See pricing||Voir les tarifs}}</a>
      <a class="btn btn--ghost" href="[[BOOK]]" target="_blank" rel="noopener" data-book>{{Book a call||Réserver un appel}}</a>
    </div>
  </div>
  <div class="card card--scene phero__scene">""" + scene("kettlebell") + """</div>
</section>

<div class="section-head reveal">
  <div><p class="eyebrow">{{Included in every plan||Inclus dans chaque formule}}</p><h2 class="h-lg mt-12">{{Your fitness and nutrition coach, in four parts||Votre coach sport et nutrition, en quatre points}}</h2></div>
</div>
<section class="grid grid-2">
  <article class="card card--dark svc reveal"><div class="row between"><span class="svc__icon">[[i:services]]</span><span class="num">01</span></div>
    <h3 class="h-md">{{Custom training program||Programme d'entraînement sur mesure}}</h3>
    <p class="muted">{{Your program is written for your goal, your level, the days you are free and the equipment you have: a full gym, a pair of dumbbells at home or nothing at all. It changes as you progress.||Votre programme est écrit pour votre objectif, votre niveau, vos jours disponibles et votre matériel : une salle complète, une paire d'haltères à la maison ou rien du tout. Il évolue avec vos progrès.}}</p></article>
  <article class="card card--light svc reveal"><div class="row between"><span class="svc__icon">[[i:book]]</span><span class="num">02</span></div>
    <h3 class="h-md">{{Nutrition plan||Plan alimentaire}}</h3>
    <p class="muted">{{No extreme diet. A clear plan built around your working days, your family meals and the food you actually enjoy, so you can keep it up for months.||Pas de régime extrême. Un plan clair, construit autour de vos journées de travail, de vos repas en famille et de ce que vous aimez vraiment manger, pour tenir pendant des mois.}}</p></article>
  <article class="card card--light svc reveal"><div class="row between"><span class="svc__icon">[[i:chat]]</span><span class="num">03</span></div>
    <h3 class="h-md">{{WhatsApp follow-up||Suivi sur WhatsApp}}</h3>
    <p class="muted">{{A question about an exercise, a restaurant menu, a week that goes wrong: you send a message and we adjust. You are never alone with your plan.||Une question sur un exercice, un menu au restaurant, une semaine qui dérape : vous envoyez un message et on ajuste. Vous n'êtes jamais seul·e avec votre programme.}}</p></article>
  <article class="card card--accent svc reveal"><div class="row between"><span class="svc__icon">[[i:calendar]]</span><span class="num">04</span></div>
    <h3 class="h-md">{{Weekly call, every weekend||Appel hebdomadaire, chaque week-end}}</h3>
    <p class="muted">{{Once a week, on the weekend, we talk: what went well, what was hard, and what changes for the week ahead.||Une fois par semaine, le week-end, on se parle : ce qui a bien marché, ce qui a été difficile, et ce qui change pour la semaine suivante.}}</p></article>
</section>

<div class="section-head reveal">
  <div><p class="eyebrow">{{Who it is for||Pour qui}}</p><h2 class="h-lg mt-12">{{One-on-one personal training, wherever you are||Un coaching individuel, où que vous soyez}}</h2></div>
  <p class="muted">{{The coaching is always 1 on 1. What changes is where you start and what you want.||Le coaching est toujours individuel. Ce qui change, c'est votre point de départ et votre objectif.}}</p>
</div>
<section class="grid grid-3">
  <article class="card card--light svc reveal"><span class="svc__icon">[[i:user]]</span><h3 class="h-sm">{{Online personal trainer for women||Coach en ligne pour femmes}}</h3><p class="muted">{{A calm, judgment-free start. We build strength and confidence step by step, at home or at the gym.||Un départ serein, sans jugement. On construit force et confiance pas à pas, à la maison ou en salle.}}</p></article>
  <article class="card card--dark svc reveal"><span class="svc__icon">[[i:check]]</span><h3 class="h-sm">{{Personal trainer for beginners||Coach pour débutants}}</h3><p class="muted">{{Never trained before? We start with the basic movements and a plan you can actually follow.||Jamais fait de sport ? On commence par les mouvements de base et un programme que vous pouvez vraiment suivre.}}</p></article>
  <article class="card card--light svc reveal"><span class="svc__icon">[[i:scale]]</span><h3 class="h-sm">{{Fitness coach for weight loss||Coach pour la perte de poids}}</h3><p class="muted">{{Strength training, daily movement and a way of eating you can keep. No crash diets.||Renforcement, mouvement au quotidien et une alimentation que vous pouvez tenir. Pas de régime extrême.}}</p></article>
  <article class="card card--dark svc reveal"><span class="svc__icon">[[i:home]]</span><h3 class="h-sm">{{At-home personal training||Entraînement à domicile}}</h3><p class="muted">{{No gym needed. Your plan works with dumbbells, bands or just your bodyweight.||Pas besoin de salle. Votre programme fonctionne avec des haltères, des élastiques ou le poids du corps.}}</p></article>
  <article class="card card--light svc reveal"><span class="svc__icon">[[i:clock]]</span><h3 class="h-sm">{{Coaching for busy professionals||Coaching pour actifs pressés}}</h3><p class="muted">{{Three focused sessions a week that fit around meetings, travel and family.||Trois séances ciblées par semaine, calées autour des réunions, des déplacements et de la famille.}}</p></article>
  <article class="card card--accent svc reveal"><span class="svc__icon">[[i:services]]</span><h3 class="h-sm">{{Muscle gain and strength||Prise de muscle et force}}</h3><p class="muted">{{Progressive overload on the big lifts, enough protein and numbers we track every week.||Surcharge progressive sur les mouvements de base, assez de protéines et des chiffres suivis chaque semaine.}}</p></article>
</section>

<div class="section-head reveal">
  <div><p class="eyebrow">{{How it works||Comment ça marche}}</p><h2 class="h-lg mt-12">{{How does online coaching work?||Comment fonctionne le coaching en ligne ?}}</h2></div>
</div>
<section class="grid grid-4">
  <article class="card card--dark svc reveal"><span class="num">01</span><h3 class="h-sm">{{You write to me||Vous m'écrivez}}</h3><p class="muted">{{WhatsApp, the form or a booked call. Tell me your goal.||WhatsApp, le formulaire ou un appel réservé. Dites-moi votre objectif.}}</p></article>
  <article class="card card--dark svc reveal"><span class="num">02</span><h3 class="h-sm">{{I learn your routine||Je découvre votre routine}}</h3><p class="muted">{{Job, schedule, level, equipment, food habits.||Travail, emploi du temps, niveau, matériel, habitudes alimentaires.}}</p></article>
  <article class="card card--dark svc reveal"><span class="num">03</span><h3 class="h-sm">{{You get your plan||Vous recevez votre plan}}</h3><p class="muted">{{Training and nutrition, ready to follow.||Entraînement et nutrition, prêts à suivre.}}</p></article>
  <article class="card card--accent svc reveal"><span class="num">04</span><h3 class="h-sm">{{We adjust every week||On ajuste chaque semaine}}</h3><p class="muted">{{WhatsApp during the week, a call on the weekend.||WhatsApp en semaine, un appel le week-end.}}</p></article>
</section>

<div class="section-head reveal"><div><p class="eyebrow">FAQ</p><h2 class="h-lg mt-12">{{Questions about online coaching||Questions sur le coaching en ligne}}</h2></div></div>
""" + faq_html(SERVICES_FAQ) + """
[[CTA]]
""")

# ---- pricing
PRICING_FAQ = [
    ("{{How much does an online personal trainer cost?||Combien coûte un coach en ligne ?}}",
     "{{With me, $80 for one month, $219 for three months ($73 a month) or $399 for six months ($66.50 a month). The price covers the whole coaching, not a number of sessions.||Avec moi, 80 $ pour un mois, 219 $ pour trois mois (73 $ par mois) ou 399 $ pour six mois (66,50 $ par mois). Le prix couvre tout le coaching, pas un nombre de séances.}}"),
    ("{{What is the difference between the plans?||Quelle est la différence entre les formules ?}}",
     "{{Only the duration and the price per month. The coaching is the same: training program, nutrition plan, WhatsApp follow-up and a call every weekend.||Seulement la durée et le prix par mois. Le coaching est le même : programme d'entraînement, plan alimentaire, suivi WhatsApp et un appel chaque week-end.}}"),
    ("{{Which plan should I choose?||Quelle formule choisir ?}}",
     "{{One month is a good way to try. Changing your body takes time, so three or six months give the plan room to work, at a lower monthly price.||Un mois est une bonne façon d'essayer. Transformer son corps prend du temps : trois ou six mois laissent au programme le temps d'agir, à un prix mensuel plus bas.}}"),
    ("{{What happens after I choose a plan?||Que se passe-t-il après avoir choisi une formule ?}}",
     "{{I contact you on WhatsApp, ask about your goal, your work and your schedule, and prepare your training and nutrition plan.||Je vous contacte sur WhatsApp, je vous pose des questions sur votre objectif, votre travail et votre emploi du temps, puis je prépare votre programme d'entraînement et votre plan alimentaire.}}"),
    ("{{How can I pay?||Comment puis-je payer ?}}",
     "{{Online by card or PayPal, or in cash or by bank transfer. Pick a plan above and choose your payment method.||En ligne par carte ou PayPal, ou bien en espèces ou par virement. Choisissez une formule ci-dessus puis votre moyen de paiement.}}"),
]
pages["pricing/"] = dict(
    id="pricing/",
    title="{{Online Personal Trainer Cost & Plans | trainwithnajib||Tarifs Coach Sportif en Ligne | trainwithnajib}}",
    desc="{{Affordable online personal training: 1 month $80, 3 months $219, 6 months $399. Training program, nutrition plan, WhatsApp follow-up and weekly call included.||Coaching en ligne abordable : 1 mois 80 $, 3 mois 219 $, 6 mois 399 $. Programme d'entraînement, plan alimentaire, suivi WhatsApp et appel hebdomadaire inclus.}}",
    ld=lambda lang: ld(crumbs(lang, [("", "trainwithnajib"), ("pricing/", "Pricing" if lang == "en" else "Tarifs")]), faq_ld(PRICING_FAQ, lang),
                       {"@type": "Service", "name": "Online personal training", "provider": {"@id": SITE + "/#business"}, "areaServed": "Worldwide", "offers": OFFERS}),
    modal=True,
    body="""
<section class="phero">
  <div class="card card--dark phero__text">
    <p class="eyebrow">{{Pricing||Tarifs}}</p>
    <div>
      <h1 class="h-page">{{Online personal training plans from $80 a month||Coaching en ligne : des formules dès 80 $ par mois}}</h1>
      <p class="lead muted mt-16" style="max-width:54ch">{{One coaching, three durations. Every plan includes the full coaching, so you only choose how long you commit. The longer the plan, the lower the monthly price.||Un seul coaching, trois durées. Chaque formule inclut le coaching complet : vous choisissez seulement la durée. Plus la formule est longue, plus le prix mensuel baisse.}}</p>
    </div>
  </div>
  <div class="card card--scene phero__scene">""" + scene("plates") + """</div>
</section>

<section class="grid grid-3">[[PLANS]]
</section>

<div class="section-head reveal">
  <div><p class="eyebrow">{{Payment||Paiement}}</p><h2 class="h-lg mt-12">{{Pay the way that suits you||Payez comme cela vous arrange}}</h2></div>
</div>
<section class="pay">
  <article class="card card--light svc reveal"><span class="svc__icon">[[i:card]]</span><h3 class="h-sm">{{Card or PayPal||Carte ou PayPal}}</h3><p class="muted">{{Pay online with a secure payment link.||Payez en ligne avec un lien de paiement sécurisé.}}</p></article>
  <article class="card card--light svc reveal"><span class="svc__icon">[[i:cash]]</span><h3 class="h-sm">{{Cash or bank transfer||Espèces ou virement}}</h3><p class="muted">{{Prefer cash or a transfer? No problem, we arrange it on WhatsApp.||Vous préférez les espèces ou un virement ? Aucun problème, on s'organise sur WhatsApp.}}</p></article>
  <article class="card card--dark svc reveal"><span class="svc__icon">[[i:calendar]]</span><h3 class="h-sm">{{Not sure yet?||Pas encore décidé·e ?}}</h3><p class="muted">{{Book a call and we look at which plan fits your goal.||Réservez un appel et on regarde quelle formule correspond à votre objectif.}}</p><a class="btn btn--light btn--sm mt-auto start" href="[[BOOK]]" target="_blank" rel="noopener" data-book>{{Book a call||Réserver un appel}}</a></article>
</section>

<div class="section-head reveal"><div><p class="eyebrow">FAQ</p><h2 class="h-lg mt-12">{{Questions about plans and prices||Questions sur les formules et les prix}}</h2></div></div>
""" + faq_html(PRICING_FAQ) + """
[[CTA]]
""")

# ---- about
pages["about/"] = dict(
    id="about/",
    title="{{About Najib, NASM Certified Fitness Coach | trainwithnajib||À propos de Najib, Coach Certifié NASM | trainwithnajib}}",
    desc="{{Najib is a NASM certified personal trainer and online fitness coach from Fes, Morocco. Training since the age of 14, coaching since 2020, 200+ people coached.||Najib est personal trainer certifié NASM et coach fitness en ligne, basé à Fès au Maroc. Sportif depuis ses 14 ans, coach depuis 2020, 200+ personnes coachées.}}",
    ld=lambda lang: ld(crumbs(lang, [("", "trainwithnajib"), ("about/", "About" if lang == "en" else "À propos")]),
                       {"@type": "AboutPage", "url": SITE + url(lang, "about/"), "mainEntity": {"@id": SITE + "/#najib"}}, PERSON),
    body="""
<section class="phero phero--about">
  <div class="card card--scene portrait" data-photo>""" + scene("dumbbell") + """
    <div class="card__body">
      <p class="eyebrow">{{Fes · Morocco||Fès · Maroc}}</p>
      <div><p class="h-md" style="font-weight:600">Najib</p><p style="opacity:.8">{{NASM certified personal trainer||Personal trainer certifié NASM}}</p></div>
    </div>
  </div>
  <div class="card card--light phero__text">
    <p class="eyebrow">{{My story||Mon histoire}}</p>
    <div>
      <h1 class="h-page">{{It started at 14, in Fes.||Tout a commencé à 14 ans, à Fès.}}</h1>
      <div class="prose muted mt-24">
        <p>{{I was 14 when I started training. What began as curiosity quickly became the habit that shaped everything else: discipline, patience and the confidence that comes from keeping a promise to yourself.||J'avais 14 ans quand j'ai commencé à m'entraîner. Ce qui n'était qu'une curiosité est vite devenu l'habitude qui a façonné tout le reste : la discipline, la patience et la confiance que l'on gagne en tenant une promesse faite à soi-même.}}</p>
        <p>{{The more I learned, the more I wanted to pass it on. In 2020 I started coaching, and I earned my NASM certification so that what I teach rests on solid ground and not on gym myths.||Plus j'apprenais, plus j'avais envie de transmettre. En 2020, j'ai commencé à coacher, et j'ai obtenu ma certification NASM pour que ce que j'enseigne repose sur des bases solides, pas sur des mythes de salle.}}</p>
        <p>{{Since then I have coached more than 200 people online. Many are busy professionals with no time, or women taking their very first steps in fitness. They taught me the most important lesson: the best program is the one that fits your life.||Depuis, j'ai coaché plus de 200 personnes en ligne. Beaucoup sont des professionnels qui manquent de temps, ou des femmes qui font leurs tout premiers pas dans le fitness. Ils m'ont appris la leçon la plus importante : le meilleur programme est celui qui s'adapte à votre vie.}}</p>
        <p>{{That is how I work today. I look at your job, your schedule and your level, and I build the plan around them. Then I stay with you, on WhatsApp during the week and on a call every weekend.||C'est ainsi que je travaille aujourd'hui. Je regarde votre travail, votre emploi du temps et votre niveau, et je construis le programme autour. Ensuite, je reste à vos côtés : sur WhatsApp en semaine et en appel chaque week-end.}}</p>
      </div>
    </div>
  </div>
</section>

<section class="grid grid-2">
  <article class="card card--dark reveal" style="padding:40px">
    <h2 class="eyebrow">{{The journey||Le parcours}}</h2>
    <div class="timeline mt-24">
      <div><span class="when">14</span><div><h3 class="h-sm">{{First training sessions||Premiers entraînements}}</h3><p class="muted mt-8">{{A teenager in Fes discovers fitness and never stops.||Un adolescent de Fès découvre le fitness et ne s'arrête plus.}}</p></div></div>
      <div><span class="when">2020</span><div><h3 class="h-sm">{{Coaching begins||Début du coaching}}</h3><p class="muted mt-8">{{First clients, online from day one.||Premiers clients, en ligne dès le premier jour.}}</p></div></div>
      <div><span class="when">NASM</span><div><h3 class="h-sm">{{Certified personal trainer||Personal trainer certifié}}</h3><p class="muted mt-8">{{Certified by the National Academy of Sports Medicine.||Certifié par la National Academy of Sports Medicine.}}</p></div></div>
      <div><span class="when">200+</span><div><h3 class="h-sm">{{People coached||Personnes coachées}}</h3><p class="muted mt-8">{{And every plan was written for one person only.||Et chaque programme a été écrit pour une seule personne.}}</p></div></div>
    </div>
  </article>
  <div class="grid" style="align-content:stretch">
    <article class="card card--light svc reveal"><span class="num">01</span><h2 class="h-md">{{Your life comes first||Votre vie d'abord}}</h2><p class="muted">{{The plan adapts to your work and your family, not the other way round.||Le programme s'adapte à votre travail et à votre famille, pas l'inverse.}}</p></article>
    <article class="card card--accent svc reveal"><span class="num">02</span><h2 class="h-md">{{Simple beats perfect||Simple vaut mieux que parfait}}</h2><p class="muted">{{A plan you follow at 80% beats a perfect one you drop after two weeks.||Un programme suivi à 80 % vaut mieux qu'un programme parfait abandonné au bout de deux semaines.}}</p></article>
    <article class="card card--light svc reveal"><span class="num">03</span><h2 class="h-md">{{Honest follow-up||Un suivi honnête}}</h2><p class="muted">{{No magic promises. We look at the week as it was and we improve the next one.||Pas de promesses magiques. On regarde la semaine telle qu'elle a été et on améliore la suivante.}}</p></article>
  </div>
</section>
[[CTA]]
""")

# ---- blog
POSTS = [
    dict(slug="personal-trainer-cost", desc="{{How much does a personal trainer cost? Typical prices for in-person sessions and online coaching, what changes the price, and how to tell if it is fair.||Combien coûte un personal trainer ? Prix habituels des séances en salle et du coaching en ligne, ce qui fait varier le tarif et comment juger s'il est juste.}}", img="barbell", read=4,
         cat="{{Pricing||Tarifs}}",
         h1="{{How much does a personal trainer cost?||Combien coûte un personal trainer ?}}",
         title="{{How Much Does a Personal Trainer Cost? Online vs Gym||Combien Coûte un Personal Trainer ? En Ligne ou en Salle}}",
         sum="{{What you really pay for in-person sessions and for online coaching, and how to tell if a price is fair.||Ce que vous payez vraiment pour des séances en salle et pour un coaching en ligne, et comment savoir si un prix est juste.}}",
         body="""
<p>{{<strong>Short answer:</strong> in-person personal training is usually sold by the session. In the United States a one-hour session commonly costs somewhere between $40 and $100 or more, depending on the city, the gym and the trainer's experience. Online coaching is usually sold by the month and tends to cost less overall.||<strong>Réponse courte :</strong> le coaching en présentiel se vend généralement à la séance. Aux États-Unis, une séance d'une heure coûte souvent entre 40 $ et 100 $ ou plus, selon la ville, la salle et l'expérience du coach. Le coaching en ligne se vend plutôt au mois et revient en général moins cher au total.}}</p>
<h2>{{What does in-person training cost per month?||Combien coûte le présentiel par mois ?}}</h2>
<p>{{The session price is only half the story. What matters is how many sessions you need. Two sessions a week at $60 comes to about $480 a month, and that usually covers the workouts only, not your food or the days in between.||Le prix de la séance ne dit pas tout. Ce qui compte, c'est le nombre de séances. Deux séances par semaine à 60 $ reviennent à environ 480 $ par mois, et cela ne couvre généralement que les entraînements, pas votre alimentation ni les jours entre deux séances.}}</p>
<h2>{{What does online personal training cost?||Combien coûte un coaching en ligne ?}}</h2>
<p>{{Online coaching is priced for the whole month instead of by the hour. You get a program to follow on your own schedule, plus follow-up from your coach. My own plans are a simple example:||Le coaching en ligne est facturé au mois plutôt qu'à l'heure. Vous recevez un programme à suivre selon votre emploi du temps, plus le suivi de votre coach. Mes propres formules en sont un exemple simple :}}</p>
<ul>
<li>{{<strong>1 month:</strong> $80||<strong>1 mois :</strong> 80 $}}</li>
<li>{{<strong>3 months:</strong> $219, or $73 a month||<strong>3 mois :</strong> 219 $, soit 73 $ par mois}}</li>
<li>{{<strong>6 months:</strong> $399, or $66.50 a month||<strong>6 mois :</strong> 399 $, soit 66,50 $ par mois}}</li>
</ul>
<p>{{Each one includes the training program, the nutrition plan, WhatsApp follow-up and a call every weekend. You can see the details on the <a href="[[u:pricing/]]">pricing page</a>.||Chacune inclut le programme d'entraînement, le plan alimentaire, le suivi WhatsApp et un appel chaque week-end. Les détails sont sur la <a href="[[u:pricing/]]">page tarifs</a>.}}</p>
<h2>{{What changes the price?||Qu'est-ce qui fait varier le prix ?}}</h2>
<ul>
<li>{{<strong>Location.</strong> Big cities and premium gyms cost more.||<strong>Le lieu.</strong> Les grandes villes et les salles haut de gamme coûtent plus cher.}}</li>
<li>{{<strong>Experience and certification.</strong> A certified trainer with years of clients usually charges more.||<strong>L'expérience et la certification.</strong> Un coach certifié avec des années de pratique facture souvent plus.}}</li>
<li>{{<strong>What is included.</strong> Workouts only, or nutrition and follow-up too?||<strong>Ce qui est inclus.</strong> Seulement les séances, ou aussi la nutrition et le suivi ?}}</li>
<li>{{<strong>Commitment.</strong> Longer plans usually lower the monthly price.||<strong>L'engagement.</strong> Les formules longues font en général baisser le prix mensuel.}}</li>
</ul>
<h2>{{How do you know if the price is fair?||Comment savoir si le prix est juste ?}}</h2>
<ol>
<li>{{<strong>Check the certification.</strong> Ask which one and who issued it.||<strong>Vérifiez la certification.</strong> Demandez laquelle et qui l'a délivrée.}}</li>
<li>{{<strong>Ask what you get between sessions.</strong> Most results come from the other six days of the week.||<strong>Demandez ce que vous avez entre les séances.</strong> L'essentiel des résultats vient des six autres jours de la semaine.}}</li>
<li>{{<strong>Start short.</strong> One month is enough to see how a coach works before you commit for longer.||<strong>Commencez court.</strong> Un mois suffit pour voir comment un coach travaille avant de vous engager plus longtemps.}}</li>
</ol>
<h2>{{When is in-person training worth it?||Quand le présentiel vaut-il le coup ?}}</h2>
<p>{{If you have an injury or a medical condition, or you want someone physically next to you for every rep, in-person sessions make sense. Talk to your doctor first if you have a health concern. For most people who mainly need a clear plan and someone to keep them on track, online coaching does the job for less.||Si vous avez une blessure ou un problème de santé, ou si vous voulez quelqu'un physiquement à côté de vous à chaque répétition, le présentiel a du sens. Parlez-en d'abord à votre médecin en cas de souci de santé. Pour la plupart des gens, qui ont surtout besoin d'un plan clair et de quelqu'un pour les garder sur la bonne voie, le coaching en ligne suffit, pour moins cher.}}</p>
"""),
    dict(slug="fitness-coach-vs-personal-trainer", desc="{{Fitness coach vs personal trainer: what each one does, how they differ in focus, format and price, and how to choose the right one for your goal.||Coach fitness ou personal trainer : ce que fait chacun, leurs différences de priorité, de format et de prix, et comment choisir selon votre objectif.}}", img="gym", read=3,
         cat="{{Guide||Guide}}",
         h1="{{Fitness coach vs personal trainer: what is the difference?||Coach fitness ou personal trainer : quelle différence ?}}",
         title="{{Fitness Coach vs Personal Trainer: The Difference||Coach Fitness ou Personal Trainer : Quelle Différence ?}}",
         sum="{{The two titles overlap, but they do not promise the same thing. Here is how to choose the one you need.||Les deux titres se recoupent, mais ne promettent pas la même chose. Voici comment choisir celui qu'il vous faut.}}",
         body="""
<p>{{<strong>Short answer:</strong> a personal trainer mainly teaches and supervises workouts. A fitness coach looks at the whole picture, including training, food, habits and follow-up over weeks and months. Many professionals do both.||<strong>Réponse courte :</strong> un personal trainer enseigne et encadre surtout les séances. Un coach fitness regarde l'ensemble : entraînement, alimentation, habitudes et suivi sur des semaines et des mois. Beaucoup de professionnels font les deux.}}</p>
<h2>{{What does a personal trainer do?||Que fait un personal trainer ?}}</h2>
<p>{{A personal trainer designs workouts and teaches you how to do them safely, usually in one-hour sessions at a gym or at home. Good trainers hold a certification from a recognized body such as NASM, ACE or ACSM.||Un personal trainer conçoit des séances et vous apprend à les réaliser en sécurité, le plus souvent en séances d'une heure, en salle ou à domicile. Les bons coachs ont une certification d'un organisme reconnu comme NASM, ACE ou ACSM.}}</p>
<h2>{{What does a fitness coach do?||Que fait un coach fitness ?}}</h2>
<p>{{A fitness coach works on the long game. Beyond the workouts, a coach helps with nutrition, sleep, routine and motivation, and checks in regularly to adjust the plan. This is why coaching works well online.||Un coach fitness travaille sur la durée. Au-delà des séances, il aide sur la nutrition, le sommeil, la routine et la motivation, et fait le point régulièrement pour ajuster le plan. C'est pour cela que le coaching fonctionne bien en ligne.}}</p>
<h2>{{Fitness coach vs personal trainer, side by side||Coach fitness et personal trainer, côte à côte}}</h2>
<ul>
<li>{{<strong>Focus:</strong> a trainer focuses on the session, a coach on the whole week.||<strong>Priorité :</strong> le trainer se concentre sur la séance, le coach sur toute la semaine.}}</li>
<li>{{<strong>Format:</strong> a trainer is usually in person, a coach is often remote.||<strong>Format :</strong> le trainer est souvent en présentiel, le coach souvent à distance.}}</li>
<li>{{<strong>Contact:</strong> a trainer sees you during sessions, a coach follows you between them.||<strong>Contact :</strong> le trainer vous voit pendant les séances, le coach vous suit entre elles.}}</li>
<li>{{<strong>Price:</strong> a trainer is usually paid by the session, a coach by the month.||<strong>Prix :</strong> le trainer est en général payé à la séance, le coach au mois.}}</li>
</ul>
<h2>{{Which one do you need?||Lequel vous faut-il ?}}</h2>
<p>{{Choose in-person training if you want someone beside you correcting each movement. Choose coaching if you already know you will train on your own time and what you need is a plan, structure and someone who keeps you honest.||Choisissez le présentiel si vous voulez quelqu'un à vos côtés pour corriger chaque mouvement. Choisissez le coaching si vous savez déjà que vous vous entraînerez à vos horaires et que ce qu'il vous faut, c'est un plan, un cadre et quelqu'un qui vous garde honnête avec vous-même.}}</p>
<h2>{{Can one person be both?||Une seule personne peut-elle être les deux ?}}</h2>
<p>{{Yes. In many countries neither title is regulated, so look at the certification and at what is actually included. I am a NASM certified personal trainer and I work as an online coach: you get a program written by a trainer, plus the nutrition and weekly follow-up of a coach. See <a href="[[u:services/]]">how it works</a>.||Oui. Dans beaucoup de pays, aucun des deux titres n'est réglementé : regardez donc la certification et ce qui est réellement inclus. Je suis personal trainer certifié NASM et je travaille comme coach en ligne : vous avez un programme écrit par un trainer, plus la nutrition et le suivi hebdomadaire d'un coach. Voir <a href="[[u:services/]]">comment ça marche</a>.}}</p>
"""),
    dict(slug="workout-plan-busy-schedule", desc="{{A simple training plan for a busy schedule: three 45-minute full-body workouts a week, what each session includes and how to stay consistent.||Un programme simple pour un agenda chargé : trois séances complètes de 45 minutes par semaine, le contenu de chaque séance et comment rester régulier.}}", img="business", read=3,
         cat="{{Training||Entraînement}}",
         h1="{{Three workouts a week: a training plan for a busy schedule||Trois séances par semaine : s'entraîner avec un agenda chargé}}",
         title="{{3 Workouts a Week: Training Plan for a Busy Schedule||3 Séances par Semaine : S'entraîner Sans Avoir le Temps}}",
         sum="{{You don't need six days in the gym. You need three sessions you never miss.||Pas besoin de six jours en salle. Il faut trois séances que vous ne ratez jamais.}}",
         body="""
<p>{{Most busy people fail at fitness for one reason: they start with a plan made for someone with free time. Five or six sessions a week look great on paper and last about ten days.||La plupart des gens occupés échouent pour une seule raison : ils commencent avec un programme fait pour quelqu'un qui a du temps libre. Cinq ou six séances par semaine, c'est beau sur le papier, et ça tient une dizaine de jours.}}</p>
<h2>{{Are three workouts a week enough?||Trois séances par semaine, est-ce suffisant ?}}</h2>
<p>{{Yes. Progress comes from repeating good sessions for months, not from doing a lot for two weeks. Three full-body sessions train every major muscle group several times a week and leave room for work, family and sleep.||Oui. Les progrès viennent de bonnes séances répétées pendant des mois, pas de beaucoup d'efforts pendant deux semaines. Trois séances complètes font travailler chaque grand groupe musculaire plusieurs fois par semaine et laissent de la place pour le travail, la famille et le sommeil.}}</p>
<h2>{{What should each workout include?||Que doit contenir chaque séance ?}}</h2>
<p>{{Each session takes about 45 minutes and follows the same pattern:||Chaque séance dure environ 45 minutes et suit le même schéma :}}</p>
<ul>
<li>{{<strong>One leg movement</strong>: squat, lunge or deadlift variation||<strong>Un mouvement de jambes</strong> : squat, fente ou variante de soulevé de terre}}</li>
<li>{{<strong>One push</strong>: push-ups, bench press or overhead press||<strong>Une poussée</strong> : pompes, développé couché ou développé militaire}}</li>
<li>{{<strong>One pull</strong>: rows or pull-downs||<strong>Un tirage</strong> : rowing ou tirage vertical}}</li>
<li>{{<strong>One core exercise</strong>: plank or loaded carry||<strong>Un exercice de gainage</strong> : planche ou marche avec charge}}</li>
</ul>
<h2>{{How do you stay consistent?||Comment rester régulier ?}}</h2>
<ol>
<li>{{<strong>Book it like a meeting.</strong> Put the three sessions in your calendar. What is planned gets done.||<strong>Réservez-la comme une réunion.</strong> Mettez les trois séances dans votre agenda. Ce qui est planifié se fait.}}</li>
<li>{{<strong>Keep a 20-minute version.</strong> On a bad day, do the first two exercises and go. A short session keeps the habit.||<strong>Gardez une version de 20 minutes.</strong> Les mauvais jours, faites les deux premiers exercices et partez. Une séance courte entretient l'habitude.}}</li>
<li>{{<strong>Walk more.</strong> Take calls on foot, use the stairs. Daily movement counts more than you think.||<strong>Marchez plus.</strong> Prenez vos appels en marchant, montez les escaliers. Le mouvement quotidien compte plus qu'on ne le croit.}}</li>
</ol>
<p>{{If you want this adapted to your own week, that is exactly what I do in my <a href="[[u:services/]]">online coaching</a>.||Si vous voulez l'adapter à votre propre semaine, c'est exactement ce que je fais dans mon <a href="[[u:services/]]">coaching en ligne</a>.}}</p>
"""),
    dict(slug="strength-training-for-women-myths", desc="{{Strength training for women: five common myths about lifting weights, getting bulky, cardio and toning, explained by a certified personal trainer.||Musculation au féminin : cinq idées reçues sur les poids, la peur d'être trop musclée, le cardio et le tonus, expliquées par un coach certifié.}}", img="beginner", read=3,
         cat="{{Beginners||Débutantes}}",
         h1="{{Strength training for women: five myths to drop||Musculation au féminin : cinq idées reçues à oublier}}",
         title="{{Strength Training for Women: 5 Myths to Drop||Musculation au Féminin : 5 Idées Reçues à Oublier}}",
         sum="{{No, lifting weights will not make you bulky. Here is what actually happens.||Non, soulever des poids ne vous rendra pas « trop musclée ». Voici ce qui se passe vraiment.}}",
         body="""
<p>{{Many women who come to me have wanted to start for years. What held them back was rarely laziness. It was bad information. Here are the five ideas I hear most often.||Beaucoup de femmes qui viennent me voir voulaient commencer depuis des années. Ce qui les retenait, c'était rarement la paresse : c'étaient de mauvaises informations. Voici les cinq idées que j'entends le plus souvent.}}</p>
<h2>{{1. Will lifting weights make me bulky?||1. La musculation va-t-elle me rendre trop musclée ?}}</h2>
<p>{{No. Building a lot of muscle is slow and takes years of deliberate effort. What strength training gives most beginners is a firmer, stronger body and better posture.||Non. Prendre beaucoup de muscle est lent et demande des années d'efforts ciblés. Ce que la musculation apporte à la plupart des débutantes, c'est un corps plus ferme, plus fort, et une meilleure posture.}}</p>
<h2>{{2. Is cardio the only way to lose fat?||2. Seul le cardio fait-il perdre du gras ?}}</h2>
<p>{{No. Fat loss depends mostly on how much you eat compared with how much you spend. Strength training helps you keep your muscle while you lose fat, so the result looks and feels better.||Non. La perte de gras dépend surtout de ce que vous mangez par rapport à ce que vous dépensez. La musculation vous aide à garder votre muscle pendant que vous perdez du gras : le résultat est plus beau et plus agréable à vivre.}}</p>
<h2>{{3. Should I only use light weights to tone?||3. Faut-il seulement des poids légers pour se tonifier ?}}</h2>
<p>{{No. Your body changes when the work gets a little harder over time. Start light to learn the movement, then add load progressively.||Non. Votre corps change quand le travail devient un peu plus difficile avec le temps. Commencez léger pour apprendre le mouvement, puis ajoutez de la charge progressivement.}}</p>
<h2>{{4. Do I need to get fit before I start?||4. Dois-je être en forme avant de commencer ?}}</h2>
<p>{{No. You get fit by starting. A good program meets you where you are today, even if that is zero.||Non. On se met en forme en commençant. Un bon programme part de là où vous êtes aujourd'hui, même si c'est zéro.}}</p>
<h2>{{5. What if the gym is not for me?||5. Et si la salle n'est pas pour moi ?}}</h2>
<p>{{Then we train at home. A mat, a pair of dumbbells and a clear plan are enough to make real progress. That is how many women start with my <a href="[[u:services/]]">online personal training</a>.||Alors on s'entraîne à la maison. Un tapis, une paire d'haltères et un programme clair suffisent pour vraiment progresser. C'est ainsi que beaucoup de femmes commencent mon <a href="[[u:services/]]">coaching en ligne</a>.}}</p>
"""),
    dict(slug="plate-method-nutrition", desc="{{The plate method explained: how to build balanced meals without counting calories, with simple portions for vegetables, protein, carbs and fats.||La méthode de l'assiette expliquée : composer des repas équilibrés sans compter les calories, avec des portions simples de légumes, protéines et féculents.}}", img="meal", read=2,
         cat="Nutrition",
         h1="{{Eat well without counting calories: the plate method||Bien manger sans compter les calories : la méthode de l'assiette}}",
         title="{{The Plate Method: Eat Well Without Counting Calories||Méthode de l'Assiette : Bien Manger Sans Compter}}",
         sum="{{A simple way to build balanced meals, at home, at work or at the restaurant.||Une façon simple de composer des repas équilibrés, à la maison, au travail ou au restaurant.}}",
         body="""
<p>{{Counting every calorie works, but most people stop after a few weeks. For everyday life I prefer a method you can use anywhere, with no app: your plate.||Compter chaque calorie fonctionne, mais la plupart des gens arrêtent au bout de quelques semaines. Pour la vie de tous les jours, je préfère une méthode utilisable partout, sans application : votre assiette.}}</p>
<h2>{{How do you build a balanced plate?||Comment composer une assiette équilibrée ?}}</h2>
<ul>
<li>{{<strong>Half vegetables</strong>: salad, cooked vegetables, soup||<strong>La moitié en légumes</strong> : salade, légumes cuits, soupe}}</li>
<li>{{<strong>A quarter protein</strong>: chicken, fish, eggs, meat, lentils||<strong>Un quart de protéines</strong> : poulet, poisson, œufs, viande, lentilles}}</li>
<li>{{<strong>A quarter carbohydrates</strong>: rice, bread, potatoes, couscous||<strong>Un quart de féculents</strong> : riz, pain, pommes de terre, couscous}}</li>
<li>{{<strong>A little fat</strong>: olive oil, nuts, avocado||<strong>Un peu de bonnes graisses</strong> : huile d'olive, fruits secs, avocat}}</li>
</ul>
<p>{{It works with a tajine as well as with a salad bowl. You do not need special food, only better proportions.||Cela marche avec un tajine aussi bien qu'avec une salade composée. Pas besoin d'aliments spéciaux, seulement de meilleures proportions.}}</p>
<h2>{{Which habits matter most?||Quelles habitudes comptent le plus ?}}</h2>
<ol>
<li>{{<strong>Protein at every meal.</strong> It keeps you full and protects your muscle.||<strong>Des protéines à chaque repas.</strong> Elles rassasient et protègent vos muscles.}}</li>
<li>{{<strong>Water first.</strong> Drink a glass before you eat and keep a bottle on your desk.||<strong>L'eau d'abord.</strong> Buvez un verre avant de manger et gardez une bouteille sur votre bureau.}}</li>
<li>{{<strong>Eat well most of the time.</strong> One dinner out does not ruin a week. Just get back to your plate at the next meal.||<strong>Bien manger la plupart du temps.</strong> Un dîner dehors ne gâche pas une semaine. Revenez simplement à votre assiette au repas suivant.}}</li>
</ol>
<p>{{When you need a more precise plan, for a specific goal or a deadline, that is where a <a href="[[u:services/]]">fitness and nutrition coach</a> comes in.||Quand il vous faut un plan plus précis, pour un objectif ou une échéance, c'est là qu'un <a href="[[u:services/]]">coach sport et nutrition</a> intervient.}}</p>
"""),
]

cards = ""
for i, p in enumerate(POSTS):
    cls = "card--dark" if i % 2 else "card--light"
    cards += f"""
  <a class="card {cls} post-card reveal" href="[[u:blog/{p['slug']}/]]">
    <div class="thumb">[[img:{p['img']}|third|]]</div>
    <p class="meta">{p['cat']} · {p['read']} min</p>
    <h2 class="h-md mt-12">{p['h1']}</h2>
    <p class="muted mt-12">{p['sum']}</p>
    <div class="row between mt-auto" style="padding-top:20px"><span style="font-weight:600">{{{{Read the article||Lire l'article}}}}</span><span class="round">[[i:arrow]]</span></div>
  </a>"""

pages["blog/"] = dict(
    id="blog/",
    title="{{Fitness & Nutrition Coaching Blog | trainwithnajib||Blog Coaching Sport & Nutrition | trainwithnajib}}",
    desc="{{Practical fitness and nutrition advice from a certified online coach: what a personal trainer costs, training with a busy schedule, strength training for women.||Conseils pratiques de sport et de nutrition par un coach en ligne certifié : prix d'un coach, s'entraîner avec un agenda chargé, musculation au féminin.}}",
    ld=lambda lang: ld(crumbs(lang, [("", "trainwithnajib"), ("blog/", "Blog")]),
                       {"@type": "Blog", "url": SITE + url(lang, "blog/"), "name": "trainwithnajib blog", "author": {"@id": SITE + "/#najib"}}),
    body="""
<section class="card card--light phero__text" style="min-height:280px">
  <p class="eyebrow">Blog</p>
  <div>
    <h1 class="h-page">{{Fitness and nutrition advice that works||Des conseils sport et nutrition qui marchent}}</h1>
    <p class="lead muted mt-16" style="max-width:52ch">{{Training and nutrition, explained without jargon, for people with a job and a life.||L'entraînement et la nutrition, expliqués sans jargon, pour ceux qui ont un travail et une vie.}}</p>
  </div>
</section>
<section class="grid grid-3">""" + cards + """
</section>
[[CTA]]
""")

def post_ld(p):
    def f(lang):
        pick = lambda s: re.sub(r"\{\{(.*?)\|\|(.*?)\}\}", lambda m: m.group(1 if lang == "en" else 2), s, flags=re.S)
        u = SITE + url(lang, f"blog/{p['slug']}/")
        return ld(crumbs(lang, [("", "trainwithnajib"), ("blog/", "Blog"), (f"blog/{p['slug']}/", pick(p["h1"]))]),
                  {"@type": "BlogPosting", "headline": pick(p["h1"]), "description": pick(p["desc"]), "inLanguage": lang,
                   "datePublished": PUBLISHED, "dateModified": PUBLISHED, "mainEntityOfPage": u, "url": u,
                   "image": SITE + f"/assets/img/{p['img']}-{IMAGES[p['img']]['widths'][-1]}.webp",
                   "author": {"@id": SITE + "/#najib"}, "publisher": {"@id": SITE + "/#business"}}, PERSON)
    return f

for p in POSTS:
    pages[f"blog/{p['slug']}/"] = dict(
        id="blog/", title=p["title"], desc=p["desc"], ld=post_ld(p), og_type="article",
        body=f"""
<article class="card card--light article">
  <a class="back" href="[[u:blog/]]">[[i:arrow]]{{{{All articles||Tous les articles}}}}</a>
  <p class="eyebrow mt-24">{p['cat']} · {p['read']} min · {{{{By Najib, NASM certified personal trainer||Par Najib, personal trainer certifié NASM}}}}</p>
  <h1 class="h-lg mt-12" style="max-width:22ch">{p['h1']}</h1>
  <div class="article__cover mt-32">[[img:{p['img']}|wide|eager]]</div>
  <div class="prose mt-32" style="margin-inline:auto">{p['body']}</div>
</article>
[[CTA]]
""")

# ---- contact
pages["contact/"] = dict(
    id="contact/",
    title="{{Contact Najib, Online Fitness Coach | trainwithnajib||Contacter Najib, Coach Fitness en Ligne | trainwithnajib}}",
    desc="{{Contact Najib, online fitness coach and personal trainer, on WhatsApp, by email or on Instagram, or book a call to talk about your goals and your schedule.||Contactez Najib, coach fitness en ligne et personal trainer, sur WhatsApp, par e-mail ou sur Instagram, ou réservez un appel pour parler de vos objectifs.}}",
    ld=lambda lang: ld(crumbs(lang, [("", "trainwithnajib"), ("contact/", "Contact")]),
                       {"@type": "ContactPage", "url": SITE + url(lang, "contact/"), "about": {"@id": SITE + "/#business"}}),
    body="""
<section class="phero phero--form">
  <div class="card card--light" style="padding:clamp(24px,4vw,40px)">
    <p class="eyebrow">Contact</p>
    <h1 class="h-lg mt-12">{{Tell me your goal||Dites-moi votre objectif}}</h1>
    <p class="muted mt-12" style="max-width:52ch">{{Fill in the form and send it on WhatsApp or by email. I reply personally.||Remplissez le formulaire et envoyez-le sur WhatsApp ou par e-mail. Je réponds personnellement.}}</p>
    <form id="contactForm" class="form-grid mt-24">
      <div class="field"><label for="f-name">{{Name||Nom}}</label><input id="f-name" name="name" required autocomplete="name" placeholder="{{Your name||Votre nom}}"></div>
      <div class="field"><label for="f-goal">{{Goal||Objectif}}</label>
        <select id="f-goal" name="goal">
          <option>{{Fat loss||Perte de gras}}</option>
          <option>{{Muscle gain||Prise de muscle}}</option>
          <option>{{Strength||Force}}</option>
          <option>{{Getting started||Débuter}}</option>
          <option>{{Other||Autre}}</option>
        </select></div>
      <div class="field full"><label for="f-plan">{{Plan||Formule}}</label>
        <select id="f-plan" name="plan">
          <option value="">{{Not sure yet||Je ne sais pas encore}}</option>
          <option value="m1">{{1 month · $80||1 mois · 80 $}}</option>
          <option value="m3">{{3 months · $219||3 mois · 219 $}}</option>
          <option value="m6">{{6 months · $399||6 mois · 399 $}}</option>
        </select></div>
      <div class="field full"><label for="f-msg">Message</label><textarea id="f-msg" name="message" placeholder="{{Your job, your schedule, your level||Votre travail, votre emploi du temps, votre niveau}}"></textarea></div>
      <div class="full row gap-12 wrap">
        <button class="btn btn--accent" type="submit" value="wa">[[i:wa]]{{Send on WhatsApp||Envoyer sur WhatsApp}}</button>
        <button class="btn btn--ghost" type="submit" value="mail">{{Send by email||Envoyer par e-mail}}</button>
      </div>
    </form>
  </div>
  <div class="grid" style="align-content:start">
    <a class="channel" href="[[WA]]" target="_blank" rel="noopener"><span class="channel__icon">[[i:wa]]</span><span><small>WhatsApp</small><b>+212 695 427 191</b></span>[[i:arrow]]</a>
    <a class="channel" href="mailto:""" + EMAIL + """"><span class="channel__icon">[[i:mail]]</span><span><small>Email</small><b>""" + EMAIL + """</b></span>[[i:arrow]]</a>
    <a class="channel" href="https://www.instagram.com/""" + INSTAGRAM + """/" target="_blank" rel="noopener"><span class="channel__icon">[[i:insta]]</span><span><small>Instagram</small><b>@""" + INSTAGRAM + """</b></span>[[i:arrow]]</a>
    <a class="channel" href="[[BOOK]]" target="_blank" rel="noopener" data-book><span class="channel__icon">[[i:calendar]]</span><span><small>{{Prefer to talk?||Vous préférez parler ?}}</small><b>{{Book a call||Réserver un appel}}</b></span>[[i:arrow]]</a>
    <div class="card card--img" style="min-height:220px">[[img:gym|third|]]<div class="card__body"><div class="mt-auto"><p class="eyebrow">{{Fes · Morocco||Fès · Maroc}}</p><h2 class="h-sm mt-8">{{Online coaching, wherever you are.||Coaching en ligne, où que vous soyez.}}</h2></div></div></div>
  </div>
</section>
""")

# ---------------------------------------------------------------- page shell
SHELL = """<!doctype html>
<html lang="{lang}" data-theme="dark">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="{desc}">
<link rel="canonical" href="{canonical}">
<link rel="alternate" hreflang="en" href="{en}">
<link rel="alternate" hreflang="fr" href="{fr}">
<link rel="alternate" hreflang="x-default" href="{en}">
<meta property="og:type" content="{og_type}">
<meta property="og:site_name" content="trainwithnajib">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:url" content="{canonical}">
<meta property="og:image" content="{site}/assets/img/og.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:locale" content="{locale}">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#060707">
<link rel="icon" href="/assets/img/favicon.svg" type="image/svg+xml">
<link rel="preload" href="/assets/fonts/outfit-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
<style>{css}</style>
<script>try{{var t=localStorage.getItem("twn-theme");if(t)document.documentElement.setAttribute("data-theme",t)}}catch(e){{}}</script>
{ld}
</head>
<body>
<div class="app">
<header class="top">
  <a class="brand" href="[[u:]]" aria-label="trainwithnajib">[[i:logo]]<span>trainwith<b>najib</b></span></a>
  <nav class="tabs" aria-label="{{{{Main||Principale}}}}">{tabs}</nav>
  <div class="tools">
    <div class="seg" role="group" aria-label="{{{{Language||Langue}}}}">{langs}</div>
    <button class="icon-btn" type="button" data-theme-toggle aria-label="{{{{Switch between dark and light theme||Changer de thème clair ou sombre}}}}">[[i:moon]][[i:sun]]</button>
    <a class="btn btn--accent btn--sm" href="[[u:pricing/]]">{{{{Start now||Commencer}}}}</a>
    <details class="menu">
      <summary class="icon-btn" aria-label="Menu">[[i:menu]]</summary>
      <nav aria-label="{{{{Mobile||Mobile}}}}">{tabs}<a class="btn btn--accent" href="[[u:pricing/]]">{{{{Start now||Commencer}}}}</a></nav>
    </details>
  </div>
</header>
<main class="frame">
{body}
</main>
<footer class="foot">
  <span>© 2026 trainwithnajib · {{{{Online fitness coaching from Fes, Morocco||Coaching fitness en ligne depuis Fès, Maroc}}}}</span>
  <nav aria-label="{{{{Footer||Pied de page}}}}">{foot}<a href="https://www.instagram.com/{insta}/" target="_blank" rel="noopener">Instagram</a></nav>
</footer>
</div>
<a class="wa-fab" href="[[WA]]" target="_blank" rel="noopener" aria-label="{{{{Chat on WhatsApp||Discuter sur WhatsApp}}}}">[[i:wa]]</a>
{modal}
<script src="/config.js" defer></script>
<script src="[[a:js/gsap.min.js]]" defer></script>
<script src="[[a:js/ScrollTrigger.min.js]]" defer></script>
<script src="[[a:js/main.js]]" defer></script>
</body>
</html>
"""

def css_min():
    c = (ROOT / "assets/css/site.css").read_text()
    c = re.sub(r"/\*.*?\*/", "", c, flags=re.S).replace("../fonts/", "/assets/fonts/")
    c = re.sub(r"\s+", " ", c)
    c = re.sub(r"\s*([{};:,>])\s*", r"\1", c).replace(";}", "}")
    return c.strip()

def pick(s, lang):
    return re.sub(r"\{\{(.*?)\|\|(.*?)\}\}", lambda m: m.group(1 if lang == "en" else 2), s, flags=re.S)

def build():
    global CSS
    CSS = css_min()
    written = []
    for lang in ("en", "fr"):
        comps = {"PLANS": PLANS, "CTA": CTA, "WA": WA_START, "BOOK": WA_BOOK}
        for path, p in pages.items():
            def links():
                out = ""
                for np, label in NAV:
                    cur = ' aria-current="page"' if np == p["id"] else ""
                    out += f'<a href="[[u:{np}]]"{cur}>{label}</a>'
                return out
            other = "fr" if lang == "en" else "en"
            langs = (f'<span aria-current="true">{lang.upper()}</span>'
                     f'<a href="{url(other, path)}" hreflang="{other}" lang="{other}" title="{"Français" if other == "fr" else "English"}">{other.upper()}</a>')
            if lang == "fr":
                langs = (f'<a href="{url("en", path)}" hreflang="en" lang="en" title="English">EN</a>'
                         f'<span aria-current="true">FR</span>')
            html = SHELL.format(css=CSS,
                lang=lang, title=esc(pick(p["title"], lang)), desc=esc(pick(p["desc"], lang)),
                canonical=SITE + url(lang, path), en=SITE + url("en", path), fr=SITE + url("fr", path),
                og_type=p.get("og_type", "website"), site=SITE, locale="en_US" if lang == "en" else "fr_FR",
                ld=p["ld"](lang), tabs=links(), foot=links().replace(' aria-current="page"', ""), langs=langs,
                insta=INSTAGRAM, body=p["body"].strip("\n"), modal=MODAL if p.get("modal") else "")
            html = render(html, lang, comps)
            if lang == "fr":
                html = re.sub(r" ([:;?!»$%])", "\u00a0\\1", html).replace("« ", "«\u00a0")
            # one h1 per page, and no em dashes in anything a visitor reads
            assert html.count("<h1") == 1, (path, html.count("<h1"))
            assert "—" not in html, path
            t, d = pick(p["title"], lang), pick(p["desc"], lang)
            if not (30 <= len(t) <= 62): print(f"  title length {len(t)}: {lang} /{path}")
            if not (120 <= len(d) <= 165): print(f"  description length {len(d)}: {lang} /{path}")
            out = ROOT / url(lang, path).lstrip("/") / "index.html"
            out.parent.mkdir(parents=True, exist_ok=True)
            out.write_text(html, encoding="utf-8")
            written.append((lang, path))

    # sitemap + robots
    sm = ['<?xml version="1.0" encoding="UTF-8"?>',
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">']
    for path in pages:
        for lang in ("en", "fr"):
            sm.append(f"  <url><loc>{SITE}{url(lang, path)}</loc><lastmod>{PUBLISHED}</lastmod>"
                      f'<xhtml:link rel="alternate" hreflang="en" href="{SITE}{url("en", path)}"/>'
                      f'<xhtml:link rel="alternate" hreflang="fr" href="{SITE}{url("fr", path)}"/>'
                      f'<xhtml:link rel="alternate" hreflang="x-default" href="{SITE}{url("en", path)}"/></url>')
    sm.append("</urlset>")
    (ROOT / "sitemap.xml").write_text("\n".join(sm) + "\n")
    # 404 page (English, not indexed)
    nf = dict(id="404", title="Page not found | trainwithnajib", desc="This page does not exist.", ld=lambda l: "", body="""
<section class="card card--dark phero__text" style="min-height:420px">
  <p class="eyebrow">404</p>
  <div>
    <h1 class="h-page">This page skipped leg day.</h1>
    <p class="lead muted mt-16">The page you are looking for does not exist or has moved.</p>
  </div>
  <div class="row gap-12 wrap"><a class="btn btn--accent" href="/">Back to home</a><a class="btn btn--ghost" href="/fr/">Accueil en français</a></div>
</section>""")
    html = SHELL.format(css=CSS, lang="en", title=nf["title"], desc=nf["desc"], canonical=SITE + "/", en=SITE + "/", fr=SITE + "/fr/",
                        og_type="website", site=SITE, locale="en_US", ld='<meta name="robots" content="noindex">',
                        tabs="".join(f'<a href="[[u:{np}]]">{label}</a>' for np, label in NAV),
                        foot="".join(f'<a href="[[u:{np}]]">{label}</a>' for np, label in NAV),
                        langs='<span aria-current="true">EN</span><a href="/fr/" hreflang="fr" lang="fr" title="Français">FR</a>',
                        insta=INSTAGRAM, body=nf["body"], modal="")
    (ROOT / "404.html").write_text(render(html, "en", {"WA": WA_START, "BOOK": WA_BOOK}), encoding="utf-8")
    (ROOT / "robots.txt").write_text(f"User-agent: *\nAllow: /\n\nSitemap: {SITE}/sitemap.xml\n")
    print(f"wrote {len(written)} pages, sitemap.xml, robots.txt")

if __name__ == "__main__":
    build()
