const APP_STORAGE_KEY = "ai_health_assessment_v1";

const PLAN_CATALOG = {
  total_wellness: {
    title: "Fitstart Total Wellness Plan",
    focus: "Full-body reset with holistic fat-loss support.",
    bullets: [
      "Metabolic reset + sustainable fat loss",
      "Balanced nutrition + stress recovery",
      "Weekly coach + AI check-ins"
    ]
  },
  sugar_shield: {
    title: "Fitstart Sugar Shield",
    focus: "Blood sugar control + insulin sensitivity.",
    bullets: [
      "Glycemic control nutrition plan",
      "Low-spike meal timing protocol",
      "Energy + cravings stabilization"
    ]
  },
  thyro_care: {
    title: "Fitstart Thyro Care",
    focus: "Thyroid-supportive nutrition + recovery.",
    bullets: [
      "Thyroid-friendly meal planning",
      "Sleep and stress modulation",
      "Gentle movement routines"
    ]
  },
  hormo_balance: {
    title: "Fitstart Hormo Balance",
    focus: "Hormone balance with cycle-aware coaching.",
    bullets: [
      "PCOS/period support protocols",
      "Inflammation-lowering diet",
      "Energy + mood stabilization"
    ]
  },
  heart_ease: {
    title: "Fitstart Heart Ease",
    focus: "Cardiac-safe fat loss + endurance.",
    bullets: [
      "Heart-safe movement plan",
      "Cholesterol + BP support",
      "Low-impact conditioning"
    ]
  },
  lipid_fit: {
    title: "Fitstart Lipid Fit",
    focus: "Cholesterol management + metabolic health.",
    bullets: [
      "Lipid-lowering nutrition",
      "Cardio + strength balance",
      "Sustainable fat-loss roadmap"
    ]
  },
  move_safe: {
    title: "Fitstart Move Safe",
    focus: "Joint-friendly fat loss + mobility.",
    bullets: [
      "Low-impact workouts",
      "Mobility + pain reduction",
      "Strength without joint stress"
    ]
  },
  nutrition: {
    title: "Fitstart Nutrition",
    focus: "Nutrition-led body recomposition.",
    bullets: [
      "Personalized macro targets",
      "Meal templates + swaps",
      "Habit-based nutrition coaching"
    ]
  },
  fitness_yoga: {
    title: "Fitstart Fitness Yoga",
    focus: "Yoga-based strength + flexibility.",
    bullets: [
      "Yoga flows + core strength",
      "Breathwork + recovery",
      "Mobility-driven fat loss"
    ]
  }
};

function saveAssessment(data) {
  localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(data));
}

function loadAssessment() {
  const raw = localStorage.getItem(APP_STORAGE_KEY);
  return raw ? JSON.parse(raw) : null;
}

function calculateBMI(heightCm, weightKg) {
  const h = parseFloat(heightCm);
  const w = parseFloat(weightKg);
  if (!h || !w) return null;
  const heightM = h / 100;
  return +(w / (heightM * heightM)).toFixed(1);
}

function calculateBMR({ weight, height, age, gender }) {
  const w = parseFloat(weight);
  const h = parseFloat(height);
  const a = parseFloat(age);
  if (!w || !h || !a) return null;
  const base = 10 * w + 6.25 * h - 5 * a;
  return gender === "male" ? Math.round(base + 5) : Math.round(base - 161);
}

function calculateMetabolicAge(bmi, age) {
  if (!bmi || !age) return null;
  const delta = Math.max(-5, Math.min(10, (bmi - 22) / 1.8));
  return Math.round(parseFloat(age) + delta);
}

function hasMedicalIssue(data) {
  const issues = (data.healthIssues || "").trim().toLowerCase();
  return issues.length > 0;
}

