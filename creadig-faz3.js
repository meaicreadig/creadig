/**
 * Faz 3 — 21st.dev-style interactions (vanilla JS)
 * Hero spotlight follow + subtle card shine on featured package
 */
(function () {
  "use strict";

  var hero = document.querySelector(".hero");
  if (hero && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    hero.addEventListener(
      "mousemove",
      function (e) {
        var r = hero.getBoundingClientRect();
        var x = ((e.clientX - r.left) / r.width) * 100;
        var y = ((e.clientY - r.top) / r.height) * 100;
        hero.style.setProperty("--spot-x", x + "%");
        hero.style.setProperty("--spot-y", y + "%");
      },
      { passive: true }
    );
  }

  var featured = document.querySelector(".pkg.ft");
  if (featured && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    featured.addEventListener("mousemove", function (e) {
      var r = featured.getBoundingClientRect();
      var x = e.clientX - r.left;
      var y = e.clientY - r.top;
      featured.style.background =
        "radial-gradient(420px circle at " +
        x +
        "px " +
        y +
        "px, rgba(4,121,180,0.06), transparent 45%), var(--bg-2)";
    });
    featured.addEventListener("mouseleave", function () {
      featured.style.background = "";
    });
  }
})();
