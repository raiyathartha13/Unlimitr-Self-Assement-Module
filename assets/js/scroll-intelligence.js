/**
 * Scroll Intelligence — Coordinates scroll, spine indicator, morph, emotional lock-in
 */
(function () {
  "use strict";

  function init(finalScore, targetScore) {
    var lockInSection = document.getElementById("emotionalLockInSection");
    var lockInScore = document.getElementById("lockInScoreFrom");
    var lockInScoreTo = document.getElementById("lockInScoreTo");
    var lockInMessage = document.getElementById("lockInMessage");
    var lockInCta = document.getElementById("lockInCta");

    if (lockInSection && typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
      gsap.fromTo(lockInScore, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.6, scrollTrigger: { trigger: lockInSection, start: "top 80%", toggleActions: "play none none none" } });
      gsap.fromTo(lockInScoreTo, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.6, delay: 0.2, scrollTrigger: { trigger: lockInSection, start: "top 80%", toggleActions: "play none none none" } });
      if (lockInMessage) gsap.fromTo(lockInMessage, { opacity: 0 }, { opacity: 1, duration: 0.8, delay: 0.5, scrollTrigger: { trigger: lockInSection, start: "top 80%", toggleActions: "play none none none" } });
      if (lockInCta) gsap.fromTo(lockInCta, { opacity: 0 }, { opacity: 1, duration: 0.5, delay: 1, scrollTrigger: { trigger: lockInSection, start: "top 80%", toggleActions: "play none none none" } });
    }

    if (lockInScore) lockInScore.textContent = finalScore || 54;
    if (lockInScoreTo) lockInScoreTo.textContent = targetScore || 85;
    if (lockInMessage) lockInMessage.textContent = "Your current score reflects reversible strain — not permanent damage. With structured guidance, 85+ is within reach. This is metabolic alignment, grounded in science.";
  }

  if (typeof window !== "undefined") {
    window.initScrollIntelligence = init;
    window.ScrollIntelligence = { init: init };
  }
})();
