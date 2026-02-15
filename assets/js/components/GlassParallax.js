/**
 * GlassParallax — Mouse-based 3D tilt on glass cards (Blueprint Step 6)
 * transform: perspective(1000px), rotateX/rotateY from mouse, max 6deg
 */
(function (global) {
  "use strict";

  var MAX_ROTATION = 6;
  var SENSITIVITY = 1 / 20;
  var SMOOTH = 0.3;
  var cards = [];
  var targets = [];
  var rafId = null;

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function init(selector) {
    var els = document.querySelectorAll(selector || ".premium-glass-card, .dashboard-card.glass-card, .premium-score-card, .premium-semi-card, .adaptive-curve-wrap, .ai-radar-wrap, .recalibration-core-wrap");
    cards = [];
    targets = [];
    els.forEach(function (el) {
      el.style.transformStyle = "preserve-3d";
      el.style.perspective = "1000px";
      el.style.willChange = "transform";
      var rect = el.getBoundingClientRect();
      var centerX = rect.left + rect.width / 2;
      var centerY = rect.top + rect.height / 2;
      targets.push({ rx: 0, ry: 0 });
      cards.push({
        el: el,
        centerX: centerX,
        centerY: centerY,
        target: targets[targets.length - 1],
        current: { rx: 0, ry: 0 }
      });
    });

    document.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("resize", throttle(updateCenters, 150));
    animate();
  }

  function updateCenters() {
    cards.forEach(function (c) {
      var rect = c.el.getBoundingClientRect();
      c.centerX = rect.left + rect.width / 2;
      c.centerY = rect.top + rect.height / 2;
    });
  }

  function onMouseMove(e) {
    var mx = e.clientX;
    var my = e.clientY;
    cards.forEach(function (c) {
      var rect = c.el.getBoundingClientRect();
      c.centerX = rect.left + rect.width / 2;
      c.centerY = rect.top + rect.height / 2;
    });
    cards.forEach(function (c, i) {
      var dx = mx - c.centerX;
      var dy = my - c.centerY;
      var ry = Math.max(-MAX_ROTATION, Math.min(MAX_ROTATION, dx * SENSITIVITY));
      var rx = Math.max(-MAX_ROTATION, Math.min(MAX_ROTATION, -dy * SENSITIVITY));
      c.target.rx = rx;
      c.target.ry = ry;
    });
  }

  function animate() {
    cards.forEach(function (c) {
      c.current.rx = lerp(c.current.rx, c.target.rx, SMOOTH);
      c.current.ry = lerp(c.current.ry, c.target.ry, SMOOTH);
      c.el.style.transform = "perspective(1000px) rotateX(" + c.current.rx + "deg) rotateY(" + c.current.ry + "deg)";
    });
    rafId = requestAnimationFrame(animate);
  }

  function throttle(fn, ms) {
    var last = 0;
    return function () {
      var now = Date.now();
      if (now - last >= ms) {
        last = now;
        fn.apply(this, arguments);
      }
    };
  }

  function destroy() {
    document.removeEventListener("mousemove", onMouseMove);
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
    cards.forEach(function (c) {
      c.el.style.transform = "";
      c.el.style.transformStyle = "";
      c.el.style.perspective = "";
      c.el.style.willChange = "";
    });
    cards = [];
    targets = [];
  }

  global.GlassParallax = { init: init, destroy: destroy };
})(typeof window !== "undefined" ? window : this);
