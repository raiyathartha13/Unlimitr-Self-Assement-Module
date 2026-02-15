/**
 * Metabolic Simulation — Organic curves, dual trajectory, live data pulse
 * Non-linear weight projection, percentage micro-pulse every 4s.
 */
(function () {
  "use strict";

  var pulseInterval = null;

  function organicCurve(startWeight, weeklyLoss, weeksRequired, idealW, stressScore) {
    var values = [startWeight];
    var labels = ["W1"];
    var curr = startWeight;
    var loss = weeklyLoss;
    var stressLevel = (100 - (stressScore || 50)) / 50;
    var stressPenalty = stressLevel * 0.01;
    for (var i = 1; i <= weeksRequired; i++) {
      var metabolicAdaptation = 1 - 0.05 * Math.floor((i - 1) / 4);
      var weeklyDrop = loss * Math.max(0.5, metabolicAdaptation);
      var hormoneNoise = Math.sin(i * 1.4) * 0.3;
      curr = curr - weeklyDrop + hormoneNoise + stressPenalty;
      curr = Math.max(idealW * 0.9, curr);
      values.push(Math.round(curr * 10) / 10);
      labels.push("W" + (i + 1));
    }
    return { values: values, labels: labels };
  }

  function organicWithoutIntervention(startWeight, weeksRequired, stressScore) {
    var values = [startWeight];
    var stressLevel = (100 - (stressScore || 50)) / 100;
    for (var i = 1; i <= weeksRequired; i++) {
      var plateau = 0.08 * i + Math.sin(i * 0.8) * 0.15;
      values.push(Math.round((startWeight + plateau + stressLevel * 0.05 * i) * 10) / 10);
    }
    return values;
  }

  function startDataPulse(values) {
    if (pulseInterval) clearInterval(pulseInterval);
    if (!values || typeof gsap === "undefined") return;

    var ids = ["metabolismPct", "hormonalPct", "recoveryPct", "movementPct"];
    var bars = ["metabolismBar", "hormonalBar", "recoveryBar", "movementBar"];
    var base = [values.metab || 0, values.hormonal || 0, values.recovery || 0, values.movement || 0];

    function pulseOne(i) {
      var el = document.getElementById(ids[i]);
      var barEl = document.getElementById(bars[i]);
      if (!el || !barEl) return;
      var b = Math.max(0, Math.min(100, base[i]));
      var delta = Math.random() > 0.5 ? 1 : -1;
      var next = Math.max(0, Math.min(100, b + delta));
      var obj = { v: b };
      gsap.to(obj, {
        v: next,
        duration: 0.25,
        yoyo: true,
        repeat: 1,
        ease: "sine.inOut",
        onUpdate: function () {
          var v = Math.round(obj.v);
          el.textContent = v + "%";
          barEl.style.width = v + "%";
        }
      });
    }

    pulseInterval = setInterval(function () {
      var idx = Math.floor(Math.random() * 4);
      pulseOne(idx);
    }, 4000);
  }

  function stopDataPulse() {
    if (pulseInterval) {
      clearInterval(pulseInterval);
      pulseInterval = null;
    }
  }

  function init() { /* Data pulse started by journey-report with computed values */ }

  if (typeof window !== "undefined") {
    window.organicWeightCurve = organicCurve;
    window.organicWithoutIntervention = organicWithoutIntervention;
    window.startDataPulse = startDataPulse;
    window.stopDataPulse = stopDataPulse;
    window.MetabolicSimulation = { init: init, organicCurve: organicCurve, organicWithoutIntervention: organicWithoutIntervention, startDataPulse: startDataPulse, stopDataPulse: stopDataPulse };
  }
})();
