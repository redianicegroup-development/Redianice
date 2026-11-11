/* Galerie « gravity » (WebGL2) pour la page Mon E-Carnet.
   Adaptée du carrousel fourni (webgl_carousel_20_variants), préréglage « gravity » : les cartes passent dans une lentille
   qui courbe l'image et sépare légèrement les couleurs, avec ressort au glisser, au clic et à la molette horizontale.
   Aucune bibliothèque externe : une petite couche WebGL2 (ci-dessous) remplace OGL.
   API : RediGravity.mount(hôte, [{ src, alt, title, subtitle }], { label, onLost }) -> { step, goTo, setAutoplay, destroy } ou null. */
(function () {
  "use strict";

  // ---------- Réglages ----------
  var GRAVITY = { lensWidth: 0.8, lensHeight: 1.1, tilt: -40, roundness: 0.9, bend: -0.4, reach: 0.5, curl: "fall", dispersion: 0.4, liquid: 0.5, followCursor: false };
  var TAPS = 12;
  var PIXEL_BUDGET = 4.5e6;
  var INTRO_DURATION = { rise: 2.1, fade: 0.35 };

  var wrap = function (value, size) { return ((((value + size / 2) % size) + size) % size) - size / 2; };
  var clamp01 = function (v) { return Math.min(Math.max(v, 0), 1); };
  var easeOut = function (v) { return 1 - Math.pow(1 - clamp01(v), 3); };
  var easeOutQuint = function (v) { return 1 - Math.pow(1 - clamp01(v), 5); };
  var easeInOut = function (v) { var t = clamp01(v); return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };

  // ---------- Shaders ----------
  var cardVertex = `#version 300 es
in vec3 position;
in vec2 uv;
uniform vec4 uRect;
uniform vec2 uResolution;
out vec2 vUv;
out vec2 vLocal;
void main() {
  vUv = uv;
  vLocal = vec2(position.x, -position.y) * uRect.zw;
  vec2 px = uRect.xy + vLocal;
  gl_Position = vec4(px.x / uResolution.x * 2.0 - 1.0, 1.0 - px.y / uResolution.y * 2.0, 0.0, 1.0);
}
`;

  var cardFragment = `#version 300 es
precision highp float;
uniform sampler2D tMap;
uniform vec2 uSize;
uniform vec2 uImage;
uniform float uRadius;
uniform float uAlpha;
uniform float uReady;
uniform float uShift;
uniform float uDpr;
uniform vec3 uPlaceholder;
in vec2 vUv;
in vec2 vLocal;
out vec4 fragColor;

float roundedBox(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

void main() {
  float sd = roundedBox(vLocal, uSize * 0.5, min(uRadius, min(uSize.x, uSize.y) * 0.5));
  float mask = clamp(0.5 - sd * uDpr, 0.0, 1.0);
  vec2 local = vLocal / uSize + 0.5;
  float cardAspect = uSize.x / uSize.y;
  float imageAspect = uImage.x / max(uImage.y, 1.0);
  vec2 scale = imageAspect > cardAspect ? vec2(cardAspect / imageAspect, 1.0) : vec2(1.0, imageAspect / cardAspect);
  scale /= 1.08;
  vec2 uv = vec2(local.x, 1.0 - local.y);
  uv = (uv - 0.5) * scale + 0.5;
  uv.x += uShift * (1.0 - scale.x) * 0.5;
  vec3 image = texture(tMap, uv).rgb;
  vec3 color = mix(uPlaceholder, image, uReady);
  float alpha = mask * uAlpha;
  fragColor = vec4(color * alpha, alpha);
}
`;

  var lensVertex = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

  var lensFragment = `#version 300 es
precision highp float;
uniform sampler2D tScene;
uniform vec2 uResolution;
uniform float uDpr;
uniform vec2 uCenter;
uniform vec2 uHalf;
uniform float uAngle;
uniform float uExponent;
uniform float uInner;
uniform float uOuter;
uniform float uFlow;
uniform float uCurl;
uniform float uDispersion;
uniform float uStrength;
uniform float uSceneAlpha;
out vec4 fragColor;

void main() {
  vec2 frag = gl_FragCoord.xy / uDpr;
  vec2 uv = frag / uResolution;
  vec2 rel = frag - vec2(uCenter.x, uResolution.y - uCenter.y);
  float ca = cos(uAngle);
  float sa = sin(uAngle);
  vec2 local = vec2(ca * rel.x + sa * rel.y, -sa * rel.x + ca * rel.y);
  vec2 k = max(abs(local) / uHalf, vec2(1e-5));
  float nd = pow(pow(k.x, uExponent) + pow(k.y, uExponent), 1.0 / uExponent);
  vec2 grad = pow(k, vec2(uExponent - 1.0)) * sign(local) / uHalf * pow(nd, 1.0 - uExponent);
  float glen = max(length(grad), 1e-6);
  float edge = (nd - 1.0) / glen;
  vec2 outward = grad / glen;
  vec2 normal = vec2(ca * outward.x - sa * outward.y, sa * outward.x + ca * outward.y);
  vec2 along = vec2(-normal.y, normal.x);

  float t = clamp((edge + uInner) / (uInner + uOuter), 0.0, 1.0);
  float ramp = t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
  float slope = 16.0 * t * t * (1.0 - t) * (1.0 - t);
  float reachX = rel.x / (uResolution.x * 0.5);
  float side = smoothstep(0.02, 0.3, abs(reachX)) * (uCurl == 0.0 ? sign(reachX) : uCurl);
  float lift = ramp * side * uFlow * uStrength;
  vec2 swirl = along * along.y * side * slope * uFlow * uStrength * 0.35;
  vec2 drift = vec2(0.0, -lift) - swirl;
  vec2 shifted = uv + drift / uResolution;

  vec2 texels = uResolution * uDpr;
  vec2 gx = dFdx(shifted);
  vec2 gy = dFdy(shifted);
  gx *= min(1.0, 3.0 / max(length(gx * texels), 1e-4));
  gy *= min(1.0, 3.0 / max(length(gy * texels), 1e-4));

  vec4 color = textureGrad(tScene, shifted, gx, gy);
  vec2 spread = vec2(0.0, side * slope * uFlow * uStrength) / uResolution * uDispersion;
  float spreadPx = length(spread * texels);
  if (color.a > 0.002 && spreadPx > 0.25) {
    vec3 base = color.rgb / color.a;
    vec3 sumColor = vec3(0.0);
    vec3 sumWeight = vec3(0.0);
    for (int i = 0; i < ${TAPS}; i++) {
      float s = (float(i) + 0.5) / float(${TAPS});
      vec4 c = textureGrad(tScene, shifted + spread * (s - 0.5), gx, gy);
      vec3 w = max(1.0 - abs(vec3(s) - vec3(0.15, 0.5, 0.85)) * 2.6, 0.0) * c.a;
      sumColor += c.rgb * (w / max(c.a, 0.002));
      sumWeight += w;
    }
    vec3 split = mix(base, sumColor / max(sumWeight, vec3(1e-4)), clamp(sumWeight * 2.0, 0.0, 1.0));
    color.rgb = mix(color.rgb, clamp(split, 0.0, 1.0) * color.a, smoothstep(0.25, 1.5, spreadPx));
  }

  fragColor = color * uSceneAlpha;
}
`;

  // ---------- Petite couche WebGL2 (programme, géométrie, textures, cible de rendu) ----------
  function compile(gl, type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { var log = gl.getShaderInfoLog(s); gl.deleteShader(s); throw new Error(log || "shader"); }
    return s;
  }

  function makeProgram(gl, vs, fs, uniforms, blend) {
    var p = gl.createProgram();
    gl.attachShader(p, compile(gl, gl.VERTEX_SHADER, vs));
    gl.attachShader(p, compile(gl, gl.FRAGMENT_SHADER, fs));
    gl.bindAttribLocation(p, 0, "position");
    gl.bindAttribLocation(p, 1, "uv");
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p) || "link");
    var list = [], n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
    for (var i = 0; i < n; i++) {
      var info = gl.getActiveUniform(p, i);
      list.push({ name: info.name, type: info.type, loc: gl.getUniformLocation(p, info.name) });
    }
    return { p: p, list: list, uniforms: uniforms, blend: blend };
  }

  function makeGeometry(gl, kind) {
    var vao = gl.createVertexArray(), buf = gl.createBuffer();
    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    var geo;
    if (kind === "triangle") {
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      geo = { vao: vao, mode: gl.TRIANGLES, count: 3 };
    } else {
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        -0.5, -0.5, 0, 0, 0,
        0.5, -0.5, 0, 1, 0,
        -0.5, 0.5, 0, 0, 1,
        0.5, 0.5, 0, 1, 1
      ]), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 20, 0);
      gl.enableVertexAttribArray(1);
      gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 20, 12);
      geo = { vao: vao, mode: gl.TRIANGLE_STRIP, count: 4 };
    }
    gl.bindVertexArray(null);
    geo.buf = buf;
    return geo;
  }

  function makeTexture(gl, aniso) {
    var t = { tex: gl.createTexture() };
    gl.bindTexture(gl.TEXTURE_2D, t.tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    if (aniso) gl.texParameterf(gl.TEXTURE_2D, aniso.TEXTURE_MAX_ANISOTROPY_EXT, 8);
    return t;
  }

  function blankTexture(gl, t) {
    gl.bindTexture(gl.TEXTURE_2D, t.tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(4));
    gl.generateMipmap(gl.TEXTURE_2D);
  }

  function uploadImage(gl, t, image) {
    gl.bindTexture(gl.TEXTURE_2D, t.tex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.generateMipmap(gl.TEXTURE_2D);
  }

  function makeTarget(gl) {
    var tgt = { texture: makeTexture(gl, null), fbo: gl.createFramebuffer(), w: 0, h: 0 };
    tgt.setSize = function (w, h) {
      if (tgt.w === w && tgt.h === h) return;
      tgt.w = w; tgt.h = h;
      gl.bindTexture(gl.TEXTURE_2D, tgt.texture.tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      gl.bindFramebuffer(gl.FRAMEBUFFER, tgt.fbo);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tgt.texture.tex, 0);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    };
    return tgt;
  }

  function drawMesh(gl, mesh, target, clear) {
    if (target) { gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo); gl.viewport(0, 0, target.w, target.h); }
    else { gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.viewport(0, 0, gl.canvas.width, gl.canvas.height); }
    if (clear) gl.clear(gl.COLOR_BUFFER_BIT);
    var pr = mesh.program;
    gl.useProgram(pr.p);
    if (pr.blend) { gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA); } else gl.disable(gl.BLEND);
    var unit = 0;
    for (var i = 0; i < pr.list.length; i++) {
      var u = pr.list[i], slot = pr.uniforms[u.name];
      if (!slot || !u.loc) continue;
      var v = slot.value;
      if (u.type === gl.FLOAT) gl.uniform1f(u.loc, v);
      else if (u.type === gl.FLOAT_VEC2) gl.uniform2fv(u.loc, v);
      else if (u.type === gl.FLOAT_VEC3) gl.uniform3fv(u.loc, v);
      else if (u.type === gl.FLOAT_VEC4) gl.uniform4fv(u.loc, v);
      else if (u.type === gl.SAMPLER_2D) {
        gl.activeTexture(gl.TEXTURE0 + unit);
        gl.bindTexture(gl.TEXTURE_2D, v.tex);
        gl.uniform1i(u.loc, unit);
        unit++;
      }
    }
    gl.bindVertexArray(mesh.geo.vao);
    gl.drawArrays(mesh.geo.mode, 0, mesh.geo.count);
    gl.bindVertexArray(null);
  }

  // ---------- Carrousel ----------
  function create(host, items, options) {
    var canvas = document.createElement("canvas");
    var gl = null;
    try { gl = canvas.getContext("webgl2", { alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false }); } catch (e) { gl = null; }
    if (!gl || !items.length) return null;

    var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var S = {
      cardHeight: 0.54, gap: 12, radius: 20, squeeze: 0.2, interval: 3.5, autoplay: !reducedMotion, focusOnClick: true, captureWheel: false,
      lensWidth: GRAVITY.lensWidth, lensHeight: GRAVITY.lensHeight, tilt: GRAVITY.tilt, roundness: GRAVITY.roundness, bend: GRAVITY.bend,
      reach: GRAVITY.reach, curl: GRAVITY.curl, dispersion: GRAVITY.dispersion, liquid: GRAVITY.liquid, followCursor: GRAVITY.followCursor
    };

    var container = document.createElement("div");
    container.className = "gv";
    container.setAttribute("role", "region");
    container.setAttribute("aria-roledescription", "carrousel");
    container.setAttribute("aria-label", options.label || "Galerie d'images");
    container.tabIndex = 0;
    container.style.setProperty("--gv-half", (Math.min(Math.max(S.cardHeight, 0.05), 1) * 50) + "%");
    host.appendChild(container);

    var captionEl = document.createElement("div");
    captionEl.className = "gv__caption";
    captionEl.setAttribute("aria-hidden", "true");
    captionEl.style.display = "none";
    var titleEl = document.createElement("span"); titleEl.className = "gv__title";
    var countEl = document.createElement("span"); countEl.className = "gv__count";
    captionEl.appendChild(titleEl); captionEl.appendChild(countEl);
    container.appendChild(captionEl);

    var liveEl = document.createElement("div");
    liveEl.className = "gv__live";
    liveEl.setAttribute("aria-live", "polite");
    liveEl.setAttribute("aria-atomic", "true");
    container.appendChild(liveEl);

    gl.clearColor(0, 0, 0, 0);
    canvas.style.display = "block";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.setAttribute("aria-hidden", "true");
    container.insertBefore(canvas, container.firstChild);

    var anisotropy = gl.getExtension("EXT_texture_filter_anisotropic");
    var cardProgram, cardMesh, lensMesh, lensUniforms, target;
    try {
      var cardUniforms = {
        tMap: { value: null }, uRect: { value: [0, 0, 1, 1] }, uResolution: { value: [1, 1] }, uSize: { value: [1, 1] }, uImage: { value: [1, 1] },
        uRadius: { value: S.radius }, uAlpha: { value: 1 }, uReady: { value: 0 }, uShift: { value: 0 }, uDpr: { value: 1 }, uPlaceholder: { value: [0.5, 0.5, 0.5] }
      };
      cardProgram = makeProgram(gl, cardVertex, cardFragment, cardUniforms, true);
      cardMesh = { program: cardProgram, geo: makeGeometry(gl, "plane") };
      target = makeTarget(gl);
      lensUniforms = {
        tScene: { value: target.texture }, uResolution: { value: [1, 1] }, uDpr: { value: 1 }, uCenter: { value: [0, 0] }, uHalf: { value: [1, 1] },
        uAngle: { value: 0 }, uExponent: { value: 2 }, uInner: { value: 60 }, uOuter: { value: 80 }, uFlow: { value: 0 }, uCurl: { value: 0 },
        uDispersion: { value: 0 }, uStrength: { value: 0 }, uSceneAlpha: { value: 0 }
      };
      lensMesh = { program: makeProgram(gl, lensVertex, lensFragment, lensUniforms, false), geo: makeGeometry(gl, "triangle") };
    } catch (err) {
      if (window.console) console.warn("Galerie WebGL indisponible :", err && err.message);
      host.removeChild(container);
      return null;
    }
    var cardUni = cardProgram.uniforms;

    var slots = [], width = 1, height = 1, dpr = 1;
    var pos = 0, vel = 0, goal = 0, mode = "spring", wheelAt = 0, raf = 0, last = performance.now();
    var visible = true, alive = true, dirty = true, activeIndex = -1, interactedAt = -Infinity, autoplayAt = performance.now();
    var hasFocus = false, deform = 0, deformVel = 0, layout = null, resnap = false, hover = "", lift = 1, energy = 0, lastPos = 0;
    var lens = { x: 0, y: 0, vx: 0, vy: 0, ready: false };
    var pointer = { x: 0, y: 0, over: false, down: false, id: -1, startX: 0, startY: 0, startPos: 0, dragging: false, touch: false, samples: [] };
    var introState = { kind: "none", t: 0, running: false, done: false, readyAt: 0 };
    var focus = { index: -1, pending: -1, t: 0, v: 0, target: 0 };
    var instances = [];
    var resizePending = false;

    function updateUI(idx, announce) {
      var item = items[idx] || items[0];
      if (!item) return;
      titleEl.textContent = "";
      titleEl.appendChild(document.createTextNode(item.title || item.alt || ""));
      if (item.subtitle) {
        var sub = document.createElement("span");
        sub.className = "gv__subtitle";
        sub.textContent = item.subtitle;
        titleEl.appendChild(sub);
      }
      titleEl.style.animation = "none"; void titleEl.offsetWidth; titleEl.style.animation = "";
      var a = String(idx + 1); if (a.length < 2) a = "0" + a;
      var tot = String(items.length); if (tot.length < 2) tot = "0" + tot;
      var reel = "";
      for (var n = 0; n < 10; n++) reel += "<span>" + n + "</span>";
      var digits = "";
      for (var d = 0; d < a.length; d++) digits += '<span class="gv__digit"><span class="gv__reel" style="transform:translateY(' + (-Number(a.charAt(d)) * 10) + '%)">' + reel + "</span></span>";
      countEl.innerHTML = '<span class="gv__digits">' + digits + '</span><span class="gv__slash">/</span><span>' + tot + "</span>";
      if (focus.target > 0) countEl.setAttribute("data-hidden", ""); else countEl.removeAttribute("data-hidden");
      if (announce) liveEl.textContent = (item.title || item.alt || "Image " + (idx + 1)) + ", " + (idx + 1) + " sur " + items.length + (item.alt ? ". " + item.alt : "");
    }

    function loadSlot(item, index) {
      var texture = makeTexture(gl, anisotropy);
      blankTexture(gl, texture);
      var slot = { item: item, index: index, texture: texture, aspect: 0.8, loaded: false, failed: false, ready: 0, color: [0.5, 0.5, 0.5], image: [1, 1], dispose: function () {} };
      var image = new Image();
      image.crossOrigin = "anonymous";
      image.decoding = "async";
      image.onload = function () {
        if (!alive) return;
        uploadImage(gl, texture, image);
        slot.image = [image.naturalWidth || 1, image.naturalHeight || 1];
        slot.aspect = slot.image[0] / slot.image[1];
        try {
          var probe = document.createElement("canvas");
          probe.width = 8; probe.height = 8;
          var ctx = probe.getContext("2d", { willReadFrequently: true });
          if (ctx) {
            ctx.drawImage(image, 0, 0, 8, 8);
            var data = ctx.getImageData(0, 0, 8, 8).data, avg = [0, 0, 0];
            for (var i = 0; i < data.length; i += 4) { avg[0] += data[i]; avg[1] += data[i + 1]; avg[2] += data[i + 2]; }
            slot.color = avg.map(function (v) { return v / 64 / 255; });
          }
        } catch (e) { slot.color = [0.5, 0.5, 0.5]; }
        slot.loaded = true; dirty = true; start();
      };
      image.onerror = function () { if (!alive) return; slot.failed = true; dirty = true; start(); };
      image.src = item.src;
      slot.dispose = function () { image.onload = null; image.onerror = null; gl.deleteTexture(texture.tex); };
      return slot;
    }

    function metrics(s) {
      var cardH = Math.max(24, s.cardHeight * height);
      var widths = slots.map(function (slot) { return slot.aspect * cardH; });
      var centers = [], cursor = 0;
      for (var i = 0; i < widths.length; i++) { centers.push(cursor + widths[i] / 2); cursor += widths[i] + s.gap; }
      return { cardH: cardH, widths: widths, centers: centers, gap: s.gap, loop: Math.max(cursor, 1) };
    }
    function nearest(m, at) {
      var best = 0, bestDist = Infinity;
      for (var i = 0; i < m.centers.length; i++) {
        var dist = Math.abs(wrap(m.centers[i] - at, m.loop));
        if (dist < bestDist) { bestDist = dist; best = i; }
      }
      return best;
    }
    function snapPoint(m, at) { var i = nearest(m, at); return at + wrap(m.centers[i] - at, m.loop); }
    function remap(from, to, at) {
      var i = nearest(from, at), offset = wrap(at - from.centers[i], from.loop);
      var cycles = Math.round((at - offset - from.centers[i]) / from.loop);
      return cycles * to.loop + to.centers[i] + offset * (to.widths[i] / from.widths[i]);
    }
    function step(m, delta) {
      var at = snapPoint(m, goal), index = nearest(m, at), n = m.centers.length;
      for (var k = 0; k < Math.abs(delta); k++) {
        var next = (index + (delta > 0 ? 1 : n - 1)) % n;
        var distance = delta > 0 ? m.widths[index] / 2 + m.gap + m.widths[next] / 2 : -(m.widths[next] / 2 + m.gap + m.widths[index] / 2);
        at += distance; index = next;
      }
      goal = at; mode = "spring"; dirty = true; start();
    }
    function goTo(m, index) {
      var i = ((index % m.centers.length) + m.centers.length) % m.centers.length;
      goal = goal + wrap(m.centers[i] - goal, m.loop);
      mode = "spring"; dirty = true; start();
    }
    function openFocus(index) {
      focus.index = index; focus.pending = -1; focus.target = 1;
      countEl.setAttribute("data-hidden", ""); dirty = true; start();
    }
    function closeFocus() {
      focus.pending = -1;
      if (focus.target === 0) return false;
      focus.target = 0; countEl.removeAttribute("data-hidden"); dirty = true; start();
      return true;
    }
    function skipIntro() { if (introState.running) introState.t = 1; }

    function introEffects() {
      var t = introState.running ? introState.t : introState.done ? 1 : 0;
      var e = { sceneAlpha: 1, strength: 1, card: null };
      if (!introState.done && !introState.running) { e.sceneAlpha = 0; e.strength = 0; return e; }
      if (t >= 1) return e;
      if (introState.kind === "rise") {
        e.strength = easeInOut((t - 0.3) / 0.65);
        e.card = function (rel) {
          var delay = Math.min(Math.abs(rel) / (width * 0.6), 1) * 0.34;
          var local = clamp01((t - delay) / 0.6);
          return { alpha: clamp01(local * 4), x: 0, y: (1 - easeOutQuint(local)) * height * 0.62, scale: 0.5 + 0.5 * easeInOut((local - 0.18) / 0.82) };
        };
      } else { e.sceneAlpha = easeOut(t); e.strength = easeOut(t); }
      return e;
    }
    function beginIntro() {
      introState.kind = reducedMotion ? "fade" : "rise";
      introState.running = true; introState.done = false; introState.t = 0;
    }

    function applyResize() {
      width = Math.max(1, container.clientWidth);
      height = Math.max(1, container.clientHeight);
      dpr = Math.min(window.devicePixelRatio || 1, 2, Math.sqrt(PIXEL_BUDGET / (width * height)));
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      target.setSize(Math.max(2, Math.round(width * dpr)), Math.max(2, Math.round(height * dpr)));
      dirty = true;
    }
    function resize() { resizePending = true; start(); }

    function frame(now) {
      raf = 0;
      if (resizePending) { resizePending = false; applyResize(); }
      if (!alive) return;
      var s = S;
      var dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000));
      last = now;
      if (!slots.length) { if (visible) raf = requestAnimationFrame(frame); return; }

      var m = metrics(s), n = slots.length, animating = false;

      if (resnap) { goal = snapPoint(m, goal); pos = goal; vel = 0; resnap = false; }
      else if (layout && layout.loop !== m.loop) {
        pos = remap(layout, m, pos); goal = remap(layout, m, goal);
        pointer.startPos = pos + (pointer.x - pointer.startX);
        animating = true;
      }
      layout = m;

      if (!introState.running && !introState.done) {
        var allSettled = slots.every(function (slot) { return slot.loaded || slot.failed; });
        if (allSettled || now - introState.readyAt > 3500) { goal = snapPoint(m, goal); pos = goal; beginIntro(); }
      }
      if (introState.running) {
        introState.t = Math.min(1, introState.t + dt / (INTRO_DURATION[introState.kind] || 1));
        if (introState.t >= 1) { introState.running = false; introState.done = true; captionEl.style.display = "flex"; }
        animating = true;
      }

      if (mode === "wheel" && now - wheelAt > 150) { goal = snapPoint(m, goal); mode = "spring"; }
      if (!pointer.dragging) {
        var stiffness = mode === "wheel" ? 80 : 55, damping = 2 * Math.sqrt(stiffness);
        var steps = Math.ceil(dt / (1 / 240)), h = dt / steps;
        for (var si = 0; si < steps; si++) {
          var acc = stiffness * (goal - pos) - damping * vel;
          vel += acc * h; pos += vel * h;
        }
        if (Math.abs(goal - pos) < 0.05 && Math.abs(vel) < 0.5) { pos = goal; vel = 0; } else animating = true;
      } else animating = true;

      if (Math.abs(pos) > m.loop * 8) {
        var shift = Math.round(pos / m.loop) * m.loop;
        pos -= shift; goal -= shift; pointer.startPos -= shift;
      }

      var current = nearest(m, pos);
      if (current !== activeIndex) {
        activeIndex = current;
        updateUI(current, hasFocus || now - interactedAt < 3000);
      }

      if (focus.pending >= 0 && mode === "spring" && Math.abs(goal - pos) < 1.5 && Math.abs(vel) < 30) {
        if (current === focus.pending) openFocus(current); else focus.pending = -1;
      }

      // Lecture automatique : s'arrête au survol, au focus, pendant une interaction ou quand le visiteur la met en pause
      if (s.autoplay && !reducedMotion && introState.done && focus.target === 0 && focus.t < 0.01 && !pointer.over && !pointer.down && !hasFocus &&
        mode === "spring" && Math.abs(goal - pos) < 1 && now - interactedAt > 2000 && now - autoplayAt > s.interval * 1000) {
        autoplayAt = now; step(m, 1);
      }
      if (s.autoplay && !reducedMotion) animating = true;

      var travel = Math.abs(pos - lastPos) / dt;
      lastPos = pos;
      var energyTarget = reducedMotion ? 0 : Math.min(travel / 2600, 1);
      energy += (energyTarget - energy) * (1 - Math.exp(-dt / (energyTarget > energy ? 0.07 : 0.35)));
      if (energy > 0.001) animating = true;
      var liquidAmount = reducedMotion ? 0 : s.liquid;
      var push = Math.max(-1, Math.min(1, vel / 2200));
      var deformStiffness = 120, deformDamping = 2 * Math.sqrt(deformStiffness) * 0.32;
      deformVel += (deformStiffness * (push - deform) - deformDamping * deformVel) * dt;
      deform += deformVel * dt;
      if (Math.abs(deform) > 0.0005 || Math.abs(deformVel) > 0.005) animating = true;

      var focusStiffness = 64;
      focus.v += (focusStiffness * (focus.target - focus.t) - 2 * Math.sqrt(focusStiffness) * focus.v) * dt;
      focus.t += focus.v * dt;
      if (Math.abs(focus.target - focus.t) < 0.0005 && Math.abs(focus.v) < 0.001) { focus.t = focus.target; focus.v = 0; } else animating = true;
      var focusAmount = clamp01(focus.t), focusEase = easeInOut(focusAmount);
      var focusW = focus.index >= 0 && focus.index < n ? m.widths[focus.index] : m.cardH;
      var focusScale = Math.max(1, Math.min(1.3, (height * 0.84) / m.cardH, (width * 0.92) / focusW));
      var nextLift = 1 + (focusScale - 1) * focusEase;
      if (Math.abs(nextLift - lift) > 0.0005) { lift = nextLift; container.style.setProperty("--gv-lift", lift.toFixed(4)); }

      var effects = introEffects();

      var homeX = width / 2, homeY = height / 2;
      var follow = s.followCursor && pointer.over && !pointer.dragging && !pointer.touch && focus.target === 0;
      var aimX = follow ? pointer.x : homeX, aimY = follow ? pointer.y : homeY;
      if (!lens.ready) { lens.x = homeX; lens.y = homeY; lens.ready = true; }
      var lensK = 110, lensC = 2 * Math.sqrt(lensK) * 0.8;
      lens.vx += (lensK * (aimX - lens.x) - lensC * lens.vx) * dt;
      lens.vy += (lensK * (aimY - lens.y) - lensC * lens.vy) * dt;
      lens.x += lens.vx * dt; lens.y += lens.vy * dt;
      if (Math.abs(aimX - lens.x) + Math.abs(aimY - lens.y) > 0.2 || Math.abs(lens.vx) + Math.abs(lens.vy) > 0.5) animating = true;

      var cardH = m.cardH;
      // Taille de la lentille : celle de l'exemple (relative à la largeur) ; sur écran étroit elle s'élargit pour que la carte centrale reste lisible
      var ref = Math.max(width, height * 1.3), refK = width / ref;
      var halfW = (s.lensWidth * ref) / 2, halfH = (s.lensHeight * ref) / 2;
      var squash = Math.abs(deform) * liquidAmount;
      halfW *= 1 + squash * 0.16; halfH *= 1 - squash * 0.08;
      var lensX = lens.x - deform * 14 * liquidAmount;

      for (var i = 0; i < n; i++) {
        var sl = slots[i];
        if (sl.loaded && sl.ready < 1) { sl.ready = Math.min(1, sl.ready + dt / 0.45); animating = true; }
      }

      var waiting = !introState.done;
      if (dirty || animating || pointer.dragging) {
        dirty = false;
        instances = [];
        cardUni.uResolution.value = [width, height];
        cardUni.uDpr.value = dpr;
        cardUni.uRadius.value = s.radius;
        var shrink = 1 - clamp01(s.squeeze) * energy;
        var draws = [];
        for (var j = 0; j < n; j++) {
          var w = m.widths[j], baseRel = wrap(m.centers[j] - pos, m.loop);
          for (var k = -3; k <= 3; k++) {
            var rel = baseRel + k * m.loop;
            if (Math.abs(rel) - w / 2 > width + 40) continue;
            var fx = effects.card ? effects.card(rel) : null;
            var x = homeX + rel + (fx ? fx.x : 0);
            var scale = shrink * (fx ? fx.scale : 1);
            var alpha = fx ? fx.alpha : 1;
            if (focusAmount > 0) {
              if (j === focus.index && Math.abs(rel) < w) scale *= 1 + (focusScale - 1) * focusEase;
              else {
                var order = Math.min(Math.abs(rel) / width, 1) * 0.25;
                var part = easeInOut(focusAmount * 1.25 - order);
                x += (rel < 0 ? -1 : rel > 0 ? 1 : 0) * part * width * 0.7;
                alpha *= 1 - part;
              }
            }
            var cw = w * scale;
            if (alpha <= 0.001 || x + cw / 2 < -40 || x - cw / 2 > width + 40) continue;
            draws.push({ i: j, rel: rel, x: x, y: homeY + (fx ? fx.y : 0), cw: cw, ch: cardH * scale, alpha: alpha });
          }
        }
        draws.sort(function (a, b) { return Math.abs(b.rel) - Math.abs(a.rel); });
        var first = true;
        for (var d = 0; d < draws.length; d++) {
          var dr = draws[d], slot = slots[dr.i];
          cardUni.tMap.value = slot.texture;
          cardUni.uRect.value = [dr.x, dr.y, dr.cw + 2, dr.ch + 2];
          cardUni.uSize.value = [dr.cw, dr.ch];
          cardUni.uImage.value = slot.image;
          cardUni.uAlpha.value = dr.alpha;
          cardUni.uReady.value = slot.ready;
          cardUni.uShift.value = reducedMotion ? 0 : Math.max(-1, Math.min(1, dr.rel / (width * 0.75)));
          cardUni.uPlaceholder.value = slot.color;
          drawMesh(gl, cardMesh, target, first);
          first = false;
          instances.push({ index: dr.i, x0: dr.x - dr.cw / 2, x1: dr.x + dr.cw / 2, y0: dr.y - dr.ch / 2, y1: dr.y + dr.ch / 2 });
        }
        if (first) {
          gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
          gl.viewport(0, 0, target.w, target.h);
          gl.clear(gl.COLOR_BUFFER_BIT);
        }
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, target.texture.tex);
        gl.generateMipmap(gl.TEXTURE_2D);

        lensUniforms.uResolution.value = [width, height];
        lensUniforms.uDpr.value = dpr;
        lensUniforms.uCenter.value = [lensX, lens.y];
        lensUniforms.uHalf.value = [Math.max(halfW, 1), Math.max(halfH, 1)];
        lensUniforms.uAngle.value = (s.tilt * Math.PI) / 180;
        lensUniforms.uExponent.value = 2 + Math.pow(1 - clamp01(s.roundness), 1.5) * 10;
        var spanW = Math.max(halfW, 1), spanH = Math.max(halfH, 1);
        var inner = Math.max(4, s.reach * (spanW + spanH) * 0.5);
        lensUniforms.uInner.value = inner;
        lensUniforms.uOuter.value = inner * 1.6;
        lensUniforms.uFlow.value = s.bend * (spanW + spanH) * 0.45 * refK;
        lensUniforms.uCurl.value = s.curl === "rise" ? 1 : s.curl === "fall" ? -1 : 0;
        lensUniforms.uDispersion.value = s.dispersion * 0.12 * (1 + Math.abs(deform) * liquidAmount * 1.2);
        lensUniforms.uStrength.value = effects.strength * (1 - focusEase);
        lensUniforms.uSceneAlpha.value = effects.sceneAlpha;
        drawMesh(gl, lensMesh, null, true);
      }

      var nextHover = "";
      if (pointer.over && !pointer.dragging && introState.done && s.focusOnClick) {
        var hit = null;
        for (var q = 0; q < instances.length; q++) {
          var inst = instances[q];
          if (pointer.x >= inst.x0 && pointer.x <= inst.x1 && pointer.y >= inst.y0 && pointer.y <= inst.y1) { hit = inst; break; }
        }
        if (focus.target > 0) nextHover = "close"; else if (hit) nextHover = "open";
      }
      if (nextHover !== hover) {
        hover = nextHover;
        if (hover) container.setAttribute("data-hover", hover); else container.removeAttribute("data-hover");
      }

      if (visible && (animating || waiting || dirty || pointer.down)) raf = requestAnimationFrame(frame);
    }

    function start() {
      if (raf || !visible || !alive) return;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }

    function localPoint(e) { var r = container.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; }
    function findHit(x, y) {
      for (var i = 0; i < instances.length; i++) { var t = instances[i]; if (x >= t.x0 && x <= t.x1 && y >= t.y0 && y <= t.y1) return t; }
      return null;
    }

    function onPointerDown(e) {
      if (e.button !== undefined && e.button > 0) return;
      skipIntro();
      var p = localPoint(e);
      pointer.down = true; pointer.id = e.pointerId; pointer.touch = e.pointerType === "touch";
      pointer.startX = p[0]; pointer.startY = p[1]; pointer.x = p[0]; pointer.y = p[1];
      pointer.startPos = pos; pointer.dragging = false;
      pointer.samples = [{ x: p[0], t: performance.now() }];
      interactedAt = performance.now();
      if (Math.abs(vel) > 40) { goal = pos; vel = 0; }
      dirty = true; start();
    }
    function onPointerMove(e) {
      var p = localPoint(e), x = p[0], y = p[1];
      pointer.x = x; pointer.y = y; pointer.over = true;
      if (pointer.down && e.pointerId === pointer.id) {
        var dx = x - pointer.startX, dy = y - pointer.startY, slop = pointer.touch ? 10 : 5;
        if (!pointer.dragging) {
          if (pointer.touch && Math.abs(dy) > slop && Math.abs(dy) > Math.abs(dx)) { pointer.down = false; return; }
          if (Math.abs(dx) > slop) {
            pointer.dragging = true; pointer.startX = x; pointer.startPos = pos;
            closeFocus();
            try { container.setPointerCapture(e.pointerId); } catch (err) { /* sans capture */ }
            container.setAttribute("data-dragging", "");
          }
        }
        if (pointer.dragging) {
          pos = pointer.startPos - (x - pointer.startX); goal = pos; vel = 0;
          var now = performance.now();
          pointer.samples.push({ x: x, t: now });
          while (pointer.samples.length > 2 && now - pointer.samples[0].t > 100) pointer.samples.shift();
        }
      }
      dirty = true; start();
    }
    function onPointerUp(e) {
      if (!pointer.down || e.pointerId !== pointer.id) return;
      pointer.down = false;
      container.removeAttribute("data-dragging");
      var m = metrics(S);
      interactedAt = performance.now();
      if (pointer.dragging) {
        pointer.dragging = false;
        var now = performance.now(), first = pointer.samples[0], lastSample = pointer.samples[pointer.samples.length - 1], velocity = 0;
        if (first && lastSample && lastSample.t > first.t && now - lastSample.t < 70) velocity = -((lastSample.x - first.x) / (lastSample.t - first.t)) * 1000;
        vel = velocity;
        var landing = snapPoint(m, pos + velocity * 0.32);
        goal = landing;
        if (Math.abs(velocity) > 400 && Math.abs(landing - pos) < 1) step(m, velocity > 0 ? 1 : -1);
        mode = "spring"; start();
        return;
      }
      if (closeFocus()) return;
      var pt = localPoint(e), hit = findHit(pt[0], pt[1]);
      if (!hit) return;
      if (hit.index === activeIndex && Math.abs(goal - pos) < 2) { if (S.focusOnClick) openFocus(hit.index); }
      else {
        var rel = (hit.x0 + hit.x1) / 2 - width / 2;
        goal = snapPoint(m, pos + rel); mode = "spring";
        if (S.focusOnClick) focus.pending = hit.index;
        start();
      }
    }
    function onPointerLeave() { pointer.over = false; dirty = true; start(); }
    function onPointerCancel() {
      pointer.down = false; pointer.dragging = false;
      container.removeAttribute("data-dragging");
      goal = snapPoint(metrics(S), pos); mode = "spring"; start();
    }
    function onWheel(e) {
      if (e.ctrlKey) return;
      var dx = e.deltaX, dy = e.deltaY;
      if (e.shiftKey && Math.abs(dx) < Math.abs(dy)) { dx = dy; dy = 0; }
      var unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? height : 1;
      var horizontal = Math.abs(dx) > Math.abs(dy);
      if (!horizontal && !S.captureWheel) return;          // la molette verticale fait défiler la page
      e.preventDefault();
      skipIntro(); interactedAt = performance.now();
      if (closeFocus()) return;
      var delta = Math.max(-120, Math.min(120, (horizontal ? dx : dy) * unit));
      goal += delta * 1.25; mode = "wheel"; wheelAt = performance.now(); start();
    }
    function onKeyDown(e) {
      var m = metrics(S);
      if (e.key === "ArrowRight") { e.preventDefault(); skipIntro(); closeFocus(); interactedAt = performance.now(); step(m, 1); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); skipIntro(); closeFocus(); interactedAt = performance.now(); step(m, -1); }
      else if (e.key === "Home") { e.preventDefault(); closeFocus(); interactedAt = performance.now(); goTo(m, 0); }
      else if (e.key === "End") { e.preventDefault(); closeFocus(); interactedAt = performance.now(); goTo(m, slots.length - 1); }
      else if (e.key === "Escape") { if (closeFocus()) e.preventDefault(); }
      else if (e.key === "Enter") {
        e.preventDefault();
        if (closeFocus() || activeIndex < 0) return;
        if (S.focusOnClick) openFocus(activeIndex);
      }
    }
    function onFocus() { hasFocus = true; }
    function onBlur() { hasFocus = false; dirty = true; start(); }
    function onVisibility() { if (!document.hidden) start(); }
    function onLost(e) { e.preventDefault(); destroy(); if (options.onLost) options.onLost(); }

    container.addEventListener("pointerdown", onPointerDown);
    container.addEventListener("pointermove", onPointerMove);
    container.addEventListener("pointerup", onPointerUp);
    container.addEventListener("pointerleave", onPointerLeave);
    container.addEventListener("pointercancel", onPointerCancel);
    container.addEventListener("wheel", onWheel, { passive: false });
    container.addEventListener("keydown", onKeyDown);
    container.addEventListener("focus", onFocus);
    container.addEventListener("blur", onBlur);
    document.addEventListener("visibilitychange", onVisibility);
    canvas.addEventListener("webglcontextlost", onLost);

    var resizeObserver = null, intersectionObserver = null;
    if (window.ResizeObserver) { resizeObserver = new ResizeObserver(resize); resizeObserver.observe(container); }
    if (window.IntersectionObserver) {
      intersectionObserver = new IntersectionObserver(function (entries) { visible = entries[0].isIntersecting; start(); });
      intersectionObserver.observe(container);
    }

    function destroy() {
      if (!alive) return;
      alive = false;
      if (raf) cancelAnimationFrame(raf);
      container.removeEventListener("wheel", onWheel);
      document.removeEventListener("visibilitychange", onVisibility);
      canvas.removeEventListener("webglcontextlost", onLost);
      if (resizeObserver) resizeObserver.disconnect();
      if (intersectionObserver) intersectionObserver.disconnect();
      slots.forEach(function (slot) { slot.dispose(); });
      var lose = gl.getExtension("WEBGL_lose_context");
      if (lose) lose.loseContext();
      if (container.parentNode) container.parentNode.removeChild(container);
    }

    resize();
    slots = items.map(loadSlot);
    introState.readyAt = performance.now();
    start();

    return {
      el: container,
      step: function (delta) { skipIntro(); closeFocus(); interactedAt = performance.now(); step(metrics(S), delta); },
      goTo: function (index) { skipIntro(); closeFocus(); interactedAt = performance.now(); goTo(metrics(S), index); },
      setAutoplay: function (on) { S.autoplay = !!on && !reducedMotion; autoplayAt = performance.now(); start(); },
      destroy: destroy
    };
  }

  // ---------- Montage : carrousel + boutons (précédent, pause, suivant) ----------
  function mount(host, items, options) {
    options = options || {};
    var inst = create(host, items, options);
    if (!inst) return null;
    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var chev = function (d) { return '<svg class="ic" aria-hidden="true"><use href="#i-chevron-' + d + '"/></svg>'; };
    var bar = document.createElement("div");
    bar.className = "gv-bar";
    bar.innerHTML = '<button class="gallery__btn" type="button" data-gv="-1" aria-label="Capture précédente">' + chev("left") + "</button>" +
      (reduced ? "" : '<button class="gv-bar__pause" type="button" data-gv="pause" aria-pressed="false">Pause</button>') +
      '<button class="gallery__btn" type="button" data-gv="1" aria-label="Capture suivante">' + chev("right") + "</button>";
    host.appendChild(bar);
    var playing = true;
    bar.addEventListener("click", function (e) {
      var b = e.target.closest("[data-gv]");
      if (!b) return;
      var v = b.getAttribute("data-gv");
      if (v === "pause") {
        playing = !playing;
        inst.setAutoplay(playing);
        b.setAttribute("aria-pressed", String(!playing));
        b.textContent = playing ? "Pause" : "Lecture";
      } else inst.step(Number(v));
    });
    var destroy = inst.destroy;
    inst.destroy = function () { destroy(); if (bar.parentNode) bar.parentNode.removeChild(bar); };
    return inst;
  }

  window.RediGravity = { mount: mount };
})();
