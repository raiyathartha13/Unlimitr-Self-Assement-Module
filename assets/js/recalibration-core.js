/**
 * Engine 4 — AI Recalibration Core
 * Micro-updates every 5s, visibility throttle, toast notification
 */
(function () {
  "use strict";

  var intervalId, toastEl, tabVisible = true;

  function showToast(msg) {
    if (!toastEl) {
      toastEl = document.createElement("div");
      toastEl.className = "ai-recal-toast";
      toastEl.setAttribute("aria-live", "polite");
      toastEl.style.cssText = "position:fixed;bottom:100px;left:50%;transform:translateX(-50%);padding:10px 20px;background:rgba(13,50,86,0.95);color:#fff;font-size:13px;border-radius:12px;opacity:0;pointer-events:none;z-index:100;transition:opacity 0.3s;box-shadow:0 8px 24px rgba(0,0,0,0.2);";
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg || "AI recalibrating metabolic response…";
    toastEl.classList.add("visible");
    if (typeof gsap !== "undefined") {
      gsap.fromTo(toastEl, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.3 });
      gsap.to(toastEl, { opacity: 0, delay: 2.5, duration: 0.4, onComplete: function () { toastEl.classList.remove("visible"); } });
    } else setTimeout(function () { toastEl.classList.remove("visible"); }, 2500);
  }

  function microAdjust(val, delta) {
    var d = (Math.random() > 0.5 ? 1 : -1) * (delta || 1);
    return Math.max(0, Math.min(100, Math.round(val) + d));
  }

  function start(data) {
    if (intervalId) clearInterval(intervalId);
    tabVisible = !document.hidden;
    document.addEventListener("visibilitychange", function () { tabVisible = !document.hidden; });

    var healthScoreNum = document.getElementById("healthScoreNum");
    var ids = ["metabolismPct", "hormonalPct", "recoveryPct", "movementPct"];
    var bars = ["metabolismBar", "hormonalBar", "recoveryBar", "movementBar"];

    function run() {
      if (!tabVisible) return;
      var base = { score: 0, metab: 0, hormonal: 0, recovery: 0, movement: 0 };
      if (healthScoreNum) base.score = parseInt(healthScoreNum.textContent, 10) || 0;
      var mEl = document.getElementById("metabolismPct"), hEl = document.getElementById("hormonalPct"), rEl = document.getElementById("recoveryPct"), movEl = document.getElementById("movementPct");
      base.metab = mEl ? parseInt(mEl.textContent, 10) || 0 : 0;
      base.hormonal = hEl ? parseInt(hEl.textContent, 10) || 0 : 0;
      base.recovery = rEl ? parseInt(rEl.textContent, 10) || 0 : 0;
      base.movement = movEl ? parseInt(movEl.textContent, 10) || 0 : 0;

      var scoreDelta = microAdjust(base.score, 1);
      var metabDelta = microAdjust(base.metab, 1);
      var hormonalDelta = microAdjust(base.hormonal, 1);
      var recoveryDelta = microAdjust(base.recovery, 1);
      var movementDelta = microAdjust(base.movement, 1);

      if (healthScoreNum) {
        var obj = { v: base.score };
        if (typeof gsap !== "undefined") gsap.to(obj, { v: scoreDelta, duration: 0.6, ease: "power2.out", onUpdate: function () { healthScoreNum.textContent = Math.round(obj.v); } });
        else healthScoreNum.textContent = scoreDelta;
      }
      ids.forEach(function (id, i) {
        var el = document.getElementById(id);
        var barEl = document.getElementById(bars[i]);
        var v = [metabDelta, hormonalDelta, recoveryDelta, movementDelta][i];
        if (el) el.textContent = v + "%";
        if (barEl) barEl.style.width = v + "%";
      });

      showToast();
    }

    intervalId = setInterval(run, 5000);
  }

  function stop() {
    if (intervalId) { clearInterval(intervalId); intervalId = null; }
  }

  if (typeof window !== "undefined") {
    window.startRecalibrationCore = window.startAILiveRecalibration = start;
    window.stopRecalibrationCore = window.stopAILiveRecalibration = stop;
    var existing = window.RecalibrationCore;
    window.RecalibrationCore = existing && typeof existing.render === "function"
      ? Object.assign({}, existing, { start: start, stop: stop })
      : { start: start, stop: stop };
  }
})();
