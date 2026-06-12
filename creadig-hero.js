/**
 * creaDIG — Hero "Chaos ↔ Struktur" (Faz 4, interaktiv)
 * - Kurzer Intro-Reveal beim Laden (Chaos → Struktur).
 * - Danach DAUERHAFT interaktiv: Maus/Touch über dem Hero ordnet die Knoten
 *   rund um den Cursor zur Struktur; bei Stillstand zerfällt es wieder zu Chaos;
 *   bei Bewegung formt es sich erneut — endlos.
 * - Sanfter Auto-Puls im Leerlauf (damit es nie tot wirkt / Touch-Geräte).
 * - Canvas liegt hinter dem Inhalt (pointer-events:none) → blockiert keine Klicks;
 *   Cursor wird global über window getrackt.
 * - Pausiert automatisch, wenn der Hero aus dem Viewport gescrollt ist.
 * - prefers-reduced-motion: statischer, geordneter Endzustand, keine Animation.
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

  var W = 0, H = 0, DPR = 1, GAP = 72;
  var AMP = 34, AMP2 = 22, R = 175;          // Wander-Amplituden + Cursor-Radius
  var INTRO_HOLD = 1500, INTRO_DECAY = 3200; // Intro-Reveal hält, dann zerfällt
  var HOLD = 900, DECAY = 4200;              // Maus-Energie: hält, dann Idle→Chaos
  var nodes = [], raf = null, start = null, paused = false, visible = true, fcount = 0;
  var mouse = { x: -9999, y: -9999, active: false };
  var lastMove = -99999, waveStart = 0, maxDim = 1;

  function col() {
    return document.documentElement.getAttribute('data-theme') === 'light'
      ? '150,112,52' : '228,195,120';
  }

  function build() {
    nodes = [];
    var cols = Math.max(5, Math.floor((W - 20) / GAP));
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

  function links() {
    var c = col(), max2 = GAP * GAP * 1.55;
    ctx.lineWidth = 1;
    for (var a = 0; a < nodes.length; a++) {
      var pa = nodes[a]; if (pa.ord < 0.3) continue;
      for (var b = a + 1; b < nodes.length; b++) {
        var pb = nodes[b]; if (pb.ord < 0.3) continue;
        var dx = pa.x - pb.x, dy = pa.y - pb.y, d2 = dx * dx + dy * dy;
        if (d2 < max2) {
          var mo = pa.ord < pb.ord ? pa.ord : pb.ord;
          var al = (1 - Math.sqrt(d2) / (GAP * 1.245)) * mo * 0.45;
          if (al > 0.012) {
            ctx.strokeStyle = 'rgba(' + c + ',' + al + ')';
            ctx.beginPath(); ctx.moveTo(pa.x, pa.y); ctx.lineTo(pb.x, pb.y); ctx.stroke();
          }
        }
      }
    }
  }

  function dots() {
    var c = col();
    for (var k = 0; k < nodes.length; k++) {
      var p = nodes[k];
      ctx.beginPath(); ctx.arc(p.x, p.y, 1.4 + p.ord * 1.1, 0, 6.2832);
      ctx.fillStyle = 'rgba(' + c + ',' + (0.22 + 0.55 * p.ord) + ')';
      ctx.fill();
    }
  }

  function paintStatic() {
    if (W <= 0) return;
    for (var k = 0; k < nodes.length; k++) { var p = nodes[k]; p.x = p.hx; p.y = p.hy; p.ord = 1; }
    ctx.clearRect(0, 0, W, H); links(); dots();
  }

  function frame(now) {
    if (paused) { raf = null; return; }
    if (start === null) { start = now; waveStart = now; }
    if ((fcount++ & 31) === 0) { var rr = hero.getBoundingClientRect(); if (Math.abs(rr.width - W) > 8 || Math.abs(rr.height - H) > 8) fit(); }
    var el = now - start;

    // 1) Intro-Reveal (einmalig): formt beim Laden Struktur, zerfällt dann.
    var intro = el < INTRO_HOLD ? 1 : Math.max(0, 1 - (el - INTRO_HOLD) / INTRO_DECAY);
    // 2) Maus-Energie: 1 bei Bewegung, zerfällt im Stillstand → Chaos.
    var idle = now - lastMove;
    var energy = idle < HOLD ? 1 : Math.max(0, 1 - (idle - HOLD) / DECAY);
    // 3) sanfter Auto-Puls (nur im Leerlauf, nach dem Intro) — wirkt nie tot.
    var idleScale = Math.max(0, 1 - energy) * Math.max(0, 1 - intro) * 0.5;
    var waveR = (((now - waveStart) % 7000) / 7000) * maxDim * 0.78;
    var cx = W * 0.5, cy = H * 0.46;

    ctx.clearRect(0, 0, W, H);
    for (var k = 0; k < nodes.length; k++) {
      var p = nodes[k];
      var t = intro;                                   // globaler Intro-Anteil
      if (mouse.active) {                               // Cursor-Struktur
        var dx = p.hx - mouse.x, dy = p.hy - mouse.y, d = Math.sqrt(dx * dx + dy * dy);
        if (d < R) { var c1 = (1 - d / R) * energy; if (c1 > t) t = c1; }
      }
      if (idleScale > 0.01) {                           // Auto-Puls (Ring)
        var ex = p.hx - cx, ey = p.hy - cy, ed = Math.sqrt(ex * ex + ey * ey);
        if (Math.abs(ed - waveR) < 72) { var c2 = (1 - Math.abs(ed - waveR) / 72) * idleScale; if (c2 > t) t = c2; }
      }
      p.ord += (t - p.ord) * 0.1;

      var w = 1 - p.ord;                                // Wander-Anteil (Chaos)
      var desX = p.hx + (Math.cos(now * 0.0004 * p.sp + p.ph) * AMP + Math.sin(now * 0.00026 + p.ph) * AMP2) * w;
      var desY = p.hy + (Math.sin(now * 0.0004 * p.sp + p.ph) * AMP + Math.cos(now * 0.00022 + p.ph) * AMP2) * w;
      p.vx += (desX - p.x) * 0.06; p.vy += (desY - p.y) * 0.06;
      p.vx *= 0.84; p.vy *= 0.84; p.x += p.vx; p.y += p.vy;
    }
    links(); dots();
    raf = requestAnimationFrame(frame);
  }

  function play() {
    if (reduce) { paintStatic(); return; }
    if (paused || !visible) return;
    if (!raf) raf = requestAnimationFrame(frame);
  }
  function stop() { if (raf) { cancelAnimationFrame(raf); raf = null; } }

  // ── Pointer-Tracking (global, damit Canvas pointer-events:none bleiben kann) ──
  function pointer(cx, cy) {
    var r = hero.getBoundingClientRect();
    var x = cx - r.left, y = cy - r.top;
    if (x >= 0 && x <= r.width && y >= 0 && y <= r.height) {
      mouse.x = x; mouse.y = y; mouse.active = true; lastMove = (window.performance && performance.now) ? performance.now() : Date.now();
    }
  }
  window.addEventListener('mousemove', function (e) { pointer(e.clientX, e.clientY); }, { passive: true });
  window.addEventListener('touchmove', function (e) { if (e.touches[0]) pointer(e.touches[0].clientX, e.touches[0].clientY); }, { passive: true });
  window.addEventListener('touchstart', function (e) { if (e.touches[0]) pointer(e.touches[0].clientX, e.touches[0].clientY); }, { passive: true });

  // ── Auto-Pause außerhalb des Viewports ──
  if (window.IntersectionObserver) {
    new IntersectionObserver(function (ents) {
      visible = ents[0].isIntersecting;
      if (visible) { paused = false; play(); } else { paused = true; stop(); }
    }, { threshold: 0.01 }).observe(hero);
  }

  // ── Re-Fit + Theme ──
  var rt;
  function onResize() { clearTimeout(rt); rt = setTimeout(function () { if (fit() && reduce) paintStatic(); }, 160); }
  if (window.ResizeObserver) new ResizeObserver(onResize).observe(hero);
  window.addEventListener('resize', onResize, { passive: true });
  window.addEventListener('load', function () { if (fit() && reduce) paintStatic(); });

  function go() {
    if (!fit()) { requestAnimationFrame(go); return; }
    play();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go); else go();
})();
