/**
 * Ambient Background — Canvas neural lines + drifting particles
 * Layer 1: Living background, never static
 */
(function () {
  "use strict";

  var canvas, ctx, w, h, particles = [], lines = [], animId;

  function init() {
    var wrap = document.getElementById("journeyBlurWrap");
    if (!wrap) return;
    if (document.getElementById("ambientCanvas")) return;

    canvas = document.createElement("canvas");
    canvas.id = "ambientCanvas";
    canvas.setAttribute("aria-hidden", "true");
    canvas.style.cssText = "position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:-1;opacity:0.6;";
    wrap.style.position = "relative";
    wrap.insertBefore(canvas, wrap.firstChild);

    resize();
    createParticles();
    createNeuralLines();
    loop();
    window.addEventListener("resize", resize);
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
        x: Math.random() * w,
        y: Math.random() * h,
        r: 0.5 + Math.random() * 1,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        opacity: 0.03 + Math.random() * 0.04
      });
    }
  }

  function createNeuralLines() {
    lines = [];
    var n = 6;
    for (var i = 0; i < n; i++) {
      lines.push({
        x1: Math.random() * w,
        y1: 0,
        x2: Math.random() * w * 0.5 + w * 0.25,
        y2: h,
        offset: Math.random() * 100
      });
    }
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
    lines.forEach(function (l, i) {
      ctx.beginPath();
      var y1 = 0;
      var y2 = h;
      var x1 = (l.x1 + Math.sin(t * 0.0003 + l.offset) * 30) % w;
      var x2 = (l.x2 + Math.sin(t * 0.0002 + l.offset + 1) * 40) % w;
      ctx.moveTo(x1, y1);
      ctx.quadraticCurveTo(w * 0.5 + Math.sin(t * 0.0005) * 50, h * 0.5, x2, y2);
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
    var t = Date.now();
    ctx.clearRect(0, 0, w, h);
    drawGradient(t);
    drawNeuralLines(t);
    drawParticles(t);
    animId = requestAnimationFrame(loop);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  if (typeof window !== "undefined") {
    window.initAmbientBackground = init;
  }
})();