function selectFitstartPlan(data) {
  if (hasMedicalIssue(data)) return "medical_supervised";
  const issues = (data.healthIssues || "").toLowerCase();
  const primaryGoal = data.primaryGoal || "";

  if (issues.includes("diabetes")) return "sugar_shield";
  if (issues.includes("thyroid")) return "thyro_care";
  if (issues.includes("pcos") || issues.includes("hormone") || issues.includes("period")) return "hormo_balance";
  if (issues.includes("bp") || issues.includes("blood pressure") || issues.includes("heart")) return "heart_ease";
  if (issues.includes("cholesterol") || issues.includes("lipid")) return "lipid_fit";
  if (issues.includes("knee") || issues.includes("joint") || issues.includes("mobility") || issues.includes("injury")) return "move_safe";
  if (primaryGoal === "manage-condition") return "medical_supervised";
  if (primaryGoal === "improve-fitness") return "fitness_yoga";
  if (primaryGoal === "reduce-fat" || primaryGoal === "weight-loss") return "total_wellness";
  if (primaryGoal === "improve-energy") return "nutrition";
  return "total_wellness";
}

const PLAN_CATALOG_MEDICAL = {
  medical_supervised: {
    title: "Medical Supervised Plan",
    focus: "Supervised fat loss with medical-grade safety and monitoring.",
    bullets: [
      "Weekly roadmap with medical oversight",
      "Diet personalization for your conditions",
      "AI nudges + WhatsApp accountability",
      "Monthly coach call"
    ]
  }
};

function recommendPlan(data) {
  const bmi = calculateBMI(data.height, data.weight);
  const fitstartKey = selectFitstartPlan(data);
  const plan = PLAN_CATALOG[fitstartKey] || PLAN_CATALOG_MEDICAL[fitstartKey] || PLAN_CATALOG.total_wellness;
  const medical = hasMedicalIssue(data) || fitstartKey === "medical_supervised";
  const tag = (bmi && bmi > 30) || medical ? "medical" : "standard";
  return { plan, tag, bmi, fitstartKey, medical };
}

/**
 * FitStart & Medical Wellness pricing from Unlimitr sales docs (INR).
 * FitStart: Total Wellness, Nutrition, Yoga/Fitness – 3/6/12 months.
 * Medical: condition-specific plans – same 3/6/12 month tiers.
 */
const PLAN_PRICING = {
  total_wellness: [
    { months: 3, priceINR: 14400, priceStrike: 18000, label: "3 months" },
    { months: 6, priceINR: 27000, priceStrike: 36000, label: "6 months" },
    { months: 12, priceINR: 50400, priceStrike: 72000, label: "12 months" }
  ],
  nutrition: [
    { months: 3, priceINR: 6000, priceStrike: 7500, label: "3 months" },
    { months: 6, priceINR: 11250, priceStrike: 15000, label: "6 months" },
    { months: 12, priceINR: 21000, priceStrike: 30000, label: "12 months" }
  ],
  fitness_yoga: [
    { months: 3, priceINR: 9600, priceStrike: 12000, label: "3 months" },
    { months: 6, priceINR: 18000, priceStrike: 24000, label: "6 months" },
    { months: 12, priceINR: 33600, priceStrike: 48000, label: "12 months" }
  ],
  medical_supervised: [
    { months: 3, priceINR: 15600, priceStrike: 19500, label: "3 months" },
    { months: 6, priceINR: 29250, priceStrike: 39000, label: "6 months" },
    { months: 12, priceINR: 54600, priceStrike: 78000, label: "12 months" }
  ]
};

function getPricingKey(planResult) {
  if (planResult.medical) return "medical_supervised";
  const k = planResult.fitstartKey;
  if (k === "total_wellness" || k === "nutrition" || k === "fitness_yoga") return k;
  return "total_wellness";
}

function weeksToMonthsTier(weeks) {
  const months = weeks / 4.33;
  if (months <= 4.5) return 3;
  if (months <= 9) return 6;
  return 12;
}

function getTargetWeightLoss(data) {
  const goal = data.primaryGoal || "";
  const isWeightGoal = goal === "weight-loss" || goal === "reduce-fat";
  if (!isWeightGoal) return 0;
  const current = parseFloat(data.weight) || 70;
  const height = parseFloat(data.height);
  const targetWeight = parseFloat(data.targetWeight);
  if (targetWeight && targetWeight < current) return current - targetWeight;
  if (!height) return 10;
  const targetFromBMI = 22 * Math.pow(height / 100, 2);
  return Math.max(0, current - targetFromBMI);
}

