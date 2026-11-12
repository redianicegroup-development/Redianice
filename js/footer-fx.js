/* Redianice — filigrane interactif (footer de toutes les pages + hero de l'accueil) + objets déplaçables (footer).

   1) Filigrane « redianice » dessiné en canvas (effet repris de redianice.html) :
      - tout le mot est un filigrane en contour pointillé, à peine rempli ;
      - la lettre survolée (ou balayée toute seule quand personne n'y touche) se renforce (contour plein, léger remplissage),
        avec un cadre de sélection, des étincelles et une étiquette de cotes ;
      - une lettre se saisit et se déplace ; relâchée, elle revient en rebondissant (ressort) ;
      - un clic / un toucher fait sauter les lettres en vague.
   2) Objets 3D déplaçables (footer seulement), souris ou doigt. Plus aucun tirage au sort : toujours les mêmes, aux mêmes places.
      7 objets, disposés comme sur la capture validée en V31 (voir SET_DESKTOP / SET_PHONE). Le pied de page occupe tout l'écran :
      la scène prend la hauteur qui reste (CSS, flex) et les objets se répartissent au-dessus du mot, quelle que soit la taille de l'écran.
      Une scène sans calque « .foot__objs » (le hero) n'affiche que le filigrane.

   Tout est décoratif : le calque est masqué aux lecteurs d'écran et le site reste utilisable au clavier.
   prefers-reduced-motion : pas de balayage automatique, pas de vague, pas d'inertie, pas de flottement. */
