/**
 * Narrative Engine — Lightweight scoring + behavior classification
 * ML-feel without heavy ML. Direct import ready.
 * UNLIMITR AI Cognitive Backbone v1.0
 */
(function (global) {
  "use strict";

  function classifyBehavior(user) {
    user = user || {};
    var stress = ((user.stressLevel || "") + "").toLowerCase();
    var sleep = ((user.sleepQuality || "") + "").toLowerCase();
    var commitment = ((user.commitment || "") + "").toLowerCase();

    if (stress === "high" && sleep === "poor") return "B";
    if (commitment.indexOf("2-3") >= 0 || commitment === "2") return "D";
    if (commitment.indexOf("6") >= 0 && sleep === "good") return "E";
    return "A";
  }

  function metabolicScore(user) {
    user = user || {};
    var score = 100;
    var bmi = 22;
    if (user.weight && user.height) {
      var h = parseFloat(user.height) / 100;
      bmi = parseFloat(user.weight) / (h * h);
    }
    if (bmi > 30) score -= 25;
    else if (bmi > 25) score -= 15;
    var sleep = ((user.sleepQuality || "") + "").toLowerCase();
    if (sleep === "poor") score -= 15;
    var stress = ((user.stressLevel || "") + "").toLowerCase();
    if (stress === "high" || stress === "very-high") score -= 15;
    var activity = ((user.activityLevel || "") + "").toLowerCase();
    if (activity === "sedentary" || activity === "low") score -= 20;
    return Math.max(score, 20);
  }

  function hormonalScore(user) {
    user = user || {};
    var s = 85;
    var issues = ((user.healthIssues || "") + "").toLowerCase();
    if (issues.indexOf("thyroid") >= 0) s -= 15;
    if (issues.indexOf("diabetes") >= 0) s -= 20;
    if (issues.indexOf("pcos") >= 0) s -= 15;
    return Math.max(0, Math.min(100, s));
  }

  function behavioralScore(user) {
    user = user || {};
    var commitment = ((user.commitment || "") + "").toLowerCase();
    var type = classifyBehavior(user);
    if (type === "E") return 90;
    if (type === "D") return 50;
    if (type === "B") return 55;
    if (type === "A") return 70;
    return 65;
  }

  function recoveryScore(user) {
    user = user || {};
    var sleep = ((user.sleepQuality || "") + "").toLowerCase();
    var stress = ((user.stressLevel || "") + "").toLowerCase();
    var sleepS = sleep === "restorative" ? 100 : sleep === "good" ? 90 : sleep === "inconsistent" ? 60 : 40;
    var stressS = stress === "low" ? 100 : stress === "moderate" ? 70 : stress === "high" ? 45 : 25;
    return Math.round((sleepS * 0.6 + stressS * 0.4));
  }

  function riskMomentumScore(user) {
    user = user || {};
    var s = 70;
    var bmi = 22;
    if (user.weight && user.height) {
      var h = parseFloat(user.height) / 100;
      bmi = parseFloat(user.weight) / (h * h);
    }
    if (bmi > 30) s -= 25;
    else if (bmi > 25) s -= 15;
    var issues = ((user.healthIssues || "") + "").toLowerCase();
    if (issues.indexOf("diabetes") >= 0) s -= 15;
    return Math.max(0, Math.min(100, s));
  }

  function computeAllScores(user) {
    return {
      metabolic: metabolicScore(user),
      hormonal: hormonalScore(user),
      behavioral: behavioralScore(user),
      recovery: recoveryScore(user),
      riskMomentum: riskMomentumScore(user),
      behaviorType: classifyBehavior(user)
    };
  }

  if (typeof window !== "undefined") {
    window.classifyBehavior = classifyBehavior;
    window.metabolicScore = metabolicScore;
    window.hormonalScore = hormonalScore;
    window.behavioralScore = behavioralScore;
    window.recoveryScore = recoveryScore;
    window.riskMomentumScore = riskMomentumScore;
    window.computeAllScores = computeAllScores;
  }
  if (typeof module !== "undefined" && module.exports) {
    module.exports = { classifyBehavior, metabolicScore, computeAllScores };
  }
})(typeof window !== "undefined" ? window : this);
