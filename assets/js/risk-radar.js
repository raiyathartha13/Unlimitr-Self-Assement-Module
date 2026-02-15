/**
 * AI Body Risk Radar — Custom SVG diagnostic radar
 * 6 axes: Metabolic, Hormonal, Insulin, Recovery, Cardiovascular, Inflammation
 */
(function () {
  "use strict";

  var AXES = [
    { key: "metabolic", label: "Metabolic Strain", tooltip: "BMI and activity suggest metabolic efficiency. Higher values indicate strain that can improve with structured correction." },
    { key: "hormonal", label: "Hormonal Balance", tooltip: "Thyroid, PCOS and stress affect hormonal signals. Condition-aware protocol can help restore balance." },
    { key: "insulin", label: "Insulin Sensitivity", tooltip: "Diabetes, waist-to-height and glycemic load affect sensitivity. Structured nutrition can improve this over time." },
    { key: "recovery", label: "Recovery Capacity", tooltip: "Sleep and stress impact recovery. Targeted adjustments can improve capacity." },
    { key: "cardio", label: "Cardiovascular Load", tooltip: "BP, cholesterol and heart health indicators. All can improve with structured intervention." },
    { key: "inflammation", label: "Inflammation", tooltip: "Stress and joint factors affect inflammation. These are adaptive responses that can be addressed." }
  ];

  function normalize(value, max) {
    return Math.min(100, Math.max(0, (value / max) * 100));
  }

  function computeRisks(data) {
    var bmi = 22;
    if (data && data.weight && data.height) {
      var h = parseFloat(data.height) / 100;
      bmi = parseFloat(data.weight) / (h * h);
    }
    var activity = (data && data.activityLevel || "").toLowerCase();
    var issues = (data && data.healthIssues || "").toLowerCase();
    var stress = (data && data.stressLevel || "").toLowerCase();
    var sleep = (data && data.sleepQuality || "").toLowerCase();

    var stressLevelNum = stress === "very-high" ? 4 : stress === "high" ? 3 : stress === "moderate" ? 2 : stress === "low" ? 1 : 2;
    var thyroid = issues.indexOf("thyroid") >= 0;
    var pcos = issues.indexOf("pcos") >= 0;
    var diabetes = issues.indexOf("diabetes") >= 0;
    var bp = issues.indexOf("bp") >= 0 || issues.indexOf("blood pressure") >= 0 || issues.indexOf("heart") >= 0;
    var cholesterol = issues.indexOf("cholesterol") >= 0 || issues.indexOf("lipid") >= 0;
    var hba1cLevel = parseFloat(data && data.hba1cLevel) || 0;

    // Metabolic: BMI offset from 22, sedentary penalty
    var metabolicRisk = normalize(Math.max(0, bmi - 22), 15) + (activity === "sedentary" ? 15 : activity === "light" ? 8 : 0);
    metabolicRisk = Math.min(100, metabolicRisk);

    // Hormonal: thyroid, PCOS, stress
    var hormonalRisk = (thyroid ? 25 : 0) + (pcos ? 20 : 0) + (stressLevelNum * 5);
    hormonalRisk = Math.min(100, hormonalRisk);

    // Insulin: diabetes, HbA1c > 7
    var insulinRisk = (diabetes ? 30 : 0) + (hba1cLevel > 7 ? 15 : 0) + (bmi > 28 ? 10 : bmi > 24 ? 5 : 0);
    insulinRisk = Math.min(100, insulinRisk);

    // Recovery: sleep quality, stress
    var recoveryRisk = (sleep === "poor" ? 25 : sleep === "inconsistent" ? 12 : 0) + (stressLevelNum * 5);
    recoveryRisk = Math.min(100, recoveryRisk);

    // Cardio: BP, cholesterol
    var cardioRisk = (bp ? 25 : 0) + (cholesterol ? 20 : 0) + (bmi > 28 ? 15 : bmi > 24 ? 8 : 0);
    cardioRisk = Math.min(100, cardioRisk);

    // Inflammation: stress, joint, BMI
    var jointPenalty = (issues.indexOf("joint") >= 0 || issues.indexOf("knee") >= 0) ? 20 : 0;
    var inflammationRisk = (stressLevelNum * 5) + jointPenalty + (bmi > 27 ? 15 : 0);
    inflammationRisk = Math.min(100, inflammationRisk);

    return [metabolicRisk, hormonalRisk, insulinRisk, recoveryRisk, cardioRisk, inflammationRisk];
  }

  function polarToCart(cx, cy, r, angle) {
    var rad = (angle - 90) * Math.PI / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }

  function init(data) {
    var container = document.getElementById("riskRadarContainer");
    if (!container) return;

    var risks = computeRisks(data);
    var size = 200;
    var cx = size / 2;
    var cy = size / 2;
    var maxR = size / 2 - 24;
    var n = 6;

    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 " + size + " " + size);
    svg.setAttribute("class", "risk-radar-svg");
    svg.style.cssText = "width:100%;max-width:240px;height:auto;display:block;margin:0 auto;";

    var defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    defs.innerHTML = "<linearGradient id='radarFill' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' stop-color='var(--spanish-green)' stop-opacity='0.4'/><stop offset='100%' stop-color='var(--blue-gray)' stop-opacity='0.2'/></linearGradient>";
    svg.appendChild(defs);

    for (var ring = 1; ring <= 4; ring++) {
      var r = (maxR / 4) * ring;
      var circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      circle.setAttribute("cx", cx);
      circle.setAttribute("cy", cy);
      circle.setAttribute("r", r);
      circle.setAttribute("fill", "none");
      circle.setAttribute("stroke", "rgba(0, 137, 68, 0.15)");
      circle.setAttribute("stroke-width", "0.5");
      circle.classList.add("radar-ring");
      svg.appendChild(circle);
    }

    for (var i = 0; i < n; i++) {
      var angle = (360 / n) * i;
      var end = polarToCart(cx, cy, maxR, angle);
      var line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", cx);
      line.setAttribute("y1", cy);
      line.setAttribute("x2", end.x);
      line.setAttribute("y2", end.y);
      line.setAttribute("stroke", "rgba(0, 137, 68, 0.2)");
      line.setAttribute("stroke-width", "0.8");
      line.classList.add("radar-axis");
      line.setAttribute("data-axis", i);
      line.setAttribute("data-tooltip", AXES[i].tooltip);
      line.setAttribute("data-label", AXES[i].label);
      svg.appendChild(line);

      var labelPos = polarToCart(cx, cy, maxR + 14, angle);
      var label = document.createElementNS("http://www.w3.org/2000/svg", "text");
      label.setAttribute("x", labelPos.x);
      label.setAttribute("y", labelPos.y);
      label.setAttribute("text-anchor", "middle");
      label.setAttribute("font-size", "9");
      label.setAttribute("fill", "var(--text-muted)");
      label.textContent = AXES[i].label.split(" ")[0];
      svg.appendChild(label);
    }

    var points = [];
    for (var j = 0; j < n; j++) {
      var r = (risks[j] / 100) * maxR;
      var angle = (360 / n) * j;
      var p = polarToCart(cx, cy, r, angle);
      points.push(p.x + "," + p.y);
    }
    var polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    polygon.setAttribute("points", points.join(" "));
    polygon.setAttribute("fill", "url(#radarFill)");
    polygon.setAttribute("stroke", "rgba(0, 137, 68, 0.6)");
    polygon.setAttribute("stroke-width", "1");
    polygon.classList.add("radar-polygon");
    polygon.setAttribute("stroke-dasharray", "200");
    polygon.setAttribute("stroke-dashoffset", "200");
    svg.appendChild(polygon);

    risks.forEach(function (v, idx) {
      var r = (v / 100) * maxR;
      var angle = (360 / n) * idx;
      var p = polarToCart(cx, cy, r, angle);
      var node = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      node.setAttribute("cx", p.x);
      node.setAttribute("cy", p.y);
      node.setAttribute("r", "4");
      node.setAttribute("fill", "var(--spanish-green)");
      node.setAttribute("opacity", "0.9");
      node.classList.add("radar-node");
      node.setAttribute("data-axis", idx);
      svg.appendChild(node);
    });

    var tooltip = document.createElement("div");
    tooltip.className = "radar-tooltip";
    tooltip.style.cssText = "position:absolute;padding:8px 12px;background:rgba(13,50,86,0.95);color:#fff;font-size:12px;border-radius:8px;pointer-events:none;opacity:0;transition:opacity 0.2s;z-index:50;max-width:200px;";
    container.style.position = "relative";
    container.innerHTML = "";
    container.appendChild(svg);
    container.appendChild(tooltip);

    svg.querySelectorAll(".radar-axis, .radar-node").forEach(function (el) {
      el.addEventListener("mouseenter", function () {
        var i = parseInt(el.getAttribute("data-axis"), 10);
        tooltip.textContent = AXES[i].label + ": " + Math.round(risks[i]) + "% — " + AXES[i].tooltip;
        tooltip.style.opacity = "1";
      });
      el.addEventListener("mouseleave", function () { tooltip.style.opacity = "0"; });
    });

    if (typeof gsap !== "undefined") {
      gsap.fromTo(".radar-ring", { opacity: 0 }, { opacity: 1, duration: 0.6, stagger: 0.1 });
      gsap.to(".radar-polygon", { strokeDashoffset: 0, duration: 1.2, ease: "power2.out" });
      gsap.fromTo(".radar-polygon", { opacity: 0 }, { opacity: 1, duration: 1, delay: 0.3 });
      gsap.fromTo(".radar-node", { scale: 0 }, { scale: 1, duration: 0.4, stagger: 0.08, delay: 0.8 });
      gsap.to(".radar-node", { opacity: 0.7, scale: 1.1, duration: 1.5, repeat: -1, yoyo: true, stagger: 0.2, ease: "sine.inOut", transformOrigin: "center center" });
    }

    var statusEl = document.getElementById("riskRadarStatus");
    if (statusEl) {
      statusEl.textContent = "";
      if (typeof gsap !== "undefined") {
        gsap.delayedCall(2, function () { statusEl.textContent = "Mapping complete. Hover axes for details."; });
      } else {
        statusEl.textContent = "Mapping complete. Hover axes for details.";
      }
    }
  }

  if (typeof window !== "undefined") {
    window.initRiskRadar = init;
    window.computeBodyRisks = computeRisks;
    window.RiskRadar = { init: init, computeRisks: computeRisks };
  }
})();
