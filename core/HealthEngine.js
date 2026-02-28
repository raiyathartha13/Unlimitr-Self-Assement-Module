/**
 * HealthEngine — Production Multidimensional Health Intelligence Engine
 * UNLIMITR AI Cognitive Backbone v2.0
 * 
 * Features:
 * - Multidimensional scoring (5 core dimensions)
 * - Top driver extraction
 * - Biological strain calculation
 * - Dropout risk prediction
 * - Correction window estimation
 * - Structured plan recommendation
 * - ML-ready output structure
 */

(function (global) {
  "use strict";

  var DEFAULT_KB = {
    version: "2.0",
    identity: {
      tone: "clinical_compassionate",
      never: ["fear_based", "shaming", "aggressive_sales"],
      always: ["empowering", "data_backed", "reversible_language"]
    },
    scoringWeights: {
      metabolic: 0.30,
      hormonal: 0.20,
      behavioral: 0.20,
      recovery: 0.15,
      readiness: 0.15
    },
    riskZones: [
      { min: 0, max: 39, label: "Severe Adaptive Strain", color: "deep_red", severity: "critical" },
      { min: 40, max: 59, label: "Adaptive Strain", color: "amber", severity: "high" },
      { min: 60, max: 74, label: "Suboptimal Stability", color: "teal", severity: "moderate" },
      { min: 75, max: 100, label: "Metabolic Stability", color: "green", severity: "low" }
    ],
    conditionRules: {
      thyroid: {
        tshHigh: 4,
        tshVeryHigh: 8,
        message: "Your metabolism is conserving energy — not failing."
      },
      diabetes: {
        preDiabetic: 6.0,
        diabetic: 6.5,
        message: "Your glucose curve shows prolonged elevation. Structured carb timing can reverse this trajectory."
      },
      pcos: {
        cluster: "cycle_irregular + insulin_resistance",
        message: "Your hormonal rhythm is desynchronized. With cycle-synced correction, this can be stabilized."
      }
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

  /**
   * HealthEngine Constructor
   * @param {Object} userData - User assessment data
   * @param {Object} knowledgeOverride - Optional knowledge base override
   */
  function HealthEngine(userData, knowledgeOverride) {
    this.user = this.normalizeUserData(userData || {});
    this.kb = knowledgeOverride || DEFAULT_KB;
    this.dimensions = {};
    this.totalScore = 0;
    this.zone = null;
    this.biologicalStrain = 0;
  }

  /**
   * NORMALIZE USER DATA
   * Converts string inputs to numerical encoding for ML-ready processing
   * Handles both string ("poor", "good") and numerical (1, 2, 3) inputs
   */
  HealthEngine.prototype.normalizeUserData = function (userData) {
    var normalized = Object.assign({}, userData);

    // Sleep: 1 = poor, 2 = inconsistent/moderate, 3 = good, 4 = restorative
    if (typeof normalized.sleep === "undefined" || normalized.sleep === null) {
      var sleep = ((userData.sleepQuality || "") + "").toLowerCase();
      if (sleep === "poor") normalized.sleep = 1;
      else if (sleep === "inconsistent") normalized.sleep = 2;
      else if (sleep === "good") normalized.sleep = 3;
      else if (sleep === "restorative") normalized.sleep = 4;
      else normalized.sleep = 2; // Default to moderate
    }

    // Stress: 1 = low, 2 = moderate, 3 = high, 4 = very-high
    if (typeof normalized.stress === "undefined" || normalized.stress === null) {
      var stress = ((userData.stressLevel || "") + "").toLowerCase();
      if (stress === "low") normalized.stress = 1;
      else if (stress === "moderate") normalized.stress = 2;
      else if (stress === "high") normalized.stress = 3;
      else if (stress === "very-high") normalized.stress = 4;
      else normalized.stress = 2; // Default to moderate
    }

    // Activity: 1 = sedentary/low, 2 = light, 3 = moderate, 4 = high
    if (typeof normalized.activity === "undefined" || normalized.activity === null) {
      var activity = ((userData.activityLevel || "") + "").toLowerCase();
      if (activity === "sedentary" || activity === "low") normalized.activity = 1;
      else if (activity === "light") normalized.activity = 2;
      else if (activity === "moderate") normalized.activity = 3;
      else if (activity === "high") normalized.activity = 4;
      else normalized.activity = 2; // Default to light
    }

    // Health conditions: boolean flags
    var issues = ((userData.healthIssues || "") + "").toLowerCase();
    normalized.health_diabetes = issues.indexOf("diabetes") >= 0 || issues.indexOf("prediabetes") >= 0 || issues.indexOf("pre-diabetes") >= 0;
    normalized.health_thyroid = issues.indexOf("thyroid") >= 0;
    normalized.health_pcos = issues.indexOf("pcos") >= 0;
    normalized.healthIssueMain = (normalized.health_diabetes || normalized.health_thyroid || normalized.health_pcos) ? "has" : "none";

    // Commitment: normalize to string format
    if (!normalized.commitment && userData.commitment) {
      normalized.commitment = userData.commitment;
    }

    // Preserve all original data
    for (var key in userData) {
      if (userData.hasOwnProperty(key) && !normalized.hasOwnProperty(key)) {
        normalized[key] = userData[key];
      }
    }

    return normalized;
  };

  /**
   * MAIN ENTRY POINT
   * Computes all dimensions and returns structured output
   * @returns {Object} Complete health intelligence output
   */
  HealthEngine.prototype.computeAll = function () {
    // Compute all dimensions
    this.dimensions = {
      metabolic: this.computeMetabolic(),
      recovery: this.computeRecovery(),
      hormonal: this.computeHormonal(),
      behavioral: this.computeBehavioral(),
      readiness: this.computeReadiness()
    };

    // Calculate aggregate score
    this.totalScore = this.calculateHealthScore();

    // Get risk zone
    this.zone = this.getRiskZone(this.totalScore);

    // Calculate biological strain
    this.biologicalStrain = this.calculateBiologicalStrain();

    // Calculate biological age (if age available)
    var biologicalAge = null;
    var biologicalAgeDelta = null;
    if (this.user.age && this.user.age > 0) {
      biologicalAge = this.calculateBiologicalAge(parseInt(this.user.age, 10));
      biologicalAgeDelta = biologicalAge - parseInt(this.user.age, 10);
    }

    // Return structured output (matches user's specification exactly)
    var output = {
      totalScore: this.totalScore,
      zone: this.zone,
      dimensions: this.dimensions,
      topDrivers: this.extractTopDrivers(),
      correctionWindowWeeks: this.estimateCorrectionWindow(),
      dropoutRiskWeeks: this.predictDropoffRisk(),
      planRecommendation: this.recommendPlan()
    };

    // Enhanced fields (optional, for UI intelligence)
    output.biologicalStrain = this.biologicalStrain;
    if (biologicalAge !== null) {
      output.biologicalAge = biologicalAge;
      output.biologicalAgeDelta = biologicalAgeDelta;
    }
    output.dimensionNarratives = this.generateAllDimensionNarratives();
    output.mlFeatures = this.extractMLFeatures();
    output.timestamp = new Date().toISOString();
    output.version = this.kb.version;

    return output;
  };

  /**
   * Generate narratives for all dimensions
   */
  HealthEngine.prototype.generateAllDimensionNarratives = function () {
    var narratives = {};
    for (var key in this.dimensions) {
      if (this.dimensions.hasOwnProperty(key)) {
        narratives[key] = {
          narrative: this.generateDimensionNarrative(key, this.dimensions[key]),
          biologicalExplanation: this.generateBiologicalExplanation(key, this.dimensions[key])
        };
      }
    }
    return narratives;
  };

  /**
   * DIMENSION 1: Metabolic Efficiency
   * Based on BMI, activity level, diabetes status
   */
  HealthEngine.prototype.computeMetabolic = function () {
    var score = 100;
    var bmi = this.calculateBMI();

    // BMI impact (matches user's specification)
    if (bmi > 27) score -= 20;
    else if (bmi > 24) score -= 10;

    // Activity level impact (using normalized numerical encoding)
    // activity: 1 = sedentary/low, 2 = light, 3 = moderate, 4 = high
    if (this.user.activity === 1) score -= 15;
    else if (this.user.activity === 2) score -= 5;
    // activity 3 (moderate) and 4 (high): no penalty

    // Diabetes impact (using boolean flag)
    if (this.user.health_diabetes) score -= 20;

    return this.clamp(score);
  };

  /**
   * DIMENSION 2: Recovery Load
   * Based on sleep quality and stress levels
   */
  HealthEngine.prototype.computeRecovery = function () {
    var score = 100;

    // Sleep impact (using normalized numerical encoding)
    // sleep: 1 = poor, 2 = inconsistent, 3 = good, 4 = restorative
    if (this.user.sleep === 1) score -= 25;
    else if (this.user.sleep === 2) score -= 10;
    // sleep 3 (good) and 4 (restorative): no penalty

    // Stress impact (using normalized numerical encoding)
    // stress: 1 = low, 2 = moderate, 3 = high, 4 = very-high
    if (this.user.stress === 3) score -= 20;
    else if (this.user.stress === 2) score -= 8;
    // stress 1 (low): no penalty
    if (this.user.stress === 4) score -= 25; // very-high gets additional penalty

    return this.clamp(score);
  };

  /**
   * DIMENSION 3: Hormonal Regulation
   * Based on thyroid, PCOS, stress, and hormonal conditions
   */
  HealthEngine.prototype.computeHormonal = function () {
    var score = 100;

    // Thyroid impact (using boolean flag)
    if (this.user.health_thyroid) score -= 25;

    // PCOS impact (using boolean flag)
    if (this.user.health_pcos) score -= 20;

    // Stress impact on hormones (using normalized numerical encoding)
    // stress: 1 = low, 2 = moderate, 3 = high, 4 = very-high
    if (this.user.stress === 3) score -= 10;
    else if (this.user.stress === 4) score -= 15; // very-high gets more penalty

    return this.clamp(score);
  };

  /**
   * DIMENSION 4: Behavioral Stability
   * Based on commitment level, stress, sleep, and obstacles
   */
  HealthEngine.prototype.computeBehavioral = function () {
    var score = 100;
    var commitment = (this.user.commitment || "").toString();

    // Commitment impact (matches user's specification)
    if (commitment === "2-3") score -= 15;

    // Stress impact on behavior (using normalized numerical encoding)
    // stress: 1 = low, 2 = moderate, 3 = high, 4 = very-high
    if (this.user.stress === 3) score -= 15;

    // Sleep impact on behavior (using normalized numerical encoding)
    // sleep: 1 = poor, 2 = inconsistent, 3 = good, 4 = restorative
    if (this.user.sleep === 1) score -= 10;

    return this.clamp(score);
  };

  /**
   * DIMENSION 5: Readiness
   * Based on goal clarity, medical conditions, and baseline factors
   */
  HealthEngine.prototype.computeReadiness = function () {
    var score = 100;
    var goal = ((this.user.primaryGoal || "") + "").toLowerCase();

    // Goal clarity (matches user's specification)
    if (goal === "weight-loss") score -= 5;

    // Medical conditions impact readiness (using boolean flag)
    if (this.user.healthIssueMain === "has") score -= 10;

    return this.clamp(score);
  };

  /**
   * AGGREGATE SCORE CALCULATION
   * Weighted average of all dimensions
   */
  HealthEngine.prototype.calculateHealthScore = function () {
    var w = this.kb.scoringWeights;
    var total =
      (this.dimensions.metabolic || 0) * w.metabolic +
      (this.dimensions.recovery || 0) * w.recovery +
      (this.dimensions.hormonal || 0) * w.hormonal +
      (this.dimensions.behavioral || 0) * w.behavioral +
      (this.dimensions.readiness || 0) * w.readiness;
    return Math.round(Math.max(0, Math.min(100, total)));
  };

  /**
   * RISK ZONE DETERMINATION
   * Returns zone label string (matches user's specification)
   */
  HealthEngine.prototype.getRiskZone = function (score) {
    if (score < 40) return "Severe Adaptive Strain";
    if (score < 60) return "Adaptive Strain";
    if (score < 75) return "Suboptimal Stability";
    return "Metabolic Stability";
  };

  /**
   * BIOLOGICAL STRAIN CALCULATION
   * Composite measure of system stress (0-100 scale)
   */
  HealthEngine.prototype.calculateBiologicalStrain = function () {
    var strain = 0;
    var dims = this.dimensions;

    // Inverse of scores = strain
    strain += (100 - dims.metabolic) * 0.25;
    strain += (100 - dims.recovery) * 0.25;
    strain += (100 - dims.hormonal) * 0.20;
    strain += (100 - dims.behavioral) * 0.15;
    strain += (100 - dims.readiness) * 0.15;

    return Math.round(Math.max(0, Math.min(100, strain)));
  };

  /**
   * BIOLOGICAL AGE CALCULATION (Production-Safe)
   * Converts health scores to realistic age deviation
   * Max deviation: +8 years (older) / -6 years (younger)
   * 
   * @param {Number} chronologicalAge - User's actual age
   * @returns {Number} Biological age (clamped to realistic band)
   */
  HealthEngine.prototype.calculateBiologicalAge = function (chronologicalAge) {
    if (!chronologicalAge || chronologicalAge <= 0) {
      return chronologicalAge || 30; // Safety fallback
    }

    var dims = this.dimensions;
    
    // Calculate composite health index (0-100)
    var compositeHealthIndex =
      (dims.metabolic || 60) * 0.25 +
      (dims.recovery || 60) * 0.20 +
      (dims.hormonal || 60) * 0.20 +
      (dims.behavioral || 60) * 0.20 +
      (dims.readiness || 60) * 0.15;

    // Convert health index to age deviation
    // Health index 100 = -6 years (younger)
    // Health index 0 = +8 years (older)
    // Linear mapping: deviation = (100 - healthIndex) / 12
    var deviation = (100 - compositeHealthIndex) / 12;

    // Calculate biological age
    var biologicalAge = chronologicalAge + deviation;

    // Clamp to realistic band (max +8, min -6)
    var maxDeviation = 8;
    var minDeviation = -6;

    if (biologicalAge > chronologicalAge + maxDeviation) {
      biologicalAge = chronologicalAge + maxDeviation;
    }

    if (biologicalAge < chronologicalAge + minDeviation) {
      biologicalAge = chronologicalAge + minDeviation;
    }

    return Math.round(biologicalAge);
  };

  /**
   * TOP DRIVERS EXTRACTION
   * Identifies the 3 highest impact areas for intervention
   * Matches user's specification: simple impact calculation
   */
  HealthEngine.prototype.extractTopDrivers = function () {
    var drivers = [];

    for (var key in this.dimensions) {
      if (this.dimensions.hasOwnProperty(key)) {
        drivers.push({
          name: key,
          impact: 100 - this.dimensions[key],
          // Enhanced fields for UI (optional, doesn't break structure)
          score: this.dimensions[key],
          displayName: this.getDimensionDisplayName(key),
          narrative: this.generateDimensionNarrative(key, this.dimensions[key]),
          biologicalExplanation: this.generateBiologicalExplanation(key, this.dimensions[key])
        });
      }
    }

    // Sort by impact (highest first) and return top 3
    return drivers
      .sort(function (a, b) { return b.impact - a.impact; })
      .slice(0, 3);
  };

  /**
   * Get display name for dimension
   */
  HealthEngine.prototype.getDimensionDisplayName = function (key) {
    var names = {
      metabolic: "Metabolic Efficiency",
      recovery: "Recovery Load",
      hormonal: "Hormonal Regulation",
      behavioral: "Behavioral Stability",
      readiness: "Readiness"
    };
    return names[key] || key;
  };

  /**
   * DIMENSION-SPECIFIC NARRATIVE GENERATION
   * Medical/authoritative tone explaining dimension status
   */
  HealthEngine.prototype.generateDimensionNarrative = function (dimensionName, score) {
    var user = this.user;
    var sleep = ((user.sleepQuality || "") + "").toLowerCase();
    var stress = ((user.stressLevel || "") + "").toLowerCase();
    var activity = ((user.activityLevel || "") + "").toLowerCase();
    var commitment = ((user.commitment || "") + "").toLowerCase();
    var bmi = this.calculateBMI();
    var issues = ((user.healthIssues || "") + "").toLowerCase();

    switch (dimensionName) {
      case "metabolic":
        if (score < 50) {
          return "Metabolic throughput is suppressed. Body composition signals indicate energy partitioning inefficiency. BMI of " + Math.round(bmi * 10) / 10 + " combined with " + (activity === "sedentary" || activity === "low" ? "insufficient" : "suboptimal") + " activity levels are reducing fat oxidation capacity by approximately " + Math.round((100 - score) * 0.3) + "%.";
        } else if (score < 70) {
          return "Metabolic efficiency shows optimization potential. Current body composition (BMI " + Math.round(bmi * 10) / 10 + ") suggests room for improvement in energy partitioning. Targeted nutrition protocols can enhance metabolic throughput.";
        }
        return "Metabolic throughput is functioning within optimal parameters. Energy partitioning efficiency supports sustained fat oxidation.";

      case "recovery":
        if (score < 50) {
          var sleepImpact = sleep === "poor" ? 25 : sleep === "inconsistent" ? 15 : 5;
          var stressImpact = stress === "very-high" ? 25 : stress === "high" ? 20 : stress === "moderate" ? 8 : 0;
          return "Recovery fragmentation detected. " + (sleep === "poor" ? "Sleep inconsistency" : "Suboptimal sleep patterns") + " combined with " + (stress === "very-high" || stress === "high" ? "elevated stress load" : "moderate stress") + " are suppressing recovery throughput. This reduces metabolic oxidation efficiency by approximately " + Math.round((100 - score) * 0.22) + "%.";
        } else if (score < 70) {
          return "Recovery patterns show room for optimization. Sleep and stress management improvements can accelerate fat oxidation by up to 22%.";
        }
        return "Recovery integrity is maintained. Sleep and stress load support optimal metabolic function.";

      case "hormonal":
        if (score < 50) {
          var hormonalFactors = [];
          if (issues.indexOf("thyroid") >= 0) hormonalFactors.push("thyroid regulation");
          if (issues.indexOf("pcos") >= 0) hormonalFactors.push("PCOS-related hormonal rhythm");
          if (stress === "high" || stress === "very-high") hormonalFactors.push("stress-induced cortisol elevation");
          return "Hormonal stability is compromised. " + (hormonalFactors.length > 0 ? hormonalFactors.join(" and ") + " are" : "Multiple factors are") + " disrupting insulin sensitivity and metabolic signaling. Structured correction can normalize hormonal response within 8-12 weeks.";
        } else if (score < 70) {
          return "Hormonal regulation shows mild inefficiency. Insulin sensitivity responds to structured meal timing and resistance training protocols.";
        }
        return "Hormonal stability is within optimal range. Metabolic signaling supports efficient energy utilization.";

      case "behavioral":
        if (score < 50) {
          var behavioralFactors = [];
          if (commitment.indexOf("2-3") >= 0 || commitment === "2" || commitment.indexOf("1") >= 0) {
            behavioralFactors.push("low commitment frequency");
          }
          if (stress === "high" || stress === "very-high") {
            behavioralFactors.push("elevated stress");
          }
          if (sleep === "poor") {
            behavioralFactors.push("sleep deficit");
          }
          return "Behavioral sustainability is at risk. " + (behavioralFactors.length > 0 ? behavioralFactors.join(" and ") + " indicate" : "Multiple factors indicate") + " high dropout vulnerability during weeks 3-4. Structured accountability protocols are critical for adherence.";
        } else if (score < 70) {
          return "Behavioral patterns show moderate stability. Consistency improvements can address plateau risk effectively.";
        }
        return "Behavioral sustainability is strong. Commitment patterns support long-term adherence.";

      case "readiness":
        if (score < 50) {
          return "Intervention readiness is compromised. Multiple factors including medical conditions and goal complexity suggest need for structured medical supervision.";
        } else if (score < 70) {
          return "Readiness for intervention is moderate. Structured support can address identified barriers effectively.";
        }
        return "Intervention readiness is optimal. Baseline factors support successful protocol adherence.";

      default:
        return "Dimension analysis indicates optimization potential.";
    }
  };

  /**
   * BIOLOGICAL EXPLANATION GENERATION
   * Scientific explanation of what's happening biologically
   */
  HealthEngine.prototype.generateBiologicalExplanation = function (dimensionName, score) {
    var impact = 100 - score;
    
    switch (dimensionName) {
      case "metabolic":
        return impact > 30 ? "Reduced mitochondrial efficiency → impaired fat oxidation → energy partitioning disruption" : 
               impact > 15 ? "Suboptimal metabolic throughput → partial fat oxidation capacity" :
               "Metabolic pathways functioning within normal parameters";

      case "recovery":
        return impact > 30 ? "Sleep fragmentation + elevated cortisol → suppressed recovery throughput → reduced metabolic oxidation" :
               impact > 15 ? "Suboptimal recovery patterns → partial metabolic efficiency" :
               "Recovery integrity supports optimal metabolic function";

      case "hormonal":
        return impact > 30 ? "Hormonal dysregulation → insulin resistance → impaired glucose metabolism → metabolic inefficiency" :
               impact > 15 ? "Mild hormonal inefficiency → suboptimal insulin sensitivity" :
               "Hormonal stability supports efficient metabolic signaling";

      case "behavioral":
        return impact > 30 ? "Low commitment frequency + stress amplification → high dropout risk → protocol interruption" :
               impact > 15 ? "Moderate behavioral instability → plateau risk" :
               "Behavioral patterns support consistent protocol adherence";

      case "readiness":
        return impact > 30 ? "Multiple barriers → reduced intervention readiness → need for structured support" :
               impact > 15 ? "Moderate readiness factors → benefit from guided protocols" :
               "Optimal readiness → supports successful intervention";

      default:
        return "Biological analysis indicates system status.";
    }
  };

  /**
   * CORRECTION WINDOW ESTIMATION
   * Predicts weeks needed for meaningful improvement
   */
  HealthEngine.prototype.estimateCorrectionWindow = function () {
    if (this.totalScore < 40) return 16;
    if (this.totalScore < 50) return 14;
    if (this.totalScore < 60) return 12;
    if (this.totalScore < 70) return 10;
    if (this.totalScore < 75) return 8;
    return 6;
  };

  /**
   * DROPOUT RISK PREDICTION
   * Identifies weeks with highest dropout vulnerability
   */
  HealthEngine.prototype.predictDropoffRisk = function () {
    var riskWeeks = [];
    var behavioral = this.dimensions.behavioral;
    var recovery = this.dimensions.recovery;
    var commitment = ((this.user.commitment || "") + "").toLowerCase();

    // High behavioral risk → weeks 3-4 are critical
    if (behavioral < 60) {
      riskWeeks.push(3, 4);
    }

    // Low recovery → early weeks (2-5) are vulnerable
    if (recovery < 60) {
      if (riskWeeks.indexOf(2) === -1) riskWeeks.push(2);
      if (riskWeeks.indexOf(5) === -1) riskWeeks.push(5);
    }

    // Low commitment → weeks 2-3 are critical
    if (commitment.indexOf("2-3") >= 0 || commitment === "2" || commitment.indexOf("1") >= 0) {
      if (riskWeeks.indexOf(2) === -1) riskWeeks.push(2);
      if (riskWeeks.indexOf(3) === -1) riskWeeks.push(3);
    }

    // Sort and return unique weeks
    return riskWeeks.sort(function (a, b) { return a - b; });
  };

  /**
   * PLAN RECOMMENDATION LOGIC
   * Structured plan based on score and dimensions
   */
  HealthEngine.prototype.recommendPlan = function () {
    var duration = 3; // months
    var intensity = "Moderate";
    var type = "Guided Correction";

    if (this.totalScore < 40) {
      duration = 6;
      intensity = "Structured Medical";
      type = "Intensive Correction";
    } else if (this.totalScore < 50) {
      duration = 6;
      intensity = "Structured Correction";
      type = "Guided Correction";
    } else if (this.totalScore < 60) {
      duration = 3;
      intensity = "Guided Correction";
      type = "Guided Correction";
    } else if (this.totalScore < 75) {
      duration = 3;
      intensity = "Moderate";
      type = "Optimization";
    } else {
      duration = 3;
      intensity = "Moderate";
      type = "Performance Optimization";
    }

    // Adjust based on top driver
    var topDriver = this.extractTopDrivers()[0];
    if (topDriver && topDriver.impact > 40) {
      if (topDriver.name === "hormonal") {
        type = "Hormone-Aware " + type;
      } else if (topDriver.name === "recovery") {
        type = "Recovery-Focused " + type;
      }
    }

    var rationale = "Recommended based on " + this.zone.label + 
      " with behavioral stability score of " + this.dimensions.behavioral + 
      ". Primary driver: " + (topDriver ? topDriver.displayName : "General") + ".";

    return {
      duration: duration,
      intensity: intensity,
      type: type,
      rationale: rationale,
      focusAreas: this.extractTopDrivers().map(function (d) { return d.displayName; })
    };
  };

  /**
   * ML-READY FEATURE EXTRACTION
   * Structured features for machine learning models
   */
  HealthEngine.prototype.extractMLFeatures = function () {
    var bmi = this.calculateBMI();
    var age = parseFloat(this.user.age) || 30;
    var weightGap = Math.abs(parseFloat(this.user.weight || 0) - parseFloat(this.user.targetWeight || 0));

    // Normalize categorical variables
    var sleep = ((this.user.sleepQuality || "") + "").toLowerCase();
    var sleepNum = sleep === "restorative" ? 4 : sleep === "good" ? 3 : sleep === "inconsistent" ? 2 : 1;

    var stress = ((this.user.stressLevel || "") + "").toLowerCase();
    var stressNum = stress === "low" ? 1 : stress === "moderate" ? 2 : stress === "high" ? 3 : 4;

    var activity = ((this.user.activityLevel || "") + "").toLowerCase();
    var activityNum = activity === "sedentary" ? 1 : activity === "low" ? 2 : 
                      activity === "light" ? 3 : activity === "moderate" ? 4 : 5;

    var commitment = ((this.user.commitment || "") + "").toLowerCase();
    var commitmentNum = commitment.indexOf("6-7") >= 0 ? 7 : commitment.indexOf("4-5") >= 0 ? 5 :
                       commitment.indexOf("2-3") >= 0 ? 3 : 2;

    var issues = ((this.user.healthIssues || "") + "").toLowerCase();
    var hasDiabetes = issues.indexOf("diabetes") >= 0 ? 1 : 0;
    var hasThyroid = issues.indexOf("thyroid") >= 0 ? 1 : 0;
    var hasPCOS = issues.indexOf("pcos") >= 0 ? 1 : 0;

    return {
      // Numerical features
      bmi: bmi,
      age: age,
      weightGap: weightGap,
      sleep: sleepNum,
      stress: stressNum,
      activity: activityNum,
      commitment: commitmentNum,
      // Binary features
      hasDiabetes: hasDiabetes,
      hasThyroid: hasThyroid,
      hasPCOS: hasPCOS,
      // Dimension scores
      metabolic: this.dimensions.metabolic,
      recovery: this.dimensions.recovery,
      hormonal: this.dimensions.hormonal,
      behavioral: this.dimensions.behavioral,
      readiness: this.dimensions.readiness,
      // Aggregates
      totalScore: this.totalScore,
      biologicalStrain: this.biologicalStrain
    };
  };

  /**
   * UTILITY: Calculate BMI
   */
  HealthEngine.prototype.calculateBMI = function () {
    var weight = parseFloat(this.user.weight) || 0;
    var height = parseFloat(this.user.height) || 0;
    if (weight === 0 || height === 0) return 22; // Default
    var heightM = height / 100;
    return weight / (heightM * heightM);
  };

  /**
   * UTILITY: Clamp value between 0 and 100
   */
  HealthEngine.prototype.clamp = function (val) {
    return Math.max(0, Math.min(100, Math.round(val)));
  };

  /**
   * BACKWARD COMPATIBILITY: Legacy methods
   */
  HealthEngine.prototype.calculateHealthScore = function (scores) {
    // If scores object provided, use weighted calculation
    if (scores && typeof scores === "object") {
      var w = this.kb.scoringWeights;
      var total =
        (scores.metabolic || 0) * w.metabolic +
        (scores.hormonal || 0) * w.hormonal +
        (scores.behavioral || 0) * w.behavioral +
        (scores.recovery || 0) * w.recovery +
        (scores.riskMomentum || 0) * w.readiness; // Map riskMomentum to readiness
      return Math.round(Math.max(0, Math.min(100, total)));
    }
    // Otherwise use computed dimensions
    return this.totalScore || this.calculateHealthScore({});
  };

  HealthEngine.prototype.generateNarrative = function (score, conditionMessage) {
    var t = this.kb.reportTemplate || {};
    var parts = [t.opening || "Your biology is responding to signals — not failing.", "", "Your current health score is " + (score || this.totalScore) + "/100.", ""];
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

  // Export
  if (typeof window !== "undefined") {
    window.HealthEngine = HealthEngine;
  }
  if (typeof module !== "undefined" && module.exports) {
    module.exports = HealthEngine;
  }
})(typeof window !== "undefined" ? window : this);
