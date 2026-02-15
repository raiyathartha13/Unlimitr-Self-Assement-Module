/**
 * Narrative Engine — 7-Part Report Template
 * Emotional Alignment | Biological Interpretation | Root Cause | Reversibility | Timeline | Confidence
 * UNLIMITR AI Cognitive Backbone v1.0 — Never shame, panic, or fear. Always empower.
 */
(function (global) {
  "use strict";

  function conditionIntelligence(data) {
    var parts = [];
    var issues = ((data.healthIssues || "") + "").toLowerCase();
    var tsh = parseFloat(data.tshLevel);
    var hba1c = parseFloat(data.hba1cLevel);

    if (issues.indexOf("thyroid") >= 0) {
      if (!isNaN(tsh) && tsh > 8) parts.push("Your metabolism is conserving energy — not failing.");
      else if (!isNaN(tsh) && tsh > 4) parts.push("Your metabolism shows adaptive suppression. Structured correction can restore this.");
      else parts.push("Thyroid-informed support can optimize your metabolic curve.");
    }
    if (issues.indexOf("pcos") >= 0) {
      parts.push("Your hormonal rhythm is desynchronized. With cycle-synced correction, this can be stabilized.");
    }
    if (issues.indexOf("diabetes") >= 0) {
      if (!isNaN(hba1c) && hba1c >= 6.5) parts.push("Your glucose curve shows prolonged elevation. Structured carb timing can reverse this trajectory.");
      else if (!isNaN(hba1c) && hba1c >= 6.0) parts.push("Your glucose pattern suggests pre-diabetic adaptation. Early correction is highly effective.");
      else parts.push("Glycemic-aware nutrition will support your metabolic shift.");
    }
    return parts;
  }

  function generateReport(data) {
    var score = data.finalScore != null ? data.finalScore : (data.healthScore != null ? data.healthScore : 65);
    var weightGap = data.weightGap != null ? data.weightGap : 0;
    var projected = Math.min(95, score + 25 + Math.floor(Math.random() * 8));
    var weeks = score < 50 ? "12–16" : score < 70 ? "10–14" : "8–12";

    var emotional = "";
    if (score < 45) emotional = "Your current metabolic score of " + score + " indicates adaptive slowdown — not permanent dysfunction.";
    else if (score < 60) emotional = "Your metabolic profile suggests reversible strain. This is adaptive response, not failure.";
    else if (score < 80) emotional = "Your metabolic system is partially optimized. Refinement is within reach.";
    else emotional = "Your metabolic baseline is strong. Optimization will compound your results.";

    var biological = "";
    var rootCause = [];
    var sleep = ((data.sleepQuality || "") + "").toLowerCase();
    var stress = ((data.stressLevel || "") + "").toLowerCase();
    var activity = ((data.activityLevel || "") + "").toLowerCase();

    if (sleep === "poor" || sleep === "inconsistent") rootCause.push("recovery deficit");
    if (stress === "high" || stress === "very-high") rootCause.push("stress amplification");
    if (activity === "sedentary" || activity === "low") rootCause.push("movement deficit");
    var condParts = conditionIntelligence(data);
    if (condParts.length) rootCause.push(condParts[0].toLowerCase());

    biological = rootCause.length > 0
      ? "The primary driver appears to be " + rootCause.slice(0, 2).join(" and ") + "."
      : "Your inputs suggest room for structured improvement.";

    var reversibility = "With structured intervention, improvement toward " + projected + " is realistic.";
    var timeline = "Projected timeline: " + weeks + " weeks for meaningful shift.";
    var confidence = "This path is reversible. Your biology can respond to guidance.";

    var behaviorNarrative = "";
    if (typeof window.getToneAdjustedNarrative === "function" && typeof window.BehaviorClassifier === "function") {
      var classification = window.BehaviorClassifier(data);
      behaviorNarrative = " " + classification.narrative;
    }

    return emotional + " " + biological + behaviorNarrative + " " + reversibility + " " + timeline + " " + confidence;
  }

  function generateCounsellorMessage(data) {
    var name = (data.clientName || data.clientEmail || "there").split(" ")[0] || "there";
    var score = data.finalScore != null ? data.finalScore : 65;
    var weightGap = data.weightGap != null ? data.weightGap : 8;
    var durationMonths = data.durationMonths != null ? data.durationMonths : 2;
    var weeklyLoss = data.weeklyLoss != null ? data.weeklyLoss : 1;

    var opening = "Hello " + name + ", ";
    var body = "";
    if (score < 45) {
      body = "your metabolic profile indicates reversible strain. The good news: your biology can respond to structured intervention. ";
    } else if (score < 70) {
      body = "based on your metabolic profile, your body suggests a need for structured fat loss rather than aggressive dieting. ";
    } else {
      body = "your metabolic baseline is solid. Focused refinements can accelerate your results. ";
    }
    body += "Your weight gap of " + Math.round(weightGap) + " kg over " + durationMonths + " months is achievable with " + weeklyLoss + " kg/week. ";
    body += "With guided accountability, this trajectory can be sustained.";
    return opening + body;
  }

  function generateVoiceScript(data) {
    return "You are not broken. Your biology is adapting. We simply guide it back.";
  }

  if (typeof window !== "undefined") {
    window.CognitiveNarrative = generateReport;
    window.CognitiveCounsellor = generateCounsellorMessage;
    window.CognitiveVoiceScript = generateVoiceScript;
    window.generateReport = generateReport;
  }
})(typeof window !== "undefined" ? window : this);
