/**
 * Bootstrap — Master initializer
 * One entry point. Clean lifecycle.
 * Orchestrates all engines in dependency order.
 */
(function () {
  "use strict";

  var inited = false;

  function initEngines(opts) {
    if (inited) return;
    inited = true;

    var data = opts && opts.data;
    var finalScore = (opts && opts.finalScore != null) ? opts.finalScore : 54;
    var targetScore = (opts && opts.targetScore != null) ? opts.targetScore : 85;

    // Core — ambient, recalibration, gamification
    if (typeof window.AmbientEngine !== "undefined" && window.AmbientEngine.init) {
      window.AmbientEngine.init();
    }
    if (typeof window.AmbientMotion !== "undefined" && window.AmbientMotion.init) {
      window.AmbientMotion.init();
    }
    if (typeof window.RecalibrationCore !== "undefined" && window.RecalibrationCore.start) {
      window.RecalibrationCore.start(data);
    }
    if (typeof window.GamificationEngine !== "undefined" && window.GamificationEngine.init) {
      window.GamificationEngine.init(data, finalScore);
    }

    // Bio — avatar, morph
    if (typeof window.AvatarEngine !== "undefined" && window.AvatarEngine.init) {
      window.AvatarEngine.init(data);
    }
    if (typeof window.MorphEngine !== "undefined" && window.MorphEngine.init) {
      window.MorphEngine.init();
    }

    // Analytics — risk radar, behavior, metabolic
    if (typeof window.RiskRadar !== "undefined" && window.RiskRadar.init) {
      window.RiskRadar.init(data);
    }
    if (typeof window.BehaviorEngine !== "undefined" && window.BehaviorEngine.init) {
      window.BehaviorEngine.init(data);
    }
    if (typeof window.MetabolicSimulation !== "undefined" && window.MetabolicSimulation.init) {
      window.MetabolicSimulation.init(data);
    }

    // Interaction — scroll, voice
    if (typeof window.ScrollIntelligence !== "undefined" && window.ScrollIntelligence.init) {
      window.ScrollIntelligence.init(finalScore, targetScore);
    }
    if (typeof window.VoiceCoach !== "undefined" && window.VoiceCoach.init) {
      window.VoiceCoach.init();
    }

    // Transformation timeline (depends on morph + scroll)
    if (typeof window.initTransformationTimeline === "function" && data) {
      window.initTransformationTimeline(data, finalScore, targetScore);
    }

    // Fat–Fit slider
    if (typeof window.initFatFitSlider === "function") {
      window.initFatFitSlider(finalScore, targetScore);
    }
  }

  if (typeof window !== "undefined") {
    window.Bootstrap = { initEngines: initEngines };
  }
})();
