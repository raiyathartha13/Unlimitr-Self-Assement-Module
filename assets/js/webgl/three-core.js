/**
 * Three Core — WebGL renderer constrained to hologram container
 * Performance: FPS cap 45, devicePixelRatio clamp 1.5, pause when tab inactive
 */
(function () {
  "use strict";

  var TARGET_FPS = 45;
  var FRAME_INTERVAL = 1000 / TARGET_FPS;
  var MAX_DPR = 1.5;
  var scene, camera, renderer;
  var lastFrameTime = 0;
  var animId = null;
  var tabActive = true;
  var container = null;

  function init(containerEl) {
    if (typeof THREE === "undefined") return false;
    container = containerEl || document.getElementById("hologramContainer");
    if (!container) return false;

    var w = container.clientWidth;
    var h = container.clientHeight || 360;
    if (w < 100 || h < 100) return false;

    var dpr = Math.min(MAX_DPR, window.devicePixelRatio || 1);

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 1000);
    camera.position.set(0, 1.2, 3.2);
    camera.lookAt(0, 1, 0);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
    renderer.setSize(w, h);
    renderer.setPixelRatio(dpr);
    renderer.setClearColor(0xf4f8fb, 1);
    if (renderer.outputColorSpace !== undefined) renderer.outputColorSpace = "srgb";
    else if (renderer.outputEncoding !== undefined) renderer.outputEncoding = THREE.sRGBEncoding;
    container.appendChild(renderer.domElement);
    renderer.domElement.style.display = "block";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";

    var light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(2, 4, 3);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0xffffff, 0.85));

    document.addEventListener("visibilitychange", function () {
      tabActive = !document.hidden;
    });
    window.addEventListener("resize", onResize);

    return { scene: scene, camera: camera, renderer: renderer };
  }

  function onResize() {
    if (!container || !renderer || !camera) return;
    var w = container.clientWidth;
    var h = container.clientHeight || 360;
    if (w < 10 || h < 10) return;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }

  function animate(renderFn) {
    if (!tabActive || !renderer) return;
    animId = requestAnimationFrame(function () { animate(renderFn); });
    var now = performance.now();
    if (now - lastFrameTime >= FRAME_INTERVAL) {
      lastFrameTime = now;
      if (typeof renderFn === "function") renderFn();
      renderer.render(scene, camera);
    }
  }

  function dispose() {
    if (animId) cancelAnimationFrame(animId);
    animId = null;
    window.removeEventListener("resize", onResize);
    if (renderer && container && renderer.domElement.parentNode === container) {
      container.removeChild(renderer.domElement);
    }
    renderer = null;
    scene = null;
    camera = null;
  }

  if (typeof window !== "undefined") {
    window.ThreeCore = {
      init: init,
      animate: animate,
      dispose: dispose,
      get scene() { return scene; },
      get camera() { return camera; },
      get renderer() { return renderer; }
    };
  }
})();
