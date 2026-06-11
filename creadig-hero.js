/**
 * creaDIG — Hero "Chaos → Struktur" (Faz 4)
 * Einmaliger Reveal beim Laden: unsichtbar → sichtbar → geordnet, dann Ruhe.
 * - Headline/CTA bleiben jederzeit lesbar (Canvas liegt hinter dem Inhalt).
 * - pointer-events:none → blockiert keine Klicks.
 * - prefers-reduced-motion: sofort der geordnete Endzustand, keine Animation.
 * - Performance: läuft einmal, friert dann auf dem statischen Bild ein.
 */
(function () {
  "use strict";
  var canvas = document.getElementById('hero-particles');
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext('2d');
  var hero = canvas.closest('.hero') || canvas.parentElement;
  if (!hero) return;

  var reduce = false, forceStatic = false;
  try { reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
  try { forceStatic = localStorage.getItem('creadig_hero_static') === '1'; } catch (e) {}

  var W = 0, H = 0, DPR = 1, GAP = 70;
  var nodes = [], start = null, done = false, raf = null;
  var ORDER_MS = 2600, TAIL_MS = 1700;

  function col() {
    return document.documentElement.getAttribute('data-theme') === 'light'
      ? '150,112,52' : '228,195,120';
  }
  function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

  function build() {
    nodes = [];
    var cols = Math.max(5, Math.floor((W - 20) / GAP));
    var rows = Math.max(3, Math.floor((H - 20) / GAP));
    var ox = (W - (cols - 1) * GAP) / 2, oy = (H - (rows - 1) * GAP) / 2;
    for (var j = 0; j < rows; j++) for (var i = 0; i < cols; i++) {
      nodes.push({
        hx: ox + i * GAP, hy: oy + j * GAP,
        sx: Math.random() * W, sy: Math.random() * H,
        cx: 0, cy: 0, vis: 0, ord: 0,
        d: Math.random() * 600, ph: Math.random() * 6.283
      });
    }
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

  function links(order) {
    if (order <= 0.02) return;
    var c = col(), max2 = GAP * GAP * 1.5;
    ctx.lineWidth = 1;
    for (var a = 0; a < nodes.length; a++) {
      var pa = nodes[a]; if (pa.ord < 0.25) continue;
      for (var b = a + 1; b < nodes.length; b++) {
        var pb = nodes[b]; if (pb.ord < 0.25) continue;
        var dx = pa.cx - pb.cx, dy = pa.cy - pb.cy, d2 = dx * dx + dy * dy;
        if (d2 < max2) {
          var mo = pa.ord < pb.ord ? pa.ord : pb.ord;
          var al = (1 - Math.sqrt(d2) / (GAP * 1.225)) * order * mo * 0.4;
          if (al > 0.012) {
            ctx.strokeStyle = 'rgba(' + c + ',' + al + ')';
            ctx.beginPath(); ctx.moveTo(pa.cx, pa.cy); ctx.lineTo(pb.cx, pb.cy); ctx.stroke();
          }
        }
      }
    }
  }

  function dots() {
    var c = col();
    for (var k = 0; k < nodes.length; k++) {
      var p = nodes[k];
      ctx.beginPath(); ctx.arc(p.cx, p.cy, 1.5 + p.ord * 0.8, 0, 6.2832);
      ctx.fillStyle = 'rgba(' + c + ',' + (p.vis * (0.26 + 0.5 * p.ord)) + ')';
      ctx.fill();
    }
  }

  function paintStatic() {
    if (W <= 0) return;
    for (var k = 0; k < nodes.length; k++) { var p = nodes[k]; p.cx = p.hx; p.cy = p.hy; p.vis = 1; p.ord = 1; }
    ctx.clearRect(0, 0, W, H); links(1); dots(); done = true;
  }

  function frame(now) {
    if (start === null) start = now;
    var el = now - start, sum = 0;
    ctx.clearRect(0, 0, W, H);
    for (var k = 0; k < nodes.length; k++) {
      var p = nodes[k];
      var v = (el - p.d) / 600; p.vis = v < 0 ? 0 : v > 1 ? 1 : v;
      var o = (el - p.d - 200) / ORDER_MS; o = o < 0 ? 0 : o > 1 ? 1 : o;
      var e = ease(o); p.ord = e;
      if (e >= 1) {
        p.cx = p.hx + Math.cos(now * 0.0006 + p.ph) * 1.3;
        p.cy = p.hy + Math.sin(now * 0.0006 + p.ph) * 1.3;
      } else {
        p.cx = p.sx + (p.hx - p.sx) * e;
        p.cy = p.sy + (p.hy - p.sy) * e;
      }
      sum += e;
    }
    links(sum / nodes.length); dots();
    if (el < 800 + ORDER_MS + TAIL_MS) raf = requestAnimationFrame(frame);
    else paintStatic();
  }

  function run() {
    if (!fit()) { requestAnimationFrame(run); return; }
    if (reduce || forceStatic) { paintStatic(); return; }
    start = null; done = false;
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(frame);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();

  // Nach dem Reveal: bei Größenänderung sauber neu zeichnen (nicht während der Intro-Animation).
  var rt;
  function onResize() {
    clearTimeout(rt);
    rt = setTimeout(function () { if (!done) return; if (fit()) paintStatic(); }, 160);
  }
  if (window.ResizeObserver) { new ResizeObserver(onResize).observe(hero); }
  else { window.addEventListener('resize', onResize, { passive: true }); }

  // Theme-Wechsel: geordnetes Bild in der neuen Farbe neu zeichnen.
  if (window.MutationObserver) {
    new MutationObserver(function () { if (done) paintStatic(); })
      .observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  }
})();
