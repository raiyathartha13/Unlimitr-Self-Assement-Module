/**
 * Body Scene — Semi-Solid Matte Biotech Body with Glowing Veins
 * AI medical visualization: matte base, vein overlay, risk heat zones
 */
(function () {
  "use strict";

  var bodyMesh = null;
  var pulseNodes = [];
  var particleSystem = null;
  var uniforms = {};
  var burstTriggered = false;
  var userData = {};
  var baseHeat = { abdomen: 0.4, neck: 0.3, lower: 0.3, chest: 0.2, ribs: 0.2 };

  var VERT = [
    "uniform float uTime; uniform float uBreath;",
    "varying vec3 vNormal; varying vec3 vPosition;",
    "void main(){",
    "vNormal=normal; vPosition=position;",
    "vec3 pos=position;",
    "float breath=sin(uTime*1.5)*0.012*uBreath;",
    "pos+=normal*breath;",
    "gl_Position=projectionMatrix*modelViewMatrix*vec4(pos,1.0);",
    "}"
  ].join("");

  var FRAG = [
    "uniform float uTime; uniform float uRisk; uniform float uHeat; uniform float uPulse;",
    "uniform float uHeatAbdomen; uniform float uHeatNeck; uniform float uHeatLower;",
    "uniform float uHeatChest; uniform float uHeatRibs; uniform float uVeinFlowSpeed;",
    "uniform float uAdherence; uniform float uRelapseRisk; uniform float uTotalRisk;",
    "varying vec3 vNormal; varying vec3 vPosition;",
    "float noise(vec2 p){ return fract(sin(dot(p,vec2(12.99,78.23)))*43758.55); }",
    "float noiseFlow(vec3 p,float t){",
    "float n=noise(p.xy*5.0+t*0.5)+noise(p.yz*4.0+t*0.3)*0.5+noise(p.xz*3.0+t*0.4)*0.3;",
    "return fract(n); }",
    "void main(){",
    "vec3 baseColor=vec3(0.82,0.95,0.92);",
    "float yNorm=(vPosition.y+0.6)/1.2; float xNorm=abs(vPosition.x)/0.3;",
    "float abdomenHeat=smoothstep(0.25,0.5,yNorm)*smoothstep(0.8,0.4,yNorm)*uHeatAbdomen;",
    "float neckHeat=smoothstep(0.85,0.95,yNorm)*uHeatNeck;",
    "float lowerHeat=smoothstep(0.0,0.35,yNorm)*uHeatLower;",
    "float chestHeat=smoothstep(0.55,0.75,yNorm)*uHeatChest;",
    "float ribsHeat=smoothstep(0.6,0.9,xNorm)*smoothstep(0.4,0.7,yNorm)*uHeatRibs;",
    "float totalHeat=clamp(abdomenHeat+neckHeat+lowerHeat+chestHeat+ribsHeat+uHeat,0.0,1.0);",
    "vec3 heatColor=mix(baseColor,vec3(1.0,0.55,0.45),totalHeat*0.25);",
    "float flow=noiseFlow(vPosition,uTime*uVeinFlowSpeed);",
    "float pulse=sin(uTime*2.5+vPosition.y*10.0)*0.5+0.5;",
    "float veinStrength=smoothstep(0.35,0.65,flow+pulse*0.12)*uPulse*0.7;",
    "vec3 veinColor=vec3(0.0,0.75,0.6);",
    "if(uTotalRisk>0.7) veinColor=mix(veinColor,vec3(1.0,0.42,0.42),(uTotalRisk-0.7)*0.25);",
    "if(uAdherence>0.6) veinColor=mix(veinColor,vec3(0.12,0.81,0.6),0.2);",
    "float vf=uRelapseRisk>0.6?0.9+sin(uTime*6.0)*0.08:1.0;",
    "vec3 finalColor=heatColor+veinColor*veinStrength*0.28*vf;",
    "float f=pow(1.0-max(dot(normalize(vNormal),vec3(0,0,1)),0.0),2.0);",
    "finalColor+=vec3(0.01,0.04,0.03)*f; gl_FragColor=vec4(finalColor,0.92); }"
  ].join("");

  function createBiotechMaterial(data) {
    if (typeof THREE === "undefined") return null;
    userData = data || {};
    var issues = (userData.healthIssues || "").toLowerCase();
    var stress = (userData.stressLevel || "").toLowerCase();
    var bmi = 0.3;
    if (userData.weight && userData.height) {
      var h = parseFloat(userData.height) / 100;
      bmi = Math.min(1, Math.max(0, (parseFloat(userData.weight) / (h * h) - 18) / 25));
    }
    var stressLevel = stress === "very-high" ? 0.8 : stress === "high" ? 0.6 : stress === "moderate" ? 0.3 : 0.1;
    baseHeat = {
      abdomen: bmi > 0.4 ? 0.6 : 0.2,
      neck: issues.indexOf("thyroid") >= 0 ? 0.5 : 0,
      lower: issues.indexOf("pcos") >= 0 ? 0.5 : 0,
      chest: (issues.indexOf("heart") >= 0 || issues.indexOf("bp") >= 0) ? 0.4 : 0,
      ribs: stressLevel
    };

    uniforms = {
      uTime: { value: 0 },
      uBreath: { value: 1 },
      uRisk: { value: bmi },
      uHeat: { value: 0 },
      uPulse: { value: 0.7 },
      uHeatAbdomen: { value: baseHeat.abdomen },
      uHeatNeck: { value: baseHeat.neck },
      uHeatLower: { value: baseHeat.lower },
      uHeatChest: { value: baseHeat.chest },
      uHeatRibs: { value: baseHeat.ribs },
      uVeinFlowSpeed: { value: 1 + stressLevel * 0.5 },
      uAdherence: { value: 0.7 },
      uRelapseRisk: { value: 0.2 },
      uTotalRisk: { value: 0.4 }
    };

    return new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: VERT,
      fragmentShader: FRAG,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: true
    });
  }

  function createCapsuleBody(data) {
    if (typeof THREE === "undefined") return null;
    var group = new THREE.Group();
    group.position.y = 1;
    var geom = typeof THREE.CapsuleGeometry !== "undefined"
      ? new THREE.CapsuleGeometry(0.28, 0.8, 10, 28)
      : new THREE.CylinderGeometry(0.28, 0.32, 1.2, 28);
    var mat = createBiotechMaterial(data);
    if (!mat) return null;
    bodyMesh = new THREE.Mesh(geom, mat);
    bodyMesh.scale.set(0.9, 1, 0.9);
    group.add(bodyMesh);
    return group;
  }

  var pulseCurve = null;

  function createPulseNodes(scene) {
    pulseCurve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(0.15, 0.6, 0.3),
      new THREE.Vector3(0.25, 1, 0.2),
      new THREE.Vector3(0.1, 1.4, 0.25)
    );
    var pts = pulseCurve.getPoints(12);
    for (var i = 0; i < 3; i++) {
      var geom = new THREE.SphereGeometry(0.025, 8, 8);
      var mat = new THREE.MeshBasicMaterial({ color: 0x00bfa6, transparent: true, opacity: 0.7 });
      var sphere = new THREE.Mesh(geom, mat);
      sphere.position.copy(pts[i * 3]);
      sphere.userData.phase = i / 3;
      pulseNodes.push(sphere);
    }
  }

  function addPulseNodesToBody(bodyGroup) {
    pulseNodes.forEach(function (s) {
      bodyGroup.add(s);
    });
  }

  function createNeuralParticles(scene) {
    var count = Math.min(180, Math.floor(window.innerWidth / 8));
    var positions = new Float32Array(count * 3);
    var rand = function () { return (Math.random() - 0.5) * 2; };
    for (var i = 0; i < count; i++) {
      positions[i * 3] = rand() * 0.8;
      positions[i * 3 + 1] = rand() * 1.4 + 0.3;
      positions[i * 3 + 2] = rand() * 0.4 + 0.2;
    }
    var geom = new THREE.BufferGeometry();
    geom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    var mat = new THREE.PointsMaterial({
      color: 0x00e5ff,
      size: 0.012,
      transparent: true,
      opacity: 0.15,
      sizeAttenuation: true
    });
    particleSystem = new THREE.Points(geom, mat);
    particleSystem.position.y = 1;
    scene.add(particleSystem);
  }

  function init(threeCore, data) {
    if (!threeCore || !threeCore.scene) return null;
    if (typeof window.BioState !== "undefined") window.BioState.fromAssessmentData(data);
    var mesh = createCapsuleBody(data);
    if (!mesh) return null;
    threeCore.scene.add(mesh);

    createPulseNodes(threeCore.scene);
    if (mesh && mesh.add) addPulseNodesToBody(mesh);
    createNeuralParticles(threeCore.scene);

    if (typeof gsap !== "undefined") {
      gsap.to(uniforms.uPulse, {
        value: 1,
        duration: 1.2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });
    }

    if (typeof window.BioState !== "undefined") {
      var s = window.BioState.state;
      uniforms.uAdherence.value = s.adherence || 0.7;
      uniforms.uRelapseRisk.value = s.relapseRisk || 0.2;
      uniforms.uTotalRisk.value = window.BioState.getTotalRisk ? window.BioState.getTotalRisk() : 0.4;
    } else if (typeof window.computeBehaviorPredictions === "function" && data) {
      try {
        var pred = window.computeBehaviorPredictions(data);
        uniforms.uAdherence.value = (pred.adherence || 70) / 100;
        uniforms.uRelapseRisk.value = (pred.relapse || 20) / 100;
      } catch (e) {}
    }

    return mesh;
  }

  function update(t) {
    if (!bodyMesh) return;
    var dt = t || (Date.now() * 0.001);
    var root = bodyMesh.parent || bodyMesh;
    uniforms.uTime.value = dt;
    root.rotation.y = Math.sin(dt * 0.3) * 0.087;
    if (typeof window.BioState !== "undefined") {
      uniforms.uTotalRisk.value = window.BioState.getTotalRisk ? window.BioState.getTotalRisk() : 0.4;
    }
    if (particleSystem && root) particleSystem.position.copy(root.position);
    if (particleSystem && particleSystem.geometry.attributes.position) {
      var pos = particleSystem.geometry.attributes.position.array;
      for (var i = 1; i < pos.length; i += 3) {
        pos[i] += 0.001 + Math.sin(dt + i) * 0.0003;
        if (pos[i] > 1.8) pos[i] = 0.2;
      }
      particleSystem.geometry.attributes.position.needsUpdate = true;
    }
    if (pulseNodes.length && pulseCurve) {
      var pts = pulseCurve.getPoints(24);
      pulseNodes.forEach(function (s, i) {
        var t = ((dt * 0.4 + s.userData.phase) % 1 + 1) % 1;
        var idx = Math.floor(t * (pts.length - 1));
        var nextIdx = Math.min(idx + 1, pts.length - 1);
        var frac = t * (pts.length - 1) - idx;
        s.position.lerpVectors(pts[idx], pts[nextIdx], frac);
      });
    }
  }

  function triggerHologramBurst(scene) {
    if (burstTriggered || typeof THREE === "undefined" || !scene) return;
    burstTriggered = true;
    var geom = new THREE.RingGeometry(0.5, 0.55, 64);
    var mat = new THREE.MeshBasicMaterial({
      color: 0x00bfa6,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide
    });
    var burst = new THREE.Mesh(geom, mat);
    burst.rotation.x = -Math.PI / 2;
    burst.position.set(0, 1, 0);
    scene.add(burst);
    if (typeof gsap !== "undefined") {
      gsap.to(burst.scale, { x: 3, y: 3, duration: 1, ease: "power2.out" });
      gsap.to(mat, { opacity: 0, duration: 1, ease: "power2.in", onComplete: function () {
        scene.remove(burst);
        geom.dispose();
        mat.dispose();
      }});
    }
  }

  function setMorphProgress(p, scene) {
    p = Math.max(0, Math.min(1, p));
    if (p >= 0.99 && !burstTriggered) {
      var sc = scene || (bodyMesh && bodyMesh.parent ? bodyMesh.parent.parent : null);
      if (!sc && typeof window.ThreeCore !== "undefined") sc = window.ThreeCore.scene;
      if (sc) triggerHologramBurst(sc);
    }
    var decay = 1 - p;
    if (uniforms.uHeatAbdomen) uniforms.uHeatAbdomen.value = baseHeat.abdomen * decay;
    if (uniforms.uHeatNeck) uniforms.uHeatNeck.value = baseHeat.neck * decay;
    if (uniforms.uHeatLower) uniforms.uHeatLower.value = baseHeat.lower * decay;
    if (uniforms.uHeatChest) uniforms.uHeatChest.value = baseHeat.chest * decay;
    if (uniforms.uHeatRibs) uniforms.uHeatRibs.value = baseHeat.ribs * decay;
    if (uniforms.uVeinFlowSpeed) uniforms.uVeinFlowSpeed.value = 1.5 - p * 0.5;
    if (typeof window.BioState !== "undefined") window.BioState.setMorphLevel(p);
  }

  if (typeof window !== "undefined") {
    window.BodyScene = {
      init: init,
      update: update,
      setMorphProgress: setMorphProgress,
      get bodyMesh() { return bodyMesh; }
    };
  }
})();
