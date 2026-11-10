/* trainwithnajib: page behaviour.
   The pages work without this file; it adds the theme switch, the plan dialog,
   the goal picker, the contact form, GSAP motion and the lazy-loaded 3D scene. */
(function () {
  "use strict";

  var C = window.TWN || {};
  var root = document.documentElement;
  var fr = root.lang === "fr";
  var gsap = window.gsap;
  var ScrollTrigger = window.ScrollTrigger;
  var motionOK = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  function $(s, el) { return (el || document).querySelector(s); }
  function $$(s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); }
  function waUrl(text) {
    return "https://wa.me/" + (C.whatsapp || "") + (text ? "?text=" + encodeURIComponent(text) : "");
  }

  /* ---------- theme ---------- */
  var themeBtn = $("[data-theme-toggle]");
  if (themeBtn) themeBtn.addEventListener("click", function () {
    var next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("twn-theme", next); } catch (e) { /* private mode */ }
  });

  /* ---------- mobile menu: close on outside click ---------- */
  var menu = $(".menu");
  if (menu) document.addEventListener("click", function (e) {
    if (menu.open && !menu.contains(e.target)) menu.open = false;
  });

  /* ---------- settings from config.js ---------- */
  if (C.calendly) $$("[data-book]").forEach(function (a) { a.href = C.calendly; });
  if (C.photo) $$("[data-photo]").forEach(function (el) {
    var img = new Image();
    img.src = C.photo; img.alt = "Najib"; img.decoding = "async";
    el.insertBefore(img, el.firstChild);
  });

  /* ---------- plans ---------- */
  var PLANS = {
    m1: fr ? "1 mois · 80 $" : "1 month · $80",
    m3: fr ? "3 mois · 219 $" : "3 months · $219",
    m6: fr ? "6 mois · 399 $" : "6 months · $399"
  };
  var modal = $("#planModal"), activePlan = null;
  function openPlan(id) {
    if (!PLANS[id] || !modal) return;
    activePlan = id;
    $("#planTitle").textContent = PLANS[id];
    var direct = C.payLinks && C.payLinks[id];
    $("[data-pay-note]").textContent = direct
      ? (fr ? "Paiement sécurisé, s'ouvre dans un nouvel onglet." : "Secure checkout, opens in a new tab.")
      : (fr ? "Najib vous envoie un lien de paiement sécurisé sur WhatsApp." : "Najib sends you a secure payment link on WhatsApp.");
    if (modal.showModal) modal.showModal(); else modal.setAttribute("open", "");
  }
  function pay(how) {
    var p = PLANS[activePlan]; if (!p) return;
    var direct = C.payLinks && C.payLinks[activePlan], url;
    if (how === "online" && direct) url = direct;
    else if (how === "online") url = waUrl(fr
      ? "Salut Najib, je veux commencer la formule " + p + " et payer en ligne (carte / PayPal). Peux-tu m'envoyer le lien de paiement ?"
      : "Hi Najib, I want to start the " + p + " plan and pay online (card / PayPal). Can you send me the payment link?");
    else url = waUrl(fr
      ? "Salut Najib, je veux commencer la formule " + p + " et payer en espèces / par virement."
      : "Hi Najib, I want to start the " + p + " plan and pay by cash / bank transfer.");
    window.open(url, "_blank", "noopener");
    modal.close();
  }
  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-plan]");
    if (b) { e.preventDefault(); openPlan(b.getAttribute("data-plan")); return; }
    b = e.target.closest("[data-close]");
    if (b) { b.closest("dialog").close(); return; }
    b = e.target.closest("[data-pay]");
    if (b) pay(b.getAttribute("data-pay"));
  });
  if (modal) modal.addEventListener("click", function (e) { if (e.target === modal) modal.close(); });

  /* ---------- 3D scene, loaded after the page is interactive ---------- */
  var scene = null;
  var canvas = $("canvas[data-scene]");
  function startScene() {
    import(canvas.getAttribute("data-src")).then(function (m) {
      scene = m.mount(canvas, canvas.getAttribute("data-scene"));
      canvas.parentElement.classList.add("is-live");
      if (gsap) {
        scene.intro = 0.55;
        gsap.to(scene, { intro: 1, duration: 1.6, ease: "expo.out" });
        gsap.fromTo(scene.state, { spin: -0.6 }, { spin: 0, duration: 2.2, ease: "expo.out" });
        if (ScrollTrigger) ScrollTrigger.create({
          trigger: canvas.parentElement, start: "top top", end: "bottom top", scrub: 0.6,
          onUpdate: function (self) { scene.setScroll(self.progress); }
        });
      }
      setLoad(currentLoad, true);
    }).catch(function () { /* keep the still frame */ });
  }
  // Start on the first sign of a visitor (pointer, touch, scroll, key). Until
  // then a still frame of the same object is shown, so the 3D code never
  // competes with the first paint.
  var saveData = navigator.connection && navigator.connection.saveData;
  if (canvas && motionOK && !saveData) {      // no WebGL: mount() throws and the still frame stays
    var started = false;
    var events = ["pointermove", "pointerdown", "touchstart", "scroll", "keydown"];
    var go = function () {
      if (started) return;
      started = true;
      events.forEach(function (ev) { window.removeEventListener(ev, go); });
      startScene();
    };
    events.forEach(function (ev) { window.addEventListener(ev, go, { passive: true }); });
  }

  /* ---------- home: goal picker (also loads plates on the 3D dumbbell) ---------- */
  var GOALS = {
    fat: { load: 0,
      en: "<b>Fat loss.</b> A calorie target you can live with, 3 to 4 strength sessions a week and daily steps. No crash diets.",
      fr: "<b>Perte de gras.</b> Un objectif calorique tenable, 3 à 4 séances de renforcement par semaine et des pas quotidiens. Pas de régime extrême." },
    muscle: { load: 2,
      en: "<b>Muscle gain.</b> Progressive overload on the big lifts, enough protein, and a small surplus tracked week by week.",
      fr: "<b>Prise de muscle.</b> Surcharge progressive sur les mouvements de base, assez de protéines et un léger surplus suivi chaque semaine." },
    busy: { load: 1,
      en: "<b>Busy schedule.</b> Three focused 45-minute sessions that fit around meetings and travel, at the gym, at home or in a hotel.",
      fr: "<b>Agenda chargé.</b> Trois séances ciblées de 45 minutes, calées autour des réunions et des déplacements : salle, maison ou hôtel." },
    start: { load: 0,
      en: "<b>Starting from zero.</b> We learn the basic movements first, then add load at your pace.",
      fr: "<b>Partir de zéro.</b> On apprend d'abord les mouvements de base, puis on ajoute de la charge à votre rythme." },
    home: { load: 0,
      en: "<b>Home training.</b> A full plan with dumbbells, bands or just bodyweight. No gym required.",
      fr: "<b>Entraînement à la maison.</b> Un programme complet avec haltères, élastiques ou au poids du corps. Sans salle." },
    strong: { load: 2,
      en: "<b>Strength.</b> Clear numbers to beat on squat, press and pull, and a plan that adds load step by step.",
      fr: "<b>Force.</b> Des chiffres clairs à battre au squat, au développé et au tirage, et un programme qui ajoute de la charge pas à pas." }
  };
  var currentLoad = 1;
  function setLoad(n, instant) {
    currentLoad = n;
    if (!scene || !scene.plates.length) return;
    scene.plates.forEach(function (p, i) {
      var on = (i % 2) < n;                       // two plates per side: index 0 = inner, 1 = outer
      var to = { x: on ? p.userData.on : p.userData.off, s: on ? 1 : 0.001 };
      if (gsap && !instant) {
        gsap.to(p.position, { x: to.x, duration: 0.7, ease: on ? "back.out(1.6)" : "power2.in", delay: on ? (i % 2) * 0.08 : 0 });
        gsap.to(p.scale, { x: to.s, y: to.s, z: to.s, duration: on ? 0.5 : 0.4, ease: "power2.out", delay: on ? (i % 2) * 0.08 : 0 });
      } else { p.position.x = to.x; p.scale.setScalar(to.s); }
    });
    if (gsap && !instant) gsap.fromTo(scene.state, { spin: 0 }, { spin: 1, duration: 1.4, ease: "power3.inOut" });
  }
  var goalOut = $("#goalOut");
  if (goalOut) $$("[data-goal]").forEach(function (chip) {
    chip.addEventListener("click", function () {
      $$("[data-goal]").forEach(function (c) { c.setAttribute("aria-pressed", String(c === chip)); });
      var g = GOALS[chip.getAttribute("data-goal")];
      goalOut.innerHTML = fr ? g.fr : g.en;
      setLoad(g.load);
    });
  });

  /* ---------- home: real transformations (from config) ---------- */
  var tr = $("#transformations");
  if (tr && C.transformations && C.transformations.length) {
    $("#transformationsGrid").innerHTML = C.transformations.map(function (x) {
      var cap = (fr ? x.fr : x.en) || x.en || "";
      return '<figure class="card card--light" style="padding:14px"><div class="grid grid-2" style="gap:8px">' +
        '<img src="' + x.before + '" alt="" loading="lazy" style="border-radius:22px;aspect-ratio:3/4;object-fit:cover;width:100%">' +
        '<img src="' + x.after + '" alt="" loading="lazy" style="border-radius:22px;aspect-ratio:3/4;object-fit:cover;width:100%"></div>' +
        '<figcaption style="padding:14px 8px 4px;font-weight:600">' + cap + "</figcaption></figure>";
    }).join("");
    tr.hidden = false;
  }

  /* ---------- contact form ---------- */
  var form = $("#contactForm");
  if (form) {
    var compose = function () {
      var d = new FormData(form);
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
        window.location.href = "mailto:" + C.email + "?subject=" + encodeURIComponent("Coaching: " + form.elements.name.value) +
          "&body=" + encodeURIComponent(compose());
      } else {
        window.open(waUrl(compose()), "_blank", "noopener");
      }
    });
    var q = new URLSearchParams(location.search).get("plan");
    if (q && form.elements.plan) form.elements.plan.value = q;
  }

  /* ---------- motion (GSAP) ---------- */
  if (!gsap || !motionOK) return;
  if (ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  // Reveal on scroll. Anything already on screen at load is left alone, so the
  // first paint never changes and nothing above the fold waits on JavaScript.
  if (ScrollTrigger) {
    var below = $$(".reveal").filter(function (el) { return el.getBoundingClientRect().top > window.innerHeight * 0.92; });
    gsap.set(below, { opacity: 0, y: 28 });
    ScrollTrigger.batch(below, {
      start: "top 92%", once: true,
      onEnter: function (els) { gsap.to(els, { opacity: 1, y: 0, duration: 0.9, ease: "power3.out", stagger: 0.09, overwrite: true }); }
    });

    // safety net: after a fast jump down the page, show anything that was skipped
    var idle;
    window.addEventListener("scroll", function () {
      clearTimeout(idle);
      idle = setTimeout(function () {
        below.forEach(function (el) {
          if (el.getBoundingClientRect().top < window.innerHeight && gsap.getProperty(el, "opacity") < 0.05 && !gsap.isTweening(el)) {
            gsap.to(el, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out", overwrite: true });
          }
        });
      }, 180);
    }, { passive: true });

    // photos drift inside their cards as the page scrolls
    $$("[data-parallax]").forEach(function (img) {
      gsap.fromTo(img, { yPercent: -7, scale: 1.16 }, {
        yPercent: 7, scale: 1.16, ease: "none",
        scrollTrigger: { trigger: img.parentElement, start: "top bottom", end: "bottom top", scrub: true }
      });
    });

    // count up the headline number
    $$("[data-count]").forEach(function (el) {
      var end = +el.getAttribute("data-count"), suffix = el.getAttribute("data-suffix") || "", o = { v: 0 };
      ScrollTrigger.create({
        trigger: el, start: "top 95%", once: true,
        onEnter: function () {
          gsap.to(o, { v: end, duration: 1.6, ease: "power2.out", onUpdate: function () { el.textContent = Math.round(o.v) + suffix; } });
        }
      });
    });
  }

  // cards tilt toward the pointer
  if (finePointer) $$(".tilt").forEach(function (card) {
    gsap.set(card, { transformPerspective: 900 });
    var rx = gsap.quickTo(card, "rotationX", { duration: 0.5, ease: "power3.out" });
    var ry = gsap.quickTo(card, "rotationY", { duration: 0.5, ease: "power3.out" });
    card.addEventListener("pointermove", function (e) {
      var r = card.getBoundingClientRect();
      ry(((e.clientX - r.left) / r.width - 0.5) * 9);
      rx(-((e.clientY - r.top) / r.height - 0.5) * 9);
    });
    card.addEventListener("pointerleave", function () { rx(0); ry(0); });
  });
})();
