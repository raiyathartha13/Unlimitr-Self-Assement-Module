/**
 * Bio State — Master state for Biotech Intelligence Layer
 * All engines read from this. No random animation. Everything reactive.
 */
(function () {
  "use strict";

  var state = {
    bmiRisk: 0.5,
    hormoneRisk: 0.4,
    insulinRisk: 0.3,
    recoveryRisk: 0.4,
    cardioRisk: 0.3,
    inflammationRisk: 0.2,
    stress: 0.3,
    adherence: 0.7,
    relapseRisk: 0.2,
    morphLevel: 0
  };

  function fromAssessmentData(data) {
    if (!data) return;
    var issues = (data.healthIssues || "").toLowerCase();
    var stress = (data.stressLevel || "").toLowerCase();
    var bmi = 0.3;
    if (data.weight && data.height) {
      var h = parseFloat(data.height) / 100;
      bmi = Math.min(1, Math.max(0, (parseFloat(data.weight) / (h * h) - 18) / 25));
    }
    state.bmiRisk = bmi;
    state.stress = stress === "very-high" ? 0.8 : stress === "high" ? 0.6 : stress === "moderate" ? 0.3 : 0.1;
    state.hormoneRisk = issues.indexOf("thyroid") >= 0 || issues.indexOf("pcos") >= 0 ? 0.6 : 0.3;
    state.insulinRisk = issues.indexOf("diabetes") >= 0 ? 0.6 : 0.2;
    state.cardioRisk = (issues.indexOf("heart") >= 0 || issues.indexOf("bp") >= 0) ? 0.5 : 0.2;
    if (typeof window.computeBehaviorPredictions === "function") {
      try {
        var p = window.computeBehaviorPredictions(data);
        state.adherence = (p.adherence || 70) / 100;
        state.relapseRisk = (p.relapse || 20) / 100;
      } catch (e) {}
    }
    if (typeof window.computeBodyRisks === "function") {
      try {
        var risks = window.computeBodyRisks(data);
        state.bmiRisk = (risks[0] || 50) / 100;
        state.hormoneRisk = (risks[1] || 40) / 100;
        state.insulinRisk = (risks[2] || 30) / 100;
        state.recoveryRisk = (risks[3] || 40) / 100;
        state.cardioRisk = (risks[4] || 30) / 100;
        state.inflammationRisk = (risks[5] || 20) / 100;
      } catch (e) {}
    }
  }

  function getTotalRisk() {
    return (state.bmiRisk + state.hormoneRisk + state.insulinRisk +
      state.recoveryRisk + state.cardioRisk + state.inflammationRisk) / 6;
  }

  function setMorphLevel(p) {
    state.morphLevel = Math.max(0, Math.min(1, p));
  }

  if (typeof window !== "undefined") {
    window.BioState = {
      state: state,
      fromAssessmentData: fromAssessmentData,
      getTotalRisk: getTotalRisk,
      setMorphLevel: setMorphLevel
    };
  }
})();