function getWeeklyFatLoss(data) {
  if (hasMedicalIssue(data)) return 0.6;
  const age = parseFloat(data.age) || 35;
  return age < 35 ? 1 : 0.8;
}

function getWeeksRequired(data) {
  const goal = data.primaryGoal || "";
  const isWeightGoal = goal === "weight-loss" || goal === "reduce-fat";
  if (!isWeightGoal) return 12;
  const loss = getTargetWeightLoss(data);
  const weekly = getWeeklyFatLoss(data);
  if (weekly <= 0) return 12;
  const weeks = Math.ceil(loss / weekly);
  return Math.max(4, Math.min(52, weeks));
}

function buildRecommendationReason(data, planResult, variant) {
  const goal = (data.primaryGoal || "").toLowerCase();
  const commitment = (data.commitment || "").toLowerCase();
  const planTitle = planResult.plan.title;
  const months = variant.months;
  const parts = [];
  const isWeightGoal = goal === "weight-loss" || goal === "reduce-fat";
  if (isWeightGoal) {
    const loss = getTargetWeightLoss(data);
    if (loss > 0) parts.push("Based on your goal to lose " + Math.round(loss) + " kg safely, our AI recommends a " + months + "-month program—enough time to build habits and see real results.");
    else parts.push("For sustainable fat loss, a " + months + "-month program gives you the right runway to see lasting change.");
  } else if (goal === "manage-condition") parts.push(planTitle + " over " + months + " months provides medical oversight tailored to your health context.");
  else if (goal === "improve-energy") parts.push("For improved energy and vitality, " + planTitle + " over " + months + " months aligns nutrition and recovery with your goals.");
  else if (goal === "improve-fitness") parts.push("For overall fitness, " + months + " months lets you progress through structured phases and see lasting change.");
  else parts.push(planTitle + " over " + months + " months is the best fit for your profile.");
  if (commitment === "6+" || commitment === "6-7") parts.push("With your 6+ days/week commitment, you'll get maximum value from this plan.");
  else if (commitment === "4-5") parts.push("Your 4–5 days/week commitment aligns perfectly with this program's structure.");
  else if (commitment === "2-3") parts.push("We've chosen a duration that fits a 2–3 days/week schedule so you can stay consistent.");
  if (planResult.medical) parts.push("Because you shared health considerations, this plan includes condition-specific care and medical safety standards (WHO/ADA/ICMR protocols).");
  return parts.join(" ");
}

function getRecommendedVariant(data) {
  const weeksRequired = getWeeksRequired(data);
  const monthsTier = weeksToMonthsTier(weeksRequired);
  const planResult = recommendPlan(data);
  const pricingKey = getPricingKey(planResult);
  const tiers = PLAN_PRICING[pricingKey];
  const best = tiers.find(function (t) { return t.months === monthsTier; }) || tiers[tiers.length - 1];
  return {
    months: best.months,
    label: best.label,
    priceINR: best.priceINR,
    priceStrike: best.priceStrike,
    reason: buildRecommendationReason(data, planResult, best),
    planResult: planResult
  };
}

function getPrescription(data) {
  const bmi = calculateBMI(data.height, data.weight) || 25;
  const age = parseFloat(data.age) || 35;
  const goal = data.primaryGoal || "weight-loss";

  const steps = bmi > 30 ? 9000 : 8000;
  const strength = age < 40 ? 3 : 2;
  let cardio = 150;
  if (goal === "weight-loss" || goal === "reduce-fat") cardio = 180;
  else if (goal === "improve-fitness") cardio = 120;
  else if (goal === "improve-energy" || goal === "manage-condition") cardio = 150;

  return { steps, strength, cardio };
}

function updateStepper(current, total) {
  const steps = document.querySelectorAll(".stepper .step span");
  steps.forEach((bar, idx) => {
    bar.style.width = idx < current ? "100%" : "0%";
  });
  const label = document.getElementById("stepLabel");
  if (label) label.textContent = `Step ${current} of ${total}`;
}

function showStep(index) {
  document.querySelectorAll(".step-panel").forEach((panel) => {
    panel.style.display = panel.dataset.step === String(index) ? "block" : "none";
  });
}

