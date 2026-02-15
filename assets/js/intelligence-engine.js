/**
 * Intelligence Engine — Core Biological (Deterministic)
 * BMI, BMR, TDEE, Fat Loss Safe Speed, Hormonal Strain, Recovery, Movement, Risk
 */
(function (global) {
  "use strict";

  var ACTIVITY_MULTIPLIER = { sedentary: 1.2, low: 1.2, light: 1.375, moderate: 1.55, high: 1.725 };

  function toNum(v, def) {
    var n = parseFloat(v);
    return isNaN(n) ? (def != null ? def : 0) : n;
  }

  function calculateBiologicalScore(data) {
    var h = toNum(data.height, 172);
    var w = toNum(data.weight, 78);
    var age = toNum(data.age, 30);
    var targetW = toNum(data.targetWeight, w - 8);
    var heightM = h / 100;
    var bmi = w / (heightM * heightM);

    var bmr = (data.gender || "male").toLowerCase() === "male"
      ? 10 * w + 6.25 * h - 5 * age + 5
      : 10 * w + 6.25 * h - 5 * age - 161;

    var activity = ((data.activityLevel || "moderate") + "").toLowerCase();
    var activityMul = ACTIVITY_MULTIPLIER[activity] || 1.55;
    var tdee = bmr * activityMul;

    var weightGap = Math.abs(w - targetW);
    var idealW = 22 * heightM * heightM;

    var metabolicScore = Math.max(0, Math.min(100, 100 - Math.abs(bmi - 22) * 4));
    var sleepScore = getSleepScore(data);
    var stressScore = getStressScore(data);
    var recoveryScore = Math.max(0, Math.min(100, sleepScore - (100 - stressScore) + 50));
    var movementScore = Math.min(100, activityMul * 35);

    var hormonalStrain = 0;
    var issues = (data.healthIssues || "").toLowerCase();
    if (issues.indexOf("thyroid") >= 0) hormonalStrain += 15;
    if (issues.indexOf("diabetes") >= 0) hormonalStrain += 20;
    if (issues.indexOf("pcos") >= 0) hormonalStrain += 15;

    var biologicalScore =
      metabolicScore * 0.4 +
      recoveryScore * 0.3 +
      movementScore * 0.3 -
      hormonalStrain * 0.1;

    return {
      bmi: Math.round(bmi * 10) / 10,
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      weightGap: Math.round(weightGap * 10) / 10,
      idealWeight: Math.round(idealW * 10) / 10,
      metabolicScore: Math.max(0, Math.min(100, metabolicScore)),
      recoveryScore: Math.max(0, Math.min(100, recoveryScore)),
      movementScore: Math.max(0, Math.min(100, movementScore)),
      hormonalStrainIndex: Math.min(100, hormonalStrain * 2),
      biologicalScore: Math.max(0, Math.min(100, biologicalScore)),
      sleepScore: sleepScore,
      stressScore: stressScore,
      activityMultiplier: activityMul
    };
  }

  function getSleepScore(data) {
    var s = ((data.sleepQuality || "") + "").toLowerCase();
    if (s === "poor") return 40;
    if (s === "inconsistent") return 60;
    if (s === "good") return 90;
    if (s === "restorative") return 100;
    return 60;
  }

  function getStressScore(data) {
    var s = ((data.stressLevel || "") + "").toLowerCase();
    if (s === "low") return 100;
    if (s === "moderate") return 70;
    if (s === "high") return 40;
    if (s === "very-high") return 20;
    return 70;
  }

  function getRiskIndex(biologicalScore) {
    if (biologicalScore >= 80) return { label: "Optimal", value: 1 };
    if (biologicalScore >= 60) return { label: "Moderate", value: 2 };
    if (biologicalScore >= 40) return { label: "Elevated", value: 3 };
    return { label: "High Risk", value: 4 };
  }

  global.calculateBiologicalScore = calculateBiologicalScore;
  global.IntelligenceEngine = { calculate: calculateBiologicalScore, getRiskIndex: getRiskIndex };
})(typeof window !== "undefined" ? window : this);
