/**
 * Engine 2 — Biological Avatar
 * Gender-based SVG, breathing, heartbeat, condition glows, card-hover body pulse
 */
(function () {
  "use strict";

  var BODY_BASE = '<ellipse class="body-outline" cx="50" cy="70" rx="14" ry="50" fill="rgba(13,50,86,0.06)" stroke="rgba(0,137,68,0.25)" stroke-width="1"/><circle class="body-region head" cx="50" cy="18" r="10" fill="transparent"/><ellipse class="body-region neck" cx="50" cy="36" rx="5" ry="10" fill="transparent"/><ellipse class="body-region chest" cx="50" cy="58" rx="12" ry="16" fill="transparent"/><ellipse class="body-region abdomen" cx="50" cy="88" rx="11" ry="22" fill="transparent"/><ellipse class="body-region lower-abdomen" cx="50" cy="118" rx="9" ry="14" fill="transparent"/><circle class="heart-glow" cx="50" cy="54" r="8" fill="rgba(0,137,68,0.2)" opacity="0"/>';

  function init(data) {
    var container = document.getElementById("bodyMorphContainer");
    if (!container || typeof gsap === "undefined") return;

    var issues = (data && data.healthIssues || "").toLowerCase();
    var stress = (data && data.stressLevel || "").toLowerCase();
    var bmi = 22;
    if (data && data.weight && data.height) {
      var h = parseFloat(data.height) / 100;
      bmi = parseFloat(data.weight) / (h * h);
    }
    var hasThyroid = issues.indexOf("thyroid") >= 0;
    var hasDiabetes = issues.indexOf("diabetes") >= 0;
    var hasPCOS = issues.indexOf("pcos") >= 0;
    var stressHigh = stress === "high" || stress === "very-high";
    var bmiHigh = bmi >= 25;

    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 100 140");
    svg.setAttribute("class", "body-svg");
    svg.innerHTML = BODY_BASE;

    container.innerHTML = "";
    container.appendChild(svg);
    container.classList.add("body-container");

    gsap.to(".body-container", { scale: 1.015, duration: 2.5, repeat: -1, yoyo: true, ease: "sine.inOut", transformOrigin: "50% 50%" });
    gsap.to(".heart-glow", { scale: 1.3, opacity: 0.5, duration: 0.8, repeat: -1, yoyo: true, ease: "sine.inOut", transformOrigin: "50px 54px" });

    if (bmiHigh) addGlow(svg, ".body-region.abdomen", "abdomen-glow", 50, 88, 16, 26, "rgba(255, 195, 5, 0.2)", 0.4, 2);
    if (hasThyroid) addGlow(svg, ".body-region.neck", "thyroid-glow", 50, 36, 8, 12, "rgba(0, 128, 221, 0.25)", 0.5, 2.2);
    if (hasPCOS) addGlow(svg, ".body-region.lower-abdomen", "pcos-glow", 50, 118, 12, 16, "rgba(255, 161, 230, 0.25)", 0.35, 1.9);
    if (hasDiabetes || stressHigh) addGlow(svg, ".body-region.lower-abdomen", "insulin-glow", 50, 118, 12, 16, "rgba(255, 10, 10, 0.15)", 0.35, 1.8);
    if (stressHigh) addGlow(svg, ".body-region.chest", "adrenal-glow", 50, 58, 16, 20, "rgba(255, 195, 5, 0.15)", 0.3, 2.1);

    document.querySelectorAll("[data-body-region]").forEach(function (card) {
      card.addEventListener("mouseenter", function () {
        var region = svg.querySelector(".body-region." + card.getAttribute("data-body-region"));
        if (region) {
          region.classList.add("body-region-hover-pulse");
          setTimeout(function () { region.classList.remove("body-region-hover-pulse"); }, 600);
        }
      });
    });
  }

  function addGlow(svg, selector, cls, cx, cy, rx, ry, fill, op, dur) {
    var el = svg.querySelector(selector);
    if (!el) return;
    var g = document.createElementNS("http://www.w3.org/2000/svg", "ellipse");
    g.setAttribute("class", cls);
    g.setAttribute("cx", cx); g.setAttribute("cy", cy);
    g.setAttribute("rx", rx); g.setAttribute("ry", ry);
    g.setAttribute("fill", fill);
    g.setAttribute("opacity", "0");
    el.parentNode.insertBefore(g, el);
    gsap.to("." + cls, { opacity: op, duration: dur, repeat: -1, yoyo: true, ease: "sine.inOut" });
  }

  if (typeof window !== "undefined") {
    window.initBiologicalAvatar = window.initBiologicalEngine = init;
    window.AvatarEngine = { init: init };
  }
})();
