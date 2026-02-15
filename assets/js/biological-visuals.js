/**
 * Biological Visuals — Typewriter AI summary, neural background
 */
(function () {
  "use strict";

  var typewriterTween = null;

  function typewriterReveal(el, text, speed) {
    if (!el || !text || typeof gsap === "undefined") return;
    var inner = el.querySelector(".typewriter-text");
    if (!inner) {
      inner = document.createElement("span");
      inner.className = "typewriter-text";
      el.innerHTML = "";
      el.appendChild(inner);
      var cursor = document.createElement("span");
      cursor.className = "typewriter-cursor";
      cursor.setAttribute("aria-hidden", "true");
      cursor.textContent = "\u258C";
      cursor.style.cssText = "opacity:0.9;animation:blink 1s step-end infinite;";
      el.appendChild(cursor);
    }
    var cursor = el.querySelector(".typewriter-cursor");
    if (cursor) cursor.style.display = "inline";
    inner.textContent = "";
    var chars = text.split("");
    if (typewriterTween) typewriterTween.kill();
    typewriterTween = gsap.to({ i: 0 }, {
      i: chars.length,
      duration: chars.length * (speed || 0.03),
      ease: "none",
      onUpdate: function () {
        var idx = Math.floor(this.targets()[0].i);
        inner.textContent = chars.slice(0, idx).join("");
      },
      onComplete: function () {
        if (cursor) cursor.style.display = "none";
      }
    });
  }

  function initNeuralBackground() {
    var wrap = document.getElementById("journeyBlurWrap");
    if (!wrap || document.querySelector(".neural-bg")) return;

    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "neural-bg");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("viewBox", "0 0 120 900");
    svg.setAttribute("preserveAspectRatio", "none");
    svg.style.cssText = "position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;opacity:0.04;z-index:0;";
    svg.innerHTML = "<defs><linearGradient id='ng1' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' stop-color='var(--spanish-green)'/><stop offset='100%' stop-color='var(--blue-gray)'/></linearGradient></defs>";

    for (var i = 0; i < 8; i++) {
      var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      var d = "M" + (i * 15) + ",0 Q" + (i * 15 + 50) + ",200 " + (i * 12) + ",400 T" + (i * 10 + 30) + ",800";
      path.setAttribute("d", d);
      path.setAttribute("fill", "none");
      path.setAttribute("stroke", "url(#ng1)");
      path.setAttribute("stroke-width", "0.5");
      path.setAttribute("stroke-dasharray", "4 8");
      svg.appendChild(path);
    }

    wrap.style.position = "relative";
    wrap.insertBefore(svg, wrap.firstChild);

    if (typeof gsap !== "undefined") {
      gsap.to(".neural-bg path", {
        strokeDashoffset: -24,
        duration: 20,
        repeat: -1,
        ease: "none"
      });
    }
  }

  function initConditionGlow(hasCondition) {
    var block = document.getElementById("conditionBlock");
    var panel = document.getElementById("conditionIntelligencePanel");
    if (!block || typeof gsap === "undefined") return;
    if (block.querySelector(".condition-glow")) return;
    var showGlow = hasCondition === true || (panel && panel.innerHTML.trim().length > 50);
    if (!showGlow) return;
    block.classList.add("condition-glow-wrap");
    var glow = document.createElement("div");
    glow.className = "condition-glow";
    glow.setAttribute("aria-hidden", "true");
    block.style.position = "relative";
    block.appendChild(glow);
    gsap.to(".condition-glow", {
      opacity: 0.35,
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });
  }

  function progressiveAIReveal(el, finalSummary, data) {
    if (!el || typeof gsap === "undefined") return;
    var phases = [
      "Scanning metabolic signals…",
      "Evaluating hormonal pattern…",
      "Identifying recovery deficit…",
      "Structured correction recommended."
    ];
    if (data && (data.healthIssues || "").toLowerCase().indexOf("diabetes") >= 0) phases[2] = "Assessing insulin sensitivity…";
    if (data && (data.healthIssues || "").toLowerCase().indexOf("thyroid") >= 0) phases[2] = "Evaluating thyroid metabolic impact…";

    var inner = el.querySelector(".typewriter-text") || (function () {
      var i = document.createElement("span");
      i.className = "typewriter-text";
      el.innerHTML = "";
      el.appendChild(i);
      return i;
    })();
    var cursor = el.querySelector(".typewriter-cursor");
    if (!cursor) {
      cursor = document.createElement("span");
      cursor.className = "typewriter-cursor";
      cursor.textContent = "\u258C";
      cursor.style.cssText = "opacity:0.9;animation:blink 1s step-end infinite;";
      el.appendChild(cursor);
    }
    cursor.style.display = "none";
    inner.textContent = "";

    var tl = gsap.timeline();
    phases.forEach(function (p) {
      tl.call(function () { inner.textContent = p; });
      tl.to({}, { duration: 1.2 });
    });
    tl.call(function () {
      cursor.style.display = "inline";
      typewriterReveal(el, finalSummary, 0.02);
    });
  }

  if (typeof window !== "undefined") {
    window.typewriterReveal = typewriterReveal;
    window.progressiveAIReveal = progressiveAIReveal;
    window.initNeuralBackground = initNeuralBackground;
    window.initConditionGlow = initConditionGlow;
  }
})();
