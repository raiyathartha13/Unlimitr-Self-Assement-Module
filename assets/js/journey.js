/**
 * Page 2 — AI Journey Dashboard
 * Loads assessment, runs engine, inits body-morph, gauge, prescription counters, charts, coach voice.
 */

(function () {
  var data = typeof loadAssessment === "function" ? loadAssessment() : null;
  if (!data) {
    window.location.href = "index.html";
    return;
  }

  var engine = typeof runEngine === "function" ? runEngine(data) : null;
  if (!engine) return;

  var planResult = engine.planResult;
  var prescription = engine.prescription;
  var healthScore = engine.healthScore;
  var weightProj = engine.weightProj;
  var calorieProj = engine.calorieProj;

  // ——— Health score gauge ———
  var gaugeWrap = document.getElementById("healthGaugeWrap");
  var gaugeScoreEl = document.getElementById("healthScore");
  var healthScoreNumEl = document.getElementById("healthScoreNum");
  if (gaugeScoreEl) gaugeScoreEl.textContent = healthScore + "/100";
  if (healthScoreNumEl) healthScoreNumEl.textContent = healthScore;
  if (gaugeWrap) {
    var circle = gaugeWrap.querySelector(".gauge-circle");
    var needle = gaugeWrap.querySelector(".gauge-needle");
    if (circle) {
      var pct = healthScore / 100;
      circle.style.strokeDasharray = pct * 283 + " 283";
      if (needle) needle.style.transform = "rotate(" + (pct * 270 - 135) + "deg)";
    }
  }

  // ——— Health score info (why this score, issues if not following) ———
  var summaryEl = document.getElementById("healthScoreSummary");
  var whyEl = document.getElementById("healthScoreWhy");
  var issuesEl = document.getElementById("healthScoreIssues");
  if (summaryEl || whyEl || issuesEl) {
    var bmi = engine.bmi;
    var sleep = (data.sleepQuality || "").toLowerCase();
    var stress = (data.stressLevel || "").toLowerCase();
    var activity = (data.activityLevel || "").toLowerCase();
    var medical = engine.hasMedical;
    var factors = [];
    if (bmi != null) {
      if (bmi > 30) factors.push("body composition");
      else if (bmi > 25) factors.push("body composition");
      else if (bmi <= 22) factors.push("healthy composition");
    }
    if (sleep === "poor") factors.push("recovery (sleep)");
    else if (sleep === "good" || sleep === "restorative") factors.push("strong recovery");
    if (stress === "high" || stress === "very-high") factors.push("stress load");
    else if (stress === "low") factors.push("managed stress");
    if (activity === "low" || activity === "sedentary") factors.push("activity level");
    else if (activity === "high") factors.push("activity level");
    if (medical) factors.push("health context");
    var factorText = factors.length
      ? "This score is derived from " + factors.slice(0, 4).join(", ") + "\u2014the same levers we will use to build your results." : "This score is derived from your body composition, recovery quality, stress load, and activity\u2014the same levers we will use to build your results.";
    var summaryText = healthScore >= 60
      ? "Your Health Score is your baseline of readiness. It reflects your current foundation so we can design a plan that elevates your results with clarity and intention."
      : "Your Health Score is your baseline of readiness. It reflects where you are today so we can build a plan that moves the needle—with clarity and intention.";
    if (summaryEl) summaryEl.textContent = summaryText;
    var opportunityText = "Without committed action, this number holds. With your plan, every week can move the needle. The decision to start is the one that matters most.";
    if (whyEl) whyEl.textContent = factorText;
    if (issuesEl) issuesEl.textContent = opportunityText;
  }

  // ——— Plan result ———
  var planResultEl = document.getElementById("planResult");
  if (planResultEl) {
    planResultEl.innerHTML =
      "<h3 class=\"fw-bold\" style=\"color: var(--primary-indigo);\">" + planResult.plan.title + "</h3>" +
      "<p class=\"muted\">" + planResult.plan.focus + "</p>" +
      "<p class=\"muted\">" + (planResult.medical ? "Medical-grade plan routed for safety." : "Standard AI fat-to-fit program.") + "</p>";
  }

  // ——— Recommended duration & price + weekly loss (Fitstart Indian pricing) ———
  var recommendedVariant = engine.recommendedVariant;
  var variantBlock = document.getElementById("recommendedVariantBlock");
  var variantText = document.getElementById("recommendedVariantText");
  var weeklyLossEl = document.getElementById("weeklyLossText");
  if (recommendedVariant && variantBlock && variantText) {
    variantText.textContent = recommendedVariant.label + " • Partner price ₹" + recommendedVariant.priceINR.toLocaleString("en-IN");
    variantBlock.style.display = "block";
  }
  if (weeklyLossEl && engine.weeklyLoss != null) {
    weeklyLossEl.textContent = "~" + engine.weeklyLoss + " kg/week estimated loss";
  }

  var bmiEl = document.getElementById("bmiValue");
  var metaEl = document.getElementById("metaAge");
  if (bmiEl) bmiEl.textContent = engine.bmi != null ? engine.bmi : "--";
  if (metaEl) metaEl.textContent = engine.metabolicAge != null ? engine.metabolicAge : "--";

  // ——— Prescription cards: daily targets + animation ———
  var cardioDaily = Math.round(prescription.cardio / 7);
  function animateCounter(el, target, suffix) {
    if (!el || typeof gsap === "undefined") return;
    var obj = { val: 0 };
    gsap.to(obj, { val: target, duration: 1.2, ease: "power2.out", onUpdate: function () {
      el.textContent = Math.round(obj.val) + (suffix || "");
    }});
  }
  var stepsEl = document.getElementById("stepsTarget");
  var strengthEl = document.getElementById("strengthTarget");
  var cardioEl = document.getElementById("cardioTarget");
  if (stepsEl) animateCounter(stepsEl, prescription.steps, "");
  if (strengthEl) animateCounter(strengthEl, prescription.strength, "");
  if (cardioEl) animateCounter(cardioEl, cardioDaily, "");

  if (typeof gsap !== "undefined") {
    var cards = document.querySelectorAll(".prescription-card");
    if (cards.length) {
      gsap.set(cards, { opacity: 0, y: 24 });
      gsap.to(cards, { opacity: 1, y: 0, duration: 0.5, stagger: 0.12, ease: "power2.out", delay: 0.2 });
    }
  }

  // ——— 3D body morph ———
  var bodyContainer = document.getElementById("bodyMorphContainer");
  var morphSlider = document.getElementById("morphSlider");
  var bodyMorphApi = null;
  function initBodyMorph() {
    if (!bodyContainer || typeof BodyMorph === "undefined") return;
    var gender = (data.gender || "male").toLowerCase();
    bodyMorphApi = BodyMorph.init(bodyContainer, gender);
    if (morphSlider && bodyMorphApi) {
      morphSlider.addEventListener("input", function () {
        bodyMorphApi.setMorphIntensity(parseInt(this.value, 10) / 100);
      });
    }
  }
  if (window.THREE && bodyContainer) {
    if (window.THREE.GLTFLoader) initBodyMorph();
    else setTimeout(initBodyMorph, 100);
  }
  window.addEventListener("resize", function () {
    if (bodyMorphApi && bodyMorphApi.resize) bodyMorphApi.resize();
  });

  // ——— Weight projection chart ———
  var weightCtx = document.getElementById("weightChart");
  if (weightCtx && typeof Chart !== "undefined" && weightProj) {
    var grad = weightCtx.getContext("2d").createLinearGradient(0, 0, 0, 150);
    grad.addColorStop(0, "rgba(35, 210, 255, 0.4)");
    grad.addColorStop(1, "rgba(35, 210, 255, 0)");
    new Chart(weightCtx, {
      type: "line",
      data: {
        labels: weightProj.labels,
        datasets: [{
          label: "Projected weight (kg)",
          data: weightProj.values,
          borderColor: "#23D2FF",
          backgroundColor: grad,
          fill: true,
          tension: 0.4,
          borderWidth: 3
        }]
      },
      options: {
        responsive: true,
        animation: { duration: 1200 },
        scales: {
          y: {
            beginAtZero: false,
            grid: { display: false },
            border: { display: false },
            ticks: { color: "rgba(13, 50, 86, 0.5)" }
          },
          x: {
            grid: { display: false },
            border: { display: false },
            ticks: { color: "rgba(13, 50, 86, 0.5)" }
          }
        },
        plugins: { legend: { labels: { usePointStyle: true, color: "rgba(13, 50, 86, 0.8)" } } }
      }
    });
  }

  // ——— Calorie projection chart ———
  var calorieCtx = document.getElementById("calorieChart");
  if (calorieCtx && typeof Chart !== "undefined" && calorieProj) {
    new Chart(calorieCtx, {
      type: "line",
      data: {
        labels: calorieProj.labels,
        datasets: [{
          label: "Projected calories",
          data: calorieProj.values,
          borderColor: "#008944",
          backgroundColor: "rgba(0, 137, 68, 0.15)",
          fill: true,
          tension: 0.4,
          borderWidth: 3
        }]
      },
      options: {
        responsive: true,
        animation: { duration: 1200 },
        scales: {
          y: {
            beginAtZero: false,
            grid: { display: false },
            border: { display: false },
            ticks: { color: "rgba(13, 50, 86, 0.5)" }
          },
          x: {
            grid: { display: false },
            border: { display: false },
            ticks: { color: "rgba(13, 50, 86, 0.5)" }
          }
        },
        plugins: { legend: { labels: { usePointStyle: true, color: "rgba(13, 50, 86, 0.8)" } } }
      }
    });
  }

  // ——— Coach message + voice ———
  var coachMessageEl = document.getElementById("coachMessage");
  var coachText = "Hello " + (data.clientName || "there") + ", based on your profile, your best next step is " + (planResult.plan.title) + ".";
  if (coachMessageEl) coachMessageEl.textContent = coachText;
  if (typeof speakAsCoach === "function") {
    var playBtn = document.getElementById("coachVoiceBtn");
    if (playBtn) playBtn.addEventListener("click", function () { speakAsCoach(coachText, data.coachName || "your coach"); });
  }
})();
