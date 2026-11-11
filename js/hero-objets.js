/* Redianice — hero : objets 3D qui flottent, rebondissent et défilent selon le scroll.

   Trois couches par objet, pour que les mouvements ne se gênent pas :
     .hobj      : position + parallaxe au scroll (GSAP ScrollTrigger, y + rotation) + apparition « pop »
     .hobj__v   : secousse élastique selon la vitesse du défilement (rebond quand on s'arrête)
     img        : flottement permanent (CSS, @keyframes hobj-bob)

   Réglages par objet, dans index.html : data-speed (vitesse relative : > 0 monte plus vite que la page,
   < 0 reste plus longtemps à l'écran) et data-spin (rotation en degrés sur la durée du hero).
   Le calque est au-dessus des sections : les objets passent par-dessus la section suivante.
   Sans JS, avec « réduire les animations » ou sans GSAP : les objets restent en place (statiques). */
(function () {
  "use strict";

  var layer = document.querySelector(".hero-objs");
  if (!layer) return;
  var hero = document.getElementById("top");
  var items = [].slice.call(layer.querySelectorAll(".hobj"));

  /* le calque a la hauteur exacte du hero (il peut dépasser l'écran sur petit format) */
  var fit = function () { if (hero) layer.style.setProperty("--hero-h", hero.offsetHeight + "px"); };
  fit();
  window.addEventListener("resize", fit, { passive: true });

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var gsap = window.gsap, ST = window.ScrollTrigger;
  if (reduced || !gsap || !ST || !items.length) return;
  gsap.registerPlugin(ST);

  var vh = function () { return window.innerHeight || 800; };

  /* 1) parallaxe + rotation liées au défilement (scrub = léger retard, différent d'un objet à l'autre) */
  items.forEach(function (el, i) {
    var speed = parseFloat(el.getAttribute("data-speed")) || 0;
    var spin = parseFloat(el.getAttribute("data-spin")) || 0;
    gsap.to(el, {
      y: function () { return -speed * vh(); },
      rotation: spin,
      ease: "none",
      scrollTrigger: {
        trigger: layer, start: "top top",
        end: function () { return "+=" + Math.round(vh() * 1.2); },
        scrub: 0.6 + (i % 3) * 0.3,
        invalidateOnRefresh: true
      }
    });
  });

  /* 2) apparition : les objets « tombent » avec un rebond élastique */
  gsap.from(items, { scale: 0, opacity: 0, duration: 1.3, ease: "elastic.out(1,.5)", stagger: 0.1, delay: 0.5, clearProps: "opacity" });

  /* 3) secousse élastique : inclinaison selon la vitesse du scroll, puis retour avec rebond à l'arrêt */
  var setters = items.map(function (el, i) {
    var inner = el.querySelector(".hobj__v");
    return { q: inner ? gsap.quickTo(inner, "rotation", { duration: 0.9, ease: "elastic.out(1,.35)" }) : null,
             amp: (7 + (i % 4) * 3) * (i % 2 ? 1 : -1) };
  });
  var lastY = window.scrollY, idle = 0;
  window.addEventListener("scroll", function () {
    var y = window.scrollY, v = Math.max(-1, Math.min(1, (y - lastY) / 70));
    lastY = y;
    if (y > vh() * 1.6) return;                         // inutile une fois le hero loin derrière
    setters.forEach(function (s) { if (s.q) s.q(v * s.amp); });
    clearTimeout(idle);
    idle = setTimeout(function () { setters.forEach(function (s) { if (s.q) s.q(0); }); }, 110);
  }, { passive: true });

  /* 4) loin sous le hero : on masque le calque (rien à dessiner, rien qui recouvre une ancre) */
  ST.create({
    start: function () { return vh() * 2.4; }, end: "max",
    onEnter: function () { layer.style.visibility = "hidden"; },
    onLeaveBack: function () { layer.style.visibility = ""; }
  });
})();