function bindAssessmentPage() {
  const form = document.getElementById("assessmentForm");
  if (!form) return;

  let step = 1;
  const totalSteps = 4;
  updateStepper(step, totalSteps);
  showStep(step);

  const nextBtn = document.getElementById("nextStep");
  const prevBtn = document.getElementById("prevStep");
  const submitBtn = document.getElementById("submitAssessment");

  function setButtons() {
    if (prevBtn) prevBtn.disabled = step === 1;
    if (nextBtn) nextBtn.style.display = step === totalSteps ? "none" : "inline-flex";
    if (submitBtn) submitBtn.style.display = step === totalSteps ? "inline-flex" : "none";
  }
  setButtons();

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      if (step < totalSteps) {
        step += 1;
        updateStepper(step, totalSteps);
        showStep(step);
        setButtons();
      }
    });
  }
  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      if (step > 1) {
        step -= 1;
        updateStepper(step, totalSteps);
        showStep(step);
        setButtons();
      }
    });
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    if (!data.clientName || !data.clientEmail || !data.primaryGoal) {
      alert("Please fill in required fields.");
      return;
    }
    if (!data.dateOfBirth) {
      alert("Please enter your date of birth.");
      return;
    }
    saveAssessment(data);
    window.location.href = "journey-ultra.html";
  });
}

function animateCounter(el, target, suffix = "") {
  let current = 0;
  const step = Math.max(1, Math.floor(target / 60));
  const timer = setInterval(() => {
    current += step;
    if (current >= target) {
      current = target;
      clearInterval(timer);
    }
    el.textContent = `${current}${suffix}`;
  }, 20);
}

function renderJourneyPage() {
  const data = loadAssessment();
  if (!data) return;

  const planData = recommendPlan(data);
  const bmi = planData.bmi;
  const bmr = calculateBMR(data);
  const metabolicAge = calculateMetabolicAge(bmi, data.age);

  const score = Math.max(45, Math.min(95, Math.round(100 - (bmi ? (bmi - 21) * 2 : 10))));
  const gauge = document.getElementById("healthGauge");
  const gaugeText = document.getElementById("healthScore");
  if (gauge) gauge.style.background = `conic-gradient(var(--primary) ${score * 3.6}deg, rgba(255,255,255,0.12) 0deg)`;
  if (gaugeText) gaugeText.textContent = `${score}/100`;

  const planBox = document.getElementById("planResult");
  if (planBox) {
    planBox.innerHTML = `
      <h3 class="fw-bold">${planData.plan.title}</h3>
      <p class="muted">${planData.plan.focus}</p>
      <p class="muted">${planData.tag === "medical" ? "Medical-grade plan routed for safety" : "Standard AI fat-to-fit program"}</p>
    `;
  }

  const variant = getRecommendedVariant(data);
  const weeklyLoss = getWeeklyFatLoss(data);
  const variantBlock = document.getElementById("recommendedVariantBlock");
  const variantText = document.getElementById("recommendedVariantText");
  const weeklyLossEl = document.getElementById("weeklyLossText");
  if (variant && variantBlock && variantText) {
    variantText.textContent = variant.label + " • Partner price ₹" + variant.priceINR.toLocaleString("en-IN");
    variantBlock.classList.remove("d-none");
  }
  if (weeklyLossEl) weeklyLossEl.textContent = "~" + weeklyLoss + " kg/week estimated loss";

  const bmiEl = document.getElementById("bmiValue");
  const metaEl = document.getElementById("metaAge");
  if (bmiEl) bmiEl.textContent = bmi ? bmi : "--";
  if (metaEl) metaEl.textContent = metabolicAge ? metabolicAge : "--";

  const prescription = getPrescription(data);
  const counterTargets = [
    { id: "stepsTarget", value: prescription ? prescription.steps : 8500 },
    { id: "strengthTarget", value: prescription ? prescription.strength : 3 },
    { id: "cardioTarget", value: prescription ? Math.round((prescription.cardio || 150) / 7) : 120 },
    { id: "mobilityTarget", value: 2 }
  ];
  counterTargets.forEach((c) => {
    const el = document.getElementById(c.id);
    if (el) animateCounter(el, c.value);
  });

  const timeline = document.getElementById("timelineStages");
  if (timeline) {
    const stages = [
      "Week 1–2: Detox Phase • 0.8 kg fat loss",
      "Week 3–4: Metabolic Boost • Waist reduction",
      "Week 5–8: Body Recomposition"
    ];
    timeline.innerHTML = stages.map((s) => `<div class="stage">${s}</div>`).join("");
  }

  const coachText = document.getElementById("coachMessage");
  if (coachText) {
    const message = `Hello ${data.clientName}, based on your profile, your best next step is the ${planData.plan.title}.`;
    coachText.textContent = message;
  }

  renderCharts(data);
}

