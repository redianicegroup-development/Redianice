/* Redianice — mots clés entourés : effet 11 « spirale ovale » de svggg_prooo.html, en bleu.

   Balisage : <strong class="hl">mot clé</strong> (court : 1 à 3 mots, il ne passe jamais à la ligne).
   Le script ajoute un SVG derrière le mot et l'anime au défilement : le trait se dessine quand le mot arrive dans la partie
   haute de l'écran, reste un instant, s'efface, puis recommence tant que le mot est visible (même boucle que la démo).
   Quand le mot sort de l'écran, l'animation s'arrête ; elle repart à la prochaine entrée.

   Le tracé est recalculé aux dimensions réelles du mot (en pixels, sans déformation du trait) à chaque changement de taille :
   écran qui tourne, police qui finit de charger, texte traduit.
   prefers-reduced-motion : le tracé reste simplement dessiné, sans animation (CSS, bloc V37 de css/style.css). */
(function () {
  "use strict";
  var els = Array.prototype.slice.call(document.querySelectorAll(".hl"));
  if (!els.length) return;

  var NS = "http://www.w3.org/2000/svg";
  /* tracé de la démo (viewBox 100 × 50) : spirale ovale, deux tours autour du mot */
  var BASE = "M 15,25 C 10,10 85,5 90,25 C 95,42 18,44 15,22 C 12,8 80,12 85,25 C 90,38 25,38 20,25";
  var PAIR = /(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/g;
  var scaled = function (w, h) {
    return BASE.replace(PAIR, function (m, x, y) { return (x * w / 100).toFixed(1) + "," + (y * h / 50).toFixed(1); });
  };

  /* dimensions de l'ovale : 124 % de la largeur et 220 % de la hauteur du mot (voir .hl__svg dans le CSS) */
  var fit = function (el) {
    var svg = el.querySelector(".hl__svg"); if (!svg) return;
    var path = svg.firstChild;
    var w = Math.max(1, Math.round(el.offsetWidth * 1.24)), h = Math.max(1, Math.round(el.offsetHeight * 2.2));
    svg.setAttribute("viewBox", "0 0 " + w + " " + h);
    path.setAttribute("d", scaled(w, h));
    var len = Math.ceil(path.getTotalLength()) + 2;
    path.style.strokeDasharray = len + " " + len;
    path.style.setProperty("--len", len + "px");
  };

  els.forEach(function (el) {
    if (el.querySelector(".hl__svg")) return;
    var svg = document.createElementNS(NS, "svg");
    svg.setAttribute("class", "hl__svg");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");
    svg.appendChild(document.createElementNS(NS, "path"));
    el.appendChild(svg);
    fit(el);
  });

  if ("ResizeObserver" in window) {
    var ro = new ResizeObserver(function (es) { es.forEach(function (e) { fit(e.target); }); });
    els.forEach(function (el) { ro.observe(el); });
  } else {
    window.addEventListener("resize", function () { els.forEach(fit); });
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { els.forEach(fit); });

  /* déclenchement au défilement : le mot doit être au-dessus des 28 % du bas de l'écran (le texte voisin s'allume à ce moment-là) */
  if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { e.target.classList.toggle("is-in", e.isIntersecting); });
    }, { rootMargin: "0px 0px -28% 0px", threshold: 0.6 });
    els.forEach(function (el) { io.observe(el); });
  } else {
    els.forEach(function (el) { el.classList.add("is-in"); });
  }
})();
