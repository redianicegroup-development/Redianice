/* Redianice — « Créé par AKATech Studio » : le logo apparaît près du pointeur et le suit (survol à la souris, doigt posé sur le nom, ou focus clavier).
   Même effet que sur Mon E-Carnet. Le visuel est décoratif : le nom reste un vrai lien (nouvel onglet).
   Usage : <span class="credit-reveal" data-credit-reveal data-logo="/assets/akatech-studio-logo.webp"><a class="credit-reveal__link" href="…">Nom</a></span>
   Le style est dans css/style.css (.credit-reveal__*). */
(function () {
  "use strict";
  var TOUCH_LINGER_MS = 1400;
  var clamp = function (v, min, max) { return Math.min(Math.max(v, min), Math.max(min, max)); };
  var reducedMotion = function () { return window.matchMedia("(prefers-reduced-motion: reduce)").matches; };

  function init(root) {
    var link = root.querySelector(".credit-reveal__link");
    var logoSrc = root.getAttribute("data-logo");
    if (!link || !logoSrc) return;

    // La carte est posée dans <body> : le pied de page (overflow masqué) ne peut pas la rogner.
    var card = document.createElement("span");
    card.className = "credit-reveal__card";
    card.setAttribute("data-open", "false");
    card.setAttribute("aria-hidden", "true");
    var frame = document.createElement("span");
    frame.className = "credit-reveal__frame";
    var img = document.createElement("img");
    img.alt = ""; img.width = 176; img.height = 176; img.decoding = "async"; img.draggable = false;
    frame.appendChild(img); card.appendChild(frame); document.body.appendChild(card);

    // Le logo se charge quand le navigateur est au repos : la première apparition n'attend pas le réseau.
    var load = function () { if (!img.getAttribute("src")) img.src = logoSrc; };
    if ("requestIdleCallback" in window) window.requestIdleCallback(load); else setTimeout(load, 1200);

    var f = { x: 0, y: 0, tx: 0, ty: 0, raf: 0, placed: false };
    var hideTimer = 0, lastPointer = "mouse", open = false;

    // Fait glisser la carte vers sa cible, avec une légère inclinaison selon la vitesse (mouvement réduit : placement immédiat).
    var tick = function () {
      var reduced = reducedMotion(), ease = reduced ? 1 : 0.2, dx = f.tx - f.x;
      f.x += dx * ease; f.y += (f.ty - f.y) * ease;
      card.style.transform = "translate3d(" + f.x.toFixed(1) + "px," + f.y.toFixed(1) + "px,0)";
      card.style.setProperty("--credit-tilt", reduced ? "0deg" : clamp(dx * 0.07, -10, 10).toFixed(2) + "deg");
      var moving = Math.abs(f.tx - f.x) > 0.3 || Math.abs(f.ty - f.y) > 0.3;
      f.raf = moving ? requestAnimationFrame(tick) : 0;
    };
    // Vise un point : centré sur le pointeur, au-dessus (ou dessous s'il n'y a pas la place), jamais hors de l'écran.
    var aim = function (cx, cy, lift) {
      var w = card.offsetWidth, h = card.offsetHeight;
      f.tx = clamp(cx - w / 2, 8, window.innerWidth - w - 8);
      var above = cy - h - lift;
      f.ty = above >= 8 ? above : cy + lift;
      if (!f.placed) { f.x = f.tx; f.y = f.ty; f.placed = true; }
      if (!f.raf) f.raf = requestAnimationFrame(tick);
    };
    var show = function (cx, cy, lift) {
      clearTimeout(hideTimer); load(); aim(cx, cy, lift);
      open = true; card.setAttribute("data-open", "true");
    };
    var move = function (cx, cy, lift) { aim(cx, cy, lift); };
    var hide = function () {
      clearTimeout(hideTimer); open = false;
      card.setAttribute("data-open", "false"); f.placed = false;
    };

    link.addEventListener("pointerenter", function (e) { lastPointer = e.pointerType; if (e.pointerType !== "touch") show(e.clientX, e.clientY, 22); });
    link.addEventListener("pointermove", function (e) {
      if (e.pointerType === "touch") move(e.clientX, e.clientY, 40);
      else if (open) move(e.clientX, e.clientY, 22);
    });
    link.addEventListener("pointerleave", function (e) { if (e.pointerType !== "touch") hide(); });
    link.addEventListener("pointerdown", function (e) { lastPointer = e.pointerType; if (e.pointerType === "touch") show(e.clientX, e.clientY, 40); });
    link.addEventListener("pointerup", function (e) { if (e.pointerType === "touch") hideTimer = setTimeout(hide, TOUCH_LINGER_MS); });
    link.addEventListener("pointercancel", function (e) { if (e.pointerType === "touch") hide(); });
    link.addEventListener("contextmenu", function (e) { if (lastPointer === "touch") e.preventDefault(); });
    link.addEventListener("focus", function () {
      if (!link.matches(":focus-visible")) return;
      var r = link.getBoundingClientRect();
      show(r.left + r.width / 2, r.top, 14);
    });
    link.addEventListener("blur", hide);
  }

  var start = function () { Array.prototype.forEach.call(document.querySelectorAll("[data-credit-reveal]"), init); };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