function renderCharts(data) {
  const calories = calculateCalories(data);
  const ctx1 = document.getElementById("calorieChart");
  const ctx2 = document.getElementById("weightChart");
  if (!ctx1 || !ctx2) return;

  new Chart(ctx1, {
    type: "line",
    data: {
      labels: ["W1","W2","W3","W4","W5","W6","W7","W8"],
      datasets: [{
        label: "Projected Calories",
        data: [calories+200, calories+150, calories+100, calories, calories-50, calories-75, calories-100, calories],
        borderWidth: 3,
        tension: 0.4
      }]
    },
    options: { responsive: true }
  });

  const weight = parseFloat(data.weight || 70);
  new Chart(ctx2, {
    type: "line",
    data: {
      labels: ["W1","W2","W3","W4","W5","W6","W7","W8"],
      datasets: [{
        label: "Projected Weight",
        data: [weight, weight-0.6, weight-1.1, weight-1.7, weight-2.3, weight-2.8, weight-3.4, weight-4.0],
        borderWidth: 3,
        tension: 0.4
      }]
    },
    options: { responsive: true }
  });
}

function calculateCalories(data) {
  const bmr = calculateBMR(data);
  const base = bmr || 2000;
  const goal = data.primaryGoal || "";
  if (goal === "weight-loss" || goal === "reduce-fat") return Math.round(base * 1.3 - 400);
  if (goal === "improve-fitness") return Math.round(base * 1.35);
  return Math.round(base * 1.3);
}

function bindOfferPage() {
  const timerEl = document.getElementById("offerTimer");
  if (!timerEl) return;

  const data = loadAssessment();
  if (data) {
    const variant = getRecommendedVariant(data);
    const plan = variant.planResult.plan;
    const titleEl = document.getElementById("offerPlanTitle");
    const focusEl = document.getElementById("offerPlanFocus");
    const bulletsEl = document.getElementById("offerPlanBullets");
    const durationEl = document.getElementById("offerDurationBadge");
    const priceEl = document.getElementById("offerPrice");
    const strikeEl = document.getElementById("offerPriceStrike");
    const reasonEl = document.getElementById("offerReason");
    if (titleEl) titleEl.textContent = plan.title;
    if (focusEl) focusEl.textContent = plan.focus;
    if (bulletsEl) bulletsEl.innerHTML = plan.bullets.map((b) => `<li>${b}</li>`).join("");
    if (durationEl) durationEl.textContent = variant.label + " • Built for your goals";
    if (priceEl) priceEl.textContent = "₹" + variant.priceINR.toLocaleString("en-IN");
    if (strikeEl) strikeEl.textContent = "₹" + variant.priceStrike.toLocaleString("en-IN");
    if (reasonEl) reasonEl.textContent = variant.reason;
  }

  let remaining = 15 * 60;
  const interval = setInterval(() => {
    const mins = String(Math.floor(remaining / 60)).padStart(2, "0");
    const secs = String(remaining % 60).padStart(2, "0");
    timerEl.textContent = `${mins}:${secs}`;
    remaining -= 1;
    if (remaining < 0) clearInterval(interval);
  }, 1000);
}

document.addEventListener("DOMContentLoaded", () => {
  const page = document.body.dataset.page;
  if (page === "assessment") bindAssessmentPage();
  if (page === "journey") renderJourneyPage();
  if (page === "offer") bindOfferPage();
});
