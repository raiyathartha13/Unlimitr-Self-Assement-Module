/**
 * Health Scoring — 5-Dimension Human State Model
 * Metabolic | Hormonal | Behavioral | Recovery | Risk Momentum
 * UNLIMITR AI Cognitive Backbone v1.0
 */
(function (global) {
  "use strict";

  var WEIGHTS = { Metabolic: 0.30, Hormonal: 0.20, Behavioral: 0.20, Recovery: 0.15, RiskMomentum: 0.15 };

  function toNum(v, def) {
    var n = parseFloat(v);
    return isNaN(n) ? (def != null ? def : 0) : n;
  }

  function getMetabolicScore(data) {
    var h = toNum(data.height, 172) / 100;
    var w = toNum(data.weight, 78);
    var bmi = w / (h * h);
    var targetW = toNum(data.targetWeight, w - 8);
    var weightGap = Math.abs(w - targetW);
    var metabolicBase = Math.max(0, Math.min(100, 100 - Math.abs(bmi - 22) * 4));
    var gapPenalty = Math.min(20, weightGap * 1.5);
    return Math.max(0, Math.min(100, metabolicBase - gapPenalty));
  }

  function getHormonalStability(data) {
    var issues = ((data.healthIssues || "") + "").toLowerCase();
    var base = 85;
    if (issues.indexOf("thyroid") >= 0) {
      var tsh = toNum(data.tshLevel, 5);
      if (tsh > 8) base -= 35;
      else if (tsh > 4) base -= 20;
      else base -= 10;
    }
    if (issues.indexOf("diabetes") >= 0) {
      var hba1c = toNum(data.hba1cLevel, 6);
      if (hba1c >= 6.5) base -= 30;
      else if (hba1c >= 6.0) base -= 15;
      else base -= 5;
    }
    if (issues.indexOf("pcos") >= 0) {
      base -= 15;
      if (((data.insulinResistance || "") + "").toLowerCase() === "yes") base -= 10;
    }
    var menstrual = ((data.menstrualCycle || "") + "").toLowerCase();
    if (menstrual === "irregular") base -= 5;
    if (menstrual === "missed") base -= 10;
    return Math.max(0, Math.min(100, base));
  }

  function getBehavioralConsistency(data) {
    var commitment = ((data.commitment || "4-5") + "").toLowerCase();
    var stress = ((data.stressLevel || "") + "").toLowerCase();
    var sleep = ((data.sleepQuality || "") + "").toLowerCase();
    var pastAttempts = toNum(data.pastFailedAttempts, 1);
    var c = commitment.indexOf("6-7") >= 0 ? 90 : commitment.indexOf("4-5") >= 0 ? 75 : commitment.indexOf("2-3") >= 0 ? 50 : 65;
    var s = stress === "very-high" ? 30 : stress === "high" ? 45 : stress === "moderate" ? 65 : 85;
    var sl = sleep === "poor" ? 40 : sleep === "inconsistent" ? 55 : sleep === "good" ? 85 : 95;
    var attemptPenalty = Math.min(15, pastAttempts * 5);
    return Math.max(0, Math.min(100, (c * 0.3 + s * 0.35 + sl * 0.35) - attemptPenalty));
  }

  function getRecoveryQuality(data) {
    var sleep = ((data.sleepQuality || "") + "").toLowerCase();
    var stress = ((data.stressLevel || "") + "").toLowerCase();
    var sleepScore = sleep === "restorative" ? 100 : sleep === "good" ? 90 : sleep === "inconsistent" ? 60 : 40;
    var stressScore = stress === "low" ? 100 : stress === "moderate" ? 70 : stress === "high" ? 45 : 25;
    return Math.max(0, Math.min(100, (sleepScore * 0.6 + stressScore * 0.4)));
  }

  function getRiskMomentum(data) {
    var score = 70;
    var issues = ((data.healthIssues || "") + "").toLowerCase();
    var bmi = 22;
    if (data.weight && data.height) {
      var h = toNum(data.height, 172) / 100;
      bmi = toNum(data.weight, 78) / (h * h);
    }
    if (bmi > 30) score -= 25;
    else if (bmi > 25) score -= 15;
    if (issues.indexOf("diabetes") >= 0) score -= 15;
    if (issues.indexOf("thyroid") >= 0) score -= 10;
    if (issues.indexOf("pcos") >= 0) score -= 10;
    return Math.max(0, Math.min(100, score));
  }

  function calculateHealthScore(data) {
    var metabolic = getMetabolicScore(data);
    var hormonal = getHormonalStability(data);
    var behavioral = getBehavioralConsistency(data);
    var recovery = getRecoveryQuality(data);
    var riskMomentum = getRiskMomentum(data);

    var healthScore =
      WEIGHTS.Metabolic * metabolic +
      WEIGHTS.Hormonal * hormonal +
      WEIGHTS.Behavioral * behavioral +
      WEIGHTS.Recovery * recovery +
      WEIGHTS.RiskMomentum * riskMomentum;

    return {
      dimensions: {
        Metabolic: Math.round(metabolic * 10) / 10,
        Hormonal: Math.round(hormonal * 10) / 10,
        Behavioral: Math.round(behavioral * 10) / 10,
        Recovery: Math.round(recovery * 10) / 10,
        RiskMomentum: Math.round(riskMomentum * 10) / 10
      },
      healthScore: Math.max(0, Math.min(100, Math.round(healthScore * 10) / 10)),
      weights: WEIGHTS
    };
  }

  if (typeof window !== "undefined") {
    window.CognitiveHealthScoring = calculateHealthScore;
    window.getMetabolicScore = getMetabolicScore;
    window.getHormonalStability = getHormonalStability;
    window.getBehavioralConsistency = getBehavioralConsistency;
    window.getRecoveryQuality = getRecoveryQuality;
    window.getRiskMomentum = getRiskMomentum;
  }
})(typeof window !== "undefined" ? window : this);
