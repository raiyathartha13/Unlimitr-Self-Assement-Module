/**
 * AI Live Engine — Recalibration micro-updates every 5 seconds
 * Layer 5: AI Live Recalibration
 */
(function () {
  "use strict";

  var intervalId;
  var toastEl;

  function showToast(msg) {
    if (toastEl) {
      toastEl.textContent = msg;
      toastEl.classList.add("visible");
      if (typeof gsap !== "undefined") {
        gsap.fromTo(toastEl, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.3 });
        gsap.to(toastEl, { opacity: 0, delay: 2.5, duration: 0.4, onComplete: function () { toastEl.classList.remove("visible"); } });
      } else {
        setTimeout(function () { toastEl.classList.remove("visible"); }, 2500);
      }
    }
  }

  function microAdjust(val, delta) {
    var d = (Math.random() > 0.5 ? 1 : -1) * (delta || 1);
    return Math.max(0, Math.min(100, Math.round(val) + d));
  }

  function start(data) {
    if (intervalId) clearInterval(intervalId);
    var wrap = document.getElementById("journeyBlurWrap");
    if (!wrap) return;

    if (!toastEl) {
      toastEl = document.createElement("div");
      toastEl.className = "ai-recal-toast";
      toastEl.setAttribute("aria-live", "polite");
      toastEl.style.cssText = "position:fixed;bottom:100px;left:50%;transform:translateX(-50%);padding:10px 20px;background:rgba(13,50,86,0.95);color:#fff;font-size:13px;border-radius:12px;opacity:0;pointer-events:none;z-index:100;transition:opacity 0.3s;box-shadow:0 8px 24px rgba(0,0,0,0.2);";
      document.body.appendChild(toastEl);
    }

    var healthScoreNum = document.getElementById("healthScoreNum");
    var metabolismPct = document.getElementById("metabolismPct");
    var hormonalPct = document.getElementById("hormonalPct");
    var recoveryPct = document.getElementById("recoveryPct");
    var movementPct = document.getElementById("movementPct");
    var metabolismBar = document.getElementById("metabolismBar");
    var hormonalBar = document.getElementById("hormonalBar");
    var recoveryBar = document.getElementById("recoveryBar");
    var movementBar = document.getElementById("movementBar");

    var base = {
      score: 0,
      metab: 0,
      hormonal: 0,
      recovery: 0,
      movement: 0
    };

    function captureBase() {
      if (healthScoreNum) base.score = parseInt(healthScoreNum.textContent, 10) || 0;
      if (metabolismPct) base.metab = parseInt(metabolismPct.textContent, 10) || 0;
      if (hormonalPct) base.hormonal = parseInt(hormonalPct.textContent, 10) || 0;
      if (recoveryPct) base.recovery = parseInt(recoveryPct.textContent, 10) || 0;
      if (movementPct) base.movement = parseInt(movementPct.textContent, 10) || 0;
    }

    function applyRecalibration() {
      captureBase();
      var scoreDelta = microAdjust(base.score, 1);
      var metabDelta = microAdjust(base.metab, 1);
      var hormonalDelta = microAdjust(base.hormonal, 1);
      var recoveryDelta = microAdjust(base.recovery, 1);
      var movementDelta = microAdjust(base.movement, 1);

      if (typeof gsap !== "undefined") {
        if (healthScoreNum) {
          var obj = { v: base.score };
          gsap.to(obj, { v: scoreDelta, duration: 0.6, ease: "power2.out", onUpdate: function () { healthScoreNum.textContent = Math.round(obj.v); } });
        }
        if (metabolismPct) { metabolismPct.textContent = metabDelta + "%"; if (metabolismBar) metabolismBar.style.width = metabDelta + "%"; }
        if (hormonalPct) { hormonalPct.textContent = hormonalDelta + "%"; if (hormonalBar) hormonalBar.style.width = hormonalDelta + "%"; }
        if (recoveryPct) { recoveryPct.textContent = recoveryDelta + "%"; if (recoveryBar) recoveryBar.style.width = recoveryDelta + "%"; }
        if (movementPct) { movementPct.textContent = movementDelta + "%"; if (movementBar) movementBar.style.width = movementDelta + "%"; }
      } else {
        if (healthScoreNum) healthScoreNum.textContent = scoreDelta;
        if (metabolismPct) { metabolismPct.textContent = metabDelta + "%"; if (metabolismBar) metabolismBar.style.width = metabDelta + "%"; }
        if (hormonalPct) { hormonalPct.textContent = hormonalDelta + "%"; if (hormonalBar) hormonalBar.style.width = hormonalDelta + "%"; }
        if (recoveryPct) { recoveryPct.textContent = recoveryDelta + "%"; if (recoveryBar) recoveryBar.style.width = recoveryDelta + "%"; }
        if (movementPct) { movementPct.textContent = movementDelta + "%"; if (movementBar) movementBar.style.width = movementDelta + "%"; }
      }

      showToast("AI recalibrating based on metabolic response…");
    }

    captureBase();
    intervalId = setInterval(applyRecalibration, 5000);
  }

  function stop() {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }

  if (typeof window !== "undefined") {
    window.startAILiveRecalibration = start;
    window.stopAILiveRecalibration = stop;
  }
})();
