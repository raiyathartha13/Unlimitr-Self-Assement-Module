/**
 * HealthEngine — Class-based production backbone
 * UNLIMITR AI Cognitive Backbone v1.0
 * assessment → HealthEngine → behaviorClassifier → narrativeEngine → dashboard
 */
(function (global) {
  "use strict";

  var DEFAULT_KB = {
    version: "1.0",
    identity: { tone: "clinical_compassionate", never: ["fear_based", "shaming", "aggressive_sales"], always: ["empowering", "data_backed", "reversible_language"] },
    scoringWeights: { metabolic: 0.30, hormonal: 0.20, behavioral: 0.20, recovery: 0.15, riskMomentum: 0.15 },
    riskZones: [
      { min: 0, max: 30, label: "Metabolic Strain", color: "deep_red" },
      { min: 31, max: 55, label: "Adaptive Stress", color: "amber" },
      { min: 56, max: 75, label: "Stabilizing", color: "teal" },
      { min: 76, max: 90, label: "Structured Green", color: "green" },
      { min: 91, max: 100, label: "Resilient", color: "emerald" }
    ],
    behaviorTypes: { A: "High Motivation / Low Discipline", B: "Emotional Eating Triggered", C: "Overtrained / Under-recovered", D: "Start-Stop Pattern", E: "High Compliance Candidate" },
    conditionRules: {
      thyroid: { tshHigh: 4, tshVeryHigh: 8, message: "Your metabolism is conserving energy — not failing." },
      diabetes: { preDiabetic: 6.0, diabetic: 6.5, message: "Your glucose curve shows prolonged elevation. Structured carb timing can reverse this trajectory." },
      pcos: { cluster: "cycle_irregular + insulin_resistance", message: "Your hormonal rhythm is desynchronized. With cycle-synced correction, this can be stabilized." }
    },
    planLogic: {
      lowScore: { max: 50, recommend: "6-12 months structured correction" },
      midScore: { max: 70, recommend: "3-6 months structured plan" },
      highScore: { max: 100, recommend: "performance optimization" }
    },
    reportTemplate: {
      opening: "Your biology is responding to signals — not failing.",
      reversibility: "With structured correction, this can improve steadily.",
      confidence: "Your trajectory can move toward 85+ within 12–16 weeks."
    }
  };

  function HealthEngine(userData, knowledgeOverride) {
    this.user = userData || {};
    this.kb = knowledgeOverride || DEFAULT_KB;
  }

  HealthEngine.prototype.calculateHealthScore = function (scores) {
    var w = this.kb.scoringWeights;
    var total =
      (scores.metabolic || 0) * w.metabolic +
      (scores.hormonal || 0) * w.hormonal +
      (scores.behavioral || 0) * w.behavioral +
      (scores.recovery || 0) * w.recovery +
      (scores.riskMomentum || 0) * w.riskMomentum;
    return Math.round(Math.max(0, Math.min(100, total)));
  };

  HealthEngine.prototype.getRiskZone = function (score) {
    var zones = this.kb.riskZones || [];
    for (var i = 0; i < zones.length; i++) {
      if (score >= zones[i].min && score <= zones[i].max) return zones[i];
    }
    return zones[zones.length - 1] || { label: "Unknown", color: "teal" };
  };

  HealthEngine.prototype.recommendPlan = function (score) {
    var pl = this.kb.planLogic || {};
    if (score <= (pl.lowScore && pl.lowScore.max)) return (pl.lowScore && pl.lowScore.recommend) || "6-12 months structured correction";
    if (score <= (pl.midScore && pl.midScore.max)) return (pl.midScore && pl.midScore.recommend) || "3-6 months structured plan";
    return (pl.highScore && pl.highScore.recommend) || "performance optimization";
  };

  HealthEngine.prototype.generateNarrative = function (score, conditionMessage) {
    var t = this.kb.reportTemplate || {};
    var parts = [t.opening || "Your biology is responding to signals — not failing.", "", "Your current health score is " + score + "/100.", ""];
    if (conditionMessage) parts.push(conditionMessage, "");
    parts.push(t.reversibility || "With structured correction, this can improve steadily.", "", t.confidence || "Your trajectory can move toward 85+ within 12–16 weeks.");
    return parts.join("\n");
  };

  HealthEngine.prototype.getConditionMessage = function () {
    var issues = ((this.user.healthIssues || "") + "").toLowerCase();
    var rules = this.kb.conditionRules || {};
    if (issues.indexOf("thyroid") >= 0 && rules.thyroid) return rules.thyroid.message;
    if (issues.indexOf("diabetes") >= 0 && rules.diabetes) return rules.diabetes.message;
    if (issues.indexOf("pcos") >= 0 && rules.pcos) return rules.pcos.message;
    return null;
  };

  HealthEngine.load = function (url) {
    url = url || "core/ai-knowledge-base.json";
    return (typeof fetch !== "undefined"
      ? fetch(url).then(function (r) { return r.json(); }).catch(function () { return DEFAULT_KB; })
      : Promise.resolve(DEFAULT_KB));
  };

  if (typeof window !== "undefined") {
    window.HealthEngine = HealthEngine;
  }
  if (typeof module !== "undefined" && module.exports) {
    module.exports = HealthEngine;
  }
})(typeof window !== "undefined" ? window : this);
