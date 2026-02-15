/**
 * LiveCard — Half-circle gauges + 3D gradient bars for high-intent live cards
 * Supports: half-circle 16-segment gauge, 3D gradient bar with thumb, metrics row
 */
(function (global) {
  "use strict";

  var SEGMENTS = 16;

  function getScoreLabel(score) {
    if (score >= 80) return "Excellent";
    if (score >= 65) return "Good";
    if (score >= 50) return "Fair";
    return "Poor";
  }

  function getSegmentColor(score, index, filledCount, invertColors) {
    if (index >= filledCount) return "#E8ECF0";
    var pct = index / Math.max(1, filledCount);
    var s = invertColors ? 100 - score : score;
    var base = "#7DD171";
    if (s < 50) base = "#FF7B7B";
    else if (s < 65) base = "#FFB547";
    else if (s < 80) base = "#A8E88A";
    if (typeof window.RiskGradient !== "undefined" && window.RiskGradient.getColor) {
      base = window.RiskGradient.getColor(invertColors ? 100 - score : score);
    }
    return pct < 0.6 ? base : lightenHex(base, 0.15);
  }

  function lightenHex(hex, amt) {
    if (!hex || hex.length < 7) return hex;
    var num = parseInt(hex.slice(1), 16);
    if (isNaN(num)) return hex;
    var r = Math.min(255, ((num >> 16) & 0xff) + Math.round(255 * amt));
    var g = Math.min(255, ((num >> 8) & 0xff) + Math.round(255 * amt));
    var b = Math.min(255, (num & 0xff) + Math.round(255 * amt));
    return "#" + (0x1000000 + r * 0x10000 + g * 0x100 + b).toString(16).slice(1);
  }

  /**
   * Renders a half-circle gauge live card
   * opts: { title, score, label?, metrics: [{label, value}], glow?, expandable? }
   */
  function renderHalfCircle(containerEl, opts) {
    if (!containerEl) return null;
    opts = opts || {};
    var score = Math.max(0, Math.min(100, opts.score || 0));
    var invertColors = !!opts.invertColors;
    var label = opts.label != null ? opts.label : getScoreLabel(score);
    var filledCount = Math.round((score / 100) * SEGMENTS);
    filledCount = Math.max(0, Math.min(SEGMENTS, filledCount));

    var segmentsHtml = "";
    var arcRadius = 48;
    var arcCx = 100;
    var arcCy = 88;
    var startAngle = Math.PI;
    var angleStep = Math.PI / (SEGMENTS + 1);
    var segWidth = 6;
    var segHeight = 14;

    for (var i = 0; i < SEGMENTS; i++) {
      var angle = startAngle + angleStep * (i + 1);
      var x = arcCx + Math.cos(angle) * arcRadius - segWidth / 2;
      var y = arcCy - Math.sin(angle) * arcRadius * 0.5 - segHeight / 2;
      var rot = (angle - Math.PI / 2) * (180 / Math.PI);
      var fill = getSegmentColor(score, i, filledCount, invertColors);
      segmentsHtml += '<rect class="live-gauge-segment" x="' + x + '" y="' + y + '" width="' + segWidth + '" height="' + segHeight + '" rx="2" fill="' + fill + '" transform="rotate(' + rot + ' ' + (x + segWidth / 2) + ' ' + (y + segHeight / 2) + ')"/>';
    }

    var metricsHtml = "";
    var metrics = opts.metrics || [];
    var explanation = opts.explanation || "";
    metrics.forEach(function (m) {
      metricsHtml += '<div class="live-card-metric"><span class="live-card-metric-label">' + (m.label || "") + '</span><span class="live-card-metric-value">' + (m.value != null ? m.value : "--") + '</span></div>';
    });
    if (metrics.length === 0 && !explanation) {
      metricsHtml = '<div class="live-card-metric"><span class="live-card-metric-label">Score</span><span class="live-card-metric-value live-count-up">' + score + '%</span></div>';
    }

    var bottomSection = "";
    if (explanation) {
      bottomSection = '<div class="live-card-explanation">' + explanation + '</div>';
    } else if (metrics.length > 0) {
      bottomSection = '<div class="live-card-metrics">' + metricsHtml + '</div>';
    } else {
      bottomSection = '<div class="live-card-metrics">' + metricsHtml + '</div>';
    }

    var glow = opts.glow ? ' style="--card-glow: ' + (opts.glowColor || "rgba(46, 212, 122, 0.08)") + '"' : "";
    var pulseClass = opts.pulse ? " live-card-pulse" : "";
    var shimmerClass = opts.shimmer !== false ? " live-card-has-shimmer" : "";
    var expandable = opts.expandable === true && !explanation;

    var html = '<div class="live-card live-card--half-circle live-card-stagger' + pulseClass + shimmerClass + (explanation ? ' live-card--with-explanation' : '') + '" data-score="' + score + '" data-type="gauge"' + glow + '>' +
      (opts.shimmer !== false ? '<div class="live-card-shimmer"></div>' : '') +
      (opts.glow ? '<div class="live-card-glow"></div>' : '') +
      '<div class="live-card-header">' +
      '<span class="live-card-title">' + (opts.title || "Score") + '</span>' +
      (expandable ? '<button type="button" class="live-card-expand" aria-label="Expand">↗</button>' : '') +
      '</div>' +
      '<div class="live-card-gauge-wrap">' +
      '<svg class="live-gauge-svg" viewBox="0 0 200 130" width="100%" height="140" preserveAspectRatio="xMidYMax meet">' +
      '<g class="live-gauge-segments">' + segmentsHtml + '</g>' +
      '<path class="live-gauge-dotted" d="M 52 88 A 48 24 0 0 1 148 88" fill="none" stroke="#B8E6B8" stroke-width="2" stroke-dasharray="4 4" stroke-linecap="round"/>' +
      '</svg>' +
      '<div class="live-card-score">' +
      '<span class="live-card-score-label">' + label + '</span>' +
      '<span class="live-card-score-value live-count-up">' + score + (opts.suffix || "%") + '</span>' +
      '</div></div>' +
      bottomSection +
      '</div>';

    containerEl.innerHTML = html;
    var card = containerEl.querySelector(".live-card");

    if (!window.STATIC_LAYOUT_MODE && typeof gsap !== "undefined") {
      var segments = containerEl.querySelectorAll(".live-gauge-segment");
      segments.forEach(function (seg, i) {
        var fill = seg.getAttribute("fill");
        if (fill && fill !== "#E8ECF0") {
          gsap.fromTo(seg, { opacity: 0, scale: 0.7, transformOrigin: "center" }, { opacity: 1, scale: 1, duration: 0.55, delay: 0.04 * i, ease: "back.out(1.4)" });
        }
      });
      var valEls = containerEl.querySelectorAll(".live-count-up");
      valEls.forEach(function (el, idx) {
        var text = (el.textContent || "").replace(/%/g, "").trim();
        var num = parseInt(text, 10);
        if (!isNaN(num) && num >= 0 && num <= 100) {
          var obj = { v: 0 };
          var suffix = (el.textContent || "").indexOf("%") >= 0 ? "%" : "";
          gsap.to(obj, { v: num, duration: 1.4, ease: "power3.out", delay: 0.25 + idx * 0.04, snap: { v: 1 }, onUpdate: function () {
            el.textContent = Math.round(obj.v) + suffix;
          } });
        }
      });
    }

    return card;
  }

  /**
   * Renders a 3D gradient bar live card
   * opts: { title, subTitle?, value, min, max, thresholds: [num], labels: [str], status?, unit?, glow? }
   */
  function renderGradientBar(containerEl, opts) {
    if (!containerEl) return null;
    opts = opts || {};
    var val = parseFloat(opts.value);
    var min = parseFloat(opts.min) || 0;
    var max = parseFloat(opts.max) || 100;
    var thresholds = opts.thresholds || [min + (max - min) * 0.33, min + (max - min) * 0.66];
    var labels = opts.labels || [min, thresholds[0], thresholds[1], max];
    var unit = opts.unit || "";

    var range = max - min || 1;
    var pct = Math.max(0, Math.min(100, ((val - min) / range) * 100));

    var pulseClass = opts.pulse ? " live-card-pulse" : "";
    var shimmerClass = opts.shimmer !== false ? " live-card-has-shimmer" : "";
    var glow = opts.glow ? ' style="--card-glow: ' + (opts.glowColor || "rgba(46, 212, 122, 0.08)") + '"' : "";

    var labelsHtml = labels.map(function (l) { return '<span>' + l + '</span>'; }).join("");

    var html = '<div class="live-card live-card--gradient-bar live-card-stagger' + pulseClass + shimmerClass + '" data-type="bar" data-value="' + val + '"' + glow + '>' +
      (opts.shimmer !== false ? '<div class="live-card-shimmer"></div>' : '') +
      (opts.glow ? '<div class="live-card-glow"></div>' : '') +
      '<div class="live-card-header">' +
      '<span class="live-card-title">' + (opts.title || "Metric") + '</span>' +
      (opts.expandable === true ? '<button type="button" class="live-card-expand" aria-label="Expand">↗</button>' : '') +
      '</div>' +
      '<div class="live-card-bar-wrap">' +
      (opts.subTitle ? '<div class="live-card-bar-title">' + opts.subTitle + '</div>' : '') +
      '<div class="live-card-bar-track">' +
      '<div class="live-card-bar-thumb" style="left:' + pct + '%"></div>' +
      '</div>' +
      '<div class="live-card-bar-labels">' + labelsHtml + '</div>' +
      '<div class="live-card-bar-value live-count-up">' + (isNaN(val) ? "—" : val + unit) + '</div>' +
      (opts.status ? '<div class="small muted mt-1">' + opts.status + '</div>' : '') +
      '</div></div>';

    containerEl.innerHTML = html;
    var card = containerEl.querySelector(".live-card");

    if (!window.STATIC_LAYOUT_MODE && typeof gsap !== "undefined") {
      var thumb = containerEl.querySelector(".live-card-bar-thumb");
      if (thumb) {
        gsap.fromTo(thumb, { left: "0%", opacity: 0 }, { left: pct + "%", opacity: 1, duration: 1.3, ease: "power3.out", delay: 0.3 });
      }
      var valEl = containerEl.querySelector(".live-card-bar-value");
      if (valEl && !isNaN(val)) {
        var obj = { v: min };
        gsap.to(obj, { v: val, duration: 1.2, ease: "power2.out", delay: 0.2, onUpdate: function () {
          valEl.textContent = (Math.round(obj.v * 10) / 10) + unit;
        } });
      }
    }

    return card;
  }

  /**
   * Render multiple cards into a grid
   */
  function renderGrid(containerEl, cards, options) {
    if (!containerEl) return;
    options = options || {};
    var gridClass = "live-cards-grid" + (options.gridClass ? " " + options.gridClass : "");
    var html = '<div class="' + gridClass + '"></div>';
    containerEl.innerHTML = html;
    var grid = containerEl.querySelector(".live-cards-grid");

    cards.forEach(function (c) {
      var wrap = document.createElement("div");
      wrap.className = "live-card-wrap";
      if (c.type === "gauge" || c.type === "half-circle") {
        renderHalfCircle(wrap, c.opts || c);
      } else {
        renderGradientBar(wrap, c.opts || c);
      }
      grid.appendChild(wrap);
    });

    if (!window.STATIC_LAYOUT_MODE && typeof gsap !== "undefined") {
      var items = grid.querySelectorAll(".live-card");
      gsap.fromTo(items, { opacity: 0, y: 24, scale: 0.97 }, { opacity: 1, y: 0, scale: 1, duration: 0.7, stagger: 0.06, ease: "back.out(1.2)", delay: 0.15 });
    }
  }

  global.LiveCard = {
    renderHalfCircle: renderHalfCircle,
    renderGradientBar: renderGradientBar,
    renderGrid: renderGrid,
    SEGMENTS: SEGMENTS
  };
})(typeof window !== "undefined" ? window : this);
