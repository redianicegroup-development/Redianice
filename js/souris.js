/* Redianice — effets souris repris de bon.html, sur toutes les pages.

   1) Curseur : un point qui suit la souris avec de l'inertie. Il est en « difference » (mix-blend-mode) : il inverse les couleurs
      sous lui (effet chromatique : sombre sur le fond clair, jaune sur le bleu). Sur un lien, un bouton, une carte ou un objet
      déplaçable, il s'agrandit en lentille qui inverse le texte dessous.
   2) Boutons magnétiques : les boutons et pastilles se déplacent doucement vers la souris.
   3) Logos (en-tête, menu, pied de page) : aberration chromatique. Au survol, deux copies du logo, rouge et cyan, se décalent
      de part et d'autre selon la position de la souris sur le logo, et reviennent au repos quand elle part.
   4) Parallaxe du hero (accueil) et du portrait des fiches : le texte et l'image bougent en sens inverse.

   Tout est décoratif et ne s'active qu'avec une vraie souris (hover + pointeur précis). Sur téléphone, tablette tactile ou avec
   « réduire les animations » : rien ne change, le curseur du système reste. Les décalages utilisent la propriété CSS « translate »
   (boutons, parallaxe) : ils s'ajoutent aux effets de survol existants sans les remplacer.
   Réglages : constantes ci-dessous. Styles : bloc V37 de css/style.css. */
