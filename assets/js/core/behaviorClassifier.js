/**
 * Behavior Classifier — Type A–E Psychology
 * High Motivation/Low Discipline | Emotional Eating | Overtrained | Start-Stop | High Compliance
 * UNLIMITR AI Cognitive Backbone v1.0
 */
(function (global) {
  "use strict";

  var TYPES = {
    A: { name: "High Motivation / Low Discipline", narrative: "Structure will unlock your motivation.", tone: "structure-focused" },
    B: { name: "Emotional Eating Triggered", narrative: "Your eating pattern shifts under stress. We can stabilize that.", tone: "stress-aware" },
    C: { name: "Overtrained / Under-recovered", narrative: "Recovery is your next gain. Less can be more.", tone: "recovery-focused" },
    D: { name: "Start-Stop Pattern", narrative: "You don't lack discipline. You lack structure.", tone: "structure-focused" },
    E: { name: "High Compliance Candidate", narrative: "Your baseline supports acceleration. Refinement will compound.", tone: "optimization-focused" }
  };

  function toNum(v, def) {
    var n = parseFloat(v);
    return isNaN(n) ? (def != null ? def : 0) : n;
  }

  function classify(data) {
    var stress = ((data.stressLevel || "") + "").toLowerCase();
    var sleep = ((data.sleepQuality || "") + "").toLowerCase();
    var activity = ((data.activityLevel || "") + "").toLowerCase();
    var commitment = ((data.commitment || "") + "").toLowerCase();
    var pastAttempts = toNum(data.pastFailedAttempts, 0);
    var emotionalEating = ((data.eatingTriggers || "") + "").toLowerCase().indexOf("stress") >= 0 ||
      ((data.eatingTriggers || "") + "").toLowerCase().indexOf("emotion") >= 0;

    var scores = { A: 0, B: 0, C: 0, D: 0, E: 0 };

    if (commitment.indexOf("6-7") >= 0 || commitment.indexOf("5") >= 0) scores.E += 3;
    if (commitment.indexOf("2-3") >= 0 || commitment.indexOf("1") >= 0) {
      scores.A += 2;
      scores.D += 2;
    }
    if (pastAttempts >= 3) scores.D += 3;
    if (pastAttempts >= 2) scores.A += 1;
    if (emotionalEating || stress === "high" || stress === "very-high") scores.B += 3;
    if (activity === "high" && (sleep === "poor" || sleep === "inconsistent")) scores.C += 4;
    if (activity === "high" && stress === "high") scores.C += 2;
    if (sleep === "restorative" && commitment.indexOf("4") >= 0) scores.E += 2;

    var maxScore = 0;
    var type = "E";
    for (var k in scores) {
      if (scores[k] > maxScore) {
        maxScore = scores[k];
        type = k;
      }
    }

    return {
      type: type,
      label: TYPES[type].name,
      narrative: TYPES[type].narrative,
      tone: TYPES[type].tone,
      scores: scores
    };
  }

  function getToneAdjustedNarrative(classification, baseNarrative) {
    var type = classification.type || "E";
    return TYPES[type] && TYPES[type].narrative ? TYPES[type].narrative : baseNarrative;
  }

  if (typeof window !== "undefined") {
    window.BehaviorClassifier = classify;
    window.getBehaviorType = classify;
    window.getToneAdjustedNarrative = getToneAdjustedNarrative;
  }
})(typeof window !== "undefined" ? window : this);
