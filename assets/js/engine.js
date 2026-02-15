/**
 * AI Health Intelligence — Core engine
 * Single source for BMR, weekly loss, health score, prescription, plan routing.
 */

const APP_STORAGE_KEY = "ai_health_assessment_v2";

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
  },
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

/**
 * FitStart & Medical Wellness pricing from Unlimitr sales docs (INR).
 * FitStart: Total Wellness, Nutrition, Yoga/Fitness – 3/6/12 months, Final Price (after sales discount).
 * Medical: SugarShield, HormoBalance, ThyroCare, HeartEase, LipidFit, MoveSafe – same 3/6/12 month tiers.
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

/** Map fitstartKey to pricing key; medical plans use medical_supervised tier */
function getPricingKey(planResult) {
  if (planResult.medical) return "medical_supervised";
  const k = planResult.fitstartKey;
  if (k === "total_wellness" || k === "nutrition" || k === "fitness_yoga") return k;
  return "total_wellness";
}

/** Convert weeks to nearest duration tier: 3, 6, or 12 months */
function weeksToMonthsTier(weeks) {
  const months = weeks / 4.33;
  if (months <= 4.5) return 3;
  if (months <= 9) return 6;
  return 12;
}

function saveAssessment(data) {
  const json = JSON.stringify(data);
  try {
    localStorage.setItem(APP_STORAGE_KEY, json);
    sessionStorage.setItem(APP_STORAGE_KEY, json);
  } catch (e) {
    try { localStorage.setItem(APP_STORAGE_KEY, json); } catch (e2) {}
  }
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

/** Mifflin-St Jeor BMR */
function calculateBMR(data) {
  const w = parseFloat(data.weight);
  const h = parseFloat(data.height);
  const a = parseFloat(data.age);
  if (!w || !h || !a) return null;
  const base = 10 * w + 6.25 * h - 5 * a;
  return data.gender === "male" ? Math.round(base + 5) : Math.round(base - 161);
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

/** Weekly fat loss in kg: no medical <35 → 1, else 0.8; medical → 0.6 */
function getWeeklyFatLoss(data) {
  const medical = hasMedicalIssue(data);
  if (medical) return 0.6;
  const age = parseFloat(data.age) || 30;
  return age < 35 ? 1 : 0.8;
}

/** Target weight loss in kg. Uses targetWeight or weightToLose or derives from BMI 22. */
function getTargetWeightLoss(data) {
  const current = parseFloat(data.weight);
  const height = parseFloat(data.height);
  const goal = data.primaryGoal || "";
  const isWeightGoal = goal === "weight-loss" || goal === "reduce-fat";

  if (!isWeightGoal) return 0;

  const targetWeight = parseFloat(data.targetWeight);
  if (targetWeight && targetWeight < current) return current - targetWeight;

  const weightToLose = parseFloat(data.weightToLose);
  if (weightToLose && weightToLose > 0) return weightToLose;

  if (!height) return 10;
  const targetFromBMI = 22 * Math.pow(height / 100, 2);
  return Math.max(0, current - targetFromBMI);
}

/** Weeks required for weight loss (capped 4–52). For non-weight-loss goal returns 12. */
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

/** Pick duration tier (3/6/12 months) and price from user requirements – FitStart & Medical doc pricing */
function getRecommendedVariant(data) {
  const weeksRequired = getWeeksRequired(data);
  const monthsTier = weeksToMonthsTier(weeksRequired);
  const planResult = recommendPlan(data);
  const pricingKey = getPricingKey(planResult);
  const tiers = PLAN_PRICING[pricingKey];
  const best = tiers.find(function (t) { return t.months === monthsTier; }) || tiers[tiers.length - 1];
  const reason = buildRecommendationReason(data, planResult, best);
  return {
    months: best.months,
    label: best.label,
    priceINR: best.priceINR,
    priceStrike: best.priceStrike,
    reason: reason,
    planResult: planResult
  };
}

/** AI-style copy: why this plan, duration, and cost match the user (FitStart / Medical doc logic) */
function buildRecommendationReason(data, planResult, variant) {
  const goal = (data.primaryGoal || "").toLowerCase();
  const commitment = (data.commitment || "").toLowerCase();
  const planTitle = planResult.plan.title;
  const months = variant.months;
  const parts = [];

  const isWeightGoal = goal === "weight-loss" || goal === "reduce-fat";
  if (isWeightGoal) {
    const loss = getTargetWeightLoss(data);
    if (loss > 0) {
      parts.push("Based on your goal to lose " + Math.round(loss) + " kg safely, our AI recommends a " + months + "-month program—enough time to build habits and see real results.");
    } else {
      parts.push("For sustainable fat loss, a " + months + "-month program gives you the right runway to see lasting change.");
    }
  } else if (goal === "manage-condition") {
    parts.push(planTitle + " over " + months + " months provides medical oversight tailored to your health context.");
  } else if (goal === "improve-energy") {
    parts.push("For improved energy and vitality, " + planTitle + " over " + months + " months aligns nutrition and recovery with your goals.");
  } else if (goal === "improve-fitness") {
    parts.push("For overall fitness, " + months + " months lets you progress through structured phases and see lasting change.");
  } else if (goal === "muscle-gain") {
    parts.push("For muscle gain, " + months + " months lets you progress through strength phases and see visible gains.");
  } else if (goal === "recomposition") {
    parts.push("Body recomposition works best with consistency—" + planTitle + " over " + months + " months is tailored to your lifestyle.");
  } else {
    parts.push(planTitle + " over " + months + " months is the best fit for your profile.");
  }

  if (commitment === "6+" || commitment === "6-7") {
    parts.push("With your 6+ days/week commitment, you'll get maximum value from this plan.");
  } else if (commitment === "4-5") {
    parts.push("Your 4–5 days/week commitment aligns perfectly with this program's structure.");
  } else if (commitment === "2-3") {
    parts.push("We've chosen a duration that fits a 2–3 days/week schedule so you can stay consistent.");
  }

  if (planResult.medical) {
    parts.push("Because you shared health considerations, this plan includes condition-specific care and medical safety standards (WHO/ADA/ICMR protocols).");
  }

  return parts.join(" ");
}

/** Daily calorie target: weight loss BMR*1.3-400, muscle BMR*1.5+300, recomposition BMR*1.35 */
function getCalories(data) {
  const bmr = calculateBMR(data);
  if (!bmr) return 2000;
  const goal = data.primaryGoal || "";
  if (goal === "weight-loss" || goal === "reduce-fat") return Math.round(bmr * 1.3 - 400);
  if (goal === "muscle-gain" || goal === "improve-fitness") return Math.round(bmr * 1.5 + 300);
  return Math.round(bmr * 1.35);
}

/** Health score 0–100 from BMI, sleep, stress, activity, medical */
function getHealthScore(data) {
  const bmi = calculateBMI(data.height, data.weight);
  let score = 70;

  if (bmi != null) {
    if (bmi <= 22) score += 12;
    else if (bmi <= 25) score += 5;
    else if (bmi <= 30) score -= 5;
    else score -= 15;
  }

  const sleep = (data.sleepQuality || "").toLowerCase();
  if (sleep === "good" || sleep === "restorative") score += 8;
  else if (sleep === "inconsistent") score += 2;
  else if (sleep === "poor") score -= 10;

  const stress = (data.stressLevel || "").toLowerCase();
  if (stress === "low") score += 5;
  else if (stress === "moderate") score -= 2;
  else if (stress === "high" || stress === "very-high") score -= 10;

  const activity = (data.activityLevel || "").toLowerCase();
  if (activity === "high") score += 8;
  else if (activity === "moderate") score += 3;
  else if (activity === "light") score += 1;
  else if (activity === "sedentary" || activity === "low") score -= 5;

  if (hasMedicalIssue(data)) score -= 5;

  return Math.max(25, Math.min(98, Math.round(score)));
}

/** Exercise prescription: steps, strength sessions/week, cardio min/week */
function getPrescription(data) {
  const bmi = calculateBMI(data.height, data.weight) || 25;
  const age = parseFloat(data.age) || 35;
  const goal = data.primaryGoal || "weight-loss";

  const steps = bmi > 30 ? 9000 : 8000;
  const strength = age < 40 ? 3 : 2;
  let cardio = 150;
  if (goal === "weight-loss" || goal === "reduce-fat") cardio = 180;
  else if (goal === "muscle-gain" || goal === "improve-fitness") cardio = 120;
  else if (goal === "recomposition" || goal === "improve-energy" || goal === "manage-condition") cardio = 150;

  return { steps, strength, cardio };
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
  if (primaryGoal === "muscle-gain") return "fitness_yoga";
  if (primaryGoal === "recomposition") return "nutrition";
  return "total_wellness";
}

function recommendPlan(data) {
  const bmi = calculateBMI(data.height, data.weight);
  const fitstartKey = selectFitstartPlan(data);
  const plan = PLAN_CATALOG[fitstartKey] || PLAN_CATALOG.total_wellness;
  const medical = hasMedicalIssue(data);
  const tag = (bmi && bmi > 30) || medical ? "medical" : "standard";
  return { plan, tag, bmi, fitstartKey, medical };
}

/** Weight at week n: current - (weekly_loss * n) */
function getWeightProjection(data) {
  const current = parseFloat(data.weight) || 70;
  const weekly = getWeeklyFatLoss(data);
  const weeks = getWeeksRequired(data);
  const points = [];
  for (let n = 0; n <= weeks; n++) {
    points.push(+(current - weekly * n).toFixed(1));
  }
  return { labels: Array.from({ length: weeks + 1 }, (_, i) => "W" + (i + 1)), values: points };
}

/** Calorie projection (constant or slight taper) for same weeks */
function getCalorieProjection(data) {
  const cal = getCalories(data);
  const weeks = getWeeksRequired(data);
  const values = [];
  for (let n = 0; n <= weeks; n++) {
    values.push(n === 0 ? cal + 100 : cal);
  }
  return {
    labels: Array.from({ length: weeks + 1 }, (_, i) => "W" + (i + 1)),
    values
  };
}

/** Full engine result for journey/offer pages */
function runEngine(data) {
  const bmr = calculateBMR(data);
  const bmi = calculateBMI(data.height, data.weight);
  const metabolicAge = calculateMetabolicAge(bmi, data.age);
  const weeklyLoss = getWeeklyFatLoss(data);
  const weeksRequired = getWeeksRequired(data);
  const calories = getCalories(data);
  const healthScore = getHealthScore(data);
  const prescription = getPrescription(data);
  const planResult = recommendPlan(data);
  const recommendedVariant = getRecommendedVariant(data);
  const weightProj = getWeightProjection(data);
  const calorieProj = getCalorieProjection(data);

  return {
    bmr,
    bmi,
    metabolicAge,
    weeklyLoss,
    weeksRequired,
    calories,
    healthScore,
    prescription,
    planResult,
    recommendedVariant,
    weightProj,
    calorieProj,
    hasMedical: hasMedicalIssue(data)
  };
}

if (typeof window !== "undefined") {
  window.loadAssessment = loadAssessment;
  window.runEngine = runEngine;
  window.saveAssessment = saveAssessment;
}
