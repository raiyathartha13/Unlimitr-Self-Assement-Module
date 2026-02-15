/**
 * Transformation Timeline — Scroll-driven body morph + week markers
 * GSAP ScrollTrigger scrub, vertical spine indicator
 */
(function () {
  "use strict";

  var WEEKS = [0, 2, 4, 8, 12];

  function updateProgress(p, dots, scoreDisplay, captionEl, finalScore, targetScore) {
    p = Math.max(0, Math.min(1, p));
    if (typeof window.setMorphProgress === "function") window.setMorphProgress(p);
    if (typeof window.HologramEngine !== "undefined" && window.HologramEngine.setMorphProgress) {
      window.HologramEngine.setMorphProgress(p);
    }
    var previewBar = document.getElementById("timelinePreviewBar");
    if (previewBar) previewBar.style.width = (p * 100) + "%";
    if (dots) {
      var weekIdx = Math.min(4, Math.floor(p * 5));
      dots.forEach(function (d, i) {
        d.classList.toggle("active", i <= weekIdx);
      });
    }
    if (scoreDisplay && finalScore != null) {
      var score = Math.round(finalScore + ((targetScore || 85) - finalScore) * p);
      scoreDisplay.textContent = score;
    }
    if (captionEl) {
      if (p < 0.2) captionEl.textContent = "Week 0 — Baseline";
      else if (p < 0.4) captionEl.textContent = "Week 4 — Posture correction";
      else if (p < 0.6) captionEl.textContent = "Week 6 — Metabolic shift";
      else if (p < 0.85) captionEl.textContent = "Week 10 — Body recomposition";
      else captionEl.textContent = "Week 12 — Metabolic alignment";
    }
  }

  function init(data, finalScore, targetScore) {
    var timelineSection = document.getElementById("transformationTimelineSection");
    if (!timelineSection) return;

    var wrap = document.getElementById("morphTimelineWrap");
    if (wrap && !document.getElementById("morphBodyContainer")) {
      var c = document.createElement("div");
      c.id = "morphBodyContainer";
      c.className = "d-flex justify-content-center align-items-center";
      c.style.minHeight = "280px";
      wrap.insertBefore(c, wrap.firstChild);
    }
    if (typeof window.initMorphEngine === "function") {
      window.initMorphEngine("morphBodyContainer");
    }

    var spine = document.getElementById("timelineSpine");
    var dots = [];
    if (spine) {
      spine.innerHTML = "";
      WEEKS.forEach(function (w, i) {
        var dot = document.createElement("div");
        dot.className = "timeline-spine-dot" + (i === 0 ? " active" : "");
        dot.setAttribute("data-week", w);
        dot.innerHTML = "<span class='timeline-week'>W" + w + "</span>";
        spine.appendChild(dot);
        dots.push(dot);
      });
    }

    var scoreDisplay = document.getElementById("timelineScoreDisplay");
    var captionEl = document.getElementById("timelineCaption");
    if (scoreDisplay) scoreDisplay.textContent = finalScore || 54;

    if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
      ScrollTrigger.create({
        trigger: timelineSection,
        start: "top 60%",
        end: "bottom 20%",
        onUpdate: function (self) {
          updateProgress(self.progress, dots, scoreDisplay, captionEl, finalScore, targetScore);
        }
      });
    }
  }

  if (typeof window !== "undefined") {
    window.initTransformationTimeline = init;
  }
})();
