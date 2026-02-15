/**
 * 3D WebGL body model — Three.js
 * Loads male_body.glb or female_body.glb by gender.
 * Applies morph targets if present, else simulated morph (scale) for 0–100% intensity.
 */

var BodyMorph = (function () {
  var scene, camera, renderer, mesh, mixer, clock;
  var morphIntensity = 0;
  var morphTargetNames = ["waist", "chest", "arms", "hips"];
  var baseScale = 1;
  var containerEl;

  function createFallbackBody() {
    var group = new THREE.Group();
    var geo = new THREE.CapsuleGeometry(0.4, 0.8, 8, 16);
    var mat = new THREE.MeshStandardMaterial({
      color: 0x8b7355,
      roughness: 0.6,
      metalness: 0.1
    });
    var body = new THREE.Mesh(geo, mat);
    body.position.y = 0;
    group.add(body);
    return group;
  }

  function applySimulatedMorph(intensity) {
    if (!mesh) return;
    var scale = 1 - intensity * 0.12;
    mesh.scale.setScalar(scale);
  }

  function applyMorphTargets(intensity) {
    if (!mesh || !mesh.morphTargetInfluences) return;
    for (var i = 0; i < mesh.morphTargetInfluences.length; i++) {
      mesh.morphTargetInfluences[i] = intensity;
    }
  }

  function setMorph(intensity) {
    morphIntensity = Math.max(0, Math.min(1, intensity));
    if (!mesh) return;
    if (mesh.morphTargetInfluences && mesh.morphTargetInfluences.length > 0) {
      applyMorphTargets(morphIntensity);
    } else {
      applySimulatedMorph(morphIntensity);
    }
  }

  function init(containerElement, gender) {
    if (!containerElement || typeof THREE === "undefined") return null;
    containerEl = containerElement;
    var width = containerElement.clientWidth;
    var height = containerElement.clientHeight || 320;
    clock = new THREE.Clock();

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf5f2ef);
    camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0.6, 2.2);
    camera.lookAt(0, 0.3, 0);

    var ambient = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambient);
    var dir = new THREE.DirectionalLight(0xffffff, 0.6);
    dir.position.set(2, 3, 2);
    scene.add(dir);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    containerElement.appendChild(renderer.domElement);

    var modelPath = gender === "female"
      ? "assets/images/stylized_lowpoly_female.glb"
      : "assets/images/character__male_01.glb";
    var loader = typeof THREE.GLTFLoader !== "undefined" ? new THREE.GLTFLoader() : null;

    if (loader) {
      loader.load(
        modelPath,
        function (gltf) {
          var model = gltf.scene;
          model.traverse(function (child) {
            if (child.isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
              if (child.morphTargetInfluences && child.morphTargetInfluences.length > 0) {
                mesh = child;
              } else if (!mesh) {
                mesh = child;
              }
            }
          });
          if (!mesh && model.children.length) mesh = model.children[0];
          if (!mesh) mesh = model;
          mesh = mesh.isMesh ? mesh : model;
          scene.add(model);
          model.scale.setScalar(0.8);
          model.position.y = 0;
          setMorph(morphIntensity);
        },
        undefined,
        function () {
          mesh = createFallbackBody();
          scene.add(mesh);
          setMorph(morphIntensity);
        }
      );
    } else {
      mesh = createFallbackBody();
      scene.add(mesh);
    }

    function animate() {
      if (!renderer || !scene || !camera) return;
      requestAnimationFrame(animate);
      var t = clock.getElapsedTime();
      if (mesh && mesh.rotation) mesh.rotation.y = t * 0.15;
      renderer.render(scene, camera);
    }
    animate();

    return {
      setMorphIntensity: setMorph,
      resize: function () {
        if (!containerEl || !camera || !renderer) return;
        var w = containerEl.clientWidth;
        var h = containerEl.clientHeight || 320;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      },
      destroy: function () {
        if (renderer && renderer.domElement && renderer.domElement.parentNode) {
          renderer.domElement.parentNode.removeChild(renderer.domElement);
        }
        mesh = null;
        scene = null;
        camera = null;
        renderer = null;
        containerEl = null;
      }
    };
  }

  return { init: init };
})();
