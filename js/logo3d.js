/* Logo 3D Redianice (assets/redianice_official_no_frame.glb) : accueil uniquement.
   Un seul canvas fixe (#l3d) dessine le modèle, sans bibliothèque (chargeur GLB et rendu WebGL maison).
   Le modèle suit trois emplacements, calculés à chaque image à partir de la mise en page réelle :
     1. « À propos » : il remplace le logo en zigzag (il se pose sur [data-l3d-slot], le zigzag de js/main.js le déplace et le fait tourner) ;
     2. après « À propos » : il passe en arrière-plan de toute la page, grand et centré, et tourne sur lui-même avec le défilement ;
     3. fin de page : il glisse à la place de la marque encadrée du logo combiné du pied de page (le mot « redianice » reste) et s'arrête de face.
   Sans WebGL ou si le fichier ne se charge pas : rien ne change, le logo image reste en place (la classe html.l3d n'est jamais ajoutée).
   Réglages : objet CFG ci-dessous. */
(function () {
  "use strict";

  var CFG = {
    turns: 3,          // tours complets sur lui-même, de la fin de « À propos » jusqu'au pied de page
    bgOpacity: 0.45,   // opacité en arrière-plan (1 = plein)
    bgHeight: 0.8,     // hauteur en arrière-plan : part de la hauteur de l'écran (plafonnée par la largeur)
    tilt: 0.2,         // inclinaison vers l'avant (radians), pour qu'il garde du volume de profil
    persp: 5,          // distance de la caméra, en hauteurs de modèle (plus petit = perspective plus marquée)
    aboutOut: [1.15, 0.25], // passage « À propos » → fond : bas de la section entre ces deux hauteurs d'écran
    footIn: [1.0, 0.15],    // passage fond → pied de page : haut du pied de page entre ces deux hauteurs d'écran
    footMark: 1            // hauteur finale : part de la hauteur du logo combiné (1 = comme le carré de la marque)
  };

  var canvas = document.getElementById("l3d");
  var slot = document.querySelector("[data-l3d-slot]");
  var about = document.getElementById("apropos");
  var foot = document.querySelector(".foot");
  var mark = document.querySelector("[data-l3d-end]"); // image du logo combiné du pied de page
  if (!canvas || !slot || !about || !foot || !mark) return;

  var root = document.documentElement;
  var reduced = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  var shared = (window.__l3d = window.__l3d || {}); // shared.spin : rotation (degrés) imposée par le zigzag de js/main.js ; shared.spinEnd : son angle final
  var src = document.currentScript && document.currentScript.src;
  var URL_GLB = src ? new URL("../assets/redianice_official_no_frame.glb", src).href : "assets/redianice_official_no_frame.glb";

  /* ---------- Chargeur GLB (glTF binaire 2.0 : maillages triangulés, une matière, texture intégrée) ---------- */
  function parseGLB(buf) {
    var dv = new DataView(buf);
    if (dv.getUint32(0, true) !== 0x46546c67) throw new Error("glb");
    var off = 12, json = null, bin = null;
    while (off + 8 <= buf.byteLength) {
      var len = dv.getUint32(off, true), type = dv.getUint32(off + 4, true);
      off += 8;
      if (type === 0x4e4f534a) json = JSON.parse(new TextDecoder().decode(new Uint8Array(buf, off, len)));
      else if (type === 0x004e4942) bin = buf.slice(off, off + len);
      off += len;
    }
    if (!json || !bin) throw new Error("glb");
    return { json: json, bin: bin };
  }

  function accessor(g, i) {
    var a = g.json.accessors[i], bv = g.json.bufferViews[a.bufferView];
    var n = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4 }[a.type];
    var C = { 5126: Float32Array, 5125: Uint32Array, 5123: Uint16Array, 5121: Uint8Array }[a.componentType];
    var start = (bv.byteOffset || 0) + (a.byteOffset || 0), size = C.BYTES_PER_ELEMENT, stride = bv.byteStride || n * size;
    if (stride === n * size) return new C(g.bin.slice(start, start + a.count * n * size)); // copie : alignement garanti
    var out = new C(a.count * n), dv = new DataView(g.bin), get = { 5126: "getFloat32", 5125: "getUint32", 5123: "getUint16", 5121: "getUint8" }[a.componentType];
    for (var k = 0; k < a.count; k++) for (var c = 0; c < n; c++) out[k * n + c] = dv[get](start + k * stride + c * size, true);
    return out;
  }

  // Tous les triangles de la scène, en sommets non partagés. Normales lissées entre faces voisines (angle < 40°), arêtes vives conservées.
  function buildGeometry(g) {
    var tris = [], j = g.json, scene = j.scenes[j.scene || 0];
    scene.nodes.forEach(function (ni) {
      var node = j.nodes[ni];
      if (node.mesh == null) return;
      j.meshes[node.mesh].primitives.forEach(function (pr) {
        if (pr.mode != null && pr.mode !== 4) return;
        var pos = accessor(g, pr.attributes.POSITION);
        var uv = pr.attributes.TEXCOORD_0 != null ? accessor(g, pr.attributes.TEXCOORD_0) : null;
        var idx = pr.indices != null ? accessor(g, pr.indices) : null;
        var count = idx ? idx.length : pos.length / 3;
        for (var t = 0; t + 2 < count; t += 3) {
          var ids = idx ? [idx[t], idx[t + 1], idx[t + 2]] : [t, t + 1, t + 2], tri = [];
          for (var k = 0; k < 3; k++) tri.push({ p: [pos[ids[k] * 3], pos[ids[k] * 3 + 1], pos[ids[k] * 3 + 2]], u: uv ? [uv[ids[k] * 2], uv[ids[k] * 2 + 1]] : [0, 0] });
          tris.push(tri);
        }
      });
    });
    if (!tris.length) throw new Error("vide");

    var mn = [1e9, 1e9, 1e9], mx = [-1e9, -1e9, -1e9];
    tris.forEach(function (t) { t.forEach(function (v) { for (var c = 0; c < 3; c++) { mn[c] = Math.min(mn[c], v.p[c]); mx[c] = Math.max(mx[c], v.p[c]); } }); });
    var ctr = [(mn[0] + mx[0]) / 2, (mn[1] + mx[1]) / 2, (mn[2] + mx[2]) / 2], sc = 1 / (mx[1] - mn[1]); // hauteur = 1, centré
    tris.forEach(function (t) { t.forEach(function (v) { for (var c = 0; c < 3; c++) v.p[c] = (v.p[c] - ctr[c]) * sc; }); });

    var vol = 0; // volume signé : négatif = faces tournées vers l'intérieur, on inverse
    tris.forEach(function (t) {
      var a = t[0].p, b = t[1].p, c = t[2].p;
      vol += a[0] * (b[1] * c[2] - b[2] * c[1]) - a[1] * (b[0] * c[2] - b[2] * c[0]) + a[2] * (b[0] * c[1] - b[1] * c[0]);
    });
    var flip = vol < 0 ? -1 : 1;
    tris.forEach(function (t) {
      var a = t[0].p, b = t[1].p, c = t[2].p;
      var ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
      var nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx, l = Math.hypot(nx, ny, nz) || 1;
      t.n = [flip * nx / l, flip * ny / l, flip * nz / l]; t.area = l;
    });
    var key = function (p) { return Math.round(p[0] * 1e5) + "," + Math.round(p[1] * 1e5) + "," + Math.round(p[2] * 1e5); };
    var at = {};
    tris.forEach(function (t, i) { t.forEach(function (v) { (at[key(v.p)] = at[key(v.p)] || []).push(i); }); });
    var CREASE = Math.cos(40 * Math.PI / 180), out = [];
    tris.forEach(function (t) {
      t.forEach(function (v) {
        var s = [0, 0, 0];
        at[key(v.p)].forEach(function (i) {
          var o = tris[i];
          if (o.n[0] * t.n[0] + o.n[1] * t.n[1] + o.n[2] * t.n[2] >= CREASE) { s[0] += o.n[0] * o.area; s[1] += o.n[1] * o.area; s[2] += o.n[2] * o.area; }
        });
        var l = Math.hypot(s[0], s[1], s[2]) || 1;
        out.push(v.p[0], v.p[1], v.p[2], s[0] / l, s[1] / l, s[2] / l, v.u[0], v.u[1]);
      });
    });
    return { data: new Float32Array(out), count: out.length / 8, aspect: (mx[0] - mn[0]) / (mx[1] - mn[1]) };
  }

  function loadTexture(g) {
    var im = g.json.images && g.json.images[0];
    if (!im || im.bufferView == null) return Promise.resolve(null);
    var bv = g.json.bufferViews[im.bufferView], start = bv.byteOffset || 0;
    var blob = new Blob([g.bin.slice(start, start + bv.byteLength)], { type: im.mimeType || "image/png" });
    if (window.createImageBitmap) return createImageBitmap(blob).catch(function () { return null; });
    return new Promise(function (ok) {
      var img = new Image(), u = URL.createObjectURL(blob);
      img.onload = function () { URL.revokeObjectURL(u); ok(img); };
      img.onerror = function () { ok(null); };
      img.src = u;
    });
  }

  /* ---------- Rendu WebGL ---------- */
  var VS = "attribute vec3 aPos;attribute vec3 aNrm;attribute vec2 aUv;" +
    "uniform mat3 uRot;uniform vec2 uCenter;uniform float uScale;uniform vec2 uView;uniform float uDist;" +
    "varying vec3 vN;varying vec2 vUv;" +
    "void main(){vec3 p=uRot*aPos*uScale;float w=1.0-p.z/uDist;" +
    "vec2 s=vec2(uCenter.x+p.x/w,uCenter.y-p.y/w);" +
    "gl_Position=vec4(s.x/uView.x*2.0-1.0,1.0-s.y/uView.y*2.0,-p.z/(uScale*1.5),1.0);" +
    "vN=uRot*aNrm;vUv=aUv;}";
  // Deux lumières, chacune aussi reflétée derrière : le dos du logo est éclairé comme la face. Face de face ≈ couleur de la texture.
  var FS = "precision mediump float;uniform sampler2D uTex;uniform vec3 uFlat;uniform float uUseTex;uniform float uAlpha;" +
    "varying vec3 vN;varying vec2 vUv;" +
    "void main(){vec3 n=normalize(vN);" +
    "vec3 L1=normalize(vec3(-0.35,0.55,0.75));vec3 L2=normalize(vec3(0.65,-0.1,0.55));" +
    "vec3 L1b=vec3(L1.xy,-L1.z);vec3 L2b=vec3(L2.xy,-L2.z);" +
    "float d1=max(dot(n,L1),0.0)+max(dot(n,L1b),0.0);float d2=max(dot(n,L2),0.0)+max(dot(n,L2b),0.0);" +
    "vec3 H=normalize(L1+vec3(0.0,0.0,1.0));vec3 Hb=vec3(H.xy,-H.z);" +
    "float sp=pow(max(dot(n,H),0.0),40.0)+pow(max(dot(n,Hb),0.0),40.0);" +
    "vec3 base=mix(uFlat,texture2D(uTex,vUv).rgb,uUseTex);" +
    "vec3 col=base*(0.56+0.38*d1+0.22*d2)+vec3(0.12)*sp;" +
    "gl_FragColor=vec4(col*uAlpha,uAlpha);}";

  var gl, prog, U = {}, buf, tex, geo, texImg, ready = false, dpr = 1, cw = 0, ch = 0;

  function shader(type, code) {
    var s = gl.createShader(type);
    gl.shaderSource(s, code); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    return s;
  }

  function initGL() {
    gl = canvas.getContext("webgl", { alpha: true, antialias: true, premultipliedAlpha: true, powerPreference: "low-power" });
    if (!gl) throw new Error("webgl");
    prog = gl.createProgram();
    gl.attachShader(prog, shader(gl.VERTEX_SHADER, VS));
    gl.attachShader(prog, shader(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error("link");
    gl.useProgram(prog);
    ["uRot", "uCenter", "uScale", "uView", "uDist", "uTex", "uFlat", "uUseTex", "uAlpha"].forEach(function (n) { U[n] = gl.getUniformLocation(prog, n); });
    buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, geo.data, gl.STATIC_DRAW);
    [["aPos", 3, 0], ["aNrm", 3, 12], ["aUv", 2, 24]].forEach(function (a) {
      var loc = gl.getAttribLocation(prog, a[0]);
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, a[1], gl.FLOAT, false, 32, a[2]);
    });
    tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    if (texImg) {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texImg);
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    } else {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([39, 91, 174, 255]));
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.uniform1i(U.uTex, 0);
    gl.uniform3f(U.uFlat, 39 / 255, 91 / 255, 174 / 255); // #275BAE, couleur du logo
    gl.uniform1f(U.uUseTex, texImg ? 1 : 0);
    gl.enable(gl.DEPTH_TEST);
    gl.clearColor(0, 0, 0, 0);
    cw = ch = 0; sizeCanvas();
  }

  function sizeCanvas() {
    var w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return false;
    var d = Math.min(window.devicePixelRatio || 1, w < 700 ? 1.75 : 2);
    if (w === cw && h === ch && d === dpr) return true;
    cw = w; ch = h; dpr = d;
    canvas.width = Math.round(w * d); canvas.height = Math.round(h * d);
    gl.viewport(0, 0, canvas.width, canvas.height);
    last = "";
    return true;
  }

  function rot(yaw, pitch) { // Rx(pitch) · Ry(yaw), colonnes d'abord (format WebGL)
    var cy = Math.cos(yaw), sy = Math.sin(yaw), cx = Math.cos(pitch), sx = Math.sin(pitch);
    return new Float32Array([cy, sx * sy, -cx * sy, 0, cx, sx, sy, -sx * cy, cx * cy]);
  }

  var last = "", cleared = false;
  function draw(x, y, h, yaw, pitch, alpha) {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.uniformMatrix3fv(U.uRot, false, rot(yaw, pitch));
    gl.uniform2f(U.uCenter, x, y);
    gl.uniform1f(U.uScale, h);
    gl.uniform2f(U.uView, cw, ch);
    gl.uniform1f(U.uDist, h * CFG.persp);
    gl.uniform1f(U.uAlpha, alpha);
    gl.drawArrays(gl.TRIANGLES, 0, geo.count);
    cleared = false;
  }

  var ease = function (t) { t = Math.max(0, Math.min(1, t)); return t * t * (3 - 2 * t); };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var pastHero = false;

  function tick() {
    if (!ready || !sizeCanvas()) return;
    var vw = cw, vh = ch, ab = about.getBoundingClientRect();

    // Le hero est fixe derrière la page : une fois « À propos » arrivé en haut, il est entièrement recouvert, on le masque
    // (les sections sont alors transparentes pour laisser voir le logo 3D, voir css/style.css bloc V45).
    var past = ab.top <= 0;
    if (past !== pastHero) { pastHero = past; root.classList.toggle("l3d-past-hero", past); }

    if (ab.top >= vh) { // « À propos » pas encore à l'écran : rien à dessiner
      if (!cleared) { gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); cleared = true; last = ""; }
      return;
    }

    var ft = foot.getBoundingClientRect(), sr = slot.getBoundingClientRect(), mr = mark.getBoundingClientRect(), y = window.pageYOffset;

    // 1 → 2 : de « À propos » vers l'arrière-plan ; 2 → 3 : de l'arrière-plan vers le logo du pied de page
    var t1 = ease((vh * CFG.aboutOut[0] - ab.bottom) / (vh * (CFG.aboutOut[0] - CFG.aboutOut[1])));
    var t2 = ease((vh * CFG.footIn[0] - ft.top) / (vh * (CFG.footIn[0] - CFG.footIn[1])));

    var hA = Math.min(sr.height, sr.width / geo.aspect), xA = sr.left + sr.width / 2, yA = sr.top + sr.height / 2;
    var hB = Math.min(vh * CFG.bgHeight, vw * 0.95 / geo.aspect), xB = vw / 2, yB = vh / 2;
    // Logo combiné : la marque est un carré de la hauteur de l'image, à gauche ; son monogramme est centré à 49,5 % de cette hauteur.
    var hC = mr.height ? mr.height * CFG.footMark : hB, xC = mr.height ? mr.left + mr.height * 0.495 : xB, yC = mr.height ? mr.top + mr.height / 2 : yB;

    // Rotation : zigzag de « À propos » (js/main.js), puis tours avec le défilement jusqu'au pied de page, où il se range de face.
    var aboutEnd = ab.bottom + y - vh * CFG.aboutOut[1], footStart = ft.top + y - vh * CFG.footIn[1];
    var prog = Math.max(0, Math.min(1, (y - aboutEnd) / Math.max(1, footStart - aboutEnd)));
    var spinA = reduced ? 0 : (shared.spin || 0) * Math.PI / 180;
    var spinB = reduced ? 0 : ((shared.spinEnd || 0) + CFG.turns * 360 * prog) * Math.PI / 180;
    var snap = Math.round(spinB / (2 * Math.PI)) * 2 * Math.PI;
    var yaw = lerp(lerp(spinA, spinB, t1), snap, t2);
    var pitch = lerp(0.1, CFG.tilt, t1) * (1 - t2) + (reduced ? 0 : 0.05 * Math.sin(prog * 18.85) * t1 * (1 - t2));

    var X = lerp(lerp(xA, xB, t1), xC, t2), Y = lerp(lerp(yA, yB, t1), yC, t2), H = lerp(lerp(hA, hB, t1), hC, t2);
    var alpha = lerp(lerp(1, CFG.bgOpacity, t1), 1, t2);

    var sig = [X, Y, H, yaw, pitch, alpha].map(function (v) { return Math.round(v * 100); }).join();
    if (sig === last) return;
    last = sig;
    draw(X, Y, H, yaw, pitch, alpha);
  }

  /* ---------- Démarrage ---------- */
  var started = false;
  function start() {
    if (started) return; started = true;
    initGL();
    ready = true;
    root.classList.add("l3d");
    if (window.gsap && window.gsap.ticker) window.gsap.ticker.add(tick);
    else (function loop() { tick(); requestAnimationFrame(loop); })();
    window.addEventListener("resize", function () { last = ""; });
    canvas.addEventListener("webglcontextlost", function (e) { e.preventDefault(); ready = false; root.classList.remove("l3d", "l3d-past-hero"); pastHero = false; });
    canvas.addEventListener("webglcontextrestored", function () { try { initGL(); ready = true; last = ""; root.classList.add("l3d"); } catch (err) {} });
  }

  fetch(URL_GLB)
    .then(function (r) { if (!r.ok) throw new Error("http"); return r.arrayBuffer(); })
    .then(function (b) {
      var g = parseGLB(b);
      geo = buildGeometry(g);
      return loadTexture(g).then(function (img) { texImg = img; start(); });
    })
    .catch(function () { /* repli : le logo image reste affiché */ });
})();
