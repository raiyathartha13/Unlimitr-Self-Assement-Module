/**
 * Narrative Engine — Dynamic Emotional Copy
 * Generates empathetic, science-grounded health narratives based on score and context.
 */
(function (global) {
  "use strict";

  function generateNarrative(data) {
    var score = data.finalScore != null ? data.finalScore : (data.biologicalScore != null ? data.biologicalScore : 65);
    var weightGap = data.weightGap != null ? data.weightGap : 0;
    var hasCondition = data.hasCondition === true;

    if (score < 40) {
      return (
        "Your body is signaling metabolic strain. " +
        "This is not failure — it's an adaptive stress response. " +
        "With structured correction, improvement toward 80+ is realistic within 12–16 weeks. " +
        "The path is reversible."
      );
    }

    if (score < 55) {
      return (
        "Your metabolic system is under strain, but this is reversible. " +
        "Targeted adjustments to sleep, stress, and activity can restore fat oxidation and hormonal balance. " +
        "With guided accountability, significant improvement is achievable."
      );
    }

    if (score < 70) {
      return (
        "Your metabolic system is partially optimized. " +
        "Small structural adjustments in sleep and recovery can unlock accelerated fat oxidation. " +
        (weightGap > 5
          ? "Your weight gap of " + Math.round(weightGap) + " kg is addressable with a sustainable protocol."
          : "Your baseline supports meaningful improvement.") +
        (hasCondition ? " Your health context suggests a condition-aware approach." : "")
      );
    }

    if (score < 85) {
      return (
        "Your metabolic profile suggests room for optimization. " +
        "Targeted adjustments to sleep, stress and activity can restore fat oxidation and hormonal balance. " +
        "With guided accountability, this improves significantly."
      );
    }

    return (
      "Your metabolic system is performing efficiently. " +
      "Continued consistency will transition you into elite metabolic resilience. " +
      "You're well-positioned for sustained results."
    );
  }

  function generateCounsellorMessage(data) {
    var name = (data.clientName || data.clientEmail || "there").split(" ")[0] || "there";
    var score = data.finalScore != null ? data.finalScore : 65;
    var weightGap = data.weightGap != null ? data.weightGap : 8;
    var durationMonths = data.durationMonths != null ? data.durationMonths : 2;
    var weeklyLoss = data.weeklyLoss != null ? data.weeklyLoss : 1;

    if (score < 45) {
      return (
        "Hello " + name + ", your metabolic profile indicates reversible strain. " +
        "The good news: your biology can respond to structured intervention. " +
        "A weight gap of " + Math.round(weightGap) + " kg over " + durationMonths + " months is achievable with " + weeklyLoss + " kg/week. " +
        "With guided accountability, this trajectory can be sustained."
      );
    }

    if (score < 70) {
      return (
        "Hello " + name + ", based on your metabolic profile, your body suggests a need for structured fat loss rather than aggressive dieting. " +
        "The good news — your weight gap of " + Math.round(weightGap) + " kg over " + durationMonths + " months is achievable with a safe weekly loss of " + weeklyLoss + " kg. " +
        "With guided accountability, this trajectory can be sustained."
      );
    }

    return (
      "Hello " + name + ", your metabolic baseline is solid. " +
      "Focused refinements in nutrition and recovery can accelerate your results. " +
      "You're well-positioned for sustained transformation."
    );
  }

  function generateRiskNarrative(riskLabel, score) {
    if (riskLabel === "High Risk" || riskLabel === "Elevated") {
      return "Your risk profile suggests multiple stress factors. Structured correction can reduce this over 12–16 weeks.";
    }
    if (riskLabel === "Moderate") {
      return "Your risk is manageable with targeted interventions. Consistency will shift the trajectory.";
    }
    return "Your risk profile is favorable. Maintain your current habits for sustained health.";
  }

  global.generateNarrative = generateNarrative;
  global.generateCounsellorMessage = generateCounsellorMessage;
  global.generateRiskNarrative = generateRiskNarrative;
  global.NarrativeEngine = {
    generate: generateNarrative,
    generateCounsellor: generateCounsellorMessage,
    generateRisk: generateRiskNarrative
  };
})(typeof window !== "undefined" ? window : this);
