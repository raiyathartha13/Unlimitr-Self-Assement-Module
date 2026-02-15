/**
 * Risk Radar 3D — Floating torso ring around waist
 * Base torus, 6 vertical axis beams (height = risk), risk polygon, slow rotation
 */
(function () {
  "use strict";

  var radarGroup = null;
  var ringMesh = null;
  var beams = [];
  var polygonMesh = null;
  var haloMesh = null;
  var baseRadius = 1.2;
  var ringThickness = 0.02;

  function getRiskValues() {
    if (typeof window.BioState !== "undefined" && window.BioState.state) {
      var s = window.BioState.state;
      return [
        s.bmiRisk || 0.4,
        s.hormoneRisk || 0.3,
        s.insulinRisk || 0.25,
        s.recoveryRisk || 0.35,
        s.cardioRisk || 0.25,
        s.inflammationRisk || 0.2
      ];
    }
    return [0.4, 0.35, 0.3, 0.35, 0.25, 0.2];
  }

  function createRing() {
    var geom = new THREE.TorusGeometry(baseRadius, ringThickness * 0.8, 16, 100);
    var mat = new THREE.MeshBasicMaterial({
      color: 0x00bfa6,
      transparent: true,
      opacity: 0.5
    });
    var ring = new THREE.Mesh(geom, mat);
    ring.rotation.x = Math.PI / 2;
    return ring;
  }

  function createBeam(angle, height) {
    var h = Math.max(0.05, height * 0.4);
    var geom = new THREE.BoxGeometry(0.012, h, 0.012);
    var mat = new THREE.MeshBasicMaterial({
      color: 0x00bfa6,
      transparent: true,
      opacity: 0.4
    });
    var beam = new THREE.Mesh(geom, mat);
    beam.rotation.z = -angle;
    beam.position.y = h / 2;
    beam.userData.baseHeight = h;
    return beam;
  }

  function createBeams() {
    var risks = getRiskValues();
    var list = [];
    for (var i = 0; i < 6; i++) {
      var angle = (i / 6) * Math.PI * 2;
      var beam = createBeam(angle, risks[i]);
      beam.position.x = Math.cos(angle) * baseRadius;
      beam.position.z = Math.sin(angle) * baseRadius;
      list.push(beam);
    }
    return list;
  }

  function createRiskPolygon() {
    var risks = getRiskValues();
    var shape = new THREE.Shape();
    var first = true;
    for (var i = 0; i < 6; i++) {
      var angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
      var r = 0.15 + Math.max(0.05, risks[i]) * baseRadius * 0.6;
      var x = Math.cos(angle) * r;
      var z = Math.sin(angle) * r;
      if (first) {
        shape.moveTo(x, z);
        first = false;
      } else {
        shape.lineTo(x, z);
      }
    }
    shape.closePath();
    var geom = new THREE.ShapeGeometry(shape);
    var mat = new THREE.MeshBasicMaterial({
      color: 0x00bfa6,
      transparent: true,
      opacity: 0.12,
      side: THREE.DoubleSide
    });
    var mesh = new THREE.Mesh(geom, mat);
    mesh.rotation.x = Math.PI / 2;
    mesh.position.y = 0.01;
    return mesh;
  }

  function createHalo() {
    var geom = new THREE.TorusGeometry(baseRadius * 1.05, 0.008, 8, 100);
    var mat = new THREE.MeshBasicMaterial({
      color: 0x00bfa6,
      transparent: true,
      opacity: 0.3
    });
    var halo = new THREE.Mesh(geom, mat);
    halo.rotation.x = Math.PI / 2;
    halo.position.y = -0.02;
    return halo;
  }

  function init(scene) {
    if (typeof THREE === "undefined" || !scene) return null;
    radarGroup = new THREE.Group();
    radarGroup.position.set(0, 0.85, 0);

    ringMesh = createRing();
    radarGroup.add(ringMesh);

    beams = createBeams();
    beams.forEach(function (b) {
      radarGroup.add(b);
    });

    polygonMesh = createRiskPolygon();
    radarGroup.add(polygonMesh);

    haloMesh = createHalo();
    radarGroup.add(haloMesh);

    scene.add(radarGroup);

    if (typeof gsap !== "undefined") {
      radarGroup.scale.set(0, 0, 0);
      gsap.to(radarGroup.scale, {
        x: 1,
        y: 1,
        z: 1,
        duration: 1.2,
        ease: "back.out(1.7)",
        delay: 0.3
      });
    }

    return radarGroup;
  }

  function update(t) {
    if (!radarGroup) return;
    var dt = t || Date.now() * 0.001;
    radarGroup.rotation.y = (dt / 60) * Math.PI * 2;

    var risks = getRiskValues();
    beams.forEach(function (beam, i) {
      var h = Math.max(0.05, risks[i] * 0.4);
      beam.scale.y = h / (beam.userData.baseHeight || 0.2);
      beam.position.y = h / 2;
    });
  }

  function setMorphProgress(p) {
    if (!radarGroup) return;
    p = Math.max(0, Math.min(1, p));
    var scale = 1 - p * 0.15;
    radarGroup.scale.setScalar(scale);
  }

  if (typeof window !== "undefined") {
    window.RiskRadar3D = {
      init: init,
      update: update,
      setMorphProgress: setMorphProgress,
      get group() { return radarGroup; }
    };
  }
})();
