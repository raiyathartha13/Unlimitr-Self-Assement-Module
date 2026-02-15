/**
 * SemiArcCard — Reusable premium semi-circle card
 * BMI, Metabolic Age, Risk Index — independent arcs, glow, pulse
 */
(function (global) {
  "use strict";

  function getRiskGradient(type, value, label) {
    if (type === "risk") {
      if (label === "High Risk" || label === "Elevated") return { from: "#FF4D4D", to: "#FF9A9A" };
      if (label === "Moderate") return { from: "#FFB547", to: "#FFD27D" };
      return { from: "#2ED47A", to: "#6EF3A5" };
    }
    if (type === "bmi") {
      var bmi = parseFloat(value) || 22;
      if (bmi >= 30) return { from: "#FF4D4D", to: "#FF9A9A" };
      if (bmi >= 25) return { from: "#FFB547", to: "#FFD27D" };
      return { from: "#2ED47A", to: "#6EF3A5" };
    }
    if (type === "metaAge") {
      var age = parseInt(value, 10) || 30;
      if (age > 45) return { from: "#FF4D4D", to: "#FF9A9A" };
      if (age > 35) return { from: "#FFB547", to: "#FFD27D" };
      return { from: "#2ED47A", to: "#6EF3A5" };
    }
    return { from: "#2ED47A", to: "#6EF3A5" };
  }

  function getNormalizedPct(type, value, label) {
    if (type === "bmi") {
      var bmi = parseFloat(value) || 22;
      return Math.min(1, Math.max(0, (bmi - 18) / 22));
    }
    if (type === "metaAge") {
      var age = parseInt(value, 10) || 30;
      return Math.min(1, Math.max(0, (age - 25) / 40));
    }
    if (type === "risk") {
      if (label === "High Risk") return 0.9;
      if (label === "Elevated") return 0.7;
      if (label === "Moderate") return 0.5;
      return 0.2;
    }
    return 0.5;
  }

  function render(containerEl, options) {
    if (!containerEl || !options) return;
    var type = options.type || "bmi";
    var value = options.value;
    var label = options.label;
    var tooltip = options.tooltip || "";
    var invert = options.invert === true;

    var g = getRiskGradient(type, value, label);
    var pct = getNormalizedPct(type, value, label);
    if (invert) pct = 1 - pct;
    pct = Math.max(0, Math.min(1, pct));
    var dashLen = pct * 141;
    var isHighRisk = type === "risk" && (label === "High Risk" || label === "Elevated");
    var pulseClass = isHighRisk ? " premium-semi-pulse premium-semi-risk-glow" : "";

    var html = '<div class="premium-semi-card' + pulseClass + '" data-type="' + type + '">' +
      '<div class="premium-semi-glow"></div>' +
      '<svg class="premium-semi-arc" viewBox="0 0 100 60" width="100%" height="60" preserveAspectRatio="xMidYMax meet">' +
      '<defs>' +
      '<linearGradient id="semiGrad-' + type + '" x1="0%" y1="0%" x2="100%" y2="0%">' +
      '<stop offset="0%" stop-color="' + g.from + '"/>' +
      '<stop offset="100%" stop-color="' + g.to + '"/>' +
      '</linearGradient>' +
      '</defs>' +
      '<path class="premium-semi-track" d="M 10 52 A 45 45 0 0 1 90 52" fill="none" stroke="rgba(13,50,86,0.06)" stroke-width="6" stroke-linecap="round"/>' +
      '<path class="premium-semi-fill" d="M 10 52 A 45 45 0 0 1 90 52" fill="none" stroke="url(#semiGrad-' + type + ')" stroke-width="6" stroke-linecap="round" stroke-dasharray="' + dashLen + ' 141"/>' +
      '</svg>' +
      '<div class="premium-semi-value">' + (type === "risk" ? (label || value || "—") : (value != null ? value : "—")) + '</div>' +
      '<div class="premium-semi-label">' + (type === "risk" ? "Risk Index" : (label || type)) + '</div>' +
      (tooltip ? '<div class="premium-semi-tooltip-wrap"><span class="journey-tooltip-icon premium-semi-tip" tabindex="0" aria-label="Info">i</span><div class="journey-tooltip-bubble">' + tooltip + '</div></div>' : '') +
      '</div>';

    containerEl.innerHTML = html;

    var cardEl = containerEl.querySelector(".premium-semi-card");
    var fillPath = containerEl.querySelector(".premium-semi-fill");
    if (fillPath) fillPath.setAttribute("stroke-dasharray", dashLen + " 141");
    if (!window.STATIC_LAYOUT_MODE && fillPath && typeof gsap !== "undefined") {
      gsap.fromTo(fillPath, { strokeDasharray: "0 141" }, { strokeDasharray: dashLen + " 141", duration: 1.2, ease: "power2.out", delay: 0.3 + Math.random() * 0.2 });
    }
    if (!window.STATIC_LAYOUT_MODE && cardEl && typeof gsap !== "undefined") {
      gsap.to(cardEl, { scale: 1.02, duration: 0.6, yoyo: true, repeat: -1, repeatDelay: 5, ease: "power1.inOut" });
    }

    var tipWrap = containerEl.querySelector(".premium-semi-tooltip-wrap");
    if (tipWrap) {
      var tip = tipWrap.querySelector(".premium-semi-tip");
      var bubble = tipWrap.querySelector(".journey-tooltip-bubble");
      if (tip && bubble) {
        tip.addEventListener("click", function () { tipWrap.classList.toggle("tooltip-open"); });
      }
    }
  }

  global.SemiArcCard = { render: render };
})(typeof window !== "undefined" ? window : this);
