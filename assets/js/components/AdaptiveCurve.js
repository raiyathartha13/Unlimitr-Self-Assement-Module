/**
 * AdaptiveCurve — Metabolic projection with cubic Bézier, oscillations, micro plateaus
 * Animated path draw, gradient fill, AI recalibration dot
 */
(function (global) {
  "use strict";

  var canvas = null;
  var ctx = null;
  var animId = null;
  var dotT = 0;
  var drawProgress = 0;

  function bezier(t, p0, p1, p2, p3) {
    var u = 1 - t;
    var uu = u * u, uuu = uu * u;
    var tt = t * t, ttt = tt * t;
    return uuu * p0 + 3 * uu * t * p1 + 3 * u * tt * p2 + ttt * p3;
  }

  function addMicroNoise(values) {
    return values.map(function (v, i) {
      var t = i / Math.max(1, values.length - 1);
      var wave = Math.sin(t * Math.PI * 3) * 0.8 + Math.sin(t * Math.PI * 5 + 0.5) * 0.4;
      return Math.round((v + wave) * 10) / 10;
    });
  }

  function pathLength(path) {
    var len = 0;
    for (var i = 1; i < path.length; i++) {
      var dx = path[i].x - path[i - 1].x;
      var dy = path[i].y - path[i - 1].y;
      len += Math.sqrt(dx * dx + dy * dy);
    }
    return len;
  }

  function pointAtLength(path, t) {
    var total = pathLength(path);
    var target = t * total;
    var acc = 0;
    for (var i = 1; i < path.length; i++) {
      var dx = path[i].x - path[i - 1].x;
      var dy = path[i].y - path[i - 1].y;
      var seg = Math.sqrt(dx * dx + dy * dy);
      if (acc + seg >= target) {
        var r = (target - acc) / seg;
        return { x: path[i - 1].x + r * dx, y: path[i - 1].y + r * dy };
      }
      acc += seg;
    }
    var last = path[path.length - 1];
    return { x: last.x, y: last.y };
  }

  function generateCurvePoints(values, labels, w, h) {
    var n = values.length;
    if (n < 2) return { path: [], points: [] };
    var noisy = addMicroNoise(values);
    var pad = { left: 40, right: 20, top: 20, bottom: 30 };
    var gw = w - pad.left - pad.right;
    var gh = h - pad.top - pad.bottom;
    var minV = Math.min.apply(null, noisy);
    var maxV = Math.max.apply(null, noisy);
    var range = maxV - minV || 1;
    var margin = range * 0.1;

    var pts = [];
    for (var i = 0; i < n; i++) {
      var x = pad.left + (i / (n - 1)) * gw;
      var y = pad.top + gh - ((noisy[i] - minV + margin) / (range + 2 * margin)) * gh;
      pts.push({ x: x, y: y, v: noisy[i], l: labels[i] });
    }

    var path = [];
    for (var j = 0; j < n - 1; j++) {
      var p0 = pts[j];
      var p1 = pts[j + 1];
      var t = j / Math.max(1, n - 1);
      var osc = Math.sin(t * Math.PI * 2.5) * 12 + Math.sin(t * Math.PI * 4 + 0.7) * 6;
      var ctrl1 = { x: p0.x + (p1.x - p0.x) * 0.35, y: p0.y + osc };
      var ctrl2 = { x: p1.x - (p1.x - p0.x) * 0.35, y: p1.y - osc * 0.6 };
      for (var t = 0; t <= 1; t += 0.05) {
        var xx = bezier(t, p0.x, ctrl1.x, ctrl2.x, p1.x);
        var yy = bezier(t, p0.y, ctrl1.y, ctrl2.y, p1.y);
        path.push({ x: xx, y: yy });
      }
    }
    path.push(pts[pts.length - 1]);
    return { path: path, points: pts, pad: pad, gw: gw, gh: gh };
  }

  function render(containerEl, data) {
    if (!containerEl || !data) return;
    var values = data.values || [];
    var labels = data.labels || [];
    var w = 380;
    var h = 200;
    var staticMode = window.STATIC_LAYOUT_MODE === true;

    var wrap = document.createElement("div");
    wrap.className = "adaptive-curve-wrap";
    wrap.innerHTML = '<div class="adaptive-curve-label">Metabolism adapting...</div>' +
      '<canvas class="adaptive-curve-canvas" width="' + w + '" height="' + h + '" style="display:block;width:100%;max-width:' + w + 'px;height:' + h + 'px"></canvas>';
    containerEl.innerHTML = "";
    containerEl.appendChild(wrap);

    canvas = wrap.querySelector("canvas");
    ctx = canvas.getContext("2d");

    var curve = generateCurvePoints(values, labels, w, h);
    if (curve.path.length < 2) return;

    drawProgress = staticMode ? 1 : 0;
    dotT = 0;

    function drawOnce() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, w, h);
      var path = curve.path;
      var pad = curve.pad;
      var drawLen = path.length;
      if (drawLen < 2) return;
      ctx.beginPath();
      ctx.moveTo(path[0].x, path[0].y);
      for (var i = 1; i < drawLen; i++) ctx.lineTo(path[i].x, path[i].y);
      ctx.strokeStyle = "#2ED47A";
      ctx.lineWidth = 2.5;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke();
      ctx.lineTo(path[drawLen - 1].x, h);
      ctx.lineTo(pad.left, h);
      ctx.closePath();
      var grad = ctx.createLinearGradient(0, pad.top, 0, h);
      grad.addColorStop(0, "rgba(46, 212, 122, 0.25)");
      grad.addColorStop(1, "rgba(46, 212, 122, 0)");
      ctx.fillStyle = grad;
      ctx.fill();
    }

    function draw() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, w, h);

      var path = curve.path;
      var pad = curve.pad;
      var totalLen = path.length;

      var drawLen = Math.floor(totalLen * drawProgress);
      if (drawLen < 2) return;

      ctx.beginPath();
      ctx.moveTo(path[0].x, path[0].y);
      for (var i = 1; i < drawLen; i++) {
        ctx.lineTo(path[i].x, path[i].y);
      }

      ctx.strokeStyle = "#2ED47A";
      ctx.lineWidth = 2.5;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke();

      ctx.lineTo(path[drawLen - 1].x, h);
      ctx.lineTo(pad.left, h);
      ctx.closePath();
      var grad = ctx.createLinearGradient(0, pad.top, 0, h);
      grad.addColorStop(0, "rgba(46, 212, 122, 0.25)");
      grad.addColorStop(1, "rgba(46, 212, 122, 0)");
      ctx.fillStyle = grad;
      ctx.fill();

      dotT += 0.003;
      if (dotT > 1) dotT = 0;
      var dotProgress = Math.min(dotT, drawProgress);
      var dot = pointAtLength(path, dotProgress);
      if (dot && drawProgress > 0.05) {
        ctx.save();
        ctx.shadowColor = "#2ED47A";
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = "#2ED47A";
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = "rgba(255,255,255,0.8)";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
      }

      animId = requestAnimationFrame(draw);
    }

    if (staticMode) {
      drawOnce();
      return;
    }

    if (typeof gsap !== "undefined") {
      var obj = { p: 0 };
      gsap.to(obj, { p: 1, duration: 1.8, ease: "power2.out", onUpdate: function () {
        drawProgress = obj.p;
      }, onComplete: function () { drawProgress = 1; }});
    } else {
      drawProgress = 1;
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

  global.AdaptiveCurve = { render: render, destroy: destroy };
})(typeof window !== "undefined" ? window : this);