(function () {
  "use strict";

  function mount(stage) {
  var canvas = stage.querySelector(".foot__wm");
  var layer = stage.querySelector(".foot__objs");
  if (!canvas || !canvas.getContext) return;

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var rootStyle = getComputedStyle(document.documentElement);
  var INK = (rootStyle.getPropertyValue("--blue") || "").trim() || "#0b3dff";

  /* ------------------------------------------------------------------ réglages */
  var TEXT = stage.getAttribute("data-text") || "redianice";
  var BASE = stage.getAttribute("data-objs") || "/assets/objets/";
  var FAMILY = "Urbanist, system-ui, sans-serif";
  var WEIGHT = 800, SPACING = -0.045, FIT = 0.99;      // police, interlettrage, part de la largeur occupée
  var DASH_ON = 10, DASH_OFF = 6, STROKE = 2.2;        // contour pointillé de la lettre survolée
  var SPRING = 320, BOUNCE = 0.4, KICK_DECAY = 0.62;   // rebond des lettres
  var SPECKS = 14;                                     // étincelles autour du cadre
  var WM_DASH = 0.8, WM_FILL = 0.07;                   // filigrane au repos : opacité du contour pointillé, du remplissage (la lettre survolée monte à 1 et 0,2)
  var SWEEP = !reduced, CLICK_KICK = !reduced;
  var LABEL_FONT = "11px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

  /* Objets du footer : toujours les mêmes, aux mêmes places (disposition de la capture validée en V31).
     O(nom du fichier, largeur, hauteur, centre x en part de la largeur de la scène, centre y en part de la hauteur libre au-dessus du mot,
       rotation en degrés, taille relative) */
  var O = function (name, w, h, cx, v, rot, k) { return { name: name, w: w, h: h, cx: cx, v: v, rot: rot, k: k }; };
  var SET_DESKTOP = [          // 7 objets : écran, carnet, graphique et loupe en haut, mallette à droite, ampoule et poignée de main posées sur les lettres
    O("ecran", 400, 344, 0.064, 0.855, -5, 0.95),
    O("carnet-code", 394, 400, 0.222, 0.662, -19.5, 0.95),
    O("graphique", 367, 400, 0.397, 0.834, 7, 0.95),
    O("loupe", 391, 400, 0.766, 0.639, 8, 1),
    O("mallette", 400, 361, 0.95, 0.578, -1, 0.95),
    O("ampoule", 400, 377, 0.435, 0.151, 0, 0.95),
    O("poignee-de-main", 400, 239, 0.651, 0.304, 16, 1.1)
  ];
  var SET_PHONE = [            // les mêmes 7 objets, répartis en quinconce sur la hauteur de l'écran
    O("ecran", 400, 344, 0.2, 0.9, -5, 1),
    O("graphique", 367, 400, 0.76, 0.92, 7, 1),
    O("carnet-code", 394, 400, 0.45, 0.67, -19.5, 1),
    O("loupe", 391, 400, 0.86, 0.6, 8, 1.05),
    O("mallette", 400, 361, 0.17, 0.42, -1, 1),
    O("poignee-de-main", 400, 239, 0.62, 0.35, 16, 1.25),
    O("ampoule", 400, 377, 0.33, 0.12, 0, 1)
  ];
  var setFor = function (w) { return w < 600 ? SET_PHONE : SET_DESKTOP; };


  /* ------------------------------------------------------------------ outils */
  var clamp01 = function (v) { return Math.min(1, Math.max(0, Number(v) || 0)); };
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var approach = function (cur, target, dt, seconds) { return cur + (target - cur) * (1 - Math.exp(-dt / seconds)); };
  var rand = function (a, b) { return a + Math.random() * (b - a); };
  var signed = function (v) { return v > 0 ? "+" + v : v < 0 ? "\u2212" + (-v) : "0"; };
  var noise = function () {
    var h = 2166136261;
    for (var i = 0; i < arguments.length; i++) {
      h = Math.imul(h ^ (arguments[i] | 0), 16777619); h ^= h >>> 13; h = Math.imul(h, 0x5bd1e995); h ^= h >>> 15;
    }
    return (h >>> 0) / 4294967296;
  };
  /* taille de référence d'un objet selon la largeur de la scène */
  var objUnit = function (w) { return w < 600 ? clamp(w * 0.22, 64, 110) : clamp(w * 0.105, 54, 150); };
  /* place minimale au-dessus des lettres pour les objets (le pied de page occupe tout l'écran : la scène prend le reste, voir fitStage) */
  var minHead = function (w) { return layer ? Math.round(objUnit(w) * (w < 600 ? 2.4 : 1)) : 0; };

  /* ================================================================== 1) FILIGRANE */
  var ctx = canvas.getContext("2d");
  var probe = document.createElement("canvas").getContext("2d");
  var width = 1, height = 1, dpr = 1;
  var raf = 0, last = 0, visible = false, alive = true;
  var sizeDirty = true, fontsReady = !document.fonts;
  var word = null, glyphs = [], layoutKey = "";
  var clock = 0, pulse = 0, placed = false, dragging = -1, cursor = "";
  var kicks = [];
  var press = { x: 0, y: 0, time: 0, index: -1 };
  var pointer = { x: 0, y: 0, inside: false };
  var grab = { x: 0, y: 0 };
  var lens = { x: 0, y: 0 };
  var frame = { x1: 0, y1: 0, x2: 0, y2: 0, alpha: 0, index: -1 };

  var setFont = function (c, size) {
    c.font = WEIGHT + " " + size + "px " + FAMILY;
    if ("letterSpacing" in c) c.letterSpacing = (SPACING * size) + "px";
    c.textAlign = "left"; c.textBaseline = "alphabetic";
  };

  var wake = function () {
    if (raf || !visible || !alive) return;
    last = performance.now();
    raf = requestAnimationFrame(tick);
  };

  /* mesure le mot à la largeur donnée et en déduit la hauteur de la scène */
  var measure = function (w) {
    setFont(probe, 100);
    var m = probe.measureText(TEXT);
    var inkW = m.actualBoundingBoxLeft + m.actualBoundingBoxRight;
    var size = 100 * (w * FIT) / Math.max(inkW, 1);
    setFont(probe, size);
    m = probe.measureText(TEXT);
    return { size: size, m: m, asc: m.actualBoundingBoxAscent, desc: m.actualBoundingBoxDescent,
             inkW: m.actualBoundingBoxLeft + m.actualBoundingBoxRight };
  };

  var sprite = function (glyph, stroke) {
    var pad = Math.ceil(STROKE * 2 + 4);
    var left = glyph.box.x1 - pad, top = glyph.box.y1 - pad;
    var w = glyph.box.x2 - glyph.box.x1 + pad * 2, h = glyph.box.y2 - glyph.box.y1 + pad * 2;
    var image = document.createElement("canvas");
    image.width = Math.max(1, Math.ceil(w * dpr)); image.height = Math.max(1, Math.ceil(h * dpr));
    var c = image.getContext("2d");
    if (!c) return { image: image, left: left, top: top };
    c.setTransform(dpr, 0, 0, dpr, -left * dpr, -top * dpr);
    setFont(c, word.size);
    if (stroke) {
      var k = clamp(word.size / 330, 0.4, 1);            // pointillés plus fins et plus courts quand le mot est petit (téléphone)
      c.lineJoin = "round"; c.lineWidth = STROKE * Math.max(k, 0.6) * 2; c.lineCap = "butt"; c.strokeStyle = INK;
      c.setLineDash([DASH_ON * k, DASH_OFF * k]);
      c.strokeText(glyph.char, glyph.x, word.baseline);
      c.setLineDash([]);
      c.globalCompositeOperation = "destination-out";   // on ne garde que le contour extérieur
      c.fillStyle = "#000";
      c.fillText(glyph.char, glyph.x, word.baseline);
      c.globalCompositeOperation = "source-over";
    } else {
      c.fillStyle = INK;
      c.fillText(glyph.char, glyph.x, word.baseline);
    }
    return { image: image, left: left, top: top };
  };

  var ensureLayout = function () {
    var key = [width, height, dpr, fontsReady].join("|");
    if (key === layoutKey && word) return word;
    layoutKey = key;
    var mt = measure(width);
    var start = (width - mt.inkW) / 2;
    var x = start + mt.m.actualBoundingBoxLeft;
    var baseline = height - 6 - mt.desc;
    word = { size: mt.size, baseline: baseline, left: x - mt.m.actualBoundingBoxLeft, right: x + mt.m.actualBoundingBoxRight,
             top: baseline - mt.asc, bottom: baseline + mt.desc };
    setFont(probe, mt.size);
    var chars = Array.from(TEXT), prefix = "", previous = glyphs;
    glyphs = [];
    chars.forEach(function (char, i) {
      prefix += char;
      var own = probe.measureText(char);
      var gx = x + probe.measureText(prefix).width - own.width;
      if (!char.trim()) return;
      var kept = previous[glyphs.length];
      var base = { char: char, x: gx, box: { x1: gx - own.actualBoundingBoxLeft, y1: baseline - own.actualBoundingBoxAscent,
                                             x2: gx + own.actualBoundingBoxRight, y2: baseline + own.actualBoundingBoxDescent } };
      var same = kept && kept.char === char && kept.index === i;
      var g = { char: char, x: gx, box: base.box, index: i,
                offset: same ? kept.offset : { x: 0, y: 0 }, velocity: same ? kept.velocity : { x: 0, y: 0 },
                outline: same ? kept.outline : 0 };
      g.fill = sprite(g, false); g.dashes = sprite(g, true);
      glyphs.push(g);
    });
    if (dragging >= 0 && !glyphs[dragging]) dragging = -1;
    if (frame.index >= 0 && !glyphs[frame.index]) frame.index = -1;
    return word;
  };

  var glyphAt = function (x, y) {
    if (!word || y < word.top - 24 || y > word.bottom + 24) return -1;
    var best = -1, bestD = Infinity;
    glyphs.forEach(function (g, i) {
      var x1 = g.box.x1 + g.offset.x, x2 = g.box.x2 + g.offset.x;
      var d = x < x1 ? x1 - x : x > x2 ? x - x2 : 0;
      if (d < bestD) { bestD = d; best = i; }
    });
    return bestD < 28 ? best : -1;
  };

  var blit = function (art, dx, dy) {
    ctx.drawImage(art.image, Math.round((art.left + dx) * dpr), Math.round((art.top + dy) * dpr));
  };
  var crisp = function (v) { return (Math.round(v * dpr) + 0.5) / dpr; };

  var perimeterPoint = function (distance, w, h) {
    var total = 2 * (w + h), d = ((distance % total) + total) % total;
    if (d < w) return [frame.x1 + d, frame.y1, 0, -1];
    d -= w; if (d < h) return [frame.x2, frame.y1 + d, 1, 0];
    d -= h; if (d < w) return [frame.x2 - d, frame.y2, 0, 1];
    d -= w; return [frame.x1, frame.y2 - d, -1, 0];
  };

  var drawSpecks = function (a) {
    var w = frame.x2 - frame.x1, h = frame.y2 - frame.y1;
    if (w < 2 || h < 2) return;
    var perimeter = 2 * (w + h), seed = frame.index + 1, grid = 3;
    ctx.fillStyle = INK; ctx.strokeStyle = INK;
    for (var k = 0; k < SPECKS; k++) {
      var period = 0.5 + noise(seed, k, 11) * 1.2;
      var t = pulse / period + noise(seed, k, 17);
      var cycle = Math.floor(t), life = t - cycle;
      if (life > 0.7) continue;
      var pp = perimeterPoint(noise(seed, k, cycle) * perimeter, w, h);
      var pick = noise(seed, k, cycle, 2);
      var size = pick < 0.46 ? 2 : pick < 0.7 ? 3 : pick < 0.84 ? 5 : pick < 0.94 ? 8 : 11;
      var large = size >= 8;
      var out = (large ? 9 : 4) + Math.floor(noise(seed, k, cycle, 1) * 5) * grid;
      var x = frame.x1 + Math.round((pp[0] + pp[2] * out - frame.x1) / grid) * grid;
      var y = frame.y1 + Math.round((pp[1] + pp[3] * out - frame.y1) / grid) * grid;
      var tone = noise(seed, k, cycle, 3);
      var blink = life < 0.06 || (life > 0.32 && life < 0.36) ? 0.35 : 1;
      ctx.globalAlpha = a * (large ? 0.3 + 0.4 * tone : 0.3 + 0.6 * tone) * blink;
      var left = Math.round(x - size / 2), top = Math.round(y - size / 2);
      if (tone < 0.26 || (large && tone < 0.78)) {
        ctx.strokeRect(left + 0.5, top + 0.5, size, size);
        if (large && tone > 0.5) ctx.fillRect(Math.round(x) - 1, Math.round(y) - 1, 2, 2);
      } else ctx.fillRect(left, top, size, size);
    }
    for (var j = 0; j < 2; j++) {                       // deux têtes lumineuses qui courent sur le cadre
      var head = (pulse * 0.42 + j * 0.5) * perimeter;
      for (var i = 0; i < 4; i++) {
        var p = perimeterPoint(head - i * 6, w, h), s = i === 0 ? 3 : 2;
        ctx.globalAlpha = a * [0.95, 0.55, 0.32, 0.16][i];
        ctx.fillRect(Math.round(p[0] - s / 2), Math.round(p[1] - s / 2), s, s);
      }
    }
    ctx.globalAlpha = 1;
  };

  var drawFrame = function () {
    var g = glyphs[frame.index];
    if (!g || frame.alpha < 0.01) return;
    var a = frame.alpha;
    var x1 = crisp(frame.x1), y1 = crisp(frame.y1), x2 = crisp(frame.x2), y2 = crisp(frame.y2);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = INK; ctx.strokeStyle = INK; ctx.lineWidth = 1;
    var moved = Math.hypot(g.offset.x, g.offset.y);
    if (moved > 1) {                                    // trait pointillé entre la place d'origine et la lettre déplacée
      var hx = (g.box.x1 + g.box.x2) / 2, hy = (g.box.y1 + g.box.y2) / 2;
      ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(hx + g.offset.x, hy + g.offset.y);
      ctx.setLineDash([3, 4]); ctx.globalAlpha = 0.45 * a; ctx.stroke(); ctx.setLineDash([]);
      ctx.beginPath(); ctx.rect(Math.round(hx) - 2, Math.round(hy) - 2, 4, 4); ctx.globalAlpha = 0.7 * a; ctx.fill();
    }
    ctx.beginPath(); ctx.rect(x1, y1, x2 - x1, y2 - y1); ctx.globalAlpha = 0.5 * a; ctx.stroke();
    ctx.beginPath();
    [[x1, y1], [x2, y1], [x2, y2], [x1, y2]].forEach(function (c) { ctx.rect(Math.round(c[0]) - 2, Math.round(c[1]) - 2, 5, 5); });
    ctx.globalAlpha = 0.95 * a; ctx.fill(); ctx.globalAlpha = 1;
    drawSpecks(a);
    ctx.font = LABEL_FONT; ctx.textAlign = "left"; ctx.textBaseline = "bottom"; ctx.fillStyle = INK;
    ctx.globalAlpha = 0.7 * a;
    var label = moved > 1
      ? signed(Math.round(g.offset.x)) + ", " + signed(Math.round(-g.offset.y))
      : g.char + "  " + Math.round(g.box.x2 - g.box.x1) + " \u00d7 " + Math.round(g.box.y2 - g.box.y1);
    ctx.fillText(label, Math.round(frame.x1), Math.round(frame.y1) - 7);
    ctx.globalAlpha = 1;
  };

  var kick = function (index) {
    var strength = (word ? word.size : 120) * 11;
    kicks.push({ index: index, at: pulse, velocity: strength });
    for (var d = 1; d < glyphs.length; d++) {
      var v = strength * Math.pow(KICK_DECAY, d);
      if (v < 30) break;
      [index - d, index + d].forEach(function (j) { if (j >= 0 && j < glyphs.length) kicks.push({ index: j, at: pulse + d * 0.055, velocity: v }); });
    }
    wake();
  };

  /* hauteur de la scène. Hero (sans objets) : le mot seul, calculé sur la largeur. Pied de page : il occupe tout l'écran, la scène (flex: 1) prend
     la hauteur qui reste ; le JS ne fixe que sa hauteur minimale (le mot + un minimum de place pour les objets). */
  var fitStage = function () {
    var w = Math.max(1, stage.clientWidth);
    var mt = measure(w);
    var need = Math.ceil(mt.asc + mt.desc + minHead(w) + 6);
    if (!layer) {
      if (stage.style.height !== need + "px") stage.style.height = need + "px";
      return { w: w, h: need };
    }
    if (stage.style.minHeight !== need + "px") stage.style.minHeight = need + "px";
    return { w: w, h: Math.max(need, Math.round(stage.clientHeight)) };
  };

  function tick(now) {
    raf = 0;
    if (sizeDirty) {
      sizeDirty = false;
      var sz = fitStage();
      width = sz.w; height = sz.h;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      var pw = Math.round(width * dpr), ph = Math.round(height * dpr);
      if (canvas.width !== pw) canvas.width = pw;
      if (canvas.height !== ph) canvas.height = ph;
      layoutKey = "";
      objsResize();
    }
    var dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000));
    last = now;
    var view = ensureLayout();
    var damping = 2 * Math.sqrt(SPRING) * (1 - clamp01(BOUNCE) * 0.96);

    var sweeping = SWEEP && !pointer.inside && dragging < 0;
    if (sweeping) clock += dt;
    pulse += dt;
    var tx = pointer.x, ty = pointer.y;
    if (sweeping) {                                      // balayage automatique : la « loupe » va et vient sur le mot
      tx = view.left + (view.right - view.left) * (0.5 - 0.5 * Math.cos(clock * 0.45));
      ty = view.top + (view.bottom - view.top) * (0.45 + 0.1 * Math.sin(clock * 0.8));
    }
    var active = pointer.inside || sweeping || dragging >= 0;
    if (active && !placed) { lens.x = tx; lens.y = ty; }
    if (active) {
      var lag = pointer.inside ? 0.05 : 0.22;
      lens.x = approach(lens.x, tx, dt, lag); lens.y = approach(lens.y, ty, dt, lag);
    }
    placed = active;

    for (var k = kicks.length - 1; k >= 0; k--) {
      if (kicks[k].at > pulse) continue;
      var kg = glyphs[kicks[k].index];
      if (kg) kg.velocity.y -= kicks[k].velocity;
      kicks.splice(k, 1);
    }

    var moving = false;
    glyphs.forEach(function (g, i) {
      if (i === dragging) {
        g.offset.x = approach(g.offset.x, pointer.x - grab.x, dt, 0.03);
        g.offset.y = approach(g.offset.y, pointer.y - grab.y, dt, 0.03);
        g.velocity.x = 0; g.velocity.y = 0; moving = true; return;
      }
      var o = g.offset, v = g.velocity;
      if (Math.abs(o.x) < 0.05 && Math.abs(o.y) < 0.05 && Math.hypot(v.x, v.y) < 0.5) { o.x = 0; o.y = 0; v.x = 0; v.y = 0; return; }
      v.x += (-SPRING * o.x - damping * v.x) * dt;       // ressort amorti : la lettre revient en rebondissant
      v.y += (-SPRING * o.y - damping * v.y) * dt;
      o.x += v.x * dt; o.y += v.y * dt; moving = true;
    });

    var focus = dragging >= 0 ? dragging : active ? glyphAt(lens.x, lens.y) : -1;
    if (focus >= 0) {
      var fg = glyphs[focus];
      var bx1 = fg.box.x1 + fg.offset.x - 6, by1 = fg.box.y1 + fg.offset.y - 6;
      var bx2 = fg.box.x2 + fg.offset.x + 6, by2 = fg.box.y2 + fg.offset.y + 6;
      if (frame.index < 0 || frame.alpha < 0.02) { frame.x1 = bx1; frame.y1 = by1; frame.x2 = bx2; frame.y2 = by2; }
      var glide = focus === dragging ? 0.02 : 0.08;
      frame.x1 = approach(frame.x1, bx1, dt, glide); frame.y1 = approach(frame.y1, by1, dt, glide);
      frame.x2 = approach(frame.x2, bx2, dt, glide); frame.y2 = approach(frame.y2, by2, dt, glide);
      frame.index = focus;
    }
    frame.alpha = approach(frame.alpha, focus >= 0 ? 1 : 0, dt, 0.1);

    glyphs.forEach(function (g, i) {
      var target = i === focus && i !== dragging ? 1 : 0;
      g.outline = approach(g.outline, target, dt, 0.09);
      if (Math.abs(g.outline - target) > 0.002) moving = true; else g.outline = target;
    });

    var hovering = focus >= 0 && pointer.inside;
    var nextCursor = dragging >= 0 ? "grabbing" : hovering ? "grab" : "";
    if (nextCursor !== cursor) { cursor = nextCursor; stage.style.cursor = nextCursor; }

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = "source-over"; ctx.globalAlpha = 1;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    glyphs.forEach(function (g) {                        // « fantôme » pointillé à la place d'origine d'une lettre déplacée
      var moved = Math.hypot(g.offset.x, g.offset.y);
      if (moved > 1) { ctx.globalAlpha = Math.min(1, moved / 24) * 0.55; blit(g.dashes, 0, 0); ctx.globalAlpha = 1; }
    });
    glyphs.forEach(function (g) {
      var o = g.outline;                                  // 0 = filigrane au repos, 1 = lettre survolée
      ctx.globalAlpha = WM_DASH + (1 - WM_DASH) * o;      // contour pointillé : tout le mot est un filigrane
      blit(g.dashes, g.offset.x, g.offset.y);
      ctx.globalAlpha = WM_FILL + (0.2 - WM_FILL) * o;    // remplissage très léger, un peu plus marqué sous le curseur
      blit(g.fill, g.offset.x, g.offset.y);
      ctx.globalAlpha = 1;
    });
    drawFrame();

    var settling = moving || kicks.length > 0 || (frame.alpha > 0.01 && frame.alpha < 0.99);
    if ((active || settling) && visible && alive) raf = requestAnimationFrame(tick);
  }

  /* ---- pointeur (ignore ce qui se passe sur un objet : il a ses propres gestes) */
  var locate = function (e) {
    var r = stage.getBoundingClientRect();
    pointer.x = e.clientX - r.left; pointer.y = e.clientY - r.top;
  };
  var onObj = function (e) { return e.target && e.target.closest && e.target.closest(".foot__obj"); };

  stage.addEventListener("pointermove", function (e) { locate(e); pointer.inside = true; wake(); }, { passive: true });
  stage.addEventListener("pointerenter", function (e) { locate(e); pointer.inside = true; wake(); }, { passive: true });
  stage.addEventListener("pointerleave", function () { if (dragging >= 0) return; pointer.inside = false; wake(); }, { passive: true });
  stage.addEventListener("pointerdown", function (e) {
    if (onObj(e)) return;
    locate(e); pointer.inside = true;
    var primary = e.pointerType !== "mouse" || e.button === 0;
    var index = primary ? glyphAt(pointer.x, pointer.y) : -1;
    press.x = pointer.x; press.y = pointer.y; press.time = performance.now(); press.index = index;
    if (index >= 0) {
      dragging = index;
      grab.x = pointer.x - glyphs[index].offset.x; grab.y = pointer.y - glyphs[index].offset.y;
      if (stage.setPointerCapture) { try { stage.setPointerCapture(e.pointerId); } catch (_) {} }
    }
    wake();
  }, { passive: true });
  var onUp = function (e) {
    if (dragging >= 0) {
      dragging = -1;
      if (stage.releasePointerCapture) { try { stage.releasePointerCapture(e.pointerId); } catch (_) {} }
      var r = stage.getBoundingClientRect();
      pointer.inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
    }
    if (e.type === "pointerup" && press.index >= 0 && CLICK_KICK && performance.now() - press.time < 450) {
      var rr = stage.getBoundingClientRect();
      if (Math.hypot(e.clientX - rr.left - press.x, e.clientY - rr.top - press.y) < 6) kick(press.index);
    }
    press.index = -1; wake();
  };
  stage.addEventListener("pointerup", onUp, { passive: true });
  stage.addEventListener("pointercancel", onUp, { passive: true });

  /* ================================================================== 2) OBJETS DÉPLAÇABLES */
  var oldW = 0, oldH = 0;    // taille de la scène lors du dernier placement
  var live = [];             // objets à l'écran
  var started = false, phoneSet = false, raf2 = 0, last2 = 0, zTop = 5;

  var applyTransform = function (o) {
    o.el.style.transform = "translate3d(" + o.x.toFixed(1) + "px," + o.y.toFixed(1) + "px,0) rotate(" + o.rot.toFixed(2) + "deg) scale(" + o.s.toFixed(3) + ")";
  };

  /* hauteur libre au-dessus du mot et échelle des objets, selon la place réellement disponible */
  var rig = function (w, h) {
    var mt = measure(w);
    var base = h - 6 - mt.desc;                       // ligne de base du mot
    var A = Math.max(1, base - 6), phone = w < 600;
    var ref = phone ? w * 1.15 : w * 0.3268;          // hauteur pour laquelle la disposition a été dessinée
    var Ae = phone ? A : Math.min(A, ref * 1.3);
    var r = Ae / ref;
    var ss = phone ? clamp(Math.sqrt(r), 0.8, 1.2) : (r < 1 ? Math.max(0.62, Math.pow(r, 0.85)) : Math.min(1.3, Math.sqrt(r)));
    return { base: base, A: Ae, ss: ss };
  };

  var makeSize = function (p, w, ss) {
    var u = objUnit(w) * p.k * ss, ratio = p.w / p.h;
    return ratio >= 1 ? { w: u, h: u / ratio } : { w: u * ratio, h: u };
  };

  /* place « d'origine » d'un objet : x en part de la largeur, y en part de la hauteur libre au-dessus du mot */
  var homeOf = function (p, sz, g) {
    return { x: clamp(p.cx * width - sz.w / 2, 0, Math.max(0, width - sz.w)),
             y: clamp(g.base - p.v * g.A - sz.h / 2, 0, Math.max(0, height - sz.h)) };
  };

  var spawn = function (batch) {
    var g = rig(width, height);
    batch.forEach(function (p, n) {
      var sz = makeSize(p, width, g.ss), hm = homeOf(p, sz, g);
      var o = { name: p.name, p: p, w: sz.w, h: sz.h, rot: p.rot, s: 1, vx: 0, vy: 0, drag: false, touched: false };
      o.rot0 = o.rot;
      o.x = hm.x; o.y = hm.y;
      var el = document.createElement("div");
      el.className = "foot__obj"; el.style.width = o.w.toFixed(1) + "px";
      var img = new Image();
      img.alt = ""; img.decoding = "async"; img.width = p.w; img.height = p.h; img.draggable = false;
      img.style.setProperty("--dur", (4.8 + (n % 4) * 0.7).toFixed(2) + "s");       // flottement : durées et décalages fixes
      img.style.setProperty("--del", (-(n * 1.1) % 6).toFixed(2) + "s");
      img.onerror = function () { removeObj(o, true); };
      img.src = BASE + p.name + ".webp";
      el.appendChild(img);
      o.el = el; o.img = img;
      applyTransform(o);
      layer.appendChild(el);
      live.push(o);
      bindDrag(o);
      if (!reduced && img.animate) {                     // apparition « pop » avec rebond
        img.animate([{ scale: 0, opacity: 0 }, { scale: 1, opacity: 1 }],
          { duration: 700, delay: n * 90, easing: "cubic-bezier(.34,1.56,.64,1)", fill: "backwards" });
      }
    });
  };

  var removeObj = function (o, now) {
    var i = live.indexOf(o); if (i >= 0) live.splice(i, 1);
    if (o.el.parentNode) o.el.parentNode.removeChild(o.el);
  };

  var startCycle = function () {
    if (started || !layer) return; started = true;
    var sz = fitStage(); width = sz.w; height = sz.h;      // les dimensions doivent être connues avant de placer les objets
    oldW = width; oldH = height;
    phoneSet = width < 600;
    spawn(setFor(width));
  };

  /* ---- glisser-déposer + inertie + rebond sur les parois */
  function bindDrag(o) {
    var el = o.el;
    el.addEventListener("pointerdown", function (e) {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      e.preventDefault(); e.stopPropagation();
      var r = layer.getBoundingClientRect();
      o.drag = true; o.touched = true; el.classList.add("is-drag"); el.style.zIndex = String(++zTop);
      o.gx = e.clientX - r.left - o.x; o.gy = e.clientY - r.top - o.y;
      o.tx = o.x; o.ty = o.y; o.vx = 0; o.vy = 0;
      o.px = e.clientX; o.py = e.clientY; o.pt = performance.now();
      try { el.setPointerCapture(e.pointerId); } catch (_) {}
      wake2();
    });
    el.addEventListener("pointermove", function (e) {
      if (!o.drag) return;
      var r = layer.getBoundingClientRect();
      o.tx = clamp(e.clientX - r.left - o.gx, 0, Math.max(0, width - o.w));
      o.ty = clamp(e.clientY - r.top - o.gy, 0, Math.max(0, height - o.h));
      var now = performance.now(), dt = Math.max(1, now - o.pt) / 1000;
      o.vx = o.vx * 0.6 + ((e.clientX - o.px) / dt) * 0.4;   // vitesse lissée pour le lancer
      o.vy = o.vy * 0.6 + ((e.clientY - o.py) / dt) * 0.4;
      o.px = e.clientX; o.py = e.clientY; o.pt = now;
      wake2();
    });
    var end = function (e) {
      if (!o.drag) return;
      o.drag = false; el.classList.remove("is-drag");
      try { el.releasePointerCapture(e.pointerId); } catch (_) {}
      if (performance.now() - o.pt > 90 || reduced) { o.vx = 0; o.vy = 0; }       // posé, pas lancé
      else { o.vx = clamp(o.vx, -1800, 1800); o.vy = clamp(o.vy, -1800, 1800); }
      wake2();
    };
    el.addEventListener("pointerup", end);
    el.addEventListener("pointercancel", end);
    el.addEventListener("dragstart", function (e) { e.preventDefault(); });
  }

  function wake2() { if (raf2) return; last2 = performance.now(); raf2 = requestAnimationFrame(step); }

  function step(now) {
    raf2 = 0;
    var dt = Math.min(0.05, Math.max(0.001, (now - last2) / 1000)); last2 = now;
    var moving = false, W = width, H = height;
    live.forEach(function (o) {
      var maxX = Math.max(0, W - o.w), maxY = Math.max(0, H - o.h);
      if (o.drag) {
        o.x = approach(o.x, o.tx, dt, 0.04); o.y = approach(o.y, o.ty, dt, 0.04);
        o.rot = approach(o.rot, o.rot0 + clamp(o.vx / 70, -14, 14), dt, 0.12);   // s'incline dans le sens du geste
        o.s = approach(o.s, 1.08, dt, 0.1); moving = true;
      } else {
        if (Math.abs(o.vx) > 8 || Math.abs(o.vy) > 8) {
          o.x += o.vx * dt; o.y += o.vy * dt;
          var f = Math.exp(-dt * 2.6); o.vx *= f; o.vy *= f;
          if (o.x < 0) { o.x = 0; o.vx = Math.abs(o.vx) * 0.6; } else if (o.x > maxX) { o.x = maxX; o.vx = -Math.abs(o.vx) * 0.6; }
          if (o.y < 0) { o.y = 0; o.vy = Math.abs(o.vy) * 0.6; } else if (o.y > maxY) { o.y = maxY; o.vy = -Math.abs(o.vy) * 0.6; }
          o.rot += o.vx * dt * 0.05; o.rot0 = o.rot; moving = true;
        } else { o.vx = 0; o.vy = 0; o.rot0 = o.rot; }
        if (Math.abs(o.s - 1) > 0.002) { o.s = approach(o.s, 1, dt, 0.12); moving = true; } else o.s = 1;
      }
      applyTransform(o);
    });
    if (moving) raf2 = requestAnimationFrame(step);
  }

  /* la scène change de taille : les objets non déplacés reprennent leur place d'origine, ceux que la personne a déplacés gardent leur place relative */
  function objsResize() {
    if (started && (width < 600) !== phoneSet && !live.some(function (o) { return o.drag; })) {
      phoneSet = width < 600;
      live.slice().forEach(function (o) { removeObj(o, true); });
      spawn(setFor(width));
    } else if (oldW && oldH && live.length) {
      var kx = width / oldW, ky = height / oldH, g = rig(width, height);
      live.forEach(function (o) {
        var sz = makeSize(o.p, width, g.ss);
        o.w = sz.w; o.h = sz.h; o.el.style.width = o.w.toFixed(1) + "px";
        if (o.touched || o.drag) {
          o.x = clamp(o.x * kx, 0, Math.max(0, width - o.w)); o.y = clamp(o.y * ky, 0, Math.max(0, height - o.h));
        } else {
          var hm = homeOf(o.p, sz, g);
          o.x = hm.x; o.y = hm.y; o.vx = 0; o.vy = 0;
        }
        applyTransform(o);
      });
    }
    oldW = width; oldH = height;
  }

  /* ================================================================== démarrage */
  var markDirty = function () { sizeDirty = true; layoutKey = ""; wake(); };

  if ("ResizeObserver" in window) {
    new ResizeObserver(function () { if (Math.round(stage.clientWidth) !== Math.round(width) || (layer && Math.round(stage.clientHeight) !== Math.round(height))) markDirty(); }).observe(stage);
  } else window.addEventListener("resize", markDirty, { passive: true });

  if (document.fonts) {
    document.fonts.load(WEIGHT + " 100px Urbanist", TEXT).then(function () { fontsReady = true; markDirty(); }, function () { fontsReady = true; markDirty(); });
    document.fonts.ready.then(function () { fontsReady = true; markDirty(); });
  }

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (es) {
      visible = es[0].isIntersecting;
      if (visible) { startCycle(); markDirty(); }
    }, { rootMargin: "240px 0px" }).observe(stage);
  } else { visible = true; startCycle(); markDirty(); }

  window.addEventListener("pagehide", function () { alive = false; });
  }

  Array.prototype.forEach.call(document.querySelectorAll("[data-foot-fx]"), mount);
})();
