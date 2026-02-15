/**
 * Risk Gradient — Ambient Color Intelligence
 * Deep Metabolic Red | Adaptive Amber | Stabilizing Teal | Structured Green | Resilient Emerald
 * UNLIMITR AI Cognitive Backbone v1.0 — Soft glow, 1.2s easing, 6s micro-pulse
 */
(function (global) {
  "use strict";

  var BANDS = [
    { min: 0, max: 30, name: "Deep Metabolic Red", color: "#C24A4A", glow: "rgba(194,74,74,0.25)", cssVar: "--risk-deep-red" },
    { min: 31, max: 55, name: "Adaptive Amber", color: "#D4A84B", glow: "rgba(212,168,75,0.2)", cssVar: "--risk-amber" },
    { min: 56, max: 75, name: "Stabilizing Teal", color: "#3BA99C", glow: "rgba(59,169,156,0.2)", cssVar: "--risk-teal" },
    { min: 76, max: 90, name: "Structured Green", color: "#2ED47A", glow: "rgba(46,212,122,0.2)", cssVar: "--risk-green" },
    { min: 91, max: 100, name: "Resilient Emerald", color: "#1A9B6B", glow: "rgba(26,155,107,0.25)", cssVar: "--risk-emerald" }
  ];

  function getBand(score) {
    score = Math.max(0, Math.min(100, score));
    for (var i = 0; i < BANDS.length; i++) {
      if (score >= BANDS[i].min && score <= BANDS[i].max) return BANDS[i];
    }
    return BANDS[BANDS.length - 1];
  }

  function getColor(score) {
    return getBand(score).color;
  }

  function getGlow(score) {
    return getBand(score).glow;
  }

  function getCSSVariables(score) {
    var band = getBand(score);
    return {
      "--risk-color": band.color,
      "--risk-glow": band.glow,
      "--risk-band": band.name,
      "--risk-animate-duration": "1.2s",
      "--risk-pulse-interval": "6s"
    };
  }

  function applyToElement(el, score) {
    if (!el || !el.style) return;
    var vars = getCSSVariables(score);
    for (var k in vars) el.style.setProperty(k, vars[k]);
  }

  if (typeof window !== "undefined") {
    window.RiskGradient = {
      getBand: getBand,
      getColor: getColor,
      getGlow: getGlow,
      getCSSVariables: getCSSVariables,
      applyToElement: applyToElement,
      BANDS: BANDS
    };
  }
})(typeof window !== "undefined" ? window : this);
