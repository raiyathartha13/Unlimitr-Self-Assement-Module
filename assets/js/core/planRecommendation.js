/**
 * Plan Recommendation Engine — Score-Based Logic
 * Never sell directly. Narrate metabolic velocity.
 * UNLIMITR AI Cognitive Backbone v1.0
 */
(function (global) {
  "use strict";

  var RULES = [
    { scoreMax: 50, durationMonths: [6, 12], narrative: "Based on your metabolic velocity, a 6-month structured correction will allow safe and stable adaptation.", planTier: "structured" },
    { scoreMin: 50, scoreMax: 70, durationMonths: [3, 6], narrative: "A corrective protocol of 3–6 months will support your metabolic shift.", planTier: "corrective" },
    { scoreMin: 70, durationMonths: [3], narrative: "A performance optimization plan can refine your trajectory.", planTier: "optimization" }
  ];

  function recommend(data) {
    var score = data.finalScore != null ? data.finalScore : (data.healthScore != null ? data.healthScore : 65);
    var hasCondition = data.hasCondition === true;
    var issues = ((data.healthIssues || "") + "").toLowerCase();

    var match = null;
    for (var i = 0; i < RULES.length; i++) {
      var r = RULES[i];
      var okMin = r.scoreMin == null || score >= r.scoreMin;
      var okMax = r.scoreMax == null || score <= r.scoreMax;
      if (okMin && okMax) {
        match = r;
        break;
      }
    }
    if (!match) match = RULES[1];

    var duration = match.durationMonths;
    var suggestedMonths = hasCondition ? Math.max(duration[0], 6) : (duration[0] + (duration[1] || duration[0])) / 2;
    suggestedMonths = Math.round(Math.min(12, Math.max(3, suggestedMonths)));

    var planKey = "total_wellness";
    if (issues.indexOf("thyroid") >= 0) planKey = "thyro_care";
    else if (issues.indexOf("diabetes") >= 0) planKey = "sugar_shield";
    else if (issues.indexOf("pcos") >= 0 || issues.indexOf("pcod") >= 0) planKey = "hormo_balance";
    else if (issues.indexOf("heart") >= 0 || issues.indexOf("bp") >= 0) planKey = "heart_ease";
    else if (issues.indexOf("cholesterol") >= 0 || issues.indexOf("lipid") >= 0) planKey = "lipid_fit";
    else if (issues.indexOf("joint") >= 0 || issues.indexOf("injury") >= 0) planKey = "move_safe";

    return {
      suggestedMonths: suggestedMonths,
      durationRange: duration,
      narrative: match.narrative,
      planTier: match.planTier,
      planKey: planKey
    };
  }

  if (typeof window !== "undefined") {
    window.PlanRecommendation = recommend;
    window.getPlanRecommendation = recommend;
  }
})(typeof window !== "undefined" ? window : this);
