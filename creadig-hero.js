/**
 * creaDIG — Hero "Chaos ↔ Gitter" (interaktiv, v5)
 *
 * Globale Struktur statt lokalem Cursor-Fleck:
 * - structure (0..1) steigt, sobald Maus/Touch sich ÜBER dem Hero bewegt,
 *   und zerfällt im Stillstand wieder. Eine "Welle" geht vom Cursor aus,
 *   Ziel ist aber das GLOBALE Gitter (nicht nur ein Fleck).
 * - Geordnete Knoten snappen exakt auf ihre Rasterposition (hx,hy);
 *   Linien werden EXPLIZIT zwischen Gitter-Nachbarn gezogen (horizontal +
 *   vertikal) → klar erkennbares rechteckiges Netz, genau wie das Intro.
 * - Intro-Reveal beim Laden, danach endlos interaktiv.
 * - Canvas: pointer-events:none, Cursor global über window getrackt,
 *   Auto-Pause außerhalb Viewport, Selbstheilung der Größe,
 *   prefers-reduced-motion → statisches volles Gitter.
 */
(function () {
  "use strict";
  var canvas = document.getElementById('hero-particles');
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext('2d');
  var hero = canvas.closest('.hero') || canvas.parentElement;
  if (!hero) return;

  var reduce = false;
  try { reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

  var W = 0, H = 0, DPR = 1, GAP = 70, cols = 0;
  var AMP = 32;                              // Chaos-Wander-Amplitude
  var INTRO_RISE = 1700, INTRO_HOLD = 1400;  // Intro: Aufbau + Halten
  var RISE = 0.022, HOLD = 800, DECAY = 5200; // Bewegung baut auf, Idle löst auf
  var BAND = 150;                            // Übergangsbreite der Struktur-Welle
  var nodes = [], raf = null, start = null, prevT = 0, paused = false, visible = true, fcount = 0;
  var structure = 0, maxDim = 1;
  var mouse = { x: -9999, y: -9999, active: false };
  var lastMove = -99999;

  function nowMs() { return (window.performance && performance.now) ? performance.now() : Date.now(); }
  function col() {
    return document.documentElement.getAttribute('data-theme') === 'light' ? '150,112,52' : '228,195,120';
  }
  function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

  function build() {
    nodes = [];
    cols = Math.max(5, Math.floor((W - 20) / GAP));
    var rows = Math.max(3, Math.floor((H - 20) / GAP));
    var ox = (W - (cols - 1) * GAP) / 2, oy = (H - (rows - 1) * GAP) / 2;
    for (var j = 0; j < rows; j++) for (var i = 0; i < cols; i++) {
      nodes.push({
        hx: ox + i * GAP, hy: oy + j * GAP,
        x: Math.random() * W, y: Math.random() * H, vx: 0, vy: 0,
        ord: 0, ph: Math.random() * 6.283, sp: 0.6 + Math.random() * 0.7
      });
    }
    maxDim = Math.max(W, H);
  }

  function fit() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    var r = hero.getBoundingClientRect();
    W = Math.round(r.width); H = Math.round(r.height);
    if (W <= 0 || H <= 0) return false;
    canvas.width = Math.round(W * DPR); canvas.height = Math.round(H * DPR);
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    build();
    return true;
  }

  // Explizite Gitter-Linien zwischen direkten Nachbarn (rechts + unten).
  function links() {
    var c = col();
    ctx.lineWidth = 1;
    for (var idx = 0; idx < nodes.length; idx++) {
      var p = nodes[idx];
      if (p.ord < 0.16) continue;
      var i = idx % cols;
      if (i < cols - 1) drawLink(c, p, nodes[idx + 1]);          // rechter Nachbar
      if (idx + cols < nodes.length) drawLink(c, p, nodes[idx + cols]); // unterer Nachbar
    }
  }
  function drawLink(c, a, b) {
    var mo = a.ord < b.ord ? a.ord : b.ord;
    if (mo < 0.16) return;
    ctx.strokeStyle = 'rgba(' + c + ',' + (mo * 0.5) + ')';
    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
  }

  function dots() {
    var c = col();
    for (var k = 0; k < nodes.length; k++) {
      var p = nodes[k];
      ctx.beginPath(); ctx.arc(p.x, p.y, 1.4 + p.ord * 1.0, 0, 6.2832);
      ctx.fillStyle = 'rgba(' + c + ',' + (0.22 + 0.55 * p.ord) + ')';
      ctx.fill();
    }
  }

  function paintStatic() {           // reduced-motion: volles, ruhiges Gitter
    if (W <= 0) return;
    structure = 1;
    for (var k = 0; k < nodes.length; k++) { var p = nodes[k]; p.x = p.hx; p.y = p.hy; p.ord = 1; }
    ctx.clearRect(0, 0, W, H); links(); dots();
  }

  function frame(now) {
    if (paused) { raf = null; return; }
    if (start === null) { start = now; prevT = now; }
    if ((fcount++ & 31) === 0) { var rr = hero.getBoundingClientRect(); if (Math.abs(rr.width - W) > 8 || Math.abs(rr.height - H) > 8) fit(); }
    var dt = Math.min(50, now - prevT); prevT = now;
    var el = now - start;

    // structure: Intro treibt hoch & hält; danach Idle-Zerfall (Bewegung baut im Handler auf)
    if (el < INTRO_RISE) { var s = ease(el / INTRO_RISE); if (s > structure) structure = s; lastMove = now; }
    else if (el < INTRO_RISE + INTRO_HOLD) { if (structure < 1) structure = 1; lastMove = now; }
    else if (now - lastMove > HOLD) { structure = Math.max(0, structure - dt / DECAY); }

    // Welle: Ursprung am Cursor (wenn aktiv), sonst Mitte. Reichweite ∝ structure.
    var useCur = mouse.active && (now - lastMove < 2200);
    var fx = useCur ? mouse.x : W * 0.5, fy = useCur ? mouse.y : H * 0.46;
    var reach = structure * maxDim * 1.45;

    ctx.clearRect(0, 0, W, H);
    for (var k = 0; k < nodes.length; k++) {
      var p = nodes[k];
      var dx = p.hx - fx, dy = p.hy - fy, d = Math.sqrt(dx * dx + dy * dy);
      var o = (reach - d) / BAND; o = o < 0 ? 0 : o > 1 ? 1 : o;
      p.ord += (o - p.ord) * 0.13;

      var w = 1 - p.ord;                                  // Chaos-Anteil
      var desX = p.hx + (Math.cos(now * 0.0004 * p.sp + p.ph) * AMP + Math.sin(now * 0.00026 + p.ph) * (AMP * 0.7)) * w + Math.sin(now * 0.0011 + p.ph) * 1.3 * p.ord;
      var desY = p.hy + (Math.sin(now * 0.0004 * p.sp + p.ph) * AMP + Math.cos(now * 0.00022 + p.ph) * (AMP * 0.7)) * w + Math.cos(now * 0.0011 + p.ph) * 1.3 * p.ord;
      p.vx += (desX - p.x) * 0.07; p.vy += (desY - p.y) * 0.07;
      p.vx *= 0.82; p.vy *= 0.82; p.x += p.vx; p.y += p.vy;
    }
    links(); dots();
    raf = requestAnimationFrame(frame);
  }

  function play() { if (reduce) { paintStatic(); return; } if (paused || !visible) return; if (!raf) raf = requestAnimationFrame(frame); }
  function stop() { if (raf) { cancelAnimationFrame(raf); raf = null; } }

  // Cursor global tracken (Canvas bleibt pointer-events:none) + Struktur aufbauen.
  function pointer(cx, cy) {
    var r = hero.getBoundingClientRect();
    var x = cx - r.left, y = cy - r.top;
    if (x >= 0 && x <= r.width && y >= 0 && y <= r.height) {
      mouse.x = x; mouse.y = y; mouse.active = true; lastMove = nowMs();
      structure = Math.min(1, structure + RISE);
    }
  }
  window.addEventListener('mousemove', function (e) { pointer(e.clientX, e.clientY); }, { passive: true });
  window.addEventListener('touchmove', function (e) { if (e.touches[0]) pointer(e.touches[0].clientX, e.touches[0].clientY); }, { passive: true });
  window.addEventListener('touchstart', function (e) { if (e.touches[0]) pointer(e.touches[0].clientX, e.touches[0].clientY); }, { passive: true });

  if (window.IntersectionObserver) {
    new IntersectionObserver(function (en) { visible = en[0].isIntersecting; if (visible) { paused = false; play(); } else { paused = true; stop(); } }, { threshold: 0.01 }).observe(hero);
  }

  var rt;
  function onResize() { clearTimeout(rt); rt = setTimeout(function () { if (fit() && reduce) paintStatic(); }, 160); }
  if (window.ResizeObserver) new ResizeObserver(onResize).observe(hero);
  window.addEventListener('resize', onResize, { passive: true });
  window.addEventListener('load', function () { if (fit() && reduce) paintStatic(); });

  function go() { if (!fit()) { requestAnimationFrame(go); return; } play(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go); else go();

})();
