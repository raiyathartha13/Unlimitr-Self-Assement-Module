/**
 * Page 3 — Premium plan offer
 * Fitstart Indian pricing & duration from AI recommendation or journey report handoff; medical vs standard; 15-min countdown; Stripe CTA.
 */

(function () {
  var REPORT_HANDOFF_KEY = "journey_report_handoff";
  var handoff = null;
  try {
    var raw = localStorage.getItem(REPORT_HANDOFF_KEY);
    if (raw) handoff = JSON.parse(raw);
  } catch (e) {}
  var data = typeof loadAssessment === "function" ? loadAssessment() : null;
  var variant = data && typeof getRecommendedVariant === "function" ? getRecommendedVariant(data) : null;
  if (handoff && variant) {
    variant.reason = (variant.reason || "") + " Based on your medical report: " + (handoff.durationMonths || variant.months) + "-month transformation estimate, weight gap " + (handoff.weightGap || "") + " kg.";
  }
  var planResult = variant ? variant.planResult : (data && typeof recommendPlan === "function" ? recommendPlan(data) : null);
  var plan = planResult ? planResult.plan : { title: "Fitstart Total Wellness Plan", focus: "Full-body reset with holistic fat-loss support.", bullets: [] };
  var isMedical = planResult && planResult.medical;

  var medicalBlock = document.getElementById("medicalPlanBlock");
  var standardBlock = document.getElementById("standardPlanBlock");
  var offerPlanTitle = document.getElementById("offerPlanTitle");
  var offerPlanFocus = document.getElementById("offerPlanFocus");
  var offerPlanBullets = document.getElementById("offerPlanBullets");
  var offerPlanTitleStd = document.getElementById("offerPlanTitleStd");
  var offerPlanFocusStd = document.getElementById("offerPlanFocusStd");
  var offerPlanBulletsStd = document.getElementById("offerPlanBulletsStd");

  if (isMedical && medicalBlock) {
    medicalBlock.classList.remove("d-none");
    if (standardBlock) standardBlock.classList.add("d-none");
    if (offerPlanTitle) offerPlanTitle.textContent = plan.title;
    if (offerPlanFocus) offerPlanFocus.textContent = plan.focus;
    if (offerPlanBullets) offerPlanBullets.innerHTML = plan.bullets.map(function (b) { return "<li>" + b + "</li>"; }).join("");
  } else {
    if (medicalBlock) medicalBlock.classList.add("d-none");
    if (standardBlock) standardBlock.classList.remove("d-none");
    if (offerPlanTitleStd) offerPlanTitleStd.textContent = plan.title;
    if (offerPlanFocusStd) offerPlanFocusStd.textContent = plan.focus;
    if (offerPlanBulletsStd) offerPlanBulletsStd.innerHTML = plan.bullets.map(function (b) { return "<li>" + b + "</li>"; }).join("");
  }

  if (variant) {
    var durationEl = document.getElementById("offerDurationBadge");
    var priceEl = document.getElementById("offerPrice");
    var strikeEl = document.getElementById("offerPriceStrike");
    var reasonEl = document.getElementById("offerReason");
    if (durationEl) durationEl.textContent = variant.label + " • Built for your goals";
    if (priceEl) priceEl.textContent = "₹" + variant.priceINR.toLocaleString("en-IN");
    if (strikeEl) strikeEl.textContent = "₹" + variant.priceStrike.toLocaleString("en-IN");
    if (reasonEl) reasonEl.textContent = variant.reason || reasonEl.textContent;
  }

  var timerEl = document.getElementById("offerTimer");
  if (timerEl) {
    var remaining = 15 * 60;
    function tick() {
      var mins = String(Math.floor(remaining / 60)).padStart(2, "0");
      var secs = String(remaining % 60).padStart(2, "0");
      timerEl.textContent = mins + ":" + secs;
      remaining -= 1;
      if (remaining >= 0) setTimeout(tick, 1000);
    }
    tick();
  }

  var stripeCta = document.getElementById("stripeCta");
  if (stripeCta) stripeCta.href = "#"; // Replace with your Stripe Checkout URL
})();
