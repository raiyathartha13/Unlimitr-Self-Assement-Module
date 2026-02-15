/**
 * AIRadar — Diagnostic radar with rotating sweep, fading grid, blinking risk points
 */
(function (global) {
  "use strict";

  var canvas = null;
  var ctx = null;
  var animId = null;
  var sweepEl = null;
  var isHighRisk = false;

  function render(containerEl, risksOrOpts) {
    if (!containerEl) return;
    var staticMode = window.STATIC_LAYOUT_MODE === true;
    var risks = [0.4, 0.35, 0.3, 0.35, 0.25, 0.2];
    if (Array.isArray(risksOrOpts)) {
      risks = risksOrOpts;
    } else if (risksOrOpts && risksOrOpts.values) {
      risks = risksOrOpts.values;
      isHighRisk = !!risksOrOpts.isHighRisk;
    }
    var size = 200;
    var cx = size / 2;
    var cy = size / 2;

    var maxRVal = size / 2 - 20;
    var html = '<div class="ai-radar-wrap">' +
      '<canvas class="ai-radar-canvas" width="' + size + '" height="' + size + '" aria-hidden="true"></canvas>' +
      (staticMode ? '' : '<svg class="ai-radar-sweep-svg" width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + ' ' + size + '" preserveAspectRatio="xMidYMid meet" aria-hidden="true">' +
      '<defs><linearGradient id="radarSweepGrad" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="rgba(46,212,122,0.4)"/><stop offset="100%" stop-color="rgba(46,212,122,0)"/></linearGradient></defs>' +
      '<g class="ai-radar-sweep-g" transform="translate(' + cx + ',' + cy + ')">' +
      '<line x1="0" y1="0" x2="' + maxRVal + '" y2="0" stroke="url(#radarSweepGrad)" stroke-width="2"/>' +
      '</g></svg>') +
      '</div>';
    containerEl.innerHTML = html;

    canvas = containerEl.querySelector(".ai-radar-canvas");
    ctx = canvas ? canvas.getContext("2d") : null;
    sweepEl = staticMode ? null : containerEl.querySelector(".ai-radar-sweep-g");
    if (!staticMode && sweepEl && typeof gsap !== "undefined") {
      gsap.to(sweepEl, { rotation: 360, duration: 6, repeat: -1, ease: "linear", transformOrigin: "0 0" });
    }

    var maxR = maxRVal;

    function drawOnce() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, size, size);
      for (var ring = 1; ring <= 4; ring++) {
        var r = (maxR / 4) * ring;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(46, 212, 122, " + (0.15 - ring * 0.02) + ")";
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
      for (var i = 0; i < 6; i++) {
        var a = (i / 6) * Math.PI * 2 - Math.PI / 2;
        var ex = cx + Math.cos(a) * maxR;
        var ey = cy + Math.sin(a) * maxR;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(ex, ey);
        ctx.strokeStyle = "rgba(46, 212, 122, 0.12)";
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }
      risks.forEach(function (v, i) {
        var a = (i / 6) * Math.PI * 2 - Math.PI / 2;
        var r = (v || 0.3) * maxR * 0.9;
        var px = cx + Math.cos(a) * r;
        var py = cy + Math.sin(a) * r;
        var nodeColor = isHighRisk ? "rgba(255,77,77,0.8)" : "rgba(46, 212, 122, 0.8)";
        ctx.beginPath();
        ctx.arc(px, py, 4, 0, Math.PI * 2);
        ctx.fillStyle = nodeColor;
        ctx.fill();
        ctx.strokeStyle = "rgba(255,255,255,0.5)";
        ctx.lineWidth = 1;
        ctx.stroke();
      });
    }

    function draw() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, size, size);

      for (var ring = 1; ring <= 4; ring++) {
        var r = (maxR / 4) * ring;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(46, 212, 122, " + (0.15 - ring * 0.02) + ")";
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      for (var i = 0; i < 6; i++) {
        var a = (i / 6) * Math.PI * 2 - Math.PI / 2;
        var ex = cx + Math.cos(a) * maxR;
        var ey = cy + Math.sin(a) * maxR;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(ex, ey);
        ctx.strokeStyle = "rgba(46, 212, 122, 0.12)";
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }

      risks.forEach(function (v, i) {
        var a = (i / 6) * Math.PI * 2 - Math.PI / 2;
        var r = (v || 0.3) * maxR * 0.9;
        var px = cx + Math.cos(a) * r;
        var py = cy + Math.sin(a) * r;
        var blink = isHighRisk ? (0.2 + 0.4 * (1 + Math.sin(Date.now() * 0.002 + i * 2))) : 0.6 + 0.4 * Math.sin(Date.now() * 0.003 + i);
        var nodeColor = isHighRisk ? "rgba(255,77,77," + blink + ")" : "rgba(46, 212, 122, " + blink + ")";
        ctx.beginPath();
        ctx.arc(px, py, 4, 0, Math.PI * 2);
        ctx.fillStyle = nodeColor;
        ctx.fill();
        ctx.strokeStyle = "rgba(255,255,255,0.5)";
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      animId = requestAnimationFrame(draw);
    }
    if (staticMode) {
      drawOnce();
      return;
    }
    draw();
  }

  function destroy() {
    if (animId) {
      cancelAnimationFrame(animId);
      animId = null;
    }
    ctx = null;
    canvas = null;
  }

  global.AIRadar = { render: render, destroy: destroy };
})(typeof window !== "undefined" ? window : this);
