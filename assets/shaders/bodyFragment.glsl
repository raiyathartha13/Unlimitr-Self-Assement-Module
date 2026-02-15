uniform float uTime;
uniform float uRisk;
uniform float uHeat;
uniform float uPulse;
uniform float uHeatAbdomen;
uniform float uHeatNeck;
uniform float uHeatLower;
uniform float uHeatChest;
uniform float uHeatRibs;
uniform float uVeinFlowSpeed;
uniform float uAdherence;
uniform float uRelapseRisk;
uniform float uTotalRisk;

varying vec3 vNormal;
varying vec3 vPosition;

float noise(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

float noiseFlow(vec3 p, float t) {
  float n = noise(p.xy * 5.0 + t * 0.5);
  n += noise(p.yz * 4.0 + t * 0.3) * 0.5;
  n += noise(p.xz * 3.0 + t * 0.4) * 0.3;
  return fract(n);
}

void main() {
  vec3 baseColor = vec3(0.05, 0.48, 0.45);

  float yNorm = (vPosition.y + 0.6) / 1.2;
  float xNorm = abs(vPosition.x) / 0.3;
  float abdomenHeat = smoothstep(0.25, 0.5, yNorm) * smoothstep(0.8, 0.4, yNorm) * uHeatAbdomen;
  float neckHeat = smoothstep(0.85, 0.95, yNorm) * uHeatNeck;
  float lowerHeat = smoothstep(0.0, 0.35, yNorm) * uHeatLower;
  float chestHeat = smoothstep(0.55, 0.75, yNorm) * uHeatChest;
  float ribsHeat = smoothstep(0.6, 0.9, xNorm) * smoothstep(0.4, 0.7, yNorm) * uHeatRibs;

  float totalHeat = clamp(abdomenHeat + neckHeat + lowerHeat + chestHeat + ribsHeat + uHeat, 0.0, 1.0);
  vec3 heatColor = mix(baseColor, vec3(0.95, 0.25, 0.2), totalHeat * 0.35);

  // Organic neural flow — Perlin-like noise
  float flow = noiseFlow(vPosition, uTime * uVeinFlowSpeed);
  float pulse = sin(uTime * 3.0 + vPosition.y * 10.0) * 0.5 + 0.5;
  float veinStrength = smoothstep(0.35, 0.65, flow + pulse * 0.15) * uPulse;

  // Risk-reactive vein color
  vec3 veinLow = vec3(0.0, 0.6, 0.5);
  vec3 veinMid = vec3(0.0, 1.0, 0.8);
  vec3 veinHigh = vec3(0.4, 0.9, 0.6);
  vec3 veinColor = mix(veinLow, veinMid, veinStrength);
  if (uTotalRisk > 0.7) veinColor = mix(veinMid, vec3(1.0, 0.4, 0.35), (uTotalRisk - 0.7) * 0.3);

  if (uAdherence > 0.6) veinColor = mix(veinColor, vec3(0.2, 1.0, 0.7), 0.3);
  float veinFlicker = uRelapseRisk > 0.6 ? 0.85 + sin(uTime * 8.0) * 0.15 : 1.0;

  vec3 finalColor = heatColor + veinColor * veinStrength * 0.32 * veinFlicker;

  float fresnel = pow(1.0 - max(dot(normalize(vNormal), vec3(0.0, 0.0, 1.0)), 0.0), 2.5);
  finalColor += vec3(0.02, 0.08, 0.07) * fresnel;

  gl_FragColor = vec4(finalColor, 0.95);
}
