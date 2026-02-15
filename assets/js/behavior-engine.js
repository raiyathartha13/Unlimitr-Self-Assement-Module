/**
 * AI Behavioral Prediction Engine
 * Adherence, plateau risk, relapse probability, AI confidence
 */
(function () {
  "use strict";

  function computePredictions(data) {
    var commitment = (data && data.commitment || "4-5").toLowerCase();
    var commitmentScore = commitment === "6-7" ? 7 : commitment === "4-5" ? 5 : commitment === "2-3" ? 3 : 4;
    var stress = (data && data.stressLevel || "").toLowerCase();
    var stressLevel = stress === "very-high" ? 4 : stress === "high" ? 3 : stress === "moderate" ? 2 : stress === "low" ? 1 : 2;
    var sleep = (data && data.sleepQuality || "").toLowerCase();
    var poorSleepPenalty = sleep === "poor" ? 10 : sleep === "inconsistent" ? 5 : 0;
    var bmi = 22;
    if (data && data.weight && data.height) {
      var h = parseFloat(data.height) / 100;
      bmi = parseFloat(data.weight) / (h * h);
    }

    // Architecture: adherence = (commitment * 20) - (stress * 10) - (poorSleep * 10)
    var adherence = Math.max(0, Math.min(100, (commitmentScore * 20) - (stressLevel * 10) - poorSleepPenalty + 50));
    var plateauRisk = Math.max(0, Math.min(100, (bmi > 30 ? 40 : 20) + (stressLevel * 5) + poorSleepPenalty));
    var regressionRisk = Math.max(0, Math.min(100, stressLevel * 15 + (sleep === "poor" ? 15 : 0)));
    var aiConfidence = Math.max(70, 95 - (stressLevel * 5) - poorSleepPenalty);

    return {
      adherence: Math.round(adherence),
      plateau: Math.round(plateauRisk),
      relapse: Math.round(regressionRisk),
      confidence: Math.round(aiConfidence)
    };
  }

  function riskLabel(v) {
    if (v <= 25) return "Low";
    if (v <= 50) return "Low-Moderate";
    if (v <= 75) return "Moderate";
    return "High";
  }

  function init(data) {
    var container = document.getElementById("behaviorEngineContainer");
    if (!container) return;

    var p = computePredictions(data);

    var consistencyPhrase = p.adherence >= 75 ? "a higher likelihood" : p.adherence >= 50 ? "a moderate likelihood" : "a lower likelihood";
    var html = '<div class="row g-3">' +
      '<div class="col-4"><div class="behavior-gauge-wrap" data-label="Consistency likelihood"><svg viewBox="0 0 100 100" class="behavior-gauge"><circle class="gauge-bg" cx="50" cy="50" r="42"/><circle class="gauge-fill" id="adherenceGauge" cx="50" cy="50" r="42" style="stroke-dasharray:0 264"/><text x="50" y="55" text-anchor="middle" font-size="14" font-weight="600" id="adherenceVal">0</text></svg><span class="small muted">Consistency likelihood</span></div></div>' +
      '<div class="col-4"><div class="behavior-gauge-wrap" data-label="Plateau probability"><svg viewBox="0 0 100 100" class="behavior-gauge"><circle class="gauge-bg" cx="50" cy="50" r="42"/><circle class="gauge-fill plateau" id="plateauGauge" cx="50" cy="50" r="42" style="stroke-dasharray:0 264"/><text x="50" y="55" text-anchor="middle" font-size="14" font-weight="600" id="plateauVal">0</text></svg><span class="small muted">' + riskLabel(p.plateau) + '</span></div></div>' +
      '<div class="col-4"><div class="behavior-gauge-wrap" data-label="Regression risk"><svg viewBox="0 0 100 100" class="behavior-gauge"><circle class="gauge-bg" cx="50" cy="50" r="42"/><circle class="gauge-fill relapse" id="relapseGauge" cx="50" cy="50" r="42" style="stroke-dasharray:0 264"/><text x="50" y="55" text-anchor="middle" font-size="14" font-weight="600" id="relapseVal">0</text></svg><span class="small muted">' + riskLabel(p.relapse) + '</span></div></div>' +
      '</div><p class="text-center mt-3 mb-0 small muted" style="line-height:1.5;">Your current lifestyle suggests ' + consistencyPhrase + ' of consistency. With guided accountability, this can improve significantly.</p><div class="text-center mt-2"><span class="small muted" style="font-size:12px;">AI Confidence: ' + p.confidence + '%</span></div>';

    container.innerHTML = html;

    var circumference = 2 * Math.PI * 42;

    function setGauge(id, val, invert) {
      var el = document.getElementById(id);
      var textEl = document.getElementById(id.replace("Gauge", "Val"));
      if (!el || !textEl) return;
      var pct = invert ? (100 - val) / 100 : val / 100;
      var dash = pct * circumference;
      textEl.textContent = val + "%";
      if (typeof gsap !== "undefined") {
        gsap.to(el, { strokeDasharray: dash + " 264", duration: 1.2, ease: "power2.out" });
        gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.8 });
      } else {
        el.style.strokeDasharray = dash + " 264";
      }
    }

    setGauge("adherenceGauge", p.adherence, false);
    setGauge("plateauGauge", p.plateau, true);
    setGauge("relapseGauge", p.relapse, true);
  }

  if (typeof window !== "undefined") {
    window.initBehaviorEngine = init;
    window.computeBehaviorPredictions = computePredictions;
    window.BehaviorEngine = { init: init, computePredictions: computePredictions };
  }
})();
