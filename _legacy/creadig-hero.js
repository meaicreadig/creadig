/**
 * creaDIG — Lokale Knoten hinter dem MEAI-Fenster (Hero rechts)
 *
 * Default: leichtes Chaos (paar driftende Goldpunkte) NUR in der MEAI-Zone.
 * Maus/Touch in der Zone: die nächsten Punkte werden zum Cursor gezogen und
 * ordnen sich zu einem kompakten Mini-Gitter (folgt der Maus, mit Linien).
 * Stillstand → lösen sich wieder ins Chaos. Endlos. Kein globales Gitter,
 * kein Intro, links (Headline/CTA) bleibt unberührt.
 * Canvas: pointer-events:none, Auto-Pause off-screen, Selbstheilung der Größe,
 * prefers-reduced-motion → statische Punkte.
 */
(function () {
  "use strict";
  var canvas = document.getElementById('hero-meai-particles');
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext('2d');
  var hero = canvas.closest('.hero');
  var meai = hero && hero.querySelector('.hero-meai');
  if (!hero || !meai) return;

  var reduce = false;
  try { reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

  var W = 0, H = 0, DPR = 1, zone = { x: 0, y: 0, w: 0, h: 0 };
  var N = 30, pts = [], raf = null, paused = false, visible = true, fc = 0;
  var CELL = 40, PULL = 210, HOLD = 650, DECAY = 3800, DRIFT = 14;
  var mx = -9999, my = -9999, lastMove = -99999;

  // Gitter-Slots, von der Mitte nach außen geordnet (kompakter 5×5-Block)
  var SLOTS = [];
  for (var gy = -2; gy <= 2; gy++) for (var gx = -2; gx <= 2; gx++) SLOTS.push([gx, gy]);
  SLOTS.sort(function (a, b) { return (a[0] * a[0] + a[1] * a[1]) - (b[0] * b[0] + b[1] * b[1]); });

  function col() { return document.documentElement.getAttribute('data-theme') === 'light' ? '150,112,52' : '228,195,120'; }
  function nowMs() { return (window.performance && performance.now) ? performance.now() : Date.now(); }

  function computeZone() {
    var hr = hero.getBoundingClientRect(), mr = meai.getBoundingClientRect(), pad = 40;
    zone.x = Math.max(0, mr.left - hr.left - pad);
    zone.y = Math.max(0, mr.top - hr.top - pad);
    zone.w = Math.min(W - zone.x, mr.width + pad * 2);
    zone.h = Math.min(H - zone.y, mr.height + pad * 2);
  }
  function build() {
    computeZone(); pts = [];
    for (var i = 0; i < N; i++) {
      pts.push({ bx: zone.x + Math.random() * zone.w, by: zone.y + Math.random() * zone.h, x: 0, y: 0, ph: Math.random() * 6.283, sp: 0.5 + Math.random() * 0.7, infl: 0, cap: false, sx: 0, sy: 0 });
      pts[i].x = pts[i].bx; pts[i].y = pts[i].by;
    }
  }
  function fit() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    var hr = hero.getBoundingClientRect();
    W = Math.round(hr.width); H = Math.round(hr.height);
    if (W <= 0 || H <= 0) return false;
    canvas.width = Math.round(W * DPR); canvas.height = Math.round(H * DPR);
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    build(); return true;
  }

  function drawStatic() {
    if (W <= 0) return;
    ctx.clearRect(0, 0, W, H); var c = col();
    for (var i = 0; i < N; i++) { var p = pts[i]; ctx.beginPath(); ctx.arc(p.bx, p.by, 1.5, 0, 6.2832); ctx.fillStyle = 'rgba(' + c + ',.32)'; ctx.fill(); }
  }

  function frame(now) {
    if (paused) { raf = null; return; }
    if ((fc++ & 31) === 0) { var hr = hero.getBoundingClientRect(); if (Math.abs(hr.width - W) > 8 || Math.abs(hr.height - H) > 8) fit(); }
    ctx.clearRect(0, 0, W, H);
    var c = col(), t = now * 0.001;
    var idle = now - lastMove;
    var energy = idle < HOLD ? 1 : Math.max(0, 1 - (idle - HOLD) / DECAY);
    var inZone = mx >= zone.x && mx <= zone.x + zone.w && my >= zone.y && my <= zone.y + zone.h;

    // 1) Capture: nächste Punkte zum Cursor ziehen + Gitter-Slot zuweisen
    for (var i = 0; i < N; i++) pts[i].cap = false;
    if (energy > 0.01 && inZone && mx > -9000) {
      var cap = [];
      for (i = 0; i < N; i++) { var p = pts[i]; var dx = p.bx - mx, dy = p.by - my, d = Math.sqrt(dx * dx + dy * dy); if (d < PULL) cap.push({ p: p, d: d }); }
      cap.sort(function (a, b) { return a.d - b.d; });
      for (var k = 0; k < cap.length && k < SLOTS.length; k++) { var q = cap[k].p; q.cap = true; q.sx = mx + SLOTS[k][0] * CELL; q.sy = my + SLOTS[k][1] * CELL; }
    }

    // 2) Bewegung
    for (i = 0; i < N; i++) {
      var pt = pts[i];
      var cxv = pt.bx + Math.cos(t * pt.sp + pt.ph) * DRIFT;
      var cyv = pt.by + Math.sin(t * pt.sp + pt.ph) * DRIFT;
      pt.infl += ((pt.cap ? energy : 0) - pt.infl) * 0.11;
      var tx = pt.cap ? cxv + (pt.sx - cxv) * pt.infl : cxv;
      var ty = pt.cap ? cyv + (pt.sy - cyv) * pt.infl : cyv;
      pt.x += (tx - pt.x) * 0.13; pt.y += (ty - pt.y) * 0.13;
    }

    // 3) Linien zwischen Cluster-Nachbarn (kompakt)
    var maxL = CELL * 1.65, maxL2 = maxL * maxL;
    ctx.lineWidth = 1;
    for (i = 0; i < N; i++) {
      var a = pts[i]; if (a.infl < 0.35) continue;
      for (var j = i + 1; j < N; j++) {
        var b = pts[j]; if (b.infl < 0.35) continue;
        var lx = a.x - b.x, ly = a.y - b.y, dd = lx * lx + ly * ly;
        if (dd < maxL2) { var al = (1 - Math.sqrt(dd) / maxL) * Math.min(a.infl, b.infl) * 0.6; if (al > 0.02) { ctx.strokeStyle = 'rgba(' + c + ',' + al + ')'; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); } }
      }
    }
    // 4) Punkte
    for (i = 0; i < N; i++) { var z = pts[i]; ctx.beginPath(); ctx.arc(z.x, z.y, 1.5 + z.infl * 1.4, 0, 6.2832); ctx.fillStyle = 'rgba(' + c + ',' + (0.3 + 0.5 * z.infl) + ')'; ctx.fill(); }
    raf = requestAnimationFrame(frame);
  }

  function play() { if (reduce) { drawStatic(); return; } if (paused || !visible) return; if (!raf) raf = requestAnimationFrame(frame); }
  function stop() { if (raf) { cancelAnimationFrame(raf); raf = null; } }

  function pointer(cx, cy) { var hr = hero.getBoundingClientRect(); mx = cx - hr.left; my = cy - hr.top; lastMove = nowMs(); }
  window.addEventListener('mousemove', function (e) { pointer(e.clientX, e.clientY); }, { passive: true });
  window.addEventListener('touchmove', function (e) { if (e.touches[0]) pointer(e.touches[0].clientX, e.touches[0].clientY); }, { passive: true });

  if (window.IntersectionObserver) {
    new IntersectionObserver(function (en) { visible = en[0].isIntersecting; if (visible) { paused = false; play(); } else { paused = true; stop(); } }, { threshold: 0.01 }).observe(hero);
  }
  var rt;
  function onResize() { clearTimeout(rt); rt = setTimeout(function () { if (fit() && reduce) drawStatic(); }, 160); }
  if (window.ResizeObserver) new ResizeObserver(onResize).observe(meai);
  window.addEventListener('resize', onResize, { passive: true });
  window.addEventListener('load', function () { if (fit() && reduce) drawStatic(); });

  function go() { if (!fit()) { requestAnimationFrame(go); return; } play(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go); else go();
})();
