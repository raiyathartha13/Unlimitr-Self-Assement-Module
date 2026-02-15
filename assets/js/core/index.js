/**
 * Core Cognitive Backbone — Bootstrap
 * Loads after AI_Knowledge_Base (optional) and wires engines.
 * UNLIMITR AI Cognitive Backbone v1.0
 */
(function (global) {
  "use strict";

  var KB = null;
  try {
    if (typeof fetch !== "undefined" && typeof Promise !== "undefined") {
      fetch("assets/data/AI_Knowledge_Base.json")
        .then(function (r) { return r.json(); })
        .then(function (json) { KB = json; })
        .catch(function () {});
    }
  } catch (e) {}

  function getKnowledgeBase() {
    return KB;
  }

  if (typeof window !== "undefined") {
    window.CognitiveBackbone = {
      version: "1.0",
      getKB: getKnowledgeBase
    };
  }
})(typeof window !== "undefined" ? window : this);
