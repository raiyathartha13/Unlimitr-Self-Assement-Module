/**
 * ScoreEngine — Metabolic Health Score (Nutrition Overview style)
 * Segmented arc gauge (16 segments), label + percentage, metrics row
 */
(function (global) {
  "use strict";

  var SEGMENTS = 16;
  var container = null;
  var currentScore = 0;

  function getScoreLabel(score) {
    if (score >= 80) return "Excellent";
    if (score >= 65) return "Good";
    if (score >= 50) return "Fair";
    return "Poor";
  }

  function getSegmentColor(score, index, filledCount) {
    if (index >= filledCount) return "#E8ECF0";
    var pct = index / Math.max(1, filledCount);
    if (typeof window.RiskGradient !== "undefined" && window.RiskGradient.getColor) {
      var base = window.RiskGradient.getColor(score);
      return pct < 0.6 ? base : lightenHex(base, 0.15);
    }
    if (score >= 65) return pct < 0.5 ? "#7DD171" : pct < 0.8 ? "#A8E88A" : "#C8F0B8";
    if (score >= 50) return pct < 0.5 ? "#FFB547" : pct < 0.8 ? "#FFD27D" : "#FFE5A8";
    return pct < 0.5 ? "#FF7B7B" : pct < 0.8 ? "#FF9A9A" : "#FFB8B8";
  }
  function lightenHex(hex, amt) {
    var num = parseInt(hex.slice(1), 16);
    if (isNaN(num)) return hex;
    var r = Math.min(255, ((num >> 16) & 0xff) + Math.round(255 * amt));
    var g = Math.min(255, ((num >> 8) & 0xff) + Math.round(255 * amt));
    var b = Math.min(255, (num & 0xff) + Math.round(255 * amt));
    return "#" + (0x1000000 + r * 0x10000 + g * 0x100 + b).toString(16).slice(1);
  }

  function render(containerEl, scoreOrOptions) {
    if (!containerEl) return;
    container = containerEl;
    var opts = typeof scoreOrOptions === "number" ? { score: scoreOrOptions } : (scoreOrOptions || {});
    var score = Math.max(0, Math.min(100, opts.score || 0));
    currentScore = score;
    var bmi = opts.bmi != null ? (typeof opts.bmi === "number" ? opts.bmi.toFixed(1) : opts.bmi) : "--";
    var metabolicAge = opts.metabolicAge != null ? opts.metabolicAge : "--";
    var riskLabel = opts.riskLabel || opts.risk || "--";

    var label = getScoreLabel(score);
    var filledCount = Math.round((score / 100) * SEGMENTS);
    filledCount = Math.max(0, Math.min(SEGMENTS, filledCount));

    var staticMode = window.STATIC_LAYOUT_MODE === true;
    var tooltipText = "This score reflects metabolic health, hormonal balance, recovery status and lifestyle alignment. It measures internal efficiency — not just weight.";

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
      var fill = getSegmentColor(score, i, filledCount);
      segmentsHtml += '<rect class="nutrition-segment" x="' + x + '" y="' + y + '" width="' + segWidth + '" height="' + segHeight + '" rx="2" fill="' + fill + '" transform="rotate(' + rot + ' ' + (x + segWidth / 2) + ' ' + (y + segHeight / 2) + ')"/>';
    }

    var html = '<div class="nutrition-style-score-card premium-score-card" data-score="' + score + '">' +
      '<div class="nutrition-score-header">' +
      '<span class="nutrition-score-title">Your Current Metabolic Health Score</span>' +
      '<div class="nutrition-score-actions">' +
      '<div class="journey-tooltip-wrap"><span class="journey-tooltip-icon" tabindex="0" role="button" aria-label="Info">i</span><div class="journey-tooltip-bubble">' + tooltipText + '</div></div>' +
      '<button type="button" class="nutrition-expand-btn" aria-label="Expand">↗</button>' +
      '</div></div>' +
      '<div class="nutrition-gauge-wrap">' +
      '<svg class="nutrition-gauge-svg" viewBox="0 0 200 130" width="100%" height="140" preserveAspectRatio="xMidYMax meet">' +
      '<g class="nutrition-segments">' + segmentsHtml + '</g>' +
      '<path class="nutrition-dotted-line" d="M 52 88 A 48 24 0 0 1 148 88" fill="none" stroke="#B8E6B8" stroke-width="2" stroke-dasharray="4 4" stroke-linecap="round"/>' +
      '</svg>' +
      '<div class="nutrition-score-display">' +
      '<span class="nutrition-score-label">' + label + '</span>' +
      '<span class="nutrition-score-pct">' + score + '%</span>' +
      '</div></div>' +
      '<div class="nutrition-metrics-row">' +
      '<div class="nutrition-metric"><span class="nutrition-metric-label">BMI</span><span class="nutrition-metric-value">' + bmi + '</span></div>' +
      '<div class="nutrition-metric"><span class="nutrition-metric-label">Metabolic Age</span><span class="nutrition-metric-value">' + metabolicAge + '</span></div>' +
      '<div class="nutrition-metric"><span class="nutrition-metric-label">Risk Index</span><span class="nutrition-metric-value">' + riskLabel + '</span></div>' +
      '</div></div>';

    container.innerHTML = html;

    if (!staticMode && typeof gsap !== "undefined") {
      var segments = container.querySelectorAll(".nutrition-segment");
      segments.forEach(function (seg, i) {
        var fill = seg.getAttribute("fill");
        if (fill && fill !== "#E8ECF0") {
          gsap.fromTo(seg, { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.4, delay: 0.05 * i, ease: "power2.out" });
        }
      });
      var pctEl = container.querySelector(".nutrition-score-pct");
      if (pctEl) {
        var obj = { v: 0 };
        gsap.to(obj, { v: score, duration: 1.2, ease: "power2.out", delay: 0.2, snap: { v: 1 }, onUpdate: function () {
          pctEl.textContent = Math.round(obj.v) + "%";
        }});
      }
    }

    var tipWrap = container.querySelector(".journey-tooltip-wrap");
    if (tipWrap) {
      var icon = tipWrap.querySelector(".journey-tooltip-icon");
      if (icon) icon.addEventListener("click", function () { tipWrap.classList.toggle("tooltip-open"); });
    }
  }

  function destroy() {
    container = null;
  }

  function updateScore(score) {
    currentScore = Math.max(0, Math.min(100, score || 0));
    var labelEl = container && container.querySelector(".nutrition-score-label");
    var pctEl = container && container.querySelector(".nutrition-score-pct");
    if (labelEl) labelEl.textContent = getScoreLabel(currentScore);
    if (pctEl) pctEl.textContent = Math.round(currentScore) + "%";
    var card = container ? container.querySelector(".nutrition-style-score-card") : null;
    if (card) {
      var filledCount = Math.round((currentScore / 100) * SEGMENTS);
      filledCount = Math.max(0, Math.min(SEGMENTS, filledCount));
      var segments = card.querySelectorAll(".nutrition-segment");
      segments.forEach(function (seg, i) {
        seg.setAttribute("fill", getSegmentColor(currentScore, i, filledCount));
      });
    }
  }

  global.ScoreEngine = { render: render, destroy: destroy, updateScore: updateScore };
})(typeof window !== "undefined" ? window : this);
