/**
 * Behavioral Intelligence Engine — Human Psychology
 * Dropout Probability, Plateau Risk, Consistency Index, Stress Amplification, Motivation Stability
 */
(function (global) {
  "use strict";

  function toNum(v, def) {
    var n = parseFloat(v);
    return isNaN(n) ? (def != null ? def : 0) : n;
  }

  function calculateBehaviorRisk(data, bio) {
    var dropoutRisk = 0;

    var stress = ((data.stressLevel || "") + "").toLowerCase();
    if (stress === "high" || stress === "very-high") dropoutRisk += 20;
    else if (stress === "moderate") dropoutRisk += 8;

    var sleep = ((data.sleepQuality || "") + "").toLowerCase();
    if (sleep === "poor") dropoutRisk += 15;
    else if (sleep === "inconsistent") dropoutRisk += 8;

    var commitment = (data.commitment || "") + "";
    if (commitment.indexOf("2-3") >= 0 || commitment === "2") dropoutRisk += 10;
    else if (commitment.indexOf("1") >= 0) dropoutRisk += 15;

    var weightGap = bio && bio.weightGap != null ? bio.weightGap : Math.abs(toNum(data.weight) - toNum(data.targetWeight));
    var plateauRisk = weightGap > 15 ? 15 : weightGap > 8 ? 10 : 5;

    var stressAmplification = stress === "very-high" ? 1.4 : stress === "high" ? 1.2 : 1;
    var motivationStability = Math.max(0, 100 - dropoutRisk - plateauRisk * 0.5);

    var consistencyIndex = Math.max(0, Math.min(100, 100 - dropoutRisk));

    return {
      dropoutRisk: Math.min(100, dropoutRisk),
      plateauRisk: Math.min(100, plateauRisk),
      consistencyIndex: consistencyIndex,
      stressAmplificationFactor: stressAmplification,
      motivationStability: Math.min(100, motivationStability)
    };
  }

  function getCommitmentScore(data) {
    var c = (data.commitment || "") + "";
    if (c.indexOf("4-5") >= 0 || c.indexOf("5") >= 0) return 90;
    if (c.indexOf("3-4") >= 0 || c.indexOf("4") >= 0) return 75;
    if (c.indexOf("2-3") >= 0 || c.indexOf("3") >= 0) return 55;
    if (c.indexOf("1-2") >= 0 || c.indexOf("2") >= 0) return 35;
    return 50;
  }

  global.calculateBehaviorRisk = calculateBehaviorRisk;
  global.getCommitmentScore = getCommitmentScore;
  global.BehavioralEngine = { calculate: calculateBehaviorRisk, getCommitmentScore: getCommitmentScore };
})(typeof window !== "undefined" ? window : this);
