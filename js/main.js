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
  var LANG_SHORT = { fr: "FR", en: "EN", ar: "AR", "zh-CN": "ZH", pt: "PT" };
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
    $$("#langSel").forEach(function (s) { s.value = l; });
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
  var sel = $("#langSel");
  if (sel) sel.addEventListener("change", function () { if (sel.value === curLang) return; writeLang(sel.value); location.reload(); });
  // La traduction change la hauteur des textes : on recalcule les positions du scroll
  // (on ne réagit qu'au changement de langue, pas aux classes que Lenis ajoute pendant le scroll)
  var refreshSoon = function () {};
  var langState = function () { return (document.documentElement.className.match(/translated-\w+/) || [""])[0] + "|" + document.documentElement.lang; };
  var lastLangState = langState();
  new MutationObserver(function () {
    var s = langState(); if (s === lastLangState) return;
    lastLangState = s; refreshSoon();
  }).observe(document.documentElement, { attributes: true, attributeFilter: ["class", "lang"] });

  // Logo : version foncée tant que le hero (bleu ciel) est derrière l'en-tête.
  // Le hero est fixe (les sections glissent par-dessus) : on suit le bord haut de la section qui le recouvre.
  var navEl = $(".nav"), heroEl = $("#top") || $(".doc-hero");
  if (navEl && heroEl) {
    var coverEl = heroEl.nextElementSibling;
    var onSky = function () { navEl.classList.toggle("nav--sky", (coverEl || heroEl).getBoundingClientRect()[coverEl ? "top" : "bottom"] > 56); };
    window.addEventListener("scroll", onSky, { passive: true }); window.addEventListener("resize", onSky); onSky();
  }

  // Hero fixe (position: sticky; top: 0). Écran plus court que le hero : il se fixe par le bas pour que tout le texte reste visible.
  if (heroEl && heroEl.id === "top") {
    var fitHero = function () { heroEl.style.top = Math.min(0, window.innerHeight - heroEl.offsetHeight) + "px"; };
    window.addEventListener("resize", fitHero); fitHero();
  }

  // Comment ça marche : l'animation ne tourne que lorsqu'elle est visible (elle repart de l'étape 1) et peut être mise en pause
  var hiw = $(".hiw");
  if (hiw) {
    if ("IntersectionObserver" in window) new IntersectionObserver(function (es) {
      es.forEach(function (en) { hiw.classList.toggle("is-play", en.isIntersecting); });
    }, { threshold: 0.3 }).observe($(".hiw__stage", hiw));
    var pauseBtn = $(".hiw__pause", hiw);
    if (pauseBtn) pauseBtn.addEventListener("click", function () {
      var paused = hiw.classList.toggle("is-paused");
      pauseBtn.setAttribute("aria-pressed", paused ? "true" : "false");
      pauseBtn.textContent = paused ? "Reprendre l\u2019animation" : "Mettre l\u2019animation en pause";
    });
  }

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

  // ---------- Images de repli : un portrait manquant est remplacé par le portrait neutre ----------
  $$("img[data-fallback]").forEach(function (img) {
    var fb = img.getAttribute("data-fallback");
    var swap = function () { if (fb && img.getAttribute("src") !== fb) img.setAttribute("src", fb); };
    img.addEventListener("error", swap);
    if (img.complete && !img.naturalWidth) swap();
  });

  // ---------- Équipe : l'image se révèle depuis le point survolé ou touché ; le texte s'efface ----------
  function closeCards(except) { $$(".card.is-open").forEach(function (c) { if (c !== except) c.classList.remove("is-open"); }); }
  $$(".card").forEach(function (card) {
    var link = $(".team__details", card);
    var origin = function (e) {
      var r = card.getBoundingClientRect(); if (!r.width || !r.height) return;
      card.style.setProperty("--rx", Math.round((e.clientX - r.left) / r.width * 100) + "%");
      card.style.setProperty("--ry", Math.round((e.clientY - r.top) / r.height * 100) + "%");
    };
    card.addEventListener("pointerenter", origin);
    card.addEventListener("pointerdown", origin);
    card.addEventListener("click", function (e) {
      if (e.target.closest("a")) return;                                   // « Voir la fiche » est un vrai lien
      if (canHover) { if (link) window.location.assign(link.href); return; } // souris : le survol révèle, le clic ouvre la fiche
      if (card.classList.contains("is-open")) { if (link) window.location.assign(link.href); return; } // toucher : 1er = révéler, 2e = ouvrir
      closeCards(card); card.classList.add("is-open");
    });
  });
  document.addEventListener("click", function (e) { if (!e.target.closest(".card")) closeCards(); });

  // ---------- Fiches : portrait qui se dévoile, bouton « copier l'adresse » ----------
  $$(".tp-portrait").forEach(function (p) { window.requestAnimationFrame(function () { window.requestAnimationFrame(function () { p.classList.add("in"); }); }); });
  $$("[data-copy]").forEach(function (b) {
    b.addEventListener("click", function () {
      var txt = b.getAttribute("data-copy"), label = b.textContent;
      var done = function () { b.textContent = "Adresse copiée"; b.setAttribute("data-done", ""); setTimeout(function () { b.textContent = label; b.removeAttribute("data-done"); }, 2200); };
      if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(txt).then(done, function () {}); return; }
      var ta = document.createElement("textarea"); ta.value = txt; ta.setAttribute("readonly", ""); ta.style.cssText = "position:fixed;opacity:0"; document.body.appendChild(ta); ta.select();
      try { if (document.execCommand("copy")) done(); } catch (_) {} ta.remove();
    });
  });

  // ---------- Pages produit et fiches : sommaire collant, progression de lecture ----------
  var tocHost = $("[data-toc-host]");
  if (tocHost) {
    var heads = $$("h2[data-toc]", tocHost);
    if (heads.length > 2) {
      var tocNav = document.createElement("nav"); tocNav.className = "toc"; tocNav.setAttribute("aria-label", "Sur cette page");
      heads.forEach(function (h, i) {
        if (!h.id) h.id = "s-" + (i + 1);
        var a = document.createElement("a"); a.href = "#" + h.id; a.textContent = h.getAttribute("data-toc"); a.setAttribute("data-offset", "140");
        a.addEventListener("click", function (e) {
          h.style.transition = "none"; h.classList.add("in");   // le titre visé est mesuré à sa vraie place (sans le décalage de l'apparition)
          if (window.__lenis) return; e.preventDefault(); h.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
        });
        tocNav.appendChild(a);
      });
      tocHost.insertBefore(tocNav, tocHost.firstChild);
      var tocLinks = $$("a", tocNav), curIdx = -1, tocTick = false;
      var markToc = function () {
        tocTick = false;
        var idx = 0; heads.forEach(function (h, i) { if (h.getBoundingClientRect().top <= 150) idx = i; });
        if (idx === curIdx) return; curIdx = idx;
        tocLinks.forEach(function (a, i) { if (i === idx) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current"); });
        var a = tocLinks[idx]; tocNav.scrollTo({ left: a.offsetLeft - (tocNav.clientWidth - a.offsetWidth) / 2, behavior: reduced ? "auto" : "smooth" });
      };
      window.addEventListener("scroll", function () { if (!tocTick) { tocTick = true; window.requestAnimationFrame(markToc); } }, { passive: true });
      markToc();
    }
    var rp = document.createElement("div"); rp.className = "rp"; rp.setAttribute("aria-hidden", "true"); rp.innerHTML = "<i></i>"; document.body.appendChild(rp);
    var rpBar = $("i", rp), rpTick = false;
    var drawRp = function () { rpTick = false; var max = document.documentElement.scrollHeight - window.innerHeight; rpBar.style.transform = "scaleX(" + (max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0) + ")"; };
    window.addEventListener("scroll", function () { if (!rpTick) { rpTick = true; window.requestAnimationFrame(drawRp); } }, { passive: true });
    window.addEventListener("resize", drawRp); drawRp();
  }

  // ---------- Apparition douce des blocs au défilement ----------
  var rvEls = $$("[data-rv] > *:not(.toc)");
  if (rvEls.length && !reduced && "IntersectionObserver" in window) {
    var rvIO = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); rvIO.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0.04 });
    rvEls.forEach(function (el) { el.classList.add("rv"); rvIO.observe(el); });
  }

  // ---------- Captures : flèches, compteur et agrandissement (plein écran) ----------
  var shotsEl = $(".shots");
  if (shotsEl) {
    var figs = $$(".shot", shotsEl), nowFig = 0;
    var chev = function (d) { return '<svg class="ic" aria-hidden="true"><use href="#i-chevron-' + d + '"/></svg>'; };
    var bar = document.createElement("div"); bar.className = "gallery__bar";
    bar.innerHTML = '<p class="gallery__count" aria-live="polite"><span data-i>1</span> / ' + figs.length + '</p><div class="gallery__btns"><button class="gallery__btn" type="button" data-d="-1" aria-label="Capture précédente">' + chev("left") + '</button><button class="gallery__btn" type="button" data-d="1" aria-label="Capture suivante">' + chev("right") + '</button></div>';
    shotsEl.parentNode.insertBefore(bar, shotsEl);
    var cnt = $("[data-i]", bar), bPrev = $('[data-d="-1"]', bar), bNext = $('[data-d="1"]', bar);
    var nearest = function () { var c = shotsEl.scrollLeft + shotsEl.clientWidth / 2, best = 0, bd = 1e9; figs.forEach(function (f, i) { var d = Math.abs(f.offsetLeft + f.offsetWidth / 2 - c); if (d < bd) { bd = d; best = i; } }); return best; };
    var syncBar = function () {
      nowFig = nearest(); cnt.textContent = nowFig + 1;
      bPrev.disabled = shotsEl.scrollLeft < 8; bNext.disabled = shotsEl.scrollLeft + shotsEl.clientWidth >= shotsEl.scrollWidth - 8;
    };
    var goFig = function (i) { i = Math.max(0, Math.min(figs.length - 1, i)); shotsEl.scrollTo({ left: figs[i].offsetLeft - parseFloat(getComputedStyle(shotsEl).paddingLeft), behavior: reduced ? "auto" : "smooth" }); };
    bPrev.addEventListener("click", function () { goFig(nowFig - 1); });
    bNext.addEventListener("click", function () { goFig(nowFig + 1); });
    var syncTick = false;
    shotsEl.addEventListener("scroll", function () { if (!syncTick) { syncTick = true; window.requestAnimationFrame(function () { syncTick = false; syncBar(); }); } }, { passive: true });
    window.addEventListener("resize", syncBar); syncBar();

    // Agrandissement
    var dlg = document.createElement("dialog"); dlg.className = "lb"; dlg.setAttribute("aria-label", "Capture agrandie");
    dlg.innerHTML = '<div class="lb__in"><button class="lb__close" type="button" aria-label="Fermer"><svg class="ic" aria-hidden="true" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg></button><button class="lb__prev" type="button" aria-label="Capture précédente">' + chev("left") + '</button><img class="lb__img" alt=""><div class="lb__cap"></div><p class="lb__count" aria-live="polite"></p><button class="lb__next" type="button" aria-label="Capture suivante">' + chev("right") + '</button></div>';
    document.body.appendChild(dlg);
    var lbImg = $(".lb__img", dlg), lbCap = $(".lb__cap", dlg), lbCount = $(".lb__count", dlg), lbNow = 0;
    var bigSrc = function (im) { var ss = im.getAttribute("srcset"); return ss ? ss.split(",").pop().trim().split(" ")[0] : im.currentSrc || im.src; };
    var showFig = function (i) {
      lbNow = (i + figs.length) % figs.length; var f = figs[lbNow], im = $("img", f), fc = $("figcaption", f);
      lbImg.src = bigSrc(im); lbImg.alt = im.alt; lbCap.innerHTML = fc ? fc.innerHTML : ""; lbCount.textContent = (lbNow + 1) + " / " + figs.length;
    };
    var stopPage = function (on) { document.documentElement.classList.toggle("lb-open", on); if (window.__lenis) { if (on) window.__lenis.stop(); else window.__lenis.start(); } };
    figs.forEach(function (f, i) {
      var im = $("img", f), fc = $("figcaption b", f);
      var btn = document.createElement("button"); btn.type = "button"; btn.className = "shot__zoom"; btn.setAttribute("aria-label", "Agrandir : " + (fc ? fc.textContent : "capture " + (i + 1)));
      im.parentNode.insertBefore(btn, im); btn.appendChild(im);
      var hint = document.createElement("span"); hint.className = "shot__hint"; hint.setAttribute("aria-hidden", "true"); hint.textContent = "Agrandir"; btn.appendChild(hint);
      btn.addEventListener("click", function () { showFig(i); dlg.showModal(); stopPage(true); });
    });
    dlg.addEventListener("close", function () { stopPage(false); goFig(lbNow); });
    $(".lb__close", dlg).addEventListener("click", function () { dlg.close(); });
    $(".lb__prev", dlg).addEventListener("click", function () { showFig(lbNow - 1); });
    $(".lb__next", dlg).addEventListener("click", function () { showFig(lbNow + 1); });
    dlg.addEventListener("click", function (e) { if (e.target === dlg || e.target.classList.contains("lb__in")) dlg.close(); });
    dlg.addEventListener("keydown", function (e) { if (e.key === "ArrowLeft") showFig(lbNow - 1); if (e.key === "ArrowRight") showFig(lbNow + 1); });
    var sx = null;
    lbImg.addEventListener("pointerdown", function (e) { sx = e.clientX; });
    lbImg.addEventListener("pointerup", function (e) { if (sx === null) return; var dx = e.clientX - sx; sx = null; if (Math.abs(dx) > 50) showFig(lbNow + (dx < 0 ? 1 : -1)); });
  }

  // Formulaire : envoi vers /api/contact (Resend côté serveur)
  var form = $("#form"), tsId = null, tsKey = (document.querySelector('meta[name="turnstile-sitekey"]') || {}).content;
  function payload() { var d = Object.fromEntries(new FormData(form).entries()); if (tsId !== null && window.turnstile) d.token = window.turnstile.getResponse(tsId); return d; }
  if (form && tsKey) { var sc = document.createElement("script"); sc.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"; sc.async = true; sc.onload = function () { tsId = window.turnstile.render("#ts", { sitekey: tsKey }); }; document.head.appendChild(sc); }
  if (form) form.addEventListener("submit", function (e) {
    e.preventDefault();
    var st = $("#formstatus"), btn = $("button[type=submit]", form), fallback = "Envoi impossible. Écrivez-nous à redianicegroup@gmail.com.";
    if (!form.checkValidity()) { form.reportValidity(); return; }
    st.textContent = "Envoi en cours…"; btn.disabled = true;
    fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload()) })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok, j: j }; }); })
      .then(function (x) { if (x.ok) { form.reset(); st.textContent = "Merci, votre message est bien parti. Nous vous répondons rapidement."; } else { st.textContent = (x.j && x.j.error) || fallback; } })
      .catch(function () { st.textContent = fallback; })
      .then(function () { btn.disabled = false; if (tsId !== null && window.turnstile) window.turnstile.reset(tsId); });
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
  window.__lenis = lenis;
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
  gsap.ticker.lagSmoothing(0);
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var id = a.getAttribute("href");
      if (id.length > 1 && $(id)) { e.preventDefault(); lenis.scrollTo(id, { offset: -(+a.getAttribute("data-offset") || 10), duration: 1.4 }); }
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
  }

  // Mission, Investir, Contact : le texte se révèle mot à mot avec le défilement
  $$(".statement").forEach(function (st) {
    words(st, "sw", false);
    gsap.to($$(".sw", st), { opacity: 1, ease: "none", stagger: 0.1, scrollTrigger: { trigger: st, start: "top 80%", end: "bottom 50%", scrub: true } });
  });

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
          // refreshPriority : l'épinglage se calcule en premier, pour que les textes en dessous (Investir, Contact) tiennent compte de sa hauteur : leur effet de lumière se déclenche alors au bon moment
          trigger: stage, pin: true, scrub: 0.35, anticipatePin: 1, invalidateOnRefresh: true, refreshPriority: 1,
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

(function () {
  var sel = document.getElementById("motif");
  if (!sel) return;
  var q = (location.search.match(/[?&]motif=([a-z]+)/) || [])[1];
  if (q && sel.querySelector('option[value="' + q + '"]')) sel.value = q;
  Array.prototype.forEach.call(document.querySelectorAll("[data-motif]"), function (a) {
    a.addEventListener("click", function () { sel.value = a.getAttribute("data-motif"); });
  });
})();
