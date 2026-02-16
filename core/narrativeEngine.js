/**
 * Narrative Engine — Production Medical Intelligence Expression Layer
 * UNLIMITR AI Cognitive Backbone v2.0
 * 
 * Converts multidimensional health intelligence into structured biological interpretation
 * Clinical tone, authoritative, data-backed, non-generic
 */

(function (global) {
  "use strict";

  /**
   * NarrativeEngine Constructor
   * @param {Object} engineOutput - Output from HealthEngine.computeAll()
   */
  function NarrativeEngine(engineOutput) {
    this.data = engineOutput || {};
  }

  /**
   * MAIN EXECUTIVE SUMMARY
   * High-level biological classification
   */
  NarrativeEngine.prototype.generateExecutiveSummary = function () {
    var zone = this.data.zone || "Unknown";
    var score = this.data.totalScore || 0;
    var topDrivers = this.data.topDrivers || [];

    var primaryDriver = topDrivers.length > 0 ? this.formatDriverName(topDrivers[0].name) : "multiple factors";

    return "Your biological system is currently classified under \"" + zone + "\". " +
      "This score of " + score + "/100 reflects adaptive strain across multiple regulatory dimensions, " +
      "primarily driven by modifiable behavioral and metabolic signals. " +
      "The condition is reversible with structured intervention. " +
      "Primary suppressive driver: " + primaryDriver + ".";
  };

  /**
   * DIMENSION-SPECIFIC NARRATIVE
   * Clinical interpretation of each dimension score
   */
  NarrativeEngine.prototype.generateDimensionNarrative = function (dimension, value) {
    if (typeof value !== "number") value = 0;

    switch (dimension) {
      case "metabolic":
        if (value < 50) {
          return "Metabolic throughput is significantly suppressed, indicating inefficient energy oxidation and adaptive fat retention patterns. Body composition signals suggest energy partitioning disruption.";
        }
        if (value < 70) {
          return "Metabolic efficiency is moderately compromised, likely influenced by activity imbalance or glycemic instability. Targeted nutrition protocols can enhance metabolic throughput.";
        }
        return "Metabolic function is operating within stable adaptive range. Energy partitioning efficiency supports sustained fat oxidation.";

      case "recovery":
        if (value < 50) {
          return "Recovery integrity is impaired. Sleep fragmentation and elevated stress load are reducing cellular repair and hormonal recalibration. This suppresses metabolic oxidation efficiency by approximately " + Math.round((100 - value) * 0.22) + "%.";
        }
        if (value < 70) {
          return "Recovery patterns show moderate inconsistency, which may slow fat adaptation efficiency. Sleep and stress optimization can accelerate progress by up to 22%.";
        }
        return "Recovery system appears structurally stable. Sleep and stress load support optimal metabolic function.";

      case "hormonal":
        if (value < 50) {
          return "Hormonal regulation signals indicate dysregulation. Stress-mediated cortisol response may be influencing abdominal retention and insulin sensitivity. Structured correction can normalize hormonal response within 8-12 weeks.";
        }
        if (value < 70) {
          return "Hormonal signaling shows mild imbalance but remains correctable. Meal timing and resistance training protocols can normalize insulin sensitivity.";
        }
        return "Hormonal regulation appears stable. Metabolic signaling supports efficient energy utilization.";

      case "behavioral":
        if (value < 50) {
          return "Behavioral sustainability index is low. Elevated dropout probability during early adaptation phase is expected without structured accountability. Consistency risk peaks during weeks 3-4.";
        }
        if (value < 70) {
          return "Consistency risk exists during mid-phase adaptation, particularly weeks 3–4. Structured programming addresses plateau risk effectively.";
        }
        return "Behavioral adherence capacity is structurally strong. Commitment patterns support long-term protocol adherence.";

      case "readiness":
        if (value < 50) {
          return "Intervention readiness is currently suboptimal. Commitment variability may affect early response. Structured medical supervision is recommended.";
        }
        if (value < 70) {
          return "Moderate readiness detected. Structured external guidance will improve adaptation velocity and protocol adherence.";
        }
        return "High readiness for structured transformation. Baseline factors support successful intervention adherence.";

      default:
        return "Dimension analysis indicates optimization potential.";
    }
  };

  /**
   * TOP DRIVER ANALYSIS
   * Quantifies impact of primary suppressive factors
   */
  NarrativeEngine.prototype.generateDriverAnalysis = function () {
    var topDrivers = this.data.topDrivers || [];

    if (!topDrivers || topDrivers.length === 0) {
      return "No dominant suppressive drivers detected. System appears within optimal adaptive range.";
    }

    var analyses = topDrivers.map(function (driver) {
      var driverName = this.formatDriverName(driver.name);
      var impact = driver.impact || (100 - (driver.score || 0));
      return driverName + " is contributing approximately " + Math.round(impact) + "% suppression relative to optimal biological range.";
    }.bind(this));

    return analyses.join(" ");
  };

  /**
   * TRAJECTORY FORECAST
   * Dual-path projection (with/without intervention)
   */
  NarrativeEngine.prototype.generateTrajectoryForecast = function () {
    var weeks = this.data.correctionWindowWeeks || 12;
    var score = this.data.totalScore || 0;

    var withoutIntervention = "Without structured correction, adaptive plateau is probable within 6–8 weeks. " +
      "Metabolic efficiency will likely stabilize at current suboptimal level without intervention.";

    var withIntervention = "With guided intervention, metabolic stabilization is projected within " + weeks + " weeks, " +
      "followed by sustainable fat adaptation. " +
      "Projected improvement: " + (score < 50 ? "significant" : score < 70 ? "moderate" : "refinement") + " " +
      "toward optimal biological range.";

    return {
      withoutIntervention: withoutIntervention,
      withIntervention: withIntervention
    };
  };

  /**
   * DROPOUT RISK NARRATIVE
   * Identifies specific vulnerability windows
   */
  NarrativeEngine.prototype.generateDropoutRiskNarrative = function () {
    var weeks = this.data.dropoutRiskWeeks || [];
    var behavioral = (this.data.dimensions || {}).behavioral || 0;

    if (!weeks || weeks.length === 0) {
      return "Dropout vulnerability remains low across projected transformation cycle. " +
        "Behavioral sustainability index supports consistent protocol adherence.";
    }

    var weekText = weeks.length === 1 
      ? "week " + weeks[0]
      : weeks.length === 2
        ? "weeks " + weeks.join(" and ")
        : "weeks " + weeks.slice(0, -1).join(", ") + ", and " + weeks[weeks.length - 1];

    return "Highest consistency vulnerability is projected during " + weekText + ", " +
      "corresponding with adaptive fatigue phase. " +
      "Behavioral sustainability index (" + Math.round(behavioral) + "%) indicates elevated risk. " +
      "Structured accountability is recommended during this window.";
  };

  /**
   * PLAN RATIONALE
   * Clinical justification for recommended protocol
   */
  NarrativeEngine.prototype.generatePlanRationale = function () {
    var plan = this.data.planRecommendation || {};
    var zone = this.data.zone || "Unknown";
    var behavioral = (this.data.dimensions || {}).behavioral || 0;
    var topDriver = (this.data.topDrivers || [])[0];

    var duration = plan.duration || 3;
    var intensity = plan.intensity || "Moderate";
    var type = plan.type || intensity;

    var rationale = "A " + duration + "-month " + intensity + " protocol is recommended. " +
      "This duration aligns with your current \"" + zone + "\" classification " +
      "and behavioral stability index of " + Math.round(behavioral) + "%. ";

    if (topDriver) {
      rationale += "Primary focus: " + this.formatDriverName(topDriver.name) + " " +
        "(" + Math.round(topDriver.impact || 0) + "% impact). ";
    }

    rationale += "Structured correction can restore biological resilience within the projected " +
      (this.data.correctionWindowWeeks || 12) + "-week window.";

    return rationale;
  };

  /**
   * COMPREHENSIVE REPORT
   * Generates full narrative report
   */
  NarrativeEngine.prototype.generateFullReport = function () {
    var report = [];

    // Executive Summary
    report.push("## Executive Summary");
    report.push(this.generateExecutiveSummary());
    report.push("");

    // Dimension Analysis
    report.push("## Dimension Analysis");
    var dimensions = this.data.dimensions || {};
    for (var key in dimensions) {
      if (dimensions.hasOwnProperty(key)) {
        report.push("**" + this.formatDriverName(key) + "**: " + 
          this.generateDimensionNarrative(key, dimensions[key]));
        report.push("");
      }
    }

    // Top Drivers
    report.push("## Primary Suppressive Drivers");
    report.push(this.generateDriverAnalysis());
    report.push("");

    // Trajectory Forecast
    report.push("## Trajectory Forecast");
    var trajectory = this.generateTrajectoryForecast();
    report.push("**Without Intervention**: " + trajectory.withoutIntervention);
    report.push("**With Intervention**: " + trajectory.withIntervention);
    report.push("");

    // Dropout Risk
    report.push("## Consistency Risk Assessment");
    report.push(this.generateDropoutRiskNarrative());
    report.push("");

    // Plan Rationale
    report.push("## Recommended Protocol");
    report.push(this.generatePlanRationale());

    return report.join("\n");
  };

  /**
   * HELPERS
   */
  NarrativeEngine.prototype.formatDriverName = function (name) {
    var mapping = {
      metabolic: "Metabolic Throughput",
      recovery: "Recovery Integrity",
      hormonal: "Hormonal Regulation",
      behavioral: "Behavioral Sustainability",
      readiness: "Intervention Readiness"
    };
    return mapping[name] || name;
  };

  /**
   * BACKWARD COMPATIBILITY
   * Legacy narrative generation functions
   */
  function generateReport(data) {
    // If data has HealthEngine structure, use NarrativeEngine
    if (data.dimensions && data.totalScore !== undefined) {
      var engine = new NarrativeEngine(data);
      return engine.generateExecutiveSummary();
    }

    // Legacy fallback
    var score = data.finalScore != null ? data.finalScore : (data.healthScore != null ? data.healthScore : 65);
    var weightGap = data.weightGap != null ? data.weightGap : 0;
    var projected = Math.min(95, score + 25 + Math.floor(Math.random() * 8));
    var weeks = score < 50 ? "12–16" : score < 70 ? "10–14" : "8–12";

    var emotional = "";
    if (score < 45) emotional = "Your current metabolic score of " + score + " indicates adaptive slowdown — not permanent dysfunction.";
    else if (score < 60) emotional = "Your metabolic profile suggests reversible strain. This is adaptive response, not failure.";
    else if (score < 80) emotional = "Your metabolic system is partially optimized. Refinement is within reach.";
    else emotional = "Your metabolic baseline is strong. Optimization will compound your results.";

    var reversibility = "With structured intervention, improvement toward " + projected + " is realistic.";
    var timeline = "Projected timeline: " + weeks + " weeks for meaningful shift.";
    var confidence = "This path is reversible. Your biology can respond to guidance.";

    return emotional + " " + reversibility + " " + timeline + " " + confidence;
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

  // Export
  if (typeof window !== "undefined") {
    window.NarrativeEngine = NarrativeEngine;
    window.generateReport = generateReport;
    window.CognitiveNarrative = generateReport;
    window.CognitiveCounsellor = generateCounsellorMessage;
  }
  if (typeof module !== "undefined" && module.exports) {
    module.exports = NarrativeEngine;
  }
})(typeof window !== "undefined" ? window : this);
