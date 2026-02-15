/**
 * Hologram Engine — Integrates WebGL body into dashboard
 * Constrained to #hologramContainer, fallback to 2D SVG when WebGL unavailable
 */
(function () {
  "use strict";

  var inited = false;
  var threeCore = null;

  function init(data) {
    if (inited) return;
    var container = document.getElementById("hologramContainer");
    var fallback = document.getElementById("bodyMorphContainer");
    if (!container) return;
    var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
    if (isMobile && fallback) { fallback.style.display = "flex"; return; }

    threeCore = typeof window.ThreeCore !== "undefined" ? window.ThreeCore.init(container) : null;
    if (!threeCore) {
      if (fallback) fallback.style.display = "flex";
      return;
    }

    var bodyInit = typeof window.BodyScene !== "undefined" ? window.BodyScene.init(threeCore, data) : null;
    if (!bodyInit && fallback) fallback.style.display = "flex";
    else if (fallback) fallback.style.display = "none";

    if (typeof window.RiskRadar3D !== "undefined") {
      window.RiskRadar3D.init(threeCore.scene);
    }

    var startTime = Date.now() * 0.001;
    window.ThreeCore.animate(function () {
      var t = Date.now() * 0.001 - startTime;
      if (window.BodyScene) window.BodyScene.update(t);
      if (window.RiskRadar3D && window.RiskRadar3D.update) window.RiskRadar3D.update(t);
    });

    inited = true;
  }

  function setMorphProgress(p) {
    var scene = threeCore && threeCore.scene ? threeCore.scene : null;
    if (window.BodyScene && window.BodyScene.setMorphProgress) {
      window.BodyScene.setMorphProgress(p, scene);
    }
    if (window.RiskRadar3D && window.RiskRadar3D.setMorphProgress) {
      window.RiskRadar3D.setMorphProgress(p);
    }
  }

  if (typeof window !== "undefined") {
    window.HologramEngine = { init: init, setMorphProgress: setMorphProgress };
    window.initHologramEngine = init;
  }
})();
