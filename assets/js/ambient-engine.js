/**
 * Engine 1 — Ambient Intelligence
 * Neural particles, gradient movement, light pulse wave, visibility-aware pause
 */
(function () {
  "use strict";

  var canvas, ctx, w, h, particles = [], lines = [], animId, paused = false;
  var lastPulse = 0;

  function init() {
    var wrap = document.getElementById("journeyBlurWrap");
    if (!wrap) return;
    if (document.getElementById("ambientCanvas")) return;

    canvas = document.createElement("canvas");
    canvas.id = "ambientCanvas";
    canvas.setAttribute("aria-hidden", "true");
    canvas.style.cssText = "position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:-1;opacity:0.6;will-change:transform;transform:translateZ(0);";
    wrap.style.position = "relative";
    wrap.insertBefore(canvas, wrap.firstChild);

    ctx = canvas.getContext("2d");
    if (!ctx) return;
    resize();
    createParticles();
    createNeuralLines();
    loop();
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", function () {
      paused = document.hidden;
      if (!paused) lastPulse = Date.now();
    });
  }

  function resize() {
    w = canvas.width = canvas.offsetWidth;
    h = canvas.height = canvas.offsetHeight;
  }

  function createParticles() {
    particles = [];
    var n = Math.min(25, Math.floor((w * h) / 40000));
    for (var i = 0; i < n; i++) {
      particles.push({
        x: Math.random() * w, y: Math.random() * h,
        r: 0.5 + Math.random() * 1,
        vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
        opacity: 0.03 + Math.random() * 0.04
      });
    }
  }

  function createNeuralLines() {
    lines = [];
    for (var i = 0; i < 6; i++) {
      lines.push({
        x1: Math.random() * w, y1: 0, x2: Math.random() * w * 0.5 + w * 0.25, y2: h,
        offset: Math.random() * 100
      });
    }
  }

  function drawPulseWave(t) {
    if (t - lastPulse < 9000) return;
    lastPulse = t;
    var progress = Math.min(1, (t - lastPulse + 2000) / 2000);
    var x = ((t - lastPulse) / 2000) * (w + 200) - 100;
    if (x > w + 100) return;
    var grad = ctx.createLinearGradient(x - 80, 0, x + 80, 0);
    grad.addColorStop(0, "transparent");
    grad.addColorStop(0.5, "rgba(255,255,255,0.03)");
    grad.addColorStop(1, "transparent");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  }

  function drawParticles(t) {
    ctx.fillStyle = "rgba(0, 137, 68, 0.08)";
    particles.forEach(function (p) {
      p.x += p.vx + Math.sin(t * 0.001 + p.x * 0.01) * 0.1;
      p.y += p.vy + Math.cos(t * 0.001 + p.y * 0.01) * 0.1;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;
      ctx.globalAlpha = p.opacity * (0.7 + 0.3 * Math.sin(t * 0.002 + p.x));
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
  }

  function drawNeuralLines(t) {
    ctx.strokeStyle = "rgba(0, 137, 68, 0.05)";
    ctx.lineWidth = 0.5;
    lines.forEach(function (l) {
      ctx.beginPath();
      var x1 = (l.x1 + Math.sin(t * 0.0003 + l.offset) * 30) % w;
      var x2 = (l.x2 + Math.sin(t * 0.0002 + l.offset + 1) * 40) % w;
      ctx.moveTo(x1, 0);
      ctx.quadraticCurveTo(w * 0.5 + Math.sin(t * 0.0005) * 50, h * 0.5, x2, h);
      ctx.stroke();
    });
  }

  function drawGradient(t) {
    var g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, "rgba(0, 128, 221, 0.02)");
    g.addColorStop(0.5, "rgba(0, 137, 68, 0.015)");
    g.addColorStop(1, "rgba(13, 50, 86, 0.02)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }

  function loop() {
    if (paused) { animId = requestAnimationFrame(loop); return; }
    if (!ctx || !canvas) return;
    var t = Date.now();
    ctx.clearRect(0, 0, w || 1, h || 1);
    drawGradient(t);
    drawNeuralLines(t);
    drawParticles(t);
    if (t - lastPulse > 9000) {
      var grad = ctx.createLinearGradient(-100, 0, 150, 0);
      grad.addColorStop(0, "transparent");
      grad.addColorStop(0.4, "rgba(255,255,255,0.04)");
      grad.addColorStop(0.6, "rgba(255,255,255,0.04)");
      grad.addColorStop(1, "transparent");
      ctx.save();
      ctx.translate(((t - lastPulse - 9000) % 12000) / 12000 * (w + 300) - 150, 0);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 300, h);
      ctx.restore();
      if (t - lastPulse > 11000) lastPulse = t;
    }
    animId = requestAnimationFrame(loop);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();

  if (typeof window !== "undefined") {
    window.initAmbientEngine = window.initAmbientBackground = init;
    window.AmbientEngine = { init: init };
  }
})();
