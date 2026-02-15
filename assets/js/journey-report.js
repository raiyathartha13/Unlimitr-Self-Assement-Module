/**
 * Journey Page — AI Health Report
 * Loads assessment from localStorage/sessionStorage, renders scores, charts, OTP overlay.
 * STATIC_LAYOUT_MODE: Set true to disable animations until layout is stable.
 */
window.STATIC_LAYOUT_MODE = false;
(function () {
  var STORAGE_KEY = "ai_health_assessment_v2";
  var ASSESSMENT_DATA_KEY = "assessmentData";
  var HANDOFF_KEY = "journey_report_handoff";

  function getDemoData() {
    return {
      clientName: "Demo User",
      clientEmail: "demo@example.com",
      age: "30",
      gender: "male",
      height: "172",
      weight: "78",
      targetWeight: "70",
      activityLevel: "moderate",
      sleepQuality: "good",
      stressLevel: "moderate",
      healthIssues: "",
      primaryGoal: "weight-loss",
      commitment: "4-5"
    };
  }

  function loadData() {
    var raw = null;
    try {
      raw = localStorage.getItem(ASSESSMENT_DATA_KEY) || sessionStorage.getItem(ASSESSMENT_DATA_KEY) || localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    if (typeof window.loadAssessment === "function") {
      try {
        var loaded = window.loadAssessment();
        if (loaded) return loaded;
      } catch (e2) {}
    }
    var params = new URLSearchParams(window.location.search);
    if (params.get("demo") === "1") return getDemoData();
    return getDemoData();
  }

  function isDemoData(data) {
    return data && data.clientEmail === "demo@example.com";
  }

  function el(id) {
    return document.getElementById(id);
  }

  function setText(id, text) {
    var e = el(id);
    if (e) e.textContent = text != null ? text : "";
  }

  function setHtml(id, html) {
    var e = el(id);
    if (e) e.innerHTML = html != null ? html : "";
  }

  function init() {
    var data;
    try {
      data = loadData();
    } catch (e) {
      data = getDemoData();
    }
    if (!data || typeof data !== "object") {
      data = getDemoData();
    }

    if (isDemoData(data)) {
      var hero = document.querySelector(".genie-hero");
      if (hero) {
        var banner = document.createElement("p");
        banner.className = "small mb-0 mt-2";
        banner.style.cssText = "color: var(--spanish-green); font-weight: 600;";
        banner.textContent = "Showing sample report — complete assessment for your personal data.";
        if (!hero.querySelector(".genie-demo-banner")) {
          banner.classList.add("genie-demo-banner");
          hero.appendChild(banner);
        }
      }
    }

    try {
    var w = parseFloat(data.weight) || 78;
    var h = parseFloat(data.height) || 172;
    var age = parseFloat(data.age) || 30;
    var gender = (data.gender || "male").toLowerCase();
    var targetW = parseFloat(data.targetWeight) || 70;
    var issues = (data.healthIssues || "").trim().toLowerCase();
    var hasDiabetes = issues.indexOf("diabetes") >= 0;
    var hasThyroid = issues.indexOf("thyroid") >= 0;
    var hasPCOS = issues.indexOf("pcos") >= 0;
    var hasCondition = hasDiabetes || hasThyroid || hasPCOS || issues.length > 0;
    var heightM = h / 100;
    var bmi = w / (heightM * heightM);
    bmi = Math.round(bmi * 10) / 10;

    var engine = { metabolicAge: null };
    if (typeof window.runEngine === "function") {
      try {
        var eng = window.runEngine(data);
        if (eng && eng.metabolicAge != null) engine.metabolicAge = eng.metabolicAge;
      } catch (e) {}
    }
    if (engine.metabolicAge == null && data.age) {
      engine.metabolicAge = Math.round(parseFloat(data.age) + (bmi - 22) / 1.8);
    }
    if (engine.metabolicAge == null) engine.metabolicAge = Math.round(age + (bmi - 22) / 1.8);
    var metabolicAge = engine.metabolicAge;

    function getBMIScore(b) {
      if (!b || b < 18.5) return 60;
      if (b <= 22.9) return 100;
      if (b <= 24.9) return 80;
      if (b <= 29.9) return 60;
      if (b <= 34.9) return 40;
      return 20;
    }
    function getActivityScore() {
      var a = (data.activityLevel || "").toLowerCase();
      if (a === "sedentary" || a === "low") return 40;
      if (a === "light") return 60;
      if (a === "moderate") return 80;
      if (a === "high") return 100;
      return 60;
    }
    function getSleepScore() {
      var s = (data.sleepQuality || "").toLowerCase();
      if (s === "poor") return 40;
      if (s === "inconsistent") return 60;
      if (s === "good") return 90;
      if (s === "restorative") return 100;
      return 60;
    }
    function getStressScore() {
      var s = (data.stressLevel || "").toLowerCase();
      if (s === "low") return 100;
      if (s === "moderate") return 70;
      if (s === "high") return 40;
      if (s === "very-high") return 20;
      return 70;
    }
    var bmiScore = getBMIScore(bmi);
    var activityScore = getActivityScore();
    var sleepScore = getSleepScore();
    var stressScore = getStressScore();
    var baseScore = 0.30 * bmiScore + 0.20 * activityScore + 0.20 * sleepScore + 0.20 * stressScore;

    var totalPenalty = 0;
    var tshLevel = parseFloat(data.tshLevel);
    if (hasThyroid && !isNaN(tshLevel)) {
      if (tshLevel < 4) totalPenalty += 10;
      else if (tshLevel <= 8) totalPenalty += 20;
      else totalPenalty += 30;
      if ((data.thyroidType || "").toLowerCase() === "autoimmune") totalPenalty += 5;
    } else if (hasThyroid) totalPenalty += 15;
    var hba1c = parseFloat(data.hba1cLevel);
    if (hasDiabetes && !isNaN(hba1c)) {
      if (hba1c < 6.5) totalPenalty += 10;
      else if (hba1c <= 8) totalPenalty += 20;
      else totalPenalty += 30;
      var fasting = parseFloat(data.fastingSugar);
      if (!isNaN(fasting) && fasting > 130) totalPenalty += 5;
    } else if (hasDiabetes) totalPenalty += 15;
    if (hasPCOS) {
      totalPenalty += 15;
      if ((data.insulinResistance || "").toLowerCase() === "yes") totalPenalty += 10;
      var symptoms = data.pcosSymptoms;
      var symptomCount = Array.isArray(symptoms) ? symptoms.length : (symptoms ? String(symptoms).split(",").length : 0);
      if (symptomCount >= 2) totalPenalty += 5;
    }
    var menstrual = (data.menstrualCycle || "").toLowerCase();
    if (gender === "female" && menstrual) {
      if (menstrual === "irregular") totalPenalty += 5;
      else if (menstrual === "missed") totalPenalty += 10;
      else if (menstrual === "contraceptives") totalPenalty += 3;
    }
    var finalScore;
    if (typeof window.calculateBiologicalScore === "function" && typeof window.calculateBehaviorRisk === "function" && typeof window.getMLScore === "function") {
      try {
        var bio = window.calculateBiologicalScore(data);
        var behavior = window.calculateBehaviorRisk(data, bio);
        var commitmentScore = typeof window.getCommitmentScore === "function" ? window.getCommitmentScore(data) : 70;
        var medicalRiskScore = Math.min(100, totalPenalty * 3);
        var metabolicAgeGapNorm = Math.max(0, Math.min(1, (metabolicAge - age + 10) / 20));
        var normBmi = Math.max(0, Math.min(1, (bio.bmi - 18) / 22));
        var normGap = Math.max(0, Math.min(1, bio.weightGap / 25));
        var mlInput = [normBmi, metabolicAgeGapNorm, bio.stressScore / 100, bio.sleepScore / 100, bio.movementScore / 100, medicalRiskScore / 100, normGap, commitmentScore / 100];
        var mlScore = window.getMLScore(mlInput);
        var biologicalWithPenalty = Math.max(0, bio.biologicalScore - totalPenalty);
        finalScore = Math.round(Math.max(20, Math.min(100, (biologicalWithPenalty * 0.7) + (mlScore * 0.3))));
        if (typeof window.loadMLModel === "function") window.loadMLModel();
      } catch (e) {
        finalScore = Math.round(Math.max(20, Math.min(100, baseScore - totalPenalty)));
      }
    } else {
      finalScore = Math.round(Math.max(20, Math.min(100, baseScore - totalPenalty)));
    }

    function getRisk(score) {
      if (score >= 80) return { label: "Optimal", klass: "risk-tag--low" };
      if (score >= 60) return { label: "Moderate", klass: "risk-tag--moderate" };
      if (score >= 40) return { label: "Elevated", klass: "risk-tag--elevated" };
      return { label: "High Risk", klass: "risk-tag--high" };
    }
    var risk = getRisk(finalScore);

    var idealW = 22 * heightM * heightM;
    var weightGap = targetW < w ? Math.round((w - targetW) * 10) / 10 : (targetW > w ? Math.round((targetW - w) * 10) / 10 : Math.round((w - idealW) * 10) / 10);
    if (weightGap < 0) weightGap = 0;
    var conditionCount = (hasThyroid ? 1 : 0) + (hasDiabetes ? 1 : 0) + (hasPCOS ? 1 : 0);
    var weeklyLoss;
    if (conditionCount >= 2) weeklyLoss = 0.5;
    else if (hasThyroid || hasPCOS) weeklyLoss = 0.6;
    else if (hasDiabetes) weeklyLoss = 0.7;
    else weeklyLoss = age < 35 ? 1 : 0.8;
    if (weeklyLoss > 1) weeklyLoss = 1;
    var weeksRequired = weeklyLoss > 0 ? Math.ceil(weightGap / weeklyLoss) : 12;
    weeksRequired = Math.max(4, Math.min(52, weeksRequired));
    var durationMonths = Math.ceil(weeksRequired / 4);
    durationMonths = Math.max(1, Math.min(12, durationMonths));

    var weightProj;
    var weightWithout = [w];
    if (typeof window.organicWeightCurve === "function") {
      weightProj = window.organicWeightCurve(w, weeklyLoss, weeksRequired, idealW, stressScore);
    } else {
      weightProj = { labels: ["W1"], values: [w] };
      var curr = w;
      var loss = weeklyLoss;
      for (var i = 1; i <= weeksRequired; i++) {
        if (i > 1 && (i - 1) % 4 === 0) loss = loss * 0.95;
        curr = Math.max(idealW * 0.9, curr - loss);
        weightProj.values.push(Math.round(curr * 10) / 10);
        weightProj.labels.push("W" + (i + 1));
      }
    }
    if (typeof window.organicWithoutIntervention === "function") {
      weightWithout = window.organicWithoutIntervention(w, weeksRequired, stressScore);
    } else {
      for (var wi = 1; wi < weightProj.labels.length; wi++) {
        weightWithout.push(Math.round((w + wi * 0.08) * 10) / 10);
      }
    }

    var bmr = gender === "male" ? 10 * w + 6.25 * h - 5 * age + 5 : 10 * w + 6.25 * h - 5 * age - 161;
    bmr = Math.round(bmr);
    var activityFactor = activityScore <= 40 ? 1.2 : activityScore <= 60 ? 1.375 : activityScore <= 80 ? 1.55 : 1.725;
    var tdee = Math.round(bmr * activityFactor);
    var deficit = hasCondition ? 350 : 550;
    if (hasThyroid) deficit = Math.max(0, deficit - 100);
    if (hasDiabetes && deficit > 500) deficit = 500;
    var recommendedIntake = Math.round(tdee - deficit);
    var minCal = gender === "female" ? 1200 : 1400;
    if (recommendedIntake < minCal) recommendedIntake = minCal;
    var calorieNote = "";
    if (hasPCOS) calorieNote = " Stable carb distribution required.";
    var calorieProj = {
      labels: weightProj.labels,
      values: weightProj.labels.map(function (_, i) {
        var t = i / Math.max(1, weightProj.labels.length - 1);
        var wave = Math.sin(t * Math.PI * 2.5) * 40 + Math.sin(t * Math.PI * 4 + 0.5) * 20;
        return Math.round(recommendedIntake + wave);
      })
    };

    var scoreNumEl = el("healthScoreNum");
    if (scoreNumEl) scoreNumEl.textContent = "0";
    setText("bmiValue", bmi != null ? bmi.toFixed(1) : "--");
    var bmiFill = el("bmiFillBar");
    if (bmiFill && bmi != null) {
      var bmiPct = Math.max(0, Math.min(100, ((bmi - 18.5) / 21.5) * 100));
      bmiFill.style.width = bmiPct + "%";
    }
    setText("metaAge", metabolicAge);
    var riskEl = el("riskTag");
    if (riskEl) { riskEl.textContent = risk.label; riskEl.className = "risk-tag " + risk.klass; }

    var gaugeWrap = el("healthGaugeWrap");
    if (gaugeWrap) {
      var circle = gaugeWrap.querySelector(".gauge-circle");
      var needle = gaugeWrap.querySelector(".gauge-needle");
      var pct = finalScore / 100;
      var strokeColor = finalScore <= 40 ? "var(--dark-pastel-red)" : finalScore <= 70 ? "var(--earth-yellow)" : "var(--spanish-green)";
      if (circle) {
        circle.style.stroke = strokeColor;
        circle.style.strokeDasharray = "0 283";
        if (needle) needle.style.transform = "rotate(-135deg)";
        if (typeof gsap !== "undefined") {
          gsap.to(circle, { strokeDasharray: (pct * 283) + " 283", duration: 1.2, ease: "power2.out" });
          if (needle) gsap.to(needle, { rotation: pct * 270 - 135, duration: 1.2, ease: "power2.out", transformOrigin: "60px 60px" });
        } else {
          circle.style.strokeDasharray = pct * 283 + " 283";
          if (needle) needle.style.transform = "rotate(" + (pct * 270 - 135) + "deg)";
        }
      }
      if (scoreNumEl && typeof gsap !== "undefined") {
        var obj = { val: 0 };
        gsap.to(obj, { val: finalScore, duration: 1.2, ease: "power2.out", onUpdate: function() { scoreNumEl.textContent = Math.round(obj.val); } });
      } else if (scoreNumEl) scoreNumEl.textContent = finalScore;
      var numEl = gaugeWrap.querySelector(".health-score-gauge__number");
      if (numEl) numEl.style.color = strokeColor;
      var insightEl = el("healthScoreInsight");
      if (insightEl) {
        insightEl.textContent = "Based on your lifestyle signals and biomarkers, your body is functioning at " + finalScore + "/100. This score reflects reversible metabolic strain — not permanent damage. With structured guidance, this can move toward 85+ in the next 12–16 weeks.";
      }
    }

    if (typeof window.RecalibrationCore !== "undefined") {
      var recalEl = el("recalibrationContainer");
      if (recalEl) window.RecalibrationCore.render(recalEl, finalScore);
    }
    if (typeof window.AdaptiveCurve !== "undefined") {
      var curveEl = el("adaptiveCurveContainer");
      if (curveEl) {
        var curveValues = weightProj && weightProj.values && weightProj.values.length >= 2 ? weightProj.values : [w, w - 2, w - 4, w - 6, targetW];
        var curveLabels = weightProj && weightProj.labels && weightProj.labels.length >= 2 ? weightProj.labels : ["W1", "W4", "W8", "W12", "Goal"];
        try {
          window.AdaptiveCurve.render(curveEl, { values: curveValues, labels: curveLabels });
        } catch (err) {}
      }
    }
    if (typeof window.AIRadar !== "undefined") {
      try {
        var radarEl = el("aiRadarContainer");
        var highRisk = risk.label === "High Risk" || risk.label === "Elevated";
        if (radarEl) {
          if (typeof window.computeBodyRisks === "function") {
            var risks = window.computeBodyRisks(data);
            window.AIRadar.render(radarEl, { values: risks.map(function (r) { return r / 100; }), isHighRisk: highRisk });
          } else {
            window.AIRadar.render(radarEl, { values: [0.4, 0.35, 0.3, 0.35, 0.25, 0.2], isHighRisk: highRisk });
          }
        }
        var statusEl = el("riskRadarStatus");
        if (statusEl) statusEl.textContent = "Diagnostic scan complete.";
      } catch (e) {}
    }

    var summary = "";
    if (typeof window.generateReport === "function") {
      summary = window.generateReport({ finalScore: finalScore, weightGap: weightGap, hasCondition: hasCondition, healthScore: finalScore, sleepQuality: data.sleepQuality, stressLevel: data.stressLevel, activityLevel: data.activityLevel, healthIssues: data.healthIssues, tshLevel: data.tshLevel, hba1cLevel: data.hba1cLevel });
    } else if (typeof window.generateNarrative === "function") {
      summary = window.generateNarrative({ finalScore: finalScore, weightGap: weightGap, hasCondition: hasCondition });
    } else if (typeof window.generateEmotionalSummary === "function") {
      summary = window.generateEmotionalSummary(data);
    } else {
      var parts = [];
      if (bmi > 30) parts.push("Your weight-to-height ratio suggests metabolic strain.");
      else if (bmi > 25) parts.push("Your weight-to-height ratio suggests moderate metabolic strain.");
      else if (bmi <= 22.9) parts.push("Your BMI is within a healthy range.");
      else parts.push("Your metabolic efficiency has room for optimization.");
      var activity = (data.activityLevel || "").toLowerCase();
      if (activity === "sedentary" || activity === "low") parts.push("Activity level can support fat oxidation with gradual increase.");
      var sleep = (data.sleepQuality || "").toLowerCase();
      if (sleep === "poor") parts.push("Sleep patterns may affect hormonal balance — this can improve with structure.");
      var stress = (data.stressLevel || "").toLowerCase();
      if (stress === "high" || stress === "very-high") parts.push("Stress load likely impacts cortisol. Recovery protocols can help.");
      if (hasCondition) parts.push("Your health context suggests a condition-specific approach.");
      if (parts.length === 0) parts.push("Based on your inputs, your metabolic profile has been assessed.");
      summary = "Based on your lifestyle signals, " + parts.join(" ") + " The good news — these patterns are reversible with structured intervention.";
    }
    var name = (data.clientName || "there").split(" ")[0];
    var counsellorText = typeof window.CognitiveCounsellor === "function"
      ? window.CognitiveCounsellor({ clientName: name, finalScore: finalScore, weightGap: weightGap, durationMonths: durationMonths, weeklyLoss: weeklyLoss, clientEmail: data.clientEmail })
      : typeof window.generateCounsellorMessage === "function"
      ? window.generateCounsellorMessage({ clientName: name, finalScore: finalScore, weightGap: weightGap, durationMonths: durationMonths, weeklyLoss: weeklyLoss, clientEmail: data.clientEmail })
      : "Hello " + name + ", based on your metabolic profile, your body suggests a need for structured fat loss rather than aggressive dieting. The good news — your weight gap of " + weightGap + " kg over " + durationMonths + " months is achievable with a safe weekly loss of " + weeklyLoss + " kg. With guided accountability, this trajectory can be sustained.";
    var calmSummary = summary.replace(/struggle|failure|damage|broken/gi, function(m) { return m.toLowerCase().indexOf("damage") >= 0 ? "reversible strain" : m; });
    var mergedInsights = counsellorText + " " + calmSummary;
    var healthInsightsEl = el("healthInsightsText");
    if (healthInsightsEl) {
      if (typeof window.progressiveAIReveal === "function") {
        window.progressiveAIReveal(healthInsightsEl, mergedInsights, data);
      } else if (typeof window.typewriterReveal === "function") {
        window.typewriterReveal(healthInsightsEl, mergedInsights, 0.025);
      } else {
        healthInsightsEl.textContent = mergedInsights;
      }
    }

    if (typeof window.initBiologicalAvatar === "function" || typeof window.initBiologicalEngine === "function") {
      (window.initBiologicalAvatar || window.initBiologicalEngine)(data);
    }
    if (typeof window.initHologramEngine === "function") {
      window.initHologramEngine(data);
    }

    var chronologicalAge = age;
    if (data.dob) {
      try {
        var dobDate = new Date(data.dob);
        if (!isNaN(dobDate.getTime())) {
          var today = new Date();
          chronologicalAge = today.getFullYear() - dobDate.getFullYear();
          if (today.getMonth() < dobDate.getMonth() || (today.getMonth() === dobDate.getMonth() && today.getDate() < dobDate.getDate())) chronologicalAge--;
        }
      } catch (e) {}
    }

    var metricsEl = el("genieConditionMetrics");
    if (metricsEl) {
      var metricCards = [];
      if (hasDiabetes) {
        var hba1cVal = parseFloat(data.hba1cLevel);
        var hba1cStatus = "Not provided";
        var hba1cPct = 50;
        if (!isNaN(hba1cVal)) {
          if (hba1cVal < 5.7) { hba1cStatus = "Optimal"; hba1cPct = 15; } else if (hba1cVal < 6.5) { hba1cStatus = "Suboptimal"; hba1cPct = 45; } else { hba1cStatus = "Critical"; hba1cPct = 80; }
        }
        var statusClass = hba1cStatus === "Optimal" ? "genie-metric-status--optimal" : hba1cStatus === "Suboptimal" ? "genie-metric-status--suboptimal" : "genie-metric-status--critical";
        metricCards.push("<div class='col-md-4'><div class='genie-metric-card genie-card-gradient-metric'><div class='fw-600 small mb-1'>HbA1c</div><div class='genie-metric-value'>" + (isNaN(hba1cVal) ? "—" : hba1cVal + "%") + "</div><div class='genie-metric-status " + statusClass + "'>" + hba1cStatus + "</div><div class='genie-range-bar mt-2' style='height:6px'><div class='genie-range-marker' style='left:" + hba1cPct + "%'></div></div></div></div>");
      }
      if (hasThyroid) {
        var tshVal = parseFloat(data.tshLevel);
        var tshStatus = "Not provided";
        var tshPct = 50;
        if (!isNaN(tshVal)) {
          if (tshVal >= 0.5 && tshVal <= 4) { tshStatus = "Optimal"; tshPct = 40; } else if (tshVal <= 8) { tshStatus = "Suboptimal"; tshPct = 65; } else { tshStatus = "Critical"; tshPct = 90; }
        }
        var tshClass = tshStatus === "Optimal" ? "genie-metric-status--optimal" : tshStatus === "Suboptimal" ? "genie-metric-status--suboptimal" : "genie-metric-status--critical";
        metricCards.push("<div class='col-md-4'><div class='genie-metric-card genie-card-gradient-metric'><div class='fw-600 small mb-1'>TSH (mIU/L)</div><div class='genie-metric-value'>" + (isNaN(tshVal) ? "—" : tshVal) + "</div><div class='genie-metric-status " + tshClass + "'>" + tshStatus + "</div><div class='genie-range-bar mt-2' style='height:6px'><div class='genie-range-marker' style='left:" + tshPct + "%'></div></div></div></div>");
      }
      if (hasDiabetes && data.fastingSugar) {
        var fastingVal = parseFloat(data.fastingSugar);
        var fastingStatus = "Not provided";
        var fastingPct = 50;
        if (!isNaN(fastingVal)) {
          if (fastingVal < 100) { fastingStatus = "Optimal"; fastingPct = 25; } else if (fastingVal < 126) { fastingStatus = "Suboptimal"; fastingPct = 55; } else { fastingStatus = "Critical"; fastingPct = 85; }
        }
        var fastClass = fastingStatus === "Optimal" ? "genie-metric-status--optimal" : fastingStatus === "Suboptimal" ? "genie-metric-status--suboptimal" : "genie-metric-status--critical";
        metricCards.push("<div class='col-md-4'><div class='genie-metric-card genie-card-gradient-metric'><div class='fw-600 small mb-1'>Fasting Sugar (mg/dL)</div><div class='genie-metric-value'>" + (isNaN(fastingVal) ? "—" : fastingVal) + "</div><div class='genie-metric-status " + fastClass + "'>" + fastingStatus + "</div><div class='genie-range-bar mt-2' style='height:6px'><div class='genie-range-marker' style='left:" + fastingPct + "%'></div></div></div></div>");
      }
      if (metricCards.length) metricsEl.innerHTML = metricCards.join("");
      else metricsEl.innerHTML = "<div class='col-12'><p class='muted small mb-0'>No biomarker data from assessment. Complete the form with condition details for personalized metrics.</p></div>";
    }

    var conditionContent = el("conditionContent");
    if (conditionContent) {
      var condHtml = "";
      if (hasDiabetes) {
        var hba1cVal = data.hba1cLevel ? data.hba1cLevel : "—";
        condHtml += "<div class='p-3 rounded-3 mb-2' style='background: rgba(0, 137, 68, 0.08); border: 1px solid rgba(0, 137, 68, 0.2);'><div class='fw-600 mb-2' style='color: var(--spanish-green);'>Diabetes Profile</div><p class='muted small mb-1'>Insulin Resistance Risk: Assessed. Glycemic Load Sensitivity: Assessed.</p><p class='muted small mb-0'>Based on your HBA1c of " + hba1cVal + ", structured fat loss can improve glycemic control by 0.8–1.5 points in 3–4 months.</p></div>";
      }
      if (hasThyroid) {
        var tshVal = data.tshLevel ? data.tshLevel : "—";
        condHtml += "<div class='p-3 rounded-3 mb-2' style='background: rgba(0, 137, 68, 0.08); border: 1px solid rgba(0, 137, 68, 0.2);'><div class='fw-600 mb-2' style='color: var(--spanish-green);'>Thyroid Profile</div><p class='muted small mb-1'>Metabolic slowdown: Assessed.</p><p class='muted small mb-0'>With TSH at " + tshVal + ", metabolic stabilization may take 8–12 weeks.</p></div>";
      }
      if (hasPCOS) {
        condHtml += "<div class='p-3 rounded-3 mb-2' style='background: rgba(0, 137, 68, 0.08); border: 1px solid rgba(0, 137, 68, 0.2);'><div class='fw-600 mb-2' style='color: var(--spanish-green);'>PCOS Profile</div><p class='muted small mb-1'>Hormonal instability index: Assessed.</p><p class='muted small mb-0'>Cycle regularity typically improves within 12 weeks when insulin sensitivity improves.</p></div>";
      }
      if (condHtml) setHtml("conditionContent", condHtml);
      else setHtml("conditionContent", "<p class='muted mb-0'>No specific medical condition selected. Your metabolic profile is assessed for general wellness.</p>");
    }

    var sleep = (data.sleepQuality || "").toLowerCase();
    var stress = (data.stressLevel || "").toLowerCase();
    var activity = (data.activityLevel || "").toLowerCase();
    var commitment = (data.commitment || "").toLowerCase();
    var metab = bmi <= 22.9 ? 85 : bmi <= 25 ? 70 : bmi <= 30 ? 50 : 35;
    if (hasThyroid || hasDiabetes) metab = Math.max(25, metab - 15);
    metab = Math.max(0, Math.min(100, metab));
    var hormonal = hasCondition ? 55 : (stress === "high" || stress === "very-high" ? 45 : 70);
    if (hasPCOS) hormonal = Math.max(30, hormonal - 15);
    if (menstrual === "irregular" || menstrual === "missed") hormonal = Math.max(25, hormonal - 10);
    if ((data.thyroidType || "").toLowerCase() === "autoimmune") hormonal = Math.max(25, hormonal - 10);
    hormonal = Math.max(0, Math.min(100, hormonal));
    var recovery = sleep === "poor" ? 35 : sleep === "inconsistent" ? 55 : 85;
    if (stress === "high" || stress === "very-high") recovery = Math.min(recovery, 50);
    recovery = Math.max(0, Math.min(100, recovery));
    var movement = activity === "high" ? 85 : activity === "moderate" ? 70 : activity === "light" ? 55 : 35;
    if (commitment === "2-3") movement = Math.min(movement, 50);
    if (activity === "sedentary" || activity === "low") movement = Math.min(movement, 40);
    movement = Math.max(0, Math.min(100, movement));

    /* Live Cards Grid — Metabolic Score, BMI, Metabolic Age, Chronological Age, Risk Index, Transformation Timeline, Duration, Consistency & Plateau */
    var liveGridEl = el("liveCardsGrid");
    if (liveGridEl && typeof window.LiveCard !== "undefined") {
      var behaviorP = typeof window.computeBehaviorPredictions === "function" ? window.computeBehaviorPredictions(data) : { adherence: 70, plateau: 25, relapse: 20 };
      var riskScore = finalScore >= 80 ? 15 : finalScore >= 60 ? 35 : finalScore >= 40 ? 55 : 75;
      var bmiScore = getBMIScore(bmi);
      var timelineProgress = Math.min(100, Math.round((12 / Math.max(1, durationMonths)) * 15));
      var metabolicAnalysis = "Your metabolic health reflects how efficiently your body processes energy, hormones, and recovery. BMI " + (bmi != null ? bmi.toFixed(1) : "--") + ", metabolic age " + metabolicAge + " yrs. " + (risk.label !== "Optimal" ? "Structured intervention can improve this." : "Maintain consistency.");
      var bmiAnalysis = (bmi <= 22.9 ? "Your BMI is within an optimal range. " : bmi > 25 ? "Your BMI suggests metabolic strain. " : "Your BMI has room for optimization. ") + "Weight-to-height ratio at " + (bmi != null ? bmi.toFixed(1) : "--") + ". This can improve with structured nutrition and activity — not permanent.";
      var metaAgeAnalysis = "Your biological age (" + metabolicAge + " yrs) vs chronological (" + chronologicalAge + " yrs). " + ((metabolicAge - chronologicalAge) > 2 ? "Gap suggests metabolic stress. Recovery protocols can narrow it." : "Alignment is reasonable. Continue supporting metabolism.");
      var chronoAnalysis = "Your chronological age (" + chronologicalAge + " yrs) is the baseline for comparison. Metabolic age reflects how your body is actually functioning.";
      var riskAnalysis = risk.label === "Optimal" ? "Your risk profile is favorable. Keep supporting metabolic health." : risk.label === "Moderate" ? "Moderate risk — lifestyle adjustments can improve this trajectory." : "Elevated risk. Structured intervention can restore balance. Not permanent damage.";
      var timelineAnalysis = "Based on " + weightGap + " kg gap, " + Math.ceil(durationMonths * 4) + " weeks at " + weeklyLoss + " kg/week. Sustainable pace preserves hormonal stability.";
      var durationAnalysis = "Estimated " + durationMonths + " months for sustainable change. Weekly loss " + weeklyLoss + " kg. Goal " + weightGap + " kg. This pace avoids metabolic adaptation penalties.";
      var consistencyAnalysis = (behaviorP.adherence >= 75 ? "High likelihood of consistency. " : behaviorP.adherence >= 50 ? "Moderate consistency expected. " : "Lower consistency risk. ") + "Plateau risk " + behaviorP.plateau + "%. With guided accountability, adherence can improve.";
      var cards = [
        { type: "gauge", opts: { title: "Metabolic Score", score: finalScore, glow: true, pulse: true, explanation: metabolicAnalysis } },
        { type: "gauge", opts: { title: "BMI", score: bmiScore, label: bmi <= 22.9 ? "Optimal" : bmi <= 25 ? "Good" : bmi <= 30 ? "Elevated" : "High", glow: true, explanation: bmiAnalysis } },
        { type: "gauge", opts: { title: "Metabolic Age", score: Math.max(0, Math.min(100, 100 - Math.abs(metabolicAge - age) * 2)), label: metabolicAge + " yrs", suffix: "", glow: true, explanation: metaAgeAnalysis } },
        { type: "gauge", opts: { title: "Chronological Age", score: 50, label: chronologicalAge + " yrs", suffix: "", glow: true, explanation: chronoAnalysis } },
        { type: "gauge", opts: { title: "Risk Index", score: riskScore, invertColors: true, label: risk.label, glow: true, glowColor: riskScore > 50 ? "rgba(255, 107, 107, 0.12)" : "rgba(46, 212, 122, 0.08)", pulse: true, explanation: riskAnalysis } },
        { type: "gauge", opts: { title: "Transformation Timeline", score: timelineProgress, label: durationMonths + " mo", suffix: "", glow: true, explanation: timelineAnalysis } },
        { type: "gauge", opts: { title: "Duration", score: Math.min(100, Math.round((durationMonths / 12) * 100)), label: durationMonths + " mo", suffix: "", glow: true, explanation: durationAnalysis } },
        { type: "gauge", opts: { title: "Consistency & Plateau", score: behaviorP.adherence, label: behaviorP.adherence >= 75 ? "High" : behaviorP.adherence >= 50 ? "Moderate" : "Low", glow: true, explanation: consistencyAnalysis } }
      ];
      if (hasDiabetes) {
        var hba1cVal = parseFloat(data.hba1cLevel);
        if (!isNaN(hba1cVal)) {
          var hba1cStatus = hba1cVal < 5.7 ? "Optimal" : hba1cVal < 6.5 ? "Suboptimal" : "Critical";
          cards.push({ type: "bar", opts: { title: "Blood Test", subTitle: "HbA1c", value: hba1cVal, min: 4, max: 10, thresholds: [5.7, 6.5], labels: ["4", "5.7", "6.5", "10"], unit: "%", status: hba1cStatus, glow: true } });
        }
        var fastingVal = parseFloat(data.fastingSugar);
        if (!isNaN(fastingVal)) {
          var fastingStatus = fastingVal < 100 ? "Optimal" : fastingVal < 126 ? "Suboptimal" : "Critical";
          cards.push({ type: "bar", opts: { title: "Fasting Glucose", value: fastingVal, min: 70, max: 180, thresholds: [100, 126], labels: ["70", "100", "126", "180"], unit: " mg/dL", status: fastingStatus, glow: true } });
        }
      }
      if (hasThyroid) {
        var tshVal = parseFloat(data.tshLevel);
        if (!isNaN(tshVal)) {
          var tshStatus = (tshVal >= 0.5 && tshVal <= 4) ? "Optimal" : tshVal <= 8 ? "Suboptimal" : "Critical";
          cards.push({ type: "bar", opts: { title: "Thyroid", subTitle: "TSH", value: tshVal, min: 0, max: 10, thresholds: [4, 8], labels: ["0", "4", "8", "10"], unit: " mIU/L", status: tshStatus, glow: true } });
        }
      }
      window.LiveCard.renderGrid(liveGridEl, cards);
    }

    /* What's Driving — 4 semi-circle cards with explanation */
    var rootCauseGridEl = el("rootCauseCardsGrid");
    if (rootCauseGridEl && typeof window.LiveCard !== "undefined") {
      var metabText = bmi > 25 ? "Your BMI suggests metabolic strain. This can improve with structured nutrition and activity — not permanent damage." : "Your metabolic baseline is supported. Continued attention to activity can maintain or enhance it.";
      var hormonalText = hasCondition ? "Your health context affects hormonal balance. Condition-aware protocol can restore stability." : (stress === "high" || stress === "very-high" ? "Stress impacts cortisol. Recovery protocols can help restore balance." : "Hormonal balance is supported.");
      var recoveryText = (sleep === "poor" || stress === "high" || stress === "very-high") ? "Sleep and stress suggest recovery deficit. Targeted adjustments can improve capacity." : "Recovery quality supports metabolic health.";
      var movementText = (activity === "sedentary" || activity === "light") ? "Movement deficit is a key lever. Gradual increase can accelerate results with structured guidance." : "Your activity baseline supports metabolic health.";
      var rcCards = [
        { type: "gauge", opts: { title: "Metabolic Efficiency", score: metab, label: metab >= 70 ? "Good" : metab >= 50 ? "Fair" : "Improve", explanation: metabText, expandable: false } },
        { type: "gauge", opts: { title: "Hormonal Balance", score: hormonal, label: hormonal >= 70 ? "Balanced" : hormonal >= 50 ? "Fair" : "Strained", explanation: hormonalText, expandable: false } },
        { type: "gauge", opts: { title: "Recovery Quality", score: recovery, label: recovery >= 70 ? "Solid" : recovery >= 50 ? "Fair" : "Low", explanation: recoveryText, expandable: false } },
        { type: "gauge", opts: { title: "Movement Deficit", score: movement, label: movement >= 70 ? "Active" : movement >= 50 ? "Moderate" : "Low", explanation: movementText, expandable: false } }
      ];
      rcCards.forEach(function (c) {
        var wrap = document.createElement("div");
        wrap.className = "live-card-wrap";
        window.LiveCard.renderHalfCircle(wrap, c.opts);
        rootCauseGridEl.appendChild(wrap);
      });
    }

    var hi = typeof window.runHealthIntelligenceEngine === "function" ? window.runHealthIntelligenceEngine(data) : null;
    var wList = hi ? (hi.withoutIntervention || []) : ["Gradual metabolic drift"];
    var vList = hi ? (hi.withIntervention || []) : ["Fat oxidation restored", "Hormones balanced", "Health Score → 85+ projected"];

    /* Trajectory Comparison — 2 cards 50% each */
    var trajectoryEl = el("trajectoryTwoCards");
    if (trajectoryEl && typeof window.LiveCard !== "undefined") {
      var withoutScore = 25;
      var withScore = 85;
      var traj1 = document.createElement("div");
      var traj2 = document.createElement("div");
      window.LiveCard.renderHalfCircle(traj1, { title: "If Current Patterns Continue", score: withoutScore, invertColors: false, label: "Caution", glow: true, glowColor: "rgba(255, 107, 107, 0.12)", explanation: "<ul class='mb-0 ps-3' style='font-size:13px;'>" + wList.map(function(x) { return "<li>" + x + "</li>"; }).join("") + "</ul>", expandable: false });
      window.LiveCard.renderHalfCircle(traj2, { title: "With Structured Intervention", score: withScore, label: "Projected", glow: true, explanation: "<ul class='mb-0 ps-3' style='font-size:13px;'>" + vList.map(function(x) { return "<li>" + x + "</li>"; }).join("") + "</ul>", expandable: false });
      trajectoryEl.appendChild(traj1);
      trajectoryEl.appendChild(traj2);
    }

    setText("tdeeText", "Current TDEE: " + tdee + " kcal/day (Mifflin-St Jeor + activity factor).");
    setText("recommendedIntakeText", "Recommended intake: " + recommendedIntake + " kcal/day. Never below " + minCal + " kcal." + calorieNote);

    var calorieNoteEl = el("calorieNote");
    if (calorieNoteEl) calorieNoteEl.textContent = "80% of calorie burn happens without exercise. Metabolism optimization can support sustainable results.";

    if (hi) {
      if (hi.conditionPlan) {
        var condPanel = el("conditionIntelligencePanel");
        if (condPanel) {
          var p = hi.conditionPlan;
          condPanel.innerHTML = "<div class='p-3 rounded-3' style='background: rgba(0, 137, 68, 0.08); border: 1px solid rgba(0, 137, 68, 0.2);'><div class='fw-600 mb-2' style='color: var(--spanish-green);'>Recommended Plan: " + p.title + "</div><p class='muted small mb-2'>" + p.focus + "</p><p class='muted small mb-2'>What Unlimitr corrects: Condition-specific nutrition, metabolic stabilization, and hormonal support. Generic diets fail because they ignore your biology.</p><p class='fw-600 small mb-2'>Starting at ₹6,500/month</p><a href='offer.html' class='primary-btn btn-sm' id='conditionPlanCta'>View Medical Plan</a></div>";
          var cta = condPanel.querySelector("#conditionPlanCta");
          if (cta) cta.addEventListener("click", function(e) { e.preventDefault(); var h = { finalScore: finalScore, riskCategory: risk.label, weightGap: weightGap, durationMonths: durationMonths, conditionType: p.key, recommendedWeeklyLoss: weeklyLoss }; try { localStorage.setItem(HANDOFF_KEY, JSON.stringify(h)); } catch (x) {} window.location.href = "offer.html"; });
        }
      }
    }

    var planResult = (typeof window.runEngine === "function") ? (function() { try { return window.runEngine(data).planResult; } catch (e) { return null; } })() : null;
    var planName = planResult && planResult.plan ? planResult.plan.title : "Fitstart Total Wellness Plan";
    var planMonths = durationMonths <= 4 ? 3 : durationMonths <= 8 ? 6 : 12;
    setText("conversionPlanName", planName);
    setText("conversionPlanDuration", "Suggested duration: " + planMonths + " months for sustainable results.");
    setText("conversionExpectedLoss", "Expected weight loss: " + weightGap + " kg.");
    setText("conversionScoreImprovement", "With structured intervention, your score can move from " + finalScore + " toward 85+ over the next 12–16 weeks.");
    var handoffFn = function() { var h = { finalScore: finalScore, riskCategory: risk.label, weightGap: weightGap, durationMonths: durationMonths, conditionType: hasDiabetes ? "diabetes" : hasThyroid ? "thyroid" : hasPCOS ? "pcos" : "none", recommendedWeeklyLoss: weeklyLoss }; try { localStorage.setItem(HANDOFF_KEY, JSON.stringify(h)); } catch (e) {} window.location.href = "offer.html"; };
    ["ctaUnlockPlan", "cta90Day", "ctaMetabolism"].forEach(function(id) { var btn = el(id); if (btn) btn.addEventListener("click", handoffFn); });

    var weightCtx = el("weightChart");
    var calorieCtx = el("calorieChart");
    if (weightCtx && typeof Chart !== "undefined" && weightProj.values.length) {
      var grad = weightCtx.getContext("2d").createLinearGradient(0, 0, 0, 150);
      grad.addColorStop(0, "rgba(0, 191, 166, 0.25)"); grad.addColorStop(1, "rgba(0, 191, 166, 0)");
      var weekInsights = [];
      for (var wi = 0; wi < weightProj.labels.length; wi++) {
        var wl = weightProj.labels[wi];
        var wn = parseInt(String(wl).replace("W", ""), 10) || wi + 1;
        var insight = "";
        if (wn <= 2) insight = "Initial adaptation phase. Hydration and consistency suggest the pace.";
        else if (wn <= 4) insight = "Early fat oxidation begins. Hormonal stability supports this phase.";
        else if (wn === 5 || wn === 6) insight = "Metabolic adaptation may slow rate slightly — this preserves hormonal stability.";
        else if (wn <= 12) insight = "Sustainable loss phase. Body composition shifts toward lean mass preservation.";
        else insight = "Long-term phase. Maintenance habits can establish.";
        weekInsights.push(insight);
      }
      new Chart(weightCtx, {
        type: "line",
        data: {
          labels: weightProj.labels,
          datasets: [
            { label: "With Unlimitr Protocol", data: weightProj.values, borderColor: "#00BFA6", backgroundColor: grad, fill: true, tension: 0.45, borderWidth: 2.5, pointRadius: 0, pointHoverRadius: 4 },
            { label: "Without Intervention", data: weightWithout, borderColor: "rgba(255, 107, 107, 0.6)", borderDash: [5, 5], tension: 0.35, borderWidth: 1.5, pointRadius: 0, pointHoverRadius: 3 }
          ]
        },
        options: {
          responsive: true,
          animation: { duration: 1200 },
          plugins: {
            legend: { labels: { usePointStyle: true, padding: 16 } },
            tooltip: {
              backgroundColor: "rgba(255,255,255,0.96)",
              titleColor: "#0D3256",
              bodyColor: "#0D3256",
              borderColor: "rgba(13,50,86,0.08)",
              borderWidth: 1,
              callbacks: {
                afterLabel: function(ctx) {
                  var i = ctx.dataIndex;
                  return weekInsights[i] ? (weightProj.labels[i] + ": " + weekInsights[i]) : "";
                }
              }
            }
          },
          scales: {
            y: { beginAtZero: false, grid: { color: "rgba(13,50,86,0.06)" }, ticks: { color: "rgba(13,50,86,0.6)" } },
            x: { grid: { color: "rgba(13,50,86,0.06)" }, ticks: { color: "rgba(13,50,86,0.6)" } }
          }
        }
      });
    }
    if (calorieCtx && typeof Chart !== "undefined" && calorieProj.values.length) {
      var calGrad = calorieCtx.getContext("2d").createLinearGradient(0, 0, 0, 150);
      calGrad.addColorStop(0, "rgba(0, 191, 166, 0.2)"); calGrad.addColorStop(1, "rgba(0, 191, 166, 0)");
      new Chart(calorieCtx, {
        type: "line",
        data: {
          labels: calorieProj.labels,
          datasets: [{ label: "Recommended intake (kcal)", data: calorieProj.values, borderColor: "#00BFA6", backgroundColor: calGrad, fill: true, tension: 0.5, borderWidth: 2.5, pointRadius: 0, pointHoverRadius: 4 }]
        },
        options: {
          responsive: true,
          animation: { duration: 1200 },
          plugins: {
            legend: { labels: { usePointStyle: true, padding: 16 } },
            tooltip: { backgroundColor: "rgba(255,255,255,0.96)", titleColor: "#0D3256", bodyColor: "#0D3256", borderColor: "rgba(13,50,86,0.08)", borderWidth: 1 }
          },
          scales: {
            y: { beginAtZero: false, grid: { color: "rgba(13,50,86,0.06)" }, ticks: { color: "rgba(13,50,86,0.6)" } },
            x: { grid: { color: "rgba(13,50,86,0.06)" }, ticks: { color: "rgba(13,50,86,0.6)" } }
          }
        }
      });
    }

    var goToOffer = el("goToOffer");
    if (goToOffer) {
      goToOffer.addEventListener("click", function () {
        var handoff = { finalScore: finalScore, riskCategory: risk.label, weightGap: weightGap, durationMonths: durationMonths, conditionType: hasDiabetes ? "diabetes" : hasThyroid ? "thyroid" : hasPCOS ? "pcos" : "none", recommendedWeeklyLoss: weeklyLoss };
        try { localStorage.setItem(HANDOFF_KEY, JSON.stringify(handoff)); } catch (e) {}
        window.location.href = "offer.html";
      });
    }

    if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
      document.querySelectorAll(".journey-section-animate").forEach(function(section) {
        gsap.fromTo(section, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: "power2.out", scrollTrigger: { trigger: section, start: "top 85%", toggleActions: "play none none none" } });
      });
    }
    /* GlassParallax (cursor-tilt cards) disabled per request */
    if (typeof window.initNeuralBackground === "function") {
      window.initNeuralBackground();
    }
    if (typeof window.initConditionGlow === "function") {
      window.initConditionGlow(hasCondition);
    }
    if (typeof window.Bootstrap !== "undefined" && window.Bootstrap.initEngines) {
      window.Bootstrap.initEngines({ data: data, finalScore: finalScore, targetScore: 85 });
    } else {
      if (typeof window.initAmbientEngine === "function" || typeof window.initAmbientBackground === "function") {
        (window.initAmbientEngine || window.initAmbientBackground)();
      }
      if (typeof window.initAmbientMotion === "function") window.initAmbientMotion();
      if (typeof window.startRecalibrationCore === "function" || typeof window.startAILiveRecalibration === "function") {
        (window.startRecalibrationCore || window.startAILiveRecalibration)(data);
      }
      if (typeof window.initGamificationEngine === "function") window.initGamificationEngine(data, finalScore);
      if (typeof window.initVoiceCoach === "function") window.initVoiceCoach();
      if (typeof window.initRiskRadar === "function") window.initRiskRadar(data);
      if (typeof window.MorphEngine !== "undefined" && window.MorphEngine.setGender) window.MorphEngine.setGender(data.gender);
    }
    var lockInCta = el("lockInCta");
    if (lockInCta) {
      lockInCta.addEventListener("click", function (e) {
        e.preventDefault();
        var handoff = { finalScore: finalScore, riskCategory: risk.label, weightGap: weightGap, durationMonths: durationMonths, conditionType: hasDiabetes ? "diabetes" : hasThyroid ? "thyroid" : hasPCOS ? "pcos" : "none", recommendedWeeklyLoss: weeklyLoss };
        try { localStorage.setItem(HANDOFF_KEY, JSON.stringify(handoff)); } catch (x) {}
        window.location.href = "offer.html";
      });
    }
    } catch (err) {
      if (typeof console !== "undefined" && console.error) console.error("Genie dashboard init error:", err);
      var wrap = el("aiHealthSummary");
      if (wrap && !wrap.querySelector(".premium-score-card")) {
        wrap.innerHTML = "<div class='glass-card p-4 text-center'><h3 class='h5 mb-3' style='color: var(--primary-indigo);'>Something went wrong</h3><p class='muted mb-3'>Refresh the page or <a href='index.html'>start the assessment</a> again.</p></div>";
      }
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
