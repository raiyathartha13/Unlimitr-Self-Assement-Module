/**
 * RecalibrationCore — AI live recalibration animated orb
 * Floating translucent orb, rotating energy ring, particles rising
 */
(function (global) {
  "use strict";

  var canvas = null;
  var ctx = null;
  var animId = null;
  var particles = [];
  var phase = 0;
  var lastSpawn = 0;
  var MAX_PARTICLES = 40;

  function spawnParticle() {
    if (particles.length >= MAX_PARTICLES) return;
    particles.push({
      x: 0.3 + Math.random() * 0.4,
      y: 1,
      speed: 0.008 + Math.random() * 0.012,
      size: 1 + Math.random() * 2,
      opacity: 0.3 + Math.random() * 0.4
    });
  }

  function render(containerEl, score) {
    if (!containerEl) return;
    var staticMode = window.STATIC_LAYOUT_MODE === true;
    score = Math.max(0, Math.min(100, score || 50));
    var glowIntensity = 0.3 + (score / 100) * 0.4;

    var html = '<div class="recalibration-core-wrap">' +
      (staticMode ? '' : '<canvas class="recalibration-canvas" width="120" height="120" aria-hidden="true"></canvas>') +
      '<div class="recalibration-center">' +
      '<div class="recalibration-ring"></div>' +
      '<div class="recalibration-orb"></div>' +
      '</div>' +
      '<p class="recalibration-label small muted">AI recalibrating biological response…</p>' +
      '</div>';
    containerEl.innerHTML = html;

    var orb = containerEl.querySelector(".recalibration-orb");
    var ring = containerEl.querySelector(".recalibration-ring");
    if (orb) orb.style.boxShadow = "0 0 30px rgba(46, 212, 122, " + glowIntensity * 0.5 + ")";

    if (!staticMode) {
      canvas = containerEl.querySelector(".recalibration-canvas");
      ctx = canvas ? canvas.getContext("2d") : null;
      particles = [];
      lastSpawn = Date.now();
      if (ring && typeof gsap !== "undefined") {
        gsap.to(ring, { rotation: 360, duration: 20, repeat: -1, ease: "linear", transformOrigin: "50% 50%" });
      } else if (ring) {
        ring.style.animationDuration = "20s";
        ring.style.animationTimingFunction = "linear";
      }
      if (typeof gsap !== "undefined") {
        gsap.to(orb, { y: -10, duration: 3, repeat: -1, yoyo: true, ease: "sine.inOut" });
      }
    }

    function loop() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, 120, 120);
      phase += 0.02;

      var now = Date.now();
      if (now - lastSpawn >= 300) {
        spawnParticle();
        lastSpawn = now;
      }

      var cx = 60, cy = 60;
      particles = particles.filter(function (p) {
        p.y -= p.speed;
        if (p.y < 0) return false;
        var x = cx + (p.x - 0.5) * 80;
        var y = cy - p.y * 100;
        var alpha = p.opacity * (1 - (1 - p.y));
        ctx.beginPath();
        ctx.arc(x, y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(46, 212, 122, " + alpha * 0.8 + ")";
        ctx.fill();
        return true;
      });

      animId = requestAnimationFrame(loop);
    }
    if (!staticMode) loop();
  }

  function destroy() {
    if (animId) {
      cancelAnimationFrame(animId);
      animId = null;
    }
    ctx = null;
    canvas = null;
    particles = [];
  }

  global.RecalibrationCore = { render: render, destroy: destroy };
})(typeof window !== "undefined" ? window : this);
