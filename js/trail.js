/* Redianice — pages perso : traînée d'objets qui suit le curseur (ou le doigt).
   Effet repris de plinch_image.html (« Image Trail Effect », GSAP) : des images apparaissent le long du chemin,
   dérivent un instant, puis disparaissent. Ici ce sont les objets 3D du métier du membre.

   Réglage : attribut data-trail sur l'en-tête de la fiche (liste de noms de fichiers de assets/objets/, sans « .webp »).
   Exemple : <section class="… tp-hero" data-trail="ecran,clavier,souris">
   Réglages de l'effet : objet CONFIG ci-dessous (taille : variable CSS --trail-size dans css/style.css).
   Décoratif : masqué aux lecteurs d'écran, jamais sur le chemin des clics (pointer-events: none).
   prefers-reduced-motion, ou GSAP absent : l'effet n'est pas lancé. */
(function () {
  "use strict";

  var host = document.querySelector("[data-trail]");
  if (!host || !window.gsap) return;
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var names = (host.getAttribute("data-trail") || "").split(",").map(function (s) { return s.trim(); }).filter(Boolean);
  if (!names.length) return;
  var BASE = host.getAttribute("data-trail-base") || "/assets/objets/";

  var CONFIG = {
    threshold: 64,        // distance (px) à parcourir avant qu'un nouvel objet apparaisse
    lifetime: 0.4,        // durée d'affichage avant la sortie (s)
    appearScale: 1,
    exitScale: 0.2,
    drift: 0.5,           // dérive dans le sens du geste
    rotation: 12,         // inclinaison aléatoire (degrés)
    sizeVariance: 0.2,
    tilt: 8               // effet de perspective selon la position
  };

  var gsap = window.gsap;
  var lerp = function (a, b, n) { return (1 - n) * a + n * b; };

  var layer = null, items = [], total = 0;
  var mouse = { x: 0, y: 0 }, last = { x: 0, y: 0 }, cache = { x: 0, y: 0 };
  var started = false, raf = 0, index = -1, zIndex = 1, active = 0;

  /* les images ne sont chargées qu'au premier geste dans l'en-tête */
  var build = function () {
    if (layer) return;
    layer = document.createElement("div");
    layer.className = "trail";
    layer.setAttribute("aria-hidden", "true");
    layer.style.perspective = CONFIG.tilt ? "1000px" : "";
    names.forEach(function (name) {
      var box = document.createElement("div");
      box.className = "trail__img";
      var img = new Image();
      img.alt = ""; img.decoding = "async"; img.draggable = false;
      img.src = BASE + name + ".webp";
      img.onerror = function () { box.setAttribute("data-broken", ""); };
      box.appendChild(img);
      layer.appendChild(box);
      items.push(box);
    });
    host.appendChild(layer);
    total = items.length;
  };

  var settle = function () {
    active = Math.max(0, active - 1);
    if (!active) zIndex = 1;
  };

  var spawn = function () {
    if (!total) return;
    var tries = total;                       // saute un objet dont l'image n'a pas pu se charger
    do { index = (index + 1) % total; } while (items[index].hasAttribute("data-broken") && --tries > 0);
    var el = items[index];
    if (el.hasAttribute("data-broken")) return;

    var width = el.offsetWidth, height = el.offsetHeight;
    var dx = mouse.x - last.x, dy = mouse.y - last.y;
    var fromAngle = gsap.utils.random(-CONFIG.rotation, CONFIG.rotation);
    var toAngle = fromAngle * 0.4;
    var scale = 1 + gsap.utils.random(-0.5, 0.6) * CONFIG.sizeVariance;
    var box = layer.getBoundingClientRect();
    var tiltX = box.height ? -((mouse.y - box.height / 2) / (box.height / 2)) * CONFIG.tilt : 0;
    var tiltY = box.width ? ((mouse.x - box.width / 2) / (box.width / 2)) * CONFIG.tilt : 0;
    var slide = 0.6 * CONFIG.drift;

    ++zIndex; ++active;
    gsap.killTweensOf(el);

    var tl = gsap.timeline({ onComplete: settle });
    tl.fromTo(el,
      { opacity: 1, scale: CONFIG.appearScale * scale, zIndex: zIndex,
        x: cache.x - width / 2, y: cache.y - height / 2,
        rotation: fromAngle, rotationX: tiltX * 0.5, rotationY: tiltY * 0.5 },
      { duration: 0.9, ease: "power2", scale: scale,
        x: mouse.x - width / 2 + dx * slide, y: mouse.y - height / 2 + dy * slide,
        rotation: toAngle, rotationX: tiltX, rotationY: tiltY },
      0);
    tl.to(el, { duration: 0.4, ease: "expo", opacity: 0, scale: CONFIG.exitScale * scale }, CONFIG.lifetime);
    tl.to(el, { duration: 1.5, ease: "power4", x: "+=" + (dx * CONFIG.drift * 1.2), y: "+=" + (dy * CONFIG.drift * 1.2) }, CONFIG.lifetime);
  };

  var loop = function () {
    raf = 0;
    cache.x = lerp(cache.x, mouse.x, 0.1);
    cache.y = lerp(cache.y, mouse.y, 0.1);
    if (Math.hypot(mouse.x - last.x, mouse.y - last.y) > CONFIG.threshold) {
      spawn();
      last.x = mouse.x; last.y = mouse.y;
    }
    if (Math.abs(cache.x - mouse.x) > 0.5 || Math.abs(cache.y - mouse.y) > 0.5) raf = requestAnimationFrame(loop);
  };

  var move = function (point) {
    build();
    var rect = layer.getBoundingClientRect();
    mouse.x = point.clientX - rect.left;
    mouse.y = point.clientY - rect.top;
    if (!started) {
      started = true;
      cache.x = last.x = mouse.x;
      cache.y = last.y = mouse.y;
    }
    if (!raf) raf = requestAnimationFrame(loop);
  };

  /* souris et stylet : événements « pointer » ; doigt : touchmove, comme l'effet d'origine (le défilement reste libre) */
  host.addEventListener("pointermove", function (e) { if (e.pointerType !== "touch") move(e); }, { passive: true });
  host.addEventListener("touchmove", function (e) { if (e.touches[0]) move(e.touches[0]); }, { passive: true });
  host.addEventListener("pointerleave", function () { started = false; }, { passive: true });
  host.addEventListener("touchend", function () { started = false; }, { passive: true });
})();
