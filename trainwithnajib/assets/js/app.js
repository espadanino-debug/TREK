/* trainwithnajib — shared shell (sidebar, top bar, footer), language + theme
   switching, WhatsApp / booking / payment links, small page behaviours. */
(function () {
  "use strict";

  var C = window.TWN || {};
  var root = document.documentElement;
  var page = document.body.getAttribute("data-page") || "";

  /* ---------- icons ---------- */
  var S = 'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"';
  var I = {
    logo: '<svg viewBox="0 0 32 32" aria-hidden="true"><path fill="currentColor" d="M5 26V6h4.6l9 12.2V6H23v20h-4.5L9.4 13.7V26z"/><circle cx="27" cy="23.6" r="2.6" fill="#ff5a1f"/></svg>',
    home: '<svg ' + S + '><path d="M4 11.5 12 5l8 6.5V19a1 1 0 0 1-1 1h-4.5v-5h-5v5H5a1 1 0 0 1-1-1z"/></svg>',
    services: '<svg ' + S + '><path d="M6.5 8v8M3.5 10v4M17.5 8v8M20.5 10v4M6.5 12h11"/></svg>',
    pricing: '<svg ' + S + '><path d="M12.6 3.5H20a.5.5 0 0 1 .5.5v7.4a1 1 0 0 1-.3.7l-8 8a1 1 0 0 1-1.4 0l-7-7a1 1 0 0 1 0-1.4l8-8a1 1 0 0 1 .8-.2z"/><circle cx="16" cy="8" r="1.4"/></svg>',
    about: '<svg ' + S + '><circle cx="12" cy="8.5" r="3.7"/><path d="M4.5 20c.8-3.6 3.8-5.5 7.5-5.5s6.7 1.9 7.5 5.5"/></svg>',
    blog: '<svg ' + S + '><path d="M5 4.5h10.5a3 3 0 0 1 3 3V19.5H8a3 3 0 0 1-3-3z"/><path d="M9 9h5.5M9 12.5h5.5"/></svg>',
    contact: '<svg ' + S + '><path d="M4 6.5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-6.5L7 20v-3.5H6a2 2 0 0 1-2-2z"/></svg>',
    sun: '<svg ' + S + '><circle cx="12" cy="12" r="3.8"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6 7 7M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4"/></svg>',
    moon: '<svg ' + S + '><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/></svg>',
    arrow: '<svg ' + S + '><path d="M7 17 17 7M8.5 7H17v8.5"/></svg>',
    check: '<svg ' + S + '><circle cx="12" cy="12" r="9"/><path d="m8 12.3 2.7 2.7L16 9.5"/></svg>',
    card: '<svg ' + S + '><rect x="3" y="5.5" width="18" height="13" rx="2.5"/><path d="M3 10h18M7 15h3"/></svg>',
    cash: '<svg ' + S + '><rect x="3" y="6.5" width="18" height="11" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6.5 9.5v5M17.5 9.5v5"/></svg>',
    mail: '<svg ' + S + '><rect x="3" y="5.5" width="18" height="13" rx="2.5"/><path d="m4 7.5 8 6 8-6"/></svg>',
    calendar: '<svg ' + S + '><rect x="3.5" y="5" width="17" height="15" rx="2.5"/><path d="M8 3v4M16 3v4M3.5 10h17"/></svg>',
    insta: '<svg ' + S + '><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="3.8"/><circle cx="17" cy="7" r=".6" fill="currentColor"/></svg>',
    wa: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.2a9.7 9.7 0 0 0-8.3 14.8L2.3 21.8l4.9-1.3A9.7 9.7 0 1 0 12 2.2zm0 1.8a7.9 7.9 0 1 1-4 14.7l-.3-.2-2.8.7.8-2.7-.2-.3A7.9 7.9 0 0 1 12 4zm-3.2 3.9c-.2 0-.5 0-.7.3-.3.3-1 .9-1 2.3s1 2.7 1.1 2.9c.2.2 2 3.2 5 4.4 2.5 1 3 .8 3.5.7.6 0 1.8-.7 2-1.4.3-.7.3-1.3.2-1.4l-.5-.3-1.8-.9c-.3-.1-.4-.1-.6.1l-.8 1c-.2.2-.3.2-.6.1a6.6 6.6 0 0 1-3.2-2.8c-.2-.4.2-.4.6-1.2.1-.2 0-.3 0-.5l-.8-1.9c-.2-.5-.4-.4-.6-.4z"/></svg>'
  };

  function t(en, fr) { return '<span data-l="en">' + en + '</span><span data-l="fr">' + fr + "</span>"; }
  function $(s, el) { return (el || document).querySelector(s); }
  function $$(s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); }
  function lang() { return root.lang === "fr" ? "fr" : "en"; }
  function store(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* private mode */ } }

  var NAV = [
    { id: "home", href: "index.html", icon: "home", en: "Home", fr: "Accueil" },
    { id: "services", href: "services.html", icon: "services", en: "Services", fr: "Services" },
    { id: "pricing", href: "pricing.html", icon: "pricing", en: "Pricing", fr: "Tarifs" },
    { id: "about", href: "about.html", icon: "about", en: "About", fr: "À propos" },
    { id: "blog", href: "blog.html", icon: "blog", en: "Blog", fr: "Blog" },
    { id: "contact", href: "contact.html", icon: "contact", en: "Contact", fr: "Contact" }
  ];
  function cur(id) { return id === page ? ' aria-current="page"' : ""; }

  /* ---------- shell ---------- */
  var side = $("#side");
  if (side) {
    side.className = "side";
    side.innerHTML =
      '<a class="side__logo" href="index.html" aria-label="trainwithnajib">' + I.logo + "</a>" +
      '<nav class="side__nav" aria-label="Main">' +
      NAV.map(function (n) {
        return '<a class="side__link" href="' + n.href + '"' + cur(n.id) + ">" + I[n.icon] +
          '<span class="tip">' + t(n.en, n.fr) + '</span><span class="sr-only">' + t(n.en, n.fr) + "</span></a>";
      }).join("") +
      "</nav>" +
      '<a class="side__me" href="about.html" aria-label="Najib">' +
      (C.photo ? '<img src="' + C.photo + '" alt="Najib">' : "N") + "</a>";
  }

  var top = $("#top");
  if (top) {
    top.className = "top";
    top.innerHTML =
      '<a class="top__brand" href="index.html">trainwith<b>najib</b></a>' +
      '<nav class="top__tabs" aria-label="Pages">' +
      NAV.map(function (n) { return '<a href="' + n.href + '"' + cur(n.id) + ">" + t(n.en, n.fr) + "</a>"; }).join("") +
      "</nav>" +
      '<div class="top__tools">' +
      '<div class="seg" role="group" aria-label="Language"><button type="button" data-set-lang="en">EN</button><button type="button" data-set-lang="fr">FR</button></div>' +
      '<div class="seg" role="group" aria-label="Theme"><button type="button" data-set-theme="dark" aria-label="Dark">' + I.moon + '</button><button type="button" data-set-theme="light" aria-label="Light">' + I.sun + "</button></div>" +
      '<a class="btn btn--accent btn--sm top__cta" href="pricing.html">' + t("Start now", "Commencer") + "</a>" +
      "</div>";
  }

  var foot = $("#foot");
  if (foot) {
    foot.className = "foot";
    foot.innerHTML =
      "<span>© " + new Date().getFullYear() + " trainwithnajib · " + t("Online coaching from Fes, Morocco", "Coaching en ligne depuis Fès, Maroc") + "</span>" +
      "<nav>" +
      NAV.map(function (n) { return '<a href="' + n.href + '">' + t(n.en, n.fr) + "</a>"; }).join("") +
      '<a data-insta target="_blank" rel="noopener">Instagram</a>' +
      "</nav>";
  }

  // floating WhatsApp button + plan dialog
  document.body.insertAdjacentHTML("beforeend",
    '<a class="wa-fab" target="_blank" rel="noopener" aria-label="WhatsApp" ' +
    'data-wa-en="Hi Najib, I found your website and I\'d like to know more about your coaching." ' +
    'data-wa-fr="Salut Najib, j\'ai vu ton site et j\'aimerais en savoir plus sur ton coaching.">' + I.wa + "</a>" +
    '<dialog class="modal" id="planModal" aria-labelledby="planTitle">' +
    '<button class="modal__close" type="button" data-close aria-label="Close">×</button>' +
    '<div class="modal__body">' +
    '<span class="eyebrow">' + t("Selected plan", "Formule choisie") + "</span>" +
    '<h2 class="h-md" id="planTitle"></h2>' +
    '<p class="muted">' + t("How would you like to pay?", "Comment souhaitez-vous payer ?") + "</p>" +
    '<button class="option" type="button" data-pay="online">' + I.card + "<span><b>" + t("Card or PayPal", "Carte ou PayPal") + '</b><small data-pay-note></small></span></button>' +
    '<button class="option" type="button" data-pay="cash">' + I.cash + "<span><b>" + t("Cash or bank transfer", "Espèces ou virement") + "</b><small>" +
    t("We arrange it together on WhatsApp.", "On s'organise ensemble sur WhatsApp.") + "</small></span></button>" +
    "</div></dialog>");

  /* ---------- language + theme ---------- */
  function syncLang() {
    var l = lang();
    $$("[data-set-lang]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-set-lang") === l)); });
    var title = root.getAttribute("data-title-" + l);
    if (title) document.title = title;
    $$("[data-ph-en]").forEach(function (el) { el.placeholder = el.getAttribute("data-ph-" + l) || ""; });
    $$("a[data-wa-en]").forEach(function (a) { a.href = waUrl(a.getAttribute("data-wa-" + l)); });
    $$("option[data-en]").forEach(function (o) { o.textContent = o.getAttribute("data-" + l); });
    $$("[data-book]").forEach(function (a) {
      a.href = C.calendly || waUrl(l === "fr"
        ? "Salut Najib, j'aimerais réserver un appel pour parler de mes objectifs."
        : "Hi Najib, I'd like to book a call to talk about my goals.");
    });
  }
  function syncTheme() {
    var th = root.getAttribute("data-theme") || "dark";
    $$("[data-set-theme]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-set-theme") === th)); });
  }
  function waUrl(text) {
    return "https://wa.me/" + (C.whatsapp || "") + (text ? "?text=" + encodeURIComponent(text) : "");
  }

  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-set-lang]");
    if (b) { root.lang = b.getAttribute("data-set-lang"); store("twn-lang", root.lang); syncLang(); return; }
    b = e.target.closest("[data-set-theme]");
    if (b) { root.setAttribute("data-theme", b.getAttribute("data-set-theme")); store("twn-theme", b.getAttribute("data-set-theme")); syncTheme(); return; }
    b = e.target.closest("[data-plan]");
    if (b) { e.preventDefault(); openPlan(b.getAttribute("data-plan")); return; }
    b = e.target.closest("[data-close]");
    if (b) { b.closest("dialog").close(); return; }
    b = e.target.closest("[data-pay]");
    if (b) { pay(b.getAttribute("data-pay")); }
  });

  /* ---------- static links ---------- */
  $$("[data-insta]").forEach(function (a) { a.href = "https://instagram.com/" + (C.instagram || ""); });
  $$("[data-email]").forEach(function (a) { a.href = "mailto:" + (C.email || ""); });
  $$("[data-fill]").forEach(function (el) {
    var k = el.getAttribute("data-fill");
    el.textContent = k === "whatsapp" ? "+" + String(C.whatsapp).replace(/^(\d{3})(\d{3})(\d{3})(\d{3})$/, "$1 $2 $3 $4")
      : k === "instagram" ? "@" + C.instagram : C[k] || "";
  });
  $$("[data-icon]").forEach(function (el) { el.innerHTML = I[el.getAttribute("data-icon")] || ""; });
  $$("[data-book]").forEach(function (a) { a.target = "_blank"; a.rel = "noopener"; });

  if (C.photo) $$("[data-photo]").forEach(function (el) {
    el.insertAdjacentHTML("afterbegin", '<img src="' + C.photo + '" alt="Najib">');
    var m = $(".portrait__mono", el); if (m) m.style.visibility = "hidden";
  });

  /* ---------- plans ---------- */
  var PLANS = {
    m1: { en: "1 month — $80", fr: "1 mois — 80 $" },
    m3: { en: "3 months — $219", fr: "3 mois — 219 $" },
    m6: { en: "6 months — $399", fr: "6 mois — 399 $" }
  };
  var modal = $("#planModal"), activePlan = null;
  function openPlan(id) {
    if (!PLANS[id]) return;
    activePlan = id;
    $("#planTitle").innerHTML = t(PLANS[id].en, PLANS[id].fr);
    var direct = C.payLinks && C.payLinks[id];
    $("[data-pay-note]").innerHTML = direct
      ? t("Secure checkout, opens in a new tab.", "Paiement sécurisé, s'ouvre dans un nouvel onglet.")
      : t("Najib sends you a secure payment link on WhatsApp.", "Najib vous envoie un lien de paiement sécurisé sur WhatsApp.");
    if (modal.showModal) modal.showModal(); else modal.setAttribute("open", "");
  }
  function pay(how) {
    var p = PLANS[activePlan]; if (!p) return;
    var direct = C.payLinks && C.payLinks[activePlan];
    var fr = lang() === "fr", url;
    if (how === "online" && direct) url = direct;
    else if (how === "online") url = waUrl(fr
      ? "Salut Najib, je veux commencer la formule " + p.fr + " et payer en ligne (carte / PayPal). Peux-tu m'envoyer le lien de paiement ?"
      : "Hi Najib, I want to start the " + p.en + " plan and pay online (card / PayPal). Can you send me the payment link?");
    else url = waUrl(fr
      ? "Salut Najib, je veux commencer la formule " + p.fr + " et payer en espèces / par virement."
      : "Hi Najib, I want to start the " + p.en + " plan and pay by cash / bank transfer.");
    window.open(url, "_blank", "noopener");
    modal.close();
  }
  if (modal) modal.addEventListener("click", function (e) { if (e.target === modal) modal.close(); });

  /* ---------- home: goal chips ---------- */
  var GOALS = {
    fat: {
      en: "<b>Fat loss.</b> A calorie target you can live with, 3–4 strength sessions a week and daily steps. No crash diets.",
      fr: "<b>Perte de gras.</b> Un objectif calorique tenable, 3 à 4 séances de renforcement par semaine et des pas quotidiens. Pas de régime extrême."
    },
    muscle: {
      en: "<b>Muscle gain.</b> Progressive overload on the big lifts, enough protein, and a small surplus tracked week by week.",
      fr: "<b>Prise de muscle.</b> Surcharge progressive sur les mouvements de base, assez de protéines et un léger surplus suivi chaque semaine."
    },
    busy: {
      en: "<b>Busy schedule.</b> Three focused 45-minute sessions that fit around meetings and travel, at the gym, at home or in a hotel.",
      fr: "<b>Agenda chargé.</b> Trois séances ciblées de 45 minutes, calées autour des réunions et des déplacements : salle, maison ou hôtel."
    },
    start: {
      en: "<b>Starting from zero.</b> We learn the basic movements first, then add load at your pace.",
      fr: "<b>Partir de zéro.</b> On apprend d'abord les mouvements de base, puis on ajoute de la charge à votre rythme."
    },
    home: {
      en: "<b>Home training.</b> A full plan with dumbbells, bands or just bodyweight. No gym required.",
      fr: "<b>Entraînement à la maison.</b> Un programme complet avec haltères, élastiques ou au poids du corps. Sans salle."
    },
    strong: {
      en: "<b>Strength.</b> Clear numbers to beat on squat, press and pull, and a plan that adds load step by step.",
      fr: "<b>Force.</b> Des chiffres clairs à battre au squat, au développé et au tirage, et un programme qui ajoute de la charge pas à pas."
    }
  };
  var goalOut = $("#goalOut");
  if (goalOut) {
    $$("[data-goal]").forEach(function (chip) {
      chip.addEventListener("click", function () {
        $$("[data-goal]").forEach(function (c) { c.setAttribute("aria-pressed", String(c === chip)); });
        var g = GOALS[chip.getAttribute("data-goal")];
        goalOut.innerHTML = t(g.en, g.fr);
      });
    });
  }

  /* ---------- home: real transformations (from config) ---------- */
  var tr = $("#transformations");
  if (tr && C.transformations && C.transformations.length) {
    $("#transformationsGrid").innerHTML = C.transformations.map(function (x) {
      return '<figure class="card card--light" style="margin:0;padding:14px"><div class="grid grid-2" style="gap:8px">' +
        '<img src="' + x.before + '" alt="" style="border-radius:22px;aspect-ratio:3/4;object-fit:cover;width:100%">' +
        '<img src="' + x.after + '" alt="" style="border-radius:22px;aspect-ratio:3/4;object-fit:cover;width:100%"></div>' +
        '<figcaption style="padding:14px 8px 4px;font-weight:600">' + t(x.en || "", x.fr || x.en || "") + "</figcaption></figure>";
    }).join("");
    tr.hidden = false;
  }

  /* ---------- contact form ---------- */
  var form = $("#contactForm");
  if (form) {
    var compose = function () {
      var d = new FormData(form), fr = lang() === "fr";
      var sel = function (name) { var s = form.elements[name]; return s.options[s.selectedIndex].textContent; };
      return (fr ? "Salut Najib,\n\n" : "Hi Najib,\n\n") +
        (fr ? "Nom : " : "Name: ") + d.get("name") + "\n" +
        (fr ? "Objectif : " : "Goal: ") + sel("goal") + "\n" +
        (fr ? "Formule : " : "Plan: ") + sel("plan") + "\n\n" +
        (d.get("message") || "");
    };
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var how = (e.submitter && e.submitter.value) || "wa";
      if (how === "mail") {
        window.location.href = "mailto:" + C.email + "?subject=" + encodeURIComponent("Coaching — " + form.elements.name.value) +
          "&body=" + encodeURIComponent(compose());
      } else {
        window.open(waUrl(compose()), "_blank", "noopener");
      }
    });
    // pre-select a plan when arriving from pricing (?plan=m3)
    var q = new URLSearchParams(location.search).get("plan");
    if (q && form.elements.plan) form.elements.plan.value = q;
  }

  /* ---------- reveal on scroll ---------- */
  var rev = $$(".reveal");
  if ("IntersectionObserver" in window && rev.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    rev.forEach(function (el) { io.observe(el); });
  } else {
    rev.forEach(function (el) { el.classList.add("in"); });
  }

  syncLang();
  syncTheme();
})();
