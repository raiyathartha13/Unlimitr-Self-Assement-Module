/**
 * Biological Engine — SVG body avatar with breathing, pulse, condition-based glows
 * Layer 2: Biological Avatar Engine
 */
(function () {
  "use strict";

  var BODY_BASE = '<ellipse class="body-outline" cx="50" cy="70" rx="14" ry="50" fill="rgba(13,50,86,0.06)" stroke="rgba(0,137,68,0.25)" stroke-width="1"/><circle class="body-region head" cx="50" cy="18" r="10" fill="transparent"/><ellipse class="body-region neck" cx="50" cy="36" rx="5" ry="10" fill="transparent"/><ellipse class="body-region chest" cx="50" cy="58" rx="12" ry="16" fill="transparent"/><ellipse class="body-region abdomen" cx="50" cy="88" rx="11" ry="22" fill="transparent"/><ellipse class="body-region lower-abdomen" cx="50" cy="118" rx="9" ry="14" fill="transparent"/><circle class="heart-glow" cx="50" cy="54" r="8" fill="rgba(0,137,68,0.2)" opacity="0"/>';

  function init(data) {
    var container = document.getElementById("bodyMorphContainer");
    if (!container || typeof gsap === "undefined") return;

    var gender = (data && data.gender || "male").toLowerCase();
    var bmi = 22;
    if (data && data.weight && data.height) {
      var h = parseFloat(data.height) / 100;
      bmi = parseFloat(data.weight) / (h * h);
    }
    var issues = (data && data.healthIssues || "").toLowerCase();
    var stress = (data && data.stressLevel || "").toLowerCase();
    var hasThyroid = issues.indexOf("thyroid") >= 0;
    var hasDiabetes = issues.indexOf("diabetes") >= 0;
    var stressHigh = stress === "high" || stress === "very-high";
    var bmiHigh = bmi >= 25;

    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 100 140");
    svg.setAttribute("class", "body-svg");
    svg.innerHTML = BODY_BASE;

    container.innerHTML = "";
    container.appendChild(svg);
    container.classList.add("body-container");

    gsap.to(".body-container", {
      scale: 1.015,
      duration: 2.5,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      transformOrigin: "50% 50%"
    });

    gsap.to(".heart-glow", {
      scale: 1.3,
      opacity: 0.5,
      duration: 0.8,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      transformOrigin: "50px 54px"
    });

    if (bmiHigh) {
      var abdomen = svg.querySelector(".body-region.abdomen");
      if (abdomen) {
        var glow = document.createElementNS("http://www.w3.org/2000/svg", "ellipse");
        glow.setAttribute("class", "abdomen-glow");
        glow.setAttribute("cx", "50");
        glow.setAttribute("cy", "88");
        glow.setAttribute("rx", "16");
        glow.setAttribute("ry", "26");
        glow.setAttribute("fill", "rgba(255, 195, 5, 0.2)");
        glow.setAttribute("opacity", "0");
        abdomen.parentNode.insertBefore(glow, abdomen);
        gsap.to(".abdomen-glow", {
          opacity: 0.4,
          duration: 2,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut"
        });
      }
    }

    if (hasThyroid) {
      var neck = svg.querySelector(".body-region.neck");
      if (neck) {
        var tg = document.createElementNS("http://www.w3.org/2000/svg", "ellipse");
        tg.setAttribute("class", "thyroid-glow");
        tg.setAttribute("cx", "50");
        tg.setAttribute("cy", "36");
        tg.setAttribute("rx", "8");
        tg.setAttribute("ry", "12");
        tg.setAttribute("fill", "rgba(0, 128, 221, 0.25)");
        tg.setAttribute("opacity", "0");
        neck.parentNode.insertBefore(tg, neck);
        gsap.to(".thyroid-glow", {
          opacity: 0.5,
          duration: 2.2,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut"
        });
      }
    }

    if (hasDiabetes || stressHigh) {
      var lower = svg.querySelector(".body-region.lower-abdomen");
      if (lower) {
        var ig = document.createElementNS("http://www.w3.org/2000/svg", "ellipse");
        ig.setAttribute("class", "insulin-glow");
        ig.setAttribute("cx", "50");
        ig.setAttribute("cy", "118");
        ig.setAttribute("rx", "12");
        ig.setAttribute("ry", "16");
        ig.setAttribute("fill", "rgba(255, 10, 10, 0.15)");
        ig.setAttribute("opacity", "0");
        lower.parentNode.insertBefore(ig, lower);
        gsap.to(".insulin-glow", {
          opacity: 0.35,
          duration: 1.8,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut"
        });
      }
    }

    if (stressHigh) {
      var chest = svg.querySelector(".body-region.chest");
      if (chest) {
        var ag = document.createElementNS("http://www.w3.org/2000/svg", "ellipse");
        ag.setAttribute("class", "adrenal-glow");
        ag.setAttribute("cx", "50");
        ag.setAttribute("cy", "58");
        ag.setAttribute("rx", "16");
        ag.setAttribute("ry", "20");
        ag.setAttribute("fill", "rgba(255, 195, 5, 0.15)");
        ag.setAttribute("opacity", "0");
        chest.parentNode.insertBefore(ag, chest);
        gsap.to(".adrenal-glow", {
          opacity: 0.3,
          duration: 2.1,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut"
        });
      }
    }
  }

  if (typeof window !== "undefined") {
    window.initBiologicalEngine = init;
  }
})();
