/**
 * Health Intelligence Engine — Emotional narrative, projections, plan mapping.
 * Works with engine.js; does NOT modify theme.css or layout.
 */
(function () {
  "use strict";

  /**
   * Generate empathetic, scientific, encouraging AI summary from assessment data.
   */
  function generateEmotionalSummary(data) {
    var bmi = parseFloat(data.weight) / Math.pow(parseFloat(data.height) / 100, 2);
    bmi = Math.round(bmi * 10) / 10;
    var sleep = (data.sleepQuality || "").toLowerCase();
    var stress = (data.stressLevel || "").toLowerCase();
    var issues = (data.healthIssues || "").toLowerCase();
    var hasCondition = issues.indexOf("diabetes") >= 0 || issues.indexOf("thyroid") >= 0 || issues.indexOf("pcos") >= 0 || issues.length > 0;

    var parts = [];
    var tone = "empathetic";

    if (bmi > 30 || (stress === "high" || stress === "very-high") || sleep === "poor" || hasCondition) {
      var signals = [];
      if (sleep === "poor" || sleep === "inconsistent") signals.push("disrupted sleep");
      if (stress === "high" || stress === "very-high") signals.push("elevated stress");
      if (bmi > 25) signals.push("metabolic strain");
      if (hasCondition) signals.push("hormonal imbalance");
      parts.push("Your body is responding to signals — " + (signals.length ? signals.join(", ") + "." : "internal misalignment."));
      parts.push("These patterns suggest reversible strain. The good news: structured intervention can correct them.");
    } else if (bmi > 25 || sleep === "inconsistent" || stress === "moderate") {
      parts.push("Your metabolic profile suggests room for optimization.");
      parts.push("Targeted adjustments to sleep, stress and activity can restore fat oxidation and hormonal balance. With guided accountability, this improves significantly.");
    } else {
      parts.push("Your metabolic baseline is supported.");
      parts.push("Continued attention to sleep, stress and movement can maintain or enhance your current trajectory.");
    }

    return parts.join(" ");
  }

  /**
   * Get projection text for "Without Intervention" card.
   */
  function getWithoutInterventionText(data) {
    var bmi = parseFloat(data.weight) / Math.pow(parseFloat(data.height) / 100, 2);
    var sleep = (data.sleepQuality || "").toLowerCase();
    var stress = (data.stressLevel || "").toLowerCase();
    var issues = (data.healthIssues || "").toLowerCase();
    var hasCondition = issues.indexOf("diabetes") >= 0 || issues.indexOf("thyroid") >= 0 || issues.indexOf("pcos") >= 0 || issues.length > 0;

    var items = [];
    if (bmi > 25) items.push("Metabolic adaptation may slow over time");
    if (hasCondition || stress === "high" || stress === "very-high") items.push("Hormonal strain without correction");
    if (bmi > 30 || hasCondition) items.push("Risk factors likely to persist");
    if (sleep === "poor") items.push("Recovery deficit continues");
    if (items.length === 0) items.push("Gradual metabolic drift likely");
    return items;
  }

  /**
   * Get projection text for "With Unlimitr Intervention" card.
   */
  function getWithInterventionText(data) {
    var items = ["Fat oxidation restored progressively", "Hormonal balance stabilizes", "Health Score can move toward 85+"];
    return items;
  }

  /**
   * Get "Your Body Is Not Broken" message.
   */
  function getBodyNotBrokenMessage(data) {
    var base = "If you've tried multiple approaches and still struggled — it's likely misaligned strategy, not lack of willpower. Your biology can respond to structured correction.";
    return base;
  }

  /**
   * Map condition to plan preview (for Condition Intelligence Panel).
   */
  function getConditionPlanMapping(issues) {
    var m = (issues || "").toLowerCase();
    if (m.indexOf("diabetes") >= 0) return { key: "sugar_shield", title: "Fitstart Sugar Shield", focus: "Blood sugar control + insulin sensitivity." };
    if (m.indexOf("thyroid") >= 0) return { key: "thyro_care", title: "Fitstart Thyro Care", focus: "Thyroid-supportive nutrition + recovery." };
    if (m.indexOf("pcos") >= 0 || m.indexOf("hormone") >= 0) return { key: "hormo_balance", title: "Fitstart Hormo Balance", focus: "Hormone balance with cycle-aware coaching." };
    if (m.indexOf("bp") >= 0 || m.indexOf("blood pressure") >= 0 || m.indexOf("heart") >= 0) return { key: "heart_ease", title: "Fitstart Heart Ease", focus: "Cardiac-safe fat loss + endurance." };
    if (m.indexOf("cholesterol") >= 0 || m.indexOf("lipid") >= 0) return { key: "lipid_fit", title: "Fitstart Lipid Fit", focus: "Cholesterol management + metabolic health." };
    if (m.indexOf("knee") >= 0 || m.indexOf("joint") >= 0 || m.indexOf("mobility") >= 0) return { key: "move_safe", title: "Fitstart Move Safe", focus: "Joint-friendly fat loss + mobility." };
    return null;
  }

  /**
   * Root cause breakdown: short 1-line explanations for each factor.
   */
  function getRootCauseExplanations(data) {
    var bmi = parseFloat(data.weight) / Math.pow(parseFloat(data.height) / 100, 2);
    var sleep = (data.sleepQuality || "").toLowerCase();
    var stress = (data.stressLevel || "").toLowerCase();
    var activity = (data.activityLevel || "").toLowerCase();
    var issues = (data.healthIssues || "").toLowerCase();
    var hasDiabetes = issues.indexOf("diabetes") >= 0;
    var hasCondition = issues.indexOf("thyroid") >= 0 || issues.indexOf("pcos") >= 0 || hasDiabetes || issues.length > 0;

    return {
      metabolic: bmi > 25 ? "Your calorie utilization suggests metabolic strain from sleep-stress interaction. This can improve with structured nutrition — not permanent damage." : "Your metabolic baseline is supported by BMI and activity.",
      hormonal: hasCondition ? "Your health context affects hormonal balance. Condition-aware protocol can restore stability." : (stress === "high" || stress === "very-high" ? "Stress impacts cortisol. Recovery protocols can help restore balance." : "Hormonal balance is supported."),
      insulin: hasDiabetes ? "Glycemic load sensitivity affects fat storage. Structured meal timing can restore insulin sensitivity over time." : "Insulin sensitivity is within normal range.",
      recovery: sleep === "poor" || stress === "high" || stress === "very-high" ? "Sleep and stress suggest recovery deficit. Targeted adjustments can improve capacity." : "Recovery quality supports metabolic health.",
      movement: activity === "sedentary" || activity === "light" ? "Movement deficit is a key lever. Gradual increase with guided accountability can accelerate results." : "Your activity baseline supports metabolic health."
    };
  }

  /**
   * Full health intelligence result for journey report.
   */
  function runHealthIntelligenceEngine(formData) {
    var emotionalSummary = generateEmotionalSummary(formData);
    var withoutIntervention = getWithoutInterventionText(formData);
    var withIntervention = getWithInterventionText(formData);
    var bodyNotBroken = getBodyNotBrokenMessage(formData);
    var conditionPlan = getConditionPlanMapping(formData.healthIssues);
    var rootCause = getRootCauseExplanations(formData);

    return {
      emotionalSummary: emotionalSummary,
      withoutIntervention: withoutIntervention,
      withIntervention: withIntervention,
      bodyNotBroken: bodyNotBroken,
      conditionPlan: conditionPlan,
      rootCause: rootCause
    };
  }

  if (typeof window !== "undefined") {
    window.generateEmotionalSummary = generateEmotionalSummary;
    window.runHealthIntelligenceEngine = runHealthIntelligenceEngine;
    window.getRootCauseExplanations = getRootCauseExplanations;
    window.getConditionPlanMapping = getConditionPlanMapping;
    window.getWithoutInterventionText = getWithoutInterventionText;
    window.getWithInterventionText = getWithInterventionText;
    window.getBodyNotBrokenMessage = getBodyNotBrokenMessage;
  }
})();
