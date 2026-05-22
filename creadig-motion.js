/**
 * creaDIG — Faz 1 motion layer (additive only, no content changes)
 */
(function () {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) return;

  const heroGlow = document.querySelector('.hero-glow');
  let glowTicking = false;

  function softHeroGlowScroll() {
    if (!heroGlow) return;
    const t = Math.min(window.scrollY / 700, 1);
    heroGlow.style.opacity = String(0.82 + t * 0.18);
    glowTicking = false;
  }

  window.addEventListener(
    'scroll',
    function () {
      if (!glowTicking) {
        glowTicking = true;
        requestAnimationFrame(softHeroGlowScroll);
      }
    },
    { passive: true }
  );

  const revealObs = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('vis');
          revealObs.unobserve(e.target);
        }
      });
    },
    { threshold: 0.08, rootMargin: '0px 0px -6% 0px' }
  );

  document.querySelectorAll('.reveal').forEach(function (el) {
    if (!el.classList.contains('vis')) revealObs.observe(el);
  });

  window.addEventListener('langChanged', function () {
    document.querySelectorAll('.reveal.vis').forEach(function (el) {
      el.classList.remove('vis');
      void el.offsetWidth;
      el.classList.add('vis');
    });
  });
})();
