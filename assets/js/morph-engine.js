/**
 * Morph Engine — Fat → Fit body transition
 * Uses 3D anatomical body image with scale transform, or falls back to SVG silhouettes
 */
(function () {
  "use strict";

  var BODY_IMAGE_PATHS = { male: "assets/images/3.png", female: "assets/images/3.png" };
  var currentGender = "male";

  // Stage 0: Overweight | Stage 1: Reduced abdominal | Stage 2: Improved posture | Stage 3: Fit
  var STAGES = [
    '<ellipse cx="50" cy="72" rx="18" ry="52" fill="rgba(13,50,86,0.08)" stroke="rgba(0,137,68,0.2)" stroke-width="1"/><circle cx="50" cy="20" r="12" fill="transparent"/><ellipse cx="50" cy="40" rx="7" ry="12" fill="transparent"/><ellipse cx="50" cy="62" rx="14" ry="18" fill="transparent"/><ellipse cx="50" cy="95" rx="14" ry="26" fill="transparent"/><ellipse cx="50" cy="128" rx="11" ry="16" fill="transparent"/>',
    '<ellipse cx="50" cy="71" rx="15" ry="50" fill="rgba(13,50,86,0.07)" stroke="rgba(0,137,68,0.25)" stroke-width="1"/><circle cx="50" cy="19" r="11" fill="transparent"/><ellipse cx="50" cy="38" rx="6" ry="11" fill="transparent"/><ellipse cx="50" cy="58" rx="12" ry="16" fill="transparent"/><ellipse cx="50" cy="90" rx="12" ry="22" fill="transparent"/><ellipse cx="50" cy="122" rx="9" ry="14" fill="transparent"/>',
    '<ellipse cx="50" cy="70" rx="13" ry="49" fill="rgba(13,50,86,0.06)" stroke="rgba(0,137,68,0.3)" stroke-width="1"/><circle cx="50" cy="18" r="10" fill="transparent"/><ellipse cx="50" cy="36" rx="5.5" ry="10" fill="transparent"/><ellipse cx="50" cy="56" rx="11" ry="15" fill="transparent"/><ellipse cx="50" cy="88" rx="10" ry="20" fill="transparent"/><ellipse cx="50" cy="119" rx="8" ry="13" fill="transparent"/>',
    '<ellipse cx="50" cy="70" rx="12" ry="48" fill="rgba(13,50,86,0.06)" stroke="rgba(0,137,68,0.35)" stroke-width="1"/><circle cx="50" cy="18" r="10" fill="transparent"/><ellipse cx="50" cy="36" rx="5" ry="10" fill="transparent"/><ellipse cx="50" cy="56" rx="10" ry="14" fill="transparent"/><ellipse cx="50" cy="86" rx="9" ry="18" fill="transparent"/><ellipse cx="50" cy="116" rx="7" ry="12" fill="transparent"/>'
  ];
  var BODY_FAT = STAGES[0];
  var BODY_FIT = STAGES[3];

  function createSvgFallback() {
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 100 140");
    svg.setAttribute("class", "morph-body-svg");
    svg.style.cssText = "width:140px;height:auto;display:block;margin:0 auto;";
    var stages = [];
    STAGES.forEach(function (html, i) {
      var g = document.createElementNS("http://www.w3.org/2000/svg", "g");
      g.classList.add("morph-stage", "morph-stage-" + i);
      g.innerHTML = html;
      g.style.opacity = i === 0 ? "1" : "0";
      g.style.transition = "opacity 0.5s ease";
      stages.push(g);
      svg.appendChild(g);
    });
    if (stages[0]) stages[0].classList.add("morph-body-fat");
    if (stages[3]) stages[3].classList.add("morph-body-fit");
    return svg;
  }

  function getBodyImagePath() {
    return BODY_IMAGE_PATHS[currentGender] || BODY_IMAGE_PATHS.male;
  }

  function createAnatomicalBodyView(path) {
    var wrap = document.createElement("div");
    wrap.className = "morph-anatomical-wrap";
    var img = document.createElement("img");
    img.className = "morph-body-anatomical";
    img.alt = "Body transformation";
    img.src = path || getBodyImagePath();
    wrap.appendChild(img);
    return wrap;
  }

  function init(containerId) {
    var container = document.getElementById(containerId || "morphBodyContainer");
    if (!container) return;

    container.innerHTML = "";
    container.classList.add("morph-engine-container");

    var svg = createSvgFallback();
    container.appendChild(svg);

    var path = getBodyImagePath();
    var img = new Image();
    img.onload = function () {
      container.innerHTML = "";
      container.appendChild(createAnatomicalBodyView(path));
      container.classList.add("morph-uses-image");
    };
    img.onerror = function () { /* keep SVG fallback */ };
    img.src = path;
  }

  function setProgress(progress, scopeEl) {
    progress = Math.max(0, Math.min(1, progress));
    var root = scopeEl || document;
    var anatomicalImg = root.querySelector ? root.querySelector(".morph-body-anatomical") : document.querySelector(".morph-body-anatomical");
    if (anatomicalImg) {
      var scaleX = 1 + (1 - progress) * 0.2;
      var scaleY = 1 + (1 - progress) * 0.08;
      anatomicalImg.style.transform = "scale(" + scaleX + ", " + scaleY + ")";
      anatomicalImg.style.transformOrigin = "50% 100%";
      return;
    }
    var stages = root.querySelectorAll ? root.querySelectorAll(".morph-stage") : document.querySelectorAll(".morph-stage");
    if (!stages || stages.length < 4) {
      var fat = root.querySelector ? root.querySelector(".morph-body-fat") : document.querySelector(".morph-body-fat");
      var fit = root.querySelector ? root.querySelector(".morph-body-fit") : document.querySelector(".morph-body-fit");
      if (fat && fit) {
        fat.style.opacity = String(1 - progress);
        fit.style.opacity = String(progress);
        var sx = 1 - progress * 0.05;
        fit.style.transform = "scaleX(" + sx + ")";
        fit.style.transformOrigin = "50% 50%";
      }
      return;
    }
    var stageF = progress * 3;
    var lo = Math.floor(stageF);
    var hi = Math.min(3, lo + 1);
    var t = stageF - lo;
    for (var i = 0; i < 4; i++) {
      var op = 0;
      if (i === lo) op = 1 - t;
      else if (i === hi) op = t;
      stages[i].style.opacity = String(op);
      if (i === 3) {
        var sx = 1 - progress * 0.05;
        stages[i].style.transform = "scaleX(" + sx + ")";
        stages[i].style.transformOrigin = "50% 50%";
      }
    }
  }

  function setGender(gender) {
    currentGender = (gender || "male").toLowerCase();
  }

  function initFatFitSlider(finalScore, targetScore, data) {
    if (data && data.gender) setGender(data.gender);
    var container = document.getElementById("fatFitMorphContainer");
    var slider = document.getElementById("fatFitSlider");
    var scoreDisplay = document.getElementById("fatFitScoreDisplay");
    if (!container || !slider) return;

    if (!container.querySelector(".morph-body-svg") && !container.querySelector(".morph-body-anatomical")) {
      var c = document.createElement("div");
      c.id = "fatFitMorphBody";
      container.appendChild(c);
      init("fatFitMorphBody");
      setProgress(0, container);
    }

    slider.addEventListener("input", function () {
      var p = parseInt(slider.value, 10) / 100;
      setProgress(p, container);
      if (typeof window.HologramEngine !== "undefined" && window.HologramEngine.setMorphProgress) {
        window.HologramEngine.setMorphProgress(p);
      }
      var previewBar = document.getElementById("timelinePreviewBar");
      if (previewBar) previewBar.style.width = (p * 100) + "%";
      var score = Math.round((finalScore || 54) + ((targetScore || 85) - (finalScore || 54)) * p);
      if (scoreDisplay) scoreDisplay.textContent = score;
    });
    if (scoreDisplay) scoreDisplay.textContent = finalScore || 54;
  }

  if (typeof window !== "undefined") {
    window.initMorphEngine = init;
    window.setMorphProgress = setProgress;
    window.initFatFitSlider = initFatFitSlider;
    window.MorphEngine = { init: init, setProgress: setProgress, initFatFitSlider: initFatFitSlider, setGender: setGender };
  }
})();
