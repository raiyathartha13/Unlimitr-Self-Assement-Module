/**
 * Ambient Motion — Continuous living-system animations
 * Floating AI core, rotating data ring, breathing glow, shimmer.
 * Does NOT modify layout, colors, or card positions.
 */
(function () {
  "use strict";
  var inited = false;

  function init() {
    if (inited) return;
    if (typeof gsap === "undefined") return;

    var gaugeWrap = document.getElementById("healthGaugeWrap");
    if (gaugeWrap && !gaugeWrap.querySelector(".ai-core-glow")) {
      gaugeWrap.classList.add("ai-core-wrap");
      var svg = gaugeWrap.querySelector(".health-score-gauge__svg");
      if (svg) svg.classList.add("ai-core");

      gsap.to(".ai-core", {
        y: -8,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });
      gsap.to(".ai-core", {
        scale: 1.02,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        transformOrigin: "60px 60px",
        delay: 0.1
      });

      var track = gaugeWrap.querySelector(".health-score-gauge__track");
      if (track) {
        track.classList.add("data-ring");
        gsap.to(".data-ring", {
          rotation: 360,
          duration: 40,
          repeat: -1,
          ease: "none",
          transformOrigin: "60px 60px"
        });
      }

      var particlesWrap = gaugeWrap.querySelector(".ai-particles");
      if (!particlesWrap && svg) {
        particlesWrap = document.createElementNS("http://www.w3.org/2000/svg", "g");
        particlesWrap.setAttribute("class", "ai-particles");
        particlesWrap.setAttribute("aria-hidden", "true");
        for (var p = 0; p < 5; p++) {
          var g = document.createElementNS("http://www.w3.org/2000/svg", "g");
          var angle = (p / 5) * Math.PI * 2;
          g.setAttribute("transform", "translate(60,60)");
          var dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
          dot.setAttribute("cx", Math.cos(angle) * 58);
          dot.setAttribute("cy", Math.sin(angle) * 58);
          dot.setAttribute("r", 1.5);
          dot.setAttribute("fill", "var(--spanish-green)");
          dot.setAttribute("opacity", "0.4");
          g.appendChild(dot);
          particlesWrap.appendChild(g);
        }
        svg.appendChild(particlesWrap);
        gsap.to(".ai-particles g", {
          rotation: 360,
          duration: 28,
          repeat: -1,
          ease: "none",
          transformOrigin: "0px 0px"
        });
      }

      var glow = document.createElement("div");
      glow.className = "ai-core-glow";
      glow.setAttribute("aria-hidden", "true");
      gaugeWrap.style.position = "relative";
      gaugeWrap.insertBefore(glow, gaugeWrap.firstChild);
      gsap.to(".ai-core-glow", {
        opacity: 0.5,
        duration: 2.5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });
    }

    var scoreCard = document.querySelector("#aiHealthSummary .col-lg-5");
    if (scoreCard && !scoreCard.querySelector(".score-shimmer")) {
      var shimmer = document.createElement("div");
      shimmer.className = "score-shimmer";
      shimmer.setAttribute("aria-hidden", "true");
      scoreCard.style.position = "relative";
      scoreCard.style.overflow = "hidden";
      scoreCard.appendChild(shimmer);
      gsap.to(".score-shimmer", {
        x: "300%",
        duration: 6,
        repeat: -1,
        repeatDelay: 4,
        ease: "none"
      });
    }

    inited = true;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  if (typeof window !== "undefined") {
    window.initAmbientMotion = init;
    window.AmbientMotion = { init: init };
  }
})();
