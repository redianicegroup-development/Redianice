(function () {
  "use strict";
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var canHover = window.matchMedia("(hover: hover)").matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  var yr = $("#y"); if (yr) yr.textContent = new Date().getFullYear();

  // Menu mobile : le bouton se déploie en panneau
  var mb = $("#menuBtn"), mp = $("#menuPanel");
  if (mb && mp) {
    var rows = $$(".mitem", mp), foot = $$(".mfoot > *", mp), tm, isOpen = false;
    var toggle = function (want) {
      if (want === isOpen) return;
      isOpen = want; clearTimeout(tm);
      mb.setAttribute("aria-expanded", String(isOpen));
      if (isOpen) {
        mp.removeAttribute("inert"); mp.classList.add("is-open");
        rows.forEach(function (el, i) { el.style.transitionDelay = i * 0.04 + "s"; });
        foot.forEach(function (el, i) { el.style.transitionDelay = 0.3 + i * 0.08 + "s"; });
        tm = setTimeout(function () { mp.classList.add("is-visible"); }, 250);
      } else {
        rows.concat(foot).forEach(function (el) { el.style.transitionDelay = "0s"; });
        mp.classList.remove("is-visible");
        tm = setTimeout(function () { mp.classList.remove("is-open"); mp.setAttribute("inert", ""); }, 300);
      }
    };
    mb.addEventListener("click", function () { toggle(!isOpen); });
    $$(".mlink, .mfb, .msocial a", mp).forEach(function (a) { a.addEventListener("click", function () { toggle(false); }); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && isOpen) { toggle(false); mb.focus(); } });
    window.matchMedia("(min-width:900px)").addEventListener("change", function (e) { if (e.matches) toggle(false); });
  }

  // Langue : traduction du navigateur (Google Translate), chargée seulement si le visiteur la choisit.
  // Le français reste la langue du site : les moteurs de recherche lisent toujours le texte d'origine.
  var LANG_SHORT = { fr: "FR", en: "EN", es: "ES", ar: "AR", "zh-CN": "ZH", pt: "PT", de: "DE", it: "IT", ru: "RU", ja: "JA" };
  var cookieLang = function () {
    var m = document.cookie.match(/(?:^|;\s*)googtrans=\/[^\/;]+\/([^;]+)/);
    var l = m ? decodeURIComponent(m[1]) : "fr";
    return LANG_SHORT[l] ? l : "fr";
  };
  var writeLang = function (l) {
    var host = location.hostname, past = "expires=Thu, 01 Jan 1970 00:00:00 GMT";
    if (l === "fr") {
      ["", ";domain=" + host, ";domain=." + host].forEach(function (d) { document.cookie = "googtrans=;" + past + ";path=/" + d; });
    } else {
      document.cookie = "googtrans=/fr/" + l + ";path=/";
      document.cookie = "googtrans=/fr/" + l + ";path=/;domain=" + host;
    }
  };
  var markLang = function (l) {
    $$("[data-lang]").forEach(function (b) { b.setAttribute("aria-current", String(b.getAttribute("data-lang") === l)); });
    $$(".lang__cur").forEach(function (s) { s.textContent = LANG_SHORT[l]; });
  };
  var loadTranslate = function () {
    if (window.__gtLoaded) return; window.__gtLoaded = true;
    var box = document.createElement("div"); box.id = "gt-el"; box.className = "gt-el"; box.setAttribute("aria-hidden", "true"); document.body.appendChild(box);
    window.gtInit = function () {
      new window.google.translate.TranslateElement({ pageLanguage: "fr", includedLanguages: Object.keys(LANG_SHORT).join(","), autoDisplay: false }, "gt-el");
    };
    var s = document.createElement("script"); s.async = true; s.src = "https://translate.google.com/translate_a/element.js?cb=gtInit";
    s.onerror = function () { writeLang("fr"); markLang("fr"); };
    document.head.appendChild(s);
  };
  var curLang = cookieLang();
  markLang(curLang);
  if (curLang !== "fr") loadTranslate();

  var lb = $("#langBtn"), ll = $("#langList");
  var langOpen = function (want) { if (!ll) return; ll.hidden = !want; lb.setAttribute("aria-expanded", String(want)); };
  if (lb && ll) {
    lb.addEventListener("click", function (e) { e.stopPropagation(); langOpen(ll.hidden); });
    document.addEventListener("click", function (e) { if (!ll.hidden && !ll.contains(e.target)) langOpen(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !ll.hidden) { langOpen(false); lb.focus(); } });
  }
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest("[data-lang]"); if (!b) return;
    var l = b.getAttribute("data-lang"); langOpen(false);
    if (l === curLang) return;
    writeLang(l); location.reload();
  });
  // La traduction change la hauteur des textes : on recalcule les positions du scroll
  // (on ne réagit qu'au changement de langue, pas aux classes que Lenis ajoute pendant le scroll)
  var refreshSoon = function () {};
  var langState = function () { return (document.documentElement.className.match(/translated-\w+/) || [""])[0] + "|" + document.documentElement.lang; };
  var lastLangState = langState();
  new MutationObserver(function () {
    var s = langState(); if (s === lastLangState) return;
    lastLangState = s; refreshSoon();
  }).observe(document.documentElement, { attributes: true, attributeFilter: ["class", "lang"] });

  // Menu desktop : la section visible est surlignée
  var spy = $$(".nav__links a[href^='#'], .nav-contact[href^='#']");
  if (spy.length && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) spy.forEach(function (a) { a.classList.toggle("is-active", a.getAttribute("href") === "#" + en.target.id); }); });
    }, { rootMargin: "-45% 0px -50% 0px" });
    spy.forEach(function (a) { var s = $(a.getAttribute("href")); if (s) io.observe(s); });
  }

  // Hero : le logo de la pastille change toutes les 4 s
  var pi = 0;
  if (!reduced) setInterval(function () {
    var s = $$(".h1-pill__s"); if (s.length < 2) return;
    var nx = (pi + 1) % s.length;
    s.forEach(function (el, i) { if (i !== pi && i !== nx) el.classList.remove("is-out", "is-on"); });
    s[pi].classList.remove("is-on"); s[pi].classList.add("is-out");
    s[nx].classList.remove("is-out"); s[nx].classList.add("is-on");
    pi = nx;
  }, 4000);

  // Nos produits : sans animation, la piste défile nativement (tactile, trackpad, flèches).
  // Avec animation (plus bas), la piste est épinglée et suit le scroll de la page : pas de glisser-déposer.
  var stage = $("#pstage"), track = $("#ptrack"), fill = $("#pfill"), pp = $("#pprev"), pn = $("#pnext");
  var goStop = null; // défini quand le mode "piloté par le scroll" est actif
  var setProgress = function (p, fits) {
    if (stage) stage.classList.toggle("is-fit", !!fits);
    if (fill) fill.style.transform = "scaleX(" + Math.max(0, Math.min(1, p)) + ")";
    if (pp) pp.disabled = !!fits || p <= 0.005;
    if (pn) pn.disabled = !!fits || p >= 0.995;
  };
  if (track) {
    var nativeState = function () {
      var m = track.scrollWidth - track.clientWidth;
      setProgress(m > 1 ? track.scrollLeft / m : 1, m <= 1);
    };
    var step = function (d) {
      var c = $(".pcard", track);
      track.scrollBy({ left: d * (c ? c.offsetWidth + 16 : 400), behavior: reduced ? "auto" : "smooth" });
    };
    track.addEventListener("scroll", function () { if (!goStop) nativeState(); }, { passive: true });
    window.addEventListener("resize", function () { if (!goStop) nativeState(); });
    if (pp) pp.addEventListener("click", function () { goStop ? goStop(-1) : step(-1); });
    if (pn) pn.addEventListener("click", function () { goStop ? goStop(1) : step(1); });
    nativeState();
  }

  // Cartes équipe : la photo remplace le texte au survol (CSS) ou au toucher
  $$(".card").forEach(function (card) {
    var ph = $(".card__photo", card);
    if (ph) {
      var ok = function () { card.classList.add("has-photo"); };
      ph.addEventListener("load", ok);
      ph.addEventListener("error", function () { ph.remove(); });
      if (ph.complete) { if (ph.naturalWidth) ok(); else ph.remove(); }
    }
    card.addEventListener("click", function (e) {
      if (canHover || e.target.closest("a") || !card.classList.contains("has-photo")) return;
      var open = !card.classList.contains("is-open");
      $$(".card.is-open").forEach(function (c) { c.classList.remove("is-open"); });
      card.classList.toggle("is-open", open);
    });
  });

  // Formulaire : envoi vers /api/contact (Resend côté serveur)
  var form = $("#form");
  if (form) form.addEventListener("submit", function (e) {
    e.preventDefault();
    var st = $("#formstatus"), btn = $("button[type=submit]", form), fallback = "Envoi impossible. Écrivez-nous à redianicegroup@gmail.com.";
    if (!form.checkValidity()) { form.reportValidity(); return; }
    st.textContent = "Envoi en cours…"; btn.disabled = true;
    fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(new FormData(form).entries())) })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok, j: j }; }); })
      .then(function (x) { if (x.ok) { form.reset(); st.textContent = "Merci, votre message est bien parti. Nous vous répondons rapidement."; } else { st.textContent = (x.j && x.j.error) || fallback; } })
      .catch(function () { st.textContent = fallback; })
      .then(function () { btn.disabled = false; });
  });

  // Animations : valeur finale visible sans JS ni animation
  var counters = $$("[data-n]");
  if (reduced || !window.gsap || !window.ScrollTrigger || !window.Lenis) {
    counters.forEach(function (b) { b.textContent = b.dataset.n; });
    return;
  }
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });

  var lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
  gsap.ticker.lagSmoothing(0);
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var id = a.getAttribute("href");
      if (id.length > 1 && $(id)) { e.preventDefault(); lenis.scrollTo(id, { offset: -10, duration: 1.4 }); }
    });
  });
  var rt; refreshSoon = function () { clearTimeout(rt); rt = setTimeout(function () { ScrollTrigger.refresh(); }, 250); };

  function words(el, cls, inner) {
    el.setAttribute("aria-label", el.textContent.trim());
    el.innerHTML = el.textContent.trim().split(/\s+/).map(function (w) {
      return inner ? '<span class="w"><span>' + w + "</span></span>" : '<span class="' + cls + '">' + w + "</span>";
    }).join(" ");
  }

  // Le moment fort : l'intro du hero. Le titre garde sa pastille-image
  function heroWords(el) {
    el.setAttribute("aria-label", el.textContent.replace(/\s+/g, " ").trim());
    var out = [];
    Array.prototype.forEach.call(el.childNodes, function (n) {
      if (n.nodeType === 3) n.textContent.trim().split(/\s+/).filter(Boolean).forEach(function (w) { out.push('<span class="w"><span>' + w + "</span></span>"); });
      else out.push('<span class="w">' + n.outerHTML + "</span>");
    });
    el.innerHTML = out.join(" ");
  }
  var h1 = $("#h1");
  if (h1) {
    heroWords(h1);
    gsap.from("#h1 .w > span", { yPercent: 115, duration: 1.2, ease: "expo.out", stagger: 0.08, delay: 0.15 });
    gsap.from(".hero__lead, .hero__cta", { opacity: 0, y: 24, duration: 1, ease: "power3.out", delay: 0.8, stagger: 0.15 });
    gsap.from(".hero__trio", { yPercent: 14, opacity: 0, duration: 1.5, ease: "expo.out", delay: 0.9 });
  }

  // Mission : le texte se révèle mot à mot avec le défilement
  var st = $("#statement");
  if (st) {
    words(st, "sw", false);
    gsap.to("#statement .sw", { opacity: 1, ease: "none", stagger: 0.1, scrollTrigger: { trigger: st, start: "top 80%", end: "bottom 50%", scrub: true } });
  }

  // Nos produits : la piste est épinglée au centre de l'écran. Descendre fait défiler les cartes vers la
  // gauche, remonter les ramène vers la droite. Les flèches déplacent le scroll vers la carte voisine.
  if (stage && track) {
    var mm = gsap.matchMedia();
    mm.add("(min-height: 561px)", function () {
      stage.classList.add("is-scrub"); track.removeAttribute("tabindex");
      var travel = function () { return Math.max(0, track.scrollWidth - stage.clientWidth); };
      var tw = gsap.to(track, {
        x: function () { return -travel(); }, ease: "none",
        scrollTrigger: {
          trigger: stage, pin: true, scrub: 0.35, anticipatePin: 1, invalidateOnRefresh: true,
          start: function () { return stage.offsetHeight + 110 < window.innerHeight ? "center center" : "top 84px"; },
          end: function () { var t = travel(); return "+=" + (t > 0 ? Math.round(Math.max(t * 1.4, window.innerHeight * 0.7)) : 1); },
          onUpdate: function (self) { setProgress(self.progress, travel() <= 0); },
          onRefresh: function (self) { setProgress(self.progress, travel() <= 0); }
        }
      });
      setProgress(tw.scrollTrigger.progress, travel() <= 0);
      goStop = function (dir) {
        var s = tw.scrollTrigger, t = travel(); if (!t) return;
        var left = track.getBoundingClientRect().left, pad = parseFloat(getComputedStyle(track).paddingLeft) || 0;
        var stops = $$(".pcard", track).map(function (c) { return Math.min(1, Math.max(0, (c.getBoundingClientRect().left - left - pad) / t)); })
          .filter(function (v, i, a) { return a.indexOf(v) === i; }).sort(function (a, b) { return a - b; });
        var cur = s.progress, target = null, i;
        if (dir > 0) { for (i = 0; i < stops.length; i++) if (stops[i] > cur + 0.02) { target = stops[i]; break; } }
        else { for (i = stops.length - 1; i >= 0; i--) if (stops[i] < cur - 0.02) { target = stops[i]; break; } }
        if (target === null) return;
        lenis.scrollTo(s.start + target * (s.end - s.start), { duration: 1.2 });
      };
      return function () {
        goStop = null; stage.classList.remove("is-scrub"); track.setAttribute("tabindex", "0");
        nativeState();
      };
    });
  }

  counters.forEach(function (b) {
    var o = { v: 0 }, n = parseInt(b.dataset.n, 10);
    ScrollTrigger.create({ trigger: b, start: "top 88%", once: true, onEnter: function () {
      gsap.to(o, { v: n, duration: 1.6, ease: "power2.out", onUpdate: function () { b.textContent = Math.round(o.v); } });
    } });
  });
  window.addEventListener("load", function () { ScrollTrigger.refresh(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
})();