(function () {
  "use strict";
  var mq = window.matchMedia;
  if (!mq || !mq("(hover: hover) and (pointer: fine)").matches || mq("(prefers-reduced-motion: reduce)").matches) return;

  var root = document.documentElement;
  var $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };

  /* ------------------------------------------------------------------ réglages */
  var HOVER = "a[href],button,summary,label,select,[role=button],[role=link],.card,.pcard,.foot__obj";
  var TEXTF = "textarea,input:not([type=checkbox]):not([type=radio]):not([type=submit]):not([type=button])";
  var MAG = ".pill:not(.pill--off),.pillbar,.mbtn,.foot__up,.pnav button,.gallery__btn";
  var MAG_PULL = 0.3, MAG_MAX = 16;                       // part du décalage suivie par le bouton, limite en px
  var CHROMA = ".logo,.mlogo,.foot__logo";                // logos à aberration chromatique (l'image est dans le lien)
  var CHROMA_MAX = 3.2, CHROMA_MIN = 1;                   // décalage maximal des deux copies, et décalage minimal au survol (px)
  var PARA = [                                            // [sélecteur, décalage x, décalage y] (px, pour une souris au bord de l'écran)
    [".hero__body", -18, -12],
    [".hero-objs", 26, 18],
    [".tp-portrait", 12, 9],
    [".tp-hero__grid > div", -9, -7]
  ];

  /* ------------------------------------------------------------------ 1) curseur */
  var cur = document.createElement("div");
  cur.className = "cursor"; cur.setAttribute("aria-hidden", "true");
  cur.innerHTML = '<span class="cursor__dot"></span>';
  document.body.appendChild(cur);

  var mx = -100, my = -100, cx = -100, cy = -100, seen = false;
  var px = 0, py = 0, qx = 0, qy = 0;                     // parallaxe : cible et valeur courante, de -0,5 à 0,5
  var mags = new Map(), chromas = new Map();
  var magEl = null, chromaEl = null, raf = 0;

  var magState = function (el) {
    var s = mags.get(el); if (!s) { s = { x: 0, y: 0, tx: 0, ty: 0 }; mags.set(el, s); }
    return s;
  };
  var chromaState = function (el) {
    var s = chromas.get(el); if (!s) { s = { x: 0, y: 0, tx: 0, ty: 0 }; chromas.set(el, s); }
    return s;
  };
  var kick = function () { if (!raf) raf = requestAnimationFrame(frame); };

  var paraEls = PARA.map(function (p) { return { els: $$(p[0]), kx: p[1], ky: p[2] }; }).filter(function (p) { return p.els.length; });
  var paraOn = function () { return paraEls.length && window.scrollY < window.innerHeight * 1.1; };

  function frame() {
    raf = 0;
    var busy = false;

    cx += (mx - cx) * 0.2; cy += (my - cy) * 0.2;
    if (Math.abs(mx - cx) > 0.1 || Math.abs(my - cy) > 0.1) busy = true; else { cx = mx; cy = my; }
    cur.style.transform = "translate3d(" + cx.toFixed(1) + "px," + cy.toFixed(1) + "px,0)";

    mags.forEach(function (s, el) {
      s.x += (s.tx - s.x) * 0.2; s.y += (s.ty - s.y) * 0.2;
      if (Math.abs(s.tx - s.x) < 0.05 && Math.abs(s.ty - s.y) < 0.05) { s.x = s.tx; s.y = s.ty; } else busy = true;
      if (!s.x && !s.y && !s.tx && !s.ty) { el.style.translate = ""; mags.delete(el); return; }
      el.style.translate = s.x.toFixed(2) + "px " + s.y.toFixed(2) + "px";
    });

    /* logos : --chx / --chy = décalage (px) des deux copies rouge et cyan, lues par le CSS (.is-chroma) */
    chromas.forEach(function (s, el) {
      s.x += (s.tx - s.x) * 0.22; s.y += (s.ty - s.y) * 0.22;
      if (Math.abs(s.tx - s.x) < 0.03 && Math.abs(s.ty - s.y) < 0.03) { s.x = s.tx; s.y = s.ty; } else busy = true;
      if (!s.x && !s.y && !s.tx && !s.ty) {
        el.classList.remove("is-chroma"); el.style.removeProperty("--chx"); el.style.removeProperty("--chy"); chromas.delete(el); return;
      }
      el.classList.add("is-chroma");
      el.style.setProperty("--chx", s.x.toFixed(2)); el.style.setProperty("--chy", s.y.toFixed(2));
    });

    if (paraEls.length) {
      qx += (px - qx) * 0.08; qy += (py - qy) * 0.08;
      var moving = Math.abs(px - qx) > 0.0005 || Math.abs(py - qy) > 0.0005;
      if (moving) busy = true; else { qx = px; qy = py; }
      if (moving || qx || qy) {
        var on = paraOn();
        paraEls.forEach(function (p) {
          var v = on ? (qx * p.kx).toFixed(2) + "px " + (qy * p.ky).toFixed(2) + "px" : "";
          p.els.forEach(function (el) { el.style.translate = v; });
        });
      }
    }
    if (busy) kick();
  }

  var setMag = function (el, x, y) { var s = magState(el); s.tx = x; s.ty = y; };
  var setChroma = function (el, x, y) { var s = chromaState(el); s.tx = x; s.ty = y; };

  document.addEventListener("pointermove", function (e) {
    if (e.pointerType && e.pointerType !== "mouse") return;
    mx = e.clientX; my = e.clientY;
    if (!seen) { seen = true; cx = mx; cy = my; root.classList.add("has-cursor"); cur.classList.add("is-on"); }
    var t = e.target;
    if (!t || !t.closest) { kick(); return; }

    cur.classList.toggle("is-hover", !!t.closest(HOVER));
    cur.classList.toggle("is-text", !!t.closest(TEXTF));

    /* 2) magnétisme : le centre « d'origine » du bouton = son centre actuel moins le décalage qu'on lui a déjà donné */
    var m = t.closest(MAG);
    if (m !== magEl) { if (magEl) setMag(magEl, 0, 0); magEl = m; }
    if (m) {
      var r = m.getBoundingClientRect(), s = magState(m);
      var hx = r.left - s.x + r.width / 2, hy = r.top - s.y + r.height / 2;
      setMag(m, clamp((mx - hx) * MAG_PULL, -MAG_MAX, MAG_MAX), clamp((my - hy) * MAG_PULL, -MAG_MAX, MAG_MAX));
    }

    /* 3) logo : les deux copies se décalent dans le sens de la souris (par rapport au centre du logo), toujours un peu visibles au survol */
    var g = t.closest(CHROMA);
    if (g !== chromaEl) { if (chromaEl) setChroma(chromaEl, 0, 0); chromaEl = g; }
    if (g) {
      var b = g.getBoundingClientRect();
      var nx = clamp((mx - b.left) / Math.max(b.width, 1) * 2 - 1, -1, 1), ny = clamp((my - b.top) / Math.max(b.height, 1) * 2 - 1, -1, 1);
      var ox = nx * CHROMA_MAX, oy = ny * CHROMA_MAX;
      if (Math.abs(ox) < CHROMA_MIN) ox = nx < 0 ? -CHROMA_MIN : CHROMA_MIN;
      setChroma(g, ox, oy);
    }

    /* 4) parallaxe */
    px = mx / Math.max(window.innerWidth, 1) - 0.5; py = my / Math.max(window.innerHeight, 1) - 0.5;
    kick();
  }, { passive: true });

  document.addEventListener("pointerdown", function (e) {
    if (e.pointerType && e.pointerType !== "mouse") return;
    cur.classList.add("is-down");
  }, true);
  var up = function () { cur.classList.remove("is-down"); };
  document.addEventListener("pointerup", up, true);
  document.addEventListener("pointercancel", up, true);
  window.addEventListener("blur", up);

  /* la souris quitte la fenêtre : le point disparaît, tout revient au repos */
  document.documentElement.addEventListener("mouseleave", function () {
    cur.classList.remove("is-on", "is-hover", "is-down");
    if (magEl) { setMag(magEl, 0, 0); magEl = null; }
    if (chromaEl) { setChroma(chromaEl, 0, 0); chromaEl = null; }
    px = 0; py = 0; kick();
  });
  document.documentElement.addEventListener("mouseenter", function () { if (seen) cur.classList.add("is-on"); });
})();
