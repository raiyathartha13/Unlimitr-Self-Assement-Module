/**
 * Gamification Engine — Health Level, XP progression, level-up animation
 * Engine 6: Gamified Progress & Level System
 */
(function () {
  "use strict";

  var xp = 0;
  var maxXp = 100;

  function scoreToLevel(score) {
    if (score >= 90) return 10;
    if (score >= 80) return 9;
    if (score >= 70) return 8;
    if (score >= 60) return 7;
    if (score >= 50) return 6;
    if (score >= 40) return 5;
    if (score >= 30) return 4;
    if (score >= 20) return 3;
    return Math.max(1, Math.floor(score / 10));
  }

  function addXp(amount, source) {
    xp = Math.min(maxXp, xp + (amount || 10));
    updateXpBar();
    try {
      var stored = JSON.parse(localStorage.getItem("abis_xp") || "{}");
      stored.xp = xp;
      stored.source = source;
      localStorage.setItem("abis_xp", JSON.stringify(stored));
    } catch (e) {}
  }

  function updateXpBar() {
    var bar = document.getElementById("healthXpBarFill");
    if (bar) bar.style.width = (xp / maxXp * 100) + "%";
  }

  function levelUpAnimation(level) {
    var ring = document.querySelector(".health-score-gauge__fill, .gauge-circle");
    var wrap = document.getElementById("healthGaugeWrap");
    if (typeof gsap === "undefined" || !wrap) return;
    var burst = document.createElement("div");
    burst.className = "level-up-burst";
    burst.setAttribute("aria-hidden", "true");
    burst.style.cssText = "position:absolute;inset:-20px;border-radius:50%;pointer-events:none;";
    wrap.style.position = "relative";
    wrap.appendChild(burst);
    gsap.fromTo(burst, { scale: 0.8, opacity: 0.8, border: "2px solid var(--spanish-green)" }, { scale: 1.4, opacity: 0, duration: 0.8, ease: "power2.out", onComplete: function () { burst.remove(); } });
  }

  function init(data, finalScore) {
    var score = finalScore != null ? finalScore : 0;
    if (score === 0 && data && data.weight && data.height) {
      var h = parseFloat(data.height) / 100;
      var bmi = parseFloat(data.weight) / (h * h);
      score = bmi <= 22.9 ? 85 : bmi <= 25 ? 70 : bmi <= 30 ? 50 : 35;
    }
    var level = scoreToLevel(score);
    var levelEl = document.getElementById("healthLevelNum");
    var levelLabel = document.getElementById("healthLevelLabel");
    var xpWrap = document.getElementById("healthXpWrap");
    var projectedScore = document.getElementById("projectedScoreWithPlan");
    var ultimateScore = document.getElementById("ultimateScoreTarget");

    try {
      var stored = JSON.parse(localStorage.getItem("abis_xp") || "{}");
      xp = stored.xp || 30;
    } catch (e) {
      xp = 30;
    }

    if (levelEl) levelEl.textContent = level;
    if (levelLabel) levelLabel.textContent = "Health Level " + level;
    var currentDisp = document.getElementById("currentScoreDisp");
    if (currentDisp) currentDisp.textContent = score;
    if (projectedScore) projectedScore.textContent = "85+";
    if (ultimateScore) ultimateScore.textContent = "100/100";
    if (xpWrap) xpWrap.style.display = "block";
    updateXpBar();

    document.addEventListener("click", function (e) {
      if (e.target.closest("#coachVoiceBtn")) addXp(15, "ai_explanation");
      if (e.target.closest("#ctaUnlockPlan, #cta90Day, #ctaMetabolism, #goToOffer")) addXp(25, "unlock_plan");
    });
    addXp(30, "assessment_complete");
  }


  if (typeof window !== "undefined") {
    window.initGamificationEngine = init;
    window.addHealthXp = addXp;
    window.scoreToLevel = scoreToLevel;
    window.GamificationEngine = { init: init, addXp: addXp, scoreToLevel: scoreToLevel };
  }
})();
